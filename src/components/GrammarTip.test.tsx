import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GrammarTip } from "./GrammarTip";

const tip = { title: "Le verbe en 2e position", body: "Le verbe conjugué est toujours en deuxième position." };

describe("GrammarTip", () => {
  it("affiche le titre et le corps", () => {
    render(<GrammarTip tip={tip} />);
    expect(screen.getByText(/Astuce : Le verbe en 2e position/)).toBeTruthy();
    expect(screen.getByText(tip.body)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Continuer" })).toBeNull();
  });
  it("Continuer appelle onContinue", () => {
    const onContinue = vi.fn();
    render(<GrammarTip tip={tip} onContinue={onContinue} />);
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
