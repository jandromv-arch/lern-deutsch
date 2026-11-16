import type { Lesson } from "../types";
import { items } from "./util";

export const enCafe: Lesson = {
  id: "en-cafe",
  title: "Au café",
  emoji: "☕",
  level: "A1",
  grammarTip: {
    title: "Les articles « a / an » et « the »",
    body: "« a » (un, une) s'utilise devant un son consonne : « a coffee », « a table ». « an » s'utilise devant un son voyelle : « an apple », « an orange ». « the » (le, la, les) ne change jamais, au singulier comme au pluriel : « the coffee », « the cups ». Exemple : « I'd like a tea and an orange juice. »",
  },
  items: items("en-cafe", [
    ["the coffee", "le café", "I'd like a coffee, please.", "Je voudrais un café, s'il vous plaît."],
    ["the tea", "le thé", "A cup of tea, please.", "Une tasse de thé, s'il vous plaît."],
    ["the milk", "le lait", "Do you want milk in your coffee?", "Voulez-vous du lait dans votre café ?"],
    ["the sugar", "le sucre", "No sugar, thank you.", "Pas de sucre, merci."],
    ["the water", "l'eau", "Can I have a glass of water?", "Puis-je avoir un verre d'eau ?"],
    ["the orange juice", "le jus d'orange", "An orange juice, please.", "Un jus d'orange, s'il vous plaît."],
    ["the cake", "le gâteau", "The cake is delicious.", "Le gâteau est délicieux."],
    ["the sandwich", "le sandwich", "I'd like a ham sandwich.", "Je voudrais un sandwich au jambon."],
    ["the cup", "la tasse", "This cup is hot.", "Cette tasse est chaude."],
    ["the glass", "le verre", "A glass of water, please.", "Un verre d'eau, s'il vous plaît."],
    ["the menu", "la carte, le menu", "Can I see the menu, please?", "Puis-je voir la carte, s'il vous plaît ?"],
    ["the bill", "l'addition", "The bill, please.", "L'addition, s'il vous plaît."],
    ["the waiter", "le serveur", "The waiter is very friendly.", "Le serveur est très sympathique."],
    ["the table", "la table", "A table for two, please.", "Une table pour deux, s'il vous plaît."],
    ["I'd like…", "Je voudrais…", "I'd like a coffee, please.", "Je voudrais un café, s'il vous plaît."],
    ["to drink", "boire", "What would you like to drink?", "Que voudriez-vous boire ?"],
    ["to order", "commander", "Are you ready to order?", "Êtes-vous prêt à commander ?"],
    ["hot", "chaud", "The tea is too hot.", "Le thé est trop chaud."],
    ["cold", "froid", "I'd like a cold drink.", "Je voudrais une boisson fraîche."],
    ["delicious", "délicieux", "This cake is delicious!", "Ce gâteau est délicieux !"],
    ["How much is it?", "Combien ça coûte ?", "How much is the coffee?", "Combien coûte le café ?"],
  ]),
};
