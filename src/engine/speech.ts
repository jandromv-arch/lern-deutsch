export function isSpeechSupported(): boolean {
  return typeof globalThis !== "undefined" &&
    "speechSynthesis" in globalThis && typeof (globalThis as any).SpeechSynthesisUtterance === "function";
}
export function speak(text: string, lang = "de-DE"): void {
  if (!isSpeechSupported() || !text) return;
  try {
    const synth = (globalThis as any).speechSynthesis;
    synth.cancel();
    const u = new (globalThis as any).SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = (synth.getVoices?.() ?? []).find((x: any) => x.lang?.startsWith("de"));
    if (v) u.voice = v;
    synth.speak(u);
  } catch { /* no-op */ }
}
