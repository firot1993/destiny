import { useState, useRef } from "react";
import { useI18n } from "./i18n";

// ─── Config ───────────────────────────────────────────────
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || "";
const DEFAULT_PROVIDER = "openrouter";
const PROVIDERS = {
  openrouter: [
    "anthropic/claude-sonnet-4.6",
    "openai/gpt-5.4",
  ],
  xai: [
    "grok-4.20-experimental-beta-0304-reasoning",
    "grok-4.20-multi-agent-experimental-beta-0304",
    "grok-4-1-fast-reasoning"
  ],
};

const BIG5_KEYS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
const BIG5_ICONS = ["◈", "◉", "◎", "◇", "◆"];

const INPUT_FIELDS = [
  { key: "age", type: "short" },
  { key: "location", type: "short" },
  { key: "skills", type: "medium" },
  { key: "resources", type: "medium" },
  { key: "constraints", type: "medium" },
  { key: "obsessions", type: "long" },
];

// ─── Prompt generator ─────────────────────────────────────
function buildStateString(fields, big5, t) {
  let parts = [];
  if (fields.age) parts.push(`Age: ${fields.age}`);
  if (fields.location) parts.push(`Location: ${fields.location}`);
  if (fields.skills) parts.push(`Skills: ${fields.skills}`);
  if (fields.resources) parts.push(`Resources & advantages: ${fields.resources}`);
  if (fields.constraints) parts.push(`Constraints: ${fields.constraints}`);
  if (fields.obsessions) parts.push(`Obsessions & drives: ${fields.obsessions}`);
  const traits = BIG5_KEYS.map((key, i) => {
    const val = big5[i];
    const level = val <= 3 ? "low" : val <= 5 ? "moderate" : val <= 7 ? "moderately high" : "high";
    return `${key}: ${level} (${val}/10)`;
  });
  parts.push(`\nPersonality (Big Five):\n${traits.join("\n")}`);
  return parts.join("\n");
}

function generateStepPrompt(step, totalSteps, state, guidance, prev, previousSketches = []) {
  const progress = step / (totalSteps - 1);
  const guidanceDesc = guidance >= 7 ? "dramatic pivots, unexpected breakthroughs, biography-worthy" : guidance >= 4 ? "ambitious but grounded, notable achievements" : "meaningful, well-lived, not flashy";
  const personality = "The person's Big Five personality traits should deeply shape the trajectory. High openness = unconventional pivots. High conscientiousness = systematic empire-building. High extraversion = network-driven success. Low agreeableness = disruptive moves. High neuroticism = intense creative or emotional breakthroughs.";

  const variationDirective = previousSketches.length > 0
    ? `\n\nCRITICAL: The following trajectories were ALREADY generated. You MUST produce something COMPLETELY DIFFERENT — different life domain, industry, archetype, tone, and turning-point structure. Do NOT repeat similar themes or career arcs.\n\nALREADY GENERATED:\n${previousSketches.map((sk, i) => `--- Sample ${i + 1} ---\n${sk}`).join("\n")}`
    : "";

  if (step === 0) {
    return {
      role: "user",
      content: `You are a Life Trajectory Diffusion Model. You generate possible extraordinary life paths.

CURRENT STATE OF THE PERSON:
${state}

GUIDANCE SCALE: ${guidance}/10 (1 = plausible ordinary life, 10 = biography-worthy phenomenal trajectory)

IMPORTANT: ${personality}

STEP 1 of ${totalSteps}: NOISY SKETCH
Generate a very rough, noisy sketch of a possible life trajectory. Vague, fragmented — just hints. Like a diffusion model at high noise. ${totalSteps <= 3 ? "4-5" : "3-4"} short fragmented phrases. No full sentences. Signal emerging from noise.${variationDirective}

Respond with ONLY the trajectory sketch, nothing else.`
    };
  }

  if (step === totalSteps - 1) {
    return {
      role: "user",
      content: `You are a Life Trajectory Diffusion Model, final step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: FULLY DENOISED — FINAL TRAJECTORY
Vivid, coherent, compelling. Each moment connects with inevitability. Include:
- Key turning points with approximate years
- Internal shifts, not just external events
- How their personality drove each pivot
- What makes this ${guidanceDesc}
- Where this person stands at the peak

Flowing narrative, 8-12 sentences. Deeply personal — not generic.

Respond with ONLY the final trajectory, nothing else.`
    };
  }

  if (progress < 0.4) {
    return {
      role: "user",
      content: `You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: ADDING STRUCTURE (${Math.round(progress * 100)}% denoised)
Add structure. Let causality emerge. Still rough but recognizable patterns. Add approximate timeframes. Personality traits shape HOW things happen. 5-6 sentences.

Respond with ONLY the refined trajectory, nothing else.`
    };
  }

  if (progress < 0.7) {
    return {
      role: "user",
      content: `You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: SHARPENING (${Math.round(progress * 100)}% denoised)
Add specificity — concrete decisions, turning points, key moments. Show cause and effect. At guidance ${guidance}/10: ${guidanceDesc}. 6-8 sentences with clear timeframes.

Respond with ONLY the sharpened trajectory, nothing else.`
    };
  }

  return {
    role: "user",
    content: `You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: FINE DETAIL (${Math.round(progress * 100)}% denoised)
Refine — emotional depth, internal transformations, precise moments. Make each transition feel inevitable. Personality colors every decision. 7-10 sentences.

Respond with ONLY the refined trajectory, nothing else.`
  };
}

