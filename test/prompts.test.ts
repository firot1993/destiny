import { describe, expect, it } from "vitest";
import type { Fields } from "@/types";
import {
  buildStoryConditioning,
  generateStepPrompt,
  generateQualityGatePrompt,
  parseQualityGateScore,
  generateRevisionVerificationPrompt,
  parseRevisionVerification,
  generateDiversityCheckPrompt,
  parseDiversityCheck,
} from "@/lib/prompts";

const sampleFields: Fields = {
  age: "20–29",
  mobility: "Can relocate for the right upside",
  currentMode: "Early-career builder",
  trajectoryFocus: "Turning skill into real leverage",
  hiddenEdge: "Runway that buys patience, Taste that arrives before status",
  recurringTrap: "Waiting for certainty that never arrives",
  costWillingness: "Visibility before I feel ready",
  magneticScene: "A small room where one thing gets better every week",
  socialMirror: "That the quiet period was not stagnation",
  obsessions: "Leverage that keeps paying after the effort ends",
  delayFailureMode: "Waiting for certainty that never arrives",
  inflection: "A stranger bets on me before the proof is in",
  // Legacy aliases (mirror new fields for back-compat with older inference arms):
  location: "Can relocate for the right upside",
  skills: "",
  resources: "Runway that buys patience, Taste that arrives before status",
  constraints: "Waiting for certainty that never arrives",
  workStyle: "A small room where one thing gets better every week",
  riskTolerance: "Visibility before I feel ready",
  timeHorizon: "That the quiet period was not stagnation",
};

describe("prompt conditioning", () => {
  it("compresses profile data into hidden forces and behavioral personality cues", () => {
    const conditioning = buildStoryConditioning(sampleFields, [9, 7, 3, 4, 8], {
      whyThese: "They feel dangerous but true",
      rejectedFuture: "too safe",
    });

    expect(conditioning.hardState).toEqual(
      expect.objectContaining({
        ageBand: "20–29",
        chapter: "Early-career builder",
        horizon: expect.any(String),
        anchorResource: expect.any(String),
        anchorConstraint: expect.any(String),
      })
    );
    expect(conditioning.latentForces.coreTension).toMatch(
      /proof|leverage|position|capability/i
    );
    expect(conditioning.latentForces.selectionCharge).toMatch(/danger|stakes|truth/i);
    expect(conditioning.personalitySignature.combinedReading).not.toMatch(
      /Big Five|openness|conscientiousness|extraversion|agreeableness|neuroticism/i
    );

    const encoded = JSON.stringify(conditioning);
    expect(encoded).not.toContain("Go all-in when conviction is high");
    expect(encoded).not.toContain("Quietly, through craft and depth");
    expect(encoded).not.toContain("Personality (Big Five)");
  });

  it("tells the denoise chain to treat fragments as surface motifs and profile as hidden causality", () => {
    const conditioning = buildStoryConditioning(sampleFields, [6, 6, 5, 5, 6], {
      whyThese: "They feel more real than the rest",
      rejectedFuture: "too performative",
    });

    const prompt = generateStepPrompt(
      1,
      4,
      conditioning,
      7,
      "a quiet room above a loud city",
      "en"
    );

    expect(prompt.content).toContain("PERSON:");
    expect(prompt.content).toContain("UNDERCURRENTS:");
    expect(prompt.content).toContain("TEMPERAMENT:");
    expect(prompt.content).toContain(
      "Do not name personality dimensions or psychological labels."
    );
    expect(prompt.content).toContain("Avoid these words:");
    expect(prompt.content).not.toContain("PERSON'S CURRENT STATE:");
    expect(prompt.content).not.toContain("Personality (Big Five)");
  });

  it("injects steering note into sharpen prompt when provided", () => {
    const conditioning = buildStoryConditioning(sampleFields, [6, 6, 5, 5, 6]);

    // progress >= 0.45 triggers sharpen prompt (step 2 of 4: 2/3 = 0.67)
    const prompt = generateStepPrompt(
      2,
      4,
      conditioning,
      7,
      "draft text about a quiet room",
      "en",
      undefined,
      null,
      null,
      "make it darker and more visceral"
    );

    expect(prompt.content).toContain("USER DIRECTION");
    expect(prompt.content).toContain("make it darker and more visceral");
  });

  it("does not inject steering block when steeringNote is null", () => {
    const conditioning = buildStoryConditioning(sampleFields, [6, 6, 5, 5, 6]);

    const prompt = generateStepPrompt(
      2,
      4,
      conditioning,
      7,
      "draft text",
      "en",
      undefined,
      null,
      null,
      null
    );

    expect(prompt.content).not.toContain("USER DIRECTION");
  });
});

