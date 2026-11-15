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
