# Repo Logic And Prompt Flow

This note explains the repo at the product-logic level rather than the UI level.

The core thesis is simple: this app is a staged interview plus user-guided latent selection plus iterative LLM refinement. It borrows the language of "diffusion," but the implementation is not a true diffusion model. The runtime is a sequence of prompt builds, one human curation step, and a linear chain of rewrites.

## Source Map

The logic described here comes primarily from these files:

- `lib/questionnaire.ts`
- `components/Big5Form.tsx`
- `lib/prompts.ts`
- `hooks/useGeneration.ts`
- `lib/revolver.ts`
- `app/api/generate/route.ts`
- `lib/providers.ts`
- `types/index.ts`

The key data shapes discussed below are `QuestionnaireAnswers`, `Fields`, `NoiseFragment`, `Bullet`, `RunPhase`, and the inputs to `generateStepPrompt(step, totalSteps, state, guidance, prev, lang)`.

## What The App Asks

### Fixed questionnaire inputs

The questionnaire always begins from a shared base shape assembled by `getBaseSteps(...)` in `lib/questionnaire.ts`.

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

These are not free-text fields. They are chosen from curated option pools, with each choice represented by a canonical `value` string and a display-oriented `label`.

At a logic level, the app is trying to collect four kinds of information:

1. Life stage and current chapter
   - `age`
   - `mobility`
   - `currentMode`

2. Current assets and constraints
   - `skills`
   - `resources`
   - `constraints`

3. Inner motive force
   - `obsessions`
   - `workStyle`
   - `riskTolerance`
   - `timeHorizon`

4. Personality modulation
   - handled separately via the Big Five sliders

### Dynamic question: `trajectoryFocus`

`trajectoryFocus` is not part of the fixed base questionnaire. It is inserted dynamically by `getQuestionnaireSteps(...)` when the app can infer a route-specific tension from the combination of:

- age group
- `currentMode`

The logic is:

- Derive `ageGroup` from `age`
  - `"Under 20"` -> `youth`
  - `"20–29"` -> `twenties`
  - `"30–44"` -> `midcareer`
  - `"45+"` -> `senior`
- Use `currentMode` to look up a route-specific option list from either `YOUTH_ROUTE_OPTION_MAP` or `ADULT_ROUTE_OPTION_MAP`
- Add any age-specific route-tension bonus options from `AGE_ROUTE_BONUS`
- If the merged route option list is non-empty, insert `trajectoryFocus` immediately after the first three steps

So the app does not ask a generic "what matters most?" follow-up. It asks a route-specific tension question that is conditioned by who the person is and what kind of chapter they say they are currently in.

Examples:

- A `twenties` user in `Early-career builder` can get tensions like `Turning skill into real leverage` plus age-specific bonuses like `The friends who stayed safe are already ahead financially`.
- A `senior` user in `Second act after the main career` can get tensions like `Starting over feels exciting and terrifying at once`.

### Dynamic question: `inflection`

`inflection` is also conditional. It is appended to the questionnaire only if `getInflectionTension(riskTolerance, workStyle)` returns a non-null result.

That logic groups combinations into four tension types:

- `bold-craft`
- `cautious-visible`
- `speed-system`
- `generic`

Examples of trigger patterns:

- Bold risk plus quiet craft:
  - risk like `Go all-in when conviction is high`
  - work style like `Quietly, through craft and depth`
  - result: `bold-craft`

- Conservative risk plus visibility:
  - risk like `Protect downside first`
  - work style like `Through visibility and community`
  - result: `cautious-visible`

- Speed-oriented risk plus systems:
  - risk like `Accept volatility for speed`
  - work style like `By building systems and leverage`
  - result: `speed-system`

If both `riskTolerance` and `workStyle` exist but do not match a more specific pair, the app still falls back to `generic`.

The resulting `inflection` question is meant to force one near-term turning point into the input state. It asks, in effect, "what event in the next chapter would actually change the trajectory?"

### Skill-based option expansion

