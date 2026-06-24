# Potassium Protocol Source Audit

This document records what was inspected for the one-module MVP showcase.
The goal was to use every substantive file in the source folder and explicitly
account for the non-learning-content files.

Source folder:

`content/Bloodwork/Potassium Protocol/`

## Files inspected

| File | Type | MVP use |
| --- | --- | --- |
| `Potassium Protocol (Updated - WRHN).pptx` | PowerPoint, 24 slides | Core directive, clinical triggers, exclusions, adjustment-table logic, first/second change rules and documentation screenshots. |
| `Extra potassium protocol practice questions.pptx` | PowerPoint, 8 slides | Worked cases used for decision-lab examples and diagnostic quiz distractors. |
| `Potassium Protocol Chart with Instructions (Updated).pdf` | PDF, 2 pages | Official adjustment table, eligibility criteria, critical values and follow-up instructions. |
| `ORN Nutrition Fact Sheet - Potassium.pdf` | PDF, 8 pages | Patient education, food-choice guidance, double-boiling process, serving-size warnings and special cautions. |
| `Thumbs.db` | Windows thumbnail cache | Audited. It only contained cached thumbnails of known deck/title images, not new learning content. |
| `~$tassium Protocol Charts.docx` | Word temporary lock/owner file | Audited. It was a small owner/lock artifact, not a usable document. |

## Clinical learning structure extracted

The MVP module teaches the full potassium decision loop:

1. Recognize clinical changes that require timely electrolyte review.
2. Check whether the patient is eligible for the adjustment table.
3. Use current prescription plus serum potassium to select 1K, 2K or 3K.
4. Notify provider immediately for potassium below 3.0 mmol/L or above 6.5 mmol/L.
5. Treat the first indicated bath change as temporary for the current run.
6. Restart the next run on the prescribed bath and repeat electrolytes.
7. Make the change ongoing only after a second consecutive indicated result.
8. Complete machine, observation, order, progress-note and follow-up documentation.
9. Coach the patient with source-based nutrition guidance.

## Source visuals reused in the MVP

The demo includes source-derived images for:

- potassium adjustment table
- dialysis machine/patient education visuals
- Day Hemo Order/documentation
- Bath Changed observation
- Potassium Protocol progress note
- K Protocol Follow Up Lytes order
- double-boiling instructions
- potassium food choices

## MVP honesty

The showcased output is cached and refined so the presentation is reliable
without an external API key. This is intentional: the demo proves the product
loop and interface. A funded version can replace the deterministic/cached stages
with Gemini, Claude, OpenAI, Ollama or another model while keeping the same
trainer-review and learner-remediation workflow.
