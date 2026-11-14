import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DialoguePlayView } from "./DialoguePlay";
import { useProgress } from "../store/useProgress";

const d = {
  id: "t", title: "T", emoji: "💬",
  lines: [
    { speaker: "A", de: "Hallo Anna", fr: "Salut Anna" },
    { speaker: "B", de: "Guten Tag", fr: "Bonjour" },
  ],
};

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("DialoguePlayView", () => {
  it("reads lines, practises, then finishes", () => {
    const add = vi.spyOn(useProgress.getState(), "addAnswer");
    useProgress.setState({ addAnswer: add });
    render(<MemoryRouter><DialoguePlayView dialogue={d} /></MemoryRouter>);
    expect(screen.getByText("Hallo Anna")).toBeTruthy();
    fireEvent.click(screen.getByText("Suivant"));
    expect(screen.getByText("Guten Tag")).toBeTruthy();
    fireEvent.click(screen.getByText("Suivant"));
    // practice step 1: WordOrder (Vérifier button present)
    expect(screen.getByText("Vérifier")).toBeTruthy();
    for (const w of "Hallo Anna".split(" ")) fireEvent.click(screen.getByRole("button", { name: w }));
    fireEvent.click(screen.getByText("Vérifier"));
    expect(add).toHaveBeenCalledWith(true, expect.any(String));
    // step 2: TypeInput
    const input = screen.getByLabelText("Réponse en allemand");
    fireEvent.change(input, { target: { value: "Guten Tag" } });
    vi.useFakeTimers();
    fireEvent.keyDown(input, { key: "Enter" });
    act(() => { vi.advanceTimersByTime(700); });
    vi.useRealTimers();
    expect(screen.getByText(/Terminé/)).toBeTruthy();
    expect(add).toHaveBeenCalledTimes(2);
  });
});
