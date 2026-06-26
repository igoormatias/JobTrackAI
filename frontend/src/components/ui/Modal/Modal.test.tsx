import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Modal, ModalContent, ModalTitle, ModalTrigger } from "./index";

describe("Modal", () => {
  it("should open and close via trigger", async () => {
    const user = userEvent.setup();

    render(
      <Modal>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalTitle>Test Modal</ModalTitle>
        </ModalContent>
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });
});
