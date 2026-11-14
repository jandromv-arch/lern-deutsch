import { describe, it, expect, vi } from "vitest";
import { playCorrect, playWrong } from "./sfx";

function mockAudio() {
  const osc = { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { value: 0 }, type: "sine" };
  const gain = { connect: vi.fn(), gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } };
  const ctx = { createOscillator: () => osc, createGain: () => gain, destination: {}, currentTime: 0, state: "running", resume: vi.fn() };
  (globalThis as any).AudioContext = vi.fn(function () { return ctx; });
  return { osc, gain };
}
describe("sfx", () => {
  it("plays a tone for correct without throwing", () => {
    const { osc } = mockAudio();
    expect(() => playCorrect()).not.toThrow();
    expect(osc.start).toHaveBeenCalled();
  });
  it("no-ops when AudioContext missing", () => {
    delete (globalThis as any).AudioContext;
    expect(() => playWrong()).not.toThrow();
  });
});
