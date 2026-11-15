import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
vi.mock("../engine/audio", () => ({ playAudio: vi.fn(), hasClip: () => true }));
vi.mock("../engine/speech", () => ({ speak: vi.fn(), isSpeechSupported: () => true }));
import { playAudio } from "../engine/audio";
import { AudioButton } from "./AudioButton";

describe("AudioButton", () => {
  it("plays normal on click", () => {
    const { getByRole } = render(<AudioButton text="Hallo" />);
    fireEvent.click(getByRole("button", { name: "Écouter" }));
    expect(playAudio).toHaveBeenCalledWith("Hallo");
  });
  it("plays slow on turtle click", () => {
    const { getByRole } = render(<AudioButton text="Hallo" />);
    fireEvent.click(getByRole("button", { name: "Écouter lentement" }));
    expect(playAudio).toHaveBeenCalledWith("Hallo", { slow: true });
  });
});
