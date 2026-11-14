# Lern Deutsch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, offline web app for French speakers to learn German vocabulary, with four exercise types, Leitner spaced repetition, and a points/progression system.

**Architecture:** React + Vite SPA. Pure, framework-free engine modules (`leitner`, `xp`, `session`, `exercises`) hold all logic and are unit-tested in isolation. A single persisted Zustand store owns learner state. Screens read via selectors and render exercise components. Content is typed TS data validated in tests. No backend; localStorage only.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Zustand (+persist), React Router, framer-motion, Vitest + @testing-library/react.

## Global Constraints

- UI copy language: **French**. Target learning language: **German**. (Never swap.)
- No backend, no network calls, no auth, no payments, no TTS/speech in MVP.
- Persistence is **localStorage only**, via a **versioned** schema key `lern-deutsch-v1`; version mismatch resets to fresh state, never crashes.
- Gender color coding everywhere a noun appears: **der = blue, die = pink, das = green**.
- Engine modules under `src/engine/` are **pure**: no React, no storage, no DOM.
- All exercise distractors/blanks/tiles are **generated at runtime** from lesson data; never authored by hand.
- TDD: every logic task writes a failing test first. Commit after each task.
- Build must produce a static bundle deployable to GitHub Pages (`base` configurable in `vite.config.ts`).

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `vitest.config.ts`, `src/test/setup.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a runnable Vite dev server and a passing Vitest runner.

- [ ] **Step 1: Scaffold with Vite**

```bash
cd /Users/jandro/lern-deutsch
npm create vite@latest . -- --template react-ts
# If prompted about non-empty dir, choose "Ignore files and continue"
```

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom zustand framer-motion
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind** — set `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        der: "#2563eb", // blue
        die: "#db2777", // pink
        das: "#16a34a", // green
        accent: "#f97316", // coral/orange
        good: "#16a34a",
        bad: "#dc2626",
      },
      maxWidth: { app: "430px" },
    },
  },
  plugins: [],
};
```

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { @apply bg-amber-50 text-neutral-900; }
```

- [ ] **Step 4: Configure Vitest** — create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

Set GitHub Pages base in `vite.config.ts` (add `base: "./"` to the config object so assets resolve on Pages).

- [ ] **Step 5: Add a trivial smoke test** — create `src/test/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 6: Run test & build to verify toolchain**

Run: `npm run test`
Expected: PASS (1 test). Then `npm run build` → Expected: build succeeds, `dist/` created.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS + Tailwind + Vitest"
```

---

### Task 2: Content types & validator

**Files:**
- Create: `src/content/types.ts`, `src/content/validate.ts`, `src/content/validate.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Gender = "der" | "die" | "das" | null`
  - `interface VocabItem { id: string; de: string; fr: string; gender?: Gender; example?: { de: string; fr: string } }`
  - `interface Lesson { id: string; title: string; emoji: string; items: VocabItem[] }`
  - `interface Course { id: string; from: "fr"; to: "de"; lessons: Lesson[] }`
  - `function validateCourse(course: Course): string[]` — returns array of error strings (empty = valid).

- [ ] **Step 1: Write types** — create `src/content/types.ts`:

```ts
export type Gender = "der" | "die" | "das" | null;

export interface VocabItem {
  id: string;
  de: string;
  fr: string;
  gender?: Gender;
  example?: { de: string; fr: string };
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  items: VocabItem[];
}

export interface Course {
  id: string;
  from: "fr";
  to: "de";
  lessons: Lesson[];
}
```

- [ ] **Step 2: Write failing test** — create `src/content/validate.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validateCourse } from "./validate";
import type { Course } from "./types";

const base: Course = {
  id: "de-fr-a1",
  from: "fr",
  to: "de",
  lessons: [
    { id: "l1", title: "T", emoji: "☕", items: [
      { id: "a1", de: "Hallo", fr: "Bonjour", gender: null },
    ] },
  ],
};

describe("validateCourse", () => {
  it("accepts a valid course", () => {
    expect(validateCourse(base)).toEqual([]);
  });
  it("flags duplicate item ids", () => {
    const c: Course = { ...base, lessons: [{ ...base.lessons[0], items: [
      { id: "dup", de: "A", fr: "a" }, { id: "dup", de: "B", fr: "b" },
    ] }] };
    expect(validateCourse(c).some((e) => e.includes("dup"))).toBe(true);
  });
  it("flags missing fr or de", () => {
    const c: Course = { ...base, lessons: [{ ...base.lessons[0], items: [
      { id: "x", de: "", fr: "a" },
    ] }] };
    expect(validateCourse(c).length).toBeGreaterThan(0);
  });
  it("flags invalid gender", () => {
    const c = { ...base, lessons: [{ ...base.lessons[0], items: [
      { id: "x", de: "A", fr: "a", gender: "le" as unknown as null },
    ] }] } as Course;
    expect(validateCourse(c).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- validate`
Expected: FAIL ("validateCourse is not a function" / module not found).

- [ ] **Step 4: Implement validator** — create `src/content/validate.ts`:

```ts
import type { Course } from "./types";

const VALID_GENDERS = new Set(["der", "die", "das", null]);

export function validateCourse(course: Course): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const lesson of course.lessons) {
    if (!lesson.items.length) errors.push(`lesson ${lesson.id} has no items`);
    for (const item of lesson.items) {
      if (seen.has(item.id)) errors.push(`duplicate item id: ${item.id}`);
      seen.add(item.id);
      if (!item.de.trim()) errors.push(`item ${item.id} missing de`);
      if (!item.fr.trim()) errors.push(`item ${item.id} missing fr`);
      if (item.gender !== undefined && !VALID_GENDERS.has(item.gender))
        errors.push(`item ${item.id} invalid gender: ${item.gender}`);
    }
  }
  return errors;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- validate`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat: content types and course validator"
```

---

### Task 3: Leitner spaced-repetition engine

**Files:**
- Create: `src/engine/leitner.ts`, `src/engine/leitner.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface ItemProgress { box: number; dueDate: string }` (dueDate = ISO `YYYY-MM-DD`)
  - `const INTERVALS: Record<number, number>` (box → days: 1:0,2:1,3:3,4:7,5:16)
  - `function nextProgress(current: ItemProgress | undefined, correct: boolean, today: string): ItemProgress`
  - `function isMastered(p: ItemProgress): boolean` (box >= 5)
  - `function isDue(p: ItemProgress | undefined, today: string): boolean`
  - `function addDays(iso: string, days: number): string`

- [ ] **Step 1: Write failing test** — create `src/engine/leitner.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { nextProgress, isMastered, isDue, addDays } from "./leitner";

