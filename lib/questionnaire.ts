import type { AgeGroup, Fields, QuestionnaireAnswers } from "@/types";

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface QuestionnaireOption {
  id: string;
  value: string;
  label: LocalizedText;
}

export type ChapterKey = "now" | "unstable" | "pull" | "motion";

export interface QuestionnaireStep {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  mode: "single" | "multi";
  maxSelect?: number;
  options: QuestionnaireOption[];
  routeLabel?: LocalizedText;
  chapter?: ChapterKey;
  chapterTitle?: LocalizedText;
  chapterSubtitle?: LocalizedText;
}

// ---------------------------------------------------------------------------
// Chapter metadata — shown above the first step of each chapter
// ---------------------------------------------------------------------------

export const CHAPTER_META: Record<
  ChapterKey,
  { title: LocalizedText; subtitle: LocalizedText }
> = {
  now: {
    title: { en: "Now", zh: "此刻" },
    subtitle: {
      en: "Orientation — where the story stands.",
      zh: "定位——故事现在走到哪。",
    },
  },
  unstable: {
    title: { en: "Unstable", zh: "不稳定" },
    subtitle: {
      en: "Where this chapter keeps generating charge.",
      zh: "这一章持续制造张力的地方。",
    },
  },
  pull: {
    title: { en: "Pull", zh: "牵引" },
    subtitle: {
      en: "The futures already tugging at you.",
      zh: "已经在拉扯你的那些未来。",
    },
  },
  motion: {
    title: { en: "Motion", zh: "动能" },
    subtitle: {
      en: "What happens when things finally become real.",
      zh: "事情真正来临时会发生什么。",
    },
  },
};

// ---------------------------------------------------------------------------
// Chapter I — Now
// ---------------------------------------------------------------------------

const AGE_DISPLAY_OPTIONS = withIds("age", [
  {
    value: "Under 20",
    label: { en: "Prologue — under 20", zh: "序章——还不到20" },
  },
  {
    value: "20–29",
    label: { en: "Chapter one — the 20s", zh: "第一章——二十几岁" },
  },
  {
    value: "30–44",
    label: { en: "The plot thickens — 30 to 44", zh: "剧情展开——30到44" },
  },
  {
    value: "45+",
    label: { en: "New arc — 45 and beyond", zh: "新篇章——45岁之后" },
  },
]);

const SHARED_MOBILITY_OPTIONS = withIds("mobility", [
  {
    value: "Anchored by family or obligations",
    label: {
      en: "Rooted — family or duties keep me planted",
      zh: "扎在这了——家庭或责任把我种在这",
    },
  },
  {
    value: "Can relocate for the right upside",
    label: {
      en: "I could move — if the reason was good enough",
      zh: "我能搬——如果理由够好",
    },
  },
  {
    value: "Already globally mobile",
    label: {
      en: "Untethered — the world is my map",
      zh: "没有牵绊——世界就是我的地图",
    },
  },
  {
    value: "Intentionally rooted in one place",
    label: {
      en: "Staying put — by choice, not by accident",
      zh: "待在这——是选择，不是意外",
    },
  },
]);

const ADULT_MODE_OPTIONS = withIds("adult-mode", [
  {
    value: "Student or transition phase",
    label: {
      en: "In between — figuring out the next version of me",
      zh: "过渡期——正在摸索下一个版本的自己",
    },
  },
  {
    value: "Early-career builder",
    label: {
      en: "Early innings — building fast, learning faster",
      zh: "开局阶段——快速建设，更快学习",
    },
  },
  {
    value: "Established operator",
    label: {
      en: "Running the machine — but wondering what's next",
      zh: "机器在运转——但开始想下一步了",
    },
  },
  {
    value: "Founder or independent path",
    label: {
      en: "My own path — building on my terms",
      zh: "自己的路——按自己的规则做事",
    },
  },
  {
    value: "Rebuilding after a setback",
    label: {
      en: "Coming back — picking up the pieces with new eyes",
      zh: "卷土重来——用新的眼光重新拼",
    },
  },
]);

const YOUTH_MODE_OPTIONS = withIds("youth-mode", [
  {
    value: "School pressure but strong upside",
    label: {
      en: "Grinding through school, but something bigger is brewing",
      zh: "在学校苦熬，但有更大的事在酝酿",
    },
  },
  {
    value: "Already building on the internet",
    label: {
      en: "Already making things while most peers are just scrolling",
      zh: "同龄人在刷手机，你已经在做东西了",
    },
  },
  {
    value: "Creative or competitive talent path",
    label: {
      en: "Wired differently — talent path, not the standard track",
      zh: "频率不一样——走天赋路线，不走标准路",
    },
  },
  {
    value: "Direction still forming",
    label: {
      en: "Nothing's locked in yet — and that's kind of exciting",
      zh: "什么都还没定——但这其实挺刺激的",
    },
  },
  {
    value: "Trying to break out early",
    label: {
      en: "Impatient — ready to skip ahead of the queue",
      zh: "等不及了——准备插队往前冲",
    },
  },
]);

const TWENTIES_MODE_BONUS = withIds("twenties-mode", [
  {
    value: "Gap year or exploration chapter",
    label: {
      en: "Time out — traveling, exploring, resetting",
      zh: "暂停一下——旅行、探索、重启",
    },
  },
  {
    value: "Hustling multiple gigs at once",
    label: {
      en: "Juggling three things — hoping one of them catches fire",
      zh: "同时搞三件事——希望有一件能着火",
    },
  },
]);

const MIDCAREER_MODE_BONUS = withIds("midcareer-mode", [
  {
    value: "Quiet reinvention mid-career",
    label: {
      en: "Successful on paper — privately plotting an escape",
      zh: "纸面上成功——私下在策划一场逃离",
    },
  },
  {
    value: "Building a parallel track",
    label: {
      en: "Day job pays the bills, the real work happens after hours",
      zh: "白天的工作付账单，真正的事业在下班后",
    },
  },
]);

const SENIOR_MODE_BONUS = withIds("senior-mode", [
  {
    value: "Second act after the main career",
    label: {
      en: "The first career was the rehearsal — now for the real show",
      zh: "第一段职业只是排练——现在才是正式演出",
    },
  },
  {
    value: "Passing the torch while still burning",
    label: {
      en: "Teaching what I know while I still have the fire",
      zh: "趁火还没灭，把我知道的传下去",
    },
  },
  {
    value: "Reclaiming something I gave up decades ago",
    label: {
      en: "There's an old dream I shelved — it's time to unshelve it",
      zh: "有个多年前搁置的梦想——是时候拿出来了",
    },
  },
]);

const MODE_BONUS: Partial<Record<AgeGroup, QuestionnaireOption[]>> = {
  twenties: TWENTIES_MODE_BONUS,
  midcareer: MIDCAREER_MODE_BONUS,
  senior: SENIOR_MODE_BONUS,
};

// ---------------------------------------------------------------------------
// Chapter II — Unstable: trajectoryFocus (route-conditioned), hiddenEdge,
// recurringTrap, costWillingness
// ---------------------------------------------------------------------------

