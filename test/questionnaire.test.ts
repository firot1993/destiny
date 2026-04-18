import { describe, expect, it } from "vitest";
import { getQuestionnaireSteps } from "@/lib/questionnaire";

describe("questionnaire redesign copy", () => {
  it("reframes the major adult questions around tensions instead of profile labels", () => {
    const steps = getQuestionnaireSteps({
      age: ["20–29"],
      mobility: ["Can relocate for the right upside"],
      currentMode: ["Early-career builder"],
      workStyle: ["Quietly, through craft and depth"],
      riskTolerance: ["Go all-in when conviction is high"],
    });

    expect(steps.find((step) => step.id === "resources")?.title.en).toBe(
      "Which advantage matters more than it looks?"
    );
    expect(steps.find((step) => step.id === "constraints")?.title.en).toBe(
      "What kind of trap do you keep falling into?"
    );
    expect(steps.find((step) => step.id === "workStyle")?.title.en).toBe(
      "When things start working for you, what is usually carrying the momentum?"
    );
    expect(steps.find((step) => step.id === "riskTolerance")?.title.en).toBe(
      "When the future is unclear, which mistake do you fear more?"
    );
    expect(steps.find((step) => step.id === "trajectoryFocus")?.title.en).toBe(
      "What makes this chapter unstable in an interesting way?"
    );
    expect(steps.find((step) => step.id === "inflection")?.title.en).toBe(
      "What kind of event would force the next version of you to appear?"
    );
  });

  it("rewrites adult option copy into dramatic tradeoffs while preserving routing", () => {
    const steps = getQuestionnaireSteps({
      age: ["20–29"],
      mobility: ["Can relocate for the right upside"],
      currentMode: ["Early-career builder"],
    });

    expect(steps.find((step) => step.id === "resources")?.options[0]?.label.en).toBe(
      "I can survive a long runway without panicking"
    );
    expect(
      steps.find((step) => step.id === "workStyle")?.options[0]?.label.en
    ).toBe("The work gets undeniable before I do");
    expect(
      steps.find((step) => step.id === "trajectoryFocus")?.options[0]?.label.en
    ).toBe("I may be better than my current life proves");
  });
});
