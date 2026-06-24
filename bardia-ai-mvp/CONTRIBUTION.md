# Contribution Scope

## Authorship boundary

Everything in the separate `bardia-ai-mvp` folder is an isolated contribution
by Bardia Parand for the MVP demonstration. The existing `bardia edit` folder
and the parent renal application are not required to be changed to review it.

## Product contribution

The original renal prototype demonstrated a learner experience. This
contribution adds the missing platform-level story through one complete
Potassium Protocol flagship module:

1. Trainer-controlled content ingestion
2. Automated document analysis
3. Instructional module planning
4. Quiz, flashcard and scenario generation
5. Visual-media recommendations
6. Quality review and source evidence
7. Publishing and learner preview
8. Student strengths, weaknesses, mistake evidence and intervention analytics
9. A model-agnostic agent workflow

## Potassium flagship module

This MVP intentionally goes deep on one module rather than shallow on many.
The potassium showcase uses the protocol deck, practice-case deck, official
chart/instructions PDF and nutrition fact sheet together. It demonstrates:

- source package analysis
- eligibility/safety gate
- potassium adjustment table practice
- first temporary change versus second consecutive ongoing change
- documentation walkthrough with source screenshots
- nutrition coaching visuals
- diagnostic quiz distractors
- learner-facing Work on Weakness tab
- trainer-facing evidence of the same weakness and recommended remediation

## Technical contribution

- React/Vite frontend
- Python local document parser and deterministic generation engine
- No external API key
- Cached demo fallback
- Responsive trainer and learner interfaces
- Structured handoff format between pipeline stages

## What is intentionally not claimed

- The deterministic engine is not equivalent to a production LLM.
- The cached sample is not represented as a live model response.
- The sample students and analytics are fictional.
- Video generation, production authentication, database persistence and LMS
  integrations remain future work.

These limitations are visible in the interface because a credible MVP should
demonstrate both what works now and how it evolves after funding.
