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
    encoded_state: "Story Conditions",
    hidden_pressure_label: "Hidden pressure",
    momentum_pattern_label: "Momentum pattern",
    personality_signature_label: "Behavioral signature",
    guidance_label: "Ambition",
    steps_label: "Detail",
    workflow_scan: "Generate",
    workflow_curate: "Pick",
    workflow_denoise: "Build",
    latent_scan_label: "Story Ideas",
    noise_title: "Story Ideas",
    scan_empty:
      "Click Generate to scan 10 story signals. Pick the ones that resonate, then continue.",
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
    bullet_fire: "CONTINUE",
    ammo_loaded_label: "PICKED",
    curate_stage_hint: "Pick the signals that resonate.",
    signal_pick_none_title: "NO SIGNALS PICKED",
    signal_pick_none_body: "Pick at least one signal to continue, or reload for a fresh scan.",
    signal_pick_ready_title: "READY",
    signal_pick_ready_body: "Continue with your picks, or reload for another pass.",
    curation_title: "About Your Picks",
    curation_hint:
      "Use these two answers to tell the story why these signals matter and what kind of future you're refusing.",
    curation_why_title: "What made you keep these?",
    curation_reject_title: "Which kind of future did you reject?",
    curation_needed: "Choose what made these signals stick and what kind of future you refused before continuing.",

    // Story rating
    rate_prompt: "Did this story land for you?",
    rate_like: "Yes",
    rate_dislike: "Not really",
    rate_thanks: "Thanks — this helps us tune the model.",
    data_notice: "Your answers are stored anonymously to improve future stories.",

    // Steering (Enhancement 5)
    steering_title: "Steer the story",
    steering_hint: "Type a one-line direction for the next revision — or skip to let it run.",
    steering_placeholder: "e.g. make it darker, focus on the second fragment, less about work...",
    steering_resume: "Continue",
    steering_skip: "Skip",
    steering_countdown: "Auto-continuing in",
    steering_deeper: "Deeper",
    steering_darker: "Darker",
    steering_sharper: "Sharper",
    steering_concrete: "More concrete",
    steering_keep: "Keep going",
    steering_deeper_note:
      "Make the next version psychologically deeper without explaining the psychology.",
    steering_darker_note:
      "Make the next version darker, stranger, and more consequential.",
    steering_sharper_note:
      "Make the next version sharper, tighter, and less decorative.",
    steering_concrete_note:
      "Make the next version more concrete, with more scenes, objects, and social facts.",

    // Quality gate (Enhancement 1)
    quality_score_label: "Draft quality",

    // Streaming (Enhancement 2)
    streaming_label: "Writing...",

    // Web search grounding (Enhancement 7)
    gemini_search_label: "Web search grounding",
    gemini_search_hint: "Use Google Search to ground story fragments in real-world context (Gemini only)",

    // Story style picker
    story_style_label: "Story style",
    style_auto_label: "Auto",
    style_auto_blurb: "Voice picked from your age and answers — the original behavior.",
    style_cinematic_label: "Cinematic",
    style_cinematic_blurb: "A scene from a contemporary film. Visual, kinetic, scoreable.",
    style_tabloid_label: "Tabloid You",
    style_tabloid_blurb: "Second person. Direct, confessional, slightly accusing. Viral magazine energy.",
    style_mythic_label: "Mythic",
    style_mythic_blurb: "A folktale set five minutes from now. Weather, omens, named objects.",
    style_noir_label: "Noir",
    style_noir_blurb: "Stakes and consequences. Sharp sentences. Someone is owed something.",
    style_documentary_label: "Documentary",
    style_documentary_blurb: "A quiet voiceover. Calm, observational, unhurried. Real verbs.",
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

    encoded_state: "故事条件",
    hidden_pressure_label: "隐藏张力",
    momentum_pattern_label: "势能路径",
    personality_signature_label: "行为签名",
    guidance_label: "野心程度",
    steps_label: "细节程度",
    workflow_scan: "生成",
    workflow_curate: "挑选",
    workflow_denoise: "构建",
    latent_scan_label: "故事灵感",
    noise_title: "故事灵感",
    scan_empty:
      "点击生成，扫描 10 条故事信号。选择你有共鸣的，然后继续。",
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

    bullet_reload: "重新生成",
    bullet_fire: "继续",
    ammo_loaded_label: "已选",
    curate_stage_hint: "选择你有共鸣的信号。",
    signal_pick_none_title: "未选择信号",
    signal_pick_none_body: "至少选择一条信号才能继续，或重新生成。",
    signal_pick_ready_title: "准备就绪",
    signal_pick_ready_body: "继续使用已选信号，或重新生成。",
    curation_title: "关于你的选择",
    curation_hint:
      "用这两个回答告诉系统：这些信号为什么重要，以及你拒绝成为什么样的人。",
    curation_why_title: "你为什么留下这些？",
    curation_reject_title: "你拒绝的是哪一种未来？",
    curation_needed: "继续之前，先选出这些信号为什么留下，以及你拒绝的是哪种未来。",

    rate_prompt: "这个故事打动你了吗？",
    rate_like: "打动了",
    rate_dislike: "没太触到",
    rate_thanks: "谢谢——这会帮助我们调教模型。",
    data_notice: "你的回答会以匿名方式保存，用于改进未来的故事生成。",

    // Steering
    steering_title: "引导故事方向",
    steering_hint: "输入一行指令来引导下一轮修改——或直接跳过。",
    steering_placeholder: "例如：更暗一些、聚焦第二个碎片、少一些关于工作的内容...",
    steering_resume: "继续",
    steering_skip: "跳过",
    steering_countdown: "自动继续倒计时",
    steering_deeper: "更深",
    steering_darker: "更暗",
    steering_sharper: "更锐利",
    steering_concrete: "更具体",
    steering_keep: "继续生成",
    steering_deeper_note: "让下一版在心理层面更深，但不要直接解释心理。",
    steering_darker_note: "让下一版更暗、更奇异，也让后果更明显。",
    steering_sharper_note: "让下一版更锐利、更紧凑，减少装饰性句子。",
    steering_concrete_note: "让下一版更具体，多用场景、物件和社会事实承载含义。",

    // Quality gate
    quality_score_label: "草稿质量",

    // Streaming
    streaming_label: "正在撰写...",

    // Web search grounding
    gemini_search_label: "网络搜索增强",
    gemini_search_hint: "使用 Google 搜索将故事碎片与真实世界背景结合（仅限 Gemini）",

    // Story style picker
    story_style_label: "故事风格",
    style_auto_label: "自动",
    style_auto_blurb: "根据你的年龄与回答选择声音——原始行为。",
    style_cinematic_label: "电影感",
    style_cinematic_blurb: "一场当代电影里的戏。画面、动感、可配乐。",
    style_tabloid_label: "小报 · 你",
    style_tabloid_blurb: "第二人称。直接、吐露、带点责备。像一篇会被转发的杂志文。",
    style_mythic_label: "神话感",
    style_mythic_blurb: "设在五分钟后的民间传说。天气、预兆、被命名的物件。",
    style_noir_label: "黑色",
    style_noir_blurb: "有赌注、有代价。句子锐利。总有人被欠了什么。",
    style_documentary_label: "纪录片",
    style_documentary_blurb: "安静的旁白。冷静、观察、不急。只用真动词。",
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
