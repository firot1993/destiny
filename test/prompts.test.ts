import { describe, expect, it } from "vitest";
import type { Fields } from "@/types";
import { buildStoryConditioning, generateStepPrompt } from "@/lib/prompts";

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

    expect(prompt.content).toContain("BOUNDARY CONDITIONS:");
    expect(prompt.content).toContain("LATENT FORCES:");
    expect(prompt.content).toContain("PERSONALITY SIGNATURE:");
    expect(prompt.content).toContain(
      "Treat the selected fragments as the only valid surface motifs of the story."
    );
    expect(prompt.content).toContain("Do not restate the profile as prose.");
    expect(prompt.content).not.toContain("PERSON'S CURRENT STATE:");
    expect(prompt.content).not.toContain("Personality (Big Five)");
  });
});
