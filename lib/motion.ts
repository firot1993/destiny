export const motion = {
  bulletDurationSec: 6.5,
  ricochetDurationSec: 8.0,
  // Sequential spawn: next bullet enters this many seconds after the previous
  bulletSpawnIntervalSec: 2.2,
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
  // CSS cubic-bezier form of bulletEase, for the flight keyframe animation
  bulletEaseCss: "cubic-bezier(0.22, 0, 0.78, 1)",

  // Bullet-time focus styling (hover one → pause + dim others)
  bulletFocusScale: 1.18,
  bulletFocusBrightness: 1.12,
  // Non-hovered bullets dim via filter (not opacity) so they don't fight the
  // flight keyframe's opacity track while paused.
  bulletDimBrightness: 0.48,
  bulletDimBlurPx: 1.2,
  bulletTimeTransitionMs: 140,
  // Hover-triggered slow-mo: scale flight + bob animations via
  // Animation.playbackRate on the Web Animations API.
  bulletTimeRate: 0.1,

  // Crosshair lock-on ring over the hovered bullet
  lockOnRingSizePx: 56,
  lockOnRingStrokePx: 1.6,
  lockOnSpring: { stiffness: 520, damping: 22, mass: 0.6 },

  // Catch burst (click payoff — flash + shards radiating from click point)
  catchBurstDurationMs: 360,
  catchBurstShardCount: 6,
  catchBurstShardDistancePx: 110,
  catchBurstFlashMs: 90,
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
