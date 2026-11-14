import { speak, isSpeechSupported } from "../engine/speech";

export function AudioButton({ text, className = "" }: { text: string; className?: string }) {
  if (!isSpeechSupported()) return null;
  return (
    <button type="button" aria-label="Écouter" onClick={() => speak(text)}
      className={`text-2xl ${className}`}>🔊</button>
  );
}
