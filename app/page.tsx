"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Languages,
  Play,
  RefreshCw,
  Settings,
  Square,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useGeneration } from "@/hooks/useGeneration";
import { InputForm } from "@/components/InputForm";
import { Big5Form } from "@/components/Big5Form";
import { WorkflowRail } from "@/components/WorkflowRail";
import { StepIndicator } from "@/components/StepIndicator";
import { TrajectoryCard } from "@/components/TrajectoryCard";
import { NoiseReviewCard } from "@/components/NoiseReviewCard";
import { NoiseSeedPanel } from "@/components/NoiseSeedPanel";
import { buildFieldsFromAnswers } from "@/lib/questionnaire";
import { PROVIDERS, DEFAULT_PROVIDER } from "@/lib/constants";
import { theme, mono, labelStyles } from "@/lib/theme";
import type { QuestionnaireAnswers } from "@/types";

type PageTab = "input" | "big5" | "generate";

const labelStyle = labelStyles.field;

const sectionLabelStyle: React.CSSProperties = {
  ...labelStyles.section,
  marginBottom: 10,
};

const profileChipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "6px 10px",
  borderRadius: 999,
  border: `1px solid ${theme.inkBorder07}`,
  background: "rgba(255,250,240,0.48)",
  fontSize: 11,
  color: theme.ink55,
  ...mono,
};

const profileAccentChipStyle: React.CSSProperties = {
  ...profileChipStyle,
  border: `1px solid ${theme.mossBorder16}`,
  background: theme.mossBg06,
  color: theme.moss78,
};

