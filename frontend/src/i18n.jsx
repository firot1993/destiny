import { createContext, useContext, useState, useCallback } from "react";

const translations = {
  en: {
    // Header
    subtitle: "LIFE TRAJECTORY DIFFUSION",
    title_1: "Denoise Your",
    title_2: "Destiny",

    // Tabs
    tab_state: "01 STATE",
    tab_personality: "02 PERSONALITY",
    tab_generate: "03 GENERATE",

    // State page
    state_desc: "Encode your current position in latent space. More specific inputs produce sharper denoised trajectories.",
    age: "AGE",
    age_placeholder: "28",
    location: "LOCATION",
    location_placeholder: "Shanghai, Taipei, SF...",
    skills: "SKILLS & EXPERTISE",
    skills_placeholder: "ML engineering, Solidity, full-stack, design...",
    resources: "WHAT YOU HAVE",
    resources_placeholder: "savings, a small team, domain knowledge, connections...",
    constraints: "WHAT HOLDS YOU BACK",
    constraints_placeholder: "visa, capital, experience, fear, health...",
    obsessions: "OBSESSIONS",
    obsessions_placeholder: "what keeps you up at night, what you can't stop thinking about...",
    next_personality: "NEXT → PERSONALITY",

    // Big Five page
    big5_desc: "Your personality shapes the trajectory — not just what happens, but how you respond. Five dimensions define your latent personality vector.",
    openness: "OPENNESS",
    openness_q: "When facing the unknown",
    openness_low: "I prefer the familiar",
    openness_high: "I crave the unfamiliar",
    conscientiousness: "CONSCIENTIOUSNESS",
    conscientiousness_q: "How I approach plans",
    conscientiousness_low: "I improvise and adapt",
    conscientiousness_high: "I plan and execute",
    extraversion: "EXTRAVERSION",
    extraversion_q: "My energy comes from",
    extraversion_low: "Solitude and depth",
    extraversion_high: "People and action",
    agreeableness: "AGREEABLENESS",
    agreeableness_q: "In conflict I tend to",
    agreeableness_low: "Challenge and push",
    agreeableness_high: "Harmonize and support",
    neuroticism: "NEUROTICISM",
    neuroticism_q: "Under pressure I",
    neuroticism_low: "Stay calm and detached",
    neuroticism_high: "Feel it all intensely",
    personality_vector: "PERSONALITY VECTOR",
    back_state: "← STATE",
    next_generate: "NEXT → GENERATE",

    // Generate page
    encoded_state: "ENCODED STATE",
    guidance_label: "GUIDANCE",
    steps_label: "STEPS",
    workflow_scan: "SCAN",
    workflow_curate: "CURATE",
    workflow_denoise: "DENOISE",
    latent_scan_label: "LATENT SCAN",
    latent_scan_rule: "10 raw fragments. Remove up to 5 before denoising.",
    noise_title: "LATENT SIGNALS",
    scan_empty: "Scan once to surface 10 raw fragments, prune the weak ones, then denoise the survivors.",
    noise_prune_hint: "Remove up to 5 weaker fragments. At least 5 remain, and each kept fragment becomes one trajectory.",
    noise_kept: "kept",
    noise_removed: "removed",
    noise_left: "removals left",
    noise_remove: "REMOVE",
    noise_restore: "RESTORE",
    guidance_1: "quiet life",
    guidance_2: "steady path",
    guidance_3: "solid",
    guidance_4: "notable",
    guidance_5: "ambitious",
    guidance_6: "remarkable",
    guidance_7: "extraordinary",
    guidance_8: "legendary",
    guidance_9: "mythic",
    guidance_10: "biography-worthy",
    steps_low: "raw & fast",
    steps_mid: "balanced",
    steps_high: "refined",
    steps_ultra: "ultra-detailed",
    trajectories: "trajectories",
    trajectory: "trajectory",
    btn_scan_noise: "▶  SCAN 10 SIGNALS",
    btn_denoise_kept: "▶  DENOISE KEPT",
    btn_rescan: "↻  RESCAN 10",
    btn_stop: "■  STOP",
    progress_scanning: "SCANNING LATENT SPACE",
    trajectory_label: "TRAJECTORY",
    show_steps: "SHOW DENOISING STEPS",
    hide_steps: "HIDE DENOISING STEPS",
    denoised_title: "DENOISED TRAJECTORIES",
    edit_state: "← EDIT STATE",
    edit_personality: "← EDIT PERSONALITY",
    step_noise: "NOISE",
    step_structure: "STRUCTURE",
    step_sharpen: "SHARPEN",
    step_refine: "REFINE",
    step_denoise: "DENOISE",

    // Provider
    provider_label: "PROVIDER",
    provider_anthropic: "Anthropic",
    provider_openrouter: "OpenRouter",
    model_label: "MODEL",

    // Settings
    settings: "SETTINGS",
    api_endpoint: "API ENDPOINT",
    api_endpoint_placeholder: "https://your-worker.workers.dev",
  },

  zh: {
    subtitle: "人生轨迹扩散模型",
    title_1: "去噪你的",
    title_2: "命运",

    tab_state: "01 状态",
    tab_personality: "02 人格",
    tab_generate: "03 生成",

    state_desc: "将你当前的状态编码到潜在空间。输入越具体，去噪后的轨迹越清晰。",
    age: "年龄",
    age_placeholder: "28",
    location: "位置",
    location_placeholder: "上海、台北、旧金山...",
    skills: "技能与专长",
    skills_placeholder: "机器学习、Solidity、全栈开发、设计...",
    resources: "你拥有的",
    resources_placeholder: "积蓄、小团队、领域知识、人脉...",
    constraints: "阻碍你的",
    constraints_placeholder: "签证、资金、经验、恐惧、健康...",
    obsessions: "执念",
    obsessions_placeholder: "什么让你夜不能寐，什么让你无法停止思考...",
    next_personality: "下一步 → 人格",

    big5_desc: "你的人格塑造轨迹——不仅决定发生什么，还决定你如何回应。五个维度定义你的潜在人格向量。",
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
    personality_vector: "人格向量",
    back_state: "← 状态",
    next_generate: "下一步 → 生成",

    encoded_state: "编码状态",
    guidance_label: "引导强度",
    steps_label: "步数",
    workflow_scan: "扫描",
    workflow_curate: "筛选",
    workflow_denoise: "去噪",
    latent_scan_label: "潜空间扫描",
    latent_scan_rule: "固定生成 10 条噪声，最多删除 5 条后再去噪。",
    noise_title: "潜在信号",
    scan_empty: "先扫描 10 条原始碎片，再删掉较弱的，最后对保留下来的信号去噪。",
    noise_prune_hint: "最多删除 5 条较弱碎片。至少保留 5 条，每条保留项都会生成一条轨迹。",
    noise_kept: "保留",
    noise_removed: "已删",
    noise_left: "剩余可删",
    noise_remove: "删除",
    noise_restore: "恢复",
    guidance_1: "平淡一生",
    guidance_2: "稳健之路",
    guidance_3: "踏实",
    guidance_4: "值得一提",
    guidance_5: "野心勃勃",
    guidance_6: "非凡",
    guidance_7: "卓越",
    guidance_8: "传奇",
    guidance_9: "神话",
    guidance_10: "载入史册",
    steps_low: "粗糙快速",
    steps_mid: "平衡",
    steps_high: "精炼",
    steps_ultra: "极致细节",
    trajectories: "条轨迹",
    trajectory: "条轨迹",
    btn_scan_noise: "▶  扫描 10 条信号",
    btn_denoise_kept: "▶  去噪保留项",
    btn_rescan: "↻  重新扫描 10 条",
    btn_stop: "■  停止",
    progress_scanning: "正在扫描潜空间",
    trajectory_label: "轨迹",
    show_steps: "展开去噪步骤",
    hide_steps: "收起去噪步骤",
    denoised_title: "去噪后的轨迹",
    edit_state: "← 编辑状态",
    edit_personality: "← 编辑人格",
    step_noise: "噪声",
    step_structure: "结构",
    step_sharpen: "锐化",
    step_refine: "精修",
    step_denoise: "去噪",

    provider_label: "提供商",
    provider_anthropic: "Anthropic",
    provider_openrouter: "OpenRouter",
    model_label: "模型",

    settings: "设置",
    api_endpoint: "API 端点",
    api_endpoint_placeholder: "https://your-worker.workers.dev",
  }
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = new URLSearchParams(window.location.search).get("lang");
    if (saved && translations[saved]) return saved;
    const browserLang = navigator.language || "en";
    return browserLang.startsWith("zh") ? "zh" : "en";
  });

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(l => l === "en" ? "zh" : "en");
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
