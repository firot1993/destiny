"use client";
import { useEffect, useRef } from "react";
import { motion as m } from "framer-motion";
import { theme } from "@/lib/theme";
import { motion as motionTokens, kineticType } from "@/lib/motion";
import type { Bullet } from "@/types";

// Inject bullet-bob keyframe once into the document.
// Framer Motion owns x-translation; CSS owns the independent vertical bob.
// This avoids the y-animate / top-CSS interference bug.
const BOB_KEYFRAME_ID = "bullet-bob-keyframe";
function ensureBobKeyframe() {
  if (typeof document === "undefined") return;
  if (document.getElementById(BOB_KEYFRAME_ID)) return;
  const style = document.createElement("style");
  style.id = BOB_KEYFRAME_ID;
  style.textContent = `
    @keyframes bulletBob {
      0%,100% { margin-top: 0px; }
      50%      { margin-top: -${motionTokens.bulletBobPx}px; }
    }
  `;
  document.head.appendChild(style);
}

interface BulletFieldProps {
  bullets: Bullet[];
  onCatch: (id: number) => void;
  onPassComplete?: (id: number) => void;
  fontFamily?: string;
}

function hashBullet(id: number): { tilt: number; yPct: number; sizePx: number } {
  const seed = (id * 2654435761) >>> 0;
  const r1 = ((seed >>> 0) % 1000) / 1000;
  const r2 = (((seed * 7) >>> 0) % 1000) / 1000;
  const r3 = (((seed * 13) >>> 0) % 1000) / 1000;
  return {
    tilt: (r1 - 0.5) * 2 * motionTokens.bulletTiltMaxDeg,
    yPct: motionTokens.bulletLaneInsetPct + r2 * motionTokens.bulletLaneSpreadPct,
    sizePx: kineticType.bulletMinPx + r3 * (kineticType.bulletMaxPx - kineticType.bulletMinPx),
  };
}

export function BulletField({
  bullets,
  onCatch,
  onPassComplete,
  fontFamily = "var(--display)",
}: BulletFieldProps) {
  useEffect(() => { ensureBobKeyframe(); }, []);

  const active = bullets.filter(
    (b) => b.status === "flying" || b.status === "ricocheting"
  );

  // Track per-bullet pass-complete timers so we can clear on unmount.
  // Key: bullet key string → timeout id.
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timerRefs.current;
    return () => { timers.forEach((t) => clearTimeout(t)); };
  }, []);

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
      {active.map((bullet, spawnIndex) => {
        const isRicochet = bullet.status === "ricocheting";
        const opacity = motionTokens.ricochetOpacity[bullet.passCount] ?? 0;
        const { tilt, yPct, sizePx } = hashBullet(bullet.id);
        const duration = isRicochet
          ? motionTokens.ricochetDurationSec
          : motionTokens.bulletDurationSec;
        // Sequential spawn: each bullet delays by its position in the active list.
        const delay = spawnIndex * motionTokens.bulletSpawnIntervalSec;
        const fromX = isRicochet ? "120vw" : "-120vw";
        const toX   = isRicochet ? "-120vw" : "120vw";
        const bulletKey = `${bullet.id}-${bullet.passCount}-${bullet.status}`;

        const bobDuration = motionTokens.bulletBobDurationSec +
          ((bullet.id % 5) * 0.18); // slight per-bullet variation

        return (
          <m.button
            key={bulletKey}
            onClick={() => onCatch(bullet.id)}
            // Fix: schedule onPassComplete via timeout tied to x-animation duration+delay.
            // onAnimationComplete fires for every sub-animation (including whileHover),
            // so we use a timeout instead to fire exactly once when the flight ends.
            onAnimationStart={() => {
              if (!onPassComplete) return;
              const timers = timerRefs.current;
              if (timers.has(bulletKey)) clearTimeout(timers.get(bulletKey)!);
              const ms = (duration + delay) * 1000;
              timers.set(bulletKey, setTimeout(() => {
                timers.delete(bulletKey);
                onPassComplete(bullet.id);
              }, ms));
            }}
            initial={{ x: fromX, opacity: 0 }}
            animate={{
              x: toX,
              opacity: [0, opacity, opacity, 0],
            }}
            transition={{
              x: {
                duration,
                // Fix: slight ease-in-out reads as "thrown", not conveyor belt.
                ease: motionTokens.bulletEase as [number, number, number, number],
                delay,
              },
              opacity: {
                duration,
                times: [0, 0.08, 0.88, 1],
                delay,
              },
            }}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.96 }}
            style={{
              position: "absolute",
              top: `${yPct}%`,
              left: 0,
              // Fix: bob lives here as a CSS animation on margin-top,
              // completely independent of Framer Motion's y transforms.
              animationName: "bulletBob",
              animationDuration: `${bobDuration}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${delay + 0.3}s`,
              padding: `${motionTokens.bulletHitPaddingY}px ${motionTokens.bulletHitPaddingX}px`,
              background: "linear-gradient(135deg, rgba(255,250,240,0.96), rgba(255,250,240,0.78))",
              border: `1px solid ${isRicochet ? theme.plumBorder18 : theme.inkBorder08}`,
              borderRadius: 4,
              color: theme.ink8,
              fontSize: sizePx,
              fontWeight: kineticType.bulletWeight,
              letterSpacing: kineticType.bulletLetterSpacing,
              fontFamily,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transform: `rotate(${tilt}deg)`,
              textShadow: `2px 2px 0 ${theme.plum72}, 0 0 14px rgba(255,250,240,0.92)`,
              WebkitTextStroke: "0.35px rgba(255,250,240,0.92)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,250,240,0.62)",
              clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)",
              userSelect: "none",
              touchAction: "manipulation",
            }}
          >
            {bullet.text}
          </m.button>
        );
      })}
    </div>
  );
}
