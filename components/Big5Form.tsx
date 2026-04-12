"use client";

import { useI18n } from "@/i18n";
import { BIG5_KEYS, BIG5_ICONS } from "@/lib/constants";

interface Big5FormProps {
  big5: number[];
  onUpdate: (index: number, value: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const mono = { fontFamily: "'JetBrains Mono', monospace" };

export function Big5Form({ big5, onUpdate, onBack, onNext }: Big5FormProps) {
  const { t } = useI18n();

  return (
    <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 14,
          marginBottom: 32,
          lineHeight: 1.7,
        }}
      >
        {t("big5_desc")}
      </p>
      {BIG5_KEYS.map((key, i) => (
        <div
          key={key}
          style={{
            padding: "22px 24px",
            marginBottom: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
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
              <span style={{ fontSize: 16, color: "rgba(255,170,40,0.7)" }}>
                {BIG5_ICONS[i]}
              </span>
              <span
                style={{
                  fontSize: 12,
                  ...mono,
                  color: "rgba(255,170,40,0.7)",
                  letterSpacing: 1,
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
                color: "rgba(255,170,40,0.9)",
                fontWeight: 700,
              }}
            >
              {big5[i]}
            </span>
          </div>
          <div
            className="serif"
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.8)",
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
                color: "rgba(255,255,255,0.18)",
              }}
            >
              {t(`${key}_low`)}
            </span>
            <span
              style={{
                fontSize: 10,
                ...mono,
                color: "rgba(255,255,255,0.18)",
              }}
            >
              {t(`${key}_high`)}
            </span>
          </div>
        </div>
      ))}

      <div
        style={{
          marginTop: 20,
          padding: "16px 20px",
          background: "rgba(255,170,40,0.03)",
          border: "1px solid rgba(255,170,40,0.1)",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontSize: 9,
            ...mono,
            color: "rgba(255,170,40,0.4)",
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          {t("personality_vector")}
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {BIG5_KEYS.map((key, i) => (
            <div key={key} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `rgba(255,170,40,${big5[i] / 15})`,
                  border: `1.5px solid rgba(255,170,40,${big5[i] / 12})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  ...mono,
                  color: "rgba(255,255,255,0.7)",
                  margin: "0 auto 6px",
                }}
              >
                {big5[i]}
              </div>
              <div
                style={{
                  fontSize: 8,
                  ...mono,
                  color: "rgba(255,255,255,0.2)",
                  letterSpacing: 1,
                }}
              >
                {key.slice(0, 1).toUpperCase()}
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
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            color: "rgba(255,255,255,0.3)",
            fontSize: 11,
            ...mono,
            letterSpacing: 2,
            cursor: "pointer",
          }}
        >
          {t("back_state")}
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 2,
            padding: "14px 0",
            background: "rgba(255,170,40,0.1)",
            border: "1px solid rgba(255,170,40,0.2)",
            borderRadius: 10,
            color: "rgba(255,170,40,0.85)",
            fontSize: 11,
            ...mono,
            letterSpacing: 2,
            cursor: "pointer",
          }}
        >
          {t("next_generate")}
        </button>
      </div>
    </div>
  );
}
