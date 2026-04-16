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

export interface QuestionnaireStep {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  mode: "single" | "multi";
  maxSelect?: number;
  options: QuestionnaireOption[];
  routeLabel?: LocalizedText;
}

// ---------------------------------------------------------------------------
// Option arrays — `value` stays canonical (feeds into prompts), `label` is
// the vivid display text the user sees.
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

const ADULT_WORK_STYLE_OPTIONS = withIds("adult-work-style", [
  {
    value: "Quietly, through craft and depth",
    label: {
      en: "Alone in a room — obsessing over quality",
      zh: "一个人在房间里——死磕质量",
    },
  },
  {
    value: "With a small, trusted team",
    label: {
      en: "Small squad, high trust, big output",
      zh: "小队伍，高信任，大产出",
    },
  },
  {
    value: "By building systems and leverage",
    label: {
      en: "Building machines that work while I sleep",
      zh: "造一台我睡觉时还在干活的机器",
    },
  },
  {
    value: "Through visibility and community",
    label: {
      en: "Out there — building in public, gathering a crowd",
      zh: "在外面——公开做事，聚集人群",
    },
  },
  {
    value: "By navigating rooms, deals, and stakeholders",
    label: {
      en: "Working the room — deals, dinners, and handshakes",
      zh: "走人脉——饭局、握手和交易",
    },
  },
]);

const YOUTH_WORK_STYLE_OPTIONS = withIds("youth-work-style", [
  {
    value: "By compounding a niche skill fast",
    label: {
      en: "Going absurdly deep on one thing",
      zh: "在一件事上深到离谱",
    },
  },
  {
    value: "By shipping projects in public",
    label: {
      en: "Putting work out there before it's perfect",
      zh: "东西还没完美就先发出去",
    },
  },
  {
    value: "By winning trust from mentors or gatekeepers",
    label: {
      en: "Making older, powerful people bet on me",
      zh: "让比我大的有分量的人押注我",
    },
  },
  {
    value: "By building an online audience early",
    label: {
      en: "Growing a following before I have a business card",
      zh: "名片还没有，粉丝先有了",
    },
  },
  {
    value: "By quietly outworking everyone around me",
    label: {
      en: "Head down, lights on late — outpacing everyone quietly",
      zh: "埋头干，灯熬晚——默默甩开所有人",
    },
  },
]);

const ADULT_RISK_OPTIONS = withIds("adult-risk", [
  {
    value: "Protect downside first",
    label: {
      en: "Check the exits before I walk in",
      zh: "走进去之前先看好出口",
    },
  },
  {
    value: "Take calculated asymmetric bets",
    label: {
      en: "Only when the odds are secretly in my favor",
      zh: "只在概率其实站在我这边时出手",
    },
  },
  {
    value: "Accept volatility for speed",
    label: {
      en: "Buckle up — speed has a price and I'll pay it",
      zh: "系好安全带——速度有代价，我愿意付",
    },
  },
  {
    value: "Go all-in when conviction is high",
    label: {
      en: "When I know, I go all in",
      zh: "当我确定的时候，全压",
    },
  },
]);

const YOUTH_RISK_OPTIONS = withIds("youth-risk", [
  {
    value: "Keep the safe path open while exploring",
    label: {
      en: "One foot on solid ground, one foot reaching",
      zh: "一只脚踩稳，另一只在伸",
    },
  },
  {
    value: "Take experiments seriously but not recklessly",
    label: {
      en: "Try everything, break nothing important",
      zh: "什么都试，重要的东西不弄坏",
    },
  },
  {
    value: "Push hard if the upside is rare",
    label: {
      en: "If this chance is rare, I'm going for it",
      zh: "如果这种机会难得，我冲了",
    },
  },
  {
    value: "Bet early on myself before others do",
    label: {
      en: "I'd rather bet on myself and lose than never try",
      zh: "宁可赌自己然后输掉，也不愿从不试过",
    },
  },
]);

const ADULT_HORIZON_OPTIONS = withIds("adult-horizon", [
  {
    value: "Next 12 months",
    label: {
      en: "Just get through the next year",
      zh: "先把下一年过好",
    },
  },
  {
    value: "Next 3 years",
    label: {
      en: "The next 3 years will define the decade",
      zh: "未来3年会定义这十年",
    },
  },
  {
    value: "Next 5–7 years",
    label: {
      en: "Playing the 5-to-7-year game",
      zh: "在下一盘5到7年的棋",
    },
  },
  {
    value: "Next decade",
    label: {
      en: "Building for a decade from now",
      zh: "在为十年后建设",
    },
  },
]);

const YOUTH_HORIZON_OPTIONS = withIds("youth-horizon", [
  {
    value: "This school year or the next 12 months",
    label: {
      en: "Just this year — what's right in front of me",
      zh: "就这一年——把面前的事做好",
    },
  },
  {
    value: "The next 2–3 years",
    label: {
      en: "The next 2–3 years are the setup",
      zh: "未来2到3年是铺垫期",
    },
  },
  {
    value: "By my early 20s",
    label: {
      en: "By my early 20s, I want to be somewhere",
      zh: "到二十岁出头，我想在某个位置了",
    },
  },
  {
    value: "A long arc that starts now",
    label: {
      en: "Planting seeds for a tree I'll sit under later",
      zh: "现在种树，以后乘凉",
    },
  },
]);

