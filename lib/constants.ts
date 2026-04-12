export const DEFAULT_PROVIDER = "openrouter";

export const PROVIDERS: Record<string, string[]> = {
  openrouter: [
    "anthropic/claude-sonnet-4.6",
    "openai/gpt-5.4",
  ],
  xai: [
    "grok-4.20-experimental-beta-0304-reasoning",
    "grok-4.20-multi-agent-experimental-beta-0304",
    "grok-4-1-fast-reasoning",
  ],
};

export const BIG5_KEYS = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
] as const;

export const BIG5_ICONS = ["◈", "◉", "◎", "◇", "◆"];

export const INPUT_FIELDS = [
  { key: "age", type: "short" },
  { key: "location", type: "short" },
  { key: "skills", type: "medium" },
  { key: "resources", type: "medium" },
  { key: "constraints", type: "medium" },
  { key: "obsessions", type: "long" },
] as const;

export const NOISE_SCAN_COUNT = 10;
export const MAX_KEPT_NOISE = 5;
export const MAX_REMOVED_NOISE = NOISE_SCAN_COUNT - MAX_KEPT_NOISE;
export const DAILY_USAGE_STORAGE_PREFIX = "destiny-daily-usage";
export const API_ROUTE = "/api/generate";
