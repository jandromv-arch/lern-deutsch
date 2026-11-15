import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../content/audioManifest.json", () => ({ default: { Hallo: "abcd1234abcd1234" } }));
vi.mock("./speech", () => ({ speak: vi.fn(), isSpeechSupported: () => true }));

import { speak } from "./speech";
import { hasClip, clipUrl, playAudio } from "./audio";

const created: string[] = [];
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

const instances: FakeAudio[] = [];

class FakeAudio {
  onerror: (() => void) | null = null;
  play = play;
  pause = pause;
  constructor(url: string) { created.push(url); instances.push(this); }
}

beforeEach(() => {
  created.length = 0;
  instances.length = 0;
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
    expect(created).toHaveLength(1);
    expect(created[0]).toMatch(/abcd1234abcd1234\.mp3$/);
    expect(play).toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });
  it("plays the slow clip and pauses the previous one", () => {
    playAudio("Hallo");
    pause.mockClear();
    playAudio("Hallo", { slow: true });
    expect(created[1]).toMatch(/\.slow\.mp3$/);
    expect(pause).toHaveBeenCalled();
  });
  it("speaks once when onerror and play rejection both fire", async () => {
    play.mockImplementationOnce(() => Promise.reject(new Error("x")));
    playAudio("Hallo");
    instances[0].onerror?.();
    await Promise.resolve(); await Promise.resolve();
    expect(speak).toHaveBeenCalledTimes(1);
  });
  it("slow fallback to speech uses the slow rate", () => {
    playAudio("Nope", { slow: true });
    expect(speak).toHaveBeenCalledWith("Nope", "de-DE", 0.7);
  });
  it("falls back to speech when no clip", () => {
    playAudio("Nope");
    expect(speak).toHaveBeenCalledWith("Nope");
    expect(created).toHaveLength(0);
  });
  it("falls back to speech when play rejects", async () => {
    play.mockImplementationOnce(() => Promise.reject(new Error("x")));
    playAudio("Hallo");
    await Promise.resolve(); await Promise.resolve();
    expect(speak).toHaveBeenCalledWith("Hallo");
  });
});
