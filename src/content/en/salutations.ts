import type { Lesson } from "../types";
import { items } from "./util";

export const enSalutations: Lesson = {
  id: "en-salutations",
  title: "Salutations",
  emoji: "👋",
  level: "A1",
  grammarTip: {
    title: "Le verbe « to be » (être)",
    body: "En anglais, le verbe « to be » se conjugue ainsi au présent : I am, you are, he/she/it is, we are, they are. Le pronom sujet est toujours obligatoire. Exemple : « I am French. » (Je suis français.) Forme courte courante : « I'm », « you're », « she's ». Négation : « I am not tired. »",
  },
  items: items("en-salutations", [
    ["Hello", "Bonjour, salut", "Hello, how are you?", "Bonjour, comment vas-tu ?"],
    ["Hi", "Salut", "Hi, Tom!", "Salut, Tom !"],
    ["Good morning", "Bonjour (le matin)", "Good morning, everyone.", "Bonjour à tous."],
    ["Good afternoon", "Bonjour (l'après-midi)", "Good afternoon, Mrs Smith.", "Bonjour, Madame Smith."],
    ["Good evening", "Bonsoir", "Good evening, ladies and gentlemen.", "Bonsoir, mesdames et messieurs."],
    ["Good night", "Bonne nuit", "Good night, sleep well.", "Bonne nuit, dors bien."],
    ["Goodbye", "Au revoir", "Goodbye, see you soon!", "Au revoir, à bientôt !"],
    ["See you later", "À plus tard", "See you later at the cinema.", "À plus tard au cinéma."],
    ["Please", "S'il vous plaît, s'il te plaît", "Water, please.", "De l'eau, s'il vous plaît."],
    ["Thank you", "Merci", "Thank you very much.", "Merci beaucoup."],
    ["You're welcome", "De rien", "Thanks! – You're welcome.", "Merci ! – De rien."],
    ["Sorry", "Désolé, pardon", "Sorry, I'm late.", "Désolé, je suis en retard."],
    ["Excuse me", "Excusez-moi", "Excuse me, where is the station?", "Excusez-moi, où est la gare ?"],
    ["Yes", "Oui", "Yes, I understand.", "Oui, je comprends."],
    ["No", "Non", "No, thank you.", "Non, merci."],
    ["How are you?", "Comment allez-vous ? Comment vas-tu ?", "Hi Anna, how are you?", "Salut Anna, comment vas-tu ?"],
    ["I'm fine", "Je vais bien", "I'm fine, thanks. And you?", "Je vais bien, merci. Et toi ?"],
    ["Nice to meet you", "Enchanté", "Nice to meet you, Paul.", "Enchanté, Paul."],
    ["My name is…", "Je m'appelle…", "My name is Marie.", "Je m'appelle Marie."],
    ["What's your name?", "Comment t'appelles-tu ?", "Hello! What's your name?", "Bonjour ! Comment t'appelles-tu ?"],
    ["I don't understand", "Je ne comprends pas", "Sorry, I don't understand.", "Désolé, je ne comprends pas."],
  ]),
};