const SKILL_DISPLAY_OPTIONS = withIds("skills", [
  {
    value: "Tech & Engineering",
    label: { en: "I build things that work", zh: "我造能跑起来的东西" },
  },
  {
    value: "Design & Creative",
    label: {
      en: "I make things beautiful or interesting",
      zh: "我让东西变好看或有趣",
    },
  },
  {
    value: "Business & Finance",
    label: {
      en: "I see the money and the angles",
      zh: "我看得到钱在哪、路怎么走",
    },
  },
  {
    value: "Science & Research",
    label: {
      en: "I dig until I find the truth",
      zh: "我一直挖到找到真相为止",
    },
  },
  {
    value: "Writing & Media",
    label: {
      en: "I put the right words in the right order",
      zh: "我把文字排成该有的样子",
    },
  },
  {
    value: "Teaching & Coaching",
    label: { en: "I make other people level up", zh: "我让别人升级" },
  },
  {
    value: "Healthcare & Care",
    label: {
      en: "I fix what's broken in people",
      zh: "我修复人身上坏掉的东西",
    },
  },
  {
    value: "Sales & Marketing",
    label: {
      en: "I make people want things",
      zh: "我让人们想要某样东西",
    },
  },
  {
    value: "Law & Policy",
    label: {
      en: "I know where the rules bend",
      zh: "我知道规则在哪里弯",
    },
  },
  {
    value: "Trades & Making",
    label: {
      en: "I work with my hands and it shows",
      zh: "我用双手做事，成品会说话",
    },
  },
]);

const ADULT_RESOURCE_OPTIONS = withIds("resources", [
  {
    value: "Some savings",
    label: { en: "A runway of savings", zh: "一段积蓄做的跑道" },
  },
  {
    value: "Steady income",
    label: {
      en: "Reliable cashflow coming in",
      zh: "稳定的收入在进来",
    },
  },
  {
    value: "Strong network",
    label: {
      en: "The right people already know my name",
      zh: "该认识的人已经认识我",
    },
  },
  {
    value: "Deep expertise",
    label: {
      en: "Expertise that took years to build",
      zh: "花了很多年练出来的专业能力",
    },
  },
  {
    value: "A small team",
    label: {
      en: "A crew that shows up when I call",
      zh: "叫得动的一支小队",
    },
  },
  {
    value: "Plenty of free time",
    label: {
      en: "Time — the one resource money can't buy",
      zh: "时间——钱买不到的那种资源",
    },
  },
  {
    value: "Family support",
    label: {
      en: "Family that has my back",
      zh: "站在我身后的家人",
    },
  },
  {
    value: "Rare opportunity",
    label: {
      en: "A door most people don't even see",
      zh: "大多数人看不见的一扇门",
    },
  },
]);

const YOUTH_RESOURCE_OPTIONS = withIds("youth-resources", [
  {
    value: "Supportive family or adult backing",
    label: {
      en: "At least one adult who genuinely believes in me",
      zh: "至少有一个真心相信我的大人",
    },
  },
  {
    value: "Plenty of time to learn and build",
    label: {
      en: "Time — the one unfair advantage of being young",
      zh: "时间——年轻的唯一不公平优势",
    },
  },
  {
    value: "Strong grades, scores, or academic signal",
    label: {
      en: "The report card works in my favor",
      zh: "成绩单站在我这边",
    },
  },
  {
    value: "A real portfolio already exists",
    label: {
      en: "I can point to something and say 'I made that'",
      zh: "我能指着什么说'这是我做的'",
    },
  },
  {
    value: "Mentors, coaches, or older guides",
    label: {
      en: "Someone older is showing me the shortcuts",
      zh: "有人在给我指近路",
    },
  },
  {
    value: "Internet access to communities and tools",
    label: {
      en: "The internet lets me play in leagues above my age",
      zh: "互联网让我能打超出年龄的比赛",
    },
  },
  {
    value: "Early audience or social proof",
    label: {
      en: "People already follow what I do",
      zh: "已经有人在关注我做的事",
    },
  },
  {
    value: "Rare opportunity few peers have",
    label: {
      en: "I got a shot most kids my age never see",
      zh: "我得到了一个大多数同龄人根本遇不到的机会",
    },
  },
]);

const ADULT_CONSTRAINT_OPTIONS = withIds("constraints", [
  {
    value: "Tight budget",
    label: { en: "Money is the bottleneck", zh: "钱是瓶颈" },
  },
  {
    value: "Family commitments",
    label: {
      en: "People I love need me here",
      zh: "我爱的人需要我在这",
    },
  },
  {
    value: "Visa or location limits",
    label: {
      en: "Geography or paperwork won't let me move",
      zh: "地理或证件不让我动",
    },
  },
  {
    value: "Lack of experience",
    label: {
      en: "Haven't earned the credibility yet",
      zh: "还没攒够信用",
    },
  },
  {
    value: "Health challenges",
    label: {
      en: "My body has its own agenda",
      zh: "身体有它自己的计划",
    },
  },
  {
    value: "Fear of failure",
    label: {
      en: "The fear of falling flat",
      zh: "怕摔个大跟头",
    },
  },
  {
    value: "No clear direction",
    label: {
      en: "A compass that keeps spinning",
      zh: "指南针一直在转",
    },
  },
  {
    value: "Too many options",
    label: {
      en: "Too many doors — can't pick one",
      zh: "门太多——选不过来",
    },
  },
]);

const YOUTH_CONSTRAINT_OPTIONS = withIds("youth-constraints", [
  {
    value: "Exam pressure or school workload",
    label: {
      en: "School eats all my energy and time",
      zh: "学校吃掉了我所有精力和时间",
    },
  },
  {
    value: "Not enough money or autonomy yet",
    label: {
      en: "Can't spend or decide without permission",
      zh: "花钱和做决定都得看别人的脸色",
    },
  },
  {
    value: "Family expectations feel heavy",
    label: {
      en: "My family's plans for me don't match my own",
      zh: "家人给我的规划和我自己的对不上",
    },
  },
  {
    value: "Hard to access the right room or network",
    label: {
      en: "The rooms where it happens — I can't get in",
      zh: "真正有事发生的地方——我进不去",
    },
  },
  {
    value: "Direction changes too often",
    label: {
      en: "Interested in everything, committed to nothing",
      zh: "什么都感兴趣，什么都没定下来",
    },
  },
  {
    value: "Confidence swings a lot",
    label: {
      en: "Some days unstoppable, other days I want to hide",
      zh: "有些天觉得无敌，有些天想躲起来",
    },
  },
  {
    value: "Small-city or environment limits",
    label: {
      en: "Where I live, nobody's doing what I want to do",
      zh: "在我住的地方，没人在做我想做的事",
    },
  },
  {
    value: "Too early to be taken seriously",
    label: {
      en: "Nobody takes a teenager seriously — even when I'm right",
      zh: "没人把十几岁的人当回事——即使我是对的",
    },
  },
]);

