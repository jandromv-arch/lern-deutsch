# "More Babbel" Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add audio pronunciation + sound effects, a daily goal ring, a "Leçon du jour" daily session, and dark mode to the existing Lern Deutsch PWA.

**Architecture:** New pure engines (`speech`, `sfx`, `daily`) + additive store state (settings, daily counter), wired into existing screens/components. Persistence stays localStorage; bump persist version to 2 with additive defaults.

**Tech Stack:** React 18, Vite, TS, Tailwind (darkMode: 'class'), Zustand (+persist), Vitest + Testing Library. Web APIs: speechSynthesis, AudioContext.

## Global Constraints
- UI copy French; target language German. No backend.
- Engines under `src/engine/` stay pure-ish: speech/sfx isolate the Web API calls and no-op when unsupported (never throw).
- Store is the only state mutator. KEEP the persist storage key name `"lern-deutsch-v1"` (renaming it would wipe existing users' data); only bump the persist `version` field from 1 to 2 and add a `migrate` that fills new fields with defaults (dailyGoal 15, daily {day:"",count:0}, soundOn true, themePref "system"). Never crash on old state.
- TDD: failing test first for every logic unit. Commit per task.
- Reuse existing: SessionRunner (per-step key, 500ms delay, startSession, addAnswer/recordItem), buildReviewQueue/buildLessonQueue, isDue/isMastered, Qcm/Flashcard/FillBlank/WordOrder.
- Build must stay deployable to GitHub Pages (base "/lern-deutsch/").

---

### Task 1: Store — settings + daily counter (persist v2)

**Files:** Modify `src/store/useProgress.ts`; Test `src/store/useProgress.settings.test.ts`

**Interfaces — Produces (added to the store state/actions):**
- state: `dailyGoal: number` (15), `daily: { day: string; count: number }` ({ "", 0 }), `soundOn: boolean` (true), `themePref: "system" | "light" | "dark"` ("system").
- `addAnswer` ALSO updates daily: if `daily.day !== today` set `{ day: today, count: 1 }` else `{ ...daily, count: count + 1 }`.
- actions: `answeredToday(today: string): number` (0 if daily.day !== today else daily.count), `setSoundOn(on: boolean)`, `setThemePref(p)`, `setDailyGoal(n)`.
- persist: `version: 2`, `migrate(persisted, from)` returns state merged over defaults.

- [ ] **Step 1: Failing test** — `src/store/useProgress.settings.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useProgress } from "./useProgress";

beforeEach(() => useProgress.getState().reset());

describe("daily counter", () => {
  it("counts answers today and resets across days", () => {
    const g = useProgress.getState();
    g.addAnswer(true, "2026-01-01");
    g.addAnswer(false, "2026-01-01");
    expect(useProgress.getState().answeredToday("2026-01-01")).toBe(2);
    useProgress.getState().addAnswer(true, "2026-01-02");
    expect(useProgress.getState().answeredToday("2026-01-02")).toBe(1);
    expect(useProgress.getState().answeredToday("2026-01-01")).toBe(0);
  });
});
describe("settings", () => {
  it("defaults and setters", () => {
    expect(useProgress.getState().dailyGoal).toBe(15);
    expect(useProgress.getState().soundOn).toBe(true);
    expect(useProgress.getState().themePref).toBe("system");
    useProgress.getState().setSoundOn(false);
    expect(useProgress.getState().soundOn).toBe(false);
    useProgress.getState().setThemePref("dark");
    expect(useProgress.getState().themePref).toBe("dark");
  });
});
```
- [ ] **Step 2: Run → FAIL** (`npm run test -- useProgress.settings`).
- [ ] **Step 3: Implement** — add fields to `initial`, extend `addAnswer` to bump `daily`, add the four actions, bump persist to `version: 2` with:
```ts
migrate: (persisted: any, _from: number) => ({ ...initialSettings, ...(persisted ?? {}) }),
```
where `initialSettings` holds dailyGoal/daily/soundOn/themePref defaults. Ensure `reset()` also restores these. Keep existing items/xp/streak/badges behavior unchanged.
- [ ] **Step 4: Run → PASS**; also run `npm run test` (all green).
- [ ] **Step 5: Commit** `feat: store settings (sound, theme, daily goal) + daily counter`.

---

### Task 2: Engines — speech (TTS) + sfx (WebAudio)

**Files:** Create `src/engine/speech.ts`, `src/engine/sfx.ts`, `src/engine/speech.test.ts`, `src/engine/sfx.test.ts`

**Interfaces — Produces:**
- speech: `isSpeechSupported(): boolean`; `speak(text: string, lang?: string): void` (default "de-DE"; no-op if unsupported; cancels any in-flight utterance first).
- sfx: `playCorrect(): void`, `playWrong(): void` (lazy AudioContext; no-op if unsupported/blocked, never throws).

- [ ] **Step 1: Failing test (speech)** — `src/engine/speech.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { speak, isSpeechSupported } from "./speech";

describe("speech", () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  it("no-ops when unsupported", () => {
    // @ts-expect-error
    delete (globalThis as any).speechSynthesis;
    expect(isSpeechSupported()).toBe(false);
    expect(() => speak("Hallo")).not.toThrow();
  });
  it("calls speechSynthesis.speak with a de utterance when supported", () => {
    const speakFn = vi.fn();
    (globalThis as any).speechSynthesis = { speak: speakFn, cancel: vi.fn(), getVoices: () => [] };
    (globalThis as any).SpeechSynthesisUtterance = class { lang = ""; text = ""; constructor(t: string){ this.text = t; } };
    speak("Hallo");
    expect(speakFn).toHaveBeenCalledTimes(1);
    const utt = speakFn.mock.calls[0][0];
    expect(utt.text).toBe("Hallo");
    expect(utt.lang).toBe("de-DE");
  });
});
```
- [ ] **Step 2: Run → FAIL**.
- [ ] **Step 3: Implement speech.ts**:
```ts
export function isSpeechSupported(): boolean {
  return typeof globalThis !== "undefined" &&
    "speechSynthesis" in globalThis && typeof (globalThis as any).SpeechSynthesisUtterance === "function";
}
export function speak(text: string, lang = "de-DE"): void {
  if (!isSpeechSupported() || !text) return;
  try {
    const synth = (globalThis as any).speechSynthesis;
    synth.cancel();
    const u = new (globalThis as any).SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = (synth.getVoices?.() ?? []).find((x: any) => x.lang?.startsWith("de"));
    if (v) u.voice = v;
    synth.speak(u);
  } catch { /* no-op */ }
}
```
- [ ] **Step 4: Failing test (sfx)** — `src/engine/sfx.test.ts`: mock a minimal AudioContext and assert playCorrect creates an oscillator and does not throw; and that it no-ops without AudioContext.
```ts
import { describe, it, expect, vi } from "vitest";
import { playCorrect, playWrong } from "./sfx";

function mockAudio() {
  const osc = { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { value: 0 }, type: "sine" };
  const gain = { connect: vi.fn(), gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } };
  const ctx = { createOscillator: () => osc, createGain: () => gain, destination: {}, currentTime: 0, state: "running", resume: vi.fn() };
  (globalThis as any).AudioContext = vi.fn(() => ctx);
  return { osc, gain };
}
describe("sfx", () => {
  it("plays a tone for correct without throwing", () => {
    const { osc } = mockAudio();
    expect(() => playCorrect()).not.toThrow();
    expect(osc.start).toHaveBeenCalled();
  });
  it("no-ops when AudioContext missing", () => {
    // @ts-expect-error
    delete (globalThis as any).AudioContext;
    expect(() => playWrong()).not.toThrow();
  });
});
```
- [ ] **Step 5: Run → FAIL**.
- [ ] **Step 6: Implement sfx.ts** — a module-level lazy `getCtx()` returns a singleton `AudioContext` (try `window.AudioContext || window.webkitAudioContext`), resumes if suspended; `tone(freq, dur)` creates oscillator+gain with a short exponential decay; `playCorrect()` = rising two-tone (e.g. 660→880), `playWrong()` = low tone (~160Hz). Wrap everything in try/catch → no-op. No store import here (the enable gate is checked by callers).
- [ ] **Step 7: Run both → PASS**; `npm run test` green.
- [ ] **Step 8: Commit** `feat: speech (TTS) and sfx (WebAudio) engines`.

---

### Task 3: Audio in exercises + sound toggle

**Files:** Create `src/components/AudioButton.tsx`, `src/components/AudioButton.test.tsx`; Modify `src/components/Flashcard.tsx`, `src/components/Qcm.tsx`, `src/screens/SessionRunner.tsx`

**Interfaces:** `<AudioButton text={string} className?/>` renders a 🔊 button that calls `speak(text)` on click.

- [ ] **Step 1: Failing test** — `AudioButton.test.tsx`: mock `../engine/speech`, render `<AudioButton text="Hallo" />`, click, assert `speak` called with "Hallo".
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
vi.mock("../engine/speech", () => ({ speak: vi.fn(), isSpeechSupported: () => true }));
import { speak } from "../engine/speech";
import { AudioButton } from "./AudioButton";
it("speaks on click", () => {
  const { getByRole } = render(<AudioButton text="Hallo" />);
  fireEvent.click(getByRole("button"));
  expect(speak).toHaveBeenCalledWith("Hallo");
});
```
- [ ] **Step 2: Run → FAIL**.
- [ ] **Step 3: Implement AudioButton.tsx**:
```tsx
import { speak, isSpeechSupported } from "../engine/speech";
export function AudioButton({ text, className = "" }: { text: string; className?: string }) {
  if (!isSpeechSupported()) return null;
  return (
    <button type="button" aria-label="Écouter" onClick={() => speak(text)}
      className={`text-2xl ${className}`}>🔊</button>
  );
}
```
- [ ] **Step 4: Wire into Flashcard** — add `<AudioButton text={item.example ? `${item.de}. ${item.example.de}` : item.de} />` near the German word. Keep layout clean.
- [ ] **Step 5: Wire into Qcm** — add `<AudioButton text={q.prompt} />` beside the prompt.
- [ ] **Step 6: Wire sfx into SessionRunner** — in the answer handler, after computing `correct`, if `useProgress.getState().soundOn` then `correct ? playCorrect() : playWrong()`. Import from `../engine/sfx`. Keep the 500ms delay / vibration logic.
- [ ] **Step 7: Sound toggle** — this is placed in the header in Task 4; here just ensure SessionRunner reads `soundOn`. (No extra UI in this task.)
- [ ] **Step 8: Run `npm run test -- AudioButton` → PASS**; full `npm run test` + `npm run build` green.
- [ ] **Step 9: Commit** `feat: audio pronunciation buttons + answer sound effects`.

---

### Task 4: Daily ring + header controls (sound + theme toggles)

**Files:** Create `src/components/DailyRing.tsx`, `src/components/DailyRing.test.tsx`, `src/components/HeaderControls.tsx`; Modify `src/screens/Home.tsx`

**Interfaces:** `<DailyRing count goal />` renders an SVG ring with `count/goal` and, when `count>=goal`, an "atteint" state. `<HeaderControls/>` renders the 🔊/🔇 and 🌙/☀️ toggles reading/writing the store.

- [ ] **Step 1: Failing test** — `DailyRing.test.tsx`: render `<DailyRing count={3} goal={15} />` and assert it shows "3/15"; render count=15 goal=15 and assert the reached text "🎉" (or "atteint") is present.
- [ ] **Step 2: Run → FAIL**.
- [ ] **Step 3: Implement DailyRing.tsx** — an inline SVG circle with `stroke-dasharray` based on `Math.min(count/goal,1)`; center label `count/goal`; when reached show 🎉. Use accent stroke; neutral track; works in dark (use currentColor or theme-aware classes).
- [ ] **Step 4: Implement HeaderControls.tsx** — two buttons: sound toggle (`soundOn` → `setSoundOn(!soundOn)`, icon 🔊/🔇) and theme toggle (cycles themePref light↔dark, calling `setThemePref` and applying via theme util from Task 6 — for now call `setThemePref`; applying is wired in Task 6). Accessible labels.
- [ ] **Step 5: Wire into Home header** — show `<DailyRing count={answeredToday(today())} goal={dailyGoal} />` and `<HeaderControls/>` alongside the existing level bar / streak.
- [ ] **Step 6: Run `npm run test -- DailyRing` → PASS**; full test + build green.
- [ ] **Step 7: Commit** `feat: daily goal ring + header sound/theme controls`.

---

### Task 5: Leçon du jour (daily engine + screen + Home button)

**Files:** Create `src/engine/daily.ts`, `src/engine/daily.test.ts`, `src/screens/Daily.tsx`; Modify `src/app/App.tsx` (route `/daily`), `src/screens/Home.tsx` (button)

**Interfaces — Produces:**
- `interface DailyPlan { reviewIds: string[]; newIds: string[]; steps: Step[]; itemsById: Record<string, VocabItem> }`
- `function buildDailyPlan(course: Course, progress: { items: Record<string, ItemProgress> }, today: string, opts?: { newCount?: number; maxItems?: number }): DailyPlan`
  - review = started item ids (`Object.keys(progress.items)`) that are due (`isDue`); mapped to review-type steps via `buildReviewQueue` over those items.
  - new = first lesson containing items not in `progress.items`; take up to `newCount` (10) new items; add lesson-type steps via `buildLessonQueue`.
  - Trim so total distinct items ≤ `maxItems` (20): include all review first, then new until the cap.
  - `itemsById` covers all included items.

- [ ] **Step 1: Failing test** — `daily.test.ts`: with a tiny course + a progress where 1 item is due and others unseen, assert `reviewIds` contains the due id, `newIds` are unseen items from the first lesson (≤ newCount), total items ≤ maxItems, and `steps`/`itemsById` are consistent (every step.itemId has an entry). Also: empty progress + newCount 0 → only new none → empty; all mastered/none due + no new → empty steps.
- [ ] **Step 2: Run → FAIL**.
- [ ] **Step 3: Implement daily.ts** using existing `isDue`, `buildReviewQueue`, `buildLessonQueue`. Keep it pure.
- [ ] **Step 4: Implement Daily.tsx** — mirror Review.tsx: snapshot `buildDailyPlan(course, useProgress.getState(), today())` ONCE via `useState` initializer; if no steps show "Rien pour aujourd'hui 🎉 Reviens demain !"; else run `<SessionRunner steps itemsById pool={allCourseItems} onDone=.../>`; on done show `<Summary .../>` with the day's itemIds. French copy.
- [ ] **Step 5: Route** — add `<Route path="/daily" element={<Daily/>} />` in App.tsx.
- [ ] **Step 6: Home button** — a prominent "Leçon du jour" link to `/daily` with subtitle `${reviewCount} à réviser · ${newCount} nouveaux` (compute a lightweight preview via `buildDailyPlan` or counts). Place above the lesson grid.
- [ ] **Step 7: Run `npm run test -- daily` → PASS**; full test + build green.
- [ ] **Step 8: Commit** `feat: Leçon du jour (daily plan engine + screen + home entry)`.

---

### Task 6: Dark mode

**Files:** Create `src/app/theme.ts`; Modify `tailwind.config.js`, `src/main.tsx` (apply theme on boot), `src/components/HeaderControls.tsx` (apply on toggle), and add `dark:` variants to `src/index.css`, `src/app/Layout.tsx`, `src/screens/{Home,Progress,Summary,Daily}.tsx`, exercise components as needed.

**Interfaces — Produces:**
- `type ThemePref = "system" | "light" | "dark"`
- `function resolveTheme(pref: ThemePref): "light" | "dark"` (system → matchMedia)
- `function applyTheme(pref: ThemePref): void` (toggles `document.documentElement.classList` `dark`)

- [ ] **Step 1: Failing test** — `src/app/theme.test.ts`: mock `matchMedia` to return dark; `resolveTheme("system")` → "dark"; `resolveTheme("light")` → "light". (applyTheme is DOM; test resolveTheme only.)
- [ ] **Step 2: Run → FAIL**.
- [ ] **Step 3: Implement theme.ts**:
```ts
export type ThemePref = "system" | "light" | "dark";
export function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref === "system")
    return (globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  return pref;
}
export function applyTheme(pref: ThemePref): void {
  const dark = resolveTheme(pref) === "dark";
  document.documentElement.classList.toggle("dark", dark);
}
```
- [ ] **Step 4: Tailwind** — set `darkMode: 'class'` in `tailwind.config.js`.
- [ ] **Step 5: Apply on boot** — in `main.tsx`, before render, `applyTheme(useProgress.getState().themePref)`. In HeaderControls, after `setThemePref(next)`, call `applyTheme(next)`. Add a matchMedia change listener (in main or an effect) that re-applies when pref === "system".
- [ ] **Step 6: Dark surfaces** — add `dark:` variants: `index.css` body `dark:bg-neutral-900 dark:text-neutral-100` (replace the `@apply bg-amber-50`); Layout container/nav `dark:bg-neutral-900 dark:bg-neutral-800 dark:border-neutral-700`; cards `dark:bg-neutral-800`; muted text `dark:text-neutral-400`; Summary/Daily surfaces. Keep accent coral and der/die/das colors (they read fine on dark). Verify no white-on-white or black-on-black remains on Home, lesson loop, Review, Daily, Progress.
- [ ] **Step 7: Run `npm run test -- theme` → PASS**; full test + build green.
- [ ] **Step 8: Commit** `feat: dark mode (system + toggle) with dark surfaces`.

---

### Task 7: Build, manual verify, redeploy to Pages

**Files:** none (or README touch).

- [ ] **Step 1: Full test + build** — `npm run test` (all pass), `npm run build` (succeeds).
- [ ] **Step 2: Manual verify (controller does this in the browser pane)** — audio button speaks (may be silent in headless, verify no error + speechSynthesis called), sfx on answer, daily ring increments and reaches goal, Leçon du jour composes a session, dark mode toggles and all screens are legible.
- [ ] **Step 3: Merge build branch → main, push to jandromv-arch, let the Pages workflow deploy; verify the live URL and that the PWA still installs.**
- [ ] **Step 4: Commit** any final touches.

---

## Notes for implementer
- Don't import the store inside `src/engine/*` (keep pure); callers read `soundOn` and pass values in.
- iOS: speech/audio need a user gesture — all triggers are taps, so fine; never autoplay on mount.
- Persist migration must be additive and crash-free for existing v1 users (their items/xp survive).
- framer-motion already present; dark mode must not break the feedback flash.
