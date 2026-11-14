import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { TypeInput } from "./TypeInput";
import type { VocabItem } from "../content/types";

const item: VocabItem = { id: "x", de: "Hallo", fr: "Bonjour", gender: null };

afterEach(() => vi.useRealTimers());

describe("TypeInput", () => {
  it("reports true for a correct (lenient) answer", () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    render(<TypeInput item={item} onResult={onResult} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hallo" } });
    fireEvent.click(screen.getByText("Vérifier"));
    act(() => { vi.advanceTimersByTime(700); });
    expect(onResult).toHaveBeenCalledWith(true);
  });
  it("reports false and reveals the answer when wrong", () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    render(<TypeInput item={item} onResult={onResult} />);
    expect(screen.queryByText("Hallo")).toBeNull();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "xxx" } });
    fireEvent.click(screen.getByText("Vérifier"));
    expect(screen.getByText("Hallo")).toBeTruthy();
    act(() => { vi.advanceTimersByTime(700); });
    expect(onResult).toHaveBeenCalledWith(false);
  });
});
