import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { AmmoHUD } from "@/components/AmmoHUD";
import type { Bullet } from "@/types";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, transition, whileHover, ...rest }: any) =>
      React.createElement("div", rest, children),
    button: ({ children, initial, animate, transition, whileHover, ...rest }: any) =>
      React.createElement("button", rest, children),
    svg: ({ children, initial, animate, transition, ...rest }: any) =>
      React.createElement("svg", rest, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe("AmmoHUD", () => {
  it("renders 6 cartridge slots", () => {
    render(<AmmoHUD bullets={[]} />);
    expect(screen.getAllByTestId("cartridge-slot")).toHaveLength(6);
  });

  it("shows counter in bracketed N/6 format", () => {
    const bullets: Bullet[] = [
      { id: 1, text: "a", status: "caught", passCount: 0, chamberIndex: 0 },
      { id: 2, text: "b", status: "caught", passCount: 0, chamberIndex: 1 },
    ];
    render(<AmmoHUD bullets={bullets} />);
    expect(screen.getByText(/LOADED · 2 \/ 6/)).toBeInTheDocument();
  });

  it("uses the provided loaded label", () => {
    const bullets: Bullet[] = [
      { id: 1, text: "a", status: "caught", passCount: 0, chamberIndex: 0 },
    ];
    render(<AmmoHUD bullets={bullets} loadedLabel="已装填" />);
    expect(screen.getByText(/\[ 已装填 · 1 \/ 6 \]/)).toBeInTheDocument();
  });

  it("marks only caught chambers as loaded", () => {
    const bullets: Bullet[] = [
      { id: 1, text: "a", status: "caught", passCount: 0, chamberIndex: 0 },
      { id: 2, text: "b", status: "caught", passCount: 0, chamberIndex: 2 },
    ];
    render(<AmmoHUD bullets={bullets} />);
    const slots = screen.getAllByTestId("cartridge-slot");
    expect(slots[0]).toHaveAttribute("data-loaded", "true");
    expect(slots[1]).toHaveAttribute("data-loaded", "false");
    expect(slots[2]).toHaveAttribute("data-loaded", "true");
  });
});
