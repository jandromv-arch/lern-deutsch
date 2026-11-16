# Local Profiles + Multi-language — Design Spec

**Date:** 2026-11-16
**Status:** Approved (local profiles, no backend; add English as 2nd language)
**Builds on:** the full app (29 German lessons A1/A2/B1, grammar, dialogues, neural audio, exercises).

## Overview
Add **local accounts/profiles** (no backend, all localStorage) and make the app
**multi-language**: each profile picks a target language + starting level, and its
progress is saved separately per profile and per language. Ship **German** (full)
+ **English** (starter set) with neural audio. UI stays in **French** (learner is
French-speaking).

## Principles
- No backend, no Supabase: profiles + progress live in localStorage on the device.
- Minimal churn: keep the `VocabItem.de` field name as the generic "target text"
  (do NOT rename across 29 files); `gender` stays German-only (null for English,
  GenderWord just renders plain). Engines/components keep using `item.de`.
- Reuse existing engines/components; swap WHICH course/dialogues/progress is active.

## Feature 1 — Languages registry
`src/content/languages.ts`:
```ts
export interface LanguageDef {
  id: string;        // "de" | "en"
  label: string;     // "Allemand" | "Anglais"
  flag: string;      // "🇩🇪" | "🇬🇧"
  course: Course;
  dialogues: Dialogue[];
}
export const LANGUAGES: LanguageDef[];           // [de, en]
export function getLanguage(id: string): LanguageDef;  // default to "de"
```
- German = the existing `course` + `dialogues`.
- English = new `courseEn` + `dialoguesEn` (Feature 4).
- A hook `useActiveContent()` returns the active profile's language content
  (course + dialogues). Screens read from it instead of importing `course`/
  `dialogues` directly.

## Feature 2 — Account/profiles store
`src/store/useAccount.ts` (persist key `lern-accounts-v1`):
```ts
type Profile = { id: string; name: string; lang: string; level: Level; createdAt: string };
interface AccountState {
  profiles: Profile[];
  activeId: string | null;
  active(): Profile | null;
  createProfile(name: string, lang: string, level: Level): string; // sets active
  setActive(id: string): void;
  setLang(id: string, lang: string): void;   // change a profile's target language
  removeProfile(id: string): void;
}
```
Whenever the active profile or its lang changes, call
`useProgress.getState().setContext(profileId, lang)` so the progress store swaps
to that slice.

## Feature 3 — Progress namespaced per profile × language
Rework `src/store/useProgress.ts` (persist key stays `lern-deutsch-v1`, bump to
version 3) to hold MANY progress slices, keyed by `${profileId}:${lang}`:
```ts
type Slice = { items, xp, streak, badges, consecutiveCorrect, daily }; // the old per-learner state
interface State {
  slices: Record<string, Slice>;
  activeKey: string;                 // `${profileId}:${lang}`
  // Mirror of the active slice (keeps the existing component API unchanged):
  items; xp; streak; badges; consecutiveCorrect; daily;
  // global device settings (NOT per slice):
  dailyGoal; soundOn; themePref; reminderTime;
  // actions:
  setContext(profileId: string, lang: string): void; // save current → slices[old], load slices[key] (or fresh) → mirror
  // existing actions unchanged in signature; each also writes the mirror back into slices[activeKey]:
  addAnswer, recordItem, startSession, reset, answeredToday, masteredCount, dueItemIds,
  setDailyGoal, setSoundOn, setThemePref, setReminderTime, awardBadge;
}
```
- Keeping the mirror fields (items/xp/…) means Home/Progress/SessionRunner/etc.
  keep working with no call-site changes.
- `setContext` persists the current mirror into `slices[oldKey]`, then loads
  `slices[newKey]` (or a fresh slice) into the mirror and sets `activeKey`.
