import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Qcm } from "./Qcm";
import { Flashcard } from "./Flashcard";
import type { VocabItem } from "../content/types";

const item: VocabItem = { id: "x", de: "Hallo", fr: "Bonjour", gender: null };
const pool: VocabItem[] = [item, { id: "a", de: "Danke", fr: "Merci" }, { id: "b", de: "Ja", fr: "Oui" }, { id: "c", de: "Nein", fr: "Non" }];

describe("Qcm", () => {
  it("reports correct when the right option is clicked", () => {
    const onResult = vi.fn();
    const { getByText } = render(<Qcm item={item} pool={pool} onResult={onResult} />);
    fireEvent.click(getByText("Bonjour"));
    expect(onResult).toHaveBeenCalledWith(true);
  });
});

describe("Flashcard", () => {
  it("reports result from self-rating buttons", () => {
    const onResult = vi.fn();
    const { getByText } = render(<Flashcard item={item} pool={pool} onResult={onResult} />);
    fireEvent.click(getByText(/Je savais/));
    expect(onResult).toHaveBeenCalledWith(true);
  });
});
