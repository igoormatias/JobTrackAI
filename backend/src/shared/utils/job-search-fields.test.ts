import { describe, expect, it } from "vitest";

import {
  extractSectionsFromPlainText,
  inferTechnologiesFromText,
} from "./job-search-fields.js";

describe("inferTechnologiesFromText", () => {
  it("extracts React from Portuguese title and description", () => {
    const techs = inferTechnologiesFromText(
      "Desenvolvedor React - Sênior. Experiência com Next.js e TypeScript.",
    );
    expect(techs).toContain("React");
    expect(techs).toContain("Next.js");
    expect(techs).toContain("TypeScript");
  });

  it("avoids false positives for short tokens like Go", () => {
    const techs = inferTechnologiesFromText("Buscamos alguém com boa comunicação");
    expect(techs).not.toContain("Go");
  });
});

describe("extractSectionsFromPlainText", () => {
  it("extracts requirements from plain text headers", () => {
    const sections = extractSectionsFromPlainText(`
Sobre a vaga
Somos a Framework!

Requisitos
- React
- TypeScript
- Experiência com APIs

Benefícios
- VR
- Plano de saúde
`);
    expect(sections.requirements).toEqual(
      expect.arrayContaining(["React", "TypeScript", "Experiência com APIs"]),
    );
    expect(sections.benefits).toEqual(expect.arrayContaining(["VR", "Plano de saúde"]));
  });
});
