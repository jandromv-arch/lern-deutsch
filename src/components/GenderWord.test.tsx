import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GenderWord } from "./GenderWord";

describe("GenderWord", () => {
  it("colors der words blue", () => {
    const { getByText } = render(
      <GenderWord item={{ id: "x", de: "der Tisch", fr: "la table", gender: "der" }} />
    );
    expect(getByText("der Tisch").className).toContain("text-der");
  });
  it("no gender renders plain", () => {
    const { getByText } = render(
      <GenderWord item={{ id: "y", de: "Hallo", fr: "Bonjour", gender: null }} />
    );
    expect(getByText("Hallo").className).not.toContain("text-der");
  });
});
