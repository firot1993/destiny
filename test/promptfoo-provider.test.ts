import { describe, expect, it } from "vitest";
import DestinyPromptProvider from "../evals/promptfoo/destinyPromptProvider";

function makeProvider() {
  return new DestinyPromptProvider({
    id: "file://evals/promptfoo/destinyPromptProvider.ts",
    config: {},
  });
}

describe("promptfoo Destiny prompt provider", () => {
  it("renders scan prompt contracts from the app prompt builders", async () => {
    const provider = makeProvider();

    const result = await provider.callApi("scan", {
      vars: {
        scenario: "scan",
        lang: "en",
        guidance: 7,
      },
    });

    expect(result.output).toContain("Generate exactly 10 raw future fragments.");
    expect(result.output).toContain("WORLD STATE:");
    expect(result.output).toContain("Format exactly:");
    expect(result.output).not.toMatch(/Big Five|openness|conscientiousness/i);
    expect(result.metadata).toMatchObject({
      scenario: "scan",
      stage: "scan",
      lang: "en",
    });
  });

  it("renders final story prompt contracts with chamber anchors", async () => {
    const provider = makeProvider();

    const result = await provider.callApi("final", {
      vars: {
        scenario: "final",
        lang: "en",
        signatureAuthor: "Rachel Cusk",
      },
    });

    expect(result.output).toContain("exactly 4 paragraphs");
    expect(result.output).toContain("Paragraph 1 anchor:");
    expect(result.output).toContain("Paragraph 4 anchor:");
    expect(result.output).toContain("Write in the voice of Rachel Cusk.");
    expect(result.metadata).toMatchObject({
      scenario: "final",
      stage: "final",
    });
  });

  it("returns an actionable error for unknown scenarios", async () => {
    const provider = makeProvider();

    const result = await provider.callApi("unknown", {
      vars: {
        scenario: "unknown",
      },
    });

    expect(result.error).toContain("Unknown promptfoo scenario");
    expect(result.error).toContain("scan");
  });
});