const DRIVE_DISPLAY_OPTIONS = withIds("drives", [
  {
    value: "Building something real",
    label: {
      en: "Making something that outlasts me",
      zh: "做一个比我活得更久的东西",
    },
  },
  {
    value: "Helping others",
    label: {
      en: "Seeing someone's life get better because of me",
      zh: "看到某个人因为我过得更好了",
    },
  },
  {
    value: "Creative expression",
    label: {
      en: "Getting what's inside my head out into the world",
      zh: "把脑子里的东西放到这个世界上",
    },
  },
  {
    value: "Financial freedom",
    label: {
      en: "Never having to check the price tag",
      zh: "再也不用看价签",
    },
  },
  {
    value: "Adventure & exploration",
    label: {
      en: "Living a life that makes a great story",
      zh: "活出一个值得讲的故事",
    },
  },
  {
    value: "Recognition & impact",
    label: {
      en: "Walking into a room and mattering",
      zh: "走进一个房间就有分量",
    },
  },
  {
    value: "Knowledge & understanding",
    label: {
      en: "Understanding how things really work",
      zh: "搞懂事物真正的运作方式",
    },
  },
  {
    value: "Family & legacy",
    label: {
      en: "Building something my family is proud of",
      zh: "建造让家人骄傲的东西",
    },
  },
  {
    value: "Justice & change",
    label: {
      en: "Fixing something that's broken in the world",
      zh: "修好这个世界里坏掉的一些东西",
    },
  },
  {
    value: "Independence",
    label: {
      en: "Being completely free to be myself",
      zh: "完全自由地做自己",
    },
  },
]);

// ---------------------------------------------------------------------------
// Age-group bonus options (appended to shared pools)
// ---------------------------------------------------------------------------

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

const TWENTIES_RESOURCE_BONUS = withIds("twenties-resources", [
  {
    value: "Youth and energy to burn",
    label: {
      en: "I can outwork anyone — sleep is optional",
      zh: "我能干过任何人——睡觉是可选的",
    },
  },
  {
    value: "Low overhead, few obligations",
    label: {
      en: "No mortgage, no kids — I can take risks cheaply",
      zh: "没房贷没孩子——冒险的成本很低",
    },
  },
]);

const MIDCAREER_RESOURCE_BONUS = withIds("midcareer-resources", [
  {
    value: "Institutional credibility",
    label: {
      en: "My resume opens doors before I say a word",
      zh: "我的简历在我开口之前就打开了门",
    },
  },
  {
    value: "War stories that buy trust",
    label: {
      en: "I've survived enough to know what actually works",
      zh: "经历够多了，知道什么真正管用",
    },
  },
]);

const SENIOR_RESOURCE_BONUS = withIds("senior-resources", [
  {
    value: "Decades of pattern recognition",
    label: {
      en: "I've seen this movie before — I know how it ends",
      zh: "这部电影我看过——我知道结局是什么",
    },
  },
  {
    value: "Freedom from proving myself",
    label: {
      en: "I don't need anyone's permission anymore",
      zh: "我不再需要任何人的许可了",
    },
  },
  {
    value: "A generation that looks up to me",
    label: {
      en: "Younger people come to me — and I like that",
      zh: "年轻人来找我——我喜欢这样",
    },
  },
]);

const TWENTIES_CONSTRAINT_BONUS = withIds("twenties-constraints", [
  {
    value: "Imposter syndrome in every room",
    label: {
      en: "Everyone seems to know something I don't",
      zh: "每个人好像都知道一些我不知道的",
    },
  },
  {
    value: "Student debt or financial starting line",
    label: {
      en: "Starting the race with weights on my ankles",
      zh: "脚上绑着重物起跑",
    },
  },
]);

const MIDCAREER_CONSTRAINT_BONUS = withIds("midcareer-constraints", [
  {
    value: "Golden handcuffs",
    label: {
      en: "The pay is too good to leave, too boring to stay",
      zh: "工资高得走不了，无聊得待不住",
    },
  },
  {
    value: "Identity tied to current role",
    label: {
      en: "I don't know who I am without this job title",
      zh: "没了这个头衔我不知道自己是谁",
    },
  },
]);

const SENIOR_CONSTRAINT_BONUS = withIds("senior-constraints", [
  {
    value: "Industry has moved on without me",
    label: {
      en: "The game changed and nobody sent me the new rules",
      zh: "游戏规则变了，但没人给我发新的",
    },
  },
  {
    value: "Energy is finite now",
    label: {
      en: "The spirit says yes but the body negotiates",
      zh: "精神说可以，但身体要谈条件",
    },
  },
  {
    value: "Ageism in hiring and perception",
    label: {
      en: "They see my age before they see my ability",
      zh: "他们先看到我的年龄，然后才看到我的能力",
    },
  },
]);

const TWENTIES_WORK_STYLE_BONUS = withIds("twenties-work-style", [
  {
    value: "By moving faster than anyone expects",
    label: {
      en: "Speed is my weapon — I ship before others plan",
      zh: "速度是我的武器——别人还在计划我已经上线了",
    },
  },
]);

const MIDCAREER_WORK_STYLE_BONUS = withIds("midcareer-work-style", [
  {
    value: "By knowing which battles to skip",
    label: {
      en: "I win by choosing what NOT to fight",
      zh: "我靠选择不打哪些仗来赢",
    },
  },
]);

const SENIOR_WORK_STYLE_BONUS = withIds("senior-work-style", [
  {
    value: "By mentoring the next wave",
    label: {
      en: "My biggest wins now come through other people",
      zh: "我现在最大的赢是通过别人实现的",
    },
  },
  {
    value: "By deploying taste and judgment",
    label: {
      en: "I don't grind anymore — I curate",
      zh: "我不再苦熬——我做选择",
    },
  },
]);

