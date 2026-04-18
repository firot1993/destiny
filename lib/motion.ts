export const motion = {
  bulletDurationSec: 2.5,
  ricochetDurationSec: 3.5,
  bulletStaggerSec: 0.35,
  bulletVerticalBobPx: 14,
  bulletTiltMaxDeg: 5,

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
} as const;

export const kineticType = {
  bulletMinPx: 18,
  bulletMaxPx: 30,
  bulletWeight: 700,
  bulletLetterSpacing: "-0.01em",
  impactPx: 128,
  impactWeight: 900,
  impactLetterSpacing: "-0.04em",
  impactTiltDeg: -6,
} as const;
