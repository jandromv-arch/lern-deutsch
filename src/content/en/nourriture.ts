import type { Lesson } from "../types";
import { items } from "./util";

export const enNourriture: Lesson = {
  id: "en-nourriture",
  title: "La nourriture",
  emoji: "🍎",
  level: "A1",
  items: items("en-nourriture", [
    ["the apple", "la pomme", "I eat an apple every day.", "Je mange une pomme tous les jours."],
    ["the banana", "la banane", "The banana is yellow.", "La banane est jaune."],
    ["the orange", "l'orange", "I'd like an orange.", "Je voudrais une orange."],
    ["the bread", "le pain", "We buy fresh bread every morning.", "Nous achetons du pain frais tous les matins."],
    ["the butter", "le beurre", "Bread and butter, please.", "Du pain et du beurre, s'il vous plaît."],
    ["the cheese", "le fromage", "I love French cheese.", "J'adore le fromage français."],
    ["the egg", "l'œuf", "I'd like two eggs for breakfast.", "Je voudrais deux œufs au petit-déjeuner."],
    ["the meat", "la viande", "She doesn't eat meat.", "Elle ne mange pas de viande."],
    ["the chicken", "le poulet", "We're having chicken for dinner.", "Nous mangeons du poulet ce soir."],
    ["the fish", "le poisson", "The fish is fresh.", "Le poisson est frais."],
    ["the rice", "le riz", "I like rice with vegetables.", "J'aime le riz avec des légumes."],
    ["the pasta", "les pâtes", "Pasta is my favourite food.", "Les pâtes sont mon plat préféré."],
    ["the potato", "la pomme de terre", "I'd like some potatoes.", "Je voudrais des pommes de terre."],
    ["the tomato", "la tomate", "The tomato salad is great.", "La salade de tomates est excellente."],
    ["the vegetables", "les légumes", "Eat your vegetables!", "Mange tes légumes !"],
    ["the fruit", "le fruit, les fruits", "I eat a lot of fruit.", "Je mange beaucoup de fruits."],
    ["the soup", "la soupe", "The soup is hot.", "La soupe est chaude."],
    ["the salad", "la salade", "I'd like a green salad.", "Je voudrais une salade verte."],
    ["breakfast", "le petit-déjeuner", "I have breakfast at seven.", "Je prends mon petit-déjeuner à sept heures."],
    ["lunch", "le déjeuner", "We have lunch at one o'clock.", "Nous déjeunons à treize heures."],
    ["dinner", "le dîner", "Dinner is ready!", "Le dîner est prêt !"],
    ["I'm hungry", "J'ai faim", "I'm hungry. Let's eat!", "J'ai faim. Mangeons !"],
  ]),
};
