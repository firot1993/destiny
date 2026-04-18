# Repo Logic And Prompt Flow

This note explains the repo at the product-logic level rather than the UI level.

The current system is:

1. A staged questionnaire that collects factual guardrails plus dramatic tension
2. A scan pass that generates 10 unresolved future fragments
3. A user-curated bullet phase that chooses visible story motifs
4. A hidden conditioning layer that compresses questionnaire data into latent forces
5. A linear rewrite chain that turns selected motifs into a trajectory
6. A final anti-echo cleanup pass that strips questionnaire-sounding prose

The app still borrows the language of "diffusion," but the runtime is not a true diffusion model. It is a prompt chain with one human curation checkpoint and one final cleanup rewrite.

## Source Map

The logic described here comes primarily from these files:

- `lib/questionnaire.ts`
- `components/InputForm.tsx`
- `components/Big5Form.tsx`
- `app/page.tsx`
- `lib/prompts.ts`
- `hooks/useGeneration.ts`
- `lib/revolver.ts`
- `app/api/generate/route.ts`
- `lib/providers.ts`
- `types/index.ts`

The key data shapes discussed below are:

- `QuestionnaireAnswers`
- `Fields`
- `CurationAnswers`
- `StoryConditioning`
- `NoiseFragment`
- `Bullet`
- `RunPhase`

The key prompt entry point is now:

```ts
generateStepPrompt(step, totalSteps, conditioning, guidance, prev, lang)
```

not the older `state`-string interface.

## Product Thesis

The redesign changed the product goal from:

> "describe yourself, then narrativize the description"

to:

> "reveal your tensions, then turn those tensions into a future shape"

That produces three important separations:

- questionnaire answers define causality, boundary conditions, and plausibility
- selected bullets define imagery, scenes, motifs, and memorable turns
- the final cleanup pass removes direct profile paraphrase if it leaks back in

## What The App Asks

### Base questionnaire

The questionnaire still begins from a shared base shape assembled by `getBaseSteps(...)` in `lib/questionnaire.ts`.

The fixed inputs are:

- `age`
- `mobility`
- `currentMode`
- `skills`
- `resources`
- `constraints`
- `obsessions`
- `workStyle`
- `riskTolerance`
- `timeHorizon`

These are still curated option pools, not free text.

What changed is the user-facing copy:

- `resources` now asks for hidden asymmetry rather than inventory
- `constraints` now asks for repeating traps rather than static problems
- `workStyle` now asks how momentum usually arrives
- `riskTolerance` now asks which error the person fears more
- `trajectoryFocus` now asks what makes the chapter unstable in an interesting way
- `inflection` now asks what kind of event would force the next version of the person to appear

The backend schema did not get rebuilt. The canonical `value` strings still drive routing and normalization. The `label` strings got rewritten to feel more dramatic and less profile-like.

### Dynamic question: `trajectoryFocus`

`trajectoryFocus` is still conditional. It is inserted by `getQuestionnaireSteps(...)` when the app can infer a route-specific tension from:

- age group
- `currentMode`

The logic is unchanged:

- derive `ageGroup` from `age`
- select route options from `YOUTH_ROUTE_OPTION_MAP` or `ADULT_ROUTE_OPTION_MAP`
- append age-specific route bonuses from `AGE_ROUTE_BONUS`
- insert the step after the first three questions when at least one route option exists

What changed is the framing. The prompt copy is now tension-first:

- title: `What makes this chapter unstable in an interesting way?`
- description: choose the contradiction that gives the chapter its charge

So the logic is still route-conditioned, but the experience feels less like a career form and more like a pressure-reading instrument.

### Dynamic question: `inflection`

`inflection` is still appended only if `getInflectionTension(riskTolerance, workStyle)` returns a non-null value.

The four tension groups are unchanged:

- `bold-craft`
- `cautious-visible`
- `speed-system`
- `generic`

The routing still keys off canonical values such as:

- quiet craft plus bold risk -> `bold-craft`
- visibility plus conservative risk -> `cautious-visible`
- systems plus speed-oriented risk -> `speed-system`
- all other valid pairs -> `generic`

What changed is the wording. The step now asks for a rupture rather than a nice milestone:

- title: `What kind of event would force the next version of you to appear?`
- description: choose the rupture that makes hedging harder than becoming

### Skill-based option expansion

The questionnaire still expands `resources` and `constraints` based on selected `skills`.