- Every mutating action updates the mirror AND `slices[activeKey]`.
- **Migration (v2 → v3):** an existing user has a single-slice v2 state
  (items/xp/… at top level, no `slices`). migrate wraps it as the default
  profile's German slice: `slices = { "<defaultProfileId>:de": {items,xp,...} }`,
  `activeKey = "<defaultProfileId>:de"`, mirror = that slice, keep settings.
  (The default profile id is created by the account store's own migration, or a
  constant like `"p-default"`; useAccount seeds a "Moi" profile for legacy users.)

## Feature 4 — Onboarding + profile switcher
- `src/screens/Onboarding.tsx`: shown by the app root when `profiles.length === 0`.
  Three steps: (1) name (text), (2) pick a language (cards from LANGUAGES with
  flag+label), (3) pick a starting level (A1/A2/B1). On finish: `createProfile`,
  which sets it active and sets the progress context. French copy.
- App root (`App.tsx` or a wrapper): if no active profile → render Onboarding;
  else render the normal routed app.
- **Profile switcher**: a small control (e.g. in Progrès header, or a "Profils"
  entry): lists profiles (name + language flag), tap to switch (setActive +
  setContext), a "＋ Nouveau profil" that runs onboarding again, and switch the
  active profile's language (a language picker that calls setLang + setContext).
  Keep it simple and French.

## Feature 5 — English starter content
- `src/content/en/` : ~5 English lessons (French→English, level A1), e.g.
  Salutations, Au café, Les nombres, La famille, La nourriture — ~20 items each,
  `de` field = the English word/phrase (generic target text), `gender: null`,
  French `fr`, examples in English + French. + 2 English dialogues. Optional 1-2
  grammarTips (English grammar in French). Assemble `courseEn` (level "A1") +
  `dialoguesEn`; register in LANGUAGES.
- Validator reuse: validateCourse works (gender null is fine; the der/die/das
  prefix rule only triggers for German-looking prefixes, which English lacks).

## Feature 6 — Audio for English (+ combined manifest)
- One combined `audioManifest.json` keyed by exact text (German and English
  strings never collide). The extractor reads ALL languages' content.
- The controller generates English clips with Piper's English voice
  (`en_US-...-high`) into `public/audio/<hash>.m4a` + `.slow.m4a`, same pipeline,
  and merges the manifest. German clips already exist. `audio.ts` is unchanged
  (text → hash → m4a).
- gen_audio.py gains a per-run voice via `PIPER_MODEL`; the extractor tags each
  string with its language so the controller runs the right model per language.

## Architecture / modules
```
src/content/languages.ts         # registry + getLanguage
src/content/en/*.ts, en.ts       # English course + dialogues
src/store/useAccount.ts          # profiles
src/store/useProgress.ts         # reworked: slices + setContext + migration
src/hooks/useActiveContent.ts    # active course/dialogues
src/screens/Onboarding.tsx, ProfileSwitcher
+ edits: App root (onboarding gate), Home/Lesson/Review/Daily/Dialogue/Grammar/Progress
         (read active content), scripts/extract-de.ts (all langs), gen_audio.py (voice)
```

## Error handling / edge cases
- No profiles → onboarding (never a blank app).
- Switching profile/language mid-session is not expected; the drawers snapshot
  their queues on mount (already the pattern), so a switch takes effect on the
  next screen.
- Legacy (v2) users: migrated into a seeded "Moi" profile learning German, with
  all their progress intact.
- A profile's language with no content → shouldn't happen (only registered langs
  are selectable).

## Testing
- useAccount: create/switch/setLang/remove; active().
- useProgress: setContext swaps slices; progress isolated per key; migration from
  a v2 blob; existing behavior (addAnswer/recordItem/daily/badges) unchanged on
  the active slice.
- languages/getLanguage; useActiveContent returns the right course.
- Onboarding: completing it creates a profile and enters the app.
- English content validator passes.

## Out of scope (later / Phase B)
Full English course beyond the starter, more languages (ES/IT), cloud sync/real
accounts, per-profile settings (sound/theme stay global).
