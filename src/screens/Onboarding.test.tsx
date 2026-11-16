import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Onboarding } from "./Onboarding";
import { useAccount } from "../store/useAccount";
import { LANGUAGES } from "../content/languages";

describe("Onboarding", () => {
  it("name → language → level → createProfile", () => {
    const spy = vi.fn(() => "id1");
    useAccount.setState({ createProfile: spy });
    render(<Onboarding />);
    const next = screen.getByText("Suivant") as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText("Ton prénom"), { target: { value: "Léa" } });
    fireEvent.click(screen.getByText("Suivant"));
    fireEvent.click(screen.getByText(LANGUAGES[0].label));
    fireEvent.click(screen.getByText("Suivant"));
    fireEvent.click(screen.getByText(/Intermédiaire/));
    fireEvent.click(screen.getByText("Commencer"));
    expect(spy).toHaveBeenCalledWith("Léa", LANGUAGES[0].id, "A2");
  });
});
