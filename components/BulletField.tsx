"use client";
import { useEffect, useRef, useState } from "react";
import { theme } from "@/lib/theme";
import { motion as motionTokens, kineticType } from "@/lib/motion";
import { CatchBurst, type Burst } from "@/components/CatchBurst";
import type { Bullet } from "@/types";

interface BulletFieldProps {
  bullets: Bullet[];
  onCatch: (id: number) => void;
  onPassComplete?: (id: number) => void;
  fontFamily?: string;
}

// Per-bullet visual palette. Warm earthy tones that sit on the cream field
// without looking costumey. First entry is the default ink, so bullets with
// hash index 0 keep the original look.
const BULLET_PALETTE = [
  { color: "rgba(0,0,0,0.88)",     borderColor: "rgba(0,0,0,0.08)"  },
  { color: "rgba(38,84,68,0.92)",  borderColor: "rgba(38,84,68,0.22)" },
  { color: "rgba(88,48,74,0.92)",  borderColor: "rgba(88,48,74,0.22)" },
  { color: "rgba(170,50,30,0.88)", borderColor: "rgba(170,50,30,0.22)" },
  { color: "rgba(180,110,0,0.92)", borderColor: "rgba(180,110,0,0.22)" },
] as const;
const BULLET_WEIGHTS = [700, 800, 900] as const;

function hashBullet(id: number): {
  tilt: number;
  yPct: number;
  sizePx: number;
  colorIndex: number;
  weight: number;
  italic: boolean;
} {
  const seed = (id * 2654435761) >>> 0;
  const r1 = ((seed >>> 0) % 1000) / 1000;
  const r2 = (((seed * 7) >>> 0) % 1000) / 1000;
  const r3 = (((seed * 13) >>> 0) % 1000) / 1000;
  const r4 = (((seed * 19) >>> 0) % 1000) / 1000;
  const r5 = (((seed * 23) >>> 0) % 1000) / 1000;
  const r6 = (((seed * 29) >>> 0) % 1000) / 1000;
  return {
    tilt: (r1 - 0.5) * 2 * motionTokens.bulletTiltMaxDeg,
    yPct: motionTokens.bulletLaneInsetPct + r2 * motionTokens.bulletLaneSpreadPct,
    sizePx: kineticType.bulletMinPx + r3 * (kineticType.bulletMaxPx - kineticType.bulletMinPx),
    colorIndex: Math.floor(r4 * BULLET_PALETTE.length),
    weight: BULLET_WEIGHTS[Math.floor(r5 * BULLET_WEIGHTS.length)],
    italic: r6 > 0.6,
  };
}

function LockOnRing() {
  const size = motionTokens.lockOnRingSizePx;
  const stroke = motionTokens.lockOnRingStrokePx;
  const half = size / 2;
  const ringColor = "rgba(0,0,0,0.68)";
  return (
    <svg
      className="lock-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle
        cx={half}
        cy={half}
        r={half - 4}
        fill="none"
        stroke={ringColor}
        strokeWidth={stroke}
        strokeDasharray="4 4"
      />
      <circle cx={half} cy={half} r={1.8} fill={ringColor} />
      <g stroke={ringColor} strokeWidth={stroke} strokeLinecap="round">
        <line x1={0} y1={half} x2={6} y2={half} />
        <line x1={size - 6} y1={half} x2={size} y2={half} />
        <line x1={half} y1={0} x2={half} y2={6} />
        <line x1={half} y1={size - 6} x2={half} y2={size} />
      </g>
    </svg>
  );
}

