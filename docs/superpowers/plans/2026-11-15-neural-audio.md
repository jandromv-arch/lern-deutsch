# Phase 1 — Neural Audio + Listening (Implementation Plan)

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Play pre-generated neural German audio (normal + slow) everywhere, with a speechSynthesis fallback, and add a listening exercise.

**Context:** Audio files are pre-generated locally by scripts/gen_audio.py (Piper, voice Thorsten) into `public/audio/<hash>.mp3` (normal) and `<hash>.slow.mp3` (slow). A manifest `src/content/audioManifest.json` maps each German string to its `<hash>` (16 hex chars). Example manifest entry: `"Hallo": "abc123…"`. The controller generates+commits those assets separately; the app code reads the manifest.

## Global Constraints
- Vite base is "/lern-deutsch/" → audio URL = `${import.meta.env.BASE_URL}audio/<hash>.mp3` (slow: `<hash>.slow.mp3`).
- If the manifest lacks a string (or the mp3 fails to load), fall back to `speak(text)` from src/engine/speech.ts. Never throw.
- Audio must NOT be precached by the service worker (keep install light) — do not add audio globs to the workbox config; it caches at runtime on first play (browser HTTP cache is fine).
- TypeScript strict, French copy, dark-aware, TDD for logic. Reuse existing components; don't regress SessionRunner.

---

### Task 1: Audio engine + AudioButton (normal + slow)

**Files:** Create `src/engine/audio.ts`, `src/engine/audio.test.ts`; Modify `src/components/AudioButton.tsx`, `src/components/AudioButton.test.tsx`.

**Interfaces — Produces:**
- `hasClip(text: string): boolean` — manifest has the text.
- `clipUrl(text: string, slow?: boolean): string | null` — the mp3 URL or null.
- `playAudio(text: string, opts?: { slow?: boolean }): void` — play the mp3 if present (pause any previous), else `speak(text)`; never throw.

