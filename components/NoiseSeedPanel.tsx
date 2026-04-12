"use client";

import { useI18n } from "@/i18n";
import { MAX_KEPT_NOISE } from "@/lib/constants";
import type { NoiseFragment, MergedNoisePlan, MergeRevealStage } from "@/types";

interface NoiseSeedPanelProps {
  keptFragments: NoiseFragment[];
  mergedPlan: MergedNoisePlan | null;
  showMergedState?: boolean;
  revealStage?: MergeRevealStage;
}

export function NoiseSeedPanel({
  keptFragments,
  mergedPlan,
  showMergedState = false,
  revealStage = "idle",
}: NoiseSeedPanelProps) {
  const { t } = useI18n();
  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  const showMergedFragments = showMergedState && revealStage === "revealed";
  const isGlitchStage = showMergedState && revealStage === "glitch";
  const displayFragments = showMergedFragments
    ? mergedPlan?.fragments ?? []
    : keptFragments;
  const droppedFragmentId = mergedPlan?.droppedFragment?.id ?? null;

  if (displayFragments.length === 0) return null;

  return (
    <div
      style={{
        marginBottom: 24,
        padding: "18px 22px 22px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 9,
            ...mono,
            color: "rgba(255,170,40,0.42)",
            letterSpacing: 2,
          }}
        >
          {showMergedFragments ? t("merged_seed_title") : t("kept_signals_title")}
        </div>
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
          {displayFragments.length} / {MAX_KEPT_NOISE}{" "}
          {showMergedFragments ? t("merged_signals_label") : t("noise_kept")}
        </div>
      </div>

      {showMergedState && revealStage !== "revealed" && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              ...mono,
              letterSpacing: 1.4,
              color: "rgba(255,255,255,0.58)",
            }}
          >
            {t("noise_choice_locked")}
          </div>
        </div>
      )}

      {showMergedFragments && mergedPlan?.wildcardFragment && (
        <>
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,70,50,0.08)",
              border: "1px solid rgba(255,70,50,0.16)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                ...mono,
                letterSpacing: 1.6,
                color: "rgba(255,120,120,0.9)",
                marginBottom: 5,
              }}
            >
              {t("noise_system_override")}
            </div>
          </div>
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,170,40,0.08)",
              border: "1px solid rgba(255,170,40,0.14)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                ...mono,
                letterSpacing: 1.4,
                color: "rgba(255,170,40,0.82)",
                marginBottom: 5,
              }}
            >
              {t("noise_wildcard_label")}
            </div>
            <p
              className="serif"
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              {t("merged_seed_hint")}
            </p>
          </div>
        </>
      )}

      {showMergedFragments && mergedPlan?.droppedFragment && (
        <div
          style={{
            marginBottom: 12,
            fontSize: 11,
            ...mono,
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1.7,
          }}
        >
          {t("noise_dropped_label")}: {mergedPlan.droppedFragment.text}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {displayFragments.map((fragment, index) => (
          <div
            key={fragment.id}
            style={{
              padding: "14px 16px",
              position: "relative",
              overflow: "hidden",
              borderRadius: 10,
              background:
                isGlitchStage && fragment.id === droppedFragmentId
                  ? "rgba(255,70,50,0.12)"
                  : fragment.mergeSource === "wildcard"
                  ? "rgba(255,170,40,0.1)"
                  : "rgba(255,170,40,0.04)",
              border: `1px solid ${
                isGlitchStage && fragment.id === droppedFragmentId
                  ? "rgba(255,70,50,0.28)"
                  : fragment.mergeSource === "wildcard"
                  ? "rgba(255,170,40,0.28)"
                  : "rgba(255,170,40,0.1)"
              }`,
              animation:
                isGlitchStage && fragment.id === droppedFragmentId
                  ? "signalGlitch 0.24s steps(2, end) infinite"
                  : showMergedFragments && fragment.mergeSource === "wildcard"
                  ? "signalIntrude 0.55s cubic-bezier(0.16, 1, 0.3, 1) both"
                  : "none",
            }}
          >
            {isGlitchStage && fragment.id === droppedFragmentId && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,40,40,0.08)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    top: "50%",
                    height: 4,
                    borderRadius: 999,
                    background: "rgba(255,70,50,0.92)",
                    transform: "rotate(-5deg)",
                    boxShadow: "0 0 14px rgba(255,70,50,0.5)",
                    animation: "redStrikeFlash 0.45s linear infinite",
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  ...mono,
                  letterSpacing: 2,
                  color: "rgba(255,170,40,0.48)",
                }}
              >
                {t("noise_card_label")} {index + 1}
              </div>
              {(showMergedFragments || isGlitchStage) && (
                <div
                  style={{
                    padding: "4px 8px",
                    borderRadius: 999,
                    background:
                      isGlitchStage && fragment.id === droppedFragmentId
                        ? "rgba(255,70,50,0.18)"
                        : fragment.mergeSource === "wildcard"
                        ? "rgba(255,170,40,0.18)"
                        : "rgba(255,255,255,0.05)",
                    color:
                      isGlitchStage && fragment.id === droppedFragmentId
                        ? "rgba(255,120,120,0.9)"
                        : fragment.mergeSource === "wildcard"
                        ? "rgba(255,170,40,0.9)"
                        : "rgba(255,255,255,0.55)",
                    fontSize: 8,
                    ...mono,
                    letterSpacing: 1.4,
                  }}
                >
                  {isGlitchStage && fragment.id === droppedFragmentId
                    ? t("noise_dropped_label")
                    : fragment.mergeSource === "wildcard"
                    ? t("noise_wildcard_label")
                    : t("noise_selected_label")}
                </div>
              )}
            </div>
            {showMergedFragments && fragment.mergeSource === "wildcard" && (
              <div
                style={{
                  fontSize: 10,
                  ...mono,
                  letterSpacing: 1.3,
                  color: "rgba(255,170,40,0.72)",
                  marginBottom: 8,
                }}
              >
                {t("noise_wildcard_hint")}
              </div>
            )}
            <p
              className="serif"
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.7,
                color:
                  isGlitchStage && fragment.id === droppedFragmentId
                    ? "rgba(255,210,210,0.88)"
                    : "rgba(255,255,255,0.84)",
                fontStyle: "italic",
                textDecoration:
                  isGlitchStage && fragment.id === droppedFragmentId
                    ? "line-through"
                    : "none",
                textDecorationColor: "rgba(255,70,50,0.92)",
                textDecorationThickness: 3,
              }}
            >
              {fragment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
