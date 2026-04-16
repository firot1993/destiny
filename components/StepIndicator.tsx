"use client";

import { useI18n } from "@/i18n";
import { getStepLabel } from "@/lib/prompts";
import { theme, mono } from "@/lib/theme";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isGenerating: boolean;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  isGenerating,
}: StepIndicatorProps) {
  const { t } = useI18n();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "16px 0",
        flexWrap: "wrap",
      }}
    >
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              ...mono,
              background:
                i < currentStep
                  ? theme.moss
                  : i === currentStep && isGenerating
                  ? theme.mossBg09
                  : theme.inkBg05,
              color:
                i < currentStep
                  ? theme.surface
                  : i === currentStep && isGenerating
                  ? theme.moss
                  : theme.ink28,
              border:
                i === currentStep && isGenerating
                  ? `1px solid ${theme.mossBorder24}`
                  : "1px solid transparent",
              transition: "all 0.5s ease",
              animation:
                i === currentStep && isGenerating
                  ? "pulse 1.5s ease-in-out infinite"
                  : "none",
            }}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              style={{
                width: 20,
                height: 1,
                background:
                  i < currentStep
                    ? theme.mossBorder24
                    : theme.inkBorder08,
              }}
            />
          )}
        </div>
      ))}
      <span
        style={{
          marginLeft: 6,
          fontSize: 10,
          ...mono,
          color: theme.ink38,
          letterSpacing: 0.6,
        }}
      >
        {isGenerating ? getStepLabel(currentStep, totalSteps, t) : ""}
      </span>
    </div>
  );
}
