import type { Lesson } from "../types";
import { items } from "./util";

export const enNombres: Lesson = {
  id: "en-nombres",
  title: "Les nombres",
  emoji: "🔢",
  level: "A1",
  items: items("en-nombres", [
    ["one", "un", "I have one brother.", "J'ai un frère."],
    ["two", "deux", "Two coffees, please.", "Deux cafés, s'il vous plaît."],
    ["three", "trois", "There are three books on the table.", "Il y a trois livres sur la table."],
    ["four", "quatre", "She has four cats.", "Elle a quatre chats."],
    ["five", "cinq", "The shop opens at five.", "Le magasin ouvre à cinq heures."],
    ["six", "six", "I wake up at six.", "Je me réveille à six heures."],
    ["seven", "sept", "There are seven days in a week.", "Il y a sept jours dans une semaine."],
    ["eight", "huit", "The lesson starts at eight.", "Le cours commence à huit heures."],
    ["nine", "neuf", "He is nine years old.", "Il a neuf ans."],
    ["ten", "dix", "I need ten minutes.", "J'ai besoin de dix minutes."],
    ["eleven", "onze", "There are eleven players in a football team.", "Il y a onze joueurs dans une équipe de football."],
    ["twelve", "douze", "A dozen means twelve.", "Une douzaine, c'est douze."],
    ["thirteen", "treize", "She is thirteen.", "Elle a treize ans."],
    ["fifteen", "quinze", "It costs fifteen euros.", "Ça coûte quinze euros."],
    ["twenty", "vingt", "I have twenty students.", "J'ai vingt élèves."],
    ["thirty", "trente", "The film lasts thirty minutes.", "Le film dure trente minutes."],
    ["fifty", "cinquante", "The book costs fifty euros.", "Le livre coûte cinquante euros."],
    ["one hundred", "cent", "There are one hundred people here.", "Il y a cent personnes ici."],
    ["one thousand", "mille", "The trip costs one thousand euros.", "Le voyage coûte mille euros."],
    ["zero", "zéro", "The temperature is zero degrees.", "La température est de zéro degré."],
    ["first", "premier", "This is my first lesson.", "C'est mon premier cours."],
    ["second", "deuxième", "He lives on the second floor.", "Il habite au deuxième étage."],
  ]),
};
