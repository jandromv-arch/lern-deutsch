# Lern Deutsch — Design Spec (MVP)

**Date:** 2026-11-14
**Author:** Alejandro + Claude
**Status:** Approved for planning

## 1. Overview

A Babbel-style web app for **French speakers learning German**, focused on
**vocabulary acquisition** with a points/progression system to keep practice
engaging. Mobile-first, responsive, no backend. All UI text in French; the
target language is German.

**Goal of MVP:** ~300 words/phrases across 15 themed lessons, four exercise
types, a Leitner spaced-repetition engine, and gamification (XP, levels,
streak, per-word mastery, badges). Fully functional on first run; deployable to
GitHub Pages.

### Explicitly out of scope (YAGNI)
Login, payments, backend/server, audio/TTS, speech recognition, multiple
language pairs, cloud sync. Data model is designed so these can be added later
without a rewrite.

## 2. Tech Stack

- **React + Vite + TypeScript**
- **Tailwind CSS** for styling (mobile-first)
- **Zustand** for state (lightweight store, persisted)
- **React Router** for navigation
- **framer-motion** for feedback animations
- Persistence: **localStorage** (via Zustand `persist` middleware)
- Deploy: static build → **GitHub Pages** (repo under `jandromv-arch`, public)

## 3. Content Model

Content lives as typed JSON/TS in the repo (`src/content/`).

```ts
type Gender = "der" | "die" | "das" | null; // null for phrases/verbs

interface VocabItem {
  id: string;            // stable, e.g. "cafe-01"
  de: string;            // German word/phrase
  fr: string;            // French translation
  gender?: Gender;       // for nouns; drives color coding
  example?: {            // example sentence
    de: string;
    fr: string;
  };
}

interface Lesson {
  id: string;            // "cafe"
  title: string;         // "Au café"
  emoji: string;         // "☕"
  items: VocabItem[];    // ~20 per lesson
}

interface Course {
  id: string;            // "de-fr-a1"
  from: "fr";
  to: "de";
  lessons: Lesson[];     // ~15
}
```

**Initial content (authored as part of implementation):** 15 lessons, ~20 items
each (~300 total), A1→A2:
Salutations · Au café · Les nombres · La famille · La maison · La nourriture ·
Les vêtements · Le temps / la météo · Les directions · Le travail · Le voyage ·
Le corps / la santé · Les loisirs · Les verbes courants · Phrases utiles.

Each noun carries its gender; nouns are shown with a color cue
(**der = blue, die = pink, das = green**) to build article memory.

## 4. Learning Engine

### Exercise types
Each item is drilled through, in sequence within a lesson session:
1. **Flashcard** — show DE + FR + example; self-rate "Je savais / Je ne savais pas".
2. **QCM (multiple choice)** — "Que signifie X ?" with 4 options (distractors drawn from same lesson).
3. **Texte à trous (fill the blank)** — complete a German sentence from the example, choosing/typing the missing word.
4. **Reconstituer (word order)** — rebuild the German sentence by ordering word tiles, prompted by the French.

Distractors and blanks are generated at runtime from lesson data (no need to
author them by hand).

### Spaced repetition (Leitner, 5 boxes)
- Every item has a `box` (1–5) and `dueDate` per learner.
- Correct answer → box +1 (longer interval). Wrong → back to box 1.
- Intervals (box → days): 1→0 (same session), 2→1, 3→3, 4→7, 5→16.
- An item is **mastered** when it reaches box 5.
- **Révision** screen surfaces only items whose `dueDate <= today`, across all
  started lessons.

## 5. Gamification / Progression

- **XP:** +10 per correct answer; streak bonus (+2 per consecutive correct in a
  session, capped). XP is cumulative and never decreases.
- **Levels:** derived from total XP (A1.1 → A2.x), shown as a filling bar with
  the current level label.
- **Daily streak:** consecutive days with ≥1 completed session, shown as 🔥 count.
  Resets if a day is missed.
- **Per-word mastery:** Leitner box drives a star indicator; progress panel
  shows `mastered / total` (e.g. 120/300).
- **Badges** (simple, milestone-based): "100 mots", "7 jours", "Unité terminée",
  "500 XP". Stored as unlocked flags.

## 6. Screens & Navigation

Bottom tab bar (mobile) / side nav (desktop): **Accueil · Révision · Progrès**.

- **Accueil** — list/map of the 15 lessons with completion rings; header shows
  level bar, XP, streak 🔥, and "items due today" count. Tap a lesson → session.
- **Leçon (session)** — runs the exercise loop for the lesson's items; top
  progress bar, immediate ✓/✗ feedback with color + animation + optional haptic
  vibration. Ends in a summary.
- **Résumé** — XP earned, correct/total, words advanced/mastered, CTA to next
  lesson or révision.
- **Révision** — SRS session over due items only; same exercise loop.
- **Progrès** — mastered words count, level, streak, badges grid, per-lesson
  mastery breakdown.

## 7. Architecture & Modules

Designed as small, independently testable units.

```
src/
  content/            # course data (TS) + validation
    course.ts
    lessons/*.ts
  engine/
    leitner.ts        # pure: box/dueDate transitions, interval table
    xp.ts             # pure: xp→level, streak-bonus math
    session.ts        # pure: build an exercise queue from items
    exercises.ts      # pure: generate QCM distractors / blanks / tiles
  store/
    useProgress.ts    # Zustand store (persisted): per-item state, xp, streak, badges
  components/         # Flashcard, Qcm, FillBlank, WordOrder, ProgressBar, ...
  screens/            # Home, Lesson, Summary, Review, Progress
  app/                # router, layout (mobile shell), theme
```

**Key boundaries**
- `engine/*` is **pure** (no React, no storage) → unit-testable in isolation.
- `store/useProgress` is the only place that mutates learner state; screens read
  via selectors.
- `content/*` is data + a validator that runs in tests (ids unique, genders
  valid, examples present).

## 8. Error Handling & Edge Cases

- **Corrupt/missing localStorage** → store falls back to fresh initial state
  (versioned schema key; mismatched version is reset, not crashed).
- **Empty due queue** in Révision → friendly "Rien à réviser aujourd'hui 🎉"
  with CTA to a new lesson.
- **Mid-lesson exit** → session progress is not partially committed; SRS/XP
  update only on answered items (answered items persist immediately).
- **Content validation** runs in tests so a malformed lesson fails CI, not the
  user's screen.

## 9. Testing

- **Unit (Vitest):** `leitner`, `xp`, `session`, `exercises` (pure functions) +
  content validator.
- **Component (Vitest + Testing Library):** each exercise renders, accepts a
  correct/incorrect answer, and reports the right result.
- **Smoke:** store persistence round-trip (save → reload → state intact).

## 10. Design / Visual Direction

- **Mobile-first**, app-like: centered container max ~430px, large tap targets,
  bottom nav; responsive up to desktop.
- Clean and warm: light cream/white background, **coral/orange** accent for
  actions, **green ✓ / red ✗** feedback. Dark mode deferred.
- German gender color coding (der/die/das) reused everywhere a noun appears.
- Large readable type; smooth framer-motion feedback on answers; filling XP bar;
  streak 🔥 in the header; optional haptic vibration on answer.

## 11. Future (post-MVP, non-blocking)
Audio/TTS (browser `speechSynthesis`), speech-recognition pronunciation, dark
mode, more lessons/levels (B1), extra language pairs, optional cloud sync/login.
