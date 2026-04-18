"use client";
import { motion as m, AnimatePresence } from "framer-motion";
import { motion as motionTokens } from "@/lib/motion";
import { theme } from "@/lib/theme";

export interface Burst {
  id: string;
  x: number;
  y: number;
}

interface CatchBurstProps {
  bursts: Burst[];
}

export function CatchBurst({ bursts }: CatchBurstProps) {
  const count = motionTokens.catchBurstShardCount;
  const distance = motionTokens.catchBurstShardDistancePx;
  const duration = motionTokens.catchBurstDurationMs / 1000;
  const flashDuration = motionTokens.catchBurstFlashMs / 1000;

  return (
    <AnimatePresence>
      {bursts.map((b) => (
        <div
          key={b.id}
          className="catch-burst"
          style={{ left: b.x, top: b.y, width: 0, height: 0 }}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.2, 1.4, 1.9] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: flashDuration * 2.2,
              times: [0, 0.22, 1],
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              left: -48,
              top: -48,
              width: 96,
              height: 96,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,250,240,0.95) 0%, rgba(255,250,240,0) 68%)",
              pointerEvents: "none",
            }}
          />
          {Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2 + 0.35;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            const rot = ((i * 57) % 60) - 30;
            return (
              <m.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
                animate={{
                  x: dx,
                  y: dy,
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.1, 0.6],
                  rotate: rot,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration,
                  ease: [0.22, 1, 0.3, 1],
                  times: [0, 0.25, 1],
                }}
                style={{
                  position: "absolute",
                  left: -3,
                  top: -7,
                  width: 6,
                  height: 14,
                  background: theme.ink8,
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                  transformOrigin: "center",
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </div>
      ))}
    </AnimatePresence>
  );
}