describe("quality gate (Enhancement 1)", () => {
  it("generates a quality gate prompt with scoring instructions", () => {
    const conditioning = buildStoryConditioning(sampleFields, [5, 5, 5, 5, 5]);
    const prompt = generateQualityGatePrompt("A draft story.", conditioning);

    expect(prompt.content).toContain("SCORE:");
    expect(prompt.content).toContain("1-10");
    expect(prompt.content).toContain("DRAFT:");
    expect(prompt.content).toContain("A draft story.");
  });

  it("parses SCORE: 8 as shouldContinue=false", () => {
    const result = parseQualityGateScore("SCORE: 8");
    expect(result.score).toBe(8);
    expect(result.shouldContinue).toBe(false);
  });

  it("parses SCORE: 4 as shouldContinue=true", () => {
    const result = parseQualityGateScore("SCORE: 4");
    expect(result.score).toBe(4);
    expect(result.shouldContinue).toBe(true);
  });

  it("defaults to score 5 when no SCORE line found", () => {
    const result = parseQualityGateScore("This draft is okay.");
    expect(result.score).toBe(5);
    expect(result.shouldContinue).toBe(true);
  });

  it("clamps out-of-range scores", () => {
    expect(parseQualityGateScore("SCORE: 15").score).toBe(10);
    expect(parseQualityGateScore("SCORE: 0").score).toBe(1);
  });
});

describe("revision verification (Enhancement 3)", () => {
  it("generates a revision verification prompt", () => {
    const prompt = generateRevisionVerificationPrompt(
      "Revised draft here.",
      "- Fix the abstract language\n- Add more concrete details"
    );

    expect(prompt.content).toContain("ORIGINAL CRITIQUE NOTES:");
    expect(prompt.content).toContain("REVISED DRAFT:");
    expect(prompt.content).toContain("REVISION_OK");
  });

  it("parses REVISION_OK as allResolved", () => {
    const result = parseRevisionVerification("REVISION_OK");
    expect(result.allResolved).toBe(true);
    expect(result.unresolvedNotes).toBeNull();
  });

  it("parses UNRESOLVED block as unresolved notes", () => {
    const result = parseRevisionVerification(
      "UNRESOLVED:\n- Fix the abstract language in paragraph 2"
    );
    expect(result.allResolved).toBe(false);
    expect(result.unresolvedNotes).toContain("Fix the abstract language");
  });
});

describe("diversity check (Enhancement 6)", () => {
  it("generates a diversity check prompt with numbered fragments", () => {
    const fragments = ["a held breath", "red dust", "a door half-open"];
    const prompt = generateDiversityCheckPrompt(fragments);

    expect(prompt.content).toContain("1:: a held breath");
    expect(prompt.content).toContain("2:: red dust");
    expect(prompt.content).toContain("3:: a door half-open");
    expect(prompt.content).toContain("DIVERSE_OK");
  });

  it("parses DIVERSE_OK as isDiverse=true", () => {
    const result = parseDiversityCheck("DIVERSE_OK");
    expect(result.isDiverse).toBe(true);
    expect(result.replaceIndices).toEqual([]);
  });

  it("parses REPLACE: 3, 7 as isDiverse=false with indices", () => {
    const result = parseDiversityCheck("REPLACE: 3, 7");
    expect(result.isDiverse).toBe(false);
    expect(result.replaceIndices).toEqual([3, 7]);
  });

  it("handles malformed replace response gracefully", () => {
    const result = parseDiversityCheck("I think all fragments are unique");
    expect(result.isDiverse).toBe(true);
    expect(result.replaceIndices).toEqual([]);
  });
});
