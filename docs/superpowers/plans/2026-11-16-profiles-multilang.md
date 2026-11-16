# Local Profiles + Multi-language — Implementation Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.
> Read the spec: docs/superpowers/specs/2026-11-16-profiles-multilang-design.md

**Goal:** Local profiles (no backend) + multi-language (German full + English starter), progress per profile×language, onboarding + switcher.

## Global Constraints
- No backend; everything in localStorage. UI copy French. TypeScript strict, dark-aware, TDD for logic.
- Do NOT rename `VocabItem.de` (it is the generic target-text key); `gender` stays German-only (null for English). Engines/components keep using `item.de`.
- Keep `course.lessons` flat/ordered within a language. Reuse engines/components; only swap which content/progress is active.
- Audio: one combined manifest keyed by text; `src/engine/audio.ts` unchanged. Don't touch audio.ts.

---

### Task 1: Languages registry + active-content hook + screens read active content

**Files:** Create `src/content/languages.ts`, `src/hooks/useActiveContent.ts`; Modify screens that import `course`/`dialogues` directly: `src/screens/{Home,Lesson,Review,Daily,DialoguePlay,Dialogue,Grammar,Progress}.tsx` and `src/engine/daily.ts` call sites. Tests: `src/content/languages.test.ts`.

**Interfaces — Produces:**
- `interface LanguageDef { id: string; label: string; flag: string; course: Course; dialogues: Dialogue[] }`
- `export const LANGUAGES: LanguageDef[]` — for now just German: `{ id:"de", label:"Allemand", flag:"🇩🇪", course, dialogues }` (English added in Task 4).
- `export function getLanguage(id: string): LanguageDef` — returns the match or LANGUAGES[0].
- `export function useActiveContent(): { lang: string; course: Course; dialogues: Dialogue[] }` — reads the active profile's lang (from useAccount; until Task 2 exists, default to "de") via `getLanguage`.

- [ ] **Step 1: languages.ts** — registry + getLanguage (German only for now). Test: getLanguage("de") returns the German course; getLanguage("xx") falls back to LANGUAGES[0].
- [ ] **Step 2: useActiveContent hook** — until useAccount exists, return getLanguage("de"). (Task 2 wires the real active lang; keep the hook as the single seam so Task 2 only edits the hook.)
- [ ] **Step 3: Refactor screens** — replace every direct `import { course } from "../content/course"` / `import { dialogues } ...` in the listed screens with `const { course, dialogues } = useActiveContent()`. For `daily.ts` (a pure engine that takes `course` as a param already — CHECK: Daily.tsx passes course in), ensure Daily.tsx passes the active course. Do not change engine signatures.
- [ ] **Step 4:** `npm run test` + `npm run build` green. Commit `feat: language registry + active-content hook (German)`.

---

### Task 2: Account store + progress reworked per profile×language

**Files:** Create `src/store/useAccount.ts`, `src/store/useAccount.test.ts`; Modify `src/store/useProgress.ts`, `src/store/useProgress*.test.ts`, and `src/hooks/useActiveContent.ts` (wire real active lang). 

**Interfaces — Produces:**
- useAccount (persist `lern-accounts-v1`): `profiles: Profile[]` (`{id,name,lang,level,createdAt}`), `activeId`, `active()`, `createProfile(name,lang,level)→id` (sets active + calls useProgress.setContext), `setActive(id)` (+setContext), `setLang(id,lang)` (+setContext if active), `removeProfile(id)`.
- useProgress gains `slices: Record<string,Slice>`, `activeKey`, and `setContext(profileId, lang)`. Keep mirror fields (items,xp,streak,badges,consecutiveCorrect,daily) + existing actions; each mutating action also writes the mirror into `slices[activeKey]`.

- [ ] **Step 1: Failing tests (account)** — `useAccount.test.ts`: createProfile adds a profile, sets activeId, active() returns it; setActive switches; setLang changes lang; removeProfile removes (and clears activeId if it was active). 
- [ ] **Step 2: Implement useAccount** per spec. Persist. A migration/seed: if an existing install has useProgress v2 data but no profiles, seed one profile `{ id:"p-default", name:"Moi", lang:"de", level:"A1" }` and set it active. (Detect via a one-time check on first `active()`/init, or in useProgress migration coordinating the default id — keep the default id constant `"p-default"`.)
- [ ] **Step 3: Rework useProgress** (persist key stays `"lern-deutsch-v1"`, version 3):
  - Add `slices: Record<string, Slice>` and `activeKey: string` (default `"p-default:de"`).
  - `setContext(profileId, lang)`: `const key = profileId+":"+lang; if (key===activeKey) return; const cur = { items,xp,streak,badges,consecutiveCorrect,daily }; const nextSlices = { ...slices, [activeKey]: cur }; const loaded = nextSlices[key] ?? freshSlice(); set({ slices: nextSlices, activeKey: key, ...loaded });`
  - `freshSlice()` = the old `initial` learner fields.
  - Every mutating action (addAnswer, recordItem, startSession, reset, awardBadge): after computing the new mirror fields, also set `slices: { ...slices, [activeKey]: newMirror }`. Easiest: a small helper `commit(partialMirror)` that sets the mirror fields AND slices[activeKey].
  - `reset()` resets ONLY the active slice (mirror + slices[activeKey]); settings stay.
  - **migrate v2→v3:** if persisted has `items` but no `slices`: `const slice = pick(items,xp,streak,badges,consecutiveCorrect,daily); return { ...persisted, slices: { "p-default:de": slice }, activeKey: "p-default:de" };` (mirror already present from persisted). Keep settings.
  - Keep settings (dailyGoal, soundOn, themePref, reminderTime) global (top-level, not per slice).
