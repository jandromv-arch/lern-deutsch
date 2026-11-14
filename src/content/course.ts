import type { Course } from "./types";
import { salutations } from "./lessons/salutations";
import { cafe } from "./lessons/cafe";
import { nombres } from "./lessons/nombres";
import { famille } from "./lessons/famille";
import { maison } from "./lessons/maison";
import { nourriture } from "./lessons/nourriture";
import { vetements } from "./lessons/vetements";
import { temps } from "./lessons/temps";
import { directions } from "./lessons/directions";
import { travail } from "./lessons/travail";
import { voyage } from "./lessons/voyage";
import { corps } from "./lessons/corps";
import { loisirs } from "./lessons/loisirs";
import { verbes } from "./lessons/verbes";
import { phrases } from "./lessons/phrases";

export const course: Course = {
  id: "de-fr-a1",
  from: "fr",
  to: "de",
  lessons: [
    salutations, cafe, nombres, famille, maison, nourriture, vetements,
    temps, directions, travail, voyage, corps, loisirs, verbes, phrases,
  ],
};