const TWENTIES_RISK_BONUS = withIds("twenties-risk", [
  {
    value: "Swing hard while there's nothing to lose",
    label: {
      en: "No kids, no mortgage — this is the window to go big",
      zh: "没孩子没房贷——这是放手一搏的窗口",
    },
  },
]);

const MIDCAREER_RISK_BONUS = withIds("midcareer-risk", [
  {
    value: "Hedge with a parallel bet",
    label: {
      en: "Keep the day job, build the escape pod at night",
      zh: "白天上班，晚上造逃生舱",
    },
  },
]);

const SENIOR_RISK_BONUS = withIds("senior-risk", [
  {
    value: "Risk is different when time is shorter",
    label: {
      en: "I can't afford a 5-year mistake — but I can afford a bold 1-year bet",
      zh: "我承受不起5年的错误——但可以承受大胆的1年赌注",
    },
  },
]);

const TWENTIES_HORIZON_BONUS = withIds("twenties-horizon", [
  {
    value: "Before I turn 30",
    label: {
      en: "I want to be somewhere real before 30 hits",
      zh: "我想在30岁到来之前到达某个地方",
    },
  },
]);

const MIDCAREER_HORIZON_BONUS = withIds("midcareer-horizon", [
  {
    value: "Before the window closes",
    label: {
      en: "There's a window and I can feel it narrowing",
      zh: "有一扇窗，我能感觉到它在变窄",
    },
  },
]);

const SENIOR_HORIZON_BONUS = withIds("senior-horizon", [
  {
    value: "The next chapter, not the whole book",
    label: {
      en: "I'm not planning a lifetime — just the best next chapter",
      zh: "我不是在规划一辈子——只是最好的下一章",
    },
  },
]);

// Lookup maps for bonus options by age group
const MODE_BONUS: Partial<Record<AgeGroup, QuestionnaireOption[]>> = {
  twenties: TWENTIES_MODE_BONUS,
  midcareer: MIDCAREER_MODE_BONUS,
  senior: SENIOR_MODE_BONUS,
};

const RESOURCE_BONUS: Partial<Record<AgeGroup, QuestionnaireOption[]>> = {
  twenties: TWENTIES_RESOURCE_BONUS,
  midcareer: MIDCAREER_RESOURCE_BONUS,
  senior: SENIOR_RESOURCE_BONUS,
};

const CONSTRAINT_BONUS: Partial<Record<AgeGroup, QuestionnaireOption[]>> = {
  twenties: TWENTIES_CONSTRAINT_BONUS,
  midcareer: MIDCAREER_CONSTRAINT_BONUS,
  senior: SENIOR_CONSTRAINT_BONUS,
};

const WORK_STYLE_BONUS: Partial<Record<AgeGroup, QuestionnaireOption[]>> = {
  twenties: TWENTIES_WORK_STYLE_BONUS,
  midcareer: MIDCAREER_WORK_STYLE_BONUS,
  senior: SENIOR_WORK_STYLE_BONUS,
};

const RISK_BONUS: Partial<Record<AgeGroup, QuestionnaireOption[]>> = {
  twenties: TWENTIES_RISK_BONUS,
  midcareer: MIDCAREER_RISK_BONUS,
  senior: SENIOR_RISK_BONUS,
};

const HORIZON_BONUS: Partial<Record<AgeGroup, QuestionnaireOption[]>> = {
  twenties: TWENTIES_HORIZON_BONUS,
  midcareer: MIDCAREER_HORIZON_BONUS,
  senior: SENIOR_HORIZON_BONUS,
};

// ---------------------------------------------------------------------------
// Skill-based bonus options (Hotspot 1)
// ---------------------------------------------------------------------------

const SKILL_RESOURCE_BONUS: Record<string, QuestionnaireOption[]> = {
  "Tech & Engineering": withIds("skill-res-tech", [
    {
      value: "Open-source reputation",
      label: {
        en: "Code I shipped that strangers depend on",
        zh: "我写的代码，陌生人在依赖",
      },
    },
  ]),
  "Design & Creative": withIds("skill-res-design", [
    {
      value: "A portfolio that speaks for itself",
      label: {
        en: "My work sells me before I open my mouth",
        zh: "我的作品在我开口之前就把我卖了",
      },
    },
  ]),
  "Business & Finance": withIds("skill-res-biz", [
    {
      value: "Deal flow others don't see",
      label: {
        en: "I hear about opportunities before they go public",
        zh: "我在机会公开之前就听说了",
      },
    },
  ]),
  "Writing & Media": withIds("skill-res-writing", [
    {
      value: "An audience that trusts my voice",
      label: {
        en: "People read what I write — that's leverage",
        zh: "有人读我写的东西——这就是杠杆",
      },
    },
  ]),
  "Healthcare & Care": withIds("skill-res-health", [
    {
      value: "License or credential that took years",
      label: {
        en: "A credential that can't be shortcut",
        zh: "一个没法走捷径的资质",
      },
    },
  ]),
};

const SKILL_CONSTRAINT_BONUS: Record<string, QuestionnaireOption[]> = {
  "Tech & Engineering": withIds("skill-con-tech", [
    {
      value: "Automation anxiety — my own tools could replace me",
      label: {
        en: "The thing I build might make me obsolete",
        zh: "我造的东西可能会让我自己过时",
      },
    },
  ]),
  "Design & Creative": withIds("skill-con-design", [
    {
      value: "Taste outpaces opportunity",
      label: {
        en: "My taste is better than what the market will pay for",
        zh: "我的品味超过了市场愿意付钱的范围",
      },
    },
  ]),
  "Business & Finance": withIds("skill-con-biz", [
    {
      value: "Everything is a spreadsheet, nothing feels alive",
      label: {
        en: "I optimize everything except meaning",
        zh: "我优化了一切，除了意义",
      },
    },
  ]),
  "Science & Research": withIds("skill-con-science", [
    {
      value: "Publish-or-perish treadmill",
      label: {
        en: "The system rewards papers, not breakthroughs",
        zh: "体制奖励论文，不奖励突破",
      },
    },
  ]),
  "Writing & Media": withIds("skill-con-writing", [
    {
      value: "Algorithms decide who hears me",
      label: {
        en: "I write the words, the platform decides who sees them",
        zh: "我写字，平台决定谁看到",
      },
    },
  ]),
  "Healthcare & Care": withIds("skill-con-health", [
    {
      value: "Compassion fatigue",
      label: {
        en: "I take care of everyone except myself",
        zh: "我照顾所有人，除了自己",
      },
    },
  ]),
};