This still happens in:

- `getQuestionnaireSteps(...)`
- `normalizeQuestionnaireAnswers(...)`

Examples:

- `Tech & Engineering` adds `Open-source reputation` and `Automation anxiety — my own tools could replace me`
- `Writing & Media` adds `An audience that trusts my voice` and `Algorithms decide who hears me`

So the app still adapts what counts as a plausible asset or bottleneck based on domain context.

## Inputs Outside The Questionnaire

There are now two separate non-questionnaire input layers.

### Big Five sliders

`components/Big5Form.tsx` still collects five 1-10 scores keyed from `BIG5_KEYS`:

- openness
- conscientiousness
- extraversion
- agreeableness
- neuroticism

The important redesign change is that the prompt layer no longer sends these as named Big Five traits with explicit "high openness means X" instructions.

Instead, `buildStoryConditioning(...)` in `lib/prompts.ts` converts them into a behavioral signature:

- `noveltyAppetite`
- `consistencyPressure`
- `socialPropulsion`
- `conflictTolerance`
- `anticipatorySensitivity`
- `combinedReading`

Examples of the tone of this conversion:

- "moves toward novelty before full permission exists"
- "builds slowly, privately, and convincingly"
- "feels the future intensely enough that doubt and drive keep taking turns at the wheel"

So personality is now encoded as causal behavior, not diagnostic labels.

### Post-curation answers

After bullet selection, the user now supplies two more signals in `app/page.tsx`:

```ts
type CurationAnswers = {
  whyThese: string;
  rejectedFuture: string;
};
```

These are not part of `QuestionnaireAnswers`.

They are collected after the scan/bullet phase using fixed option sets:

- `whyThese`
  - "They feel like my best life"
  - "They feel dangerous but true"
  - "They feel embarrassing to want"
  - "They feel more real than the rest"
  - "I don't know why, but they stick"
- `rejectedFuture`
  - "too safe"
  - "too performative"
  - "too lonely"
  - "too chaotic"
  - "too ordinary"
  - "too borrowed from other people"

These are not visible motifs either. They only shape hidden conditioning.

## Controls

The app still also collects:

- `guidance`
- `denoiseSteps`
- `provider`
- `model`

### Guidance

`guidance` is still the ambition/intensity dial.

It affects:

- scan tone
- denoise ambition framing

The buckets remain:

- high: dramatic pivots, unexpected breakthroughs, biography-worthy
- middle: ambitious but grounded, notable achievements
- low: meaningful, well-lived, not flashy

### Denoise steps

`denoiseSteps` still ranges from 2 to 8.

The runtime call structure is now:

- 1 scan call
- `denoiseSteps - 1` denoise calls
- 1 cleanup call

So the total model-call count is:

```text
denoiseSteps + 1
```

Examples:

- `denoiseSteps = 2` -> 1 scan + 1 final denoise + 1 cleanup
- `denoiseSteps = 4` -> 1 scan + 3 denoise + 1 cleanup

The UI step labels still split later steps into `structure`, `sharpen`, and `refine` using `getStepLabel(...)`, but the prompt templates themselves are simpler than the older version:

- scan
- early structure (`progress < 0.45`)
- sharpen/revise (`progress >= 0.45` and not final)
- final trajectory
- cleanup

### Provider and model

This logic is unchanged:

- `provider` chooses the upstream adapter in `lib/providers.ts`
- `model` chooses the concrete model name sent to that provider

The prompt chain itself does not vary by provider.

## Normalization And Encoding

### `QuestionnaireAnswers` -> normalized answers

`normalizeQuestionnaireAnswers(...)` still makes questionnaire state self-healing.

It:

1. Re-derives valid steps from `age`
2. Rebuilds route-conditioned and skill-conditioned option pools
3. Filters selected values against the currently valid option set
4. Truncates single-choice steps to one value
5. Truncates multi-choice steps to `maxSelect`
6. Re-validates `trajectoryFocus`
7. Keeps at most one `inflection` answer

So earlier answer changes still invalidate downstream choices automatically.

### Normalized answers -> `Fields`

`buildFieldsFromAnswers(...)` still flattens normalized answers into `Fields`.

Important details:

- `location` is still copied from `mobility`
- single-choice fields stay scalar
- multi-select fields are still joined into comma-separated strings:
  - `skills`
  - `resources`
  - `constraints`
  - `obsessions`

