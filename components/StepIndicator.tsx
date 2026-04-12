"use client";

import { useI18n } from "@/i18n";
import { getStepLabel } from "@/lib/prompts";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isGenerating: boolean;
}

const mono = { fontFamily: "'JetBrains Mono', monospace" };

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
                  ? "rgba(255,170,40,0.9)"
                  : i === currentStep && isGenerating
                  ? "rgba(255,170,40,0.2)"
                  : "rgba(255,255,255,0.04)",
              color:
                i < currentStep
                  ? "#08080e"
                  : i === currentStep && isGenerating
                  ? "rgba(255,170,40,0.9)"
                  : "rgba(255,255,255,0.15)",
              border:
                i === currentStep && isGenerating
                  ? "1px solid rgba(255,170,40,0.4)"
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
                    ? "rgba(255,170,40,0.3)"
                    : "rgba(255,255,255,0.04)",
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
          color: "rgba(255,255,255,0.25)",
          letterSpacing: 1,
        }}
      >
        {isGenerating ? getStepLabel(currentStep, totalSteps, t) : ""}
      </span>
    </div>
  );
}
