import manifest from "../content/audioManifest.json";
import { speak } from "./speech";

const map = manifest as Record<string, string>;
const BASE = import.meta.env.BASE_URL;
const SLOW_RATE = 0.7;
let current: HTMLAudioElement | null = null;

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
  try {
    if (current) { current.pause(); current = null; }
    const a = new Audio(url);
    current = a;
    a.onerror = fb;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(fb);
  } catch { fb(); }
}
