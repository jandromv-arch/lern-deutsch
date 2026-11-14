import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DailyRing } from "./DailyRing";

describe("DailyRing", () => {
  it("affiche la progression", () => {
    render(<DailyRing count={3} goal={15} />);
    expect(screen.getByText("3/15")).toBeTruthy();
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Objectif du jour : 3 sur 15");
  });
  it("affiche l'état atteint", () => {
    render(<DailyRing count={15} goal={15} />);
    expect(screen.getByText(/🎉/)).toBeTruthy();
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/atteint/);
  });
});
