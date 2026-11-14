import type { Course } from "./types";

const VALID_GENDERS = new Set(["der", "die", "das", null]);

export function validateCourse(course: Course): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const lesson of course.lessons) {
    if (!lesson.items.length) errors.push(`lesson ${lesson.id} has no items`);
    for (const item of lesson.items) {
      if (seen.has(item.id)) errors.push(`duplicate item id: ${item.id}`);
      seen.add(item.id);
      if (!item.de.trim()) errors.push(`item ${item.id} missing de`);
      if (!item.fr.trim()) errors.push(`item ${item.id} missing fr`);
      if (item.gender !== undefined && !VALID_GENDERS.has(item.gender))
        errors.push(`item ${item.id} invalid gender: ${item.gender}`);
    }
  }
  return errors;
}
