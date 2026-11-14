type AudioCtor = new () => AudioContext;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (ctx) {
      if (ctx.state === "suspended") void ctx.resume();
      return ctx;
    }
    const w = globalThis as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (typeof Ctor !== "function") return null;
    ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, startOffset: number, dur: number): void {
  const c = getCtx();
  if (!c) return;
  try {
    const t0 = c.currentTime + startOffset;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  } catch {
    /* no-op */
  }
}

/** Rising two-tone chime for a correct answer. Never throws. */
export function playCorrect(): void {
  tone(660, 0, 0.12);
  tone(880, 0.1, 0.18);
}

/** Low single tone for a wrong answer. Never throws. */
export function playWrong(): void {
  tone(160, 0, 0.3);
}
