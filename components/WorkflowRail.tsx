"use client";

import { useI18n } from "@/i18n";
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
        gap: 10,
        marginBottom: 24,
      }}
    >
      {steps.map((item, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <div
            key={item.id}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${
                isActive
                  ? "rgba(255,170,40,0.28)"
                  : isComplete
                  ? "rgba(255,170,40,0.14)"
                  : "rgba(255,255,255,0.06)"
              }`,
              background: isActive
                ? "rgba(255,170,40,0.08)"
                : isComplete
                ? "rgba(255,170,40,0.04)"
                : "rgba(255,255,255,0.02)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 2,
                color: isActive
                  ? "rgba(255,170,40,0.82)"
                  : isComplete
                  ? "rgba(255,170,40,0.48)"
                  : "rgba(255,255,255,0.2)",
              }}
            >
              0{index + 1}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1.6,
                color: isActive
                  ? "rgba(255,255,255,0.88)"
                  : "rgba(255,255,255,0.34)",
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
