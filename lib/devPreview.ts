import { fragmentToBullet } from "@/lib/revolver";
import type { Bullet } from "@/types";

// Ten fixed fragments that cover varied text lengths and personalities —
// enough to exercise the full BulletField animation without an LLM call.
const PREVIEW_FRAGMENTS = [
  "a held breath",
  "red dust on an open road",
  "the last thing she said",
  "a locked door with no key",
  "rain on a tin roof at 3am",
  "a stranger's face in a crowd",
  "the moment before the jump",
  "an empty chair at the table",
  "a name carved into soft wood",
  "the first time you felt free",
];

export function previewBullets(): Bullet[] {
  return PREVIEW_FRAGMENTS.map((text, i) =>
    fragmentToBullet({ id: i + 1, text })
  );
}
