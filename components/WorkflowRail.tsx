"use client";

import { useI18n } from "@/i18n";
import { theme, mono } from "@/lib/theme";
import type { WorkflowStage } from "@/types";

interface WorkflowRailProps {
  stage: WorkflowStage;
}

export function WorkflowRail({ stage }: WorkflowRailProps) {
  const { t } = useI18n();
  const steps = [
    { id: "scan" as const, label: t("workflow_scan") },
    { id: "curate" as const, label: t("workflow_curate") },
    { id: "denoise" as const, label: t("workflow_denoise") },
  ];
  const activeIndex = steps.findIndex((item) => item.id === stage);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0,
        marginBottom: 24,
        borderTop: `1px solid ${theme.mossBorder16}`,
        borderBottom: `1px solid ${theme.mossBorder16}`,
      }}
    >
      {steps.map((item, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <div
            key={item.id}
            style={{
              padding: "14px 12px 12px",
              borderRight:
                index < steps.length - 1
                  ? `1px solid ${theme.inkBorder07}`
                  : "none",
              background: isActive
                ? theme.mossBg06
                : isComplete
                ? "rgba(255,250,240,0.38)"
                : "transparent",
            }}
          >
            <div
              style={{
                fontSize: 9,
                ...mono,
                letterSpacing: 0.6,
                color: isActive
                  ? theme.moss
                  : isComplete
                  ? theme.moss62
                  : theme.ink3,
              }}
            >
              0{index + 1}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                ...mono,
                letterSpacing: 0.4,
                color: isActive
                  ? theme.ink85
                  : theme.ink42,
              }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
