import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../content/audioManifest.json", () => ({ default: { Hallo: "abcd1234abcd1234" } }));
vi.mock("./speech", () => ({ speak: vi.fn(), isSpeechSupported: () => true }));

import { speak } from "./speech";
import { hasClip, clipUrl, playAudio } from "./audio";

const playedSrcs: string[] = [];
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();
let lastInstance: FakeAudio | null = null;

// The engine reuses ONE Audio element (iOS requirement). The fake tracks every
// src assigned to it, so tests assert on what was played rather than on how many
// elements were constructed.
class FakeAudio {
  preload = "";
  currentTime = 0;
  onerror: (() => void) | null = null;
  play = play;
  pause = pause;
  private _src = "";
  get src() { return this._src; }
  set src(v: string) { this._src = v; playedSrcs.push(v); }
  constructor() { lastInstance = this; }
}

beforeEach(() => {
  playedSrcs.length = 0;
  play.mockClear();
  pause.mockClear();
  vi.mocked(speak).mockClear();
  (window as unknown as { Audio: unknown }).Audio = FakeAudio;
});

describe("audio engine", () => {
  it("hasClip", () => {
    expect(hasClip("Hallo")).toBe(true);
    expect(hasClip("Nope")).toBe(false);
  });
  it("clipUrl", () => {
    expect(clipUrl("Hallo")).toMatch(/audio\/abcd1234abcd1234\.mp3$/);
    expect(clipUrl("Hallo", true)).toMatch(/audio\/abcd1234abcd1234\.slow\.mp3$/);
    expect(clipUrl("Nope")).toBeNull();
  });
  it("plays the clip when present", () => {
    playAudio("Hallo");
    expect(playedSrcs.at(-1)).toMatch(/abcd1234abcd1234\.mp3$/);
    expect(play).toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });
  it("plays the slow clip and pauses before replaying", () => {
    playAudio("Hallo");
    pause.mockClear();
    playAudio("Hallo", { slow: true });
    expect(playedSrcs.at(-1)).toMatch(/\.slow\.mp3$/);
    expect(pause).toHaveBeenCalled();
  });
  it("speaks once when onerror and play rejection both fire", async () => {
    play.mockImplementationOnce(() => Promise.reject(new Error("x")));
    playAudio("Hallo");
    lastInstance?.onerror?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(speak).toHaveBeenCalledTimes(1);
  });
  it("slow fallback to speech uses the slow rate", () => {
    playAudio("Nope", { slow: true });
    expect(speak).toHaveBeenCalledWith("Nope", "de-DE", 0.7);
  });
  it("falls back to speech when no clip", () => {
    playAudio("Nope");
    expect(speak).toHaveBeenCalledWith("Nope");
    expect(playedSrcs).toHaveLength(0);
  });
  it("falls back to speech when play rejects", async () => {
    play.mockImplementationOnce(() => Promise.reject(new Error("x")));
    playAudio("Hallo");
    await Promise.resolve();
    await Promise.resolve();
    expect(speak).toHaveBeenCalledWith("Hallo");
  });
});
