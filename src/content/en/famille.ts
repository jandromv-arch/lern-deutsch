import type { Lesson } from "../types";
import { items } from "./util";

export const enFamille: Lesson = {
  id: "en-famille",
  title: "La famille",
  emoji: "👨‍👩‍👧",
  level: "A1",
  grammarTip: {
    title: "Le possessif : « my, your, his, her »",
    body: "Les adjectifs possessifs anglais s'accordent avec le possesseur, pas avec l'objet possédé : my (mon/ma/mes), your (ton/ta/tes), his (son/sa/ses, d'un homme), her (son/sa/ses, d'une femme), our, their. Exemple : « his sister » (la sœur de lui) mais « her brother » (le frère d'elle). On peut aussi utiliser « 's » : « Anna's mother ».",
  },
  items: items("en-famille", [
    ["the family", "la famille", "I love my family.", "J'aime ma famille."],
    ["the mother", "la mère", "My mother is a teacher.", "Ma mère est professeure."],
    ["the father", "le père", "My father works in London.", "Mon père travaille à Londres."],
    ["the parents", "les parents", "My parents live in Paris.", "Mes parents habitent à Paris."],
    ["the brother", "le frère", "My brother is twelve.", "Mon frère a douze ans."],
    ["the sister", "la sœur", "I have one sister.", "J'ai une sœur."],
    ["the son", "le fils", "Their son is a doctor.", "Leur fils est médecin."],
    ["the daughter", "la fille", "She has a daughter.", "Elle a une fille."],
    ["the child", "l'enfant", "The child is playing.", "L'enfant est en train de jouer."],
    ["the children", "les enfants", "They have two children.", "Ils ont deux enfants."],
    ["the grandmother", "la grand-mère", "My grandmother lives in the countryside.", "Ma grand-mère habite à la campagne."],
    ["the grandfather", "le grand-père", "My grandfather is eighty.", "Mon grand-père a quatre-vingts ans."],
    ["the uncle", "l'oncle", "My uncle lives in Spain.", "Mon oncle habite en Espagne."],
    ["the aunt", "la tante", "My aunt is very kind.", "Ma tante est très gentille."],
    ["the cousin", "le cousin, la cousine", "My cousin is the same age as me.", "Mon cousin a le même âge que moi."],
    ["the husband", "le mari", "Her husband is Italian.", "Son mari est italien."],
    ["the wife", "la femme, l'épouse", "His wife is a nurse.", "Sa femme est infirmière."],
    ["the baby", "le bébé", "The baby is sleeping.", "Le bébé dort."],
    ["the friend", "l'ami, l'amie", "He is my best friend.", "C'est mon meilleur ami."],
    ["the boy", "le garçon", "The boy is eight.", "Le garçon a huit ans."],
    ["the girl", "la fille (enfant)", "The girl is reading a book.", "La fille lit un livre."],
  ]),
};
