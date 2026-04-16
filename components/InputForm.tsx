"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useI18n } from "@/i18n";
import {
  getQuestionnaireSteps,
  normalizeQuestionnaireAnswers,
  type LocalizedText,
} from "@/lib/questionnaire";
import type { QuestionnaireAnswers } from "@/types";
import { theme, mono } from "@/lib/theme";

interface InputFormProps {
  answers: QuestionnaireAnswers;
  onAnswersChange: (answers: QuestionnaireAnswers) => void;
  onNext: () => void;
}

const inactiveButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "20px 52px 20px 22px",
  textAlign: "left",
  borderRadius: 8,
  border: `1px solid ${theme.inkBorder16}`,
  background: "rgba(255,253,246,0.9)",
  color: theme.ink85,
  fontSize: 18,
  fontWeight: 600,
  cursor: "pointer",
  position: "relative",
  minHeight: 78,
  lineHeight: 1.38,
};

const activeButtonStyle: React.CSSProperties = {
  ...inactiveButtonStyle,
  border: `1px solid ${theme.mossBorder38}`,
  background: "linear-gradient(135deg, rgba(232,246,237,0.96), rgba(255,253,246,0.96))",
  color: theme.ink88,
  boxShadow: `inset 5px 0 0 ${theme.moss}, 0 10px 22px rgba(38,84,68,0.12)`,
};

const primaryButtonStyle: React.CSSProperties = {
  border: `1px solid ${theme.mossBorder24}`,
  background: theme.moss,
  color: theme.paper,
  borderRadius: 8,
  padding: "12px 20px",
  fontSize: 11,
  letterSpacing: 0.8,
  cursor: "pointer",
  fontWeight: 600,
  ...mono,
};

const ghostButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: theme.ink65,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 0.6,
  cursor: "pointer",
  padding: 0,
  ...mono,
};