This flattened shape still exists because the hook and conditioning builder consume one normalized object, not raw UI arrays.

### `Fields` + Big Five + curation -> `StoryConditioning`

This is the biggest architectural change.

The old `buildStateString(...)` no longer exists. The interview layer no longer emits one prompt-visible profile paragraph.

Instead, `buildStoryConditioning(...)` returns:

```ts
type StoryConditioning = {
  hardState: {
    ageBand: string;
    mobility: string;
    chapter: string;
    horizon: string;
    anchorResource?: string;
    anchorConstraint?: string;
    secondaryConstraint?: string;
  };
  latentForces: {
    coreTension: string;
    momentumPattern: string;
    exposurePattern: string;
    riskPattern: string;
    identityPressure: string;
    likelyTransformation: string;
    selectionCharge?: string;
    rejectedGravity?: string;
  };
  personalitySignature: {
    noveltyAppetite: string;
    consistencyPressure: string;
    socialPropulsion: string;
    conflictTolerance: string;
    anticipatorySensitivity: string;
    combinedReading: string;
  };
};
```

This object is built heuristically in `lib/prompts.ts`.

Important properties of the implementation:

- `hardState` keeps explicit guardrails
- `anchorResource` is derived from the first selected resource
- `anchorConstraint` and `secondaryConstraint` are derived from the first two selected constraints
- `latentForces` are synthesized from canonical questionnaire values and, when available, post-curation answers
- `personalitySignature` is derived from Big Five scores without using trait names in the prompt text

This means the questionnaire is no longer prompt-visible in raw form. The model sees an interpretation of the questionnaire, not a replay of the questionnaire.

### Scan conditioning vs denoise conditioning

The hook uses two slightly different conditioning contexts:

- `scanNoiseFragments()` calls `buildStoryConditioning(fields, big5)`
- `generate()` calls `buildStoryConditioning(fields, big5, curationAnswers)`

So:

- the scan prompt does not know why the user kept specific bullets
- the denoise chain does know that

This is intentional. The curation answers only make sense after the user has actually seen and chosen fragments.

## Prompt Chain

All prompts are assembled in `lib/prompts.ts`.

### Shared formatting

`formatConditioning(...)` renders the hidden state as three sections:

- `BOUNDARY CONDITIONS`
- `LATENT FORCES`
- `PERSONALITY SIGNATURE`

If `lang !== "en"`, the prompt also gets:

```text
IMPORTANT: Respond entirely in ${LANG_NAMES[lang] || lang}.
```

### 1. Scan prompt

The scan prompt now receives:

- formatted conditioning
- generic world-state rule
- guidance scale

Its job is still to generate exactly 10 unresolved fragments.

The important difference from the old version is that it no longer sees:

- raw questionnaire labels
- explicit Big Five trait names
- one giant profile recap

So scan is now derived from compressed forces, not from a plain-English state dump.

### 2. Early structure prompt

For non-final denoise steps where `progress < 0.45`, the prompt asks the model to:

- shape possible causality from selected fragments
- treat selected fragments as the only valid surface motifs
- use the profile only as hidden causality
- avoid restating the profile as prose
- avoid questionnaire phrase reuse

This is the core anti-echo rule.

### 3. Sharpen/revise prompt

For later non-final steps, the prompt asks the model to:

- preserve surface motifs
- add decisions, sacrifices, and social consequences
- show what gets easier and what gets more expensive
- avoid direct reuse of questionnaire phrases
- make the story feel discovered rather than assembled

There is no longer a separate late-denoise template with explicit Big Five language.

### 4. Final trajectory prompt

The final prompt asks for:

- 8-12 sentences
- recognizable selected motifs
- change through pressure rather than explanation
- outer consequences plus inner reorganization
- an ending that feels surprising in shape but inevitable in retrospect

It also repeats the anti-echo rules:

- selected fragments are the only valid surface motifs
- profile is hidden causality only
- do not restate the profile as prose

### 5. Cleanup prompt

After denoising, `generateCleanupPrompt(...)` runs one more model call:

```text
Revise this trajectory so it no longer sounds like a paraphrase of a questionnaire.
```

Its rules are:

- remove direct profile wording
- replace abstract self-description with scenes, behaviors, consequences, and social facts
- keep the meaning and structure
- do not make the prose more generic

This is the last guard against profile echo.

## Runtime Flow

The runtime state machine still lives in `useGeneration(...)` in `hooks/useGeneration.ts`.

