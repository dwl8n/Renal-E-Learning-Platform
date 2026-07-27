# eTrainer — Learning Design & Content Authoring

**Status:** Active
**Companion to:** `DESIGN.md` — that covers what the product is; this covers how content should teach.
**Goal:** these nurses will complete the content either way — the job here isn't to keep them entertained, it's to make what they read actually stick. Every technique below earns its place by improving retention.
**Last updated:** 2026-07-27

---

## The loop: create the gap before you fill it

1. **Open a gap.** Present something that looks easy but isn't, or a specific, surprising fact you don't fully explain yet. Target reaction: "wait, what?"
2. **Fill it.** Give the context that answers the gap you just opened.
3. **Test it.** An interactive space to apply the new knowledge.
4. **Switch formats** between steps 2–3 before attention drops (read → animate → decide → read).
5. **Repeat**, each loop building toward a harder payoff.

**Pull, not push.** The Introduction module blocks on wrong answers, forcing a backtrack. That gets compliance, but compliance isn't the goal — a fact re-read under duress doesn't stick any better than one skimmed the first time. Pull works because answering a question you're curious about encodes the answer more durably than being handed it (the generation effect: material you produce or predict is remembered better than material you're only shown). Reserve hard blocking for genuine safety gates, where the goal really is compliance.

## Why this works

All three are retention findings, not engagement tricks:

- **Misconception-first** (Derek Muller): explaining something to someone who thinks they already understand doesn't teach — surface the misconception, *then* explain. Without it, the explanation doesn't overwrite the wrong model; it just sits alongside it and fades.
- **Productive failure** (Kapur): attempting and failing at a hard problem before instruction produces better long-term recall than instruction-first, even though it looks less efficient in the moment.
- **Information-gap theory** (Loewenstein): a precise, specific gap creates a felt need to know the answer — and material that closes a felt need is retained better than material presented as a topic to cover.

## Module-level arc

- The module pre-assessment **is** the hook — include at least one question an experienced nurse might get wrong. It doubles as baseline data collection (`DESIGN.md` §8.4).
- Tasks build toward answering it, landing on the hardest question last.
- Full invisible scaffolding (content quietly answers the hook, no explicit callback) is the ideal, but it needs tight clinical co-design — treat it as a v2 target. For now, use an explicit callback: *"Remember the question about RBV? Watch what happens to Mr. Diallo…"*

## Task-level rhythm: A-plot / B-plot

Alternate dense content (A: a reading, a protocol, a data curve) with a digestible break (B: a short animation, a single decision, a character beat) — the same device an educational video uses. This isn't pacing for pacing's sake: a straight block of dense material blurs together in memory, while switching format at each idea gives it a distinct "shape" to be recalled by later. Mechanically, a task is an ordered list of heterogeneous segments (`read → animate → ask → read → decide`), not one monolithic format.

## Recurring characters — the vehicle

1. Establish normal — a character, their context, everything fine.
2. Introduce the anomaly — the gap. *"What happened?"*
3. Detour to teach the underlying concept.
4. Test the new concept on a *different* character.
5. Reconverge — tie the old and new concepts together.
6. Decide, with consequences: wrong → deterioration + debrief (not scolding); right → reinforce why.

Reuse characters across modules to build familiarity and investment.

## Consequences are allowed

Strong outcomes — including "the patient deteriorates" — are permitted in practice scenarios. `DESIGN.md`'s "failure is never framed as failure" governs **assessment and readiness gating**, not practice scenarios; "wrong answers describe consequences" (`DESIGN.md` §10.3) already covers this.

- A bad outcome is a teaching beat with a debrief — never a score or a gate.
- Never in anything labeled an assessment.
- Sobering, not discouraging.

## Authoring checklist

- [ ] Opens with a gap, not an explanation
- [ ] Hook is specific and surprising, not a general topic intro
- [ ] Dense content arrives because the learner now wants it
- [ ] Format switches between ideas, not just when things feel slow
- [ ] Interactive test, ideally applied to a fresh case — answering it is what makes it stick
- [ ] Wrong paths give consequences as debriefs, not punishment
- [ ] Clinical claims are grounded in WRHN source content and flagged for validation

Accuracy always overrides retention technique. A memorable wrong answer is worse than a forgettable right one.

## Where this lives in code

| Piece                                   | File                                                                                   | Status                                                                                               |
| -----------------------------------------| ----------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------------------|
| Segmented task runner (drives the loop) | `src/components/TaskRunner.jsx` + `.css`                                               | Built — 7 segment types: `character`, `hook`, `prose`, `figure`, `question`, `callback`, `decision`. |
| Journal deep-link                       | `src/components/RefTip.jsx`                                                            | Built — inline `(?)` button linking to a specific Journal entry.                                     |
| Reusable exercise primitives            | `src/components/TaskKit.jsx` + `.css`                                                  | Built — `ReadingTask`, `StepOrder`, `MatchGrid`, `DocForm`, `ScenarioSet`.                           |
| Worked example                          | `INTRADIALYTIC_REFILL_SCENARIO` in `src/data.js`, rendered by `FluidRemovalModule.jsx` | Built — "When Stable Isn't": full loop, recurring character (Mr. Diallo), figure = BVM curve.        |

Use `TaskRunner` for a new loop-shaped task. Use the `TaskKit` primitives directly for straightforward reading/step-order/matching/documentation tasks that don't need the full loop — see the AVG/AVF, CVC, and Medication Administration modules for examples of the latter.

## Open questions for WRHN

- Which pre-assessment questions are the right "hard hooks" per module, with defensible correct answers?
- Real (de-identified) cases to seed recurring-character scenarios?