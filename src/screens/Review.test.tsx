import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Force flashcard steps so the test can answer them uniformly.
vi.mock("../engine/session", async (orig) => {
  const mod = await orig<typeof import("../engine/session")>();
  return {
    ...mod,
    buildReviewQueue: (items: { id: string }[]) => items.map((it) => ({ itemId: it.id, type: "flashcard" })),
  };
});

import { Review } from "./Review";
import { useProgress } from "../store/useProgress";
import { course } from "../content/course";

beforeEach(() => {
  vi.useFakeTimers();
  useProgress.getState().reset();
});
afterEach(() => vi.useRealTimers());

describe("Review", () => {
  it("reaches Summary even though answered items leave the due set mid-session", () => {
    const [a, b] = course.lessons[0].items;
    // Seen on an earlier day and answered wrong -> due today.
    useProgress.getState().recordItem(a.id, false, "2000-01-01");
    useProgress.getState().recordItem(b.id, false, "2000-01-01");
    expect(useProgress.getState().dueItemIds([a.id, b.id], "2999-01-01")).toHaveLength(2);

    const { getByText, queryByText } = render(<MemoryRouter><Review /></MemoryRouter>);
    for (let n = 0; n < 2; n++) {
      fireEvent.click(getByText(/Je savais/));
      act(() => { vi.advanceTimersByTime(500); });
    }
    expect(queryByText(/Rien à réviser/)).toBeNull();
    expect(getByText(/Terminé/)).toBeTruthy();
    expect(getByText(/2 \/ 2 corrects/)).toBeTruthy();
  });

  it("shows the empty message when nothing is due at start", () => {
    const { getByText } = render(<MemoryRouter><Review /></MemoryRouter>);
    expect(getByText(/Rien à réviser/)).toBeTruthy();
  });
});
