import type { ThemePref } from "../store/useProgress";

export type { ThemePref };

export function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref === "system") {
    return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

export function applyTheme(pref: ThemePref): void {
  document.documentElement.classList.toggle("dark", resolveTheme(pref) === "dark");
}
