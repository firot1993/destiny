import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { FireImpact } from "@/components/FireImpact";
import { motion as motionTokens } from "@/lib/motion";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, ...rest }: any) =>
      React.createElement("div", rest, children),
    button: ({ children, initial, animate, transition, whileHover, ...rest }: any) =>
      React.createElement("button", rest, children),
    svg: ({ children, initial, animate, transition, ...rest }: any) =>
      React.createElement("svg", rest, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe("FireImpact", () => {
  it("renders the impact label when active", () => {
    render(<FireImpact active={true} onComplete={() => {}} />);
    expect(screen.getByText(/FIRE/i)).toBeInTheDocument();
  });

  it("renders nothing when inactive", () => {
    const { container } = render(<FireImpact active={false} onComplete={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("calls onComplete after fireTotalMs", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<FireImpact active={true} onComplete={onComplete} />);
    act(() => {
      vi.advanceTimersByTime(motionTokens.fireTotalMs + 50);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