### Scan phase

`scanNoiseFragments()` does the following:

1. Acquire the generation lock
2. Build scan conditioning from `fields + big5`
3. Clear prior bullets and prior trajectory outputs
4. Build the scan prompt via `generateStepPrompt(0, ...)`
5. Call `/api/generate` with temperature `1.15`
6. Parse numbered fragments with `parseNoiseFragments(...)`
7. Convert each fragment into a `Bullet`
8. Enter `runPhase = "reviewing"`

If parsing yields no fragments, the run errors.

### Bullet curation phase

`lib/revolver.ts` still defines the bullet mechanic.

Each `Bullet` can be:

- `flying`
- `ricocheting`
- `caught`
- `spent`

The exact rules are unchanged:

- the chamber cap is 6
- catch order assigns `chamberIndex`
- only `flying` and `ricocheting` bullets can be caught
- uncaught bullets can advance up to 3 passes
- pass 3 makes the bullet `spent`

The hook still moves into `ready` when:

- 6 bullets are caught, or
- all active bullets are gone and at least 1 bullet was caught

### Post-curation gating

There is now an extra UI gate in `app/page.tsx`.

The fire button is disabled until both of these are true:

- at least one bullet has been caught and the run is otherwise ready
- both `curationAnswers.whyThese` and `curationAnswers.rejectedFuture` have been chosen

So readiness now has two layers:

- hook-level readiness based on bullet state
- page-level readiness based on curation answers

The curation question panel appears when:

- `caughtCount > 0`, and
- either `runPhase === "ready"` or there are no active bullets left

### Seed construction

The denoise chain still does not consume the raw scan output directly.

It consumes `buildBulletSeed(bullets)`, which:

1. Creates a 6-slot chamber snapshot
2. Places caught bullets by `chamberIndex`
3. Drops empty slots
4. Serializes the result as:

```text
1::first caught bullet
2::second caught bullet
...
```

So the visible DNA of the story is still chamber-ordered bullet text.

### Denoise loop

`generate()` now does the following:

1. Refuse to run if locked
2. Refuse to run if no bullets are caught
3. Build full conditioning from `fields + big5 + curationAnswers`
4. Build `mergedNoiseSeed` from caught bullets
5. Initialize:

```ts
const stepResults = [mergedNoiseSeed];
```

6. For each `step` from `1` to `denoiseSteps - 1`
   - build prompt with `prev = stepResults[step - 1]`
   - call the model with temperature `1.05`
   - push the returned text into `stepResults`
7. Run the cleanup prompt with temperature `0.8`
8. Replace the final denoise output with the cleaned trajectory
9. Store:
   - cleaned trajectory in `trajectories`
   - the full step list in `allStepOutputs`

So the canonical final story is:

- not the raw last denoise output
- but the cleaned version returned by the anti-echo pass

## Generate Page Summary

The generate screen in `app/page.tsx` no longer presents a "Your Profile" block that simply mirrors the questionnaire.

It now shows `Story Conditions`:

- hard-state chips such as age band, mobility, chapter, horizon
- compressed anchors such as `anchorResource` and `anchorConstraint`
- three text blocks:
  - hidden pressure
  - momentum pattern
  - behavioral personality signature

This UI mirrors the underlying redesign: the system is now explicit about hidden causality rather than explicit about raw profile fields.

## API Boundary And Provider Normalization

This layer is unchanged.

`/api/generate` still handles:

- per-IP throttling
- global daily quota
- JSON validation
- normalized error responses
- daily usage headers

`lib/providers.ts` still normalizes provider-specific response formats into:

```ts
{ content: [{ type: "text", text }] }
```

So the client-side generation path still extracts text through one normalized shape regardless of provider.

## What The System Does Not Do

The system still does not:

- run a true diffusion model
- branch and rank multiple candidate futures
- compare alternative final trajectories
- maintain a symbolic planner or world model
- retrieve external user facts
- ground output in named headlines or current events
- treat the questionnaire as free-form autobiography

What it does instead is narrower and more controlled:

- collect structured pressure signals
- convert them into hidden story forces
- let the user choose visible motifs
- rewrite one linear story chain
- clean up questionnaire-like prose at the end

## Worked Example Appendix

This example is synthetic. It only shows how the current code composes.

### Example answers