function getStepLabel(step, totalSteps, t) {
  const progress = step / (totalSteps - 1);
  if (step === 0) return t("step_noise");
  if (step === totalSteps - 1) return t("step_denoise");
  if (progress < 0.4) return t("step_structure");
  if (progress < 0.7) return t("step_sharpen");
  return t("step_refine");
}

function extractNormalizedText(contentBlocks) {
  if (!Array.isArray(contentBlocks)) return "";

  return contentBlocks
    .flatMap((block) => {
      if (block?.type !== "text") return [];
      if (typeof block.text === "string") return [block.text];

      if (Array.isArray(block.text)) {
        return block.text
          .map((part) => (typeof part?.text === "string" ? part.text : ""))
          .filter(Boolean);
      }

      return [];
    })
    .join("\n")
    .trim();
}

// ─── Components ───────────────────────────────────────────
function StepIndicator({ currentStep, totalSteps, isGenerating }) {
  const { t } = useI18n();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", flexWrap: "wrap" }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
            background: i < currentStep ? "rgba(255,170,40,0.9)" : i === currentStep && isGenerating ? "rgba(255,170,40,0.2)" : "rgba(255,255,255,0.04)",
            color: i < currentStep ? "#08080e" : i === currentStep && isGenerating ? "rgba(255,170,40,0.9)" : "rgba(255,255,255,0.15)",
            border: i === currentStep && isGenerating ? "1px solid rgba(255,170,40,0.4)" : "1px solid transparent",
            transition: "all 0.5s ease",
            animation: i === currentStep && isGenerating ? "pulse 1.5s ease-in-out infinite" : "none"
          }}>{i + 1}</div>
          {i < totalSteps - 1 && <div style={{ width: 20, height: 1, background: i < currentStep ? "rgba(255,170,40,0.3)" : "rgba(255,255,255,0.04)" }} />}
        </div>
      ))}
      <span style={{ marginLeft: 6, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>
        {isGenerating ? getStepLabel(currentStep, totalSteps, t) : ""}
      </span>
    </div>
  );
}

