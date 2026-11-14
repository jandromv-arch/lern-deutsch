# Lern Deutsch — "More Babbel" Features Design Spec

**Date:** 2026-11-14
**Status:** Approved (user said "dale")
**Builds on:** the MVP (branch merged to main, deployed to GitHub Pages as a PWA).

## Overview
Add four Babbel-like features to the existing React/Vite PWA (French speakers
learning German): audio pronunciation + sound effects, a daily goal with a
progress ring, a "Leçon du jour" one-tap daily session, and dark mode. All
client-side, no backend. Reuse existing engines/store/components.

## Defaults (confirmed)
- Daily goal: **15** answers/day.
- Leçon du jour: all due SRS items first, then new words from the next
  not-started lesson, capped at **20 items** total.
- Dark mode: follow system `prefers-color-scheme`, with a manual toggle override
  (persisted).

## Feature 1 — Audio / pronunciation
- `src/engine/speech.ts` (pure-ish wrapper): `speak(text: string, lang = "de-DE")`
  using `window.speechSynthesis`; picks a `de` voice if available; no-op when
  unsupported (SSR/old browsers). `isSpeechSupported(): boolean`.
- `src/engine/sfx.ts`: `playCorrect()` / `playWrong()` via WebAudio
  (`AudioContext`) — short synthesized tones, no asset files (offline-safe).
  Lazily create the AudioContext on first use (iOS gesture requirement).
  `setSfxEnabled(on)` gate read from the store.
- UI: a 🔊 button in **Flashcard** (speaks `de` + example) and in **Qcm**
  (speaks the German prompt). No autoplay. SessionRunner plays `playCorrect`/
  `playWrong` on answer when sound is enabled.
- A sound toggle 🔊/🔇 in the app header, persisted (`soundOn`, default true).
- Tests mock `speechSynthesis` and `AudioContext`; assert speak/no-op and the
  enable gate.

## Feature 2 — Daily goal + ring
- Store additions: `dailyGoal: number` (default 15); `daily: { day: string;
  count: number }`. In `addAnswer`, if `daily.day !== today` reset to
  `{ day: today, count: 0 }`, then increment count. Expose `answeredToday(today)`.
- `src/components/DailyRing.tsx`: an SVG ring showing `count / dailyGoal`; when
  `count >= dailyGoal` shows a filled ring + "Objectif atteint 🎉".
- Home header shows the ring next to level/streak.
- Tests: counter resets across days, increments per answer; ring renders
  fraction and the reached state.

## Feature 3 — Leçon du jour
- `src/engine/daily.ts`: `buildDailyPlan(course, progress, today, opts)` returns
  `{ reviewIds: string[]; newIds: string[]; steps: Step[]; itemsById }`:
  - review = started items that are due (via `isDue`), as review-type steps.
  - new = up to `opts.newCount` (default 10) items from the first lesson with
    un-started items, as lesson-type steps (flashcard→qcm→fill→order), trimmed
    so total items ≤ `opts.maxItems` (default 20).
  - If nothing due and nothing new, returns empty (screen shows a done message).
- `src/screens/Daily.tsx` at route `/daily`: snapshots the plan once on mount
  (like Review), runs SessionRunner with the full course items as distractor
  `pool`, shows Summary on done; empty-state message otherwise.
- Home: a prominent "Leçon du jour" button linking to `/daily`, with a small
  subtitle (e.g. "X à réviser · Y nouveaux").
- Tests: plan composes due + new correctly, respects caps, empty when nothing.

## Feature 4 — Dark mode
- Tailwind `darkMode: 'class'`. `src/app/theme.ts`: resolve initial theme from
  persisted pref (`themePref: "system" | "light" | "dark"`, default system) and
  `prefers-color-scheme`; apply/remove `dark` class on `<html>`.
- A 🌙/☀️ toggle in the header cycles/sets the pref (persisted in the store or a
  dedicated key). Re-evaluate on system change when pref = system.
- Add `dark:` variants to the shells and surfaces: body/background, Layout, nav,
  cards (Home/Progress), exercise surfaces, Summary. Brand coral (accent) and
  der/die/das gender colors stay; ensure contrast in dark.
- Note: static HTML previews always render light; verify dark in the real app.

## Architecture / modules
```
src/engine/speech.ts     # TTS wrapper (pure-ish)
src/engine/sfx.ts        # WebAudio cues
src/engine/daily.ts      # buildDailyPlan (pure)
src/store/useProgress.ts # + dailyGoal, daily{day,count}, soundOn, themePref, actions
src/app/theme.ts         # theme resolve/apply
src/components/DailyRing.tsx
src/components/AudioButton.tsx (optional shared)
src/screens/Daily.tsx    # /daily
+ edits: Flashcard, Qcm, SessionRunner, Home, Layout/header, App routes, tailwind.config
```
Engines stay pure/isolated; store remains the only state mutator; persistence
stays localStorage (bump persist version to 2, migrate additively — missing
fields default, never crash).

## Error handling
- speech/sfx unsupported → silent no-op, never throw.
- AudioContext blocked until gesture → created lazily on first play.
- Persisted state from v1 (no new fields) → merged with defaults (dailyGoal 15,
  daily zeroed, soundOn true, themePref "system").
- Daily plan empty → friendly message, no crash.

## Testing
- Vitest units: store (daily counter reset/increment, settings), daily engine,
  speech/sfx (mocked), DailyRing render.
- Component: AudioButton calls speak; SessionRunner plays sfx when enabled.
- Reuse existing session/exercise tests.

## Out of scope (later)
Listening-only exercises, downloadable real-voice audio, configurable goal UI,
push reminders, B1 content.
