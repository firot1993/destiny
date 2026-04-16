"use client";

import { useI18n } from "@/i18n";
import { MAX_KEPT_NOISE } from "@/lib/constants";
import { theme, mono, labelStyles } from "@/lib/theme";
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
        background: "rgba(255,250,240,0.56)",
        border: `1px solid ${theme.mossBorder16}`,
        borderRadius: 8,
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
            ...labelStyles.section,
            color: theme.moss78,
          }}
        >
          {showMergedFragments ? t("merged_seed_title") : t("kept_signals_title")}
        </div>
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
          {displayFragments.length} / {MAX_KEPT_NOISE}{" "}
          {showMergedFragments ? t("merged_signals_label") : t("noise_kept")}
        </div>
      </div>

      {showMergedState && revealStage !== "revealed" && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255,250,240,0.48)",
            border: `1px solid ${theme.mossBorder16}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              ...mono,
              letterSpacing: 0.8,
              color: theme.ink55,
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
              borderRadius: 8,
              background: theme.redBg06,
              border: `1px solid ${theme.redBorder16}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                ...mono,
                letterSpacing: 0.8,
                color: theme.red88,
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
              borderRadius: 8,
              background: theme.plumBg07,
              border: `1px solid ${theme.plumBorder18}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                ...mono,
                letterSpacing: 0.8,
                color: theme.plum72,
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
                color: theme.ink65,
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
            color: theme.ink42,
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
              borderRadius: 8,
              background:
                isGlitchStage && fragment.id === droppedFragmentId
                  ? theme.redBg08
                : fragment.mergeSource === "wildcard"
                  ? theme.plumBg07
                  : theme.mossBg06,
              border: `1px solid ${
                isGlitchStage && fragment.id === droppedFragmentId
                  ? theme.redBorder25
                : fragment.mergeSource === "wildcard"
                  ? theme.plumBorder18
                  : theme.mossBorder16
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
                    background: theme.redBg06,
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
                    background: theme.red88,
                    transform: "rotate(-5deg)",
                    boxShadow: `0 0 14px ${theme.redBorder25}`,
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
                  letterSpacing: 0.8,
                  color: theme.moss62,
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
                        ? theme.redBorder16
                      : fragment.mergeSource === "wildcard"
                        ? theme.plumBg07
                        : theme.inkBg05,
                    color:
                      isGlitchStage && fragment.id === droppedFragmentId
                        ? theme.red9
                      : fragment.mergeSource === "wildcard"
                        ? theme.plum72
                        : theme.ink55,
                    fontSize: 8,
                    ...mono,
                    letterSpacing: 0.6,
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
                  letterSpacing: 0.6,
                  color: theme.plum72,
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
                    ? theme.red85
                    : theme.ink8,
                fontStyle: "italic",
                textDecoration:
                  isGlitchStage && fragment.id === droppedFragmentId
                    ? "line-through"
                    : "none",
                textDecorationColor: theme.red88,
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
