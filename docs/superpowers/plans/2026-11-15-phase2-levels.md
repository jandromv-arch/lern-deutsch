# Phase 2 — Levels, A2/B1 vocabulary, grammar, more dialogues (Plan)

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Grow the course into CEFR levels (A1/A2/B1) with ~300 more words, grammar tips in context + a Grammaire screen, and more dialogues — Babbel-style structure.

**Architecture:** Additive. Tag each Lesson with a `level`; keep `course.lessons` a flat ordered array (A1→A2→B1) so SRS/daily/review keep working. Home groups lessons into level sections. Grammar tips are an optional per-lesson card shown before a lesson's exercises, plus a Grammaire list screen.

## Global Constraints
- UI French; target German. No backend. TypeScript strict, dark-aware, TDD for logic.
- KEEP `course.lessons` a single flat array ordered A1, then A2, then B1 (do not nest it) — daily.ts/Home/Progress/Review iterate it; don't break them.
- Levels are all accessible (no hard lock); Home shows them as sections in order with a per-level mastery count. Recommended order only.
- Nouns carry article in `de` + matching `gender`; validator gates it (existing rule). New content must pass `validateCourse`.
- Audio: the controller regenerates neural audio for all new German strings AFTER content lands (scripts/extract-de.ts + gen_audio.py). Implementers do NOT generate audio; just author text. Items without a clip fall back to speech automatically.

---

### Task 1: Level field + grammarTip on the data model

**Files:** Modify `src/content/types.ts`, `src/content/validate.ts`, `src/content/validate.test.ts`, and all 15 existing `src/content/lessons/*.ts` (add `level: "A1"`).

**Interfaces — Produces:**
- `type Level = "A1" | "A2" | "B1"`
- `Lesson` gains `level: Level` and optional `grammarTip?: { title: string; body: string }`.
- `validateCourse` also flags a lesson missing a valid `level`.

