"use client";
import { motion as m } from "framer-motion";
import { theme } from "@/lib/theme";
import { motion as motionTokens, kineticType } from "@/lib/motion";
import type { Bullet } from "@/types";

interface BulletFieldProps {
  bullets: Bullet[];
  onCatch: (id: number) => void;
  onPassComplete?: (id: number) => void;
}

function hashBullet(id: number): { tilt: number; yPct: number; sizePx: number } {
  const seed = (id * 2654435761) >>> 0;
  const r1 = ((seed >>> 0) % 1000) / 1000;
  const r2 = (((seed * 7) >>> 0) % 1000) / 1000;
  const r3 = (((seed * 13) >>> 0) % 1000) / 1000;
  return {
    tilt: (r1 - 0.5) * 2 * motionTokens.bulletTiltMaxDeg,
    yPct: 8 + r2 * 74,
    sizePx:
      kineticType.bulletMinPx +
      r3 * (kineticType.bulletMaxPx - kineticType.bulletMinPx),
  };
}

export function BulletField({ bullets, onCatch, onPassComplete }: BulletFieldProps) {
  const active = bullets.filter(
    (b) => b.status === "flying" || b.status === "ricocheting"
  );

  return (
    <div
      aria-label="bullet-field"
      style={{
        position: "relative",
        height: "min(56vh, 420px)",
        overflow: "hidden",
        borderRadius: 6,
        background: "rgba(255,250,240,0.35)",
        border: `1.5px solid ${theme.ink8}`,
        boxShadow: `3px 3px 0 ${theme.moss62}`,
      }}
    >
      {active.map((bullet, i) => {
        const isRicochet = bullet.status === "ricocheting";
        const opacity = motionTokens.ricochetOpacity[bullet.passCount] ?? 0;
        const { tilt, yPct, sizePx } = hashBullet(bullet.id);
        const duration = isRicochet
          ? motionTokens.ricochetDurationSec
          : motionTokens.bulletDurationSec;
        const fromX = isRicochet ? "120vw" : "-120vw";
        const toX = isRicochet ? "-120vw" : "120vw";

        return (
          <m.button
            key={`${bullet.id}-${bullet.passCount}-${bullet.status}`}
            onClick={() => onCatch(bullet.id)}
            onAnimationComplete={() => onPassComplete?.(bullet.id)}
            initial={{ x: fromX, opacity: 0 }}
            animate={{
              x: toX,
              opacity: [0, opacity, opacity, 0],
              y: [0, -motionTokens.bulletVerticalBobPx, 0, motionTokens.bulletVerticalBobPx, 0],
            }}
            transition={{
              x: { duration, ease: "linear", delay: i * motionTokens.bulletStaggerSec },
              opacity: {
                duration,
                times: [0, 0.08, 0.92, 1],
                delay: i * motionTokens.bulletStaggerSec,
              },
              y: {
                duration,
                ease: "easeInOut",
                delay: i * motionTokens.bulletStaggerSec,
              },
            }}
            whileHover={{ scale: 1.08 }}
            style={{
              position: "absolute",
              top: `${yPct}%`,
              left: 0,
              padding: "4px 10px",
              background: "transparent",
              border: "none",
              color: theme.ink8,
              fontSize: sizePx,
              fontWeight: kineticType.bulletWeight,
              letterSpacing: kineticType.bulletLetterSpacing,
              fontFamily: "var(--font-serif, ui-serif, Georgia, serif)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transform: `rotate(${tilt}deg)`,
              textShadow: `2px 2px 0 ${theme.plumBg07}`,
            }}
          >
            {bullet.text}
          </m.button>
        );
      })}
    </div>
  );
}
