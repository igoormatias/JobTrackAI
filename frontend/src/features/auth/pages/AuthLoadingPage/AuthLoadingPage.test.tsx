import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthLoadingPage } from "./AuthLoadingPage";

describe("AuthLoadingPage", () => {
  it("renders logo, spinner and loading message", () => {
    render(<AuthLoadingPage messages={["Entrando...", "Preparando seu ambiente..."]} />);

    expect(screen.getByLabelText("Carregando autenticação")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "JobTrack AI" })).toBeInTheDocument();
    expect(screen.getByText("Entrando...")).toBeInTheDocument();
  });
});
