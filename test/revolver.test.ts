import { describe, it, expect } from "vitest";
import {
  fragmentToBullet,
  catchBullet,
  ricochetBullet,
  chamberSnapshot,
  buildBulletSeed,
} from "@/lib/revolver";
import type { Bullet, NoiseFragment } from "@/types";

describe("fragmentToBullet", () => {
  it("creates a flying bullet with pass count 0", () => {
    const frag: NoiseFragment = { id: 1, text: "a door" };
    expect(fragmentToBullet(frag)).toEqual({
      id: 1,
      text: "a door",
      status: "flying",
      passCount: 0,
      chamberIndex: null,
    });
  });
});

describe("catchBullet", () => {
  it("marks bullet caught and assigns next free chamber index", () => {
    const bullets: Bullet[] = [
      { id: 1, text: "a", status: "flying", passCount: 0, chamberIndex: null },
      { id: 2, text: "b", status: "caught", passCount: 0, chamberIndex: 0 },
    ];
    const next = catchBullet(bullets, 1);
    expect(next.find((b) => b.id === 1)).toEqual({
      id: 1,
      text: "a",
      status: "caught",
      passCount: 0,
      chamberIndex: 1,
    });
  });

  it("is a no-op when all chambers full", () => {
    const bullets: Bullet[] = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      text: `${i}`,
      status: "caught" as const,
      passCount: 0,
      chamberIndex: i,
    }));
    const incoming: Bullet = {
      id: 99,
      text: "x",
      status: "flying",
      passCount: 0,
      chamberIndex: null,
    };
    const next = catchBullet([...bullets, incoming], 99);
    expect(next.find((b) => b.id === 99)?.status).toBe("flying");
  });

  it("is a no-op when bullet is not flying or ricocheting", () => {
    const bullets: Bullet[] = [
      { id: 1, text: "a", status: "spent", passCount: 3, chamberIndex: null },
    ];
    const next = catchBullet(bullets, 1);
    expect(next[0].status).toBe("spent");
  });
});

describe("ricochetBullet", () => {
  it("increments pass count and sets ricocheting when under limit", () => {
    const b: Bullet = { id: 1, text: "a", status: "flying", passCount: 0, chamberIndex: null };
    expect(ricochetBullet(b)).toEqual({ ...b, status: "ricocheting", passCount: 1 });
  });

  it("marks spent at MAX_BULLET_PASSES", () => {
    const b: Bullet = { id: 1, text: "a", status: "ricocheting", passCount: 2, chamberIndex: null };
    expect(ricochetBullet(b)).toEqual({ ...b, status: "spent", passCount: 3 });
  });

  it("does not touch caught bullets", () => {
    const b: Bullet = { id: 1, text: "a", status: "caught", passCount: 0, chamberIndex: 0 };
    expect(ricochetBullet(b)).toBe(b);
  });
});

describe("chamberSnapshot", () => {
  it("returns caught bullets ordered by chamberIndex, filling to 6 with null", () => {
    const bullets: Bullet[] = [
      { id: 1, text: "a", status: "caught", passCount: 0, chamberIndex: 2 },
      { id: 2, text: "b", status: "caught", passCount: 1, chamberIndex: 0 },
      { id: 3, text: "c", status: "flying", passCount: 0, chamberIndex: null },
    ];
    const snap = chamberSnapshot(bullets);
    expect(snap).toHaveLength(6);
    expect(snap[0]?.id).toBe(2);
    expect(snap[1]).toBeNull();
    expect(snap[2]?.id).toBe(1);
    expect(snap[3]).toBeNull();
  });
});

describe("buildBulletSeed", () => {
  it("serializes caught bullets by chamber order into N::text lines", () => {
    const bullets: Bullet[] = [
      { id: 1, text: "a door", status: "caught", passCount: 0, chamberIndex: 1 },
      { id: 2, text: "red dust", status: "caught", passCount: 0, chamberIndex: 0 },
    ];
    expect(buildBulletSeed(bullets)).toBe("1::red dust\n2::a door");
  });
});
