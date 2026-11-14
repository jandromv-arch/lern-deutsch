import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
vi.mock("../engine/speech", () => ({ speak: vi.fn(), isSpeechSupported: () => true }));
import { speak } from "../engine/speech";
import { AudioButton } from "./AudioButton";

describe("AudioButton", () => {
  it("speaks on click", () => {
    const { getByRole } = render(<AudioButton text="Hallo" />);
    fireEvent.click(getByRole("button"));
    expect(speak).toHaveBeenCalledWith("Hallo");
  });
});
