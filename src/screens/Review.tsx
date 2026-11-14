import { useMemo, useState } from "react";
import { course } from "../content/course";
import { buildReviewQueue } from "../engine/session";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { SessionRunner, type SessionStats } from "./SessionRunner";
import { Summary } from "./Summary";

export function Review() {
  const allItems = useMemo(() => course.lessons.flatMap((l) => l.items), []);
  const dueFn = useProgress((s) => s.dueItemIds);
  const seen = useProgress((s) => s.items);
  const [done, setDone] = useState<SessionStats | null>(null);

  // Only review items the learner has already started (exclude fully unseen).
  const startedIds = Object.keys(seen);
  const dueIds = dueFn(startedIds, today());
  const dueItems = allItems.filter((it) => dueIds.includes(it.id));
  const steps = useMemo(() => buildReviewQueue(dueItems), [dueItems.length]);
  const itemsById = Object.fromEntries(dueItems.map((it) => [it.id, it]));

  if (done) return <Summary stats={done} nextTo="/" />;
  if (!dueItems.length)
    return <div className="p-8 text-center text-neutral-500">Rien à réviser aujourd'hui 🎉</div>;
  // Steps come from due items only; distractors are drawn from the full course.
  return <SessionRunner steps={steps} itemsById={itemsById} pool={allItems} onDone={setDone} />;
}
