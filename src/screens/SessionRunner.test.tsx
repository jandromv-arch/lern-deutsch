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
    expect(onDone).toHaveBeenCalledWith({ correct: 1, total: 1 });
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
});
