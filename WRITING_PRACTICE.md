# Project Language — Writing Practice Architecture

Version: 0.2  
Status: planning only  
Scope: Japanese Hiragana and Katakana MVP

This document defines the product and technical architecture for Writing
Practice. It does not implement the feature, change React components, change
the backend, or change the current vocabulary storage.

## 1. Product role and learning paths

Writing Practice is a learning environment inside Study Space. It helps users
understand written structure, reproduce characters independently, recognize
mistakes, and choose a useful next step.

Project Language supports two intentionally different learning approaches.

### 1.1 Alphabet Learning: structured literacy path

Alphabet Learning is the primary path when a writing system has a natural
pedagogical sequence. It is the default experience for a beginner who is
learning Japanese kana for the first time.

The application should provide a prepared route instead of asking the learner
to construct a curriculum:

- structured lessons;
- logical progression by rows and related patterns;
- gradual introduction of new characters;
- Study for discovery and demonstration;
- Practice for supported reproduction;
- Test for knowledge checks;
- Review for previously learned or difficult characters;
- a later full-alphabet test, including randomized order.

Japanese Hiragana and Katakana should be taught in recognizable groups and
patterns, not as an arbitrary shuffled list. The sequence is the main learning
path, not an optional recommendation.

The architecture must also support other systems with different pedagogy:
Hangul may use syllable and jamo relationships, while Chinese characters need
an adapted progression based on components, frequency, and writing
complexity. These are future adapters, not assumptions in the shared engine.

### 1.2 Vocabulary Learning: user-directed practice

Vocabulary Learning applies to user-created dictionaries and other material
the learner wants to study independently. It preserves the core Project
Language philosophy:

- the user adds or imports words;
- the user creates collections;
- the user chooses the material and pace;
- the user selects practice and test modes;
- the application provides tools without imposing a mandatory sequence.

Writing a vocabulary item can eventually use the same writing surface and
evaluator, but it must not be forced into the Alphabet Learning curriculum.
A user studying a Japanese word may practice its kana, kanji, or writing
components directly from the selected vocabulary set.

### 1.3 Balance between the paths

Structured learning is the default for discovering an unfamiliar writing
system. User-directed practice is a supporting path for reinforcement,
customization, and review.

The learner should be able to:

- start the next recommended alphabet lesson immediately;
- repeat a completed lesson;
- choose a row or a small group for extra practice;
- create a custom test from learned characters;
- review difficult characters;
- run a randomized test over learned material.

These controls must remain secondary for beginners. The first screen must not
require a new learner to select individual characters or design a study plan.

## 2. Current repository constraints

The current application provides:

- React, TypeScript, and Vite;
- no handwriting, SVG, canvas, or gesture dependency in `package.json`;
- a dedicated `StudySpaceShell`;
- `StudyPage` as the Study coordinator;
- an in-memory flashcard session in `useStudySession` and
  `studySessionModel`;
- vocabulary items with `languageCode`, `term`, `reading`, `languageData`, and
  a separate `writing` knowledge dimension;
- localStorage access isolated in repository/data modules.

The existing flashcard state tracks cards, current position, reveal state,
ratings, and summary. Writing must reuse Study Space entry/exit conventions
without putting pointer traces, stroke evaluation, lesson progress, or retry
state into the flashcard model.

The vocabulary repository does not yet persist writing attempts or update
`VocabularyKnowledge.writing`. That remains a separate integration decision.
A successful guided trace must not automatically mean that a vocabulary item
is mastered.

## 3. Product flow for Japanese kana

### 3.1 Study: meet a new character

Study is a demonstration and discovery step:

1. show the kana large and clearly;
2. provide its reading and pronunciation;
3. play or make available the pronunciation;
4. animate the stroke sequence;
5. show the start point and direction of each stroke;
6. allow the learner to replay the demonstration;
7. offer a clear transition to Practice.

