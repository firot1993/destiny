"use client";
import { useEffect } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import { motion as motionTokens, kineticType } from "@/lib/motion";
import { theme } from "@/lib/theme";

interface FireImpactProps {
  active: boolean;
  onComplete: () => void;
}

export function FireImpact({ active, onComplete }: FireImpactProps) {
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(onComplete, motionTokens.fireTotalMs);
    return () => window.clearTimeout(t);
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <m.div
          key="fire-impact-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: motionTokens.fireFlashMs / 1000, times: [0, 0.3, 1] }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,250,240,0.96)",
            }}
          />

          <m.svg
            viewBox="-50 -50 100 100"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.1, 1], opacity: [0, 1, 0.9, 0] }}
            transition={{
              duration: motionTokens.fireImpactHoldMs / 1000,
              delay: motionTokens.fireFlashMs / 1000,
            }}
            style={{
              position: "absolute",
              width: "140vmin",
              height: "140vmin",
              pointerEvents: "none",
            }}
          >
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2;
              const len = 28 + ((i * 37) % 18);
              const x2 = Math.cos(angle) * len;
              const y2 = Math.sin(angle) * len;
              return (
                <line
                  key={i}
                  x1={Math.cos(angle) * 12}
                  y1={Math.sin(angle) * 12}
                  x2={x2}
                  y2={y2}
                  stroke={theme.ink8}
                  strokeWidth={1.2}
                  strokeLinecap="round"
                />
              );
            })}
          </m.svg>

          <m.div
            initial={{ scale: 0.6, opacity: 0, x: 0 }}
            animate={{
              scale: [0.6, 1.12, 1],
              opacity: [0, 1, 1, 0],
              x: [0, -motionTokens.fireShakeAmplitudePx, motionTokens.fireShakeAmplitudePx, 0],
            }}
            transition={{
              duration: motionTokens.fireImpactHoldMs / 1000,
              delay: motionTokens.fireFlashMs / 1000,
              times: [0, 0.2, 0.7, 1],
            }}
            style={{
              fontSize: kineticType.impactPx,
              fontWeight: kineticType.impactWeight,
              letterSpacing: kineticType.impactLetterSpacing,
              color: theme.ink8,
              fontFamily: "var(--font-serif, ui-serif, Georgia, serif)",
              transform: `rotate(${kineticType.impactTiltDeg}deg)`,
              textShadow: `6px 6px 0 ${theme.plum72}`,
              WebkitTextStroke: `2px ${theme.ink8}`,
              padding: "0 24px",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            FIRE
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
