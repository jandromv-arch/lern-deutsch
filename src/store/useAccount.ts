import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Level } from "../content/types";
import { useProgress } from "./useProgress";

export interface Profile {
  id: string;
  name: string;
  lang: string;
  level: Level;
  createdAt: number;
}

interface AccountState {
  profiles: Profile[];
  activeId: string | null;
  active: () => Profile | undefined;
  createProfile: (name: string, lang: string, level: Level) => string;
  setActive: (id: string) => void;
  setLang: (id: string, lang: string) => void;
  removeProfile: (id: string) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeId: null,
      active: () => get().profiles.find((p) => p.id === get().activeId),
      createProfile: (name, lang, level) => {
        const id = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        const profile: Profile = { id, name, lang, level, createdAt: Date.now() };
        set({ profiles: [...get().profiles, profile], activeId: id });
        useProgress.getState().setContext(id, lang);
        return id;
      },
      setActive: (id) => {
        const p = get().profiles.find((x) => x.id === id);
        if (!p) return;
        set({ activeId: id });
        useProgress.getState().setContext(id, p.lang);
      },
      setLang: (id, lang) => {
        set({ profiles: get().profiles.map((p) => (p.id === id ? { ...p, lang } : p)) });
        if (get().activeId === id) useProgress.getState().setContext(id, lang);
      },
      removeProfile: (id) =>
        set({
          profiles: get().profiles.filter((p) => p.id !== id),
          activeId: get().activeId === id ? null : get().activeId,
        }),
    }),
    {
      name: "lern-accounts-v1",
      version: 1,
      partialize: (s) => ({ profiles: s.profiles, activeId: s.activeId }),
      // Existing installs: legacy progress lives in slice "p-default:de" but no profile exists yet.
      onRehydrateStorage: () => (state) => {
        if (!state || state.profiles.length > 0) return;
        const pr = useProgress.getState();
        const legacy = pr.slices["p-default:de"] ?? pr;
        if (legacy.xp > 0 || Object.keys(legacy.items).length > 0) {
          useAccount.setState({
            profiles: [{ id: "p-default", name: "Moi", lang: "de", level: "A1", createdAt: Date.now() }],
            activeId: "p-default",
          });
        }
      },
    }
  )
);