const ADULT_HIDDEN_EDGE_OPTIONS = withIds("hidden-edge", [
  {
    value: "Runway that buys patience",
    label: {
      en: "I can survive a long runway without panicking",
      zh: "我能撑过一段很长的跑道，而不至于先慌掉",
    },
  },
  {
    value: "Taste that arrives before status",
    label: {
      en: "People trust my taste before they trust my status",
      zh: "别人还没认可我的头衔，已经先认可了我的判断",
    },
  },
  {
    value: "A craft I can move faster than I can explain",
    label: {
      en: "I can build or solve things faster than I can explain them",
      zh: "我做成或解开的速度，常常比解释它还快",
    },
  },
  {
    value: "A tiny trusted crew",
    label: {
      en: "I have a small circle that will actually move with me",
      zh: "我已经有一小圈人，愿意真的跟我一起动起来",
    },
  },
  {
    value: "A rare quiet opening",
    label: {
      en: "One quiet opening could compound much harder than it looks",
      zh: "一个安静出现的机会，复利起来可能比看上去大得多",
    },
  },
  {
    value: "Time to outlast louder people",
    label: {
      en: "I can outlast louder people because I still have time",
      zh: "我还有时间，所以能熬过那些比我更吵的人",
    },
  },
  {
    value: "A capacity for obscurity",
    label: {
      en: "I can live unseen for a long time without breaking",
      zh: "我能在无人看见的状态里，活很久而不崩",
    },
  },
  {
    value: "Appetite for embarrassment",
    label: {
      en: "I recover fast from looking foolish in public",
      zh: "在公开场合出糗后，我恢复得比大多数人快",
    },
  },
]);

const YOUTH_HIDDEN_EDGE_OPTIONS = withIds("youth-hidden-edge", [
  {
    value: "An adult who actually believes in me",
    label: {
      en: "At least one adult genuinely bets on me",
      zh: "至少有一个真心押注我的大人",
    },
  },
  {
    value: "Time that nobody else my age knows what to do with",
    label: {
      en: "Years of unspent time most peers are already wasting",
      zh: "大片尚未使用的时间——大多数同龄人已经在浪费",
    },
  },
  {
    value: "A portfolio earlier than expected",
    label: {
      en: "I can point to something and say 'I made that'",
      zh: "我能指着什么说'这是我做的'",
    },
  },
  {
    value: "The internet as a league-skipping machine",
    label: {
      en: "The internet lets me play in leagues above my age",
      zh: "互联网让我能打超出年龄的比赛",
    },
  },
  {
    value: "An early audience",
    label: {
      en: "People already follow what I do",
      zh: "已经有人在关注我做的事",
    },
  },
  {
    value: "Taste that arrived early",
    label: {
      en: "I can tell what's good before I can make it",
      zh: "我能分出好坏，早于我能做到好坏",
    },
  },
]);

const TWENTIES_HIDDEN_EDGE_BONUS = withIds("twenties-hidden-edge", [
  {
    value: "Low overhead while options are still cheap",
    label: {
      en: "No mortgage, no kids — I can take real swings cheaply",
      zh: "没房贷没孩子——认真冒险的成本还很低",
    },
  },
]);

const MIDCAREER_HIDDEN_EDGE_BONUS = withIds("midcareer-hidden-edge", [
  {
    value: "Institutional credibility that opens doors silently",
    label: {
      en: "My resume opens doors before I say a word",
      zh: "我的简历在我开口之前就打开了门",
    },
  },
  {
    value: "Scar tissue that replaces naive optimism",
    label: {
      en: "I've survived enough to know what actually works",
      zh: "经历够多了，知道什么真正管用",
    },
  },
]);

const SENIOR_HIDDEN_EDGE_BONUS = withIds("senior-hidden-edge", [
  {
    value: "Decades of pattern recognition",
    label: {
      en: "I've seen this movie before — I know how it ends",
      zh: "这部电影我看过——我知道结局是什么",
    },
  },
  {
    value: "Freedom from needing anyone's permission",
    label: {
      en: "I don't need anyone's permission anymore",
      zh: "我不再需要任何人的许可了",
    },
  },
]);

const HIDDEN_EDGE_BONUS: Partial<Record<AgeGroup, QuestionnaireOption[]>> = {
  twenties: TWENTIES_HIDDEN_EDGE_BONUS,
  midcareer: MIDCAREER_HIDDEN_EDGE_BONUS,
  senior: SENIOR_HIDDEN_EDGE_BONUS,
};

const ADULT_RECURRING_TRAP_OPTIONS = withIds("recurring-trap", [
  {
    value: "Keeping too many doors open and weakening all of them",
    label: {
      en: "I keep too many paths alive and quietly weaken all of them",
      zh: "我总把太多路径一起留着，结果每条都被削弱了",
    },
  },
  {
    value: "Waiting for certainty that never arrives",
    label: {
      en: "I hesitate until the window starts to close",
      zh: "我会犹豫，直到那扇窗开始关上",
    },
  },
  {
    value: "Doing the real work but avoiding real exposure",
    label: {
      en: "I'll do the serious work — I just won't be seen doing it",
      zh: "真正的功夫我愿意下——只是不愿被看见我在下",
    },
  },
  {
    value: "Starting strong and scattering when momentum appears",
    label: {
      en: "I sprint beautifully, then scatter the moment it starts working",
      zh: "我能漂亮地冲起来，然后在它真起效的那一刻散掉",
    },
  },
  {
    value: "Craving freedom but resenting what freedom requires",
    label: {
      en: "I want freedom, but resent what freedom actually asks of me",
      zh: "我要自由，却又讨厌自由真正向我要的东西",
    },
  },
  {
    value: "Decorating the trap instead of escaping",
    label: {
      en: "I keep making the cage nicer instead of walking out of it",
      zh: "我一直在把笼子装饰得更好，而不是走出去",
    },
  },
]);

const YOUTH_RECURRING_TRAP_OPTIONS = withIds("youth-recurring-trap", [
  {
    value: "Interested in everything, committed to nothing",
    label: {
      en: "Interested in everything, committed to nothing",
      zh: "什么都感兴趣，什么都没定下来",
    },
  },
  {
    value: "Confidence swings hard between peaks and panics",
    label: {
      en: "Some days unstoppable, other days I want to disappear",
      zh: "有些天觉得无敌，有些天想直接消失",
    },
  },
  {
    value: "Letting the room I'm in decide how small I think",
    label: {
      en: "My environment keeps deciding how small I'm allowed to think",
      zh: "我所在的环境一直在决定我能想得多大",
    },
  },
  {
    value: "Treating real work as a hobby because nobody told me otherwise",
    label: {
      en: "I downgrade my real work into 'a hobby' because nobody's told me to take it seriously",
      zh: "没人告诉我该认真对待，我就把真正的事自动降级成'兴趣'",
    },
  },
  {
    value: "Copying the path adults describe instead of the one I want",
    label: {
      en: "I keep drifting toward the script adults handed me",
      zh: "我总是不自觉地滑向大人递给我的那套剧本",
    },
  },
]);

