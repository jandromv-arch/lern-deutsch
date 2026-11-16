import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAccount } from "./useAccount";
import { useProgress } from "./useProgress";

beforeEach(() => {
  useAccount.setState({ profiles: [], activeId: null });
  useProgress.setState({ slices: {}, activeKey: "p-default:de" });
  useProgress.getState().reset();
});

describe("useAccount", () => {
  it("createProfile adds, activates, sets progress context", () => {
    const id = useAccount.getState().createProfile("Ana", "de", "A1");
    const s = useAccount.getState();
    expect(s.profiles).toHaveLength(1);
    expect(s.activeId).toBe(id);
    expect(s.active()?.name).toBe("Ana");
    expect(useProgress.getState().activeKey).toBe(`${id}:de`);
  });
  it("setActive switches profile and progress context", () => {
    const a = useAccount.getState().createProfile("A", "de", "A1");
    const b = useAccount.getState().createProfile("B", "en", "A2");
    expect(useAccount.getState().activeId).toBe(b);
    useAccount.getState().setActive(a);
    expect(useAccount.getState().active()?.id).toBe(a);
    expect(useProgress.getState().activeKey).toBe(`${a}:de`);
  });
  it("setLang changes lang and context when active", () => {
    const a = useAccount.getState().createProfile("A", "de", "A1");
    useAccount.getState().setLang(a, "en");
    expect(useAccount.getState().active()?.lang).toBe("en");
    expect(useProgress.getState().activeKey).toBe(`${a}:en`);
  });
  it("removeProfile removes and clears activeId if active", () => {
    const a = useAccount.getState().createProfile("A", "de", "A1");
    const b = useAccount.getState().createProfile("B", "de", "A1");
    useAccount.getState().removeProfile(a);
    expect(useAccount.getState().activeId).toBe(b);
    useAccount.getState().removeProfile(b);
    expect(useAccount.getState().activeId).toBeNull();
    expect(useAccount.getState().active()).toBeUndefined();
  });
});

describe("useAccount progress cleanup", () => {
  it("removeProfile drops its slices and moves context off the removed profile", () => {
    const a = useAccount.getState().createProfile("A", "de", "A1");
    useProgress.getState().addAnswer(true, "2026-01-01");
    const b = useAccount.getState().createProfile("B", "de", "A1");
    useProgress.getState().addAnswer(true, "2026-01-01");
    useProgress.getState().addAnswer(true, "2026-01-01");
    useAccount.getState().removeProfile(b);
    const p = useProgress.getState();
    expect(Object.keys(p.slices).some((k) => k.startsWith(`${b}:`))).toBe(false);
    expect(p.activeKey).toBe(`${a}:de`);
    expect(p.xp).toBe(useProgress.getState().slices[`${a}:de`]?.xp ?? p.xp);
    expect(Object.keys(p.slices).some((k) => k.startsWith(`${b}:`))).toBe(false);
  });
  it("removing the only profile leaves a fresh default context", () => {
    const a = useAccount.getState().createProfile("A", "de", "A1");
    useProgress.getState().addAnswer(true, "2026-01-01");
    useAccount.getState().removeProfile(a);
    const p = useProgress.getState();
    expect(Object.keys(p.slices).some((k) => k.startsWith(`${a}:`))).toBe(false);
    expect(p.activeKey).toBe("p-default:de");
    expect(useAccount.getState().activeId).toBeNull();
  });
});

describe("legacy seeding on rehydrate", () => {
  async function boot(blob?: unknown) {
    localStorage.clear();
    if (blob) localStorage.setItem("lern-deutsch-v1", JSON.stringify(blob));
    vi.resetModules();
    const mod = await import("./useAccount");
    await Promise.resolve();
    await Promise.resolve();
    return mod.useAccount;
  }
  it("seeds a Moi profile for legacy users", async () => {
    const acc = await boot({
      state: { items: { x: { box: 1, nextDue: "2026-01-01" } }, xp: 40 },
      version: 2,
    });
    const s = acc.getState();
    expect(s.profiles).toHaveLength(1);
    expect(s.profiles[0].name).toBe("Moi");
    expect(s.activeId).toBe("p-default");
  });
  it("keeps a brand-new user profile-less", async () => {
    const acc = await boot();
    expect(acc.getState().profiles).toEqual([]);
    expect(acc.getState().activeId).toBeNull();
  });
});
