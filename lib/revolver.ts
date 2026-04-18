import type { Bullet, NoiseFragment } from "@/types";
import { MAX_BULLET_PASSES, REVOLVER_CHAMBERS } from "@/types";

export function fragmentToBullet(fragment: NoiseFragment): Bullet {
  return {
    id: fragment.id,
    text: fragment.text,
    status: "flying",
    passCount: 0,
    chamberIndex: null,
  };
}

export function catchBullet(bullets: Bullet[], bulletId: number): Bullet[] {
  const caughtCount = bullets.filter((b) => b.status === "caught").length;
  if (caughtCount >= REVOLVER_CHAMBERS) return bullets;
  return bullets.map((b) => {
    if (b.id !== bulletId) return b;
    if (b.status !== "flying" && b.status !== "ricocheting") return b;
    return { ...b, status: "caught", chamberIndex: caughtCount };
  });
}

export function ricochetBullet(bullet: Bullet): Bullet {
  if (bullet.status === "caught" || bullet.status === "spent") return bullet;
  const nextPassCount = bullet.passCount + 1;
  if (nextPassCount >= MAX_BULLET_PASSES) {
    return { ...bullet, status: "spent", passCount: nextPassCount };
  }
  return { ...bullet, status: "ricocheting", passCount: nextPassCount };
}

export function chamberSnapshot(bullets: Bullet[]): (Bullet | null)[] {
  const snapshot: (Bullet | null)[] = Array(REVOLVER_CHAMBERS).fill(null);
  for (const b of bullets) {
    if (b.status === "caught" && b.chamberIndex !== null && b.chamberIndex < REVOLVER_CHAMBERS) {
      snapshot[b.chamberIndex] = b;
    }
  }
  return snapshot;
}

export function buildBulletSeed(bullets: Bullet[]): string {
  return chamberSnapshot(bullets)
    .filter((b): b is Bullet => b !== null)
    .map((b, i) => `${i + 1}::${b.text}`)
    .join("\n");
}
