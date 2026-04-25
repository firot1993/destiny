"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import { BulletField } from "@/components/BulletField";
import { AmmoHUD } from "@/components/AmmoHUD";
import { FireImpact } from "@/components/FireImpact";
import { StoryRating } from "@/components/StoryRating";
import { getOrCreateSessionUuid } from "@/lib/sessionId";
import { buildFieldsFromAnswers, randomizeQuestionnaireAnswers } from "@/lib/questionnaire";
import { buildStoryConditioning } from "@/lib/prompts";
import { PROVIDERS, DEFAULT_PROVIDER } from "@/lib/constants";
import { theme, mono, labelStyles } from "@/lib/theme";
import { previewBullets } from "@/lib/devPreview";
import type { CurationAnswers, QuestionnaireAnswers } from "@/types";
import { REVOLVER_CHAMBERS } from "@/types";

const IS_DEV = process.env.NODE_ENV === "development";

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

const profileTextBlockStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 8,
  background: "rgba(255,250,240,0.48)",
  border: `1px solid ${theme.inkBorder07}`,
  fontSize: 14,
  lineHeight: 1.6,
  color: theme.ink72,
};

const curationChoiceStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  textAlign: "left",
  borderRadius: 8,
  border: `1px solid ${theme.inkBorder08}`,
  background: "rgba(255,250,240,0.44)",
  color: theme.ink72,
  cursor: "pointer",
  fontSize: 14,
  lineHeight: 1.5,
};

const curationChoiceActiveStyle: React.CSSProperties = {
  ...curationChoiceStyle,
  border: `1px solid ${theme.mossBorder24}`,
  background: theme.mossBg09,
  color: theme.moss78,
};

const buttonStyles = {
  primary: {
    width: "100%",
    padding: "18px 0",
    background: theme.moss,
    border: `1px solid ${theme.mossBorder24}`,
    borderRadius: 8,
    cursor: "pointer",
    color: theme.paper,
    fontSize: 12,
    ...mono,
    fontWeight: 600,
    letterSpacing: 1.5,
    transition: "all 0.3s ease",
  } as React.CSSProperties,
  stop: {
    width: "100%",
    padding: "18px 0",
    background: theme.redBg08,
    border: `1px solid ${theme.redBorder22}`,
    borderRadius: 8,
    cursor: "pointer",
    color: theme.red85,
    fontSize: 12,
    ...mono,
    fontWeight: 600,
    letterSpacing: 1.5,
    transition: "all 0.3s ease",
  } as React.CSSProperties,
  secondary: {
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
  } as React.CSSProperties,
  fire: {
    width: "100%",
    padding: "18px 0",
    background: theme.moss,
    border: `1px solid ${theme.mossBorder24}`,
    borderRadius: 8,
    cursor: "pointer",
    color: theme.paper,
    fontSize: 12,
    ...mono,
    fontWeight: 700,
    letterSpacing: 1.5,
    transition: "all 0.3s ease",
    transform: "rotate(-1deg)",
    boxShadow: `3px 3px 0 ${theme.ink8}`,
  } as React.CSSProperties,
};

interface LocalizedChoice {
  value: string;
  label: {
    en: string;
    zh: string;
  };
}

const EMPTY_CURATION_ANSWERS: CurationAnswers = {
  whyThese: "",
  rejectedFuture: "",
};

const STEERING_DIRECTION_KEYS = [
  "deeper",
  "darker",
  "sharper",
  "concrete",
] as const;

const WHY_THESE_OPTIONS: LocalizedChoice[] = [
  {
    value: "They feel like my best life",
    label: {
      en: "They feel like my best life",
      zh: "它们像是我最想活出来的那种人生",
    },
  },
  {
    value: "They feel dangerous but true",
    label: {
      en: "They feel dangerous but true",
      zh: "它们危险，但是真的",
    },
  },
  {
    value: "They feel embarrassing to want",
    label: {
      en: "They feel embarrassing to want",
      zh: "它们是那种说出口会有点羞耻的想要",
    },
  },
  {
    value: "They feel more real than the rest",
    label: {
      en: "They feel more real than the rest",
      zh: "比起其他选项，它们更像真的",
    },
  },
  {
    value: "I don't know why, but they stick",
    label: {
      en: "I don't know why, but they stick",
      zh: "我也说不清为什么，但它们一直黏在我脑子里",
    },
  },
];

