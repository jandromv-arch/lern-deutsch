import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "../screens/Home";
import { Lesson } from "../screens/Lesson";
import { Review } from "../screens/Review";
import { Progress } from "../screens/Progress";

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/review" element={<Review />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
