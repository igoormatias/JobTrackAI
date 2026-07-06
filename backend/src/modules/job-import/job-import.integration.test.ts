import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { createIntegrationTestApp } from "../../test-utils/create-integration-test-app.js";
import { requireAuth } from "../../middlewares/auth-middleware.js";
import { tokenService } from "../auth/services/token.service.js";
import { createJobImportRoutes } from "./infrastructure/http/routes/job-import.routes.js";

describe("Job import module integration", () => {
  const userId = "user_job_import_test";
  const email = "job-import@test.com";

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const app = createIntegrationTestApp((expressApp) => {
    expressApp.use("/jobs/import", createJobImportRoutes());
  });

  const authCookie = () => {
    const token = tokenService.signAccessToken({ userId, email });
    return `jt_access=${token}`;
  };

  it("POST /jobs/import/preview returns 422 for invalid url", async () => {
    const response = await request(app)
      .post("/jobs/import/preview")
      .set("Cookie", authCookie())
      .send({ url: "not-a-valid-url" });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("POST /jobs/import/preview returns 422 for unsupported url", async () => {
    const response = await request(app)
      .post("/jobs/import/preview")
      .set("Cookie", authCookie())
      .send({ url: "https://example.com/jobs/123" });

    expect(response.status).toBe(422);
    expect(response.body.message).toMatch(/unsupported job url/i);
  });

  it("POST /jobs/import/preview returns preview for gupy career page url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 11299164,
          name: "Desenvolvedor(a) Front-end Sênior | React & Next.js",
          careerPageName: "Afya",
          city: "São Paulo",
          state: "SP",
          workplaceType: "remote",
          publishedDate: "2025-06-01T00:00:00.000Z",
        }),
      }),
    );

    const response = await request(app)
      .post("/jobs/import/preview")
      .set("Cookie", authCookie())
      .send({ url: "https://afya.gupy.io/jobs/11299164" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      title: "Desenvolvedor(a) Front-end Sênior | React & Next.js",
      company: "Afya",
      source: "gupy",
      sourceUrl: "https://afya.gupy.io/jobs/11299164",
      externalId: "11299164",
    });
  });

  it("POST /jobs/import/preview returns preview for gupy portal url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 12345,
          name: "Desenvolvedor Full Stack",
          careerPageName: "Empresa Teste",
          city: "São Paulo",
          state: "SP",
          workplaceType: "remote",
          publishedDate: "2025-06-01T00:00:00.000Z",
          jobUrl: "https://portal.gupy.io/job/12345",
        }),
      }),
    );

    const response = await request(app)
      .post("/jobs/import/preview")
      .set("Cookie", authCookie())
      .send({ url: "https://portal.gupy.io/job/12345" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      title: "Desenvolvedor Full Stack",
      company: "Empresa Teste",
      source: "gupy",
      provider: "gupy",
      sourceUrl: "https://portal.gupy.io/job/12345",
      externalId: "12345",
      modality: "remote",
      location: "São Paulo, SP",
    });
  });

  it("POST /jobs/import/preview requires auth", async () => {
    const response = await request(app)
      .post("/jobs/import/preview")
      .send({ url: "https://portal.gupy.io/job/12345" });

    expect(response.status).toBe(401);
  });

  it("POST /jobs/import/preview falls back to career page when gupy api returns 404", async () => {
    const memedHtml = `<html><body><div>Candidaturas encerradas</div><script type="application/ld+json">{"@context":"http://schema.org","@type":"JobPosting","datePosted":"2026-03-10","description":"&lt;p&gt;A Memed é healthtech.&lt;/p&gt;","hiringOrganization":{"@type":"Organization","name":"Memed"},"jobLocation":{"@type":"Place","address":{"@type":"PostalAddress","streetAddress":"Brasil","addressCountry":"Brasil"},"additionalProperty":{"@type":"PropertyValue","value":"TELECOMMUTE"}},"title":"Frontend Engineer Sênior – React","validThrough":"2026-07-27"}</script></body></html>`;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.includes("employability-portal.gupy.io")) {
          return { ok: false, status: 404, json: async () => ({}) };
        }
        if (url.includes("memed.gupy.io")) {
          return { ok: true, status: 200, text: async () => memedHtml };
        }
        throw new Error(`Unexpected fetch: ${url}`);
      }),
    );

    const response = await request(app)
      .post("/jobs/import/preview")
      .set("Cookie", authCookie())
      .send({ url: "https://memed.gupy.io/jobs/10970184" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      title: "Frontend Engineer Sênior – React",
      company: "Memed",
      sourceUrl: "https://memed.gupy.io/jobs/10970184",
      externalId: "10970184",
      modality: "remote",
    });
    expect(response.body.data.warnings).toHaveLength(1);
  });
});
