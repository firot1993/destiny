"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/i18n";
import { getStepLabel } from "@/lib/prompts";
import { theme, mono } from "@/lib/theme";

interface TrajectoryCardProps {
  trajectory: string;
  index: number;
  stepOutputs?: string[];
}

export function TrajectoryCard({
  trajectory,
  index,
  stepOutputs,
}: TrajectoryCardProps) {
  const [showSteps, setShowSteps] = useState(false);
  const { t } = useI18n();

  return (
    <div
      className="trajectory-card"
      style={{
        background: "rgba(255,250,240,0.62)",
        border: `1px solid ${theme.mossBorder16}`,
        borderRadius: 8,
        padding: 28,
        marginBottom: 16,
        position: "relative",
        animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 20,
          fontSize: 11,
          ...mono,
          color: theme.moss78,
          letterSpacing: 0.8,
          fontWeight: 600,
        }}
      >
        {t("trajectory_label")} {index + 1}
      </div>
      <div style={{ paddingRight: 60 }}>
        {trajectory
          .split(/\n{2,}/)
          .map((para) => para.trim())
          .filter(Boolean)
          .map((para, i, arr) => (
            <p
              key={i}
              className="serif"
              style={{
                color: theme.ink85,
                fontSize: 16,
                lineHeight: 1.85,
                margin: 0,
                marginBottom: i < arr.length - 1 ? 16 : 0,
              }}
            >
              {para}
            </p>
          ))}
      </div>
      {stepOutputs && stepOutputs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => setShowSteps(!showSteps)}
            style={{
              background: "none",
              border: `1px solid ${theme.mossBorder16}`,
              borderRadius: 8,
              padding: "5px 12px",
              color: theme.moss62,
              fontSize: 10,
              cursor: "pointer",
              ...mono,
              letterSpacing: 0.6,
            }}
          >
            <span className="icon-text">
              {showSteps ? (
                <ChevronUp size={13} strokeWidth={1.9} aria-hidden="true" />
              ) : (
                <ChevronDown size={13} strokeWidth={1.9} aria-hidden="true" />
              )}
              {showSteps ? t("hide_steps") : t("show_steps")}
            </span>
          </button>
          {showSteps && (
            <div style={{ marginTop: 14 }}>
              {stepOutputs.map((step, si) => {
                const p = si / (stepOutputs.length || 1);
                return (
                  <div
                    key={si}
                    className="step-reveal"
                    style={{
                      padding: "14px 18px",
                      marginBottom: 6,
                      background: `rgba(38,84,68,${0.035 + p * 0.055})`,
                      borderLeft: `2px solid rgba(38,84,68,${0.16 + p * 0.44})`,
                      borderRadius: "0 8px 8px 0",
                      animationDelay: `${si * 0.08}s`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        ...mono,
                        color: `rgba(38,84,68,${0.58 + p * 0.32})`,
                        marginBottom: 6,
                        letterSpacing: 0.8,
                        fontWeight: 600,
                      }}
                    >
                      Step {si + 1} — {getStepLabel(si, stepOutputs.length, t)}
                    </div>
                    <p
                      style={{
                        color: `rgba(0,0,0,${0.55 + p * 0.3})`,
                        fontSize: 14,
                        lineHeight: 1.7,
                        margin: 0,
                        fontFamily:
                          p < 0.4
                            ? mono.fontFamily
                            : "var(--serif-zh)",
                        fontStyle: si === 0 ? "italic" : "normal",
                      }}
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