The animation is instructional, not decorative. The learner should be able to
pause, replay, or step through the strokes. Reduced-motion preferences must
replace continuous motion with an immediate or manually stepped presentation.

### 3.2 Practice: reproduce with support

Practice teaches the physical sequence without turning every movement into a
failure:

1. keep the reference visible initially;
2. offer a stroke-order guide and optional trace outline;
3. allow repeating one stroke or clearing the character;
4. gradually reduce the visible assistance;
5. give friendly feedback after a meaningful attempt;
6. let the learner retry or continue.

Guided tracing and independent reproduction are separate interaction states.
Tracing may check proximity to the guide, while reproduction checks the
character more broadly. Practice should not interrupt the learner with strict
evaluation after every small pointer movement.

### 3.3 Test: check knowledge

Test evaluates whether the learner can recall and identify the character, not
whether every pixel resembles a font:

- write the character from its reading or sound prompt;
- choose the correct character among options;
- write without a visible reference;
- optionally reveal a hint after an initial attempt.

Writing evaluation should consider recognizability and basic writing rules
with reasonable tolerance. A test result should not be reduced to speed,
stars, or a single decorative score.

### 3.4 Review: continue from evidence

Review can include:

- difficult characters;
- characters with repeated stroke-order errors;
- previous failed or incomplete attempts;
- user-selected rows or characters;
- randomized combinations from already learned material.

Review is initially a practical retry queue. Adaptive scheduling and
personalized repetition can be added later without changing the surface or
template contracts.

### 3.5 Smart Assistance

Assistance should escalate gradually:

1. a short hint about the next stroke or starting point;
2. a visible stroke-order guide;
3. a full reference animation;
4. an outline to trace;
5. another independent attempt.

Assistance supports learning and is never presented as punishment. After help,
the learner should receive another opportunity to reproduce the character
independently.

## 4. Technical investigation

### 4.1 Stroke data sources and licensing

Potential sources have the following verified capabilities:

