import manifest from "../content/audioManifest.json";
import { speak } from "./speech";

const map = manifest as Record<string, string>;
const BASE = import.meta.env.BASE_URL;
const SLOW_RATE = 0.7;

// iOS Safari only lets ONE <audio> element play, and only after the first
// element has been started inside a user gesture. Creating `new Audio()` per
// tap is unreliable there (play() rejects → it fell back to the robotic voice).
// Reuse a single element: the first tap unlocks it, every later tap reuses it.
let el: HTMLAudioElement | null = null;
function getEl(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (!el) {
    el = new Audio();
    el.preload = "auto";
  }
  return el;
}

export function hasClip(text: string): boolean {
  return Object.hasOwn(map, text?.trim());
}

export function clipUrl(text: string, slow = false): string | null {
  const key = text?.trim();
  if (!key || !Object.hasOwn(map, key)) return null;
  return `${BASE}audio/${map[key]}${slow ? ".slow" : ""}.mp3`;
}

export function playAudio(text: string, opts: { slow?: boolean } = {}): void {
  const slow = !!opts.slow;
  // One-shot: onerror and a play() rejection can both fire for the same clip.
  let fellBack = false;
  const fb = () => {
    if (fellBack) return;
    fellBack = true;
    if (slow) speak(text, "de-DE", SLOW_RATE);
    else speak(text);
  };
  const url = clipUrl(text, slow);
  if (!url) { fb(); return; }
  const a = getEl();
  if (!a) { fb(); return; }
  try {
    a.pause();
    a.src = url;
    a.currentTime = 0;
    a.onerror = fb;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(fb);
  } catch { fb(); }
}
