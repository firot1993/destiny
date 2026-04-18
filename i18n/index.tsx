"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Language } from "@/types";

const translations: Record<string, Record<string, string>> = {
  en: {
    // Header
    subtitle: "Your Possible Futures",
    title_1: "Shape Your",
    title_2: "Destiny",

    // Tabs
    tab_state: "01 About You",
    tab_personality: "02 Personality",
    tab_generate: "03 Generate",

    // State page

    // Big Five page
    big5_desc:
      "Your personality shapes the story — not just what happens, but how you face it. Rate yourself on five traits.",
    openness: "Openness",
    openness_q: "When facing the unknown",
    openness_low: "I prefer the familiar",
    openness_high: "I crave the unfamiliar",
    conscientiousness: "Conscientiousness",
    conscientiousness_q: "How I approach plans",
    conscientiousness_low: "I improvise and adapt",
    conscientiousness_high: "I plan and execute",
    extraversion: "Extraversion",
    extraversion_q: "My energy comes from",
    extraversion_low: "Solitude and depth",
    extraversion_high: "People and action",
    agreeableness: "Agreeableness",
    agreeableness_q: "In conflict I tend to",
    agreeableness_low: "Challenge and push",
    agreeableness_high: "Harmonize and support",
    neuroticism: "Neuroticism",
    neuroticism_q: "Under pressure I",
    neuroticism_low: "Stay calm and detached",
    neuroticism_high: "Feel it all intensely",
    personality_vector: "Your Scores",
    back_state: "Back",
    next_generate: "Generate",

    // Generate page
    encoded_state: "Your Profile",
    guidance_label: "Ambition",
    steps_label: "Detail",
    workflow_scan: "Generate",
    workflow_curate: "Catch",
    workflow_denoise: "Build",
    latent_scan_label: "Story Ideas",
    noise_title: "Story Ideas",
    scan_empty:
      "Click Generate to scan 10 story fragments. Catch bullets as they fly by — load six, then fire.",
    guidance_1: "quiet life",
    guidance_2: "steady path",
    guidance_3: "solid",
    guidance_4: "notable",
    guidance_5: "ambitious",
    guidance_6: "remarkable",
    guidance_7: "extraordinary",
    guidance_8: "legendary",
    guidance_9: "epic",
    guidance_10: "once in a lifetime",
    steps_low: "quick draft",
    steps_mid: "balanced",
    steps_high: "detailed",
    steps_ultra: "very detailed",
    trajectories: "paths",
    trajectory: "path",
    btn_scan_noise: "Generate 10 Ideas",
    btn_stop: "Stop",
    progress_scanning: "Generating Ideas",
    progress_denoising: "Building",
    merged_signals_label: "ideas",
    trajectory_label: "Path",
    show_steps: "Show Steps",
    hide_steps: "Hide Steps",
    denoised_title: "Your Life Paths",
    edit_state: "Edit Profile",
    edit_personality: "Edit Personality",
    step_noise: "Raw Ideas",
    step_structure: "Structure",
    step_sharpen: "Sharpen",
    step_refine: "Refine",
    step_denoise: "Finish",

    q_skip: "skip",
    q_back: "back",

    // Provider
    provider_label: "Provider",
    provider_anthropic: "Anthropic",
    provider_openrouter: "OpenRouter",
    model_label: "Model",

    // Settings
    settings: "Settings",

    // Revolver curate
    bullet_reload: "RELOAD",
    bullet_fire: "FIRE",
    ammo_loaded_label: "LOADED",
    curate_stage_hint: "Catch the bullets. Load six. Fire.",
  },

  zh: {
    subtitle: "探索你的可能未来",
    title_1: "探索你的",
    title_2: "命运",

    tab_state: "01 关于你",
    tab_personality: "02 人格",
    tab_generate: "03 生成",


    big5_desc:
      "你的性格决定故事的走向——不只是发生什么，还有你如何应对。给自己在五个维度上打分。",
    openness: "开放性",
    openness_q: "面对未知时",
    openness_low: "我偏好熟悉的",
    openness_high: "我渴望未知的",
    conscientiousness: "尽责性",
    conscientiousness_q: "我做计划的方式",
    conscientiousness_low: "即兴发挥",
    conscientiousness_high: "计划执行",
    extraversion: "外向性",
    extraversion_q: "我的能量来自",
    extraversion_low: "独处与深度",
    extraversion_high: "人群与行动",
    agreeableness: "宜人性",
    agreeableness_q: "在冲突中我倾向于",
    agreeableness_low: "挑战和推动",
    agreeableness_high: "调和与支持",
    neuroticism: "神经质",
    neuroticism_q: "压力之下我",
    neuroticism_low: "保持冷静超脱",
    neuroticism_high: "深刻感受一切",
    personality_vector: "你的得分",
    back_state: "返回",
    next_generate: "生成",

    encoded_state: "你的资料",
    guidance_label: "野心程度",
    steps_label: "细节程度",
    workflow_scan: "生成",
    workflow_curate: "捕捉",
    workflow_denoise: "构建",
    latent_scan_label: "故事灵感",
    noise_title: "故事灵感",
    scan_empty:
      "点击生成，扫描 10 条故事碎片。子弹飞过时抓住它们——装满六发，然后开火。",
    guidance_1: "平淡一生",
    guidance_2: "稳健之路",
    guidance_3: "踏实",
    guidance_4: "值得一提",
    guidance_5: "野心勃勃",
    guidance_6: "非凡",
    guidance_7: "卓越",
    guidance_8: "传奇",
    guidance_9: "史诗",
    guidance_10: "千载难逢",
    steps_low: "快速草稿",
    steps_mid: "平衡",
    steps_high: "详细",
    steps_ultra: "非常详细",
    trajectories: "条路径",
    trajectory: "条路径",
    btn_scan_noise: "生成 10 条灵感",
    btn_stop: "停止",
    progress_scanning: "正在生成灵感",
    progress_denoising: "正在构建",
    merged_signals_label: "条灵感",
    trajectory_label: "路径",
    show_steps: "显示步骤",
    hide_steps: "隐藏步骤",
    denoised_title: "你的人生路径",
    edit_state: "编辑资料",
    edit_personality: "编辑人格",
    step_noise: "原始灵感",
    step_structure: "结构",
    step_sharpen: "锐化",
    step_refine: "精修",
    step_denoise: "完成",

    q_skip: "跳过",
    q_back: "返回",

    provider_label: "提供商",
    provider_anthropic: "Anthropic",
    provider_openrouter: "OpenRouter",
    model_label: "模型",

    settings: "设置",

    bullet_reload: "重新装填",
    bullet_fire: "开火",
    ammo_loaded_label: "已装填",
    curate_stage_hint: "抓住子弹。装满六发。开火。",
  },
};

interface I18nContextValue {
  lang: Language;
  t: (key: string) => string;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = new URLSearchParams(window.location.search).get("lang");
    if (saved && translations[saved]) {
      setLang(saved as Language);
      return;
    }
    const browserLang = navigator.language || "en";
    setLang(browserLang.startsWith("zh") ? "zh" : "en");
  }, []);

  const t = useCallback(
    (key: string) => translations[lang]?.[key] ?? translations["en"]?.[key] ?? key,
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((l) => (l === "en" ? "zh" : "en"));
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
