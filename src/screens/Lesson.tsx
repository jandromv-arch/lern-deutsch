import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { course } from "../content/course";
import { buildLessonQueue } from "../engine/session";
import { SessionRunner, type SessionStats } from "./SessionRunner";
import { Summary } from "./Summary";

export function Lesson() {
  const { id } = useParams();
  const lesson = course.lessons.find((l) => l.id === id);
  const [done, setDone] = useState<SessionStats | null>(null);
  const steps = useMemo(() => (lesson ? buildLessonQueue(lesson.items) : []), [lesson]);
  const itemsById = useMemo(
    () => Object.fromEntries((lesson?.items ?? []).map((it) => [it.id, it])),
    [lesson]
  );
  if (!lesson) return <div className="p-6">Leçon introuvable.</div>;
  if (done) return <Summary stats={done} nextTo="/" />;
  return (
    <div key={lesson.id}>
      <h1 className="p-4 text-lg font-bold">{lesson.emoji} {lesson.title}</h1>
      <SessionRunner steps={steps} itemsById={itemsById} pool={lesson.items} onDone={setDone} />
    </div>
  );
}
