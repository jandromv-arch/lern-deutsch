import type { VocabItem } from "../content/types";

const GENDER_CLASS: Record<string, string> = {
  der: "text-der", die: "text-die", das: "text-das",
};

export function GenderWord({ item, className = "" }: { item: VocabItem; className?: string }) {
  const color = item.gender ? GENDER_CLASS[item.gender] : "";
  return <span className={`font-semibold ${color} ${className}`}>{item.de}</span>;
}
