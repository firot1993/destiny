export const motion = {
  bulletDurationSec: 3.8,
  ricochetDurationSec: 5.2,
  // Sequential spawn: next bullet enters this many seconds after the previous
  bulletSpawnIntervalSec: 1.4,
  bulletBobDurationSec: 2.2,   // independent bob cycle (CSS keyframe)
  bulletBobPx: 10,
  bulletTiltMaxDeg: 4,
  bulletHitPaddingX: 24,
  bulletHitPaddingY: 12,
  bulletLaneInsetPct: 14,
  bulletLaneSpreadPct: 60,

  catchSpring: { stiffness: 280, damping: 24, mass: 0.9 },
  catchScalePulse: 1.22,
  catchPulseDurationMs: 180,

  ricochetOpacity: [1, 0.55, 0.22, 0] as const,

  firePreDelayMs: 80,
  fireFlashMs: 80,
  fireImpactHoldMs: 520,
  fireShakeMs: 260,
  fireShakeAmplitudePx: 6,
  fireTotalMs: 840,

  reloadSpinDurationMs: 420,
  // Easing for bullet x-travel — slight ease-in-out reads as thrown, not conveyor
  bulletEase: [0.22, 0, 0.78, 1] as const,
} as const;

export const kineticType = {
  bulletMinPx: 24,
  bulletMaxPx: 40,
  bulletWeight: 800,
  bulletLetterSpacing: "-0.01em",
  impactPx: 128,
  impactWeight: 900,
  impactLetterSpacing: "-0.04em",
  impactTiltDeg: -6,
} as const;