The questionnaire also changes the available `resources` and `constraints` options based on selected `skills`.

This happens in both:

- `getQuestionnaireSteps(...)`
- `normalizeQuestionnaireAnswers(...)`

Examples:

- Selecting `Tech & Engineering` can add `Open-source reputation` as a resource and `Automation anxiety — my own tools could replace me` as a constraint.
- Selecting `Writing & Media` can add `An audience that trusts my voice` as a resource and `Algorithms decide who hears me` as a constraint.

This means the app is not only asking "what are your resources?" It is reframing what counts as a plausible resource or bottleneck based on the user's domain of competence.

## Personality And Controls

The logic collects a second input layer outside the questionnaire:

- Big Five sliders
  - `openness`
  - `conscientiousness`
  - `extraversion`
  - `agreeableness`
  - `neuroticism`
- `guidance`
- `denoiseSteps`
- `provider`
- `model`

### Big Five

`components/Big5Form.tsx` renders five 1-10 sliders keyed from `BIG5_KEYS` in `lib/constants.ts`.

The model never receives these as raw UI controls. `buildStateString(...)` turns each score into a level description:

- `<= 3` -> `low`
- `<= 5` -> `moderate`
- `<= 7` -> `moderately high`
- otherwise -> `high`

The prompt builder also injects a fixed interpretation layer:

- high openness -> unconventional pivots
- high conscientiousness -> systematic empire-building
- high extraversion -> network-driven success
- low agreeableness -> disruptive moves
- high neuroticism -> intense creative or emotional breakthroughs

So the Big Five values do not add new factual content. They change the expected mechanism of change inside the generated life path.

### Guidance

`guidance` is a 1-10 ambition/intensity dial.

Its effects are:

- It changes the scan prompt tone:
  - high guidance: `high-energy, vivid, sharp, but never slogan-like`
  - middle guidance: `grounded, tense, quietly magnetic`
  - low guidance: `small, intimate, understated, lightly uncanny`
- It changes the denoise prompt framing:
  - high guidance: `dramatic pivots, unexpected breakthroughs, biography-worthy`
  - middle guidance: `ambitious but grounded, notable achievements`
  - low guidance: `meaningful, well-lived, not flashy`

So `guidance` is not "creativity" or "temperature." It is an instruction about how extraordinary the resulting life arc should feel.

### Denoise steps

`denoiseSteps` ranges from 2 to 8.

It determines how many total logical phases appear in the generation chain:

- 1 scan call
- `denoiseSteps - 1` rewrite calls

Examples:

- `denoiseSteps = 2` -> 1 scan call + 1 final trajectory call
- `denoiseSteps = 4` -> 1 scan call + 3 denoise calls
- `denoiseSteps = 8` -> 1 scan call + 7 denoise calls

More steps do not create more candidate stories. They create more rewrite passes on the same evolving story.

### Provider and model

The user also chooses a provider and model. `app/page.tsx` passes both through the hook and eventually into `/api/generate`.

At the logic level:

- `provider` chooses which upstream API adapter is used
- `model` chooses the concrete model name sent to that provider

The prompt chain itself does not change by provider. The system relies on `lib/providers.ts` to normalize output back into the Anthropic-style response shape expected by the client.

## Normalization And State Encoding

### `QuestionnaireAnswers` -> normalized answers

The raw questionnaire state is a `QuestionnaireAnswers` map from step id to selected string array.

Before story generation, the app runs `normalizeQuestionnaireAnswers(...)`. This does several important things:

1. Re-derives the valid step set from the current `age` and age group
2. Rebuilds the step option pools, including skill-based bonus options
3. Filters each selected value against the currently valid option set
4. Truncates single-choice steps to one value
5. Truncates multi-choice steps to the configured `maxSelect`
6. Re-validates `trajectoryFocus` against the currently valid route options
7. Keeps at most one `inflection` answer

This makes the questionnaire state self-healing. If earlier answers change, downstream answers that are no longer legal are dropped instead of silently leaking into generation.