// ---------------------------------------------------------------------------
// Route-specific options (unlocked by currentMode)
// ---------------------------------------------------------------------------

const ADULT_ROUTE_OPTION_MAP: Record<string, QuestionnaireOption[]> = {
  "Student or transition phase": withIds("adult-route-student", [
    {
      value: "Finding proof of ability",
      label: {
        en: "I need proof I'm actually good",
        zh: "我需要证明自己确实行",
      },
    },
    {
      value: "Breaking into a competitive room",
      label: {
        en: "The door I want is guarded — I'm not on the list",
        zh: "我想进的那扇门有人守——我不在名单上",
      },
    },
    {
      value: "Choosing a direction before specializing",
      label: {
        en: "Committing to one lane before the fork disappears",
        zh: "在岔路消失前选好一条走",
      },
    },
    {
      value: "Turning side projects into leverage",
      label: {
        en: "My side project could be my ticket — but nobody sees it yet",
        zh: "我的副项目可能是我的入场券——但还没人看见",
      },
    },
    {
      value: "Leaving the safe path earlier than expected",
      label: {
        en: "The safe path is suffocating and I'm eyeing the exit",
        zh: "安全路径让我窒息，我一直在瞄出口",
      },
    },
  ]),
  "Early-career builder": withIds("adult-route-early", [
    {
      value: "Climbing fast without getting trapped",
      label: {
        en: "Rising fast — but I feel the golden handcuffs tightening",
        zh: "上升很快——但感觉镀金手铐越来越紧",
      },
    },
    {
      value: "Turning skill into real leverage",
      label: {
        en: "I'm good at this — how do I turn it into real power?",
        zh: "我擅长这个——怎么把它变成真正的筹码？",
      },
    },
    {
      value: "Choosing between prestige and upside",
      label: {
        en: "Shiny brand name or real upside — can't have both",
        zh: "光鲜名号还是真正的上行空间——不能兼得",
      },
    },
    {
      value: "Building a reputation people notice",
      label: {
        en: "I do great work but I'm still invisible",
        zh: "活干得漂亮但还是没人看见",
      },
    },
    {
      value: "Escaping a role that is too small",
      label: {
        en: "I've outgrown this role and everyone sees it except my boss",
        zh: "我已经大过这个角色了，除了老板谁都看得出",
      },
    },
  ]),
  "Established operator": withIds("adult-route-operator", [
    {
      value: "Breaking through the ceiling",
      label: {
        en: "There's a ceiling above me and I can feel it pressing",
        zh: "头顶有块天花板，我能感觉到它在压",
      },
    },
    {
      value: "Translating competence into ownership",
      label: {
        en: "I run the show but I don't own any of it",
        zh: "活是我干的，但东西不是我的",
      },
    },
    {
      value: "Moving from executor to decision-maker",
      label: {
        en: "I want to be at the table, not serving it",
        zh: "我想坐在桌前，不是在桌旁伺候",
      },
    },
    {
      value: "Buying back autonomy",
      label: {
        en: "I traded freedom for stability — now I want it back",
        zh: "我拿自由换了稳定，现在想换回来",
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
        en: "If I stop working, the money stops — that's the trap",
        zh: "我一停手，钱就停——这就是陷阱",
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
        zh: "能力还在，但信心被打残了",
      },
    },
    {
      value: "Rebuilding runway fast",
      label: {
        en: "Bank account says hurry up",
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
        en: "I need to leave the place that made me smaller",
        zh: "我需要离开那个把我变小了的地方",
      },
    },
  ]),
};

// Age-specific route tension bonuses (Hotspot 2: age + currentMode → trajectoryFocus)
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
        en: "My safe friends have apartments, I have ambition and ramen",
        zh: "稳妥的朋友有了房子，我有理想和泡面",
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
      value: "The bet has to work this time — there might not be a next time",
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
        zh: "他们复利积累了10年，而我按了重启",
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
        zh: "忠诚了30年，他们一个季度就能换掉我",
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
        zh: "他们礼貌地微笑，但不指望我能做到",
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