function TrajectoryCard({ trajectory, index, stepOutputs, totalSteps }) {
  const [showSteps, setShowSteps] = useState(false);
  const { t } = useI18n();
  return (
    <div className="trajectory-card" style={{
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, padding: 28, marginBottom: 16, position: "relative", animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      <div style={{ position: "absolute", top: 16, right: 20, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,170,40,0.6)", letterSpacing: 2, fontWeight: 600 }}>
        {t("sample_of")} {index + 1}
      </div>
      <p className="serif" style={{ color: "#fff", fontSize: 16, lineHeight: 1.85, margin: 0, paddingRight: 60 }}>{trajectory}</p>
      {stepOutputs && stepOutputs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setShowSteps(!showSteps)} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "5px 12px",
            color: "rgba(255,255,255,0.25)", fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1
          }}>{showSteps ? t("hide_steps") : t("show_steps")}</button>
          {showSteps && (
            <div style={{ marginTop: 14 }}>
              {stepOutputs.map((step, si) => {
                const p = si / (stepOutputs.length || 1);
                return (
                  <div key={si} className="step-reveal" style={{
                    padding: "14px 18px", marginBottom: 6,
                    background: `rgba(255,170,40,${0.015 + p * 0.03})`,
                    borderLeft: `2px solid rgba(255,170,40,${0.12 + p * 0.5})`,
                    borderRadius: "0 8px 8px 0",
                    animationDelay: `${si * 0.08}s`
                  }}>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: `rgba(255,170,40,${0.5 + p * 0.5})`, marginBottom: 6, letterSpacing: 2, fontWeight: 600 }}>
                      STEP {si + 1} — {getStepLabel(si, stepOutputs.length, t)}
                    </div>
                    <p style={{
                      color: `rgba(255,255,255,${0.6 + p * 0.4})`, fontSize: 14, lineHeight: 1.7, margin: 0,
                      fontFamily: p < 0.4 ? "'JetBrains Mono', monospace" : "'Source Serif 4', 'Noto Serif SC', Georgia, serif",
                      fontStyle: si === 0 ? "italic" : "normal"
                    }}>{step}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────
export default function App() {
  const { t, lang, toggleLang } = useI18n();

  const [page, setPage] = useState("input");
  const [showSettings, setShowSettings] = useState(false);
  const [fields, setFields] = useState({ age: "", location: "", skills: "", resources: "", constraints: "", obsessions: "" });
  const [big5, setBig5] = useState([5, 5, 5, 5, 5]);
  const [guidance, setGuidance] = useState(7);
  const [numSamples, setNumSamples] = useState(3);
  const [denoiseSteps, setDenoiseSteps] = useState(4);
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [model, setModel] = useState(PROVIDERS[DEFAULT_PROVIDER][0]);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSample, setCurrentSample] = useState(0);
  const [dailyRemaining, setDailyRemaining] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(null);
  const [trajectories, setTrajectories] = useState([]);
  const [allStepOutputs, setAllStepOutputs] = useState([]);
  const [error, setError] = useState(null);
  const abortRef = useRef(false);
  const generationLockRef = useRef(false);

  const updateField = (key, val) => setFields(f => ({ ...f, [key]: val }));
  const updateBig5 = (idx, val) => setBig5(b => { const n = [...b]; n[idx] = val; return n; });
  const hasMinInput = fields.age || fields.skills || fields.obsessions;

  const callModel = async (messages, temperature = 1.0, { provider: overrideProvider, model: overrideModel } = {}) => {
    const endpoint = apiUrl.replace(/\/$/, "");
    if (!endpoint) throw new Error("API endpoint not configured. Open Settings to set your worker URL.");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: overrideProvider || provider,
          model: overrideModel || model,
          max_tokens: 1000,
          temperature,
          messages
        })
      });

      // Update daily usage from response headers
      const remaining = res.headers.get("X-Daily-Remaining");
      const limit = res.headers.get("X-Daily-Limit");
      if (remaining !== null) setDailyRemaining(parseInt(remaining));
      if (limit !== null) setDailyLimit(parseInt(limit));

      if (!res.ok) {
        const errText = await res.text();
        let message = errText;
        try {
          const parsed = JSON.parse(errText);
          message = typeof parsed.error === "string" ? parsed.error : JSON.stringify(parsed.error || parsed);
        } catch {
          // Leave non-JSON errors as-is.
        }

        throw new Error(`API ${res.status}: ${message.slice(0, 200)}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));

      // Response is normalized by the worker to Anthropic format
      if (!data.content || !Array.isArray(data.content)) {
        throw new Error("Unexpected response: " + JSON.stringify(data).slice(0, 200));
      }

      const text = extractNormalizedText(data.content);
      if (!text) throw new Error("API returned no text content.");
      return text;
    } catch (err) {
      throw new Error(err.message || "Network error");
    }
  };

  const generate = async () => {
    if (generationLockRef.current) return;
    generationLockRef.current = true;

    const stateStr = buildStateString(fields, big5, t);
    setIsGenerating(true);
    setTrajectories([]);
    setAllStepOutputs([]);
    setError(null);
    abortRef.current = false;

    try {
      const previousSketches = [];
      for (let s = 0; s < numSamples; s++) {
        if (abortRef.current) break;
        setCurrentSample(s);
        let stepResults = [];
        for (let step = 0; step < denoiseSteps; step++) {
          if (abortRef.current) break;
          setCurrentStep(step);
          const msg = generateStepPrompt(step, denoiseSteps, stateStr, guidance, step > 0 ? stepResults[step - 1] : null, previousSketches);
          const temp = Math.min(1.0 + s * 0.15, 1.6);
          const result = step === 0
            ? await callModel([msg], temp, { provider: "gemini", model: "gemini-3-flash-preview" })
            : await callModel([msg], temp);
          stepResults.push(result);
          if (step === 0) previousSketches.push(result);
        }
        if (!abortRef.current) {
          setTrajectories(prev => [...prev, stepResults[stepResults.length - 1]]);
          setAllStepOutputs(prev => [...prev, stepResults]);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      generationLockRef.current = false;
      setIsGenerating(false);
      setCurrentStep(0);
    }
  };

  const guidanceLabels = ["", ...Array.from({ length: 10 }, (_, i) => t(`guidance_${i + 1}`))];

  const inputStyle = (type) => ({
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, padding: type === "short" ? "10px 14px" : "12px 16px",
    color: "#fff", fontSize: 15,
    fontFamily: "'Source Serif 4', 'Noto Serif SC', Georgia, serif", lineHeight: 1.6, resize: "none"
  });

  const mono = { fontFamily: "'JetBrains Mono', monospace" };
  const label = { display: "block", fontSize: 10, ...mono, color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: 1.5, marginBottom: 10 };

  return (
    <div data-lang={lang} style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 44, position: "relative" }}>
          {/* Language toggle & settings */}
          <div style={{ position: "absolute", top: 0, right: 0, display: "flex", gap: 8 }}>
            <button onClick={toggleLang} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6, padding: "5px 12px", cursor: "pointer",
              color: "rgba(255,255,255,0.4)", fontSize: 11, ...mono
            }}>
              {lang === "en" ? "中文" : "EN"}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} style={{
              background: showSettings ? "rgba(255,170,40,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showSettings ? "rgba(255,170,40,0.2)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 6, padding: "5px 12px", cursor: "pointer",
              color: showSettings ? "rgba(255,170,40,0.7)" : "rgba(255,255,255,0.4)", fontSize: 11, ...mono
            }}>
              ⚙
            </button>
          </div>

          <div style={{ fontSize: 9, ...mono, color: "rgba(255,170,40,0.45)", letterSpacing: 4, marginBottom: 14 }}>
            {t("subtitle")}
          </div>
          <h1 className="serif" style={{
            fontFamily: lang === "zh" ? "'Noto Serif SC', serif" : "'Playfair Display', Georgia, serif",
            fontSize: lang === "zh" ? 36 : 40, fontWeight: 900, margin: 0, lineHeight: 1.1,
            background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,170,40,0.65))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            {t("title_1")}<br />{t("title_2")}
          </h1>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div style={{
            marginBottom: 28, padding: "20px 24px",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, animation: "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <div style={{ fontSize: 9, ...mono, color: "rgba(255,170,40,0.4)", letterSpacing: 2, marginBottom: 16 }}>
              {t("settings")}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>{t("api_endpoint")}</label>
              <input value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                placeholder={t("api_endpoint_placeholder")}
                style={{ ...inputStyle("short"), fontSize: 12, ...mono }} />
            </div>

            <div>
              <label style={label}>{t("provider_label")}</label>
              <div style={{ display: "grid", gap: 8 }}>
                {Object.keys(PROVIDERS).map((p) => (
                  <button key={p} onClick={() => { setProvider(p); setModel(PROVIDERS[p][0]); }} style={{
                    width: "100%",
                    padding: "12px 14px",
                    textAlign: "left",
                    background: provider === p ? "rgba(255,170,40,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${provider === p ? "rgba(255,170,40,0.25)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    color: provider === p ? "rgba(255,170,40,0.88)" : "rgba(255,255,255,0.45)",
                    fontSize: 11,
                    ...mono,
                    letterSpacing: 1
                  }}>
                    {p}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.3)", ...mono }}>
                Step 1 always uses Gemini + Google Search
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={label}>{t("model_label")}</label>
              <div style={{ display: "grid", gap: 8 }}>
                {PROVIDERS[provider].map((modelOption) => (
                  <button key={modelOption} onClick={() => setModel(modelOption)} style={{
                    width: "100%",
                    padding: "12px 14px",
                    textAlign: "left",
                    background: model === modelOption ? "rgba(255,170,40,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${model === modelOption ? "rgba(255,170,40,0.25)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    color: model === modelOption ? "rgba(255,170,40,0.88)" : "rgba(255,255,255,0.45)",
                    fontSize: 11,
                    ...mono,
                    letterSpacing: 0.4
                  }}>
                    {modelOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 36, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {[{ id: "input", label: t("tab_state") }, { id: "big5", label: t("tab_personality") }, { id: "generate", label: t("tab_generate") }].map(tab => (
            <button key={tab.id} onClick={() => setPage(tab.id)} style={{
              background: "none", border: "none",
              borderBottom: page === tab.id ? "2px solid rgba(255,170,40,0.7)" : "2px solid transparent",
              padding: "10px 16px", cursor: "pointer",
              color: page === tab.id ? "rgba(255,170,40,0.9)" : "rgba(255,255,255,0.45)",
              fontSize: 11, ...mono, letterSpacing: 1.5, transition: "all 0.3s ease"
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ─── PAGE 1: STATE ─── */}
        {page === "input" && (
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              {t("state_desc")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {INPUT_FIELDS.filter(f => f.type === "short").map(f => (
                <div key={f.key}>
                  <label style={label}>{t(f.key)}</label>
                  <input value={fields[f.key]} onChange={e => updateField(f.key, e.target.value)}
                    placeholder={t(`${f.key}_placeholder`)} style={inputStyle("short")} />
                </div>
              ))}
            </div>
            {INPUT_FIELDS.filter(f => f.type !== "short").map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={label}>{t(f.key)}</label>
                <textarea value={fields[f.key]} onChange={e => updateField(f.key, e.target.value)}
                  placeholder={t(`${f.key}_placeholder`)} rows={f.type === "long" ? 3 : 2} style={inputStyle(f.type)} />
              </div>
            ))}
            <button onClick={() => setPage("big5")} disabled={!hasMinInput} style={{
              width: "100%", padding: "16px 0", marginTop: 12,
              background: hasMinInput ? "rgba(255,170,40,0.1)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${hasMinInput ? "rgba(255,170,40,0.2)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 10, cursor: hasMinInput ? "pointer" : "default",
              color: hasMinInput ? "rgba(255,170,40,0.85)" : "rgba(255,255,255,0.15)",
              fontSize: 12, ...mono, letterSpacing: 2
            }}>{t("next_personality")}</button>
          </div>
        )}

        {/* ─── PAGE 2: BIG FIVE ─── */}
        {page === "big5" && (
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 32, lineHeight: 1.7 }}>
              {t("big5_desc")}
            </p>
            {BIG5_KEYS.map((key, i) => (
              <div key={key} style={{
                padding: "22px 24px", marginBottom: 12, background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16, color: "rgba(255,170,40,0.7)" }}>{BIG5_ICONS[i]}</span>
                    <span style={{ fontSize: 12, ...mono, color: "rgba(255,170,40,0.7)", letterSpacing: 1, fontWeight: 600 }}>{t(key)}</span>
                  </div>
                  <span style={{ fontSize: 20, ...mono, color: "rgba(255,170,40,0.9)", fontWeight: 700 }}>{big5[i]}</span>
                </div>
                <div className="serif" style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 14, fontStyle: "italic" }}>
                  {t(`${key}_q`)}
                </div>
                <input type="range" min={1} max={10} value={big5[i]} onChange={e => updateBig5(i, parseInt(e.target.value))} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 10, ...mono, color: "rgba(255,255,255,0.18)" }}>{t(`${key}_low`)}</span>
                  <span style={{ fontSize: 10, ...mono, color: "rgba(255,255,255,0.18)" }}>{t(`${key}_high`)}</span>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, padding: "16px 20px", background: "rgba(255,170,40,0.03)", border: "1px solid rgba(255,170,40,0.1)", borderRadius: 10 }}>
              <div style={{ fontSize: 9, ...mono, color: "rgba(255,170,40,0.4)", letterSpacing: 2, marginBottom: 10 }}>{t("personality_vector")}</div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                {BIG5_KEYS.map((key, i) => (
                  <div key={key} style={{ textAlign: "center" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: `rgba(255,170,40,${big5[i] / 15})`,
                      border: `1.5px solid rgba(255,170,40,${big5[i] / 12})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, ...mono, color: "rgba(255,255,255,0.7)", margin: "0 auto 6px"
                    }}>{big5[i]}</div>
                    <div style={{ fontSize: 8, ...mono, color: "rgba(255,255,255,0.2)", letterSpacing: 1 }}>
                      {key.slice(0, 1).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => setPage("input")} style={{
                flex: 1, padding: "14px 0", background: "none", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10, color: "rgba(255,255,255,0.3)", fontSize: 11, ...mono, letterSpacing: 2, cursor: "pointer"
              }}>{t("back_state")}</button>
              <button onClick={() => setPage("generate")} style={{
                flex: 2, padding: "14px 0", background: "rgba(255,170,40,0.1)",
                border: "1px solid rgba(255,170,40,0.2)", borderRadius: 10,
                color: "rgba(255,170,40,0.85)", fontSize: 11, ...mono, letterSpacing: 2, cursor: "pointer"
              }}>{t("next_generate")}</button>
            </div>
          </div>
        )}

        {/* ─── PAGE 3: GENERATE ─── */}
        {page === "generate" && (
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
            <div style={{ padding: "18px 22px", marginBottom: 28, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
              <div style={{ fontSize: 9, ...mono, color: "rgba(255,170,40,0.35)", letterSpacing: 2, marginBottom: 10 }}>{t("encoded_state")}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {fields.age && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", ...mono }}>age:{fields.age}</span>}
                {fields.location && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", ...mono }}>loc:{fields.location}</span>}
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", ...mono }}>big5:[{big5.join(",")}]</span>
                <span style={{ fontSize: 12, color: "rgba(255,170,40,0.35)", ...mono }}>via:{provider}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", ...mono }}>model:{model}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 32 }}>
              <div>
                <label style={{ ...label, marginBottom: 14 }}>{t("guidance_label")} — {guidance}</label>
                <input type="range" min={1} max={10} value={guidance} onChange={e => setGuidance(parseInt(e.target.value))} />
                <div style={{ marginTop: 6, fontSize: 11, ...mono, color: "rgba(255,170,40,0.45)" }}>{guidanceLabels[guidance]}</div>
              </div>
              <div>
                <label style={{ ...label, marginBottom: 14 }}>{t("steps_label")} — {denoiseSteps}</label>
                <input type="range" min={2} max={8} value={denoiseSteps} onChange={e => setDenoiseSteps(parseInt(e.target.value))} />
                <div style={{ marginTop: 6, fontSize: 11, ...mono, color: "rgba(255,170,40,0.45)" }}>
                  {denoiseSteps <= 2 ? t("steps_low") : denoiseSteps <= 4 ? t("steps_mid") : denoiseSteps <= 6 ? t("steps_high") : t("steps_ultra")}
                </div>
              </div>
              <div>
                <label style={{ ...label, marginBottom: 14 }}>{t("samples_label")} — {numSamples}</label>
                <input type="range" min={1} max={5} value={numSamples} onChange={e => setNumSamples(parseInt(e.target.value))} />
                <div style={{ marginTop: 6, fontSize: 11, ...mono, color: "rgba(255,255,255,0.18)" }}>
                  {numSamples} {t("parallel")} {numSamples === 1 ? t("trajectory") : t("trajectories")}
                </div>
              </div>
            </div>

            <button onClick={isGenerating ? () => { abortRef.current = true; } : generate}
              disabled={!apiUrl && !isGenerating}
              style={{
                width: "100%", padding: "18px 0",
                background: isGenerating ? "rgba(255,70,50,0.12)" : "rgba(255,170,40,0.1)",
                border: `1px solid ${isGenerating ? "rgba(255,70,50,0.25)" : "rgba(255,170,40,0.22)"}`,
                borderRadius: 10, cursor: "pointer",
                color: isGenerating ? "rgba(255,70,50,0.85)" : "rgba(255,170,40,0.85)",
                fontSize: 12, ...mono, fontWeight: 600, letterSpacing: 3, transition: "all 0.3s ease",
                opacity: !apiUrl && !isGenerating ? 0.3 : 1
              }}>
              {isGenerating ? t("btn_stop") : t("btn_denoise")}
            </button>

            {dailyRemaining !== null && dailyLimit !== null && (
              <div style={{ marginTop: 12, fontSize: 10, ...mono, color: dailyRemaining < 50 ? "rgba(255,90,90,0.7)" : "rgba(255,255,255,0.25)", textAlign: "right" }}>
                {dailyRemaining} / {dailyLimit} requests remaining today
              </div>
            )}

            {isGenerating && (
              <div style={{ marginTop: 20, animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
                <div style={{ fontSize: 10, ...mono, color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>
                  {t("sample_of")} {currentSample + 1} / {numSamples}
                </div>
                <StepIndicator currentStep={currentStep} totalSteps={denoiseSteps} isGenerating={true} />
              </div>
            )}

            {error && (
              <div style={{
                marginTop: 18, padding: "12px 18px",
                background: "rgba(255,50,50,0.07)", border: "1px solid rgba(255,50,50,0.15)",
                borderRadius: 8, fontSize: 12, color: "rgba(255,90,90,0.85)", ...mono
              }}>{error}</div>
            )}

            {trajectories.length > 0 && (
              <div style={{ marginTop: 40, animation: "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
                <div style={{ fontSize: 9, ...mono, color: "rgba(255,170,40,0.35)", letterSpacing: 3, marginBottom: 20 }}>
                  {t("denoised_title")} — {t("guidance_label")} {guidance} — {t("steps_label")} {denoiseSteps} — BIG5 [{big5.join(",")}]
                </div>
                {trajectories.map((traj, i) => (
                  <TrajectoryCard key={i} trajectory={traj} index={i} stepOutputs={allStepOutputs[i]} totalSteps={denoiseSteps} />
                ))}
              </div>
            )}

            {!isGenerating && trajectories.length === 0 && (
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button onClick={() => setPage("input")} style={{
                  flex: 1, padding: "12px 0", background: "none", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 8, color: "rgba(255,255,255,0.2)", fontSize: 10, ...mono, letterSpacing: 2, cursor: "pointer"
                }}>{t("edit_state")}</button>
                <button onClick={() => setPage("big5")} style={{
                  flex: 1, padding: "12px 0", background: "none", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 8, color: "rgba(255,255,255,0.2)", fontSize: 10, ...mono, letterSpacing: 2, cursor: "pointer"
                }}>{t("edit_personality")}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
