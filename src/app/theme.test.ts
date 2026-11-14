import { afterEach, describe, expect, it, vi } from "vitest";
import { applyTheme, resolveTheme } from "./theme";

function mockMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (q: string) => ({ matches, media: q }));
}

describe("theme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove("dark");
  });
  it("system follows matchMedia", () => {
    mockMedia(true);
    expect(resolveTheme("system")).toBe("dark");
    mockMedia(false);
    expect(resolveTheme("system")).toBe("light");
  });
  it("explicit prefs win", () => {
    mockMedia(true);
    expect(resolveTheme("light")).toBe("light");
    mockMedia(false);
    expect(resolveTheme("dark")).toBe("dark");
  });
  it("applyTheme toggles the dark class", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
