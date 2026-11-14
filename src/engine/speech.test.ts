import { describe, it, expect, vi, beforeEach } from "vitest";
import { speak, isSpeechSupported } from "./speech";

describe("speech", () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  it("no-ops when unsupported", () => {
    delete (globalThis as any).speechSynthesis;
    expect(isSpeechSupported()).toBe(false);
    expect(() => speak("Hallo")).not.toThrow();
  });
  it("calls speechSynthesis.speak with a de utterance when supported", () => {
    const speakFn = vi.fn();
    (globalThis as any).speechSynthesis = { speak: speakFn, cancel: vi.fn(), getVoices: () => [] };
    (globalThis as any).SpeechSynthesisUtterance = class { lang = ""; text = ""; constructor(t: string){ this.text = t; } };
    speak("Hallo");
    expect(speakFn).toHaveBeenCalledTimes(1);
    const utt = speakFn.mock.calls[0][0];
    expect(utt.text).toBe("Hallo");
    expect(utt.lang).toBe("de-DE");
  });
});
