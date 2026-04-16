"use client";

import { Check, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { MAX_KEPT_NOISE } from "@/lib/constants";
import { theme, mono, labelStyles } from "@/lib/theme";
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

  return (
    <div
      style={{
        marginBottom: 24,
        padding: "22px 22px 20px",
        borderRadius: 8,
        border: `1px solid ${theme.mossBorder16}`,
        background: "rgba(255,250,240,0.58)",
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
            ...labelStyles.micro,
            letterSpacing: 0.8,
            color: theme.moss78,
          }}
        >
          {t("noise_card_label")} {currentIndex} / {totalCount}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div
            style={{
              padding: "5px 9px",
              borderRadius: 999,
              background: theme.mossBg09,
              color: theme.moss,
              fontSize: 9,
              ...mono,
              letterSpacing: 0.8,
            }}
          >
            {keptCount} / {MAX_KEPT_NOISE} {t("noise_kept")}
          </div>
          <div
            style={{
              padding: "5px 9px",
              borderRadius: 999,
              background: theme.inkBg04,
              color: theme.ink5,
              fontSize: 9,
              ...mono,
              letterSpacing: 0.8,
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
          color: theme.ink85,
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
          color: theme.ink55,
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
            borderRadius: 8,
            border: `1px solid ${theme.redBorder18}`,
            background: theme.redBg06,
            color: theme.red85,
            fontSize: 11,
            ...mono,
            letterSpacing: 1,
            cursor: isBusy ? "default" : "pointer",
          }}
        >
          <span className="icon-text">
            <X size={14} strokeWidth={2} aria-hidden="true" />
            {t("noise_remove_action")}
          </span>
        </button>
        <button
          onClick={onKeep}
          disabled={isBusy || disableKeep}
          style={{
            padding: "16px 0",
            borderRadius: 8,
            border: `1px solid ${theme.mossBorder24}`,
            background: theme.mossBg09,
            color: theme.moss,
            fontSize: 11,
            ...mono,
            letterSpacing: 1,
            cursor: isBusy ? "default" : "pointer",
          }}
        >
          <span className="icon-text">
            {t("noise_keep_action")}
            <Check size={14} strokeWidth={2} aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  );
}
