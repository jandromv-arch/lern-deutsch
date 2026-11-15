import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
vi.mock("../engine/audio", () => ({ playAudio: vi.fn(), hasClip: () => true }));
vi.mock("../engine/speech", () => ({ speak: vi.fn(), isSpeechSupported: () => true }));
import { playAudio } from "../engine/audio";
import { ListenExercise } from "./ListenExercise";
import type { VocabItem } from "../content/types";

const item: VocabItem = { id: "x", de: "Hallo", fr: "Bonjour", gender: null };
const pool: VocabItem[] = [item, { id: "a", de: "Danke", fr: "Merci" }, { id: "b", de: "Ja", fr: "Oui" }, { id: "c", de: "Nein", fr: "Non" }];

describe("ListenExercise", () => {
  beforeEach(() => vi.mocked(playAudio).mockClear());

  it("play button triggers playAudio(item.de)", () => {
    const { getByRole } = render(<ListenExercise item={item} pool={pool} onResult={vi.fn()} />);
    vi.mocked(playAudio).mockClear();
    fireEvent.click(getByRole("button", { name: "Écouter" }));
    expect(playAudio).toHaveBeenCalledWith("Hallo");
  });
  it("slow button plays slow", () => {
    const { getByRole } = render(<ListenExercise item={item} pool={pool} onResult={vi.fn()} />);
    fireEvent.click(getByRole("button", { name: "Écouter lentement" }));
    expect(playAudio).toHaveBeenCalledWith("Hallo", { slow: true });
  });
  it("correct option -> onResult(true), once", () => {
    const onResult = vi.fn();
    const { getByText } = render(<ListenExercise item={item} pool={pool} onResult={onResult} />);
    fireEvent.click(getByText("Bonjour"));
    fireEvent.click(getByText("Merci"));
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(true);
  });
  it("wrong option -> onResult(false)", () => {
    const onResult = vi.fn();
    const { getByText } = render(<ListenExercise item={item} pool={pool} onResult={onResult} />);
    fireEvent.click(getByText("Merci"));
    expect(onResult).toHaveBeenCalledWith(false);
  });
});
