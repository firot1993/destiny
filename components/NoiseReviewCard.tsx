"use client";

import { useI18n } from "@/i18n";
import { MAX_KEPT_NOISE } from "@/lib/constants";
import type { NoiseFragment } from "@/types";

interface NoiseReviewCardProps {
  fragment: NoiseFragment;
  currentIndex: number;
  totalCount: number;
  keptCount: number;
  onRemove: () => void;
  onKeep: () => void;
  disableRemove: boolean;
  disableKeep: boolean;
  isBusy: boolean;
}

export function NoiseReviewCard({
  fragment,
  currentIndex,
  totalCount,
  keptCount,
  onRemove,
  onKeep,
  disableRemove,
  disableKeep,
  isBusy,
}: NoiseReviewCardProps) {
  const { t } = useI18n();
  const keepSlotsLeft = Math.max(0, MAX_KEPT_NOISE - keptCount);
  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div
      style={{
        marginBottom: 24,
        padding: "22px 22px 20px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 9,
            ...mono,
            letterSpacing: 2,
            color: "rgba(255,170,40,0.52)",
          }}
        >
          {t("noise_card_label")} {currentIndex} / {totalCount}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div
            style={{
              padding: "5px 9px",
              borderRadius: 999,
              background: "rgba(255,170,40,0.08)",
              color: "rgba(255,170,40,0.78)",
              fontSize: 9,
              ...mono,
              letterSpacing: 1.2,
            }}
          >
            {keptCount} / {MAX_KEPT_NOISE} {t("noise_kept")}
          </div>
          <div
            style={{
              padding: "5px 9px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.44)",
              fontSize: 9,
              ...mono,
              letterSpacing: 1.2,
            }}
          >
            {keepSlotsLeft} {t("noise_keep_slots_left")}
          </div>
        </div>
      </div>

      <p
        className="serif"
        style={{
          margin: "0 0 18px",
          fontSize: 17,
          lineHeight: 1.85,
          color: "rgba(255,255,255,0.9)",
          fontStyle: "italic",
        }}
      >
        {fragment.text}
      </p>

      <p
        className="serif"
        style={{
          margin: "0 0 18px",
          fontSize: 14,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.58)",
        }}
      >
        {t("noise_review_hint")}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button
          onClick={onRemove}
          disabled={isBusy || disableRemove}
          style={{
            padding: "16px 0",
            borderRadius: 10,
            border: "1px solid rgba(255,90,90,0.18)",
            background: "rgba(255,70,50,0.08)",
            color: "rgba(255,120,120,0.85)",
            fontSize: 11,
            ...mono,
            letterSpacing: 2,
            cursor: isBusy ? "default" : "pointer",
          }}
        >
          {t("noise_remove_action")}
        </button>
        <button
          onClick={onKeep}
          disabled={isBusy || disableKeep}
          style={{
            padding: "16px 0",
            borderRadius: 10,
            border: "1px solid rgba(255,170,40,0.24)",
            background: "rgba(255,170,40,0.1)",
            color: "rgba(255,170,40,0.88)",
            fontSize: 11,
            ...mono,
            letterSpacing: 2,
            cursor: isBusy ? "default" : "pointer",
          }}
        >
          {t("noise_keep_action")}
        </button>
      </div>
    </div>
  );
}
