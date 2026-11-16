import type { Course } from "./types";
import type { Dialogue } from "./dialogueTypes";
import { enSalutations } from "./en/salutations";
import { enCafe } from "./en/cafe";
import { enNombres } from "./en/nombres";
import { enFamille } from "./en/famille";
import { enNourriture } from "./en/nourriture";

export const courseEn: Course = {
  id: "fr-en-a1",
  from: "fr",
  to: "en",
  lessons: [enSalutations, enCafe, enNombres, enFamille, enNourriture],
};

export const dialoguesEn: Dialogue[] = [
  {
    id: "en-cafe",
    title: "At the café",
    emoji: "☕",
    lines: [
      { speaker: "Waiter", de: "Good morning! What would you like?", fr: "Bonjour ! Que désirez-vous ?" },
      { speaker: "Anna", de: "Good morning. I'd like a coffee, please.", fr: "Bonjour. Je voudrais un café, s'il vous plaît." },
      { speaker: "Waiter", de: "Would you like some milk?", fr: "Voulez-vous du lait ?" },
      { speaker: "Anna", de: "Yes, please. And a piece of cake.", fr: "Oui, s'il vous plaît. Et une part de gâteau." },
      { speaker: "Waiter", de: "Of course. Anything else?", fr: "Bien sûr. Autre chose ?" },
      { speaker: "Anna", de: "No, thank you. How much is it?", fr: "Non, merci. Combien ça coûte ?" },
      { speaker: "Waiter", de: "That's six euros, please.", fr: "Ça fait six euros, s'il vous plaît." },
      { speaker: "Anna", de: "Here you are. Thank you!", fr: "Tenez. Merci !" },
      { speaker: "Waiter", de: "You're welcome. Enjoy your coffee!", fr: "De rien. Profitez bien de votre café !" },
    ],
  },
  {
    id: "en-presenter",
    title: "Introducing yourself",
    emoji: "🤝",
    lines: [
      { speaker: "Tom", de: "Hi! My name is Tom. What's your name?", fr: "Salut ! Je m'appelle Tom. Comment t'appelles-tu ?" },
      { speaker: "Marie", de: "Hello, Tom. I'm Marie. Nice to meet you.", fr: "Bonjour, Tom. Je suis Marie. Enchantée." },
      { speaker: "Tom", de: "Nice to meet you too. Where are you from?", fr: "Enchanté aussi. D'où viens-tu ?" },
      { speaker: "Marie", de: "I'm from France. And you?", fr: "Je viens de France. Et toi ?" },
      { speaker: "Tom", de: "I'm from London, but I live in Paris now.", fr: "Je viens de Londres, mais j'habite à Paris maintenant." },
      { speaker: "Marie", de: "Oh, that's great! Do you like it?", fr: "Oh, c'est super ! Ça te plaît ?" },
      { speaker: "Tom", de: "Yes, I love it. I have a French girlfriend.", fr: "Oui, j'adore. J'ai une petite amie française." },
      { speaker: "Marie", de: "That's lovely. Well, see you later!", fr: "C'est charmant. Bon, à plus tard !" },
    ],
  },
];