export function InputForm({ answers, onAnswersChange, onNext }: InputFormProps) {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const safeAnswers = normalizeQuestionnaireAnswers(answers);

  const questions = useMemo(() => getQuestionnaireSteps(safeAnswers), [safeAnswers]);
  const current = questions[step];
  const selectedValues = safeAnswers[current.id] ?? [];
  const selectedOptions = current.options.filter((option) =>
    selectedValues.includes(option.value)
  );
  const isLast = step === questions.length - 1;
  const routeLabel = current.routeLabel ? copyForLang(current.routeLabel, lang) : null;
  const description = current.description ? copyForLang(current.description, lang) : null;
  const helperText =
    current.mode === "multi"
      ? lang === "zh"
        ? `最多选择 ${current.maxSelect ?? 1} 项`
        : `Select up to ${current.maxSelect ?? 1}`
      : lang === "zh"
      ? "选择 1 项"
      : "Choose 1";

  function updateAnswers(questionId: string, nextValues: string[]) {
    const nextAnswers = { ...safeAnswers };
    if (nextValues.length > 0) nextAnswers[questionId] = nextValues;
    else delete nextAnswers[questionId];
    onAnswersChange(normalizeQuestionnaireAnswers(nextAnswers));
  }

  function advance() {
    if (isLast) onNext();
    else setStep((value) => value + 1);
  }

  function chooseSingle(value: string) {
    updateAnswers(current.id, [value]);
    advance();
  }

  function toggleMulti(value: string) {
    const alreadySelected = selectedValues.includes(value);
    if (alreadySelected) {
      updateAnswers(
        current.id,
        selectedValues.filter((item) => item !== value)
      );
      return;
    }
    if ((current.maxSelect ?? Number.POSITIVE_INFINITY) <= selectedValues.length) {
      return;
    }
    updateAnswers(current.id, [...selectedValues, value]);
  }

  function skipCurrentStep() {
    updateAnswers(current.id, []);
    advance();
  }

  function goBack() {
    setStep((value) => Math.max(0, value - 1));
  }

  function continueFromMulti() {
    advance();
  }

  return (
    <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, justifyContent: "center" }}>
        {Array.from({ length: questions.length }).map((_, index) => (
          <div
            key={index}
            style={{
              height: 4,
              borderRadius: 999,
              width: index === step ? 24 : 6,
              background:
                index === step
                  ? theme.moss
                  : index < step
                  ? theme.mossBorder24
                  : theme.inkBorder12,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      <div
        style={{
          marginBottom: 34,
          textAlign: "center",
          fontSize: 10,
          ...mono,
          color: theme.ink55,
          fontWeight: 600,
          letterSpacing: 0.8,
        }}
      >
        {(step + 1).toString().padStart(2, "0")} / {questions.length.toString().padStart(2, "0")}
      </div>

      <div
        key={`${current.id}-${step}`}
        style={{ animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {routeLabel && (
          <div
            style={{
              display: "inline-flex",
              marginBottom: 16,
              padding: "6px 10px",
              borderRadius: 999,
              background: theme.plumBg07,
              border: `1px solid ${theme.plumBorder18}`,
              fontSize: 10,
              ...mono,
              color: theme.plum72,
              letterSpacing: 0.8,
            }}
          >
            {lang === "zh" ? "当前路线" : "Active Route"} · {routeLabel}
          </div>
        )}

        <div
          className="serif"
          style={{
            fontSize: lang === "zh" ? 30 : 28,
            color: theme.ink85,
            marginBottom: 16,
            lineHeight: 1.28,
            fontWeight: 600,
          }}
        >
          {copyForLang(current.title, lang)}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          {description && (
            <div
              style={{
                fontSize: 15,
                color: theme.ink72,
                lineHeight: 1.6,
              }}
            >
              {description}
            </div>
          )}
          <div
            style={{
              fontSize: 10,
              ...mono,
              color: theme.moss88,
              fontWeight: 700,
              letterSpacing: 0.6,
            }}
          >
            {helperText}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {current.options.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <button
                key={option.id}
                aria-pressed={isSelected}
                onClick={() =>
                  current.mode === "single"
                    ? chooseSingle(option.value)
                    : toggleMulti(option.value)
                }
                style={{
                  ...(isSelected ? activeButtonStyle : inactiveButtonStyle),
                  fontFamily:
                    lang === "zh"
                      ? "var(--ui-zh)"
                      : "var(--serif)",
                }}
              >
                <span>{copyForLang(option.label, lang)}</span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      width: 22,
                      height: 22,
                      transform: "translateY(-50%)",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.paper,
                      background: theme.moss,
                    }}
                  >
                    <Check size={14} strokeWidth={2.2} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {current.mode === "multi" && selectedValues.length > 0 && (
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              borderRadius: 8,
              background: "rgba(255,250,240,0.48)",
              border: `1px solid ${theme.mossBorder16}`,
            }}
          >
            <div
              style={{
                fontSize: 9,
                ...mono,
                color: theme.moss62,
                letterSpacing: 0.8,
                marginBottom: 10,
              }}
            >
              {lang === "zh" ? "已选择" : "Selected"}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {selectedOptions.map((option) => (
                <span
                  key={option.id}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: theme.mossBg06,
                    border: `1px solid ${theme.mossBorder16}`,
                    fontSize: 11,
                    ...mono,
                    color: theme.moss78,
                  }}
                >
                  {copyForLang(option.label, lang)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        {step > 0 ? (
          <button onClick={goBack} style={ghostButtonStyle}>
            <span className="icon-text">
              <ArrowLeft size={13} strokeWidth={1.9} aria-hidden="true" />
              {t("q_back")}
            </span>
          </button>
        ) : (
          <span />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button onClick={skipCurrentStep} style={ghostButtonStyle}>
            {t("q_skip")}
          </button>
          {current.mode === "multi" && (
            <button onClick={continueFromMulti} style={primaryButtonStyle}>
              <span className="icon-text">
                {isLast
                  ? lang === "zh"
                    ? "下一步：人格"
                    : "Next: Personality"
                  : lang === "zh"
                  ? "继续"
                  : "Continue"}
                <ArrowRight size={13} strokeWidth={1.9} aria-hidden="true" />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function copyForLang(text: LocalizedText, lang: "en" | "zh"): string {
  return text[lang] ?? text.en;
}
