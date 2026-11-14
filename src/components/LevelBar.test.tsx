import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LevelBar } from "./LevelBar";

describe("LevelBar", () => {
  it("shows the level label for given xp", () => {
    const { getByText } = render(<LevelBar xp={0} />);
    expect(getByText(/A1\.1/)).toBeTruthy();
  });
});