// hiddenEdge selections expand the recurring-trap pool with edge-specific
// traps — the advantage itself quietly carries a matching weakness.
const HIDDEN_EDGE_TRAP_BONUS: Record<string, QuestionnaireOption[]> = {
  "Runway that buys patience": withIds("trap-from-runway", [
    {
      value: "Using the runway to postpone commitment",
      label: {
        en: "The runway lets me keep postponing the actual move",
        zh: "跑道反而让我一直推迟真正的出手",
      },
    },
  ]),
  "Taste that arrives before status": withIds("trap-from-taste", [
    {
      value: "Taste outruns what I'll let myself be seen making",
      label: {
        en: "My taste outruns what I'll let myself be seen making",
        zh: "我的品味跑在我敢让人看到的作品前面",
      },
    },
  ]),
  "A craft I can move faster than I can explain": withIds("trap-from-craft", [
    {
      value: "Credibility grows but legibility stalls",
      label: {
        en: "The work gets sharper while I stay invisible to the people who'd move it",
        zh: "作品在变锋利，但我对能推动它的人依然不可见",
      },
    },
  ]),
  "A capacity for obscurity": withIds("trap-from-obscurity", [
    {
      value: "Obscurity becomes cozy and starts feeling like identity",
      label: {
        en: "Obscurity becomes comfortable and starts calling itself identity",
        zh: "不被看见变得舒服，然后开始自称身份",
      },
    },
  ]),
  "An early audience": withIds("trap-from-audience", [
    {
      value: "Performing for the audience instead of becoming undeniable",
      label: {
        en: "The audience makes me optimize for approval, not for becoming real",
        zh: "观众让我为认可优化，而不是为真正成为什么",
      },
    },
  ]),
  "The internet as a league-skipping machine": withIds("trap-from-internet", [
    {
      value: "Hovering in the scroll instead of committing to the work",
      label: {
        en: "The same feed that fuels me keeps dissolving my focus",
        zh: "同一条信息流既给我燃料，又一直在溶解我的专注",
      },
    },
  ]),
};

const COST_WILLINGNESS_OPTIONS = withIds("cost-willingness", [
  {
    value: "Visibility before I feel ready",
    label: {
      en: "Being seen before I feel finished",
      zh: "在我觉得还没完成的时候，就被看见",
    },
  },
  {
    value: "Years of obscurity while the work compounds",
    label: {
      en: "Years of invisibility while the work quietly compounds",
      zh: "作品悄悄复利的那几年，继续默默无闻",
    },
  },
  {
    value: "Burning the version of me that other people liked",
    label: {
      en: "Burning the version of me other people already liked",
      zh: "把别人已经喜欢的那个版本的我烧掉",
    },
  },
  {
    value: "Financial tightness in exchange for authorship",
    label: {
      en: "Living tighter financially in exchange for authoring my own shape",
      zh: "用更紧的钱，换自己书写自己形状的权利",
    },
  },
  {
    value: "Conflict with people who expect the old me",
    label: {
      en: "Disappointing people who expected me to stay the old version",
      zh: "让那些期待我保持旧版本的人失望",
    },
  },
  {
    value: "Looking naive while I'm actually converging",
    label: {
      en: "Looking naive in public while I'm quietly converging",
      zh: "在公开场合显得天真，其实我正在悄悄收敛",
    },
  },
]);

// ---------------------------------------------------------------------------
// Chapter III — Pull: magneticScene, socialMirror, obsessions
// ---------------------------------------------------------------------------

const MAGNETIC_SCENE_OPTIONS = withIds("magnetic-scene", [
  {
    value: "A small room where one thing gets better every week",
    label: {
      en: "A small room where one thing gets quietly better every week",
      zh: "一个小房间，里面有一件事每周都在悄悄变好",
    },
  },
  {
    value: "My name traveling through rooms I'm not in",
    label: {
      en: "My name traveling through rooms I've never been in",
      zh: "我的名字在我没进过的房间里流传",
    },
  },
  {
    value: "One decision that makes my old life impossible",
    label: {
      en: "One decision that makes my old life impossible to return to",
      zh: "一个决定，让旧的生活无法再回去",
    },
  },
  {
    value: "Money arriving from something I made once and built right",
    label: {
      en: "Money arriving from something I made once and built right",
      zh: "钱从我只做一次、但做得对的东西里，持续流进来",
    },
  },
  {
    value: "Leaving a city that has stopped enlarging me",
    label: {
      en: "Leaving a city that has quietly stopped enlarging me",
      zh: "离开一座已经不再把我放大的城市",
    },
  },
  {
    value: "Being underestimated until the result lands",
    label: {
      en: "Being underestimated until the result lands in the room",
      zh: "被一直低估——直到结果落在桌上",
    },
  },
]);

const SOCIAL_MIRROR_OPTIONS = withIds("social-mirror", [
  {
    value: "That I was more serious than I looked",
    label: {
      en: "That I was more serious than I ever let myself look",
      zh: "原来我比我让别人看到的样子认真得多",
    },
  },
  {
    value: "That I built something while they were talking",
    label: {
      en: "That I was building something the whole time they were talking",
      zh: "他们一直在说话的时候，我一直在造东西",
    },
  },
  {
    value: "That my life obeyed a different metric",
    label: {
      en: "That my life was obeying a different metric all along",
      zh: "我的人生其实一直在服从另一种衡量方式",
    },
  },
  {
    value: "That the quiet period was not stagnation",
    label: {
      en: "That the quiet stretch was not stagnation — it was compounding",
      zh: "那段安静的日子不是停滞——是在复利",
    },
  },
  {
    value: "That the detours were actually alignment",
    label: {
      en: "That what looked like detours were actually alignment",
      zh: "那些看起来像绕路的——其实一直在对齐",
    },
  },
]);

const OBSESSION_OPTIONS = withIds("obsessions", [
  {
    value: "Building something that outlasts the delay",
    label: {
      en: "Making something real enough to outlast my delay",
      zh: "做出一个真实到足以穿过我拖延的东西",
    },
  },
  {
    value: "A form of exposure that terrifies and clarifies",
    label: {
      en: "A form of exposure that both terrifies and clarifies me",
      zh: "一种既让我害怕又让我清醒的暴露",
    },
  },
  {
    value: "Leverage that keeps paying after the effort ends",
    label: {
      en: "Leverage that keeps paying after the effort ends",
      zh: "一种做完之后还能继续收钱的杠杆",
    },
  },
  {
    value: "Escape from a drift I can finally name",
    label: {
      en: "Getting out of a drift I can finally name",
      zh: "挣脱一种我终于能叫出名字的漂流",
    },
  },
  {
    value: "An appetite I'm embarrassed to admit",
    label: {
      en: "An appetite I'm slightly embarrassed to admit out loud",
      zh: "一种我不好意思大声承认的胃口",
    },
  },
  {
    value: "A threshold I haven't crossed and won't forgive myself for",
    label: {
      en: "A threshold I haven't crossed and can't seem to forgive",
      zh: "一道我始终没跨过、也没法原谅自己的门槛",
    },
  },
]);

// ---------------------------------------------------------------------------
// Chapter IV — Motion: delayFailureMode, inflection
// ---------------------------------------------------------------------------

const DELAY_FAILURE_OPTIONS = withIds("delay-failure", [
  {
    value: "Too many doors open and none close at the right time",
    label: {
      en: "I keep too many doors open and none of them close at the right time",
      zh: "我开着太多扇门，结果没有一扇在对的时候关上",
    },
  },
  {
    value: "Waiting for certainty that never arrives",
    label: {
      en: "I wait for a certainty that never actually shows up",
      zh: "我一直在等一种根本不会出现的确定",
    },
  },
  {
    value: "Doing the real work but avoiding the real exposure",
    label: {
      en: "I do the real work but avoid the part that requires being seen",
      zh: "真正的活我愿意干——但要被看见的那部分我会躲",
    },
  },
  {
    value: "Starting strong and scattering once momentum appears",
    label: {
      en: "I start strong and scatter the moment momentum actually shows up",
      zh: "我开局很猛，可动能一露头我就散掉",
    },
  },
  {
    value: "Craving freedom but resenting what freedom requires",
    label: {
      en: "I crave freedom but resent what freedom keeps asking of me",
      zh: "我渴望自由，却一直讨厌自由向我开出的条件",
    },
  },
]);

