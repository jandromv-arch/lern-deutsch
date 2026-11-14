import { useState } from "react";
import { course } from "../content/course";
import { buildDailyPlan } from "../engine/daily";
import { useProgress } from "../store/useProgress";
import { today } from "../app/today";
import { SessionRunner, type SessionStats } from "./SessionRunner";
import { Summary } from "./Summary";

export function Daily() {
  // Snapshot once on mount: answers mutate progress and would reshuffle the plan mid-session.
  const [snap] = useState(() => ({
    plan: buildDailyPlan(course, useProgress.getState(), today()),
    pool: course.lessons.flatMap((l) => l.items),
  }));
  const [done, setDone] = useState<SessionStats | null>(null);
  const { plan, pool } = snap;

  if (done) return <Summary stats={done} nextTo="/" itemIds={[...plan.reviewIds, ...plan.newIds]} />;
  if (!plan.steps.length)
    return <div className="p-8 text-center text-neutral-500">Rien pour aujourd'hui 🎉 Reviens demain !</div>;
  return <SessionRunner steps={plan.steps} itemsById={plan.itemsById} pool={pool} onDone={setDone} />;
}
