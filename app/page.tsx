"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { useGeneration } from "@/hooks/useGeneration";
import { InputForm } from "@/components/InputForm";
import { Big5Form } from "@/components/Big5Form";
import { WorkflowRail } from "@/components/WorkflowRail";
import { StepIndicator } from "@/components/StepIndicator";
import { TrajectoryCard } from "@/components/TrajectoryCard";
import { NoiseReviewCard } from "@/components/NoiseReviewCard";
import { NoiseSeedPanel } from "@/components/NoiseSeedPanel";
import { PROVIDERS, DEFAULT_PROVIDER } from "@/lib/constants";
import type { Fields } from "@/types";

type PageTab = "input" | "big5" | "generate";

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  ...mono,
  color: "rgba(255,255,255,0.5)",
  fontWeight: 500,
  letterSpacing: 1.5,
  marginBottom: 10,
};

export default function Home() {
  const { t, lang, toggleLang } = useI18n();

  // Page / settings state
  const [page, setPage] = useState<PageTab>("input");
  const [showSettings, setShowSettings] = useState(false);
  const [fields, setFields] = useState<Fields>({
    age: "",
    location: "",
    skills: "",
    resources: "",
    constraints: "",
    obsessions: "",
  });
  const [big5, setBig5] = useState([5, 5, 5, 5, 5]);
  const [guidance, setGuidance] = useState(7);
  const [denoiseSteps, setDenoiseSteps] = useState(4);
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [model, setModel] = useState(PROVIDERS[DEFAULT_PROVIDER][0]);

  const updateField = (key: keyof Fields, val: string) =>
    setFields((f) => ({ ...f, [key]: val }));
  const updateBig5 = (idx: number, val: number) =>
    setBig5((b) => { const n = [...b]; n[idx] = val; return n; });

  // Generation hook
  const gen = useGeneration({
    fields,
    big5,
    guidance,
    denoiseSteps,
    provider,
    model,
    lang,
    t,
  });

  const guidanceLabels = [
    "",
    ...Array.from({ length: 10 }, (_, i) => t(`guidance_${i + 1}`)),
  ];

  return (
    <div data-lang={lang} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ─── Header ─── */}
        <div style={{ marginBottom: 44, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              display: "flex",
              gap: 8,
            }}
          >
            <button
              onClick={toggleLang}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                padding: "5px 12px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                ...mono,
              }}
            >
              {lang === "en" ? "中文" : "EN"}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: showSettings
                  ? "rgba(255,170,40,0.1)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  showSettings
                    ? "rgba(255,170,40,0.2)"
                    : "rgba(255,255,255,0.08)"
                }`,
                borderRadius: 6,
                padding: "5px 12px",
                cursor: "pointer",
                color: showSettings
                  ? "rgba(255,170,40,0.7)"
                  : "rgba(255,255,255,0.4)",
                fontSize: 11,
                ...mono,
              }}
            >
              ⚙
            </button>
          </div>
          <div
            style={{
              fontSize: 9,
              ...mono,
              color: "rgba(255,170,40,0.45)",
              letterSpacing: 4,
              marginBottom: 14,
            }}
          >
            {t("subtitle")}
          </div>
          <h1
            className="serif"
            style={{
              fontFamily:
                lang === "zh"
                  ? "'Noto Serif SC', serif"
                  : "'Playfair Display', Georgia, serif",
              fontSize: lang === "zh" ? 36 : 40,
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.1,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,170,40,0.65))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("title_1")}
            <br />
            {t("title_2")}
          </h1>
        </div>

        {/* ─── Settings panel ─── */}
        {showSettings && (
          <div
            style={{
              marginBottom: 28,
              padding: "20px 24px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                ...mono,
                color: "rgba(255,170,40,0.4)",
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              {t("settings")}
            </div>

            <div>
              <label style={labelStyle}>{t("provider_label")}</label>
              <div style={{ display: "grid", gap: 8 }}>
                {Object.keys(PROVIDERS).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setProvider(p);
                      setModel(PROVIDERS[p][0]);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      textAlign: "left",
                      background:
                        provider === p
                          ? "rgba(255,170,40,0.1)"
                          : "rgba(255,255,255,0.02)",
                      border: `1px solid ${
                        provider === p
                          ? "rgba(255,170,40,0.25)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                      borderRadius: 8,
                      cursor: "pointer",
                      color:
                        provider === p
                          ? "rgba(255,170,40,0.88)"
                          : "rgba(255,255,255,0.45)",
                      fontSize: 11,
                      ...mono,
                      letterSpacing: 1,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>{t("model_label")}</label>
              <div style={{ display: "grid", gap: 8 }}>
                {PROVIDERS[provider].map((modelOption) => (
                  <button
                    key={modelOption}
                    onClick={() => setModel(modelOption)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      textAlign: "left",
                      background:
                        model === modelOption
                          ? "rgba(255,170,40,0.1)"
                          : "rgba(255,255,255,0.02)",
                      border: `1px solid ${
                        model === modelOption
                          ? "rgba(255,170,40,0.25)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                      borderRadius: 8,
                      cursor: "pointer",
                      color:
                        model === modelOption
                          ? "rgba(255,170,40,0.88)"
                          : "rgba(255,255,255,0.45)",
                      fontSize: 11,
                      ...mono,
                      letterSpacing: 0.4,
                    }}
                  >
                    {modelOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tabs ─── */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 36,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {(
            [
              { id: "input" as const, label: t("tab_state") },
              { id: "big5" as const, label: t("tab_personality") },
              { id: "generate" as const, label: t("tab_generate") },
            ] as { id: PageTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom:
                  page === tab.id
                    ? "2px solid rgba(255,170,40,0.7)"
                    : "2px solid transparent",
                padding: "10px 16px",
                cursor: "pointer",
                color:
                  page === tab.id
                    ? "rgba(255,170,40,0.9)"
                    : "rgba(255,255,255,0.45)",
                fontSize: 11,
                ...mono,
                letterSpacing: 1.5,
                transition: "all 0.3s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── PAGE 1: STATE ─── */}
        {page === "input" && (
          <InputForm
            fields={fields}
            onFieldChange={updateField}
            onNext={() => setPage("big5")}
          />
        )}

        {/* ─── PAGE 2: BIG FIVE ─── */}
        {page === "big5" && (
          <Big5Form
            big5={big5}
            onUpdate={updateBig5}
            onBack={() => setPage("input")}
            onNext={() => setPage("generate")}
          />
        )}

        {/* ─── PAGE 3: GENERATE ─── */}
        {page === "generate" && (
          <div
            style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            {/* Encoded state summary */}
            <div
              style={{
                padding: "18px 22px",
                marginBottom: 28,
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  ...mono,
                  color: "rgba(255,170,40,0.35)",
                  letterSpacing: 2,
                  marginBottom: 10,
                }}
              >
                {t("encoded_state")}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {fields.age && (
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", ...mono }}
                  >
                    age:{fields.age}
                  </span>
                )}
                {fields.location && (
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", ...mono }}
                  >
                    loc:{fields.location}
                  </span>
                )}
                <span
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", ...mono }}
                >
                  big5:[{big5.join(",")}]
                </span>
                <span
                  style={{ fontSize: 12, color: "rgba(255,170,40,0.35)", ...mono }}
                >
                  via:{provider}
                </span>
                <span
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", ...mono }}
                >
                  model:{model}
                </span>
              </div>
            </div>

            <WorkflowRail stage={gen.workflowStage} />

            {/* Guidance + Steps sliders */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 20,
                marginBottom: 32,
              }}
            >
              <div>
                <label style={{ ...labelStyle, marginBottom: 14 }}>
                  {t("guidance_label")} — {guidance}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={guidance}
                  onChange={(e) => setGuidance(parseInt(e.target.value))}
                />
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    ...mono,
                    color: "rgba(255,170,40,0.45)",
                  }}
                >
                  {guidanceLabels[guidance]}
                </div>
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: 14 }}>
                  {t("steps_label")} — {denoiseSteps}
                </label>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={denoiseSteps}
                  onChange={(e) => setDenoiseSteps(parseInt(e.target.value))}
                />
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    ...mono,
                    color: "rgba(255,170,40,0.45)",
                  }}
                >
                  {denoiseSteps <= 2
                    ? t("steps_low")
                    : denoiseSteps <= 4
                    ? t("steps_mid")
                    : denoiseSteps <= 6
                    ? t("steps_high")
                    : t("steps_ultra")}
                </div>
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                }}
              >
                <div style={{ ...labelStyle, marginBottom: 10 }}>
                  {t("latent_scan_label")}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "rgba(255,170,40,0.88)",
                    ...mono,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  10
                </div>
                <div
                  style={{
                    fontSize: 11,
                    ...mono,
                    color: "rgba(255,255,255,0.24)",
                    lineHeight: 1.7,
                  }}
                >
                  {t("latent_scan_rule")}
                </div>
              </div>
            </div>

            {/* Empty noise placeholder */}
            {gen.noiseFragments.length === 0 && !gen.isGenerating && (
              <div
                style={{
                  marginBottom: 24,
                  padding: "18px 22px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
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
                  {t("noise_title")}
                </div>
                <p
                  className="serif"
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.62)",
                  }}
                >
                  {t("scan_empty")}
                </p>
              </div>
            )}

            {/* Fragment review card */}
            {gen.currentNoiseFragment && (
              <NoiseReviewCard
                fragment={gen.currentNoiseFragment}
                currentIndex={gen.currentNoiseIndex + 1}
                totalCount={gen.noiseFragments.length}
                keptCount={gen.keptNoiseFragments.length}
                onRemove={() => gen.decideCurrentNoise("remove")}
                onKeep={() => gen.decideCurrentNoise("keep")}
                disableRemove={!gen.canRemoveCurrentNoise}
                disableKeep={!gen.canKeepCurrentNoise}
                isBusy={gen.isGenerating}
              />
            )}

            {/* Post-review summary */}
            {gen.noiseFragments.length > 0 && !gen.currentNoiseFragment && (
              <div
                style={{
                  marginBottom: 24,
                  padding: "18px 22px",
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
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      ...mono,
                      color: "rgba(255,170,40,0.4)",
                      letterSpacing: 2,
                    }}
                  >
                    {t("noise_title")}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div
                      style={{
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: "rgba(255,170,40,0.08)",
                        color: "rgba(255,170,40,0.76)",
                        fontSize: 9,
                        ...mono,
                        letterSpacing: 1.2,
                      }}
                    >
                      {gen.keptNoiseFragments.length} / 5 {t("noise_kept")}
                    </div>
                    <div
                      style={{
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.45)",
                        fontSize: 9,
                        ...mono,
                        letterSpacing: 1.2,
                      }}
                    >
                      {gen.removedNoiseCount} / 5 {t("noise_deleted")}
                    </div>
                  </div>
                </div>
                <p
                  className="serif"
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.62)",
                  }}
                >
                  {gen.isMergeRevealPending
                    ? t("noise_choice_locked")
                    : t("noise_ready_hint")}
                </p>
              </div>
            )}

            <NoiseSeedPanel
              keptFragments={gen.keptNoiseFragments}
              mergedPlan={gen.mergedNoisePlan}
              showMergedState={
                !gen.currentNoiseFragment && gen.noiseFragments.length > 0
              }
              revealStage={gen.mergeRevealStage}
            />

            {/* Main action button */}
            {!gen.currentNoiseFragment && (
              <button
                onClick={
                  gen.isGenerating
                    ? gen.stopGeneration
                    : gen.noiseFragments.length > 0
                    ? gen.denoiseSelectedNoise
                    : gen.scanNoiseFragments
                }
                disabled={
                  (!gen.isGenerating &&
                    gen.noiseFragments.length > 0 &&
                    gen.keptNoiseFragments.length === 0) ||
                  (!gen.isGenerating && gen.isMergeRevealPending)
                }
                style={{
                  width: "100%",
                  padding: "18px 0",
                  background: gen.isGenerating
                    ? "rgba(255,70,50,0.12)"
                    : "rgba(255,170,40,0.1)",
                  border: `1px solid ${
                    gen.isGenerating
                      ? "rgba(255,70,50,0.25)"
                      : "rgba(255,170,40,0.22)"
                  }`,
                  borderRadius: 10,
                  cursor: "pointer",
                  color: gen.isGenerating
                    ? "rgba(255,70,50,0.85)"
                    : "rgba(255,170,40,0.85)",
                  fontSize: 12,
                  ...mono,
                  fontWeight: 600,
                  letterSpacing: 3,
                  transition: "all 0.3s ease",
                  opacity:
                    (!gen.isGenerating &&
                      gen.noiseFragments.length > 0 &&
                      gen.keptNoiseFragments.length === 0) ||
                    (!gen.isGenerating && gen.isMergeRevealPending)
                      ? 0.3
                      : 1,
                }}
              >
                {gen.isGenerating
                  ? t("btn_stop")
                  : gen.isMergeRevealPending
                  ? t("btn_preparing_merge")
                  : gen.noiseFragments.length > 0
                  ? t("btn_denoise_merged")
                  : t("btn_scan_noise")}
              </button>
            )}

            {/* Rescan button */}
            {gen.noiseFragments.length > 0 && !gen.isGenerating && (
              <button
                onClick={gen.scanNoiseFragments}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  marginTop: 10,
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.38)",
                  fontSize: 10,
                  ...mono,
                  letterSpacing: 2,
                }}
              >
                {t("btn_rescan")}
              </button>
            )}

            {/* Daily quota */}
            {gen.dailyRemaining !== null && gen.dailyLimit !== null && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 10,
                  ...mono,
                  color:
                    gen.dailyRemaining < 50
                      ? "rgba(255,90,90,0.7)"
                      : "rgba(255,255,255,0.25)",
                  textAlign: "right",
                }}
              >
                {gen.dailyRemaining} / {gen.dailyLimit} requests remaining today
              </div>
            )}

            {/* Progress */}
            {gen.isGenerating && (
              <div
                style={{
                  marginTop: 20,
                  animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    ...mono,
                    color: "rgba(255,255,255,0.2)",
                    marginBottom: 6,
                  }}
                >
                  {gen.runPhase === "scanning"
                    ? t("progress_scanning")
                    : `${t("progress_denoising")} ${gen.keptNoiseFragments.length} ${t("merged_signals_label")}`}
                </div>
                <StepIndicator
                  currentStep={gen.currentStep}
                  totalSteps={denoiseSteps}
                  isGenerating
                />
              </div>
            )}

            {/* Error */}
            {gen.error && (
              <div
                style={{
                  marginTop: 18,
                  padding: "12px 18px",
                  background: "rgba(255,50,50,0.07)",
                  border: "1px solid rgba(255,50,50,0.15)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "rgba(255,90,90,0.85)",
                  ...mono,
                }}
              >
                {gen.error}
              </div>
            )}

            {/* Results */}
            {gen.trajectories.length > 0 && (
              <div
                style={{
                  marginTop: 40,
                  animation: "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    ...mono,
                    color: "rgba(255,170,40,0.35)",
                    letterSpacing: 3,
                    marginBottom: 20,
                  }}
                >
                  {t("denoised_title")} — {gen.keptNoiseFragments.length}{" "}
                  {t("merged_signals_label")} — {t("guidance_label")} {guidance} —{" "}
                  {t("steps_label")} {denoiseSteps} — BIG5 [{big5.join(",")}]
                </div>
                {gen.trajectories.map((traj, i) => (
                  <TrajectoryCard
                    key={i}
                    trajectory={traj}
                    index={i}
                    stepOutputs={gen.allStepOutputs[i]}
                    totalSteps={denoiseSteps}
                  />
                ))}
              </div>
            )}

            {/* Edit state / personality nav */}
            {!gen.isGenerating && gen.trajectories.length === 0 && (
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  onClick={() => setPage("input")}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    color: "rgba(255,255,255,0.2)",
                    fontSize: 10,
                    ...mono,
                    letterSpacing: 2,
                    cursor: "pointer",
                  }}
                >
                  {t("edit_state")}
                </button>
                <button
                  onClick={() => setPage("big5")}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    color: "rgba(255,255,255,0.2)",
                    fontSize: 10,
                    ...mono,
                    letterSpacing: 2,
                    cursor: "pointer",
                  }}
                >
                  {t("edit_personality")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
