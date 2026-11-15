export function isSpeechSupported(): boolean {
  return typeof globalThis !== "undefined" &&
    "speechSynthesis" in globalThis && typeof (globalThis as any).SpeechSynthesisUtterance === "function";
}
export function speak(text: string, lang = "de-DE", rate = 1): void {
  if (!isSpeechSupported() || !text) return;
  try {
    const synth = (globalThis as any).speechSynthesis;
    synth.cancel();
    const u = new (globalThis as any).SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    const prefix = lang.slice(0, 2);
    const v = (synth.getVoices?.() ?? []).find((x: any) => x.lang?.startsWith(prefix));
    if (v) u.voice = v;
    synth.speak(u);
  } catch { /* no-op */ }
}