// Inflection options keyed on the user's chosen delay-failure mode — the
// rupture that would force past the specific way they usually stall.
const INFLECTION_OPTIONS_BY_DELAY: Record<string, QuestionnaireOption[]> = {
  "Too many doors open and none close at the right time": withIds(
    "inflection-too-many-doors",
    [
      {
        value: "A deadline closes every door except one",
        label: {
          en: "A deadline closes every door except one",
          zh: "一个截止日期把所有门都关上，只剩下一扇",
        },
      },
      {
        value: "Someone picks the direction for me and I refuse to unpick it",
        label: {
          en: "Someone picks the direction for me and I can't bring myself to unpick it",
          zh: "有人替我选了方向——而我发现自己不忍心撤销",
        },
      },
      {
        value: "One of the paths gets loud enough that the others go quiet",
        label: {
          en: "One of the paths finally gets loud enough that the rest go quiet",
          zh: "其中一条路突然响到——别的全部安静下来",
        },
      },
      {
        value: "I watch a peer commit and the cost of my optionality becomes visible",
        label: {
          en: "A peer finally commits, and the cost of my own optionality stops being invisible",
          zh: "一个同辈终于承诺了什么——我保留选项的代价突然不再隐形",
        },
      },
    ]
  ),
  "Waiting for certainty that never arrives": withIds(
    "inflection-wait-certainty",
    [
      {
        value: "A stranger bets on me before the proof is in",
        label: {
          en: "A stranger bets on me before the proof I was waiting for arrives",
          zh: "一个陌生人先押注我——在我等的那份证明到来之前",
        },
      },
      {
        value: "The cost of waiting becomes more visible than the cost of moving",
        label: {
          en: "The cost of waiting suddenly looks larger than the cost of moving",
          zh: "等的代价突然看起来比动的代价更大",
        },
      },
      {
        value: "I realize the certainty I wanted was never the real question",
        label: {
          en: "I realize the certainty I was waiting for was never really the question",
          zh: "我意识到，我一直在等的那种确定，从来不是真正的问题",
        },
      },
      {
        value: "A deadline or shock removes the luxury of more theory",
        label: {
          en: "A shock or deadline strips away the luxury of more theory",
          zh: "一次震动或截止，把继续空想的余地一并抹掉",
        },
      },
    ]
  ),
  "Doing the real work but avoiding the real exposure": withIds(
    "inflection-avoid-exposure",
    [
      {
        value: "A public moment makes privacy no longer viable",
        label: {
          en: "A public moment makes staying invisible no longer viable",
          zh: "一个公开时刻，让继续低调变得不再可行",
        },
      },
      {
        value: "The embarrassment I feared turns out to be survivable",
        label: {
          en: "Embarrassment arrives and turns out to be completely survivable",
          zh: "尴尬终于真的来了——然后发现它根本撑得过去",
        },
      },
      {
        value: "Someone I respect sees the work and refuses to let it stay hidden",
        label: {
          en: "Someone I respect sees the work and refuses to let me keep it hidden",
          zh: "一个我尊敬的人看到作品——并且拒绝让我继续把它藏起来",
        },
      },
      {
        value: "Privacy stops being a strategy and starts being a ceiling",
        label: {
          en: "Privacy stops being a strategy and starts being a ceiling",
          zh: "隐身不再是一种策略——开始变成一块天花板",
        },
      },
    ]
  ),
  "Starting strong and scattering once momentum appears": withIds(
    "inflection-scatter",
    [
      {
        value: "The momentum pulls in another person I can't afford to scatter on",
        label: {
          en: "The momentum pulls in another person I can't afford to scatter on",
          zh: "这股动能把另一个人卷进来——我不能在TA身上散掉",
        },
      },
      {
        value: "I finish a single thing and it forces a bigger version of me",
        label: {
          en: "I actually finish one thing, and finishing forces a bigger version of me to appear",
          zh: "我真的把一件事做完了——完成本身逼出一个更大的我",
        },
      },
      {
        value: "A small system I built starts demanding a life around it",
        label: {
          en: "Something I built starts demanding a bigger life around it",
          zh: "我造出来的东西，开始反过来要求我给它配上一种更大的生活",
        },
      },
      {
        value: "The body forces a pace correction I would never have chosen",
        label: {
          en: "My body forces a pace correction I would never have chosen alone",
          zh: "身体逼我做一次——我自己绝不会主动做的速度修正",
        },
      },
    ]
  ),
  "Craving freedom but resenting what freedom requires": withIds(
    "inflection-freedom",
    [
      {
        value: "A commitment arrives that makes the old freedom feel smaller",
        label: {
          en: "A commitment arrives and the old freedom suddenly looks smaller than it felt",
          zh: "一份承诺落下——原来的自由突然显得比感觉上要小",
        },
      },
      {
        value: "A constraint I chose starts producing a self I like",
        label: {
          en: "A constraint I actually chose starts producing a self I like",
          zh: "一个我自己选的限制，开始造出一个我喜欢的自己",
        },
      },
      {
        value: "A structure I resented turns out to be the thing carrying me",
        label: {
          en: "A structure I resented turns out to have been the thing carrying me",
          zh: "一种我一直抗拒的结构——原来一直在托着我",
        },
      },
      {
        value: "Leaving becomes harder than staying for the first time",
        label: {
          en: "Leaving becomes harder than staying for the first time in years",
          zh: "多年来第一次——离开变得比留下更难",
        },
      },
    ]
  ),
};

const INFLECTION_GENERIC = withIds("inflection-generic", [
  {
    value: "An unexpected opportunity forces a fast decision",
    label: {
      en: "A door opens with a deadline and removes the luxury of theory",
      zh: "一扇门带着截止日期打开，让空谈失去余地",
    },
  },
  {
    value: "A relationship or partnership reshapes my direction",
    label: {
      en: "A relationship opens a door I can't politely decline",
      zh: "一段关系打开了一扇我很难礼貌拒绝的门",
    },
  },
  {
    value: "I let go of something I thought defined me",
    label: {
      en: "Leaving becomes easier than staying",
      zh: "留下变得比离开更难了",
    },
  },
  {
    value: "An external shock forces reinvention",
    label: {
      en: "Money pressure or circumstance strips away my hedging",
      zh: "钱的压力或环境的震动，把我的犹豫和对冲都撕掉了",
    },
  },
  {
    value: "I finally start the thing I have been planning for too long",
    label: {
      en: "I stop planning and create the conditions the next self requires",
      zh: "我不再只做计划，而开始创造下一个自己真正需要的条件",
    },
  },
]);

// ---------------------------------------------------------------------------
// Route-specific trajectoryFocus options (unlocked by currentMode)
// ---------------------------------------------------------------------------