- [KanjiVG](https://kanjivg.tagaini.net/) provides SVG data containing stroke
  shape, direction, and order. It is released under CC BY-SA 3.0.
- [kanakana-strokes](https://github.com/funclosure/kanakana-strokes) provides
  46 Hiragana and 46 Katakana entries, including ん and excluding ゐ/ゑ. Its
  JSON uses a 109 x 109 viewBox, ordered SVG path data, and stroke start
  points. It identifies KanjiVG as its source and uses CC BY-SA 3.0.
- [strokesvg](https://github.com/zhengkyl/strokesvg) demonstrates animatable
  kana SVG organization. Its README says that its shapes are based on Klee
  One and that some forms were modified for clarity, so redistribution,
  licensing, and pedagogical suitability require separate review.

Before adding assets, the project must choose a source, verify the license
for repository and distribution use, preserve attribution and version
metadata, and review representative glyphs. No remote fetch should be needed
during a lesson.

Recommendation: use the `kanakana-strokes` data shape as an import/reference
format and normalize it into a Project Language-owned template format at build
time. Keep source information with every template set.

### 4.2 Rendering and input

[W3C Pointer Events](https://www.w3.org/TR/pointerevents3/) provides one
browser input model for mouse, touch, and pen. Pointer events expose device
type, pressure, pointer identity, and pointer capture; MDN describes them as
widely available across modern browsers.

The MVP can therefore support:

- mouse, touch, and stylus through `pointerdown`, `pointermove`, and
  `pointerup`;
- `setPointerCapture` so a stroke continues when the pointer leaves the
  surface briefly;
- optional pressure collection without making pressure required for
  correctness.

Recommended rendering:

- SVG for the reference character and stroke-order overlay;
- SVG paths or polylines for active and completed user strokes;
- `touch-action: none` only on the drawing surface;
- normalized coordinates based on a shared viewBox rather than CSS pixels.

SVG keeps the guide and user trace in one responsive coordinate system. Canvas
is a possible later optimization, but it is not justified for the small kana
MVP.

### 4.3 Local evaluation feasibility

The first learning loop does not require an AI API. A browser can compare a
normalized local trace against known template data.

Deterministic signals can include:

- stroke count;
- stroke order;
- approximate start and end locations;
- direction;
- normalized path shape;
- overall size and bounding-box proportions;
- whether the trace remains within a tolerance around the guide.

This does not constitute general handwriting recognition. The MVP must not
claim reliable recognition of arbitrary handwriting styles or language-
independent correctness. No recognition library is currently present, and
adding one would create a larger dependency and a broader product promise
than the first learning loop needs.

## 5. Proposed architecture

### 5.1 Feature boundary

Create files only when each implementation phase needs them:

```text
src/features/writing/
  WritingPage.tsx
  WritingSetup.tsx
  WritingSession.tsx
  WritingSurface.tsx
  WritingFeedback.tsx
  WritingSummary.tsx
  useWritingSession.ts
  writingSessionModel.ts
  writingTypes.ts
  curriculum/
    alphabetLessonModel.ts
    japaneseKanaCurriculum.ts
  evaluation/
    evaluateStroke.ts
    scoreWritingAttempt.ts
  data/
    japaneseWritingAdapter.ts
    kanaTemplates.ts
  persistence/
    writingProgressRepository.ts
```

This is a target structure, not a request to create files now.

### 5.2 Curriculum and user-selected material

Alphabet Learning needs an explicit curriculum layer:

```text
AlphabetCurriculum
  alphabetId
  units
  lessons
  recommendedNextLesson
  completionState
```

A lesson contains an ordered group, such as a kana row or a pedagogically
related subset. It can expose Study, Practice, Test, and Review actions.
The intended sequence for a group is:

```text
Study -> Practice -> Test -> Review
```

Study introduces the characters and demonstrates pronunciation and stroke
order. Practice lets the learner reproduce them with gradually decreasing
assistance. Test checks independent reproduction and recognition. Review
returns the learner to difficult characters and repeated mistakes.

This sequence is a recommended learning path, not a mandatory single-session
workflow. The learner may stop after any stage, continue later, repeat an
earlier stage, or move to another available activity. Completing one stage
must not be required before the application allows the learner to leave and
return to the lesson.

The same session model must accept either:

- a curriculum-derived lesson selection; or
- a user-selected custom set of learned characters.

The source of the selection is different, but the active session, surface,
evaluator, feedback, and result contracts stay shared.

### 5.3 Language-neutral contracts

The core engine should know only about abstract writing units and traces:

```ts
interface WritingUnit {
  id: string
  languageCode: string
  displayText: string
  reading?: string
  system: string
  templateId: string
}

interface StrokeTemplate {
  templateId: string
  unitId: string
  viewBox: { width: number; height: number }
  strokes: TemplateStroke[]
  source: { name: string; version?: string; license: string }
}

interface TemplateStroke {
  pathData: string
  centerline?: NormalizedCenterline
  start: [number, number]
  end?: [number, number]
  order: number
}

type NormalizedCenterline = Array<[number, number]>

interface InputPoint {
  x: number
  y: number
  pressure?: number
  timestamp: number
}

interface UserStroke {
  points: InputPoint[]
}
```

`pathData` and `centerline` are not interchangeable. An SVG path used to
render a glyph or stroke may describe the visible outline or filled shape of
the stroke. The outline represents the boundary and thickness of the drawn
shape; it is not automatically the path that a pen followed while writing.
A centerline is an ordered, normalized trajectory through the stroke, used for
direction, resampling, and path comparison.

The currently investigated kana source provides SVG path data, stroke order,
and start points, but the documented format does not guarantee a normalized
pen centerline. Therefore `centerline` is optional at the source-import
boundary, but it must be present before any evaluator algorithm that compares
user polylines with template centerlines runs. If the chosen source does not
provide centerlines, the implementation must derive them with a documented
geometry process or obtain them from a separately verified dataset, then
validate them against the source glyphs and Japanese writing references.
The implementation must not treat SVG outline data as a centerline by
assumption.

Names may change during implementation. The important boundary is that the
evaluator receives normalized geometry and does not import React, DOM events,
or Japanese-specific fields.

Language adapters provide the writing-system behavior:

```text
WritingLanguageAdapter
  listUnits(scope)
  getCurriculum()
  getTemplate(unitId)
  getPrompt(unitId, mode)
  formatFeedback(result)
```

The Japanese adapter maps Hiragana and Katakana units to templates and lesson
groups. A future Hangul or hanzi adapter can expose a different curriculum and
different evaluation capabilities without changing the shared surface.

### 5.4 Component responsibilities

#### `WritingPage`

Coordinates the writing entry point, active session, and results inside Study
Space. It chooses between Alphabet Learning and Vocabulary Learning contexts,
but does not draw or score.

#### `WritingSetup`

For Alphabet Learning, it offers the next recommended lesson first, with
secondary controls for completed lessons, rows, difficult characters, and
custom tests. For Vocabulary Learning, it receives the user's selected
vocabulary material.

It must not expose future Kanji or unavailable modes as fake controls.

#### `WritingSession`

Connects curriculum or custom selection to the current Study, Practice, Test,
or Review flow. It owns presentation-level progression, assistance level,
retry, and next actions, not geometric scoring.

#### `WritingSurface`

Collects pointer input and renders the reference, guide, active stroke, and
completed strokes. It emits normalized `UserStroke` values and does not know
whether the selection came from a lesson or a custom set.

#### `WritingFeedback`

Presents one or two actionable corrections, such as start position, direction,
stroke order, or broad proportions. It must not rely on color alone or make a
retry feel like a failure.

#### `WritingSummary`

Reports completed characters, repeated difficulties, common feedback categories,
and a recommended next action. It can share layout conventions with flashcard
results while keeping writing metrics separate.

## 6. Session and data flow

```text
Alphabet curriculum or vocabulary selection
  -> WritingLanguageAdapter
  -> writing session model
  -> WritingSurface collects normalized pointer points
  -> evaluator compares trace with StrokeTemplate
  -> WritingAttemptResult
  -> feedback, assistance, retry, or next unit
  -> session summary
  -> writing progress repository
```

The evaluator remains a pure function. The surface can be replaced without
changing scoring, and scoring can be tested with fixture traces without a
browser.

Writing should have its own `writingSessionModel`. A future shared Study
boundary may provide lifecycle, navigation protection, and result navigation,
but the flashcard `StudySessionState` should not absorb writing-specific
state.

## 7. Evaluation approach

### 7.1 Normalization

Before scoring:

1. convert client coordinates into the template viewBox;
2. remove duplicate points and very small jitter;
3. resample each stroke to a fixed number of points;
4. preserve temporal order and stroke boundaries;
5. calculate the user trace bounding box and direction vectors.

### 7.2 Staged evaluation

Use structured signals instead of one opaque score.

**Structural checks**

- expected versus actual stroke count;
- stroke order;
- start-point distance;
- end-point distance where available;
- direction agreement;
- minimum stroke length and accidental-dot detection.

**Shape checks**

- compare normalized user polylines with sampled template centerlines
  (`TemplateStroke.centerline`), never with SVG outline data by assumption;
- use a bounded distance measure such as point-to-path distance or resampled
  DTW;
- compare broad bounding-box proportions;
- allow wider tolerance for touch and mouse than for precise stylus input.

Return a structured result:

```text
WritingAttemptResult
  status: pass | retry | incomplete
  overallScore
  strokeOrderScore
  directionScore
  shapeScore
  proportionScore
  failedStrokeIndexes
  feedbackCodes
```

The exact thresholds require real traces from mouse, touch, and stylus
devices. They must not be selected only from synthetic data.

### 7.3 Different strictness by activity

Study is demonstration and does not need a pass/fail evaluation.

Practice should prioritize learning flow. It may show gentle warnings and
optional correction after a meaningful attempt, but should not reject every
imperfect movement.

Test can apply stronger structural checks because the user is demonstrating
knowledge. It should still accept reasonable variation and prioritize
recognizability, stroke order, direction, and broad proportions over pixel-
perfect matching.

Guided tracing may use stricter proximity to the visible guide. Independent
Practice and Test should use more forgiving shape tolerance. These are
recommendations to calibrate with real user traces, not universal handwriting
rules.

Numeric component scores and distances may be used internally by the
evaluator to combine evidence and select feedback codes. They do not need to
be shown in the interface. The user-facing result should emphasize what went
well, what was difficult, which errors repeated, and what to do next, rather
than expose an overall score or a list of raw numeric metrics.

There must not be one universal success threshold for Study, Practice, and
Test. Study is an instructional demonstration, Practice is supportive
learning, and Test is an independent knowledge check; each activity may use
different decision rules and may produce different feedback without presenting
that internal distinction as a punitive grade.

### 7.4 Feedback and reporting

Feedback should explain what to try next:

- “Start closer to the guide.”
- “This stroke should move from left to right.”
- “The stroke order is different from the reference.”
- “The character is recognizable; try adjusting its proportions.”

After Test or Review, report:

- what went well;
- difficult characters;
- repeated error categories;
- what to practice next;
- a clear next action.

Errors are learning information, not punishment. Do not make stars, points,
speed, or a single numeric score the primary measure of success. Speed may be
optional secondary statistics only.

## 8. MVP recommendation

### Include in the first implementation

- Japanese Hiragana and Katakana basic 46-character sets;
- bundled, licensed stroke templates;
- a structured curriculum by rows and related groups;
- Study demonstration with replayable stroke animation;
- Practice with visible reference, tracing support, and independent attempt;
- a small Test flow using writing and character-selection tasks;
- Review for difficult or previously attempted characters;
- secondary custom sets from learned characters;
- mouse, touch, and stylus input through Pointer Events;
- responsive SVG writing surface;
- local structural/shape evaluation with clear feedback;
- a small session summary;
- separate local writing-attempt progress storage.

### Defer

- Kanji;
- dakuten, handakuten, yōon, historical kana, and arbitrary multi-character
  words as the first content set;
- free-form handwriting recognition;
- AI or cloud evaluation;
- pressure-sensitive brush simulation;
- stroke beautification;
- collaborative or social writing;
- adaptive spaced repetition;
- handwriting analytics beyond basic attempt metrics;
- importing user-created templates;
- a separate native/mobile drawing engine.

After basic kana are reliable, voiced and contracted forms should be added as
explicit curriculum units rather than silently treated as the same character.

## 9. Persistence and progress

Do not store raw pointer traces in the flashcard session or vocabulary record.
`writingSessionModel` should keep only the active session and its attempt
results.

For the first local implementation, use a separate repository such as:

```text
project-language:writing-progress:v1
```

Store compact aggregates keyed by `languageCode`, `templateId`, writing mode,
and activity:

- attempts;
- passes;
- retries;
- last attempted time;
- last feedback categories;
- optional best score;
- curriculum lesson completion where applicable.

Do not store every pointer sample by default. Raw traces are large, sensitive
to device differences, and unnecessary for the initial progress view. A
debug-only export can be considered later.

The existing `VocabularyKnowledge.writing` dimension can become an integration
target when the product defines how writing performance maps to knowledge
state. That mapping must distinguish guided assistance from independent recall.

## 10. Risks and safeguards

### Data licensing and correctness

Stroke assets have attribution and share-alike obligations. Preserve source
metadata, verify distribution implications, and review glyph forms with a
reliable Japanese reference before committing assets.

### False negatives

Mouse and touch are less precise than stylus input. Use tolerant,
device-aware thresholds and actionable feedback. A near-correct attempt should
not block progress because of a tiny geometric difference.

### False positives

Overly permissive matching can teach incorrect order or proportions. Structural
checks must remain meaningful even when shape tolerance is broad.

### Browser input

Use pointer capture, restrict `touch-action: none` to the drawing surface, and
test scrolling, pinch behavior, orientation changes, and pointer cancellation.
Navigation, retry, help, and continuation must remain keyboard accessible.

### Curriculum rigidity

The recommended sequence must be the easiest path, not a permanent lock.
Allowing row practice, difficult-character review, and learned-character
tests preserves user control without making beginners plan everything.

### Scope creep

Do not build a generic handwriting-recognition platform before a small kana
curriculum proves that the surface, feedback, and evaluator are useful.
Language adapters should isolate future complexity without making the first
mode abstract or configuration-heavy.

## 11. Relationship to Study Space

Writing Practice should be mounted through the existing `StudySpaceShell` and
share:

- the dedicated learning layout;
- entry and exit protection;
- setup and result conventions;
- design tokens and reduced-motion behavior;
- future mode selection.

The conceptual Study Space tree is:

```text
Study Space
  - Alphabet Learning
      - Japanese Hiragana
      - Japanese Katakana
      - future Hangul / Hanzi adapters
  - Vocabulary Learning
      - Flashcards
      - Writing Practice
      - Quiz
  - Results
```

Alphabet lessons and vocabulary writing use the same writing surface,
templates, evaluator, feedback, and session infrastructure where possible.
They differ in selection source, progression policy, prompts, and result
interpretation.

## 12. Suggested implementation sequence

1. Confirm the product distinction between Alphabet Learning and Vocabulary
   Learning in Study Space navigation.
2. Choose and license the kana data source; preserve attribution and version.
3. Define curriculum metadata for Hiragana and Katakana rows and lesson order.
4. Normalize a small template fixture set and validate SVG rendering.
5. Implement a pure evaluator with fixture traces and explicit tolerance
   tests.
6. Implement `WritingSurface` pointer capture and responsive coordinates.
7. Build the first Study demonstration with replayable stroke animation.
8. Build Guided Practice and independent Practice for a small lesson.
9. Validate mouse, touch, stylus, accessibility, and reduced motion.
10. Expand the basic kana curriculum.
11. Add Test, Review, custom learned-character sets, and result reporting.
12. Add separate writing-progress persistence.
13. Integrate Vocabulary Learning without changing the vocabulary schema.

## 13. Product and visual principle

Visual changes should be made when they improve functionality, clarity,
usability, or the learning experience. Visual polish alone is not a reason to
delay functional product development.

For Writing Practice, the first milestone is a reliable curriculum, writing
surface, understandable feedback, and repeatable learning flow. Decorative
animation or additional visual effects should follow only when they make those
tasks clearer.

## 14. Questions requiring review before implementation

- Which exact kana source and license treatment will be approved?
- Should pronunciation in Study use browser speech initially, bundled audio,
  or wait until a reliable audio source is selected?
- What is the final row/lesson order for Hiragana and Katakana?
- Which kana variants belong in the first curriculum?
- Should Test writing and character selection be released together or in
  separate increments?
- What minimum evidence is required before writing results update the shared
  `VocabularyKnowledge.writing` dimension?
- Which writing progress aggregates should appear in the first Progress view?
- What hardware set will be used to calibrate tolerances?

## 15. Sources consulted

- [Project Language product vision](./PRODUCT.VISION.md)
- [Project Language design system](./DESIGN_SYSTEM.md)
- [Study Experience specification](./STUDY_EXPERIENCE.md)
- [KanjiVG](https://kanjivg.tagaini.net/)
- [kanakana-strokes](https://github.com/funclosure/kanakana-strokes)
- [strokesvg](https://github.com/zhengkyl/strokesvg)
- [W3C Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/)
- [MDN Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

The external sources establish data formats, input capabilities, and licensing
statements. The curriculum, component boundaries, scoring strategy, MVP scope,
and persistence proposal are Project Language recommendations requiring review
before implementation.
