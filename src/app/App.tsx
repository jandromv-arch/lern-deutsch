import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "../screens/Home";
import { Lesson } from "../screens/Lesson";
import { Review } from "../screens/Review";
import { Daily } from "../screens/Daily";
import { Progress } from "../screens/Progress";
import { Dialogue } from "../screens/Dialogue";
import { DialoguePlay } from "../screens/DialoguePlay";

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/review" element={<Review />} />
          <Route path="/dialogues" element={<Dialogue />} />
          <Route path="/dialogues/:id" element={<DialoguePlay />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