const ADULT_ROUTE_OPTION_MAP: Record<string, QuestionnaireOption[]> = {
  "Student or transition phase": withIds("adult-route-student", [
    {
      value: "Finding proof of ability",
      label: {
        en: "I need proof I'm actually good, not just promising",
        zh: "我需要证明自己真的行——不只是'有潜力'",
      },
    },
    {
      value: "Breaking into a competitive room",
      label: {
        en: "The door I want is guarded and I'm not on the list",
        zh: "我想进的那扇门有人守——我不在名单上",
      },
    },
    {
      value: "Choosing a direction before specializing",
      label: {
        en: "Committing to one lane before the fork quietly disappears",
        zh: "在岔路悄悄消失之前，选好一条走",
      },
    },
    {
      value: "Turning side projects into leverage",
      label: {
        en: "My side project could be my ticket — but nobody's seen it yet",
        zh: "我的副项目可能是我的入场券——但还没人看见",
      },
    },
    {
      value: "Leaving the safe path earlier than expected",
      label: {
        en: "The safe path is suffocating and I'm already eyeing the exit",
        zh: "安全路径让我窒息——我已经在瞄出口",
      },
    },
  ]),
  "Early-career builder": withIds("adult-route-early", [
    {
      value: "Turning skill into real leverage",
      label: {
        en: "I may already be better than my current life proves",
        zh: "我可能比现在这份生活能证明出来的要强得多",
      },
    },
    {
      value: "Climbing fast without getting trapped",
      label: {
        en: "If I commit I lose alternatives; if I don't I lose time",
        zh: "一旦投入就失去别的路；不投入就失去时间",
      },
    },
    {
      value: "Choosing between prestige and upside",
      label: {
        en: "The impressive path and the alive path are no longer the same",
        zh: "看起来体面的路，和真正让我活过来的路，已经不是同一条",
      },
    },
    {
      value: "Building a reputation people notice",
      label: {
        en: "The work is improving faster than my position is",
        zh: "作品进步的速度比我的位置快",
      },
    },
    {
      value: "Escaping a role that is too small",
      label: {
        en: "I can feel momentum nearby, but not attached to me yet",
        zh: "我能感觉到动能就在附近——但还没附着到我身上",
      },
    },
  ]),
  "Established operator": withIds("adult-route-operator", [
    {
      value: "Breaking through the ceiling",
      label: {
        en: "There's a ceiling above me and I can feel it pressing down",
        zh: "头顶有块天花板，我能感觉到它在压",
      },
    },
    {
      value: "Translating competence into ownership",
      label: {
        en: "I run the show but own none of it",
        zh: "活是我干的——但东西不是我的",
      },
    },
    {
      value: "Moving from executor to decision-maker",
      label: {
        en: "I want to be at the table, not serving it",
        zh: "我想坐在桌前——不是在桌旁伺候",
      },
    },
    {
      value: "Buying back autonomy",
      label: {
        en: "I traded freedom for stability — now I want it back",
        zh: "我用自由换了稳定——现在想换回来",
      },
    },
    {
      value: "Recovering from quiet burnout",
      label: {
        en: "Not burned out dramatically — just slowly running on empty",
        zh: "没有轰然倒下——只是慢慢在空转",
      },
    },
  ]),
  "Founder or independent path": withIds("adult-route-founder", [
    {
      value: "Scaling distribution without losing craft",
      label: {
        en: "Growing bigger without losing what made it good",
        zh: "做大但不丢掉让它好的那个东西",
      },
    },
    {
      value: "Turning expertise into a real business",
      label: {
        en: "I'm an expert — but not yet a business",
        zh: "我是专家——但还不是一门生意",
      },
    },
    {
      value: "Escaping client-work dependency",
      label: {
        en: "If I stop working the money stops — that's the trap",
        zh: "我一停手钱就停——这就是陷阱",
      },
    },
    {
      value: "Finding capital or a second wind",
      label: {
        en: "Running out of runway — need fuel or a miracle",
        zh: "跑道快用完了——需要油或者奇迹",
      },
    },
    {
      value: "Choosing between focus and optionality",
      label: {
        en: "Every direction looks promising — but I can't chase them all",
        zh: "每个方向看起来都有搞头——但追不过来",
      },
    },
  ]),
  "Rebuilding after a setback": withIds("adult-route-rebuild", [
    {
      value: "Regaining confidence after a hit",
      label: {
        en: "The skill is still there, but my confidence took a beating",
        zh: "能力还在——但信心被打残了",
      },
    },
    {
      value: "Rebuilding runway fast",
      label: {
        en: "My bank account says hurry up",
        zh: "银行余额说：快点",
      },
    },
    {
      value: "Starting over in a new field",
      label: {
        en: "Beginner again — and it feels weird",
        zh: "又变成新手了——感觉很奇怪",
      },
    },
    {
      value: "Recovering energy and clarity",
      label: {
        en: "Brain fog — I know I need to move but can't see where",
        zh: "脑子里全是雾——知道要动但看不清方向",
      },
    },
    {
      value: "Escaping an environment that shrank you",
      label: {
        en: "I need to leave the place that quietly made me smaller",
        zh: "我需要离开那个把我慢慢变小了的地方",
      },
    },
  ]),
};

const TWENTIES_ROUTE_BONUS: Record<string, QuestionnaireOption[]> = {
  "Student or transition phase": withIds("twenties-route-student", [
    {
      value: "Everyone else seems to have a plan",
      label: {
        en: "LinkedIn says everyone figured it out — except me",
        zh: "LinkedIn 说所有人都想明白了——除了我",
      },
    },
  ]),
  "Early-career builder": withIds("twenties-route-early", [
    {
      value: "The friends who stayed safe are already ahead financially",
      label: {
        en: "My safe friends have apartments — I have ambition and ramen",
        zh: "稳妥的朋友有了房子——我有理想和泡面",
      },
    },
  ]),
  "Founder or independent path": withIds("twenties-route-founder", [
    {
      value: "Nobody my age has done this — there is no playbook",
      label: {
        en: "No one my age has pulled this off — am I delusional or early?",
        zh: "我这个年龄没人做成过——我是妄想还是先行者？",
      },
    },
  ]),
};

const MIDCAREER_ROUTE_BONUS: Record<string, QuestionnaireOption[]> = {
  "Established operator": withIds("midcareer-route-operator", [
    {
      value: "Younger people are lapping me with less experience",
      label: {
        en: "25-year-olds are getting my dream role — and I trained them",
        zh: "25岁的人在拿我梦想的职位——还是我带出来的",
      },
    },
  ]),
  "Founder or independent path": withIds("midcareer-route-founder", [
    {
      value: "The bet has to work this time — there might not be a next one",
      label: {
        en: "This isn't a gap year experiment anymore — it has to land",
        zh: "这不再是间隔年的实验——必须成功",
      },
    },
  ]),
  "Rebuilding after a setback": withIds("midcareer-route-rebuild", [
    {
      value: "Peers have compounded while I restarted",
      label: {
        en: "They compounded for 10 years while I hit reset",
        zh: "他们复利了10年——我却按了重启",
      },
    },
  ]),
};

const SENIOR_ROUTE_BONUS: Record<string, QuestionnaireOption[]> = {
  "Established operator": withIds("senior-route-operator", [
    {
      value: "The organization will forget me in six months",
      label: {
        en: "30 years of loyalty and they'll replace me in a quarter",
        zh: "忠诚了30年——他们一个季度就能换掉我",
      },
    },
  ]),
  "Founder or independent path": withIds("senior-route-founder", [
    {
      value: "Legacy vs. profit — they pull in opposite directions",
      label: {
        en: "Do I build something that lasts or something that pays?",
        zh: "我是造一个能留下的，还是造一个能赚钱的？",
      },
    },
  ]),
  "Second act after the main career": withIds("senior-route-second-act", [
    {
      value: "Starting over feels exciting and terrifying at once",
      label: {
        en: "Beginner again at 50 — thrilling and humbling",
        zh: "50岁重新当新手——既兴奋又谦卑",
      },
    },
    {
      value: "The world doesn't take late starters seriously",
      label: {
        en: "They smile politely but don't expect me to deliver",
        zh: "他们礼貌地微笑——但不指望我能做到",
      },
    },
  ]),
  "Reclaiming something I gave up decades ago": withIds("senior-route-reclaim", [
    {
      value: "The old dream feels naive now — but it won't let go",
      label: {
        en: "It sounds childish when I say it out loud — but it's real",
        zh: "说出来听着幼稚——但它是真的",
      },
    },
    {
      value: "Everyone around me has settled — I can't",
      label: {
        en: "My peers retired from wanting — I can't seem to",
        zh: "同龄人都放下了——我好像做不到",
      },
    },
  ]),
};

