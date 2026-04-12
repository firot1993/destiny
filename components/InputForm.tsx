"use client";

import { useI18n } from "@/i18n";
import { INPUT_FIELDS } from "@/lib/constants";
import type { Fields } from "@/types";

interface InputFormProps {
  fields: Fields;
  onFieldChange: (key: keyof Fields, value: string) => void;
  onNext: () => void;
}

const mono = { fontFamily: "'JetBrains Mono', monospace" };

function inputStyle(type: string): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: type === "short" ? "10px 14px" : "12px 16px",
    color: "#fff",
    fontSize: 15,
    fontFamily: "'Source Serif 4', 'Noto Serif SC', Georgia, serif",
    lineHeight: 1.6,
    resize: "none" as const,
  };
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  ...mono,
  color: "rgba(255,255,255,0.5)",
  fontWeight: 500,
  letterSpacing: 1.5,
  marginBottom: 10,
};

export function InputForm({ fields, onFieldChange, onNext }: InputFormProps) {
  const { t } = useI18n();
  const hasMinInput = fields.age || fields.skills || fields.obsessions;

  return (
    <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 14,
          marginBottom: 28,
          lineHeight: 1.7,
        }}
      >
        {t("state_desc")}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {INPUT_FIELDS.filter((f) => f.type === "short").map((f) => (
          <div key={f.key}>
            <label style={labelStyle}>{t(f.key)}</label>
            <input
              value={fields[f.key as keyof Fields]}
              onChange={(e) =>
                onFieldChange(f.key as keyof Fields, e.target.value)
              }
              placeholder={t(`${f.key}_placeholder`)}
              style={inputStyle("short")}
            />
          </div>
        ))}
      </div>
      {INPUT_FIELDS.filter((f) => f.type !== "short").map((f) => (
        <div key={f.key} style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t(f.key)}</label>
          <textarea
            value={fields[f.key as keyof Fields]}
            onChange={(e) =>
              onFieldChange(f.key as keyof Fields, e.target.value)
            }
            placeholder={t(`${f.key}_placeholder`)}
            rows={f.type === "long" ? 3 : 2}
            style={inputStyle(f.type)}
          />
        </div>
      ))}
      <button
        onClick={onNext}
        disabled={!hasMinInput}
        style={{
          width: "100%",
          padding: "16px 0",
          marginTop: 12,
          background: hasMinInput
            ? "rgba(255,170,40,0.1)"
            : "rgba(255,255,255,0.02)",
          border: `1px solid ${
            hasMinInput ? "rgba(255,170,40,0.2)" : "rgba(255,255,255,0.05)"
          }`,
          borderRadius: 10,
          cursor: hasMinInput ? "pointer" : "default",
          color: hasMinInput
            ? "rgba(255,170,40,0.85)"
            : "rgba(255,255,255,0.15)",
          fontSize: 12,
          ...mono,
          letterSpacing: 2,
        }}
      >
        {t("next_personality")}
      </button>
    </div>
  );
}
