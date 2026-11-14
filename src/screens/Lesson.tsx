import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { course } from "../content/course";
import { buildLessonQueue } from "../engine/session";
import type { Lesson as Lesson_ } from "../content/types";
import { useProgress } from "../store/useProgress";
import { isMastered } from "../engine/leitner";
import { SessionRunner, type SessionStats } from "./SessionRunner";
import { Summary } from "./Summary";

export function Lesson() {
  const { id } = useParams();
  const lesson = course.lessons.find((l) => l.id === id);
  if (!lesson) return <div className="p-6">Leçon introuvable.</div>;
  // Keyed on lesson id so navigating between lessons remounts and resets state.
  return <LessonView key={lesson.id} lesson={lesson} />;
}

function LessonView({ lesson }: { lesson: Lesson_ }) {
  const [done, setDone] = useState<SessionStats | null>(null);
  const steps = useMemo(() => buildLessonQueue(lesson.items), [lesson]);
  const itemsById = useMemo(
    () => Object.fromEntries(lesson.items.map((it) => [it.id, it])),
    [lesson]
  );
  const finish = (stats: SessionStats) => {
    const st = useProgress.getState();
    if (lesson.items.every((it) => st.items[it.id] && isMastered(st.items[it.id]))) {
      st.awardBadge("unite-terminee");
    }
    setDone(stats);
  };
  if (done) return <Summary stats={done} nextTo="/" itemIds={lesson.items.map((it) => it.id)} />;
  return (
    <div>
      <h1 className="p-4 text-lg font-bold">{lesson.emoji} {lesson.title}</h1>
      <SessionRunner steps={steps} itemsById={itemsById} pool={lesson.items} onDone={finish} />
    </div>
  );
}
