"use client";
import { motion as m } from "framer-motion";
import { chamberSnapshot } from "@/lib/revolver";
import { motion as motionTokens } from "@/lib/motion";
import { CartridgeIcon } from "@/components/CartridgeIcon";
import { theme, mono } from "@/lib/theme";
import type { Bullet } from "@/types";
import { REVOLVER_CHAMBERS } from "@/types";

interface AmmoHUDProps {
  bullets: Bullet[];
}

export function AmmoHUD({ bullets }: AmmoHUDProps) {
  const chambers = chamberSnapshot(bullets);
  const caughtCount = chambers.filter(Boolean).length;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 5,
        padding: "10px 14px",
        background: "rgba(255,250,240,0.92)",
        border: `1.5px solid ${theme.ink8}`,
        borderRadius: 4,
        boxShadow: `3px 3px 0 ${theme.moss62}`,
        transform: "rotate(-1.2deg)",
      }}
      data-testid="ammo-hud"
    >
      <div
        style={{
          fontSize: 10,
          ...mono,
          letterSpacing: 1.2,
          color: theme.ink8,
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        [ LOADED · {caughtCount} / {REVOLVER_CHAMBERS} ]
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {chambers.map((bullet, i) => {
          const loaded = bullet !== null;
          return (
            <m.div
              key={i}
              data-testid="cartridge-slot"
              data-loaded={loaded}
              initial={false}
              animate={
                loaded
                  ? { scale: [1, motionTokens.catchScalePulse, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: motionTokens.catchPulseDurationMs / 1000 }}
            >
              <CartridgeIcon loaded={loaded} />
            </m.div>
          );
        })}
      </div>
    </div>
  );
}
