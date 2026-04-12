"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { getStepLabel } from "@/lib/prompts";

interface TrajectoryCardProps {
  trajectory: string;
  index: number;
  stepOutputs?: string[];
  totalSteps: number;
}

export function TrajectoryCard({
  trajectory,
  index,
  stepOutputs,
  totalSteps,
}: TrajectoryCardProps) {
  const [showSteps, setShowSteps] = useState(false);
  const { t } = useI18n();

  return (
    <div
      className="trajectory-card"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
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
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(255,170,40,0.6)",
          letterSpacing: 2,
          fontWeight: 600,
        }}
      >
        {t("trajectory_label")} {index + 1}
      </div>
      <p
        className="serif"
        style={{
          color: "#fff",
          fontSize: 16,
          lineHeight: 1.85,
          margin: 0,
          paddingRight: 60,
        }}
      >
        {trajectory}
      </p>
      {stepOutputs && stepOutputs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => setShowSteps(!showSteps)}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 6,
              padding: "5px 12px",
              color: "rgba(255,255,255,0.25)",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: 1,
            }}
          >
            {showSteps ? t("hide_steps") : t("show_steps")}
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
                      background: `rgba(255,170,40,${0.015 + p * 0.03})`,
                      borderLeft: `2px solid rgba(255,170,40,${0.12 + p * 0.5})`,
                      borderRadius: "0 8px 8px 0",
                      animationDelay: `${si * 0.08}s`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: `rgba(255,170,40,${0.5 + p * 0.5})`,
                        marginBottom: 6,
                        letterSpacing: 2,
                        fontWeight: 600,
                      }}
                    >
                      STEP {si + 1} — {getStepLabel(si, stepOutputs.length, t)}
                    </div>
                    <p
                      style={{
                        color: `rgba(255,255,255,${0.6 + p * 0.4})`,
                        fontSize: 14,
                        lineHeight: 1.7,
                        margin: 0,
                        fontFamily:
                          p < 0.4
                            ? "'JetBrains Mono', monospace"
                            : "'Source Serif 4', 'Noto Serif SC', Georgia, serif",
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
