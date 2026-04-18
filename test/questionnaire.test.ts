import { describe, expect, it } from "vitest";
import {
  buildFieldsFromAnswers,
  getQuestionnaireSteps,
} from "@/lib/questionnaire";

describe("questionnaire redesign — sideways revelation", () => {
  it("reframes the major questions around tension, scene, and recognition", () => {
    const steps = getQuestionnaireSteps({
      age: ["20–29"],
      mobility: ["Can relocate for the right upside"],
      currentMode: ["Early-career builder"],
      delayFailureMode: ["Waiting for certainty that never arrives"],
    });

    expect(steps.find((step) => step.id === "hiddenEdge")?.title.en).toBe(
      "What do you have that matters more than it looks?"
    );
    expect(steps.find((step) => step.id === "recurringTrap")?.title.en).toBe(
      "What trap do you keep decorating instead of escaping?"
    );
    expect(steps.find((step) => step.id === "costWillingness")?.title.en).toBe(
      "Which cost are you increasingly willing to pay?"
    );
    expect(steps.find((step) => step.id === "magneticScene")?.title.en).toBe(
      "Which image feels charged, even if you can't fully justify it?"
    );
    expect(steps.find((step) => step.id === "socialMirror")?.title.en).toBe(
      "What do you want people to eventually realize about you?"
    );
    expect(steps.find((step) => step.id === "delayFailureMode")?.title.en).toBe(
      "When the moment comes, what usually breaks first?"
    );
    expect(steps.find((step) => step.id === "trajectoryFocus")?.title.en).toBe(
      "What makes this chapter unstable in an interesting way?"
    );
    expect(steps.find((step) => step.id === "inflection")?.title.en).toBe(
      "What kind of event would force the next version of you to appear?"
    );
  });

  it("groups every step under one of four chapters", () => {
    const steps = getQuestionnaireSteps({
      age: ["20–29"],
      currentMode: ["Early-career builder"],
      delayFailureMode: ["Waiting for certainty that never arrives"],
    });

    const chapters = new Set(steps.map((s) => s.chapter));
    expect(chapters).toEqual(new Set(["now", "unstable", "pull", "motion"]));
    steps.forEach((step) => expect(step.chapter).toBeDefined());
  });

  it("emits the chapter header on the first step of each chapter", () => {
    const steps = getQuestionnaireSteps({
      age: ["20–29"],
      currentMode: ["Early-career builder"],
      delayFailureMode: ["Waiting for certainty that never arrives"],
    });

    const withHeader = steps.filter((s) => s.chapterTitle);
    const headerTitles = withHeader.map((s) => s.chapterTitle?.en);
    expect(headerTitles).toEqual(["Now", "Unstable", "Pull", "Motion"]);
  });

  it("renders magneticScene with six scene-based options", () => {
    const steps = getQuestionnaireSteps({ age: ["20–29"] });
    const scene = steps.find((s) => s.id === "magneticScene");
    expect(scene?.options).toHaveLength(6);
    expect(scene?.options[0]?.label.en).toBe(
      "A small room where one thing gets quietly better every week"
    );
  });

  it("delayFailureMode shapes the inflection option pool", () => {
    const stepsA = getQuestionnaireSteps({
      age: ["20–29"],
      currentMode: ["Early-career builder"],
      delayFailureMode: ["Too many doors open and none close at the right time"],
    });
    const stepsB = getQuestionnaireSteps({
      age: ["20–29"],
      currentMode: ["Early-career builder"],
      delayFailureMode: ["Doing the real work but avoiding the real exposure"],
    });

    const inflectionA = stepsA.find((s) => s.id === "inflection");
    const inflectionB = stepsB.find((s) => s.id === "inflection");
    expect(inflectionA?.options[0]?.value).toBe(
      "A deadline closes every door except one"
    );
    expect(inflectionB?.options[0]?.value).toBe(
      "A public moment makes privacy no longer viable"
    );
  });

  it("hiddenEdge selection expands the recurringTrap option pool with matching shadow traps", () => {
    const baseTraps = getQuestionnaireSteps({ age: ["20–29"] }).find(
      (s) => s.id === "recurringTrap"
    )!.options.length;

    const expanded = getQuestionnaireSteps({
      age: ["20–29"],
      hiddenEdge: [
        "A capacity for obscurity",
        "Taste that arrives before status",
      ],
    }).find((s) => s.id === "recurringTrap")!.options;

    expect(expanded.length).toBeGreaterThan(baseTraps);
    const values = expanded.map((o) => o.value);
    expect(values).toContain(
      "Obscurity becomes cozy and starts feeling like identity"
    );
    expect(values).toContain(
      "Taste outruns what I'll let myself be seen making"
    );
  });

  it("buildFieldsFromAnswers populates new fields and legacy aliases", () => {
    const fields = buildFieldsFromAnswers({
      age: ["20–29"],
      mobility: ["Can relocate for the right upside"],
      currentMode: ["Early-career builder"],
      hiddenEdge: ["Taste that arrives before status"],
      recurringTrap: ["Waiting for certainty that never arrives"],
      costWillingness: ["Visibility before I feel ready"],
      magneticScene: ["A small room where one thing gets better every week"],
      socialMirror: ["That the quiet period was not stagnation"],
      delayFailureMode: ["Waiting for certainty that never arrives"],
    });

    expect(fields.hiddenEdge).toBe("Taste that arrives before status");
    expect(fields.magneticScene).toBe(
      "A small room where one thing gets better every week"
    );
    expect(fields.costWillingness).toBe("Visibility before I feel ready");

    // Legacy aliases should carry the new semantic values through to prompts.ts:
    expect(fields.resources).toBe(fields.hiddenEdge);
    expect(fields.constraints).toBe(fields.recurringTrap);
    expect(fields.workStyle).toBe(fields.magneticScene);
    expect(fields.riskTolerance).toBe(fields.costWillingness);
    expect(fields.timeHorizon).toBe(fields.socialMirror);
    expect(fields.location).toBe(fields.mobility);
  });

  it("keeps route-conditioned trajectoryFocus insertion behavior", () => {
    const steps = getQuestionnaireSteps({
      age: ["20–29"],
      currentMode: ["Early-career builder"],
    });
    const trajectoryIdx = steps.findIndex((s) => s.id === "trajectoryFocus");
    const currentModeIdx = steps.findIndex((s) => s.id === "currentMode");
    expect(trajectoryIdx).toBe(currentModeIdx + 1);
    expect(
      steps.find((s) => s.id === "trajectoryFocus")?.options[0]?.label.en
    ).toBe("I may already be better than my current life proves");
  });
});