const AGE_ROUTE_BONUS: Partial<Record<AgeGroup, Record<string, QuestionnaireOption[]>>> = {
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
        zh: "我不只是分数，我需要别人看到这点",
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
        zh: "表现很好但开始出现裂缝了",
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
        zh: "我的项目是真的，但世界把它们当爱好",
      },
    },
    {
      value: "Being taken seriously despite age",
      label: {
        en: "I'm serious but adults keep patting me on the head",
        zh: "我是认真的，但大人总在摸我的头",
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
        en: "Need teammates who won't treat me like a kid",
        zh: "需要不把我当小孩的队友",
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
        en: "Claps feel good but the real work is quiet",
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
        en: "Too many interests — none deep enough yet",
        zh: "兴趣太多——还没有一个足够深",
      },
    },
    {
      value: "Building confidence before identity locks in",
      label: {
        en: "I want to believe in myself before the world decides for me",
        zh: "在世界替我做决定之前，我想先相信自己",
      },
    },
    {
      value: "Escaping passive drift",
      label: {
        en: "Days blur together and nothing's really changing",
        zh: "日子混在一起，什么都没在变",
      },
    },
    {
      value: "Finding a room that expands me",
      label: {
        en: "I need an environment that makes me bigger, not smaller",
        zh: "我需要一个把我放大的环境，不是缩小",
      },
    },
  ]),
  "Trying to break out early": withIds("youth-route-breakout", [
    {
      value: "Getting independent earlier than expected",
      label: {
        en: "I want real independence while everyone says 'wait'",
        zh: "我想要真正的独立，但所有人都说'等一等'",
      },
    },
    {
      value: "Finding uncommon upside before others see it",
      label: {
        en: "I see an opportunity nobody else my age does",
        zh: "我看到了一个同龄人都没看到的机会",
      },
    },
    {
      value: "Avoiding a flashy but shallow path",
      label: {
        en: "The flashy path looks cool but I know it's a trap",
        zh: "花哨的路看起来很酷但我知道那是陷阱",
      },
    },
    {
      value: "Building proof faster than credentials",
      label: {
        en: "I'd rather show what I built than show my diploma",
        zh: "我宁可展示我做的东西而不是文凭",
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
// Inflection question (Hotspot 3: risk + workStyle → sharpening question)
// ---------------------------------------------------------------------------

// Tension types that trigger the inflection question
type InflectionTension = "bold-craft" | "cautious-visible" | "speed-system" | "generic";

function getInflectionTension(risk: string, workStyle: string): InflectionTension | null {
  // Bold risk + quiet craft → internal tension between ambition and method
  if (
    (risk === "Go all-in when conviction is high" || risk === "Accept volatility for speed" ||
     risk === "Swing hard while there's nothing to lose" || risk === "Bet early on myself before others do") &&
    (workStyle === "Quietly, through craft and depth" || workStyle === "By compounding a niche skill fast")
  ) return "bold-craft";

  // Conservative risk + visibility-driven → tension between safety and exposure
  if (
    (risk === "Protect downside first" || risk === "Take calculated asymmetric bets" ||
     risk === "Keep the safe path open while exploring") &&
    (workStyle === "Through visibility and community" || workStyle === "By building an online audience early" ||
     workStyle === "By shipping projects in public")
  ) return "cautious-visible";

  // Speed risk + systems work style → tension between velocity and leverage
  if (
    (risk === "Accept volatility for speed" || risk === "Swing hard while there's nothing to lose") &&
    (workStyle === "By building systems and leverage" || workStyle === "By moving faster than anyone expects")
  ) return "speed-system";

  // For other valid but less specific combos
  if (risk && workStyle) return "generic";

  return null;
}

const INFLECTION_OPTIONS: Record<InflectionTension, QuestionnaireOption[]> = {
  "bold-craft": withIds("inflection-bold-craft", [
    {
      value: "A single piece of work gets noticed by the right person",
      label: {
        en: "One project lands on the right desk — and everything changes",
        zh: "一个项目落在了对的人桌上——一切都变了",
      },
    },
    {
      value: "I finish the thing I have been circling for years",
      label: {
        en: "I finally finish the thing I've been afraid to complete",
        zh: "我终于完成了那件我一直不敢收尾的事",
      },
    },
    {
      value: "Someone offers to fund or back my quiet obsession",
      label: {
        en: "Someone says: I'll pay you to do that thing you do alone at night",
        zh: "有人说：我付钱让你做你每晚独自做的那件事",
      },
    },
    {
      value: "I realize craft alone will not be enough",
      label: {
        en: "I accept that great work doesn't sell itself — and learn to sell",
        zh: "我接受好作品不会自己卖——然后学会销售",
      },
    },
  ]),
  "cautious-visible": withIds("inflection-cautious-visible", [
    {
      value: "Something I post goes unexpectedly viral",
      label: {
        en: "I put something out there and it blows up — now what?",
        zh: "我发了个东西火了——然后呢？",
      },
    },
    {
      value: "I get invited to a stage I thought was years away",
      label: {
        en: "An invitation arrives that I thought was meant for someone bigger",
        zh: "一个邀请来了，我以为那是给更厉害的人的",
      },
    },
    {
      value: "A public failure teaches me the downside is survivable",
      label: {
        en: "I fail publicly — and discover nobody actually cares that much",
        zh: "我公开失败了——然后发现其实没人那么在意",
      },
    },
    {
      value: "I stop hedging and commit to being seen",
      label: {
        en: "I drop the safety net and say: this is what I do, judge me",
        zh: "我扔掉安全网说：这就是我做的事，评判我吧",
      },
    },
  ]),
  "speed-system": withIds("inflection-speed-system", [
    {
      value: "A system I built starts generating value while I sleep",
      label: {
        en: "The machine finally runs without me — first real leverage",
        zh: "机器终于不需要我了——第一次真正的杠杆",
      },
    },
    {
      value: "I burn out and realize speed was not the answer",
      label: {
        en: "I hit a wall and discover that faster isn't always further",
        zh: "我撞了墙，发现更快不一定更远",
      },
    },
    {
      value: "A competitor validates my space and I have to scale or die",
      label: {
        en: "Someone else enters my space — scale now or get swallowed",
        zh: "别人进了我的赛道——要么扩张要么被吞",
      },
    },
    {
      value: "I find a partner who handles what I cannot",
      label: {
        en: "I meet the person who does the part I'm terrible at",
        zh: "我遇到了那个能做我做不好的部分的人",
      },
    },
  ]),
  generic: withIds("inflection-generic", [
    {
      value: "An unexpected opportunity forces a fast decision",
      label: {
        en: "A door opens with a deadline — decide now or it closes",
        zh: "一扇门打开了但有截止日期——现在决定否则它关上",
      },
    },
    {
      value: "A relationship or partnership reshapes my direction",
      label: {
        en: "Someone walks into my life and rearranges the priorities",
        zh: "有人走进我的生活，重新排列了优先级",
      },
    },
    {
      value: "I let go of something I thought defined me",
      label: {
        en: "I drop the thing I was holding too tightly — and feel lighter",
        zh: "我放下了一直紧紧抓着的东西——然后感觉轻了",
      },
    },
    {
      value: "An external shock forces reinvention",
      label: {
        en: "The ground shifts — layoff, move, loss — and I rebuild from it",
        zh: "地面震动了——裁员、搬家、失去——我从废墟中重建",
      },
    },
    {
      value: "I finally start the thing I have been planning for too long",
      label: {
        en: "I stop planning and press 'go' — messy, imperfect, alive",
        zh: "我不再计划，按下'开始'——混乱、不完美、活着",
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
    steps.splice(3, 0, {
      id: "trajectoryFocus",
      title: youth
        ? {
            en: "What keeps you up at night about this stage?",
            zh: "在这个阶段，什么事让你夜里睡不着？",
          }
        : ageGroup === "senior"
        ? {
            en: "What's the tension that keeps circling back?",
            zh: "什么矛盾一直在反复出现？",
          }
        : {
            en: "Where does it actually hurt on this path?",
            zh: "在这条路上，真正痛的是哪？",
          },
      description: youth
        ? {
            en: "Pick the one that hit you in the gut.",
            zh: "选那个让你心里一紧的。",
          }
        : {
            en: "The tension you'd describe if no one was judging.",
            zh: "如果没人评判，你会怎么描述那个张力。",
          },
      mode: "single",
      options: routeOptions,
      routeLabel: modeOption?.label,
    });
  }

  // Hotspot 1: Skills → Constraints/Resources bonus options
  const selectedSkills = getAnswerList(normalizedAnswers, "skills");
  if (selectedSkills.length > 0 && !youth) {
    const skillResourceBonus = selectedSkills.flatMap(
      (skill) => SKILL_RESOURCE_BONUS[skill] ?? []
    );
    const skillConstraintBonus = selectedSkills.flatMap(
      (skill) => SKILL_CONSTRAINT_BONUS[skill] ?? []
    );
    for (const step of steps) {
      if (step.id === "resources" && skillResourceBonus.length > 0) {
        step.options = [...step.options, ...skillResourceBonus];
      }
      if (step.id === "constraints" && skillConstraintBonus.length > 0) {
        step.options = [...step.options, ...skillConstraintBonus];
      }
    }
  }

  // Hotspot 3: Risk + workStyle → Inflection sharpening question
  const workStyle = getSingleAnswer(normalizedAnswers, "workStyle");
  const riskTolerance = getSingleAnswer(normalizedAnswers, "riskTolerance");
  const inflectionTension = getInflectionTension(riskTolerance, workStyle);
  if (inflectionTension) {
    steps.push({
      id: "inflection",
      title: youth
        ? {
            en: "What would have to happen in the next 6 months to change everything?",
            zh: "未来6个月内发生什么会改变一切？",
          }
        : ageGroup === "senior"
        ? {
            en: "What would have to happen soon to unlock the next chapter?",
            zh: "什么事必须尽快发生才能打开下一章？",
          }
        : {
            en: "What would have to happen in the next 6 months to change everything?",
            zh: "未来6个月内发生什么会改变一切？",
          },
      description: {
        en: "The inflection point that turns planning into momentum.",
        zh: "把计划变成势能的那个转折点。",
      },
      mode: "single",
      options: INFLECTION_OPTIONS[inflectionTension],
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

  // Build base steps with age-group bonus options
  const baseSteps = getBaseSteps(youth, ageGroup);

  // Collect skill-based bonus options to expand resource/constraint pools
  const selectedSkills = (answers.skills ?? []).filter((v) =>
    SKILL_DISPLAY_OPTIONS.some((o) => o.value === v)
  );
  if (selectedSkills.length > 0 && !youth) {
    const skillResourceBonus = selectedSkills.flatMap(
      (skill) => SKILL_RESOURCE_BONUS[skill] ?? []
    );
    const skillConstraintBonus = selectedSkills.flatMap(
      (skill) => SKILL_CONSTRAINT_BONUS[skill] ?? []
    );
    for (const step of baseSteps) {
      if (step.id === "resources" && skillResourceBonus.length > 0) {
        step.options = [...step.options, ...skillResourceBonus];
      }
      if (step.id === "constraints" && skillConstraintBonus.length > 0) {
        step.options = [...step.options, ...skillConstraintBonus];
      }
    }
  }

  for (const step of baseSteps) {
    const nextValues = filterValuesForStep(step, answers[step.id] ?? []);
    if (nextValues.length > 0) normalized[step.id] = nextValues;
  }

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

  // Normalize inflection answer if present
  if (answers.inflection && answers.inflection.length > 0) {
    normalized.inflection = answers.inflection.slice(0, 1);
  }

  return normalized;
}

export function buildFieldsFromAnswers(answers: QuestionnaireAnswers): Fields {
  const normalizedAnswers = normalizeQuestionnaireAnswers(answers);
  const age = getSingleAnswer(normalizedAnswers, "age");
  const mobility = getSingleAnswer(normalizedAnswers, "mobility");
  const location = mobility;
  const currentMode = getSingleAnswer(normalizedAnswers, "currentMode");
  const trajectoryFocus = getSingleAnswer(normalizedAnswers, "trajectoryFocus");
  const skills = getAnswerList(normalizedAnswers, "skills").join(", ");
  const resources = getAnswerList(normalizedAnswers, "resources").join(", ");
  const constraints = getAnswerList(normalizedAnswers, "constraints").join(", ");
  const obsessions = getAnswerList(normalizedAnswers, "obsessions").join(", ");
  const workStyle = getSingleAnswer(normalizedAnswers, "workStyle");
  const riskTolerance = getSingleAnswer(normalizedAnswers, "riskTolerance");
  const timeHorizon = getSingleAnswer(normalizedAnswers, "timeHorizon");
  const inflection = getSingleAnswer(normalizedAnswers, "inflection");

  return {
    age,
    location,
    skills,
    resources,
    constraints,
    obsessions,
    currentMode,
    trajectoryFocus,
    workStyle,
    riskTolerance,
    timeHorizon,
    mobility,
    inflection,
  };
}

// ---------------------------------------------------------------------------
// Base question steps
// ---------------------------------------------------------------------------

function getBaseSteps(youth: boolean, ageGroup: AgeGroup = youth ? "youth" : "twenties"): QuestionnaireStep[] {
  const bonus = <T,>(map: Partial<Record<AgeGroup, T[]>>): T[] => map[ageGroup] ?? [];

  return [
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
      description: youth
        ? {
            en: "For younger people this often comes down to family, school, and control.",
            zh: "对更年轻的人来说，这通常取决于家庭、学校和自主权。",
          }
        : undefined,
      mode: "single",
      options: SHARED_MOBILITY_OPTIONS,
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
      description: youth
        ? {
            en: "This decides whether we explore school pressure, early projects, talent, or breakout energy.",
            zh: "这会决定后面更偏学业、项目、天赋，还是提早突围。",
          }
        : {
            en: "This unlocks a route-specific follow-up.",
            zh: "这会解锁一道和你路线相关的追问。",
          },
      mode: "single",
      options: youth
        ? YOUTH_MODE_OPTIONS
        : [...ADULT_MODE_OPTIONS, ...bonus(MODE_BONUS)],
    },
    {
      id: "skills",
      title: youth
        ? {
            en: "If your friends had to describe your superpower, what would they say?",
            zh: "如果朋友要描述你的超能力，他们会怎么说？",
          }
        : ageGroup === "senior"
        ? {
            en: "What do decades of experience let you do that others can't?",
            zh: "几十年的经验让你能做到什么别人做不到的？",
          }
        : {
            en: "What's the thing people actually come to you for?",
            zh: "别人真正会来找你帮忙的事是什么？",
          },
      mode: "multi",
      maxSelect: 3,
      options: SKILL_DISPLAY_OPTIONS,
    },
    {
      id: "resources",
      title: youth
        ? {
            en: "What advantages do you have that most people your age don't?",
            zh: "你有哪些同龄人大多没有的优势？",
          }
        : ageGroup === "senior"
        ? {
            en: "What have you accumulated that money can't buy?",
            zh: "你积累了哪些钱买不到的东西？",
          }
        : ageGroup === "twenties"
        ? {
            en: "What do you have going for you that most people don't see?",
            zh: "你有什么别人看不到的优势？",
          }
        : {
            en: "What cards do you already have in your hand?",
            zh: "你手里已经握着什么牌？",
          },
      mode: "multi",
      maxSelect: 3,
      options: youth
        ? YOUTH_RESOURCE_OPTIONS
        : [...ADULT_RESOURCE_OPTIONS, ...bonus(RESOURCE_BONUS)],
    },
    {
      id: "constraints",
      title: youth
        ? {
            en: "What's the wall you keep running into?",
            zh: "你一直在撞的那堵墙是什么？",
          }
        : ageGroup === "senior"
        ? {
            en: "What's the thing that makes you wonder if it's too late?",
            zh: "什么事让你怀疑是不是已经太晚了？",
          }
        : ageGroup === "twenties"
        ? {
            en: "What's the thing nobody warned you about?",
            zh: "什么事是没人提醒过你的？",
          }
        : {
            en: "What makes you sigh when you're honest with yourself?",
            zh: "对自己诚实的时候，什么事让你叹气？",
          },
      mode: "multi",
      maxSelect: 3,
      options: youth
        ? YOUTH_CONSTRAINT_OPTIONS
        : [...ADULT_CONSTRAINT_OPTIONS, ...bonus(CONSTRAINT_BONUS)],
    },
    {
      id: "obsessions",
      title: youth
        ? {
            en: "What can't you stop thinking about — even when you should be doing homework?",
            zh: "就算该写作业了，你脑子里还是停不下来想的是什么？",
          }
        : ageGroup === "senior"
        ? {
            en: "What would you regret never trying?",
            zh: "什么事你会后悔从来没试过？",
          }
        : ageGroup === "twenties"
        ? {
            en: "What keeps pulling you even when it makes no sense?",
            zh: "什么东西一直在拉你，即使毫无道理？",
          }
        : {
            en: "What would you chase even if nobody was watching?",
            zh: "即使没人看着，你也会追的是什么？",
          },
      mode: "multi",
      maxSelect: 3,
      options: DRIVE_DISPLAY_OPTIONS,
    },
    {
      id: "workStyle",
      title: youth
        ? {
            en: "How will people first notice you're different?",
            zh: "别人最先会因为什么发现你不一样？",
          }
        : ageGroup === "senior"
        ? {
            en: "At this point, how do you actually get things done?",
            zh: "到了这个阶段，你实际上是怎么把事做成的？",
          }
        : {
            en: "When you're in your zone, what does it look like?",
            zh: "当你进入状态时，那是什么样子？",
          },
      mode: "single",
      options: youth
        ? YOUTH_WORK_STYLE_OPTIONS
        : [...ADULT_WORK_STYLE_OPTIONS, ...bonus(WORK_STYLE_BONUS)],
    },
    {
      id: "riskTolerance",
      title: youth
        ? {
            en: "Your friends think your idea is crazy. How does that make you feel?",
            zh: "朋友们觉得你的想法太疯了。你感觉怎样？",
          }
        : ageGroup === "senior"
        ? {
            en: "You have one big bet left in you. How do you play it?",
            zh: "你还剩一次大赌注的机会。你怎么用？",
          }
        : {
            en: "A high-stakes bet lands on the table. What do you do?",
            zh: "一个高风险赌注摆上了桌。你怎么办？",
          },
      mode: "single",
      options: youth
        ? YOUTH_RISK_OPTIONS
        : [...ADULT_RISK_OPTIONS, ...bonus(RISK_BONUS)],
    },
    {
      id: "timeHorizon",
      title: youth
        ? {
            en: "When you daydream about 'making it', how old are you in the daydream?",
            zh: "当你白日梦里'成功了'的时候，你几岁？",
          }
        : ageGroup === "senior"
        ? {
            en: "How much runway are you designing for?",
            zh: "你在为多长的跑道做规划？",
          }
        : {
            en: "When you picture your future self smiling, how far away are they?",
            zh: "想象未来那个在笑的自己，他有多远？",
          },
      mode: "single",
      options: youth
        ? YOUTH_HORIZON_OPTIONS
        : [...ADULT_HORIZON_OPTIONS, ...bonus(HORIZON_BONUS)],
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

function getAgeGroup(age: string): AgeGroup {
  switch (age) {
    case "Under 20": return "youth";
    case "20–29": return "twenties";
    case "30–44": return "midcareer";
    case "45+": return "senior";
    default: return "twenties";
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