const AGE_ROUTE_BONUS: Partial<
  Record<AgeGroup, Record<string, QuestionnaireOption[]>>
> = {
  twenties: TWENTIES_ROUTE_BONUS,
  midcareer: MIDCAREER_ROUTE_BONUS,
  senior: SENIOR_ROUTE_BONUS,
};

const YOUTH_ROUTE_OPTION_MAP: Record<string, QuestionnaireOption[]> = {
  "School pressure but strong upside": withIds("youth-route-school", [
    {
      value: "Turning raw ability into undeniable signal",
      label: {
        en: "I have the talent — but no proof that matters yet",
        zh: "我有天赋——但还没有能证明的东西",
      },
    },
    {
      value: "Not being defined by exams alone",
      label: {
        en: "I'm more than my test scores and I need people to see that",
        zh: "我不只是分数——我需要别人看到这点",
      },
    },
    {
      value: "Finding the right mentor or institution",
      label: {
        en: "The right teacher or school could change everything",
        zh: "遇到对的老师或学校，一切都会不一样",
      },
    },
    {
      value: "Balancing performance with burnout risk",
      label: {
        en: "Performing at a high level but starting to crack",
        zh: "表现很好——但开始出现裂缝",
      },
    },
    {
      value: "Leaving a narrow script for a bigger future",
      label: {
        en: "The script everyone wrote for me is too small",
        zh: "所有人给我写的剧本都太小了",
      },
    },
  ]),
  "Already building on the internet": withIds("youth-route-internet", [
    {
      value: "Turning side projects into real leverage",
      label: {
        en: "My projects are real but the world treats them like hobbies",
        zh: "我的项目是真的——但世界把它们当爱好",
      },
    },
    {
      value: "Being taken seriously despite age",
      label: {
        en: "I'm serious but adults keep patting me on the head",
        zh: "我是认真的——但大人一直在摸我的头",
      },
    },
    {
      value: "Choosing between audience and skill depth",
      label: {
        en: "Get more followers or get actually better — hard to do both",
        zh: "涨粉还是变强——很难两个都要",
      },
    },
    {
      value: "Finding collaborators older than me",
      label: {
        en: "I need teammates who won't treat me like a kid",
        zh: "我需要不把我当小孩的队友",
      },
    },
    {
      value: "Making early momentum last",
      label: {
        en: "Started strong — terrified of fading out",
        zh: "开局很猛——害怕后劲不足",
      },
    },
  ]),
  "Creative or competitive talent path": withIds("youth-route-talent", [
    {
      value: "Turning talent into repeatable output",
      label: {
        en: "Flashes of brilliance aren't enough — I need consistency",
        zh: "偶尔灵光一现不够——我需要稳定输出",
      },
    },
    {
      value: "Escaping comparison with peers",
      label: {
        en: "The rankings and comparisons are eating me alive",
        zh: "排名和比较快把我吞了",
      },
    },
    {
      value: "Getting access to a bigger stage",
      label: {
        en: "I need a bigger stage — this one is too small",
        zh: "我需要一个更大的舞台——这个太小了",
      },
    },
    {
      value: "Protecting identity while still evolving",
      label: {
        en: "Changing fast but trying not to lose myself",
        zh: "变化很快但试着不丢掉自己",
      },
    },
    {
      value: "Choosing craft over applause",
      label: {
        en: "Applause feels good but the real work is quiet",
        zh: "掌声很爽但真正的功夫是安静的",
      },
    },
  ]),
  "Direction still forming": withIds("youth-route-direction", [
    {
      value: "Separating real curiosity from distraction",
      label: {
        en: "Is this a real passion or am I just procrastinating?",
        zh: "这是真正的热情还是我在拖延？",
      },
    },
    {
      value: "Finding one path worth testing deeply",
      label: {
        en: "Too many interests — none of them deep enough yet",
        zh: "兴趣太多——还没有一个足够深",
      },
    },
    {
      value: "Building confidence before identity locks in",
      label: {
        en: "I want to believe in myself before the world decides for me",
        zh: "在世界替我决定之前，我想先相信自己",
      },
    },
    {
      value: "Escaping passive drift",
      label: {
        en: "Days blur together and nothing's really changing",
        zh: "日子混在一起——什么都没在变",
      },
    },
    {
      value: "Finding a room that expands me",
      label: {
        en: "I need an environment that makes me bigger, not smaller",
        zh: "我需要一个把我放大的环境——而不是缩小",
      },
    },
  ]),
  "Trying to break out early": withIds("youth-route-breakout", [
    {
      value: "Getting independent earlier than expected",
      label: {
        en: "I want real independence while everyone says 'wait'",
        zh: "我想要真正的独立——所有人却说'等一等'",
      },
    },
    {
      value: "Finding uncommon upside before others see it",
      label: {
        en: "I see an opportunity nobody else my age does",
        zh: "我看到一个同龄人都没看到的机会",
      },
    },
    {
      value: "Avoiding a flashy but shallow path",
      label: {
        en: "The flashy path looks cool but I know it's a trap",
        zh: "花哨的路看起来很酷——但我知道是陷阱",
      },
    },
    {
      value: "Building proof faster than credentials",
      label: {
        en: "I'd rather show what I built than show my diploma",
        zh: "我宁可展示我做的东西——而不是文凭",
      },
    },
    {
      value: "Surviving early volatility",
      label: {
        en: "Moving fast, breaking things — including my sleep schedule",
        zh: "跑得飞快，到处碰壁——连作息都毁了",
      },
    },
  ]),
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getQuestionnaireSteps(
  answers: QuestionnaireAnswers
): QuestionnaireStep[] {
  const normalizedAnswers = normalizeQuestionnaireAnswers(answers);
  const age = getSingleAnswer(normalizedAnswers, "age");
  const ageGroup = getAgeGroup(age);
  const youth = ageGroup === "youth";
  const steps = getBaseSteps(youth, ageGroup);

  // Insert trajectoryFocus after currentMode (Chapter II, first question).
  const mode = getSingleAnswer(normalizedAnswers, "currentMode");
  const modeOptions = youth ? YOUTH_MODE_OPTIONS : ADULT_MODE_OPTIONS;
  const baseRouteOptions = getRouteOptionMap(youth)[mode] ?? [];
  const ageRouteBonus = AGE_ROUTE_BONUS[ageGroup]?.[mode] ?? [];
  const routeOptions = [...baseRouteOptions, ...ageRouteBonus];
  const allModeOptions = youth
    ? YOUTH_MODE_OPTIONS
    : [...ADULT_MODE_OPTIONS, ...(MODE_BONUS[ageGroup] ?? [])];
  const modeOption = allModeOptions.find((option) => option.value === mode);

  if (routeOptions.length > 0) {
    const currentModeIndex = steps.findIndex((s) => s.id === "currentMode");
    steps.splice(currentModeIndex + 1, 0, {
      id: "trajectoryFocus",
      title: {
        en: "What makes this chapter unstable in an interesting way?",
        zh: "这一章里，哪种不稳定最值得认真对待？",
      },
      description: {
        en: "Pick the contradiction that keeps giving this chapter its charge.",
        zh: "选那个不断给这一章注入张力的矛盾。",
      },
      mode: "single",
      options: routeOptions,
      routeLabel: modeOption?.label,
      chapter: "unstable",
      chapterTitle: CHAPTER_META.unstable.title,
      chapterSubtitle: CHAPTER_META.unstable.subtitle,
    });
  }

  // Expand recurringTrap pool with traps that shadow the user's hiddenEdge.
  const selectedEdges = getAnswerList(normalizedAnswers, "hiddenEdge");
  if (selectedEdges.length > 0) {
    const bonusTraps = selectedEdges.flatMap(
      (edge) => HIDDEN_EDGE_TRAP_BONUS[edge] ?? []
    );
    if (bonusTraps.length > 0) {
      const trap = steps.find((s) => s.id === "recurringTrap");
      if (trap) trap.options = [...trap.options, ...bonusTraps];
    }
  }

  // Append inflection, conditioned on delayFailureMode.
  const delayFailureMode = getSingleAnswer(normalizedAnswers, "delayFailureMode");
  const costWillingness = getSingleAnswer(normalizedAnswers, "costWillingness");
  if (delayFailureMode || costWillingness) {
    const options =
      INFLECTION_OPTIONS_BY_DELAY[delayFailureMode] ?? INFLECTION_GENERIC;
    steps.push({
      id: "inflection",
      title: {
        en: "What kind of event would force the next version of you to appear?",
        zh: "什么样的事件，会逼出下一个版本的你？",
      },
      description: {
        en: "Choose the rupture that would make hedging harder than becoming.",
        zh: "选那个会让继续犹豫比真正改变更难的裂口。",
      },
      mode: "single",
      options,
      chapter: "motion",
    });
  }

  return steps;
}

export function normalizeQuestionnaireAnswers(
  answers: QuestionnaireAnswers
): QuestionnaireAnswers {
  const age = getSingleAnswer(answers, "age");
  const ageGroup = getAgeGroup(age);
  const youth = ageGroup === "youth";
  const normalized: QuestionnaireAnswers = {};

  const baseSteps = getBaseSteps(youth, ageGroup);

  // Expand recurringTrap pool with hidden-edge traps before filtering.
  const selectedEdges = (answers.hiddenEdge ?? []).filter((value) =>
    baseSteps
      .find((step) => step.id === "hiddenEdge")
      ?.options.some((o) => o.value === value)
  );
  if (selectedEdges.length > 0) {
    const bonus = selectedEdges.flatMap(
      (edge) => HIDDEN_EDGE_TRAP_BONUS[edge] ?? []
    );
    if (bonus.length > 0) {
      const trap = baseSteps.find((s) => s.id === "recurringTrap");
      if (trap) trap.options = [...trap.options, ...bonus];
    }
  }

  for (const step of baseSteps) {
    const nextValues = filterValuesForStep(step, answers[step.id] ?? []);
    if (nextValues.length > 0) normalized[step.id] = nextValues;
  }

  // Normalize trajectoryFocus against its conditional route pool.
  const mode = getSingleAnswer(normalized, "currentMode");
  const baseRouteOptions = getRouteOptionMap(youth)[mode];
  const ageRouteBonus = AGE_ROUTE_BONUS[ageGroup]?.[mode] ?? [];
  const allRouteOptions = baseRouteOptions
    ? [...baseRouteOptions, ...ageRouteBonus]
    : ageRouteBonus.length > 0
    ? ageRouteBonus
    : null;

  if (allRouteOptions && allRouteOptions.length > 0) {
    const trajectoryStep: QuestionnaireStep = {
      id: "trajectoryFocus",
      title: { en: "", zh: "" },
      mode: "single",
      options: allRouteOptions,
    };
    const nextValues = filterValuesForStep(
      trajectoryStep,
      answers.trajectoryFocus ?? []
    );
    if (nextValues.length > 0) normalized.trajectoryFocus = nextValues;
  }

  // Normalize inflection against its delay-mode-conditional option pool.
  const delayFailureMode = getSingleAnswer(normalized, "delayFailureMode");
  if (answers.inflection && answers.inflection.length > 0) {
    const pool =
      INFLECTION_OPTIONS_BY_DELAY[delayFailureMode] ?? INFLECTION_GENERIC;
    const inflectionStep: QuestionnaireStep = {
      id: "inflection",
      title: { en: "", zh: "" },
      mode: "single",
      options: pool,
    };
    const next = filterValuesForStep(inflectionStep, answers.inflection);
    if (next.length > 0) normalized.inflection = next;
  }

  return normalized;
}

// Dev-only: fill every currently-visible step with a random option.
// Iterates because some steps are conditional on earlier answers.
export function randomizeQuestionnaireAnswers(): QuestionnaireAnswers {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  let answers: QuestionnaireAnswers = {};
  for (let guard = 0; guard < 10; guard += 1) {
    const steps = getQuestionnaireSteps(answers);
    const next: QuestionnaireAnswers = {};
    for (const step of steps) {
      if (step.options.length === 0) continue;
      if (step.mode === "single") {
        next[step.id] = [pick(step.options).value];
      } else {
        const max = Math.min(step.maxSelect ?? step.options.length, step.options.length);
        const n = 1 + Math.floor(Math.random() * max);
        const shuffled = [...step.options].sort(() => Math.random() - 0.5);
        next[step.id] = shuffled.slice(0, n).map((o) => o.value);
      }
    }
    const prevKeys = Object.keys(answers).sort().join(",");
    const nextKeys = Object.keys(next).sort().join(",");
    answers = next;
    if (prevKeys === nextKeys) break;
  }
  return answers;
}

export function buildFieldsFromAnswers(answers: QuestionnaireAnswers): Fields {
  const normalized = normalizeQuestionnaireAnswers(answers);
  const age = getSingleAnswer(normalized, "age");
  const mobility = getSingleAnswer(normalized, "mobility");
  const currentMode = getSingleAnswer(normalized, "currentMode");
  const trajectoryFocus = getSingleAnswer(normalized, "trajectoryFocus");
  const hiddenEdge = getAnswerList(normalized, "hiddenEdge").join(", ");
  const recurringTrap = getSingleAnswer(normalized, "recurringTrap");
  const costWillingness = getSingleAnswer(normalized, "costWillingness");
  const magneticScene = getSingleAnswer(normalized, "magneticScene");
  const socialMirror = getSingleAnswer(normalized, "socialMirror");
  const obsessions = getAnswerList(normalized, "obsessions").join(", ");
  const delayFailureMode = getSingleAnswer(normalized, "delayFailureMode");
  const inflection = getSingleAnswer(normalized, "inflection");

  return {
    age,
    mobility,
    currentMode,
    trajectoryFocus,
    hiddenEdge,
    recurringTrap,
    costWillingness,
    magneticScene,
    socialMirror,
    obsessions,
    delayFailureMode,
    inflection,
    // Legacy aliases so prompts.ts inference still finds signal:
    location: mobility,
    skills: "",
    resources: hiddenEdge,
    constraints: recurringTrap,
    workStyle: magneticScene,
    riskTolerance: costWillingness,
    timeHorizon: socialMirror,
  };
}

// ---------------------------------------------------------------------------
// Base step shape (without trajectoryFocus and inflection, which are appended
// conditionally by getQuestionnaireSteps)
// ---------------------------------------------------------------------------

function getBaseSteps(
  youth: boolean,
  ageGroup: AgeGroup = youth ? "youth" : "twenties"
): QuestionnaireStep[] {
  const bonus = <T,>(map: Partial<Record<AgeGroup, T[]>>): T[] =>
    map[ageGroup] ?? [];

  return [
    // Chapter I — Now
    {
      id: "age",
      title: {
        en: "How far into the story are you?",
        zh: "你在这个故事里走到了哪？",
      },
      description: {
        en: "Each chapter unlocks a different path.",
        zh: "每一章都会解锁不同的路径。",
      },
      mode: "single",
      options: AGE_DISPLAY_OPTIONS,
      chapter: "now",
      chapterTitle: CHAPTER_META.now.title,
      chapterSubtitle: CHAPTER_META.now.subtitle,
    },
    {
      id: "mobility",
      title: youth
        ? {
            en: "How much say do you have over where life happens next?",
            zh: "接下来在哪生活，你有多少话语权？",
          }
        : ageGroup === "senior"
        ? {
            en: "If you could live anywhere for this next chapter, could you?",
            zh: "如果下一章可以在任何地方开始，你能去吗？",
          }
        : {
            en: "If the perfect opportunity was in another city, could you go?",
            zh: "如果最好的机会在另一个城市，你去得了吗？",
          },
      mode: "single",
      options: SHARED_MOBILITY_OPTIONS,
      chapter: "now",
    },
    {
      id: "currentMode",
      title: youth
        ? {
            en: "Which of these sounds most like your actual life right now?",
            zh: "哪个最像你现在真实的生活？",
          }
        : ageGroup === "senior"
        ? {
            en: "What does this chapter of your life actually feel like?",
            zh: "你人生的这一章实际上是什么感觉？",
          }
        : {
            en: "Which of these sounds most like your current chapter?",
            zh: "哪个最像你当前这一章的剧情？",
          },
      description: {
        en: "This unlocks a route-specific follow-up.",
        zh: "这会解锁一道和你路线相关的追问。",
      },
      mode: "single",
      options: youth
        ? YOUTH_MODE_OPTIONS
        : [...ADULT_MODE_OPTIONS, ...bonus(MODE_BONUS)],
      chapter: "now",
    },

    // Chapter II — Unstable (trajectoryFocus inserted here by getQuestionnaireSteps)
    {
      id: "hiddenEdge",
      title: {
        en: "What do you have that matters more than it looks?",
        zh: "你手里有哪样东西，比它看起来更重要？",
      },
      description: {
        en: "Pick the asymmetry you could quietly build a future around.",
        zh: "选那个你可以悄悄围着它建立未来的不对称优势。",
      },
      mode: "multi",
      maxSelect: 2,
      options: youth
        ? YOUTH_HIDDEN_EDGE_OPTIONS
        : [...ADULT_HIDDEN_EDGE_OPTIONS, ...bonus(HIDDEN_EDGE_BONUS)],
      chapter: "unstable",
    },
    {
      id: "recurringTrap",
      title: {
        en: "What trap do you keep decorating instead of escaping?",
        zh: "你一直在装饰、而不是逃离的那个陷阱，是哪种？",
      },
      description: {
        en: "The pattern that keeps weakening your momentum in a new disguise.",
        zh: "那个总以新形式回来、悄悄削弱你势能的模式。",
      },
      mode: "single",
      options: youth ? YOUTH_RECURRING_TRAP_OPTIONS : ADULT_RECURRING_TRAP_OPTIONS,
      chapter: "unstable",
    },
    {
      id: "costWillingness",
      title: {
        en: "Which cost are you increasingly willing to pay?",
        zh: "你越来越愿意付的，是哪一种代价？",
      },
      description: {
        en: "Not what you fear — what you're quietly done flinching from.",
        zh: "不是你怕的那个——是你已经不再躲的那个。",
      },
      mode: "single",
      options: COST_WILLINGNESS_OPTIONS,
      chapter: "unstable",
    },

    // Chapter III — Pull
    {
      id: "magneticScene",
      title: {
        en: "Which image feels charged, even if you can't fully justify it?",
        zh: "哪个画面带电，哪怕你说不清为什么？",
      },
      description: {
        en: "Don't pick the noblest one — pick the one that keeps returning.",
        zh: "别挑最高尚的——挑那个反复回到你脑子里的。",
      },
      mode: "single",
      options: MAGNETIC_SCENE_OPTIONS,
      chapter: "pull",
      chapterTitle: CHAPTER_META.pull.title,
      chapterSubtitle: CHAPTER_META.pull.subtitle,
    },
    {
      id: "socialMirror",
      title: {
        en: "What do you want people to eventually realize about you?",
        zh: "你希望别人最终意识到关于你的哪件事？",
      },
      description: {
        en: "The line you'd want them to say out loud, once the story is visible.",
        zh: "故事显现之后——你想听到他们亲口说出的那一句。",
      },
      mode: "single",
      options: SOCIAL_MIRROR_OPTIONS,
      chapter: "pull",
    },
    {
      id: "obsessions",
      title: youth
        ? {
            en: "What can't you stop thinking about — even when you should be doing homework?",
            zh: "就算该写作业了，你脑子里还是停不下来想的是什么？",
          }
        : {
            en: "What keeps pulling you even when it makes no sense?",
            zh: "什么东西一直在拉你——就算完全说不通？",
          },
      description: {
        en: "Pick at most two. One is often more honest than three.",
        zh: "最多选两个。一个，往往比三个更诚实。",
      },
      mode: "multi",
      maxSelect: 2,
      options: OBSESSION_OPTIONS,
      chapter: "pull",
    },

    // Chapter IV — Motion (inflection appended conditionally)
    {
      id: "delayFailureMode",
      title: {
        en: "When the moment comes, what usually breaks first?",
        zh: "真正的时刻来的时候，你身上最先碎的是哪一块？",
      },
      description: {
        en: "Every one of these is honest. Pick the one you recognize fastest.",
        zh: "每一个都不丢人。选那个你一看就认出来的。",
      },
      mode: "single",
      options: DELAY_FAILURE_OPTIONS,
      chapter: "motion",
      chapterTitle: CHAPTER_META.motion.title,
      chapterSubtitle: CHAPTER_META.motion.subtitle,
    },
  ];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRouteOptionMap(
  youth: boolean
): Record<string, QuestionnaireOption[]> {
  return youth ? YOUTH_ROUTE_OPTION_MAP : ADULT_ROUTE_OPTION_MAP;
}

export function getAgeGroup(age: string): AgeGroup {
  switch (age) {
    case "Under 20":
      return "youth";
    case "20–29":
      return "twenties";
    case "30–44":
      return "midcareer";
    case "45+":
      return "senior";
    default:
      return "twenties";
  }
}

function filterValuesForStep(
  step: QuestionnaireStep,
  values: string[]
): string[] {
  const allowedValues = new Set(step.options.map((option) => option.value));
  const nextValues = values.filter((value) => allowedValues.has(value));
  return step.mode === "single"
    ? nextValues.slice(0, 1)
    : nextValues.slice(0, step.maxSelect ?? nextValues.length);
}

function getSingleAnswer(answers: QuestionnaireAnswers, key: string): string {
  return answers[key]?.[0] ?? "";
}

function getAnswerList(answers: QuestionnaireAnswers, key: string): string[] {
  return answers[key] ?? [];
}

function withIds(
  prefix: string,
  options: Array<{ value: string; label: LocalizedText }>
): QuestionnaireOption[] {
  return options.map((option) => ({
    id: `${prefix}-${slugify(option.value)}`,
    value: option.value,
    label: option.label,
  }));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