### Normalized answers -> `Fields`

`buildFieldsFromAnswers(...)` converts normalized answers into the flatter `Fields` shape used by the prompt system.

Important transformations:

- `mobility` is duplicated into `location`
  - `const location = mobility;`
- single-choice fields remain scalar strings
- multi-select fields are joined into comma-separated strings
  - `skills`
  - `resources`
  - `constraints`
  - `obsessions`

This flattening matters because the prompt builder does not know about UI steps or arrays. It only sees a compact profile object.

### `Fields` + Big Five -> `state`

`buildStateString(fields, big5)` assembles the final life-state description that every model call sees.

The structure is:

```text
Age: ...
Location: ...
Mobility: ...
Current chapter: ...
Current route tension: ...
Skills: ...
Resources & advantages: ...
Constraints: ...
Obsessions & drives: ...
Preferred way of winning: ...
Risk posture: ...
Time horizon: ...
Near-term inflection point: ...

Personality (Big Five):
openness: ...
conscientiousness: ...
extraversion: ...
agreeableness: ...
neuroticism: ...
```

This is the actual logical interface between the interview layer and the generation layer.

## Exact Prompt Chain

Every model call is built by `generateStepPrompt(step, totalSteps, state, guidance, prev, lang)` in `lib/prompts.ts`.

If `lang !== "en"`, every prompt gets this exact suffix appended:

```text

IMPORTANT: Respond entirely in ${LANG_NAMES[lang] || lang}.
```

Below are the exact prompt templates as they exist in source, followed by a short note on what each prompt is trying to force.

### 1. Scan prompt

```text
You are scanning the earliest unresolved signals of a person's future trajectory.

CURRENT STATE:
${state}

PERSONALITY SIGNALS:
${personality}

WORLD STATE:
${worldState}

GUIDANCE SCALE: ${guidance}/10

TASK:
Generate exactly 10 raw future fragments.

These are not predictions, not advice, not summaries, not slogans.
They are unresolved fragments from possible futures — partial scenes, tensions, impulses, environments, losses, freedoms, habits, or systems that might later become a life.

Each fragment must:
- be 4-12 words
- stand alone
- feel emotionally charged but still unfinished
- suggest a future shape without explaining it
- be interpretable in more than one way
- avoid complete moral conclusions or polished "quote-like" phrasing
- avoid personality trait labels
- avoid direct advice, destiny claims, or biography summary language

Distribution requirements:
- at least 2 fragments should hint at work / money / systems
- at least 2 should hint at relationships / social position / visibility
- at least 2 should hint at place / movement / environment
- at least 2 should hint at inner cost / freedom / loss / desire
- the remaining 2 can be strange, symbolic, or contradictory

Tone:
${guidance >= 7 ? "high-energy, vivid, sharp, but never slogan-like" : guidance >= 4 ? "grounded, tense, quietly magnetic" : "small, intimate, understated, lightly uncanny"}

Important:
Do NOT make them all sound equally poetic.
Some should be plain, some strange, some sharp, some quiet.
Do NOT make them read like a coherent set of themes.
They should feel like fragments from different corners of the same latent space.

Format exactly:
1::...
2::...
...
10::...

Respond with only the 10 fragments.${langInstruction}
```

What this prompt is trying to force:

- ambiguity rather than conclusion
- variety rather than one polished theme
- latent signal generation rather than biography writing
- enough structure that later user curation can work on discrete fragments

### 2. Early denoise prompt

```text
You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: ADDING STRUCTURE (${Math.round(progress * 100)}% denoised)
Add structure. Let causality emerge. Still rough but recognizable patterns. Add approximate timeframes. Personality traits shape HOW things happen. 5-6 sentences.

Respond with ONLY the refined trajectory, nothing else.${langInstruction}
```

What this prompt is trying to force:

- causality from the seed
- a first coherent arc
- rough chronology
- personality as mechanism, not decoration

### 3. Middle denoise prompt