- [ ] **Step 1: Failing test (engine)** — `src/engine/audio.test.ts`: mock `../content/audioManifest.json` (vi.mock) to `{ "Hallo": "abcd1234abcd1234" }`, mock `../engine/speech` (speak). Assert: `hasClip("Hallo")===true`, `hasClip("Nope")===false`; `clipUrl("Hallo")` ends with `audio/abcd1234abcd1234.mp3`, `clipUrl("Hallo", true)` ends with `.slow.mp3`, `clipUrl("Nope")===null`. For playAudio: stub `window.Audio` (a class with play=vi.fn() returning a resolved promise); `playAudio("Hallo")` constructs Audio with the url and calls play; `playAudio("Nope")` calls `speak("Nope")` and does not construct Audio.
- [ ] **Step 2: Run → FAIL**.
- [ ] **Step 3: Implement `src/engine/audio.ts`**:
```ts
import manifest from "../content/audioManifest.json";
import { speak } from "./speech";

const map = manifest as Record<string, string>;
const BASE = import.meta.env.BASE_URL;
let current: HTMLAudioElement | null = null;

export function hasClip(text: string): boolean {
  return !!map[text?.trim()];
}
export function clipUrl(text: string, slow = false): string | null {
  const key = map[text?.trim()];
  if (!key) return null;
  return `${BASE}audio/${key}${slow ? ".slow" : ""}.mp3`;
}
export function playAudio(text: string, opts: { slow?: boolean } = {}): void {
  const url = clipUrl(text, opts.slow);
  if (!url) { speak(text); return; }
  try {
    if (current) { current.pause(); current = null; }
    const a = new Audio(url);
    current = a;
    a.onerror = () => speak(text);
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => speak(text));
  } catch { speak(text); }
}
```
(Add `resolveJsonModule`/`allowImportingTsExtensions` is already on for JSON imports under Vite; if tsc complains about the JSON import, add `"resolveJsonModule": true` to tsconfig.app.json.)
- [ ] **Step 4: Run → PASS**.
- [ ] **Step 5: Failing test (AudioButton)** — update `src/components/AudioButton.test.tsx`: mock `../engine/audio` (playAudio, hasClip→true). Render `<AudioButton text="Hallo" />`; assert there is a normal play button (aria-label "Écouter") that calls `playAudio("Hallo")` and a slow button (aria-label "Écouter lentement") that calls `playAudio("Hallo", { slow: true })`.
- [ ] **Step 6: Run → FAIL**.
- [ ] **Step 7: Implement AudioButton** — render when `hasClip(text)` OR speech is supported:
```tsx
import { playAudio, hasClip } from "../engine/audio";
import { isSpeechSupported } from "../engine/speech";
export function AudioButton({ text, className = "" }: { text: string; className?: string }) {
  if (!hasClip(text) && !isSpeechSupported()) return null;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <button type="button" aria-label="Écouter" onClick={() => playAudio(text)} className="text-2xl">🔊</button>
      <button type="button" aria-label="Écouter lentement" onClick={() => playAudio(text, { slow: true })} className="text-base opacity-70">🐢</button>
    </span>
  );
}
```
Keep existing call sites working (they pass `text`; the extra slow button is additive).
- [ ] **Step 8: Run → PASS**; full `npm run test` + `npm run build` green. (The real manifest may be large; the build must still pass — if the JSON isn't present yet, create a placeholder `src/content/audioManifest.json` = `{}` so the import resolves; the controller overwrites it with the generated one.)
- [ ] **Step 9: Commit** `feat: neural audio playback with slow option + speech fallback`.

---

### Task 2: Listening exercise ("listen")

**Files:** Modify `src/engine/exercises.ts` (buildListen), `src/engine/session.ts` (rotation), `src/screens/SessionRunner.tsx` (render); Create `src/components/ListenExercise.tsx`, `src/components/ListenExercise.test.tsx`; extend `src/engine/exercises.type.test.ts` or a new test.

**Interfaces — Produces:**
- `ExerciseType` gains `"listen"`.
- `interface Listen { audioText: string; answer: string; options: string[] }`
- `buildListen(item: VocabItem, pool: VocabItem[], rand?): Listen` — audioText = item.de (the thing to HEAR), answer = item.fr, options = 4 French options incl. answer (same distractor logic as buildQcm, reuse it).
- `<ListenExercise item pool onResult />`.

- [ ] **Step 1: Failing test (engine)** — buildListen returns audioText=item.de, answer=item.fr, 4 unique French options incl answer (use a seeded rand like the exercises tests).
- [ ] **Step 2: Run → FAIL**.
- [ ] **Step 3: Implement buildListen** in exercises.ts (reuse the QCM distractor helper); add "listen" to the ExerciseType union.
- [ ] **Step 4: Run → PASS**.
- [ ] **Step 5: Failing test (component)** — mock `../engine/audio` (playAudio). Render `<ListenExercise item pool onResult />`; assert a play button exists and calling it triggers `playAudio(item.de)`; clicking the correct French option calls `onResult(true)`; a wrong option calls `onResult(false)`.
- [ ] **Step 6: Run → FAIL**.
- [ ] **Step 7: Implement `src/components/ListenExercise.tsx`** — a prominent 🔊 "Écouter" button (calls `playAudio(item.de)`) + a 🐢 slow button (`playAudio(item.de,{slow:true})`); it auto-plays once on mount (best-effort; wrap in try/catch, iOS may block until gesture); 4 French option buttons (built by buildListen) with good/bad feedback like Qcm (guard double-click). No German TEXT shown (it's a listening test) — only after answering may you reveal it (optional). French copy ("Qu'as-tu entendu ?"). Dark-aware.
- [ ] **Step 8: Rotation** — add "listen" to `REVIEW_TYPES` in session.ts (now qcm, fill, order, type, listen). Extend session.test.ts to assert the rotation can include "listen" and never "flashcard".
- [ ] **Step 9: SessionRunner** — add `listen: ListenExercise` to COMP + import. Keep handler logic intact.
- [ ] **Step 10: Run the new tests + full `npm run test` + `npm run build`** green.
- [ ] **Step 11: Commit** `feat: listening exercise (hear German, pick the meaning)`.

## Notes
- The listening exercise needs audio; since all vocab `de` strings are in the manifest, every item has a clip. If `hasClip(item.de)` is false, playAudio falls back to speech — still works.
- Don't precache audio in the SW. Leave vite-plugin-pwa workbox globs as they are (js/css/html/svg/png/woff2) — mp3 is intentionally excluded.