const REJECTED_FUTURE_OPTIONS: LocalizedChoice[] = [
  {
    value: "too safe",
    label: { en: "too safe", zh: "太安全" },
  },
  {
    value: "too performative",
    label: { en: "too performative", zh: "太表演" },
  },
  {
    value: "too lonely",
    label: { en: "too lonely", zh: "太孤独" },
  },
  {
    value: "too chaotic",
    label: { en: "too chaotic", zh: "太混乱" },
  },
  {
    value: "too ordinary",
    label: { en: "too ordinary", zh: "太普通" },
  },
  {
    value: "too borrowed from other people",
    label: { en: "too borrowed from other people", zh: "太像借来的别人剧本" },
  },
];

function choiceLabel(choice: LocalizedChoice, lang: "en" | "zh"): string {
  return choice.label[lang] ?? choice.label.en;
}

export default function Home() {
  const { t, lang, toggleLang } = useI18n();

  const [page, setPage] = useState<PageTab>("input");
  const [showSettings, setShowSettings] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] =
    useState<QuestionnaireAnswers>({});
  const [curationAnswers, setCurationAnswers] =
    useState<CurationAnswers>(EMPTY_CURATION_ANSWERS);
  const [big5, setBig5] = useState([5, 5, 5, 5, 5]);
  const [guidance, setGuidance] = useState(7);
  const [denoiseSteps, setDenoiseSteps] = useState(4);
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [model, setModel] = useState(PROVIDERS[DEFAULT_PROVIDER][0]);
  const [fireImpactActive, setFireImpactActive] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string>("");
  const [enableGeminiSearch, setEnableGeminiSearch] = useState(false);
  useEffect(() => {
    setSessionUuid(getOrCreateSessionUuid());
  }, []);
  const fields = useMemo(() => buildFieldsFromAnswers(questionnaireAnswers), [questionnaireAnswers]);
  const conditioning = useMemo(
    () => buildStoryConditioning(fields, big5, curationAnswers),
    [fields, big5, curationAnswers]
  );

  const updateBig5 = (idx: number, val: number) =>
    setBig5((b) => { const n = [...b]; n[idx] = val; return n; });

  const gen = useGeneration({
    fields,
    big5,
    questionnaireAnswers,
    curationAnswers,
    guidance,
    denoiseSteps,
    provider,
    model,
    lang,
    t,
    sessionUuid,
    enableGeminiSearch,
  });

  const handleFire = useCallback(() => {
    setFireImpactActive(true);
  }, []);

  const handleFireImpactComplete = useCallback(() => {
    setFireImpactActive(false);
    gen.generate();
  }, [gen]);

  const handlePassComplete = useCallback((bulletId: number) => {
    gen.ricochetSingle(bulletId);
  }, [gen]);

  const resetCuration = useCallback(() => {
    setCurationAnswers(EMPTY_CURATION_ANSWERS);
  }, []);

  const handleScan = useCallback(() => {
    resetCuration();
    return gen.scanNoiseFragments();
  }, [gen, resetCuration]);

  const handleReload = useCallback(() => {
    resetCuration();
    return gen.reloadScan();
  }, [gen, resetCuration]);

  const caughtCount = gen.bullets.filter((b) => b.status === "caught").length;
  const activeBulletsCount = gen.bullets.filter(
    (b) => b.status === "flying" || b.status === "ricocheting"
  ).length;
  const showCurationQuestions =
    caughtCount > 0 && (gen.runPhase === "ready" || activeBulletsCount === 0);
  const curationReady =
    curationAnswers.whyThese.length > 0 &&
    curationAnswers.rejectedFuture.length > 0;

  const guidanceLabels = useMemo(() => [
    "",
    ...Array.from({ length: 10 }, (_, i) => t(`guidance_${i + 1}`)),
  ], [t]);
  const kineticFontFamily =
    lang === "zh"
      ? "var(--serif-zh)"
      : "var(--display)";

  return (
    <div data-lang={lang} className="page-shell">
      <main className="page-frame">

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

            {/* Enhancement 7: Web search grounding toggle */}
            <div style={{ marginTop: 16 }}>
              <label
                style={{
                  ...labelStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={enableGeminiSearch}
                  onChange={(e) => setEnableGeminiSearch(e.target.checked)}
                  style={{ accentColor: theme.moss }}
                />
                {t("gemini_search_label")}
              </label>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  ...mono,
                  color: theme.ink3,
                  lineHeight: 1.5,
                }}
              >
                {t("gemini_search_hint")}
              </div>
            </div>
          </div>
        )}

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

        {IS_DEV && (
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <button
              onClick={() => {
                setQuestionnaireAnswers(randomizeQuestionnaireAnswers());
                setBig5(Array.from({ length: 5 }, () => 1 + Math.floor(Math.random() * 10)));
                setPage("generate");
              }}
              style={{ ...buttonStyles.secondary, fontSize: 10, opacity: 0.7, letterSpacing: 1 }}
            >
              ⚡ dev: randomize 01 + 02
            </button>
          </div>
        )}

        {page === "input" && (
          <InputForm
            answers={questionnaireAnswers}
            onAnswersChange={setQuestionnaireAnswers}
            onNext={() => setPage("big5")}
          />
        )}

        {page === "big5" && (
          <Big5Form
            big5={big5}
            onUpdate={updateBig5}
            onBack={() => setPage("input")}
            onNext={() => setPage("generate")}
          />
        )}

        {page === "generate" && (
          <div
            style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
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
                {conditioning.hardState.ageBand && (
                  <span style={profileChipStyle}>
                    {conditioning.hardState.ageBand}
                  </span>
                )}
                {conditioning.hardState.mobility && (
                  <span style={profileChipStyle}>
                    {conditioning.hardState.mobility}
                  </span>
                )}
                {conditioning.hardState.chapter && (
                  <span style={profileChipStyle}>
                    {conditioning.hardState.chapter}
                  </span>
                )}
                {conditioning.hardState.horizon && (
                  <span style={profileChipStyle}>
                    {conditioning.hardState.horizon}
                  </span>
                )}
                {conditioning.hardState.anchorResource && (
                  <span style={profileAccentChipStyle}>
                    {conditioning.hardState.anchorResource}
                  </span>
                )}
                {conditioning.hardState.anchorConstraint && (
                  <span style={profileAccentChipStyle}>
                    {conditioning.hardState.anchorConstraint}
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
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <div style={profileTextBlockStyle}>
                  <strong>{t("hidden_pressure_label")}:</strong>{" "}
                  {conditioning.latentForces.coreTension}
                </div>
                <div style={profileTextBlockStyle}>
                  <strong>{t("momentum_pattern_label")}:</strong>{" "}
                  {conditioning.latentForces.momentumPattern}
                </div>
                <div style={profileTextBlockStyle}>
                  <strong>{t("personality_signature_label")}:</strong>{" "}
                  {conditioning.personalitySignature.combinedReading}
                </div>
              </div>
            </div>

            <WorkflowRail stage={gen.workflowStage} />

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
                  {t("curate_stage_hint")}
                </div>
              </div>
            </div>

            {gen.bullets.length === 0 && !gen.isGenerating && (
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

            {(gen.runPhase === "reviewing" || gen.runPhase === "ready") && (
              <div className="bullet-stage" style={{ marginBottom: 24 }}>
                <AmmoHUD
                  bullets={gen.bullets}
                  loadedLabel={t("ammo_loaded_label")}
                />
                <BulletField
                  bullets={gen.bullets}
                  onCatch={gen.catchBullet}
                  onPassComplete={handlePassComplete}
                  fontFamily={kineticFontFamily}
                />
                {activeBulletsCount === 0 && !gen.isGenerating && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: 420,
                        padding: "16px 18px",
                        background: "rgba(255,250,240,0.92)",
                        border: `1px solid ${theme.inkBorder08}`,
                        borderRadius: 8,
                        boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          ...mono,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 0.9,
                          color: theme.moss78,
                          marginBottom: 8,
                        }}
                      >
                        {caughtCount > 0
                          ? t("bullet_round_ready_title")
                          : t("bullet_round_empty_title")}
                      </div>
                      <p
                        className="serif"
                        style={{
                          margin: 0,
                          fontSize: 15,
                          lineHeight: 1.65,
                          color: theme.ink75,
                        }}
                      >
                        {caughtCount > 0
                          ? t("bullet_round_ready_body")
                          : t("bullet_round_empty_body")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showCurationQuestions && (
              <div
                style={{
                  marginBottom: 24,
                  padding: "18px 22px",
                  background: "rgba(255,250,240,0.54)",
                  border: `1px solid ${theme.mossBorder16}`,
                  borderRadius: 8,
                }}
              >
                <div style={sectionLabelStyle}>{t("curation_title")}</div>
                <p
                  className="serif"
                  style={{
                    margin: "0 0 18px",
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: theme.ink72,
                  }}
                >
                  {t("curation_hint")}
                </p>

                <div style={{ display: "grid", gap: 20 }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 12 }}>
                      {t("curation_why_title")}
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {WHY_THESE_OPTIONS.map((option) => {
                        const active = curationAnswers.whyThese === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() =>
                              setCurationAnswers((prev) => ({
                                ...prev,
                                whyThese: option.value,
                              }))
                            }
                            style={active ? curationChoiceActiveStyle : curationChoiceStyle}
                          >
                            {choiceLabel(option, lang)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ ...labelStyle, marginBottom: 12 }}>
                      {t("curation_reject_title")}
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {REJECTED_FUTURE_OPTIONS.map((option) => {
                        const active =
                          curationAnswers.rejectedFuture === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() =>
                              setCurationAnswers((prev) => ({
                                ...prev,
                                rejectedFuture: option.value,
                              }))
                            }
                            style={active ? curationChoiceActiveStyle : curationChoiceStyle}
                          >
                            {choiceLabel(option, lang)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FireImpact
              active={fireImpactActive}
              onComplete={handleFireImpactComplete}
              label={t("bullet_fire")}
              fontFamily={kineticFontFamily}
            />

            {gen.bullets.length === 0 && !gen.isGenerating && (
              <button
                onClick={handleScan}
                style={buttonStyles.primary}
              >
                <span className="icon-text">
                  <Play size={13} strokeWidth={2} aria-hidden="true" />
                  {t("btn_scan_noise")}
                </span>
              </button>
            )}

            {IS_DEV && gen.bullets.length === 0 && !gen.isGenerating && (
              <button
                onClick={() => gen.previewAnimation(previewBullets())}
                style={{
                  ...buttonStyles.secondary,
                  marginTop: 8,
                  fontSize: 10,
                  opacity: 0.6,
                  letterSpacing: 1,
                }}
              >
                ⚡ preview animation
              </button>
            )}

            {gen.runPhase === "ready" && (
              <>
                {!curationReady && (
                  <div
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                      fontSize: 11,
                      ...mono,
                      color: theme.red85,
                      textAlign: "center",
                    }}
                  >
                    {t("curation_needed")}
                  </div>
                )}
                <button
                  onClick={handleFire}
                  disabled={gen.isGenerating || fireImpactActive || !curationReady}
                  style={{
                    ...buttonStyles.fire,
                    opacity:
                      gen.isGenerating || fireImpactActive || !curationReady
                        ? 0.5
                        : 1,
                  }}
                >
                  <span className="icon-text">
                    <Play size={13} strokeWidth={2} aria-hidden="true" />
                    [ {t("bullet_fire")} ]
                  </span>
                </button>
              </>
            )}

            {(gen.runPhase === "reviewing" || gen.runPhase === "ready") && (
              <button
                onClick={handleReload}
                disabled={gen.isGenerating}
                style={{
                  ...buttonStyles.secondary,
                  opacity: gen.isGenerating ? 0.5 : 1,
                }}
              >
                <span className="icon-text">
                  <RefreshCw size={13} strokeWidth={1.9} aria-hidden="true" />
                  [ {t("bullet_reload")} ]
                </span>
              </button>
            )}

            {IS_DEV &&
              (gen.runPhase === "reviewing" || gen.runPhase === "ready") &&
              caughtCount < REVOLVER_CHAMBERS && (
                <button
                  onClick={gen.catchAll}
                  disabled={gen.isGenerating}
                  style={{
                    ...buttonStyles.secondary,
                    opacity: gen.isGenerating ? 0.5 : 1,
                  }}
                >
                  <span className="icon-text">[ dev: catch all ]</span>
                </button>
              )}

            {gen.isGenerating && gen.runPhase === "denoising" && (
              <button
                onClick={gen.stopGeneration}
                style={buttonStyles.stop}
              >
                <span className="icon-text">
                  <Square size={13} strokeWidth={2} aria-hidden="true" />
                  {t("btn_stop")}
                </span>
              </button>
            )}

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
                    : `${t("progress_denoising")} ${caughtCount} ${t("merged_signals_label")}`}
                </div>
                <StepIndicator
                  currentStep={gen.currentStep}
                  totalSteps={denoiseSteps}
                  isGenerating
                />
                {gen.lastQualityScore > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 10,
                      ...mono,
                      color: gen.lastQualityScore >= 7 ? theme.moss62 : theme.ink38,
                    }}
                  >
                    {t("quality_score_label")}: {gen.lastQualityScore}/10
                  </div>
                )}
              </div>
            )}

            {/* Enhancement 5: Steering UI — shown during the steering pause */}
            {gen.runPhase === "steering" && (
              <div
                style={{
                  marginTop: 20,
                  padding: "18px 22px",
                  background: "rgba(255,250,240,0.54)",
                  border: `1px solid ${theme.mossBorder16}`,
                  borderRadius: 8,
                  animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <div style={sectionLabelStyle}>{t("steering_title")}</div>
                <p
                  className="serif"
                  style={{
                    margin: "0 0 12px",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: theme.ink72,
                  }}
                >
                  {t("steering_hint")}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {STEERING_DIRECTION_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() =>
                        gen.chooseSteeringDirection(t(`steering_${key}_note`))
                      }
                      style={{
                        ...buttonStyles.secondary,
                        marginTop: 0,
                        minHeight: 38,
                        padding: "9px 8px",
                        color: theme.moss78,
                        border: `1px solid ${theme.mossBorder16}`,
                        background: theme.mossBg06,
                        letterSpacing: 0.4,
                        lineHeight: 1.2,
                      }}
                    >
                      {t(`steering_${key}`)}
                    </button>
                  ))}
                  <button
                    onClick={() => gen.chooseSteeringDirection("")}
                    style={{
                      ...buttonStyles.secondary,
                      marginTop: 0,
                      minHeight: 38,
                      padding: "9px 8px",
                      letterSpacing: 0.4,
                      lineHeight: 1.2,
                    }}
                  >
                    {t("steering_keep")}
                  </button>
                </div>
                <input
                  type="text"
                  value={gen.steeringNote}
                  onChange={(e) => gen.setSteeringNote(e.target.value)}
                  placeholder={t("steering_placeholder")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: `1px solid ${theme.inkBorder08}`,
                    background: "rgba(255,250,240,0.7)",
                    fontSize: 14,
                    color: theme.ink72,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") gen.resumeFromSteering();
                  }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    onClick={gen.resumeFromSteering}
                    style={{
                      ...buttonStyles.primary,
                      flex: 1,
                      padding: "12px 0",
                    }}
                  >
                    {gen.steeringNote.trim()
                      ? t("steering_resume")
                      : t("steering_skip")}
                  </button>
                </div>
              </div>
            )}

            {/* Enhancement 2: Streaming text display */}
            {gen.streamingText && gen.isGenerating && (
              <div
                style={{
                  marginTop: 20,
                  padding: "18px 22px",
                  background: "rgba(255,250,240,0.54)",
                  border: `1px solid ${theme.inkBorder07}`,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    ...mono,
                    color: theme.ink35,
                    marginBottom: 10,
                    letterSpacing: 0.6,
                  }}
                >
                  {t("streaming_label")}
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: theme.ink72,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {gen.streamingText}
                </div>
              </div>
            )}

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

            {gen.trajectories.length > 0 && (
              <div
                style={{
                  marginTop: 40,
                  animation: "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <div style={sectionLabelStyle}>
                  {t("denoised_title")} — {caughtCount}{" "}
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
                {gen.runPhase === "complete" && (
                  <StoryRating sessionId={gen.sessionId} />
                )}
              </div>
            )}

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