```text
You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: SHARPENING (${Math.round(progress * 100)}% denoised)
Add specificity — concrete decisions, turning points, key moments. Show cause and effect. At guidance ${guidance}/10: ${guidanceDesc}. 6-8 sentences with clear timeframes.

Respond with ONLY the sharpened trajectory, nothing else.${langInstruction}
```

What this prompt is trying to force:

- specificity rather than mood
- visible decisions and turning points
- stronger cause-effect links
- explicit alignment with the requested ambition level

### 4. Late denoise prompt

```text
You are a Life Trajectory Diffusion Model, denoising step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: FINE DETAIL (${Math.round(progress * 100)}% denoised)
Refine — emotional depth, internal transformations, precise moments. Make each transition feel inevitable. Personality colors every decision. 7-10 sentences.

Respond with ONLY the refined trajectory, nothing else.${langInstruction}
```

What this prompt is trying to force:

- inevitability
- inner change, not just resume events
- more emotionally grounded transitions
- a stronger feeling that the person became this future through their own nature

### 5. Final prompt

```text
You are a Life Trajectory Diffusion Model, final step ${step + 1} of ${totalSteps}.

PERSON'S CURRENT STATE: ${state}
GUIDANCE SCALE: ${guidance}/10

PREVIOUS OUTPUT (step ${step}):
${prev}

STEP ${step + 1}: FULLY DENOISED — FINAL TRAJECTORY
Vivid, coherent, compelling. Each moment connects with inevitability. Include:
- Key turning points with approximate years
- Internal shifts, not just external events
- How their personality drove each pivot
- What makes this ${guidanceDesc}
- Where this person stands at the peak

Flowing narrative, 8-12 sentences. Deeply personal — not generic.

Respond with ONLY the final trajectory, nothing else.${langInstruction}
```

What this prompt is trying to force:

- narrative closure
- a final, publishable-feeling life arc
- explicit turning points
- an identifiable peak state
- a complete synthesis of state, seed, personality, and guidance

## How The Story Is Generated

### Runtime flow

The hook `useGeneration(...)` in `hooks/useGeneration.ts` owns the runtime state machine.

The high-level flow is:

1. `scanNoiseFragments()`
2. build the `state` string from `Fields` + Big Five
3. call `generateStepPrompt(0, ...)`
4. send the request to `/api/generate`
5. parse the numbered lines with `parseNoiseFragments(...)`
6. convert them into `NoiseFragment[]`
7. convert each fragment into a `Bullet`
8. let the user catch or miss bullets
9. serialize caught bullets into a seed string with `buildBulletSeed(...)`
10. call `generate()` to run the rewrite loop
11. keep only the last rewrite as the final trajectory

### Scan phase

`scanNoiseFragments()` does the following:

- acquires a generation lock
- clears previous bullets and outputs
- builds the current `state`
- sends the scan prompt with temperature `1.15`
- parses the returned text into up to 10 fragments
- assigns fragment ids starting from 1
- converts each fragment into a `Bullet` with:
  - `status: "flying"`
  - `passCount: 0`
  - `chamberIndex: null`

If parsing yields no usable fragments, the run is treated as an error.

### Curation phase

`lib/revolver.ts` defines the selection mechanic.

Each `Bullet` can be:

- `flying`
- `ricocheting`
- `caught`
- `spent`

The rules are exact:

- the revolver has 6 chambers
- a catch assigns the next chamber index in catch order
- only `flying` or `ricocheting` bullets can be caught
- once 6 bullets are caught, further catches are ignored
- each uncaught bullet can be advanced up to 3 passes
- on pass 3, the bullet becomes `spent`

The ready-state logic lives partly in the hook:

- `runPhase` becomes `ready` when 6 bullets have been caught
- it also becomes `ready` when all active bullets are gone but at least 1 bullet has been caught

This means the system does not require all 6 chambers to be full before denoising can begin. It only requires that there is at least one selected fragment and nothing left to curate, or that the chamber cap has been reached.

### Seed construction

