import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { playCorrect } from "./sfx";

const g = globalThis as any;
const saved = {
  AudioContext: g.AudioContext,
  webkitAudioContext: g.webkitAudioContext,
};

function restoreGlobal(key: keyof typeof saved) {
  if (saved[key] === undefined) delete g[key];
  else g[key] = saved[key];
}

// Shared spy so any oscillator created through any context (including a cached singleton) is observable.
const createOscillator = vi.fn();

function mockAudio() {
  const osc = { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { value: 0 }, type: "sine" };
  const gain = { connect: vi.fn(), gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } };
  createOscillator.mockImplementation(() => osc);
  const ctx = { createOscillator, createGain: () => gain, destination: {}, currentTime: 0, state: "running", resume: vi.fn() };
  g.AudioContext = vi.fn(function () { return ctx; });
  return { osc };
}

describe("sfx", () => {
  beforeEach(() => { createOscillator.mockClear(); });
  afterEach(() => {
    restoreGlobal("AudioContext");
    restoreGlobal("webkitAudioContext");
  });

  it("plays a tone for correct without throwing", () => {
    const { osc } = mockAudio();
    expect(() => playCorrect()).not.toThrow();
    expect(osc.start).toHaveBeenCalled();
  });

  it("no-ops when AudioContext missing", async () => {
    // Fresh module instance so the singleton cached by the previous test is not reused.
    vi.resetModules();
    delete g.AudioContext;
    delete g.webkitAudioContext;
    const sfx = await import("./sfx");
    expect(() => sfx.playWrong()).not.toThrow();
    expect(createOscillator).not.toHaveBeenCalled();
  });
});
