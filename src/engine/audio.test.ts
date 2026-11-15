import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../content/audioManifest.json", () => ({ default: { Hallo: "abcd1234abcd1234" } }));
vi.mock("./speech", () => ({ speak: vi.fn(), isSpeechSupported: () => true }));

import { speak } from "./speech";
import { hasClip, clipUrl, playAudio, __resetAudioForTest } from "./audio";

const start = vi.fn();
const stop = vi.fn();
const connect = vi.fn();
const resume = vi.fn(() => Promise.resolve());
let decodeOk = true;
let fetchOk = true;
const fetchedUrls: string[] = [];

class FakeCtx {
  destination = {};
  resume = resume;
  createBufferSource() {
    return { buffer: null as unknown, connect, start, stop, onended: null as null | (() => void) };
  }
  decodeAudioData(_bytes: ArrayBuffer): Promise<AudioBuffer> {
    return decodeOk
      ? Promise.resolve({ duration: 1 } as AudioBuffer)
      : Promise.reject(new Error("decode"));
  }
}

const flush = async () => {
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
};

beforeEach(() => {
  __resetAudioForTest();
  decodeOk = true; fetchOk = true;
  fetchedUrls.length = 0;
  start.mockClear(); stop.mockClear(); connect.mockClear(); resume.mockClear();
  vi.mocked(speak).mockClear();
  (globalThis as unknown as { AudioContext: unknown }).AudioContext = FakeCtx;
  (globalThis as unknown as { fetch: unknown }).fetch = vi.fn((url: string) => {
    fetchedUrls.push(url);
    return fetchOk
      ? Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) })
      : Promise.reject(new Error("net"));
  });
});

afterEach(() => { vi.restoreAllMocks(); });

describe("audio engine (Web Audio)", () => {
  it("hasClip", () => {
    expect(hasClip("Hallo")).toBe(true);
    expect(hasClip("Nope")).toBe(false);
  });
  it("clipUrl normal + slow", () => {
    expect(clipUrl("Hallo")).toMatch(/audio\/abcd1234abcd1234\.mp3\?v=/);
    expect(clipUrl("Hallo", true)).toMatch(/audio\/abcd1234abcd1234\.slow\.mp3\?v=/);
    expect(clipUrl("Nope")).toBeNull();
  });
  it("decodes and plays the clip (no speech)", async () => {
    playAudio("Hallo");
    await flush();
    expect(fetchedUrls[0]).toMatch(/abcd1234abcd1234\.mp3\?v=/);
    expect(start).toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });
  it("fetches the slow clip for slow", async () => {
    playAudio("Hallo", { slow: true });
    await flush();
    expect(fetchedUrls[0]).toMatch(/\.slow\.mp3\?v=/);
    expect(start).toHaveBeenCalled();
  });
  it("falls back to speech when there is no clip", () => {
    playAudio("Nope");
    expect(speak).toHaveBeenCalledWith("Nope");
    expect(fetchedUrls).toHaveLength(0);
  });
  it("slow fallback uses the slow rate", () => {
    playAudio("Nope", { slow: true });
    expect(speak).toHaveBeenCalledWith("Nope", "de-DE", 0.7);
  });
  it("falls back to speech when fetch fails", async () => {
    fetchOk = false;
    playAudio("Hallo");
    await flush();
    expect(speak).toHaveBeenCalledWith("Hallo");
    expect(start).not.toHaveBeenCalled();
  });
  it("falls back to speech when decode fails", async () => {
    decodeOk = false;
    playAudio("Hallo");
    await flush();
    expect(speak).toHaveBeenCalledWith("Hallo");
  });
  it("falls back to speech when there is no AudioContext", () => {
    delete (globalThis as unknown as { AudioContext?: unknown }).AudioContext;
    delete (globalThis as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
    playAudio("Hallo");
    expect(speak).toHaveBeenCalledWith("Hallo");
  });
});