The app does not feed the raw scan output back into denoising. It feeds a chamber-ordered seed created by `buildBulletSeed(...)`.

That seed is constructed as:

1. create a 6-slot chamber snapshot
2. place each caught bullet into its `chamberIndex`
3. discard empty slots
4. serialize remaining bullets as:

```text
1::first caught bullet text
2::second caught bullet text
3::third caught bullet text
...
```

This matters because selection order becomes part of the latent structure. The denoise chain sees a short ordered seed, not an unordered basket of fragments.

### Denoise loop

`generate()` performs a single linear refinement chain.

The exact mechanics are:

- refuse to run if a generation lock already exists
- refuse to run if zero bullets are `caught`
- rebuild the same `state` string used in scan
- build `mergedNoiseSeed` from the caught bullets
- initialize `stepResults` as:

```text
[mergedNoiseSeed]
```

- for each `step` from `1` to `denoiseSteps - 1`
  - build a prompt with `prev = stepResults[step - 1]`
  - call the model with temperature `1.05`
  - push the returned text into `stepResults`

After the loop:

- the final trajectory is `stepResults[stepResults.length - 1]`
- all intermediate outputs are retained in `allStepOutputs`
- only the last output is treated as the canonical story

So the call pattern is exact:

- 1 scan call
- `denoiseSteps - 1` refinement calls

And the evolving context is exact:

- each denoise step sees the previous output
- there is no multi-branch search
- there is no compare-and-select stage among alternative stories

### API boundary and provider normalization

The hook never talks to upstream providers directly. It always calls `/api/generate`.

`app/api/generate/route.ts` adds:

- per-IP throttling
- global daily quota
- JSON validation
- normalized error handling
- daily usage headers returned to the client

`lib/providers.ts` then maps provider-specific request and response formats into one normalized text shape.

Provider-specific differences handled here include:

- Anthropic direct request format
- OpenRouter chat completion format
- xAI chat completion format
- Gemini `generateContent` format

The output is normalized into:

```ts
{ content: [{ type: "text", text }] }
```

That normalization is important because the client-side generation logic assumes one uniform text extraction path.

## What The System Does Not Do

The system is more constrained than the "diffusion" framing suggests.

It does not:

- run a true diffusion model
- explore multiple branches and rank them
- produce multiple candidate final stories and compare them
- keep a long conversational memory between calls
- use a persistent narrative planner or symbolic world model
- ground the story in explicit current events or named headlines
- retrieve external facts about the user
- infer hidden data beyond the provided questionnaire state and the prompt's generic allowance for "broad contemporary pressures and opportunities"

The model is therefore doing a specific kind of work:

- scan for ambiguous future signals
- accept human selection as latent guidance
- rewrite one chain of text until it feels coherent

## Worked Example Appendix

This example is synthetic. It is not copied from a real session or model run. It is only meant to show how the logic composes.

### Example answers

```ts
const answers: QuestionnaireAnswers = {
  age: ["20–29"],
  mobility: ["Can relocate for the right upside"],
  currentMode: ["Early-career builder"],
  trajectoryFocus: ["Turning skill into real leverage"],
  skills: ["Tech & Engineering", "Writing & Media"],
  resources: ["Steady income", "Low overhead, few obligations", "Open-source reputation"],
  constraints: ["Fear of failure", "Too many options", "Algorithms decide who hears me"],
  obsessions: ["Building something real", "Financial freedom", "Independence"],
  workStyle: ["Quietly, through craft and depth"],
  riskTolerance: ["Go all-in when conviction is high"],
  timeHorizon: ["Before I turn 30"],
  inflection: ["A single piece of work gets noticed by the right person"],
};
```

Why this example is valid:

- `20–29` maps to `twenties`
- `Early-career builder` unlocks a valid adult route tension set
- `Turning skill into real leverage` is a valid `trajectoryFocus` under that route
- `Tech & Engineering` adds `Open-source reputation` as a valid resource
- `Writing & Media` adds `Algorithms decide who hears me` as a valid constraint
- `Go all-in when conviction is high` plus `Quietly, through craft and depth` triggers the `bold-craft` inflection set
- `A single piece of work gets noticed by the right person` is a valid `bold-craft` inflection option

