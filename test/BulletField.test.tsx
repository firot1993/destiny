import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulletField } from "@/components/BulletField";
import type { Bullet } from "@/types";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, transition, whileHover, ...rest }: any) =>
      React.createElement("div", rest, children),
    button: ({ children, initial, animate, transition, whileHover, onAnimationComplete, ...rest }: any) =>
      React.createElement("button", rest, children),
    svg: ({ children, initial, animate, transition, ...rest }: any) =>
      React.createElement("svg", rest, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe("BulletField", () => {
  it("renders only flying and ricocheting bullets", () => {
    const bullets: Bullet[] = [
      { id: 1, text: "flying-1", status: "flying", passCount: 0, chamberIndex: null },
      { id: 2, text: "caught-1", status: "caught", passCount: 0, chamberIndex: 0 },
      { id: 3, text: "spent-1", status: "spent", passCount: 3, chamberIndex: null },
      { id: 4, text: "ricochet-1", status: "ricocheting", passCount: 1, chamberIndex: null },
    ];
    render(<BulletField bullets={bullets} onCatch={() => {}} />);
    expect(screen.getByText("flying-1")).toBeInTheDocument();
    expect(screen.getByText("ricochet-1")).toBeInTheDocument();
    expect(screen.queryByText("caught-1")).not.toBeInTheDocument();
    expect(screen.queryByText("spent-1")).not.toBeInTheDocument();
  });

  it("calls onCatch with bullet id when clicked", async () => {
    const onCatch = vi.fn();
    const bullets: Bullet[] = [
      { id: 7, text: "click-me", status: "flying", passCount: 0, chamberIndex: null },
    ];
    render(<BulletField bullets={bullets} onCatch={onCatch} />);
    await userEvent.click(screen.getByText("click-me"));
    expect(onCatch).toHaveBeenCalledWith(7);
  });
});
