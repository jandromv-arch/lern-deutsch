import { playAudio, hasClip } from "../engine/audio";
import { isSpeechSupported } from "../engine/speech";

export function AudioButton({ text, className = "" }: { text: string; className?: string }) {
  if (!hasClip(text) && !isSpeechSupported()) return null;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <button type="button" aria-label="Écouter" onClick={() => playAudio(text)} className="text-2xl">🔊</button>
      <button type="button" aria-label="Écouter lentement" onClick={() => playAudio(text, { slow: true })} className="text-base opacity-70">🐢</button>
    </span>
  );
}
