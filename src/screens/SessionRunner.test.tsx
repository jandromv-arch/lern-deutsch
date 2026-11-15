import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { SessionRunner } from "./SessionRunner";
import { useProgress } from "../store/useProgress";
import type { VocabItem } from "../content/types";

const items: Record<string, VocabItem> = { a: { id: "a", de: "Hallo", fr: "Bonjour", gender: null } };

beforeEach(() => {
  vi.useFakeTimers();
  useProgress.getState().reset();
});
afterEach(() => vi.useRealTimers());

describe("SessionRunner", () => {
  it("records an answer and finishes a one-step session after the feedback delay", () => {
    const onDone = vi.fn();
    const { getByText } = render(
      <SessionRunner steps={[{ itemId: "a", type: "flashcard" }]} itemsById={items} pool={[items.a]} onDone={onDone} />
    );
    fireEvent.click(getByText(/Je savais/));
    expect(useProgress.getState().xp).toBe(10);
    expect(onDone).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(500); });
    expect(onDone).toHaveBeenCalledWith({ correct: 1, total: 1, xpGained: 10 });
  });

  it("does not advance after unmount", () => {
    const onDone = vi.fn();
    const { getByText, unmount } = render(
      <SessionRunner steps={[{ itemId: "a", type: "flashcard" }]} itemsById={items} pool={[items.a]} onDone={onDone} />
    );
    fireEvent.click(getByText(/Je savais/));
    unmount();
    act(() => { vi.advanceTimersByTime(600); });
    expect(onDone).not.toHaveBeenCalled();
  });

  it("one full correct lesson pass does not master items (SRS once per item)", () => {
    const two: VocabItem[] = [
      { id: "a", de: "Hallo", fr: "Bonjour", gender: null },
      { id: "b", de: "Danke", fr: "Merci", gender: null },
    ];
    const byId = Object.fromEntries(two.map((it) => [it.id, it]));
    // Controlled queue (flashcard + qcm per item) so the test drives the UI;
    // SRS must record each item ONCE regardless of how many practice steps it has.
    const steps = [
      { itemId: "a", type: "flashcard" as const }, { itemId: "a", type: "qcm" as const },
      { itemId: "b", type: "flashcard" as const }, { itemId: "b", type: "qcm" as const },
    ];
    const onDone = vi.fn();
    const { getByText } = render(
      <SessionRunner steps={steps} itemsById={byId} pool={two} onDone={onDone} />
    );
    for (const step of steps) {
      const it = byId[step.itemId];
      if (step.type === "flashcard") fireEvent.click(getByText(/Je savais/));
      else fireEvent.click(getByText(it.fr)); // qcm: click the correct French option
      act(() => { vi.advanceTimersByTime(500); });
    }
    const st = useProgress.getState();
    expect(st.items["a"].box).toBeLessThanOrEqual(2);
    expect(st.items["b"].box).toBeLessThanOrEqual(2);
    expect(st.masteredCount()).toBe(0);
    expect(onDone).toHaveBeenCalledTimes(1);
    const stats = onDone.mock.calls[0][0];
    expect(stats.correct).toBe(stats.total);
    expect(stats.total).toBe(4);
    expect(stats.xpGained).toBe(st.xp);
  });
});
