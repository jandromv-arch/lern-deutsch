import type { VocabItem } from "../content/types";
import { GenderWord } from "./GenderWord";
import { AudioButton } from "./AudioButton";

export function Flashcard({ item, onResult }: { item: VocabItem; pool: VocabItem[]; onResult: (c: boolean) => void }) {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="text-3xl flex items-center justify-center gap-2">
        <GenderWord item={item} />
        <AudioButton text={item.example ? `${item.de}. ${item.example.de}` : item.de} />
      </div>
      <div className="text-neutral-500">{item.fr}</div>
      {item.example && <div className="text-sm italic text-neutral-400">{item.example.de}<br />{item.example.fr}</div>}
      <div className="flex gap-3 pt-4">
        <button className="flex-1 py-3 rounded-xl bg-good text-white" onClick={() => onResult(true)}>Je savais 👍</button>
        <button className="flex-1 py-3 rounded-xl bg-bad text-white" onClick={() => onResult(false)}>Je ne savais pas</button>
      </div>
    </div>
  );
}
