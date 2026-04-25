import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import finalStoryScenarios from "../evals/golden/finalStoryScenarios.json";
import LiveFinalStoryProvider from "../evals/promptfoo/liveFinalStoryProvider";

const require = createRequire(import.meta.url);
const assertFinalStoryQuality = require("../evals/promptfoo/assertFinalStoryQuality.cjs");

const originalEnv = {
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  PROMPTFOO_DEEPSEEK_MODEL: process.env.PROMPTFOO_DEEPSEEK_MODEL,
  XAI_API_KEY: process.env.XAI_API_KEY,
};

function restoreEnv(key: keyof typeof originalEnv) {
  const value = originalEnv[key];
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const finalDraft = [
  "By November, the desk had moved beside the only window, and Mara kept a chipped mug there because it made the room feel less temporary. The invoice printer jammed every Thursday, usually when the small system had finally sent enough money to matter. She learned the landlord's footsteps before she learned the market. One night an apprentice stayed late and asked why the door was never fully closed.",
  "The train ticket was bought before dawn, with no romance in it, just a sore thumb and a phone battery at seven percent. In the new city, the workshop smelled of oil, wet wool, and someone else's ambition. Mara did not announce a reinvention. She bought soup, forgot a birthday, and began again.",
  "The first public no came at a meeting where the windows did not open. It was smaller than she had imagined, almost petty, but after it the invoices began carrying her name instead of someone else's brand. A friend said she had become hard to advise. The remark stayed on the counter for a week.",
  "Years later, the room was larger and less forgiving, with three desks and a kettle that clicked too loudly. The apprentice ran the Tuesday system now and sometimes made the same mistakes. Mara watched the last train leave without her and felt no triumph. Outside, rain collected in the gutter like a decision postponed.",
].join("\n\n");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  restoreEnv("DEEPSEEK_API_KEY");
  restoreEnv("PROMPTFOO_DEEPSEEK_MODEL");
  restoreEnv("XAI_API_KEY");
});

describe("Promptfoo golden final-story eval data", () => {
  it("defines reusable questionnaire scenarios with selected motifs and traits", () => {
    expect(finalStoryScenarios.length).toBeGreaterThanOrEqual(2);

    for (const scenario of finalStoryScenarios) {
      expect(scenario.id).toMatch(/^[a-z0-9-]+$/);
      expect(scenario.fields.currentMode).toEqual(expect.any(String));
      expect(scenario.big5).toHaveLength(5);
      expect(scenario.selectedFragments).toHaveLength(6);
      expect(scenario.expectedTraits.requiredMotifTerms.length).toBeGreaterThanOrEqual(4);
      expect(scenario.expectedTraits.forbiddenTerms).toContain("Big Five");
    }
  });
});

describe("Promptfoo final-story quality assertion", () => {
  it("passes a concrete four-paragraph story that carries the expected motifs", () => {
    const result = assertFinalStoryQuality(finalDraft, {
      vars: {
        expectedTraits: {
          minWords: 120,
          maxWords: 260,
          requiredMotifTerms: ["window", "invoice", "train", "apprentice"],
          forbiddenTerms: ["Big Five", "openness", "conscientiousness"],
        },
      },
    });

    expect(result.pass).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0.75);
  });

  it("fails generic output with profile leakage", () => {
    const result = assertFinalStoryQuality(
      "Your high openness and strong risk tolerance unlock your potential. Embrace the journey.",
      {
        vars: {
          expectedTraits: {
            minWords: 40,
            requiredMotifTerms: ["window", "invoice", "train", "apprentice"],
            forbiddenTerms: ["openness", "risk tolerance"],
          },
        },
      }
    );

    expect(result.pass).toBe(false);
    expect(result.reason).toMatch(/paragraph|forbidden|motif|generic/i);
  });
});

describe("Promptfoo live final-story provider", () => {
  it("renders a golden final prompt, calls the configured provider, and runs cleanup", async () => {
    process.env.DEEPSEEK_API_KEY = "ds-test-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: finalDraft } }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: `${finalDraft}\n\nA cleaned edge remains.` } }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new LiveFinalStoryProvider({
      id: "file://evals/promptfoo/liveFinalStoryProvider.ts",
      config: {
        provider: "deepseek",
        model: "deepseek-v4-pro",
        runCleanup: true,
      },
    });

    const result = await provider.callApi("same-input", {
      vars: { scenarioId: finalStoryScenarios[0].id },
    });

    expect(result.output).toContain("A cleaned edge remains.");
    expect(result.metadata).toMatchObject({
      scenarioId: finalStoryScenarios[0].id,
      provider: "deepseek",
      model: "deepseek-v4-pro",
      runCleanup: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);

    expect(firstBody.model).toBe("deepseek-v4-pro");
    expect(firstBody.messages[0].content).toContain("MOTIFS");
    expect(secondBody.messages[0].content).toContain("Read this trajectory");
  });

  it("allows env model overrides without editing the Promptfoo config", async () => {
    process.env.DEEPSEEK_API_KEY = "ds-test-key";
    process.env.PROMPTFOO_DEEPSEEK_MODEL = "deepseek-chat";
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: finalDraft } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new LiveFinalStoryProvider({
      config: {
        provider: "deepseek",
        model: "deepseek-v4-pro",
        runCleanup: false,
      },
    });

    await provider.callApi("same-input", {
      vars: { scenarioId: finalStoryScenarios[0].id },
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.model).toBe("deepseek-chat");
  });

  it("times out live provider calls so one slow model cannot hang the eval", async () => {
    vi.useFakeTimers();
    process.env.DEEPSEEK_API_KEY = "ds-test-key";
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    const provider = new LiveFinalStoryProvider({
      config: {
        provider: "deepseek",
        model: "deepseek-v4-pro",
        runCleanup: false,
        timeoutMs: 10,
      },
    });

    const resultPromise = provider.callApi("same-input", {
      vars: { scenarioId: finalStoryScenarios[0].id },
    });
    await vi.advanceTimersByTimeAsync(11);

    const result = await resultPromise;
    expect(result.error).toContain("timed out after 10ms");
  });

  it("returns an actionable error when the provider API key is missing", async () => {
    delete process.env.XAI_API_KEY;
    const provider = new LiveFinalStoryProvider({
      config: {
        provider: "xai",
        model: "grok-4-1-fast-reasoning",
      },
    });

    const result = await provider.callApi("same-input", {
      vars: { scenarioId: finalStoryScenarios[0].id },
    });

    expect(result.error).toContain("Missing XAI_API_KEY");
  });
});
