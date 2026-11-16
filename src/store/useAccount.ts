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

function hasLegacyProgress(): boolean {
  const sl = useProgress.getState().slices?.["p-default:de"];
  return !!sl && (Object.keys(sl.items || {}).length > 0 || (sl.xp || 0) > 0);
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
      removeProfile: (id) => {
        const wasActive = get().activeId === id;
        const profiles = get().profiles.filter((p) => p.id !== id);
        set({ profiles, activeId: wasActive ? null : get().activeId });
        useProgress.getState().dropProfile(id);
        if (wasActive && profiles.length > 0) get().setActive(profiles[0].id);
      },
    }),
    {
      name: "lern-accounts-v1",
      version: 1,
      partialize: (s) => ({ profiles: s.profiles, activeId: s.activeId }),
      // Existing installs: legacy progress lives in slice "p-default:de" but no profile exists yet.
      onRehydrateStorage: () => () => {
        // Deferred: useAccount is not assigned yet while rehydrating synchronously.
        queueMicrotask(() => {
          const s = useAccount.getState();
          if (s.profiles.length === 0 && hasLegacyProgress()) {
            const id = "p-default";
            useAccount.setState({
              profiles: [{ id, name: "Moi", lang: "de", level: "A1", createdAt: Date.now() }],
              activeId: id,
            });
          }
        });
      },
    }
  )
);