```ts
const answers: QuestionnaireAnswers = {
  age: ["20–29"],
  mobility: ["Can relocate for the right upside"],
  currentMode: ["Early-career builder"],
  trajectoryFocus: ["Turning skill into real leverage"],
  skills: ["Tech & Engineering", "Writing & Media"],
  resources: ["Some savings", "Strong network", "Open-source reputation"],
  constraints: ["Fear of failure", "Too many options", "Algorithms decide who hears me"],
  obsessions: ["Building something real", "Financial freedom", "Independence"],
  workStyle: ["Quietly, through craft and depth"],
  riskTolerance: ["Go all-in when conviction is high"],
  timeHorizon: ["Before I turn 30"],
  inflection: ["A single piece of work gets noticed by the right person"],
};
```

### Example personality and controls

```ts
const big5 = [8, 6, 4, 5, 7];
const guidance = 8;
const denoiseSteps = 4;
const provider = "openrouter";
const model = "anthropic/claude-sonnet-4.6";
```

### Normalized `Fields`

After `normalizeQuestionnaireAnswers(...)` and `buildFieldsFromAnswers(...)`:

```ts
const fields: Fields = {
  age: "20–29",
  location: "Can relocate for the right upside",
  mobility: "Can relocate for the right upside",
  currentMode: "Early-career builder",
  trajectoryFocus: "Turning skill into real leverage",
  skills: "Tech & Engineering, Writing & Media",
  resources: "Some savings, Strong network, Open-source reputation",
  constraints: "Fear of failure, Too many options, Algorithms decide who hears me",
  obsessions: "Building something real, Financial freedom, Independence",
  workStyle: "Quietly, through craft and depth",
  riskTolerance: "Go all-in when conviction is high",
  timeHorizon: "Before I turn 30",
  inflection: "A single piece of work gets noticed by the right person",
};
```

### Example scan conditioning

The scan call uses:

```ts
const scanConditioning = buildStoryConditioning(fields, big5);
```

That yields a prompt-visible structure shaped roughly like:

```text
BOUNDARY CONDITIONS:
- Age band: 20–29
- Mobility: Can relocate for the right upside
- Current chapter: Early-career builder
- Time horizon: Before I turn 30
- Anchor resource: there is enough runway for compounding to matter
- Primary constraint: proof still trails behind ability
- Secondary constraint: too many live paths are thinning momentum

LATENT FORCES:
- Core tension: capability is arriving faster than public proof...
- Momentum pattern: momentum begins in private until the work becomes harder to dismiss...
- Exposure pattern: credibility grows artifact-first...
- Risk pattern: once conviction crystallizes the commitment becomes total
- Identity pressure: the future has to feel self-authored...
- Likely transformation: a moment of visibility forces a larger identity to appear...

PERSONALITY SIGNATURE:
- Novelty appetite: moves toward novelty before full permission exists
- Consistency pressure: likes structure, but not enough to become mechanical
- Social propulsion: moves between solitude and contact without fully trusting either
- Conflict tolerance: does not chase conflict, but will accept it when a path matters
- Anticipatory sensitivity: feels the stakes vividly...
- Combined reading: moves toward the unfamiliar quickly, then wrestles it into shape...
```

### Example scan result shape

Suppose the scan returns:

```text
1::A product demo watched by the right stranger
2::A codebase people quote by name
3::Late-night drafts that quietly spread
4::Freedom that costs more sleep than expected
5::A train ticket bought before certainty
6::Praise that arrives before self-belief
7::A room that gets quieter when I begin
8::Friends with stable jobs stop making sense
9::A version of me that can't stay hidden
10::The first check that feels unreal
```

### Example bullet curation and post-curation answers

Suppose the user catches bullets 1, 2, 3, and 4, then selects:

```ts
const curationAnswers: CurationAnswers = {
  whyThese: "They feel dangerous but true",
  rejectedFuture: "too safe",
};
```

The chamber-ordered seed becomes:

```text
1::A product demo watched by the right stranger
2::A codebase people quote by name
3::Late-night drafts that quietly spread
4::Freedom that costs more sleep than expected
```

### Example denoise call pattern

With `denoiseSteps = 4`, the runtime makes:

1. scan call
2. denoise step 1
3. denoise step 2
4. denoise step 3
5. cleanup call

The denoise chain sees:

- visible motifs from the selected bullets
- hidden causality from `StoryConditioning`
- added selection tone from `whyThese`
- negative shape from `rejectedFuture`

The final canonical story is the cleaned output from step 5, not the raw output from step 4.
