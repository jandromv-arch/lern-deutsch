import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app/App";
import { applyTheme } from "./app/theme";
import { useProgress } from "./store/useProgress";

applyTheme(useProgress.getState().themePref);
window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
  const pref = useProgress.getState().themePref;
  if (pref === "system") applyTheme(pref);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