export function BulletField({
  bullets,
  onCatch,
  onPassComplete,
  fontFamily = "var(--display)",
}: BulletFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const active = bullets.filter(
    (b) => b.status === "flying" || b.status === "ricocheting"
  );

  // Bullet-time via Web Animations API: hover any bullet → every running
  // CSS animation in the field (flight + bob) is scaled to bulletTimeRate.
  // Re-applies on bullets change so newly-spawned animations inherit the
  // current rate.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const applyRate = () => {
      const anyHover = field.querySelector(".bullet-wrap:hover") != null;
      const rate = anyHover ? motionTokens.bulletTimeRate : 1;
      field
        .querySelectorAll<HTMLElement>(".bullet-wrap, .bullet-wrap *")
        .forEach((el) => {
          el.getAnimations?.().forEach((a) => {
            a.playbackRate = rate;
          });
        });
    };

    const schedule = () => requestAnimationFrame(applyRate);
    field.addEventListener("mouseover", schedule);
    field.addEventListener("mouseout", schedule);
    applyRate();

    return () => {
      field.removeEventListener("mouseover", schedule);
      field.removeEventListener("mouseout", schedule);
    };
  }, [bullets]);

  function handleCatch(bulletId: number, target: HTMLElement) {
    if (fieldRef.current) {
      const rect = target.getBoundingClientRect();
      const fieldRect = fieldRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - fieldRect.left;
      const y = rect.top + rect.height / 2 - fieldRect.top;
      const burstId = `${bulletId}-${Date.now()}`;
      setBursts((prev) => [...prev, { id: burstId, x, y }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, motionTokens.catchBurstDurationMs + 120);
    }
    onCatch(bulletId);
  }

  return (
    <div
      ref={fieldRef}
      className="bullet-field"
      aria-label="bullet-field"
      style={{
        position: "relative",
        height: "min(56vh, 420px)",
        overflow: "hidden",
        borderRadius: 6,
        background: "rgba(255,250,240,0.35)",
        border: `1.5px solid ${theme.ink8}`,
        boxShadow: `3px 3px 0 ${theme.moss62}`,
        // Expose motion tokens to CSS rules in globals.css.
        ["--bullet-focus-scale" as string]: String(motionTokens.bulletFocusScale),
        ["--bullet-focus-brightness" as string]: String(motionTokens.bulletFocusBrightness),
        ["--bullet-dim-brightness" as string]: String(motionTokens.bulletDimBrightness),
        ["--bullet-dim-blur" as string]: `${motionTokens.bulletDimBlurPx}px`,
        ["--bullet-bob-px" as string]: `${motionTokens.bulletBobPx}px`,
      }}
    >
      {active.map((bullet, spawnIndex) => {
        const isRicochet = bullet.status === "ricocheting";
        const { tilt, yPct, sizePx, colorIndex, weight, italic } = hashBullet(bullet.id);
        const palette = BULLET_PALETTE[colorIndex];
        const duration = isRicochet
          ? motionTokens.ricochetDurationSec
          : motionTokens.bulletDurationSec;
        const delay = spawnIndex * motionTokens.bulletSpawnIntervalSec;
        const keyframe = isRicochet ? "bulletFlyRtl" : "bulletFlyLtr";
        const opacity = motionTokens.ricochetOpacity[bullet.passCount] ?? 0;
        const bobDuration =
          motionTokens.bulletBobDurationSec + (bullet.id % 5) * 0.18;
        const bulletKey = `${bullet.id}-${bullet.passCount}-${bullet.status}`;

        return (
          <div
            key={bulletKey}
            className="bullet-wrap"
            style={{
              top: `${yPct}%`,
              animation: `${keyframe} ${duration}s ${motionTokens.bulletEaseCss} ${delay}s both`,
              ["--bullet-opacity" as string]: String(opacity),
            }}
            onAnimationEnd={(e) => {
              if (e.animationName !== keyframe) return;
              onPassComplete?.(bullet.id);
            }}
          >
            <div
              style={{
                position: "relative",
                display: "inline-block",
                animation: `bulletBob ${bobDuration}s ease-in-out ${delay + 0.3}s infinite`,
              }}
            >
              <button
                className="bullet"
                onClick={(e) => handleCatch(bullet.id, e.currentTarget)}
                style={{
                  padding: `${motionTokens.bulletHitPaddingY}px ${motionTokens.bulletHitPaddingX}px`,
                  background:
                    "linear-gradient(135deg, rgba(255,250,240,0.96), rgba(255,250,240,0.78))",
                  border: `1px solid ${
                    isRicochet ? theme.plumBorder18 : palette.borderColor
                  }`,
                  borderRadius: 4,
                  color: palette.color,
                  fontSize: sizePx,
                  fontWeight: weight,
                  fontStyle: italic ? "italic" : "normal",
                  letterSpacing: kineticType.bulletLetterSpacing,
                  fontFamily,
                  cursor: "inherit",
                  whiteSpace: "nowrap",
                  rotate: `${tilt}deg`,
                  textShadow: `1px 1px 0 rgba(255,250,240,0.6)`,
                  boxShadow:
                    "0 10px 24px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,250,240,0.62)",
                  clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)",
                  userSelect: "none",
                  touchAction: "manipulation",
                }}
              >
                {bullet.text}
              </button>
              <LockOnRing />
            </div>
          </div>
        );
      })}

      <CatchBurst bursts={bursts} />
    </div>
  );
}