- [ ] **Step 4: Tests (progress)** — setContext saves the old slice and loads/creates the new; progress on key A is isolated from key B; a v2 blob migrates into `slices["p-default:de"]` with xp/items intact; existing addAnswer/recordItem/daily/badge behavior still passes on the active slice. Update existing useProgress tests if they assumed a single slice (they operate on the mirror → should still pass; add `setContext` where needed).
- [ ] **Step 5: Wire useActiveContent** — read `useAccount().active()?.lang ?? "de"` → getLanguage.
- [ ] **Step 6:** `npm run test` + `npm run build` green. Commit `feat: local profiles + progress namespaced per profile and language`.

---

### Task 3: Onboarding + profile switcher + app gate

**Files:** Create `src/screens/Onboarding.tsx`, `src/components/ProfileSwitcher.tsx`, tests; Modify `src/app/App.tsx` (gate), and add the switcher to `src/screens/Progress.tsx` (or Home header).

- [ ] **Step 1: Onboarding** — 3 steps (name input → language cards from LANGUAGES with flag+label → level A1/A2/B1). On finish call `useAccount.createProfile(name, lang, level)`. French copy, dark-aware. Test: filling name + picking language + level + "Commencer" calls createProfile with those args.
- [ ] **Step 2: App gate** — in App.tsx (inside Router or above it), if `useAccount().profiles.length === 0` (or no active), render `<Onboarding/>` instead of the routed app. Once a profile exists, render the normal app.
- [ ] **Step 3: ProfileSwitcher** — lists profiles (name + lang flag), tap switches (setActive), a language picker for the active profile (setLang), and "＋ Nouveau profil" → onboarding flow (or a mini form). Place it in Progrès (a "Profil" section/header). French.
- [ ] **Step 4:** `npm run test` + `npm run build` green. Commit `feat: onboarding + profile switcher`.

---

### Task 4: English starter content (+ register in LANGUAGES)

**Files:** Create `src/content/en/*.ts` (lessons), `src/content/en.ts` (courseEn + dialoguesEn), tests; Modify `src/content/languages.ts` to register English.

- [ ] **Step 1:** Author 5 English A1 lessons (ids en-salutations/en-cafe/en-nombres/en-famille/en-nourriture), level "A1", ~20 items each. `de` field = English text (generic target), `gender: null`, `fr` = French, most with `example:{de:English, fr:French}`. Ids `en-<lesson>-NN` unique. Plus 2 English dialogues (`en-cafe`, `en-presenter`). Optional 1 grammarTip (English grammar in French).
- [ ] **Step 2:** Assemble `courseEn: Course` (id "fr-en-a1", from:"fr", to:"en", lessons with level:"A1") + `dialoguesEn`. Register in LANGUAGES as `{ id:"en", label:"Anglais", flag:"🇬🇧", course: courseEn, dialogues: dialoguesEn }`.
- [ ] **Step 3:** Test: validateCourse(courseEn) === []; validateDialogues(dialoguesEn) === []; getLanguage("en") returns courseEn; LANGUAGES has 2.
- [ ] **Step 4:** `npm run test` + `npm run build` green. Commit `feat: English starter content (5 lessons + 2 dialogues)`.

---

### Task 5 (controller): English audio + combined manifest
- Update `scripts/extract-de.ts` → extract from ALL languages (German + English) producing two lists (per language) or a tagged list.
- Controller generates: German already done; for English strings run Piper with the English voice (`en_US-...-high`, downloaded to scratchpad), via gen_audio.py (`PIPER_MODEL=en`), writing m4a into public/audio and MERGING into audioManifest.json (don't drop German entries).
- Verify a French→English word serves live; commit the new m4a + merged manifest.

### Task 6 (controller): build, verify, deploy
- Full `npm run test` + `npm run build`. Browser-verify: onboarding (new profile → pick English → A1), the app shows English lessons with audio, switching profiles/languages keeps progress separate.
- Merge to main, push to jandromv-arch, deploy, verify live.

## Notes
- The single seam for "active language" is `useActiveContent()`; screens must go through it, never import `course`/`dialogues` directly after Task 1.
- Progress isolation is the critical correctness property: test that answering in profile A / German does not change profile B / English.
- Settings (sound/theme/dailyGoal/reminder) stay global device prefs, not per profile.
