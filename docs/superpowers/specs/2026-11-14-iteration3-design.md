# Lern Deutsch — Iteration 3 Design Spec

**Date:** 2026-11-14
**Status:** Approved ("dale")
**Builds on:** MVP + "More Babbel" features (audio, daily ring, Leçon du jour, dark mode), deployed as a PWA on GitHub Pages.

## Overview
Three features: a typing exercise (active recall), conversational dialogues, and
a daily reminder. All client-side, no backend. Reuse existing engines/store/
SessionRunner where possible.

## Feature 1 — "Écris le mot" (typing exercise)
- New `ExerciseType` value `"type"`.
- `src/engine/exercises.ts`:
  - `normalizeGerman(s: string): string` — lowercase, trim, collapse spaces, and
    apply equivalences ä↔ae, ö↔oe, ü↔ue, ß↔ss (normalize both to the ae/oe/ue/ss
    form), strip surrounding punctuation. Used to compare answers leniently.
  - `interface Type { promptFr: string; answer: string }`
  - `buildType(item: VocabItem): Type` — promptFr = item.fr, answer = item.de
    (full form incl. article for nouns).
  - `checkTyped(input: string, answer: string): boolean` =
    `normalizeGerman(input) === normalizeGerman(answer)`.
- `src/components/TypeInput.tsx` — `{ item, pool?, onResult }`: shows the French
  prompt (+ an AudioButton for the German), a text input + "Vérifier" button;
  on submit calls `onResult(checkTyped(value, item.de))`; on wrong, reveals the
  correct `item.de`. Autocapitalize off, autocorrect off, lang="de".
- Wiring: add `"type"` to the **review rotation** `REVIEW_TYPES` in
  `src/engine/session.ts` (so it appears in Révision and the review portion of
  Leçon du jour). Do NOT add it to the first-time lesson queue (keeps new-word
  lessons at 4 steps). SessionRunner renders TypeInput for `type` steps.
- Tests: normalizeGerman equivalences; checkTyped lenient match; buildType;
  TypeInput reports correct/incorrect + reveals answer; session review rotation
  includes "type".

## Feature 2 — Dialogues (conversational)
- `src/content/dialogueTypes.ts`:
  ```ts
  interface DialogueLine { speaker: string; de: string; fr: string }
  interface Dialogue { id: string; title: string; emoji: string; lines: DialogueLine[] }
  ```
- `src/content/dialogues.ts` — ~5 authored dialogues: Au café ☕, Se présenter 👋,
  Demander son chemin 🧭, À l'hôtel 🏨, Faire les courses 🛒. ~6–10 lines each,
  correct German + French, natural.
- A validator `validateDialogues(ds): string[]` (unique ids, non-empty de/fr,
  ≥2 lines) run in tests.
- `src/screens/Dialogue.tsx` at `/dialogues` (list) and `/dialogues/:id` (play):
  - List: cards of the dialogues.
  - Play: step through each line (speaker label, German + AudioButton, French);
    "Suivant" advances; after the last line, a short practice: 2–3 exercises
    built from the dialogue's lines — reuse WordOrder (reorder a German line from
    its French) and TypeInput (type a key line) via a small queue. End with a
    simple "Terminé" summary and a link back.
  - No SRS/XP coupling required for dialogues in this iteration (optional: award
    a flat XP via `addAnswer` on each practice answer — keep it simple: yes, call
    addAnswer so practice counts toward the daily goal, but dialogues are not in
    the Leitner item set).
- Home: a "Dialogues 💬" card/section linking to `/dialogues`.
- Tests: validator; Dialogue play advances lines and runs the practice; list
  renders.

## Feature 3 — Daily reminder
- **In-app nudge:** on Home, if `answeredToday(today()) === 0`, show a gentle
  banner: "N'oublie pas ta leçon du jour 🔥 pour garder ta série !" linking to
  `/daily`. Hidden once they've practiced today.
- **Calendar (.ics) reminder:** `src/engine/ics.ts`:
  `buildDailyReminderICS(hour: number, minute: number): string` → a VCALENDAR
  with one daily-recurring VEVENT (RRULE:FREQ=DAILY) + a VALARM, summary
  "Lern Deutsch — leçon du jour", a stable UID. A "Rappel quotidien" control in
  Settings/Home header lets the user pick a time (default 19:00) and download the
  `.ics` (Blob + anchor download), which they add to Apple Calendar for reliable
  daily reminders. Persist the chosen time (`reminderTime` in the store,
  default "19:00").
- Rationale (documented, not built): real push notifications with the PWA closed
  need a push server + VAPID (out of the no-backend scope); the .ics route is the
  reliable, server-less path that works on iPhone.
- Tests: ics builder output contains RRULE:FREQ=DAILY, VALARM, the chosen time
  (as DTSTART/trigger), and a UID; nudge shows only when answeredToday === 0.

## Architecture / modules
```
src/engine/exercises.ts   # + normalizeGerman, buildType, checkTyped
src/engine/session.ts     # + "type" in REVIEW_TYPES
src/engine/ics.ts         # buildDailyReminderICS (pure)
src/content/dialogueTypes.ts, dialogues.ts, dialogues validator
src/components/TypeInput.tsx, ReminderButton.tsx, Nudge (in Home)
src/screens/Dialogue.tsx  # list + play + practice
+ edits: SessionRunner (render TypeInput), App routes, Home (card + nudge), store (reminderTime)
```
Engines stay pure. Store persist stays v2 (add reminderTime via the same additive
migrate defaults). TypeScript strict. French copy. TDD for logic units.

## Error handling
- Empty/whitespace typed answer → treated as incorrect, never crash.
- `.ics` download uses a Blob + object URL, revoked after click; if download is
  blocked, no crash.
- Dialogue with <2 lines fails the validator test (content gate), not the UI.
- speech/audio unsupported → AudioButton already no-ops.

## Out of scope (later)
Real web-push reminders (needs backend), listening-only exercises, speech
recognition grading, more dialogues/B1, multi-language.
