"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  HeartHandshake,
  ListChecks,
  UsersRound,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { BIG5_KEYS } from "@/lib/constants";
import { theme, mono } from "@/lib/theme";

interface Big5FormProps {
  big5: number[];
  onUpdate: (index: number, value: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const BIG5_ICON_COMPONENTS = [
  Brain,
  ListChecks,
  UsersRound,
  HeartHandshake,
  Activity,
];

export function Big5Form({ big5, onUpdate, onBack, onNext }: Big5FormProps) {
  const { t } = useI18n();

  return (
    <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <p
        style={{
          color: theme.ink6,
          fontSize: 14,
          marginBottom: 32,
          lineHeight: 1.7,
        }}
      >
        {t("big5_desc")}
      </p>
      {BIG5_KEYS.map((key, i) => {
        const TraitIcon = BIG5_ICON_COMPONENTS[i];
        return (
          <div
            key={key}
            style={{
              padding: "22px 24px",
              marginBottom: 12,
              background: "rgba(255,250,240,0.5)",
              border: `1px solid ${theme.inkBorder08}`,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    color: i % 2 === 0 ? theme.moss : theme.plum,
                    background: i % 2 === 0 ? theme.mossBg06 : theme.plumBg07,
                    border: `1px solid ${
                      i % 2 === 0 ? theme.mossBorder16 : theme.plumBorder18
                    }`,
                  }}
                >
                  <TraitIcon size={16} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span
                  style={{
                    fontSize: 12,
                    ...mono,
                    color: theme.ink75,
                    letterSpacing: 0.8,
                    fontWeight: 600,
                  }}
                >
                  {t(key)}
                </span>
              </div>
              <span
                style={{
                  fontSize: 20,
                  ...mono,
                  color: theme.moss,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {big5[i]}
              </span>
            </div>
            <div
              className="serif"
              style={{
                fontSize: 15,
                color: theme.ink72,
                marginBottom: 14,
                fontStyle: "italic",
              }}
            >
              {t(`${key}_q`)}
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={big5[i]}
              onChange={(e) => onUpdate(i, parseInt(e.target.value))}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  ...mono,
                  color: theme.ink32,
                }}
              >
                {t(`${key}_low`)}
              </span>
              <span
                style={{
                  fontSize: 10,
                  ...mono,
                  color: theme.ink32,
                }}
              >
                {t(`${key}_high`)}
              </span>
            </div>
          </div>
        );
      })}

      <div
        style={{
          marginTop: 20,
          padding: "16px 20px",
          background: theme.plumBg07,
          border: `1px solid ${theme.plumBorder18}`,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize: 9,
            ...mono,
            color: theme.plum72,
            letterSpacing: 0.8,
            marginBottom: 10,
          }}
        >
          {t("personality_vector")}
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            alignItems: "end",
          }}
        >
          {BIG5_KEYS.map((key, i) => (
            <div key={key} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 42,
                  height: 66,
                  borderRadius: 6,
                  border: `1px solid ${theme.inkBorder07}`,
                  background: "rgba(255,250,240,0.46)",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "center",
                  margin: "0 auto 6px",
                  padding: 5,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max(12, big5[i] * 5.4)}px`,
                    borderRadius: 4,
                    background:
                      i % 2 === 0
                        ? `rgba(38,84,68,${0.22 + big5[i] / 18})`
                        : `rgba(88,48,74,${0.18 + big5[i] / 20})`,
                    border: `1px solid ${
                      i % 2 === 0 ? theme.mossBorder24 : theme.plumBorder18
                    }`,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 8,
                  ...mono,
                  color: theme.ink32,
                  letterSpacing: 0.8,
                }}
              >
                {key.slice(0, 1).toUpperCase()} {big5[i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: "14px 0",
            background: "none",
            border: `1px solid ${theme.inkBorder09}`,
            borderRadius: 8,
            color: theme.ink42,
            fontSize: 11,
            ...mono,
            letterSpacing: 0.8,
            cursor: "pointer",
          }}
        >
          <span className="icon-text">
            <ArrowLeft size={13} strokeWidth={1.9} aria-hidden="true" />
            {t("back_state")}
          </span>
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 2,
            padding: "14px 0",
            background: theme.moss,
            border: `1px solid ${theme.mossBorder24}`,
            borderRadius: 8,
            color: theme.paper,
            fontSize: 11,
            ...mono,
            letterSpacing: 0.8,
            cursor: "pointer",
          }}
        >
          <span className="icon-text">
            {t("next_generate")}
            <ArrowRight size={13} strokeWidth={1.9} aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  );
}