### Example Big Five and controls

```ts
const big5 = [8, 6, 4, 5, 7];
const guidance = 8;
const denoiseSteps = 4;
const provider = "openrouter";
const model = "anthropic/claude-sonnet-4.6";
```

### Normalized `Fields` summary

After `normalizeQuestionnaireAnswers(...)` and `buildFieldsFromAnswers(...)`, the flattened state is effectively:

```ts
const fields: Fields = {
  age: "20–29",
  location: "Can relocate for the right upside",
  skills: "Tech & Engineering, Writing & Media",
  resources: "Steady income, Low overhead, few obligations, Open-source reputation",
  constraints: "Fear of failure, Too many options, Algorithms decide who hears me",
  obsessions: "Building something real, Financial freedom, Independence",
  currentMode: "Early-career builder",
  trajectoryFocus: "Turning skill into real leverage",
  workStyle: "Quietly, through craft and depth",
  riskTolerance: "Go all-in when conviction is high",
  timeHorizon: "Before I turn 30",
  mobility: "Can relocate for the right upside",
  inflection: "A single piece of work gets noticed by the right person",
};
```

Notice that `location` is not independently collected. It is copied from `mobility`.

### Example state string

That becomes a prompt-visible state shaped like:

```text
Age: 20–29
Location: Can relocate for the right upside
Mobility: Can relocate for the right upside
Current chapter: Early-career builder
Current route tension: Turning skill into real leverage
Skills: Tech & Engineering, Writing & Media
Resources & advantages: Steady income, Low overhead, few obligations, Open-source reputation
Constraints: Fear of failure, Too many options, Algorithms decide who hears me
Obsessions & drives: Building something real, Financial freedom, Independence
Preferred way of winning: Quietly, through craft and depth
Risk posture: Go all-in when conviction is high
Time horizon: Before I turn 30
Near-term inflection point: A single piece of work gets noticed by the right person

Personality (Big Five):
openness: high (8/10)
conscientiousness: moderately high (6/10)
extraversion: moderate (4/10)
agreeableness: moderate (5/10)
neuroticism: moderately high (7/10)
```

### Example scan result shape

Suppose the scan call returns something like:

```text
1::A codebase people quote by name
2::A small apartment, two glowing monitors
3::The first check that feels unreal
4::Late-night drafts that quietly spread
5::A train ticket bought before certainty
6::Praise that arrives before self-belief
7::A product demo watched by the right stranger
8::Friends with stable jobs stop making sense
9::A reputation built under pseudonyms first
10::Freedom that costs more sleep than expected
```

These become:

- `NoiseFragment[]` after parsing
- then `Bullet[]` after `fragmentToBullet(...)`

### Example curation and seed

Suppose the user catches bullets 7, 1, 4, and 10.

The chamber-ordered seed becomes:

```text
1::A product demo watched by the right stranger
2::A codebase people quote by name
3::Late-night drafts that quietly spread
4::Freedom that costs more sleep than expected
```

That seed is the first element of `stepResults`.

### Example denoise chain inputs

With `denoiseSteps = 4`, the runtime call pattern is:

1. Scan call
   - prompt: scan template
   - inputs: `state`, `guidance = 8`, `prev = null`

2. Step 1 rewrite
   - prompt: early denoise template
   - inputs: same `state`, same `guidance`, `prev = mergedNoiseSeed`

3. Step 2 rewrite
   - prompt: middle denoise template
   - inputs: same `state`, same `guidance`, `prev = output from step 1`

4. Step 3 rewrite
   - prompt: final template
   - inputs: same `state`, same `guidance`, `prev = output from step 2`

The final story is therefore not generated in one jump. It is generated by progressively imposing:

- structure
- specificity
- final coherence

onto a seed chosen by the user from the original latent fragment set.
