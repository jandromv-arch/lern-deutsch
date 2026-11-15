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
import { a2Restaurant } from "./lessons/a2-restaurant";
import { a2Sante } from "./lessons/a2-sante";
import { a2Travail2 } from "./lessons/a2-travail2";
import { a2Voyage2 } from "./lessons/a2-voyage2";
import { a2Maison2 } from "./lessons/a2-maison2";
import { a2Loisirs2 } from "./lessons/a2-loisirs2";
import { a2Emotions } from "./lessons/a2-emotions";
import { a2Ville } from "./lessons/a2-ville";
import { b1Travail3 } from "./lessons/b1-travail3";
import { b1Actualite } from "./lessons/b1-actualite";
import { b1Environnement } from "./lessons/b1-environnement";
import { b1Opinions } from "./lessons/b1-opinions";
import { b1Culture } from "./lessons/b1-culture";
import { b1Abstrait } from "./lessons/b1-abstrait";

export const course: Course = {
  id: "de-fr-a1",
  from: "fr",
  to: "de",
  lessons: [
    salutations, cafe, nombres, famille, maison, nourriture, vetements,
    temps, directions, travail, voyage, corps, loisirs, verbes, phrases,
    a2Restaurant, a2Sante, a2Travail2, a2Voyage2, a2Maison2, a2Loisirs2, a2Emotions, a2Ville,
    b1Travail3, b1Actualite, b1Environnement, b1Opinions, b1Culture, b1Abstrait,
  ],
};