export default function Home() {
  const { t, lang, toggleLang } = useI18n();

  // Page / settings state
  const [page, setPage] = useState<PageTab>("input");
  const [showSettings, setShowSettings] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] =
    useState<QuestionnaireAnswers>({});
  const [big5, setBig5] = useState([5, 5, 5, 5, 5]);
  const [guidance, setGuidance] = useState(7);
  const [denoiseSteps, setDenoiseSteps] = useState(4);
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [model, setModel] = useState(PROVIDERS[DEFAULT_PROVIDER][0]);
  const [enableWildcard, setEnableWildcard] = useState(true);
  const fields = useMemo(() => buildFieldsFromAnswers(questionnaireAnswers), [questionnaireAnswers]);

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
    enableWildcard,
  });

  const guidanceLabels = useMemo(() => [
    "",
    ...Array.from({ length: 10 }, (_, i) => t(`guidance_${i + 1}`)),
  ], [t]);

  return (
    <div data-lang={lang} className="page-shell">
      <main className="page-frame">

        {/* ─── Header ─── */}
        <header className="page-header">
          <div>
            <div className="page-kicker">{t("subtitle")}</div>
            <h1
              className="destiny-title serif"
              style={{
                fontFamily:
                  lang === "zh"
                    ? "var(--serif-zh)"
                    : "var(--display)",
              }}
            >
              <span>{t("title_1")}</span>
              <span className="title-offset">{t("title_2")}</span>
            </h1>
            <div className="title-rule" />
          </div>
          <div className="header-actions">
            <button
              className="utility-button"
              aria-label={lang === "en" ? "Switch to Chinese" : "切换到英文"}
              onClick={toggleLang}
            >
              <Languages size={14} strokeWidth={1.8} aria-hidden="true" />
              {lang === "en" ? "中文" : "EN"}
            </button>
            <button
              className="utility-button icon-only"
              data-active={showSettings ? "true" : "false"}
              aria-label={t("settings")}
              onClick={() => setShowSettings(!showSettings)}
              title={t("settings")}
            >
              <Settings size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ─── Settings panel ─── */}
        {showSettings && (
          <div className="settings-panel">
            <div
              style={{
                ...sectionLabelStyle,
                color: theme.moss78,
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
                          ? theme.mossBg09
                          : "rgba(255,250,240,0.44)",
                      border: `1px solid ${
                        provider === p
                          ? theme.mossBorder24
                          : theme.inkBorder07
                      }`,
                      borderRadius: 8,
                      cursor: "pointer",
                      color:
                        provider === p
                          ? theme.moss
                          : theme.ink5,
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
                          ? theme.mossBg09
                          : "rgba(255,250,240,0.44)",
                      border: `1px solid ${
                        model === modelOption
                          ? theme.mossBorder24
                          : theme.inkBorder07
                      }`,
                      borderRadius: 8,
                      cursor: "pointer",
                      color:
                        model === modelOption
                          ? theme.moss
                          : theme.ink5,
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
        <nav className="page-tabs" aria-label="Destiny setup steps">
          {(
            [
              { id: "input" as const, label: t("tab_state") },
              { id: "big5" as const, label: t("tab_personality") },
              { id: "generate" as const, label: t("tab_generate") },
            ] as { id: PageTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              className="page-tab"
              data-active={page === tab.id ? "true" : "false"}
              onClick={() => setPage(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ─── PAGE 1: STATE ─── */}
        {page === "input" && (
          <InputForm
            answers={questionnaireAnswers}
            onAnswersChange={setQuestionnaireAnswers}
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
                background: "rgba(255,250,240,0.54)",
                border: `1px solid ${theme.mossBorder16}`,
                borderRadius: 8,
              }}
            >
              <div style={sectionLabelStyle}>
                {t("encoded_state")}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {fields.age && (
                  <span style={profileChipStyle}>
                    Age {fields.age}
                  </span>
                )}
                {fields.location && (
                  <span style={profileChipStyle}>
                    {fields.location}
                  </span>
                )}
                {fields.currentMode && (
                  <span style={profileChipStyle}>
                    {fields.currentMode}
                  </span>
                )}
                {fields.trajectoryFocus && (
                  <span style={profileAccentChipStyle}>
                    {fields.trajectoryFocus}
                  </span>
                )}
                {fields.workStyle && (
                  <span style={profileChipStyle}>
                    {fields.workStyle}
                  </span>
                )}
                {fields.riskTolerance && (
                  <span style={profileChipStyle}>
                    {fields.riskTolerance}
                  </span>
                )}
                {fields.timeHorizon && (
                  <span style={profileChipStyle}>
                    {fields.timeHorizon}
                  </span>
                )}
                <span style={profileChipStyle}>
                  Big5 [{big5.join(",")}]
                </span>
                <span style={profileAccentChipStyle}>
                  {provider}
                </span>
                <span style={profileChipStyle}>
                  {model}
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
                    color: theme.moss62,
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
                    color: theme.plum72,
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
                  background: theme.plumBg07,
                  border: `1px solid ${theme.plumBorder18}`,
                  borderRadius: 8,
                }}
              >
                <div style={{ ...labelStyle, marginBottom: 10 }}>
                  {t("latent_scan_label")}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: theme.plum,
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
                    color: theme.ink38,
                    lineHeight: 1.7,
                  }}
                >
                  {t("latent_scan_rule")}
                </div>
              </div>
            </div>

            {/* Wildcard toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                marginBottom: 32,
                marginTop: -12,
                background: theme.inkBg025,
                border: `1px solid ${theme.mossBorder16}`,
                borderRadius: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    ...mono,
                    color: theme.ink5,
                    fontWeight: 500,
                    letterSpacing: 0.6,
                    marginBottom: 3,
                  }}
                >
                  {t("wildcard_label")}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.ink38,
                    ...mono,
                  }}
                >
                  {t("wildcard_hint")}
                </div>
              </div>
              <button
                role="switch"
                aria-checked={enableWildcard}
                aria-label={t("wildcard_label")}
                onClick={() => setEnableWildcard((v) => !v)}
                style={{
                  flexShrink: 0,
                  marginLeft: 16,
                  width: 44,
                  height: 24,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: enableWildcard
                    ? theme.moss78
                    : theme.inkBorder12,
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: enableWildcard ? 23 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: theme.surface,
                    transition: "left 0.2s ease",
                  }}
                />
              </button>
            </div>

            {/* Empty noise placeholder */}
            {gen.noiseFragments.length === 0 && !gen.isGenerating && (
              <div
                style={{
                  marginBottom: 24,
                  padding: "18px 22px",
                  background: theme.inkBg025,
                  border: `1px solid ${theme.inkBorder07}`,
                  borderRadius: 8,
                }}
              >
                <div style={{ ...sectionLabelStyle, marginBottom: 10 }}>
                  {t("noise_title")}
                </div>
                <p
                  className="serif"
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: theme.ink6,
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
                  background: theme.inkBg025,
                  border: `1px solid ${theme.inkBorder07}`,
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
                    marginBottom: 10,
                  }}
                >
                  <div style={{ ...labelStyles.section, marginBottom: 0 }}>
                    {t("noise_title")}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                      {gen.keptNoiseFragments.length} / 5 {t("noise_kept")}
                    </div>
                    <div
                      style={{
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: theme.inkBg04,
                        color: theme.ink5,
                        fontSize: 9,
                        ...mono,
                        letterSpacing: 0.8,
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
                    color: theme.ink6,
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
                    ? theme.redBg08
                    : theme.moss,
                  border: `1px solid ${
                    gen.isGenerating
                      ? theme.redBorder22
                      : theme.mossBorder24
                  }`,
                  borderRadius: 8,
                  cursor: "pointer",
                  color: gen.isGenerating
                    ? theme.red85
                    : theme.paper,
                  fontSize: 12,
                  ...mono,
                  fontWeight: 600,
                  letterSpacing: 1.5,
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
                <span className="icon-text">
                  {gen.isGenerating ? (
                    <Square size={13} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <Play size={13} strokeWidth={2} aria-hidden="true" />
                  )}
                  {gen.isGenerating
                    ? t("btn_stop")
                    : gen.isMergeRevealPending
                    ? t("btn_preparing_merge")
                    : gen.noiseFragments.length > 0
                    ? t("btn_denoise_merged")
                    : t("btn_scan_noise")}
                </span>
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
                  border: `1px solid ${theme.inkBorder08}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  color: theme.ink38,
                  fontSize: 10,
                  ...mono,
                  letterSpacing: 1,
                }}
              >
                <span className="icon-text">
                  <RefreshCw size={13} strokeWidth={1.9} aria-hidden="true" />
                  {t("btn_rescan")}
                </span>
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
                      ? theme.red85
                      : theme.ink3,
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
                    color: theme.ink35,
                    marginBottom: 6,
                    letterSpacing: 0.6,
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
                  background: theme.redBg05,
                  border: `1px solid ${theme.redBorder14}`,
                  borderRadius: 8,
                  fontSize: 12,
                  color: theme.red88,
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
                <div style={sectionLabelStyle}>
                  {t("denoised_title")} — {gen.keptNoiseFragments.length}{" "}
                  {t("merged_signals_label")} — {t("guidance_label")} {guidance} —{" "}
                  {t("steps_label")} {denoiseSteps}
                </div>
                {gen.trajectories.map((traj, i) => (
                  <TrajectoryCard
                    key={i}
                    trajectory={traj}
                    index={i}
                    stepOutputs={gen.allStepOutputs[i]}
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
                    border: `1px solid ${theme.inkBorder07}`,
                    borderRadius: 8,
                    color: theme.ink35,
                    fontSize: 10,
                    ...mono,
                    letterSpacing: 1,
                    cursor: "pointer",
                  }}
                >
                  <span className="icon-text">
                    <ArrowLeft size={13} strokeWidth={1.9} aria-hidden="true" />
                    {t("edit_state")}
                  </span>
                </button>
                <button
                  onClick={() => setPage("big5")}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    background: "none",
                    border: `1px solid ${theme.inkBorder07}`,
                    borderRadius: 8,
                    color: theme.ink35,
                    fontSize: 10,
                    ...mono,
                    letterSpacing: 1,
                    cursor: "pointer",
                  }}
                >
                  <span className="icon-text">
                    <ArrowLeft size={13} strokeWidth={1.9} aria-hidden="true" />
                    {t("edit_personality")}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
