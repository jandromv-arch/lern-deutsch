import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { speak, isSpeechSupported } from "./speech";

const g = globalThis as any;
const saved = {
  speechSynthesis: g.speechSynthesis,
  SpeechSynthesisUtterance: g.SpeechSynthesisUtterance,
};

function restoreGlobal(key: keyof typeof saved) {
  if (saved[key] === undefined) delete g[key];
  else g[key] = saved[key];
}

describe("speech", () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => {
    restoreGlobal("speechSynthesis");
    restoreGlobal("SpeechSynthesisUtterance");
  });

  it("no-ops when unsupported", () => {
    delete g.speechSynthesis;
    expect(isSpeechSupported()).toBe(false);
    expect(() => speak("Hallo")).not.toThrow();
  });

  it("calls speechSynthesis.speak with a de utterance when supported", () => {
    const speakFn = vi.fn();
    g.speechSynthesis = { speak: speakFn, cancel: vi.fn(), getVoices: () => [] };
    g.SpeechSynthesisUtterance = class { lang = ""; text = ""; constructor(t: string){ this.text = t; } };
    speak("Hallo");
    expect(speakFn).toHaveBeenCalledTimes(1);
    const utt = speakFn.mock.calls[0][0];
    expect(utt.text).toBe("Hallo");
    expect(utt.lang).toBe("de-DE");
  });

  it("cancels in-flight speech before speaking the new utterance", () => {
    const speakFn = vi.fn();
    const cancelFn = vi.fn();
    g.speechSynthesis = { speak: speakFn, cancel: cancelFn, getVoices: () => [] };
    g.SpeechSynthesisUtterance = class { lang = ""; text = ""; constructor(t: string){ this.text = t; } };
    speak("Hallo");
    expect(cancelFn).toHaveBeenCalledTimes(1);
    expect(speakFn).toHaveBeenCalledTimes(1);
    expect(cancelFn.mock.invocationCallOrder[0]).toBeLessThan(speakFn.mock.invocationCallOrder[0]);
  });

  it("sets the utterance voice to the matching de-DE voice", () => {
    const speakFn = vi.fn();
    const deVoice = { lang: "de-DE", name: "Anna" };
    g.speechSynthesis = { speak: speakFn, cancel: vi.fn(), getVoices: () => [{ lang: "en-US", name: "Alex" }, deVoice] };
    g.SpeechSynthesisUtterance = class { lang = ""; text = ""; voice: unknown = null; constructor(t: string){ this.text = t; } };
    speak("Hallo");
    const utt = speakFn.mock.calls[0][0];
    expect(utt.voice).toBe(deVoice);
  });
});