describe("leitner", () => {
  it("addDays computes ISO dates", () => {
    expect(addDays("2026-01-01", 3)).toBe("2026-01-04");
  });
  it("new item correct -> box 2 due tomorrow", () => {
    const p = nextProgress(undefined, true, "2026-01-01");
    expect(p.box).toBe(2);
    expect(p.dueDate).toBe("2026-01-02");
  });
  it("wrong answer resets to box 1 due same day", () => {
    const p = nextProgress({ box: 4, dueDate: "2026-01-10" }, false, "2026-01-05");
    expect(p.box).toBe(1);
    expect(p.dueDate).toBe("2026-01-05");
  });
  it("box caps at 5", () => {
    const p = nextProgress({ box: 5, dueDate: "2026-01-01" }, true, "2026-01-01");
    expect(p.box).toBe(5);
    expect(isMastered(p)).toBe(true);
  });
  it("isDue true when dueDate <= today", () => {
    expect(isDue({ box: 2, dueDate: "2026-01-01" }, "2026-01-02")).toBe(true);
    expect(isDue({ box: 2, dueDate: "2026-01-03" }, "2026-01-02")).toBe(false);
    expect(isDue(undefined, "2026-01-02")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- leitner`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** — create `src/engine/leitner.ts`:

```ts
export interface ItemProgress {
  box: number;
  dueDate: string; // ISO YYYY-MM-DD
}

export const INTERVALS: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };
const MAX_BOX = 5;

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nextProgress(
  current: ItemProgress | undefined,
  correct: boolean,
  today: string
): ItemProgress {
  const box = correct ? Math.min((current?.box ?? 1) + (current ? 1 : 1), MAX_BOX) : 1;
  const effectiveBox = correct ? box : 1;
  return { box: effectiveBox, dueDate: addDays(today, INTERVALS[effectiveBox]) };
}

export function isMastered(p: ItemProgress): boolean {
  return p.box >= MAX_BOX;
}

export function isDue(p: ItemProgress | undefined, today: string): boolean {
  if (!p) return true;
  return p.dueDate <= today;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- leitner`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/leitner.ts src/engine/leitner.test.ts
git commit -m "feat: Leitner spaced-repetition engine"
```

---

### Task 4: XP / levels / streak engine

**Files:**
- Create: `src/engine/xp.ts`, `src/engine/xp.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `const XP_PER_CORRECT = 10`
  - `function answerXp(consecutiveCorrect: number): number` (10 + min(consecutiveCorrect,5)*2)
  - `interface Level { label: string; index: number; xpInto: number; xpForNext: number }`
  - `function levelFromXp(totalXp: number): Level` (250 XP per level; labels A1.1, A1.2, … A2.x)
  - `function nextStreak(prev: { count: number; lastDay: string | null }, today: string): { count: number; lastDay: string }`

- [ ] **Step 1: Write failing test** — create `src/engine/xp.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { answerXp, levelFromXp, nextStreak } from "./xp";

describe("xp", () => {
  it("answerXp adds streak bonus capped at 5", () => {
    expect(answerXp(0)).toBe(10);
    expect(answerXp(3)).toBe(16);
    expect(answerXp(10)).toBe(20);
  });
  it("levelFromXp returns level and progress", () => {
    const l0 = levelFromXp(0);
    expect(l0.index).toBe(0);
    expect(l0.label).toBe("A1.1");
    expect(l0.xpForNext).toBe(250);
    const l1 = levelFromXp(300);
    expect(l1.index).toBe(1);
    expect(l1.xpInto).toBe(50);
  });
});

describe("streak", () => {
  it("first ever day -> 1", () => {
    expect(nextStreak({ count: 0, lastDay: null }, "2026-01-01")).toEqual({ count: 1, lastDay: "2026-01-01" });
  });
  it("same day -> unchanged", () => {
    expect(nextStreak({ count: 3, lastDay: "2026-01-01" }, "2026-01-01")).toEqual({ count: 3, lastDay: "2026-01-01" });
  });
  it("consecutive day -> +1", () => {
    expect(nextStreak({ count: 3, lastDay: "2026-01-01" }, "2026-01-02")).toEqual({ count: 4, lastDay: "2026-01-02" });
  });
  it("gap resets to 1", () => {
    expect(nextStreak({ count: 3, lastDay: "2026-01-01" }, "2026-01-05")).toEqual({ count: 1, lastDay: "2026-01-05" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- xp`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** — create `src/engine/xp.ts`:

```ts
import { addDays } from "./leitner";

export const XP_PER_CORRECT = 10;
const XP_PER_LEVEL = 250;
const LEVEL_LABELS = ["A1.1", "A1.2", "A1.3", "A1.4", "A2.1", "A2.2", "A2.3", "A2.4"];

export function answerXp(consecutiveCorrect: number): number {
  return XP_PER_CORRECT + Math.min(consecutiveCorrect, 5) * 2;
}

export interface Level {
  label: string;
  index: number;
  xpInto: number;
  xpForNext: number;
}

export function levelFromXp(totalXp: number): Level {
  const index = Math.floor(totalXp / XP_PER_LEVEL);
  const label = LEVEL_LABELS[Math.min(index, LEVEL_LABELS.length - 1)];
  return { label, index, xpInto: totalXp % XP_PER_LEVEL, xpForNext: XP_PER_LEVEL };
}

export function nextStreak(
  prev: { count: number; lastDay: string | null },
  today: string
): { count: number; lastDay: string } {
  if (prev.lastDay === today) return { count: prev.count, lastDay: today };
  if (prev.lastDay && addDays(prev.lastDay, 1) === today)
    return { count: prev.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- xp`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/xp.ts src/engine/xp.test.ts
git commit -m "feat: XP, levels and daily-streak engine"
```

---

### Task 5: Exercise generation engine

**Files:**
- Create: `src/engine/exercises.ts`, `src/engine/exercises.test.ts`

**Interfaces:**
- Consumes: `VocabItem` from `src/content/types.ts`.
- Produces:
  - `type ExerciseType = "flashcard" | "qcm" | "fill" | "order"`
  - `interface Qcm { prompt: string; answer: string; options: string[] }`
  - `function buildQcm(item: VocabItem, pool: VocabItem[], rand?: () => number): Qcm` — prompt = item.de, answer = item.fr, 4 options incl. answer, distractors from pool's fr.
  - `interface Fill { sentenceParts: [string, string]; answer: string; options: string[] }` — splits item.example.de around item.de; falls back to whole-word if no example.
  - `function buildFill(item: VocabItem, pool: VocabItem[], rand?: () => number): Fill`
  - `interface Order { tiles: string[]; solution: string[]; promptFr: string }` — shuffled words of item.example.de (or item.de).
  - `function buildOrder(item: VocabItem, rand?: () => number): Order`

- [ ] **Step 1: Write failing test** — create `src/engine/exercises.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildQcm, buildFill, buildOrder } from "./exercises";
import type { VocabItem } from "../content/types";

const seq = (nums: number[]) => { let i = 0; return () => nums[i++ % nums.length]; };

const item: VocabItem = {
  id: "x", de: "Hallo", fr: "Bonjour", gender: null,
  example: { de: "Hallo Welt", fr: "Bonjour le monde" },
};
const pool: VocabItem[] = [
  item,
  { id: "a", de: "Danke", fr: "Merci" },
  { id: "b", de: "Ja", fr: "Oui" },
  { id: "c", de: "Nein", fr: "Non" },
];

describe("buildQcm", () => {
  it("prompt is German, answer is French, 4 unique options incl answer", () => {
    const q = buildQcm(item, pool, seq([0, 0, 0]));
    expect(q.prompt).toBe("Hallo");
    expect(q.answer).toBe("Bonjour");
    expect(q.options).toContain("Bonjour");
    expect(q.options.length).toBe(4);
    expect(new Set(q.options).size).toBe(4);
  });
});

describe("buildFill", () => {
  it("splits example around the target word", () => {
    const f = buildFill(item, pool, seq([0, 0, 0]));
    expect(f.answer).toBe("Hallo");
    expect(f.sentenceParts[0] + "___" + f.sentenceParts[1]).toContain("___ Welt");
    expect(f.options).toContain("Hallo");
  });
});

describe("buildOrder", () => {
  it("tiles are the solution words shuffled", () => {
    const o = buildOrder(item, seq([0.9, 0.1]));
    expect(o.solution).toEqual(["Hallo", "Welt"]);
    expect([...o.tiles].sort()).toEqual([...o.solution].sort());
    expect(o.promptFr).toBe("Bonjour le monde");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- exercises`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** — create `src/engine/exercises.ts`:

```ts
import type { VocabItem } from "../content/types";

export type ExerciseType = "flashcard" | "qcm" | "fill" | "order";

function pickDistractors<T>(pool: T[], exclude: (t: T) => boolean, n: number, rand: () => number): T[] {
  const candidates = pool.filter((t) => !exclude(t));
  const out: T[] = [];
  const used = new Set<number>();
  while (out.length < n && used.size < candidates.length) {
    const i = Math.floor(rand() * candidates.length);
    if (!used.has(i)) { used.add(i); out.push(candidates[i]); }
  }
  return out;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Qcm { prompt: string; answer: string; options: string[] }

export function buildQcm(item: VocabItem, pool: VocabItem[], rand: () => number = Math.random): Qcm {
  const distractors = pickDistractors(pool, (p) => p.fr === item.fr, 3, rand).map((p) => p.fr);
  const options = shuffle([item.fr, ...distractors], rand);
  return { prompt: item.de, answer: item.fr, options };
}

export interface Fill { sentenceParts: [string, string]; answer: string; options: string[] }

export function buildFill(item: VocabItem, pool: VocabItem[], rand: () => number = Math.random): Fill {
  const sentence = item.example?.de ?? item.de;
  const idx = sentence.indexOf(item.de);
  const parts: [string, string] = idx >= 0
    ? [sentence.slice(0, idx), sentence.slice(idx + item.de.length)]
    : ["", ""];
  const distractors = pickDistractors(pool, (p) => p.de === item.de, 2, rand).map((p) => p.de);
  const options = shuffle([item.de, ...distractors], rand);
  return { sentenceParts: parts, answer: item.de, options };
}

export interface Order { tiles: string[]; solution: string[]; promptFr: string }

export function buildOrder(item: VocabItem, rand: () => number = Math.random): Order {
  const solution = (item.example?.de ?? item.de).split(/\s+/);
  return { tiles: shuffle(solution, rand), solution, promptFr: item.example?.fr ?? item.fr };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- exercises`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/exercises.ts src/engine/exercises.test.ts
git commit -m "feat: runtime exercise generation (QCM, fill, order)"
```

---

### Task 6: Session queue builder

**Files:**
- Create: `src/engine/session.ts`, `src/engine/session.test.ts`

**Interfaces:**
- Consumes: `VocabItem`, `ExerciseType`.
- Produces:
  - `interface Step { itemId: string; type: ExerciseType }`
  - `function buildLessonQueue(items: VocabItem[]): Step[]` — for each item, 4 steps in order flashcard→qcm→fill→order.
  - `function buildReviewQueue(items: VocabItem[], rand?: () => number): Step[]` — one step per item, type chosen qcm/fill/order (no flashcard), shuffled order.

- [ ] **Step 1: Write failing test** — create `src/engine/session.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildLessonQueue, buildReviewQueue } from "./session";
import type { VocabItem } from "../content/types";

const items: VocabItem[] = [
  { id: "a", de: "A", fr: "a" },
  { id: "b", de: "B", fr: "b" },
];

describe("buildLessonQueue", () => {
  it("produces 4 steps per item in fixed order", () => {
    const q = buildLessonQueue(items);
    expect(q.length).toBe(8);
    expect(q.slice(0, 4).map((s) => s.type)).toEqual(["flashcard", "qcm", "fill", "order"]);
    expect(q[0].itemId).toBe("a");
  });
});

describe("buildReviewQueue", () => {
  it("one step per item, never flashcard", () => {
    const q = buildReviewQueue(items, () => 0);
    expect(q.length).toBe(2);
    expect(q.every((s) => s.type !== "flashcard")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- session`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** — create `src/engine/session.ts`:

```ts
import type { ExerciseType } from "./exercises";
import type { VocabItem } from "../content/types";

export interface Step { itemId: string; type: ExerciseType }

const LESSON_ORDER: ExerciseType[] = ["flashcard", "qcm", "fill", "order"];
const REVIEW_TYPES: ExerciseType[] = ["qcm", "fill", "order"];

export function buildLessonQueue(items: VocabItem[]): Step[] {
  return items.flatMap((item) => LESSON_ORDER.map((type) => ({ itemId: item.id, type })));
}

export function buildReviewQueue(items: VocabItem[], rand: () => number = Math.random): Step[] {
  const shuffled = [...items].sort(() => rand() - 0.5);
  return shuffled.map((item, i) => ({
    itemId: item.id,
    type: REVIEW_TYPES[i % REVIEW_TYPES.length],
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- session`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/session.ts src/engine/session.test.ts
git commit -m "feat: lesson and review session queue builders"
```

---

### Task 7: Progress store (Zustand, persisted)

**Files:**
- Create: `src/store/useProgress.ts`, `src/store/useProgress.test.ts`

**Interfaces:**
- Consumes: `ItemProgress`, `nextProgress`, `isMastered`, `isDue` (leitner); `answerXp`, `nextStreak` (xp).
- Produces a Zustand hook `useProgress` with state:
  - `items: Record<string, ItemProgress>`
  - `xp: number`, `streak: { count: number; lastDay: string | null }`
  - `badges: string[]`, `consecutiveCorrect: number`
  - actions: `recordAnswer(itemId: string, correct: boolean, today: string): void`,
    `masteredCount(): number`, `dueItemIds(allIds: string[], today: string): string[]`,
    `reset(): void`
  - persisted under key `lern-deutsch-v1` with `version: 1`.

- [ ] **Step 1: Write failing test** — create `src/store/useProgress.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useProgress } from "./useProgress";

beforeEach(() => { useProgress.getState().reset(); });

describe("useProgress", () => {
  it("records a correct answer: xp up, item advanced", () => {
    useProgress.getState().recordAnswer("a", true, "2026-01-01");
    const s = useProgress.getState();
    expect(s.xp).toBe(10);
    expect(s.items["a"].box).toBe(2);
  });
  it("streak bonus grows with consecutive correct", () => {
    const g = useProgress.getState();
    g.recordAnswer("a", true, "2026-01-01");
    g.recordAnswer("b", true, "2026-01-01");
    expect(useProgress.getState().xp).toBe(10 + 12);
  });
  it("wrong answer resets consecutive and box", () => {
    const g = useProgress.getState();
    g.recordAnswer("a", true, "2026-01-01");
    g.recordAnswer("a", false, "2026-01-01");
    expect(useProgress.getState().items["a"].box).toBe(1);
    expect(useProgress.getState().consecutiveCorrect).toBe(0);
  });
  it("dueItemIds returns unseen and due items", () => {
    const g = useProgress.getState();
    g.recordAnswer("a", true, "2026-01-01"); // due 01-02
    const due = g.dueItemIds(["a", "b"], "2026-01-01");
    expect(due).toContain("b"); // unseen
    expect(due).not.toContain("a"); // not due yet
  });
  it("awards 500 XP badge", () => {
    const g = useProgress.getState();
    for (let i = 0; i < 60; i++) g.recordAnswer("x" + i, true, "2026-01-01");
    expect(useProgress.getState().badges).toContain("xp-500");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- useProgress`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** — create `src/store/useProgress.ts`:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nextProgress, isMastered, isDue, type ItemProgress } from "../engine/leitner";
import { answerXp, nextStreak } from "../engine/xp";

interface State {
  items: Record<string, ItemProgress>;
  xp: number;
  streak: { count: number; lastDay: string | null };
  badges: string[];
  consecutiveCorrect: number;
  recordAnswer: (itemId: string, correct: boolean, today: string) => void;
  masteredCount: () => number;
  dueItemIds: (allIds: string[], today: string) => string[];
  reset: () => void;
}

const initial = {
  items: {} as Record<string, ItemProgress>,
  xp: 0,
  streak: { count: 0, lastDay: null as string | null },
  badges: [] as string[],
  consecutiveCorrect: 0,
};

function recomputeBadges(state: { xp: number; streak: { count: number }; items: Record<string, ItemProgress>; badges: string[] }): string[] {
  const badges = new Set(state.badges);
  const mastered = Object.values(state.items).filter(isMastered).length;
  if (mastered >= 100) badges.add("mots-100");
  if (state.streak.count >= 7) badges.add("jours-7");
  if (state.xp >= 500) badges.add("xp-500");
  return [...badges];
}

export const useProgress = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      recordAnswer: (itemId, correct, today) => {
        const s = get();
        const consecutive = correct ? s.consecutiveCorrect : 0;
        const gained = correct ? answerXp(s.consecutiveCorrect) : 0;
        const items = { ...s.items, [itemId]: nextProgress(s.items[itemId], correct, today) };
        const xp = s.xp + gained;
        const streak = correct ? nextStreak(s.streak, today) : s.streak;
        const badges = recomputeBadges({ xp, streak, items, badges: s.badges });
        set({
          items,
          xp,
          streak,
          badges,
          consecutiveCorrect: correct ? consecutive + 1 : 0,
        });
      },
      masteredCount: () => Object.values(get().items).filter(isMastered).length,
      dueItemIds: (allIds, today) => allIds.filter((id) => isDue(get().items[id], today)),
      reset: () => set({ ...initial, items: {}, badges: [], streak: { count: 0, lastDay: null } }),
    }),
    { name: "lern-deutsch-v1", version: 1 }
  )
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- useProgress`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/store
git commit -m "feat: persisted progress store with xp, streak, badges"
```

---

### Task 8: Seed content — all 15 lessons

**Files:**
- Create: `src/content/lessons/` (one file per lesson), `src/content/course.ts`, `src/content/course.test.ts`

**Interfaces:**
- Consumes: `Lesson`, `Course`, `validateCourse`.
- Produces: `export const course: Course` with 15 lessons, ~20 items each (~300 total). Each noun has a gender; most items have an `example`.

> **Note for implementer:** This is content authoring, not logic. Write real German↔French pairs. Nouns MUST carry `gender`. Verbs/phrases use `gender: null`. Aim for ~20 items/lesson. Keep ids `<lessonid>-NN`. The validator test below is the gate.

- [ ] **Step 1: Write one lesson file as the pattern** — create `src/content/lessons/salutations.ts`:

```ts
import type { Lesson } from "../types";

export const salutations: Lesson = {
  id: "salutations",
  title: "Salutations",
  emoji: "👋",
  items: [
    { id: "salutations-01", de: "Hallo", fr: "Bonjour / Salut", gender: null,
      example: { de: "Hallo, wie geht's?", fr: "Salut, comment ça va ?" } },
    { id: "salutations-02", de: "Guten Morgen", fr: "Bonjour (le matin)", gender: null,
      example: { de: "Guten Morgen, Anna!", fr: "Bonjour Anna !" } },
    { id: "salutations-03", de: "Guten Tag", fr: "Bonjour (la journée)", gender: null },
    { id: "salutations-04", de: "Guten Abend", fr: "Bonsoir", gender: null },
    { id: "salutations-05", de: "Gute Nacht", fr: "Bonne nuit", gender: null },
    { id: "salutations-06", de: "Tschüss", fr: "Au revoir (familier)", gender: null },
    { id: "salutations-07", de: "Auf Wiedersehen", fr: "Au revoir", gender: null },
    { id: "salutations-08", de: "Bitte", fr: "S'il vous plaît / De rien", gender: null },
    { id: "salutations-09", de: "Danke", fr: "Merci", gender: null,
      example: { de: "Danke schön!", fr: "Merci beaucoup !" } },
    { id: "salutations-10", de: "Ja", fr: "Oui", gender: null },
    { id: "salutations-11", de: "Nein", fr: "Non", gender: null },
    { id: "salutations-12", de: "Entschuldigung", fr: "Excusez-moi / Pardon", gender: null },
    { id: "salutations-13", de: "Wie geht es dir?", fr: "Comment vas-tu ?", gender: null },
    { id: "salutations-14", de: "Gut", fr: "Bien", gender: null },
    { id: "salutations-15", de: "Schlecht", fr: "Mal", gender: null },
    { id: "salutations-16", de: "der Name", fr: "le nom", gender: "der",
      example: { de: "Mein Name ist Paul.", fr: "Mon nom est Paul." } },
    { id: "salutations-17", de: "Ich heiße ...", fr: "Je m'appelle ...", gender: null },
    { id: "salutations-18", de: "Willkommen", fr: "Bienvenue", gender: null },
    { id: "salutations-19", de: "Bis bald", fr: "À bientôt", gender: null },
    { id: "salutations-20", de: "Bis morgen", fr: "À demain", gender: null },
  ],
};
```

- [ ] **Step 2: Author the remaining 14 lesson files** following the same pattern, each ~20 items:
  `cafe.ts` (Au café ☕), `nombres.ts` (Les nombres 🔢), `famille.ts` (La famille 👨‍👩‍👧), `maison.ts` (La maison 🏠), `nourriture.ts` (La nourriture 🍎), `vetements.ts` (Les vêtements 👕), `temps.ts` (Le temps / la météo 🌦️), `directions.ts` (Les directions 🧭), `travail.ts` (Le travail 💼), `voyage.ts` (Le voyage ✈️), `corps.ts` (Le corps / la santé 🩺), `loisirs.ts` (Les loisirs 🎨), `verbes.ts` (Les verbes courants 🏃), `phrases.ts` (Phrases utiles 💬).

  For each noun set the correct article as both the `de` prefix and the `gender` field (e.g. `de: "die Tasse", gender: "die"`). Example sentences strongly recommended for items that will be used in fill/order exercises.

- [ ] **Step 3: Assemble the course** — create `src/content/course.ts`:

```ts
import type { Course } from "./types";
import { salutations } from "./lessons/salutations";
import { cafe } from "./lessons/cafe";
import { nombres } from "./lessons/nombres";
import { famille } from "./lessons/famille";
import { maison } from "./lessons/maison";
import { nourriture } from "./lessons/nourriture";
import { vetements } from "./lessons/vetements";
import { temps } from "./lessons/temps";
import { directions } from "./lessons/directions";
import { travail } from "./lessons/travail";
import { voyage } from "./lessons/voyage";
import { corps } from "./lessons/corps";
import { loisirs } from "./lessons/loisirs";
import { verbes } from "./lessons/verbes";
import { phrases } from "./lessons/phrases";

export const course: Course = {
  id: "de-fr-a1",
  from: "fr",
  to: "de",
  lessons: [
    salutations, cafe, nombres, famille, maison, nourriture, vetements,
    temps, directions, travail, voyage, corps, loisirs, verbes, phrases,
  ],
};
```

- [ ] **Step 4: Write validation test** — create `src/content/course.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { course } from "./course";
import { validateCourse } from "./validate";

describe("seed course", () => {
  it("is valid", () => {
    expect(validateCourse(course)).toEqual([]);
  });
  it("has 15 lessons and ~300 items", () => {
    expect(course.lessons.length).toBe(15);
    const total = course.lessons.reduce((n, l) => n + l.items.length, 0);
    expect(total).toBeGreaterThanOrEqual(270);
  });
  it("nouns with der/die/das prefix carry matching gender", () => {
    for (const l of course.lessons)
      for (const it of l.items) {
        const m = it.de.match(/^(der|die|das)\s/);
        if (m) expect(it.gender).toBe(m[1]);
      }
  });
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- course`
Expected: PASS (3 tests). Fix any validation errors reported until green.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat: seed course content (15 lessons, ~300 words FR->DE)"
```

---

### Task 9: App shell, routing & theme

**Files:**
- Create: `src/app/App.tsx`, `src/app/Layout.tsx`, `src/app/today.ts`, `src/components/GenderWord.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: react-router-dom, `course`.
- Produces:
  - `function today(): string` (local date ISO `YYYY-MM-DD`)
  - `<GenderWord item={VocabItem} />` renders German word colored by gender.
  - Routes: `/` Home, `/lesson/:id` Lesson, `/review` Review, `/progress` Progress; `Layout` wraps with bottom nav.

- [ ] **Step 1: Write failing test** — create `src/components/GenderWord.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GenderWord } from "./GenderWord";

describe("GenderWord", () => {
  it("colors der words blue", () => {
    const { getByText } = render(
      <GenderWord item={{ id: "x", de: "der Tisch", fr: "la table", gender: "der" }} />
    );
    expect(getByText("der Tisch").className).toContain("text-der");
  });
  it("no gender renders plain", () => {
    const { getByText } = render(
      <GenderWord item={{ id: "y", de: "Hallo", fr: "Bonjour", gender: null }} />
    );
    expect(getByText("Hallo").className).not.toContain("text-der");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- GenderWord`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement GenderWord** — create `src/components/GenderWord.tsx`:

```tsx
import type { VocabItem } from "../content/types";

const GENDER_CLASS: Record<string, string> = {
  der: "text-der", die: "text-die", das: "text-das",
};

export function GenderWord({ item, className = "" }: { item: VocabItem; className?: string }) {
  const color = item.gender ? GENDER_CLASS[item.gender] : "";
  return <span className={`font-semibold ${color} ${className}`}>{item.de}</span>;
}
```

- [ ] **Step 4: Implement today()** — create `src/app/today.ts`:

```ts
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
```

- [ ] **Step 5: Implement Layout** — create `src/app/Layout.tsx`:

```tsx
import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "Accueil", icon: "🏠" },
  { to: "/review", label: "Révision", icon: "🔁" },
  { to: "/progress", label: "Progrès", icon: "📈" },
];

export function Layout() {
  return (
    <div className="mx-auto max-w-app min-h-full flex flex-col bg-amber-50">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t flex">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === "/"}
            className={({ isActive }) =>
              `flex-1 py-2 text-center text-xs ${isActive ? "text-accent font-bold" : "text-neutral-500"}`}>
            <div className="text-lg">{t.icon}</div>{t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 6: Implement App with routes** — create `src/app/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "../screens/Home";
import { Lesson } from "../screens/Lesson";
import { Review } from "../screens/Review";
import { Progress } from "../screens/Progress";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/review" element={<Review />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

Update `src/main.tsx` to render `<App />` and import `./index.css`.

> Screens are implemented in Tasks 10–12. To keep the app compiling after this task, create minimal placeholder exports for `Home`, `Lesson`, `Review`, `Progress` now (`export function Home(){return null}` etc.) in their screen files; later tasks replace the bodies.

- [ ] **Step 7: Run GenderWord test + build**

Run: `npm run test -- GenderWord` → Expected: PASS (2 tests).
Run: `npm run build` → Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/app src/components src/main.tsx src/screens
git commit -m "feat: app shell, routing, bottom nav, gender word + today helper"
```

---

### Task 10: Exercise components

**Files:**
- Create: `src/components/Flashcard.tsx`, `src/components/Qcm.tsx`, `src/components/FillBlank.tsx`, `src/components/WordOrder.tsx`, `src/components/exercises.test.tsx`

**Interfaces:**
- Consumes: builders from `engine/exercises`, `VocabItem`, `GenderWord`.
- Produces components, each taking `{ item, pool, onResult }` where `onResult: (correct: boolean) => void`:
  - `<Flashcard item pool onResult />` — shows word + example, "Je savais" (correct) / "Je ne savais pas" (incorrect) buttons.
  - `<Qcm item pool onResult />` — renders options; clicking calls onResult(option === answer).
  - `<FillBlank item pool onResult />` — renders sentence with blank + option tiles; onResult(choice === answer).
  - `<WordOrder item pool onResult />` — tiles to append into an answer row; a "Vérifier" button calls onResult(joined === solution.join(" ")).

- [ ] **Step 1: Write failing test** — create `src/components/exercises.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Qcm } from "./Qcm";
import { Flashcard } from "./Flashcard";
import type { VocabItem } from "../content/types";

const item: VocabItem = { id: "x", de: "Hallo", fr: "Bonjour", gender: null };
const pool: VocabItem[] = [item, { id: "a", de: "Danke", fr: "Merci" }, { id: "b", de: "Ja", fr: "Oui" }, { id: "c", de: "Nein", fr: "Non" }];

describe("Qcm", () => {
  it("reports correct when the right option is clicked", () => {
    const onResult = vi.fn();
    const { getByText } = render(<Qcm item={item} pool={pool} onResult={onResult} />);
    fireEvent.click(getByText("Bonjour"));
    expect(onResult).toHaveBeenCalledWith(true);
  });
});

describe("Flashcard", () => {
  it("reports result from self-rating buttons", () => {
    const onResult = vi.fn();
    const { getByText } = render(<Flashcard item={item} pool={pool} onResult={onResult} />);
    fireEvent.click(getByText(/Je savais/));
    expect(onResult).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/exercises`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the four components.**

`src/components/Flashcard.tsx`:

```tsx
import type { VocabItem } from "../content/types";
import { GenderWord } from "./GenderWord";

export function Flashcard({ item, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="text-3xl"><GenderWord item={item} /></div>
      <div className="text-neutral-500">{item.fr}</div>
      {item.example && <div className="text-sm italic text-neutral-400">{item.example.de}<br />{item.example.fr}</div>}
      <div className="flex gap-3 pt-4">
        <button className="flex-1 py-3 rounded-xl bg-good text-white" onClick={() => onResult(true)}>Je savais 👍</button>
        <button className="flex-1 py-3 rounded-xl bg-bad text-white" onClick={() => onResult(false)}>Je ne savais pas</button>
      </div>
    </div>
  );
}
```

`src/components/Qcm.tsx`:

```tsx
import { useMemo, useState } from "react";
import type { VocabItem } from "../content/types";
import { buildQcm } from "../engine/exercises";

export function Qcm({ item, pool, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  const q = useMemo(() => buildQcm(item, pool), [item, pool]);
  const [chosen, setChosen] = useState<string | null>(null);
  const pick = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    setTimeout(() => onResult(opt === q.answer), 500);
  };
  return (
    <div className="p-6 space-y-4">
      <div className="text-2xl font-semibold text-center">{q.prompt}</div>
      <div className="grid gap-3">
        {q.options.map((opt) => {
          const state = chosen && (opt === q.answer ? "bg-good text-white" : opt === chosen ? "bg-bad text-white" : "bg-white");
          return (
            <button key={opt} onClick={() => pick(opt)}
              className={`py-3 rounded-xl border ${state || "bg-white"}`}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}
```

`src/components/FillBlank.tsx`:

```tsx
import { useMemo, useState } from "react";
import type { VocabItem } from "../content/types";
import { buildFill } from "../engine/exercises";

export function FillBlank({ item, pool, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  const f = useMemo(() => buildFill(item, pool), [item, pool]);
  const [chosen, setChosen] = useState<string | null>(null);
  const pick = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    setTimeout(() => onResult(opt === f.answer), 500);
  };
  return (
    <div className="p-6 space-y-4">
      <div className="text-xl text-center">
        {f.sentenceParts[0]}
        <span className="px-2 border-b-2 border-accent">{chosen ?? "____"}</span>
        {f.sentenceParts[1]}
      </div>
      <div className="text-sm text-neutral-500 text-center">{item.fr}</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {f.options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)}
            className={`px-4 py-2 rounded-xl border ${chosen && opt === f.answer ? "bg-good text-white" : chosen === opt ? "bg-bad text-white" : "bg-white"}`}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
```

`src/components/WordOrder.tsx`:

```tsx
import { useMemo, useState } from "react";
import type { VocabItem } from "../content/types";
import { buildOrder } from "../engine/exercises";

export function WordOrder({ item, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  const o = useMemo(() => buildOrder(item), [item]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(o.tiles);
  const take = (i: number) => {
    setAnswer([...answer, bank[i]]);
    setBank(bank.filter((_, j) => j !== i));
  };
  const check = () => onResult(answer.join(" ") === o.solution.join(" "));
  return (
    <div className="p-6 space-y-4">
      <div className="text-sm text-neutral-500 text-center">{o.promptFr}</div>
      <div className="min-h-12 flex flex-wrap gap-2 justify-center border-b pb-2">
        {answer.map((w, i) => <span key={i} className="px-3 py-1 rounded-lg bg-accent text-white">{w}</span>)}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((w, i) => <button key={i} onClick={() => take(i)} className="px-3 py-1 rounded-lg bg-white border">{w}</button>)}
      </div>
      <button onClick={check} disabled={bank.length > 0}
        className="w-full py-3 rounded-xl bg-accent text-white disabled:opacity-40">Vérifier</button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/exercises`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat: four exercise components (flashcard, qcm, fill, order)"
```

---

### Task 11: Lesson & Review screens (the session loop)

**Files:**
- Create: `src/screens/SessionRunner.tsx`, `src/screens/Summary.tsx`
- Modify/replace placeholders: `src/screens/Lesson.tsx`, `src/screens/Review.tsx`

**Interfaces:**
- Consumes: `buildLessonQueue`, `buildReviewQueue`, `course`, `useProgress`, `today`, exercise components, `framer-motion`.
- Produces:
  - `<SessionRunner steps itemsById onDone />` — renders each step's exercise, calls `useProgress.recordAnswer` with `today()`, shows ✓/✗ flash, advances; on last step calls `onDone(stats)`.
  - `Lesson` builds a lesson queue from the `:id` param; `Review` builds a review queue from `dueItemIds`.

- [ ] **Step 1: Write failing test** — create `src/screens/SessionRunner.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { SessionRunner } from "./SessionRunner";
import { useProgress } from "../store/useProgress";
import type { VocabItem } from "../content/types";

const items: Record<string, VocabItem> = { a: { id: "a", de: "Hallo", fr: "Bonjour", gender: null } };

beforeEach(() => useProgress.getState().reset());

describe("SessionRunner", () => {
  it("records an answer and finishes a one-step session", () => {
    const onDone = vi.fn();
    const { getByText } = render(
      <SessionRunner steps={[{ itemId: "a", type: "flashcard" }]} itemsById={items} pool={[items.a]} onDone={onDone} />
    );
    fireEvent.click(getByText(/Je savais/));
    expect(useProgress.getState().xp).toBe(10);
    expect(onDone).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- SessionRunner`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement SessionRunner** — create `src/screens/SessionRunner.tsx`:

```tsx
import { useState } from "react";
import type { Step } from "../engine/session";
import type { VocabItem } from "../content/types";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { Flashcard } from "../components/Flashcard";
import { Qcm } from "../components/Qcm";
import { FillBlank } from "../components/FillBlank";
import { WordOrder } from "../components/WordOrder";

export interface SessionStats { correct: number; total: number }

const COMP = { flashcard: Flashcard, qcm: Qcm, fill: FillBlank, order: WordOrder };

export function SessionRunner({ steps, itemsById, pool, onDone }: {
  steps: Step[];
  itemsById: Record<string, VocabItem>;
  pool: VocabItem[];
  onDone: (s: SessionStats) => void;
}) {
  const record = useProgress((s) => s.recordAnswer);
  const [i, setI] = useState(0);
  const [stats, setStats] = useState<SessionStats>({ correct: 0, total: 0 });
  const [flash, setFlash] = useState<null | boolean>(null);

  if (i >= steps.length) return null;
  const step = steps[i];
  const item = itemsById[step.itemId];
  const Comp = COMP[step.type];

  const handle = (correct: boolean) => {
    record(step.itemId, correct, today());
    const next = { correct: stats.correct + (correct ? 1 : 0), total: stats.total + 1 };
    setStats(next);
    setFlash(correct);
    if (navigator.vibrate) navigator.vibrate(correct ? 20 : [10, 30, 10]);
    setTimeout(() => {
      setFlash(null);
      if (i + 1 >= steps.length) onDone(next);
      else setI(i + 1);
    }, 500);
  };

  return (
    <div className="relative">
      <div className="h-1 bg-neutral-200">
        <div className="h-1 bg-accent transition-all" style={{ width: `${(i / steps.length) * 100}%` }} />
      </div>
      {flash !== null && (
        <div className={`absolute inset-0 pointer-events-none ${flash ? "bg-good/20" : "bg-bad/20"}`} />
      )}
      <Comp item={item} pool={pool} onResult={handle} />
    </div>
  );
}
```

- [ ] **Step 4: Implement Summary** — create `src/screens/Summary.tsx`:

```tsx
import { Link } from "react-router-dom";
import type { SessionStats } from "./SessionRunner";

export function Summary({ stats, nextTo }: { stats: SessionStats; nextTo: string }) {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="text-5xl">🎉</div>
      <h2 className="text-2xl font-bold">Terminé !</h2>
      <p className="text-neutral-600">{stats.correct} / {stats.total} corrects</p>
      <p className="text-accent font-semibold">+{stats.correct * 10} XP</p>
      <Link to={nextTo} className="inline-block mt-4 px-6 py-3 rounded-xl bg-accent text-white">Continuer</Link>
    </div>
  );
}
```

- [ ] **Step 5: Implement Lesson screen** — replace `src/screens/Lesson.tsx`:

```tsx
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { course } from "../content/course";
import { buildLessonQueue } from "../engine/session";
import { SessionRunner, type SessionStats } from "./SessionRunner";
import { Summary } from "./Summary";

export function Lesson() {
  const { id } = useParams();
  const lesson = course.lessons.find((l) => l.id === id);
  const [done, setDone] = useState<SessionStats | null>(null);
  const steps = useMemo(() => (lesson ? buildLessonQueue(lesson.items) : []), [lesson]);
  const itemsById = useMemo(
    () => Object.fromEntries((lesson?.items ?? []).map((it) => [it.id, it])),
    [lesson]
  );
  if (!lesson) return <div className="p-6">Leçon introuvable.</div>;
  if (done) return <Summary stats={done} nextTo="/" />;
  return (
    <div>
      <h1 className="p-4 text-lg font-bold">{lesson.emoji} {lesson.title}</h1>
      <SessionRunner steps={steps} itemsById={itemsById} pool={lesson.items} onDone={setDone} />
    </div>
  );
}
```

- [ ] **Step 6: Implement Review screen** — replace `src/screens/Review.tsx`:

```tsx
import { useMemo, useState } from "react";
import { course } from "../content/course";
import { buildReviewQueue } from "../engine/session";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { SessionRunner, type SessionStats } from "./SessionRunner";
import { Summary } from "./Summary";

export function Review() {
  const allItems = useMemo(() => course.lessons.flatMap((l) => l.items), []);
  const dueFn = useProgress((s) => s.dueItemIds);
  const seen = useProgress((s) => s.items);
  const [done, setDone] = useState<SessionStats | null>(null);

  // Only review items the learner has already started (exclude fully unseen).
  const startedIds = Object.keys(seen);
  const dueIds = dueFn(startedIds, today());
  const dueItems = allItems.filter((it) => dueIds.includes(it.id));
  const steps = useMemo(() => buildReviewQueue(dueItems), [dueItems.length]);
  const itemsById = Object.fromEntries(dueItems.map((it) => [it.id, it]));

  if (done) return <Summary stats={done} nextTo="/" />;
  if (!dueItems.length)
    return <div className="p-8 text-center text-neutral-500">Rien à réviser aujourd'hui 🎉</div>;
  return <SessionRunner steps={steps} itemsById={itemsById} pool={dueItems} onDone={setDone} />;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test -- SessionRunner` → Expected: PASS (1 test).
Run: `npm run build` → Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/screens
git commit -m "feat: session runner, lesson and review screens, summary"
```

---

### Task 12: Home & Progress screens

**Files:**
- Modify/replace placeholders: `src/screens/Home.tsx`, `src/screens/Progress.tsx`
- Create: `src/components/LevelBar.tsx`

**Interfaces:**
- Consumes: `course`, `useProgress`, `levelFromXp`, `isMastered`, `today`.
- Produces:
  - `<LevelBar xp />` — shows level label + filling bar.
  - `Home` — header (level bar, XP, streak 🔥, due-today count) + lesson grid with per-lesson mastery ring.
  - `Progress` — mastered/total, level, streak, badges grid, per-lesson breakdown.

- [ ] **Step 1: Write failing test** — create `src/components/LevelBar.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LevelBar } from "./LevelBar";

describe("LevelBar", () => {
  it("shows the level label for given xp", () => {
    const { getByText } = render(<LevelBar xp={0} />);
    expect(getByText(/A1\.1/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- LevelBar`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement LevelBar** — create `src/components/LevelBar.tsx`:

```tsx
import { levelFromXp } from "../engine/xp";

export function LevelBar({ xp }: { xp: number }) {
  const lvl = levelFromXp(xp);
  const pct = Math.round((lvl.xpInto / lvl.xpForNext) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="font-bold">{lvl.label}</span><span>{xp} XP</span></div>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-accent rounded" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
```

- [ ] **Step 4: Implement Home** — replace `src/screens/Home.tsx`:

```tsx
import { Link } from "react-router-dom";
import { course } from "../content/course";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { LevelBar } from "../components/LevelBar";
import { isMastered } from "../engine/leitner";

export function Home() {
  const { xp, streak, items, dueItemIds } = useProgress();
  const started = Object.keys(items);
  const dueCount = dueItemIds(started, today()).length;
  return (
    <div className="p-4 space-y-5">
      <header className="space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Lern Deutsch 🇩🇪</h1>
          <span className="text-sm">🔥 {streak.count}</span>
        </div>
        <LevelBar xp={xp} />
        {dueCount > 0 && (
          <Link to="/review" className="block text-center py-2 rounded-xl bg-accent/10 text-accent font-semibold">
            {dueCount} mots à réviser aujourd'hui →
          </Link>
        )}
      </header>
      <div className="grid grid-cols-2 gap-3">
        {course.lessons.map((l) => {
          const mastered = l.items.filter((it) => items[it.id] && isMastered(items[it.id])).length;
          return (
            <Link key={l.id} to={`/lesson/${l.id}`}
              className="p-4 rounded-2xl bg-white shadow-sm flex flex-col gap-1">
              <div className="text-2xl">{l.emoji}</div>
              <div className="font-semibold text-sm">{l.title}</div>
              <div className="text-xs text-neutral-400">{mastered}/{l.items.length} maîtrisés</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement Progress** — replace `src/screens/Progress.tsx`:

```tsx
import { course } from "../content/course";
import { useProgress } from "../store/useProgress";
import { isMastered } from "../engine/leitner";
import { levelFromXp } from "../engine/xp";
import { LevelBar } from "../components/LevelBar";

const BADGE_LABELS: Record<string, string> = {
  "mots-100": "100 mots 📚", "jours-7": "7 jours 🔥", "xp-500": "500 XP ⭐",
};

export function Progress() {
  const { xp, streak, items, badges } = useProgress();
  const allItems = course.lessons.flatMap((l) => l.items);
  const mastered = allItems.filter((it) => items[it.id] && isMastered(items[it.id])).length;
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Progrès</h1>
      <LevelBar xp={xp} />
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat value={`${mastered}/${allItems.length}`} label="maîtrisés" />
        <Stat value={levelFromXp(xp).label} label="niveau" />
        <Stat value={`🔥 ${streak.count}`} label="jours" />
      </div>
      <section>
        <h2 className="font-semibold mb-2">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(BADGE_LABELS).map((b) => (
            <span key={b} className={`px-3 py-2 rounded-xl text-sm ${badges.includes(b) ? "bg-accent text-white" : "bg-neutral-200 text-neutral-400"}`}>
              {BADGE_LABELS[b]}
            </span>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">Par leçon</h2>
        {course.lessons.map((l) => {
          const m = l.items.filter((it) => items[it.id] && isMastered(items[it.id])).length;
          return (
            <div key={l.id} className="flex items-center gap-2 text-sm">
              <span>{l.emoji}</span><span className="flex-1">{l.title}</span>
              <span className="text-neutral-400">{m}/{l.items.length}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-3 rounded-xl bg-white shadow-sm">
      <div className="font-bold">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
    </div>
  );
}
```

- [ ] **Step 6: Run test + build**

Run: `npm run test -- LevelBar` → Expected: PASS (1 test).
Run: `npm run test` → Expected: ALL pass.
Run: `npm run build` → Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/screens src/components
git commit -m "feat: home and progress screens with level bar and badges"
```

---

### Task 13: Manual verification & GitHub Pages deploy config

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`
- Modify: `vite.config.ts` (confirm `base`)

**Interfaces:**
- Consumes: the built app.
- Produces: a Pages-deployable workflow and docs.

- [ ] **Step 1: Run the dev server and manually verify the full loop**

```bash
npm run dev
```

Verify in the browser (mobile viewport): Home shows 15 lessons + level bar; open a lesson → flashcard → QCM → fill → order all work with ✓/✗ feedback; Summary shows XP; Home XP/streak updated; after a lesson, "à réviser" appears next day (or temporarily tweak `today()` to test); Progress shows mastered counts and badges unlocking.

- [ ] **Step 2: Add Pages workflow** — create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Pages
on:
  push: { branches: [main] }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```

> For project Pages (`jandromv-arch.github.io/lern-deutsch`), set `base: "/lern-deutsch/"` in `vite.config.ts` and switch `BrowserRouter` to `createHashRouter`/`HashRouter` OR add a 404.html fallback. For a user/root site, keep `base: "./"`. Confirm which repo before finalizing.

- [ ] **Step 3: Write README** — create `README.md` with title, description (FR→DE vocab trainer), `npm install`, `npm run dev`, `npm run test`, `npm run build`, and a one-line note on how content lives in `src/content/lessons`.

- [ ] **Step 4: Final full test + build**

Run: `npm run test` → Expected: ALL pass.
Run: `npm run build` → Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: GitHub Pages deploy workflow and README"
```

---

## Notes for the implementer

- Keep engine modules pure — if you reach for `useProgress` or `localStorage` inside `src/engine/`, stop and move that logic to the store.
- The `pool` passed to exercise components is the current lesson's items (Lesson) or the due items (Review); distractors come from it, so lessons need ≥4 items (all do).
- Content authoring (Task 8) is the biggest time sink — correctness of genders matters because they drive both color and the validator test.
