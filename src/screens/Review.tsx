import { useState } from "react";
import { course } from "../content/course";
import { buildReviewQueue } from "../engine/session";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { SessionRunner, type SessionStats } from "./SessionRunner";
import { Summary } from "./Summary";

export function Review() {
  // Snapshot the queue once on mount: answering advances dueDates, which would
  // otherwise shrink the due set mid-session and skip/unmount steps.
  const [snap] = useState(() => {
    const allItems = course.lessons.flatMap((l) => l.items);
    const st = useProgress.getState();
    // Only review items the learner has already started (exclude fully unseen).
    const dueIds = new Set(st.dueItemIds(Object.keys(st.items), today()));
    const dueItems = allItems.filter((it) => dueIds.has(it.id));
    return {
      allItems,
      dueCount: dueItems.length,
      steps: buildReviewQueue(dueItems),
      itemsById: Object.fromEntries(dueItems.map((it) => [it.id, it])),
    };
  });
  const [done, setDone] = useState<SessionStats | null>(null);

  if (done) return <Summary stats={done} nextTo="/" itemIds={Object.keys(snap.itemsById)} />;
  if (!snap.dueCount)
    return <div className="p-8 text-center text-neutral-500">Rien à réviser aujourd'hui 🎉</div>;
  // Steps come from due items only; distractors are drawn from the full course.
  return <SessionRunner steps={snap.steps} itemsById={snap.itemsById} pool={snap.allItems} onDone={setDone} />;
}
