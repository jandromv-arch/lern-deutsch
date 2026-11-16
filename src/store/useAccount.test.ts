import { describe, it, expect, beforeEach } from "vitest";
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