- [ ] **Step 1: Failing test** — extend validate.test.ts: a course whose lesson has no `level` (or an invalid one) returns an error; a valid A1 lesson passes.
- [ ] **Step 2: Run → FAIL**.
- [ ] **Step 3: Implement** — add `Level`, `level`, `grammarTip?` to types.ts; add the level check to validate.ts (level must be one of A1/A2/B1).
- [ ] **Step 4: Tag existing lessons** — add `level: "A1"` to each of the 15 lesson objects in src/content/lessons/*.ts. (salutations, cafe, nombres, famille, maison, nourriture, vetements, temps, directions, travail, voyage, corps, loisirs, verbes, phrases.)
- [ ] **Step 5: Run `npm run test -- validate course` → PASS**; full test + build green.
- [ ] **Step 6: Commit** `feat: add CEFR level + optional grammarTip to the content model (tag A1)`.

---

### Task 2: A2 vocabulary (8 lessons, ~160 words)

**Files:** Create 8 files in `src/content/lessons/` (level "A2"); Modify `src/content/course.ts` to append them AFTER the A1 lessons (keep order). Extend `src/content/course.test.ts` counts.

**A2 lessons (ids/titles/emojis):**
- `a2-restaurant` "Au restaurant" 🍽️
- `a2-sante` "Chez le médecin" 🩺
- `a2-travail2` "Au bureau" 🏢
- `a2-voyage2` "En voyage" 🧳
- `a2-maison2` "Les tâches ménagères" 🧹
- `a2-loisirs2` "Sorties et loisirs" 🎭
- `a2-emotions` "Sentiments et opinions" 💬
- `a2-ville` "En ville" 🏙️

- [ ] **Step 1** Author each file: ~20 items, A2 level, correct German (umlauts/ß, capitalized nouns, correct genders), accurate French, most with an `example`. Nouns: article in `de` + matching `gender`. Add a `grammarTip` to ~3-4 of these lessons (e.g. restaurant → "Ich hätte gern / möchte"; sante → modal verbs; travail2 → Perfekt/past; ville → prepositions with dative/accusative). Set `level: "A2"`.
- [ ] **Step 2** Append the 8 to course.ts after the A1 lessons.
- [ ] **Step 3** Update course.test.ts: total lessons ≥ 23, total items grows, all validate, gender-prefix rule holds. Run → PASS; full test + build green.
- [ ] **Step 4: Commit** `feat: A2 vocabulary (8 lessons)`.

---

### Task 3: B1 vocabulary (6 lessons, ~120 words)

**Files:** Create 6 files in `src/content/lessons/` (level "B1"); append to course.ts after A2; extend course.test.ts.

**B1 lessons:**
- `b1-travail3` "Le monde du travail" 💼
- `b1-actualite` "Actualité et société" 📰
- `b1-environnement` "L'environnement" 🌍
- `b1-opinions` "Débattre et argumenter" 🗣️
- `b1-culture` "Culture et médias" 🎬
- `b1-abstrait` "Idées et sentiments" 🧠

- [ ] **Step 1** Author ~20 items each, B1 level (more abstract vocab, some connectors/verbs), correct German + French, examples, correct genders. Add a `grammarTip` to ~3 (e.g. actualite → Passiv; opinions → Konjunktiv II / "würde"; travail3 → relative clauses). `level: "B1"`.
- [ ] **Step 2** Append to course.ts after A2.
- [ ] **Step 3** Update course.test.ts (total lessons ≥ 29, item count). Run → PASS; full test + build green.
- [ ] **Step 4: Commit** `feat: B1 vocabulary (6 lessons)`.

---

### Task 4: Grammar — tip card in lessons + Grammaire screen

**Files:** Create `src/components/GrammarTip.tsx`, `src/screens/Grammar.tsx`, tests; Modify `src/screens/Lesson.tsx` (show the tip before exercises), `src/app/App.tsx` (route `/grammar`), `src/screens/Home.tsx` (entry).

- [ ] **Step 1: GrammarTip component** — `{ tip: { title, body }, onContinue }`: a card "Astuce 💡 {title}" + body + a "Continuer" button calling onContinue. Dark-aware, French. + test: renders title/body, Continuer calls onContinue.
- [ ] **Step 2: Lesson shows the tip first** — in Lesson.tsx, if `lesson.grammarTip` and the session hasn't started, show `<GrammarTip tip onContinue={startSession}>` before the SessionRunner; once continued, run the exercises as today. (Keep the key/remount behavior.) A lesson without a tip behaves exactly as now.
- [ ] **Step 3: Grammaire screen** — `src/screens/Grammar.tsx` at `/grammar`: lists every lesson's grammarTip grouped by level (A1/A2/B1), each as a GrammarTip-style card (title + body, no Continue button here). Pull tips from `course.lessons` (those with grammarTip). Header "Grammaire 📚", back to Accueil.
- [ ] **Step 4: Routes + Home entry** — add `/grammar` route; a "Grammaire 📚" card on Home near Dialogues.
- [ ] **Step 5** Run tests + build green.
- [ ] **Step 6: Commit** `feat: grammar tips in lessons + Grammaire screen`.

---

### Task 5: Home grouped by level

**Files:** Modify `src/screens/Home.tsx`; small helper maybe in content.

- [ ] **Step 1** Group `course.lessons` by `lesson.level` (order A1, A2, B1). Render a section per level: a header like "A1 · Débutant" (labels: A1 "Débutant", A2 "Intermédiaire", B1 "Avancé") with a per-level mastery count (sum of mastered items / total across that level's lessons), then that level's lesson cards in the existing card style. Keep the Leçon du jour button, Dialogues, Grammaire, reminder nudge and daily ring above the sections. Dark-aware, French. No hard lock; all sections visible/clickable.
- [ ] **Step 2** Keep Progress.tsx working (it iterates course.lessons flat — unchanged, but optionally group its per-lesson breakdown by level too; optional, keep simple).
- [ ] **Step 3** Run tests + build green; verify the grid still links to `/lesson/:id`.
- [ ] **Step 4: Commit** `feat: Home grouped into CEFR level sections`.

---

### Task 6: More dialogues (5, A2)

**Files:** Modify `src/content/dialogues.ts` (add 5), `src/content/dialogues.test.ts` (count ≥ 10). Optionally add a `level?` to Dialogue for display; not required.

- [ ] **Step 1** Author 5 more dialogues (A2 situations): `restaurant` "Au restaurant" 🍽️, `medecin` "Chez le médecin" 🩺, `telephone` "Au téléphone" 📞, `banque` "À la banque" 🏦, `invitation` "Une invitation" 🎉. 7–10 lines each, alternating speakers, correct German + French.
- [ ] **Step 2** Update dialogues.test.ts count (≥ 10). Run → PASS; full test + build green.
- [ ] **Step 3: Commit** `feat: 5 more dialogues (A2 situations)`.

---

### Task 7 (controller): Regenerate audio, build, verify, deploy
- Re-run `npx vite-node scripts/extract-de.ts <json>` then `PIPER_MODEL=… python3 scripts/gen_audio.py <json>` (idempotent — only new strings generate). Commit the new mp3s + updated manifest.
- Full test + build; browser-verify level sections, a grammar tip, a new A2 lesson with audio, a new dialogue.
- Merge → main, push to jandromv-arch, deploy, verify live.

## Notes
- All new `de` noun entries MUST include the article in `de` AND a matching `gender` or the validator fails.
- Keep `course.lessons` flat and ordered A1→A2→B1 (daily "new words" picks the first lesson with unstarted items, so order matters).
- Grammar tips are short (2–4 sentences), French explanation of a German point, with a German example.
