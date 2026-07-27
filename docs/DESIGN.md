# eTrainer — Consolidated Design Document

**Status:** Active  
**Prototype:** React 18 + Vite
**Partner:** WRHN (Waterloo Region Heritage Network Health) Renal Program  
**Last updated:** 2026-07-21

---

## 1. Project Overview

eTrainer is a blended e-learning platform for hemodialysis nurse onboarding, developed in partnership with WRHN as both a thesis deliverable and a working proof of concept.

**The central design argument:** the goal is to redesign the *role* of each learning environment. Current orientation relies heavily on slide-delivered theory in live sessions — content that doesn't require in-person presence and doesn't benefit from it. eTrainer moves that theory online: self-paced, interactive, and reviewable. Live training time is then freed for what only in-person instruction can provide: hands-on practice, supervised procedures, coaching, and competency sign-off.

| eTrainer does best                   | Live training does best                      |
| --------------------------------------| ----------------------------------------------|
| Foundational theory and vocabulary   | Hands-on procedural practice                 |
| Repetition and self-paced review     | Supervised machine setup and vascular access |
| Short videos and readings            | Human feedback and clinical coaching         |
| Daily quizzes and confidence checks  | Emergency scenario response                  |
| Progress tracking and trainer alerts | Competency observation and sign-off          |

**Design principle (from the project evidence review):** *Every feature should answer one of three questions: Is the learner prepared? Is the trainer informed? Is competency protected?*

---

## 2. Non-Negotiable Constraints

These override any feature request or convenience:

1. **Readiness language only.** UI copy never uses "certified," "passed competency," or equivalents. Assessment results are framed as readiness for supervised practice, with explicit reference to the trainer's live sign-off.

2. **No AI in gating logic.** Question content, branching outcomes, sequencing logic, and progression rules are authored content — not AI outputs — and remain authored in the final product (governance requirement).

3. **AI components live only in low-stakes zones.** The Review assistant operates exclusively on completed-module content, is grounded only in approved authored material, and never comments on scores, readiness, or competency.

4. **Failure is never framed as failure.** Below-threshold assessment results show supportive review guidance; nothing is blocked. The exception is the Final Assessment (see §9), which mirrors the real-world 80% gate.

5. **Trainer authority is restated at boundaries.** Login screen, header/footer notes, assessment intros, and result screens all reiterate that sign-off stays with the trainer.

6. **Objective evidence outweighs self-report.** The pre-assessment's learner classification weights the knowledge check above the confidence survey, and any conflict between the two is surfaced to the trainee with visible reasoning.

---

## 3. User Personas

### 3.1 New Graduate
A nurse with little or no prior hemodialysis experience. Arrives with strong foundational nursing knowledge but no familiarity with HD machines, vascular access, or ESRD-specific workflows. Needs the full standard path. Benefits most from structured progression, recurring patient characters for context-building, and clear feedback on where to focus.

### 3.2 Veteran Preceptor
An experienced HD nurse returning to the orientation platform as a reviewer or updating their practice after policy changes. Does not need to repeat introductory content. Accesses eTrainer primarily in review mode. May serve as a content validator during content-authoring phases.

### 3.3 Float Nurse
A nurse from another unit (e.g., ICU, med-surg) with some clinical experience but no formal HD background. Similar to a new graduate for HD-specific content, but may already know infection control and emergency code fundamentals. Likely candidate for condensed fast-track content in those areas (see §6).

---

## 4. Blended Learning Model

### 4.1 Day 1 (In-Person, Required)

Day 1 always takes place in person. This does not change with eTrainer.

**In-person Day 1 activities:**
- Meet new staff and introductions
- Login setup — trainees receive Cerner credentials during corporate onboarding; Day 1 confirms they can log in to eTrainer
- ID badge issue, punch clock access, locked room access
- Parking registration if applicable
- Unit tour (3E and 7B)

**eTrainer on Day 1:** After login setup is confirmed, trainees begin the Introduction module (Emergency Codes, Infection Control, Hep B). These can continue asynchronously after the in-person portion.

### 4.2 Pre-Orientation (Before Day 1)

WRHN typically sends a welcome email approximately two weeks before the trainee's start date. This email will include a link to the eTrainer pre-assessment, which trainees complete before arriving on Day 1. This allows the system to classify their prior knowledge and set the appropriate learning path before orientation begins.

### 4.3 Blended Schedule Overview

The following maps eTrainer content to the WRHN orientation schedule. In-person sessions remain unchanged; eTrainer prepares trainees before and supports review after.

| Live day | Core in-person content | eTrainer role |
|---|---|---|
| Before Day 1 | — | Pre-assessment; welcome module (role, safety culture, vocabulary) |
| Day 1 (Friday) | Welcome, Standard of Care, Lotus Link, Medical Directives, Unit Tour | Introduction module: Emergency Codes, Infection Control, Hep B — started on Day 1 and continued async |
| Days 2–3 (Mon–Tue) | Renal Insight Documentation, Patient Assessment (Fluid), Fluid Case Studies, Fluid Removal, Medication Administration | Software module (Renal Insight); Patient Care: Fluids module |
| Days 4–5 (Wed–Thu) | Fresenius 5008 Machine (2 sessions), CVC Access, AVG/AVF, Pharmacy meet | Machine & Access module — Machine Pre-Practice theory before hands-on; Access tasks |
| Day 6 (Fri) | CVC troubleshooting, AVF complications & skills sign-off, Sonosite demo, Allied presentations (Dietitian, Transplant) | Review mode for Machine & Access; Access documentation practice |
| Day 7 (Mon) | Shadow Day (7–3, in-person) | Completed before Shadow Day: all Machine & Access tasks, Renal Insight module |
| Day 8 (Tue) | Bloodwork, Potassium Protocol, Complications, Review, Final Knowledge Assessment | Patient Care: Assessment module; Final Assessment |

**Notes from WRHN:**
- Machine Day should precede Shadow Day and ideally precede CVC day
- Shadow Day is flexible; best in the final days to solidify learning
- Sonosite/VAC hands-on requires in-person demo even with VR in a future phase
- Allied presentations (SW, Dietitian, NP, Transplant) occur throughout orientation and will continue with eTrainer

---

## 5. Content Hierarchy

```
Course
  └─ Module (thematic group)
       └─ Task (individual learning activity)
```

The prototype currently uses this three-level hierarchy: Courses → Modules → Tasks. Navigation reflects this: the course shell shows a sidebar of module groups; clicking a module shows its task list; clicking a task opens the content.

---

## 6. Module Map & Dependencies

Introduction is a required prerequisite for all other modules. Patient Care: Fluids must be complete before Patient Care: Assessment unlocks. All other sequencing is recommended but not enforced.

```
Introduction  [required prerequisite for all]
├── Emergency Codes
├── Infection Control
└── Hep B

Machine & Access
├── Machine Pre-Practice  [optional, theory-only — see §11]
├── Machine Practice  [in-person]
├── Access: CVC
├── Access: AVG/AVF
└── AVG/AVF Skills Practice  [in-person, Sonosite]

Patient Care: Fluids  [required before Patient Care: Assessment]
├── Patient Assessment: Fluid
├── Fluid Removal
└── Medication Administration
    └── Pharmacy Meeting  [in-person, recommended after this task]

Patient Care: Assessment
├── Bloodwork
├── Potassium Protocol
└── Complications & Monitoring

Software
├── Renal Insight
└── Cerner  [TBD whether included]

Allied Presentations  [in-person, throughout orientation]
├── Social Work
├── Dietitian
├── Nurse Practitioner
└── Transplant

Shadow Day  [in-person; recommended after Machine & Access is complete]

Final Assessment
├── Case Studies  [informal review]
├── 5008 Skills Assessment  [in-person]
└── Knowledge Assessment  [80% gate, must be last day]
```

---

## 7. Information Architecture & Navigation

### 7.1 Pre-Login

- Landing / login screen (Cerner employee ID + password)
- Registration (name, employee ID; mocked SMS verification for prototype)
- Boundary tagline: trainer sign-off language always visible

### 7.2 Post-Login (Outside a Course)

Single **Courses** tab. Shows the course catalogue (currently only the Hemodialysis Orientation course).

### 7.3 Inside a Course

The nav rail changes when a course is active. The header switches from the app logo to the course title with a back arrow that exits to the catalogue.

| Nav item | Type | Description |
|---|---|---|
| **Modules** | Page | Module list; sidebar of module groups with task rows |
| **Progress** | Page | Visual module dependency map (graph with clickable nodes) + completion sidebar |
| **Journal** | Slide-out panel | Reference content accumulated as the trainee reads and views cards; opened from the nav rail, not a full page |
| **Practice Assistant** | Page | AI review assistant (scripted for prototype; see §13) |

Completed modules remain in the Modules list with a completed state. Milestone checkpoints are a future feature not yet implemented; when added, they may warrant a dedicated tab alongside Modules and Progress.

> **Future consideration:** separating completed modules into a dedicated Review view and surfacing milestone checkpoints in an Assessment tab is a reasonable direction as the platform grows. Any decision to adopt it would require restructuring the current Modules page.

### 7.4 Module & Task Navigation

The **Progress** page shows the module dependency map as a visual graph with clickable nodes. Required dependencies are shown as solid connectors; recommended sequencing as lighter connectors. A sidebar within the page lists modules and tasks with completion status.

Within a module: sidebar lists all tasks with completion ticks and estimated time. Each task shows its interaction-type label. Module readiness assessment and question bank unlock after all tasks are complete.

---

## 8. Pre-Assessment

Runs once, immediately after registration or first login, before the main course view.

### 8.1 Stages

1. **Intro** — explains the purpose and the fast-track concept. "Skip — I'm new to dialysis" routes straight to the standard path.

2. **Self-report survey** — hemodialysis experience (4 levels), prior formal HD training (yes/no), and per-domain confidence (Not / Somewhat / Confident) for the functional domains. If "No dialysis experience" selected, trainee is offered the standard path directly, with the knowledge check remaining optional.

3. **Knowledge check** — 12 questions (3 sampled per domain from module assessment banks), one at a time, no interim feedback, framed as "not a test you can fail."

4. **Result** — per-module classification with **visible reasoning:**

| Knowledge check | Self-reported confidence | Outcome |
|---|---|---|
| ≥ 2/3 | Somewhat / Confident | Fast track — "confidence backed by the check" |
| ≥ 2/3 | Not confident | Fast track — check outweighs under-confidence; content stays available |
| < 2/3 | Confident | Standard path — conflict surfaced: "objective results carry more weight" |
| < 2/3 | Not / Somewhat | Standard path — supportive step-by-step framing |

### 8.2 Fast-Track Effects

Fast track applies only to **Emergency Codes** and **Infection Control** — the only modules where condensed content is clinically defensible. All hemodialysis-specific content (machine, access, fluid, bloodwork, complications) remains full-length regardless of prior experience, per WRHN guidance.

**Fast-track effects:**
- Module's question bank and readiness assessment unlock immediately
- Every learning activity gains a "Skip to questions" button
- Prerequisite locks are overridden
- A "Fast track" chip appears on the module card with a visible explanation banner

**Fast track never skips the readiness assessment or trainer sign-off** — stated on the intro screen, result screen, and module banner.

### 8.3 Delivery

A link to the pre-assessment is included in the welcome email sent approximately 2 weeks before the trainee's start date. Completing it before Day 1 is encouraged but not required; it runs on first login if not already completed.

### 8.4 Per-Module Pre-Assessments

In addition to the orientation-level intake, each module has a short mandatory pre-assessment that runs before the trainee begins its content.

**Purpose:** data collection. Pre/post scores across all modules give trainers and researchers a concrete picture of knowledge growth over the course of orientation. This data also informs future iterations of the platform.

**Design constraint — avoid demotivating trainees:** mandatory framing creates a risk, particularly for new graduates who may not feel confident entering a specialized unit. The pre-assessment must be clearly framed as a baseline measurement, not a test of readiness. Specific requirements:
- Explicitly state upfront that the score does not affect their path or their trainer's assessment of them
- No pass/fail language, no score shown to the trainee immediately (they can view it later if curious)
- Keep it short — enough questions to be statistically useful, not enough to feel like an exam
- Tone should be curious and exploratory ("Let's see where you're starting from") rather than evaluative

**What to avoid:** if trainees perceive the pre-assessment as gatekeeping or judgment — even incorrectly — it can prime anxiety that affects their engagement with the module that follows. Framing and length are the primary levers here.

---

## 9. Assessment Strategy

### 9.1 Practice Quizzes

After each interaction activity: 2–3 questions with immediate feedback, options shuffled per render, non-gating. In review mode, a "Skip learning activity" button jumps straight to these.

### 9.2 Module Question Bank

Pooled practice questions for the module; unlimited retries; explicitly framed as self-review, not a gate.

### 9.3 Module Readiness Assessment

10 questions per module, drawn from that module's assessment bank; one at a time, no per-question feedback.

**Threshold: 70%**

- **≥ 70%:** "You're ready for live supervised practice on this module." Note that the trainer sees the result and validates competency in person.
- **< 70%:** Supportive message; review and retry offered; nothing blocked.

Module status becomes Completed on a passing result.

### 9.4 Milestone Checkpoints *(planned)*

Instructor-placed checkpoints that unlock when required modules are complete. Each covers multiple modules with pooled questions. Trainer reviews results; sign-off remains live.

### 9.5 Final Knowledge Assessment

The culminating assessment at the end of orientation, administered on the last live day. **80% passing grade required** before progression to preceptorship (mirrors WRHN's current standard). Preceded by:
- Case studies (informal review tool, not gated)
- 5008 skills assessment (in-person machine review, trainer sign-off)

The final assessment is not yet implemented in the prototype and will be scoped in detail with WRHN.

---

## 10. Content Formats

### 10.1 Interaction Patterns

| # | Format | Used in |
|---|---|---|
| 1 | Reading / Reference Page | Module intros everywhere; sidebar reference panel for formulas/BVM ranges |
| 2 | Browsable Card Deck | Emergency Codes |
| 3 | Multiple Choice Quiz | End-of-module review; base primitive for most exercises |
| 4 | Select-Multiple / Item Picker | PPE & Hand Hygiene Lab |
| 5 | Sequence / Step-Ordering | Station Turnover Checklist, CVC Connection/Disconnection, Complications Response |
| 6 | Scenario + Decision | Isolation & Screening, AVG/AVF follow-up, CVC complications, Fluid Removal decisions, Symptom triage, Potassium walkthrough |
| 7 | Checkpointed Video | Machine stringing walkthrough |
| 8 | Hotspot / Callout Matching | Machine part identification |
| 9 | Chaptered Video (passive) | AVG/AVF cannulation video |
| 10 | Calculation Input | UF Volume, Safe Removal Rate |
| 11 | Multi-Step Worksheet | Combined fluid calculation scenarios |
| 12 | Mock Form / Documentation Practice | Renal Insight documentation — reused across Access, Fluids, Medication, Complications |
| 13 | Animated Data Curve with Inflection Prompts | BVM graph (RBV % over treatment time) |
| 14 | Matching Exercise | Medication → indication/route |
| 15 | Flip Flashcards | Critical Values |
| 16 | Linear Case Walkthrough | Phoebe walkthrough (alt to flashcards — AI-recommended based on prior activity) |
| 17 | Formal Gated Assessment | Module readiness assessments and Final Assessment (mode flag on #3/#6, not a new component) |
| 18 | Multi-Entity Live Scenario | Multi-patient monitoring round (most complex; needs its own state engine) |
| 19 | Guided Software Tutorial | Renal Insight mock UI walkthrough |
| 20 | Spot the Mistake / Error Identification | Infection Control, Machine Pre-Practice stringing check |

### 10.2 Journal & Glossary System

The Journal is a persistent reference panel, accessible from the nav rail at any point during a course. It accumulates content automatically as trainees progress — they don't need to manually save anything.

**What populates the Journal:**
- Reading pages are added in full when the reading task is completed
- Card decks (e.g. Emergency Codes) are added when the trainee reads a card and taps **"Mark as Read"** — an explicit confirmation rather than a silent on-view add, so the trainee registers that the content is now saved for reference. A "Added to your Journal" banner with an "Open Journal →" action surfaces the link the first time.
- Glossary terms are added when their definition is first accessed *(planned — the glossary-linking layer is spec'd but not currently wired up; see §11 Infection Control note)*

**How content links back to the Journal:**
- Glossary terms appear underlined anywhere they occur in task content; clicking opens the relevant Journal entry
- A (?) button appears next to clinical values, procedures, or concepts a trainee might not know — linking directly to the specific entry
- Links are as specific as possible (to a section, not just the module)

**Practice Assistant and Journal:**
- Every assistant answer that matches a source shows a provenance chip ("From: {module} · {topic} — open →") that links directly to that content in the Journal
- This means the assistant functions as a guided Journal lookup — trainees can ask a question and land exactly where the answer lives

**Design principle behind all of this:** design under the assumption that trainees didn't read the material. The Journal is their safety net during tasks, not an afterthought. Make it fast to reach and specific when it gets there.

### 10.3 Design Principles for Content

- **Wrong answers describe consequences**, not just "that's incorrect." This adds learning content and feels more immersive.
- **Recurring patient characters** appear across modules so trainees build familiarity and investment. One task in Complications involves managing three of these patients simultaneously.
- **Time-based exercises** (optional): a timer appears in Emergency Codes or Complications scenarios to add urgency without punishing for slow responses.

### 10.4 Implementation Notes

- **Scenario + Decision (#6)** is the most reused format — build it as one configurable component (single MC vs. branching vs. multi-part).
- **Formal Assessment (#17)** is a mode flag (locking, no backtrack, pass threshold), not a separate component type.
- **Multi-Entity Live Scenario (#18)** is the one true outlier — it needs bespoke state management rather than sharing the config-driven engine.
- Card-viewing (#2) and glossary-linking (#1) share the same "add to Journal on view" hook — worth building as one shared event rather than duplicating the logic.

---

## 11. Module Content Plan

### Introduction

#### Emergency Codes
- Colored full-bleed cards — one per code (Code Red — Fire, Code Green — Evacuation, Code Blue — Medical Emergency), browsed in any order. The card colour matches the real code colour. Reading a card and tapping **"Mark as Read"** completes that sub-task and adds the code's content to the Journal; a "✓ Reviewed" badge then replaces the button.
- End-of-module review: short MCQ matching codes to correct responses
- **Fast-track eligible** (condensed version available)

#### Infection Control
1. **Concept cards** — dialysis infection risks, hand hygiene (4 Moments), PPE selection, clean/contaminated zones, isolation precautions, disinfectant contact times, Hep B screening. Delivered as ~7 tap-to-expand concept cards (icon + title + one-line summary; expands to bullet detail) rather than one long reading page — less upfront text, more scannable, still added to the Journal on completion. *(Was a single glossary-linked reading page; restructured into cards to reduce the wall of text.)*
2. **PPE & Hand Hygiene Lab** — drag-or-click correct PPE for 4 clinical scenarios; immediate feedback with source citation
3. **Station Turnover Checklist** — step-ordering exercise for cleaning between patients
4. **Spot the Mistake** — a described clinical situation (e.g. C. difficile precautions, reading an isolation sign, a transient/out-of-country patient) with one or more deliberate errors embedded, plus deliberate **traps** — actions that feel safe but aren't, and safe-looking actions that are actually correct. Every segment is tappable (no cursor giveaway), and not every segment is an error. Immediate feedback explains why each is a mistake and the correct action. Format #20. Scenarios are grounded in the GRH source fact sheets; content accuracy is the priority and WRHN's IPAC team should validate/extend them.
- **Fast-track eligible** (condensed version available)

> **Implementation note:** Spot the Mistake replaces the earlier "Isolation & Screening Cases" plan for task 4. The error-identification format is more novel, more specific to IC workflows, and better suited to the prototype's interaction variety goals. Isolation scenarios can be revisited as a separate task in a later iteration. *(The task's internal key is still `isolation-cases` for legacy reasons — it renders as "Spot the Mistake".)*

> **Known regression — glossary linking:** the glossary-linked terms and (?) deep-links described in §10.2 were previously prototyped here via a shared `LinkedText` helper and were dropped in the concept-card rewrite. The affordance is not currently wired up anywhere. Flagged in-code as a `TODO (glossary regression)` at the top of `InfectionControlModule.jsx`; re-introduce when the Journal-linking work is picked back up.

#### Hep B
Covered within the Infection Control reading as its own page: surveillance schedule, immunization requirements, staff exposure protocol. No separate task unless WRHN wants a standalone sign-off.

---

### Machine & Access

#### Machine Pre-Practice *(in-scope, optional)*
- **Stringing walkthrough** — checkpointed video/animation; learner must click the correct component before advancing; includes a "spot the error" mode where an incorrectly strung machine is shown and they must identify the mistake
- **Part identification** — still image with labeled callout hotspots; learner matches part names to location
- This task is optional (self-paced preparation before live Machine Day); it does not replace the in-person competency sign-off

#### Access: AVG/AVF
1. **Reading** — anatomy of AV grafts and fistulas, assessment criteria, contraindications
2. **Video** — existing cannulation technique training video with chapter markers
3. **Interactive follow-up** — given assessment findings (thrill, bruit, appearance), choose whether to proceed, escalate, or document only
4. **Documentation practice** — fill in a mock access assessment field in Renal Insight
5. *(Phase 2)* VR cannulation practice — Sonosite hands-on currently stays in-person

#### Access: CVC
1. **Reading** — CVC types, exit site assessment, infection signs
2. **Connection/disconnection checklist** — step-ordering exercise
3. **Complication scenarios** — given a patient presentation, identify the likely CVC complication and appropriate response
4. **Documentation practice**

---

### Patient Care: Fluids

#### Patient Assessment: Fluid
1. **Reading** — fluid accumulation in ESRD, dry weight concept, UF volume and rate formulas (Reference Formulas sidebar stays visible throughout)
2. **UF Volume Calculation** — given pre/post weights and dry weight, calculate UF volume; text input with immediate feedback
3. **Safe Removal Rate Checks** — given UF volume and treatment time, classify as safe or unsafe
4. **Combined Worksheet** — 3 multi-step scenarios combining both calculations

#### Fluid Removal
1. **Reading** — blood volume monitoring overview, BVM reference ranges (85% policy minimum, check every 30 min; sidebar reference card throughout)
2. **Symptom Recognition & Response** — written scenario presenting vitals and patient symptoms; choose the correct intervention
3. **Fluid Removal Decision Cases** — mid-treatment situations: reduce UFR, give saline bolus, or notify physician
4. **Animated BVM Graph** — RBV % over treatment time; pauses at inflection points ("RBV drops below 85% — what do you do?"); click-to-respond

#### Medication Administration
1. **Reading** — EPO, heparin, IV iron: indications, common doses, timing relative to treatment
2. **Matching exercise** — medication → indication and route
3. **Documentation scenario** — given a medication order, complete mock charting fields

---

### Patient Care: Assessment

#### Bloodwork
1. **Reading** — "What We Test and Why": potassium, hemoglobin, albumin, phosphorus, sodium; normal vs. critical ranges, nursing responsibility
2. **Critical Values Flashcards** *(or Clinical Lab Walkthrough — AI-recommended based on prior activity)* — flip cards (test name front, critical ranges + nursing response back) or a case-based walkthrough following a single patient (Phoebe) through each lab value with range bars and a decision question
3. **Critical Range Identification** — 6 patient lab result scenarios; classify as normal, notify, or critical and choose the correct response
4. **Formal Assessment** — 70% readiness threshold, no back-tracking, Journal locked during attempt

#### Potassium Protocol
1. **Reading** — K+ protocol: thresholds for action, dialysate bath order changes, physician notification script
2. **Decision walkthrough** — given a pre-dialysis K+ of 6.8 mmol/L, walk through each protocol step in sequence

#### Complications & Monitoring
1. **Reading** — intradialytic hypotension, muscle cramping, air embolism, chest pain, access issues: recognition and first response
2. **Symptom triage** — given vitals + patient complaint, identify the most likely complication
3. **Response ordering** — drag steps into the correct intervention sequence
4. **Multi-patient monitoring round** — simulated shift: 3 recurring patients with evolving readings; decide who to check first and what to do *(complex; own state engine)*
5. **Documentation exercise** — chart the event and interventions in a mock flow sheet

---

### Software

#### Renal Insight
- Nurses are given access to Renal Insight to practice directly; a video tutorial is the baseline approach
- Optional enhancement: a simplified mock UI with important fields highlighted (guided software tutorial)
- Renal Insight documentation practice is reused across Access, Fluids, Medication, and Complications tasks

#### Cerner
TBD whether included in this phase.

---

### Final Assessment
- Case studies (informal review, not gated)
- 5008 skills assessment (in-person, trainer sign-off)
- Cumulative knowledge assessment: timed MCQ covering all modules; **80% passing gate** before progression to preceptorship

*Not yet implemented in the prototype — to be scoped with WRHN.*

---

## 12. Trainer Dashboard

**Priority metrics:**
- **Areas of strength and areas for improvement** per trainee — to focus any in-person teaching that may be required
- **Module progress** — which modules are complete, in progress, or not started

**Additional metrics** (defined to avoid dashboard overload):
- Per-module quiz scores (not just pass/fail)
- Alerts for trainees who fall below threshold and do not retry

The dashboard is a low-priority deliverable for the current prototype phase. The basic implementation exists (Master Regulator role and trainer view); detailed design is deferred.

---

## 13. AI Hooks

| Hook                           | Location                         | Current state                                   | Future state                                                         | Guardrails                                                                                                                                                                                     |
| --------------------------------| ----------------------------------| -------------------------------------------------| ----------------------------------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FAQ chatbot FAB                | Task screens                     | Visible, disabled, "Coming soon"                | Opens the assistant                                                  | —                                                                                                                                                                                              |
| Review assistant               | Practice Assistant page          | Scripted keyword matcher over authored FAQ bank | Locally hosted model call (PHIPA/Ontario residency decision pending) | Grounded in approved content only; completed modules only; refuses unmatched questions and redirects to trainer; never discusses scores/readiness/competency; header disclaimer always visible |
| Adaptive difficulty            | Code comment at assessment banks | Comment only, no UI                             | Adaptive question weighting during preparation                       | Must never bypass human sign-off                                                                                                                                                               |
| Learner model (pre-assessment) | Post-login pre-assessment        | Scripted rule-based classification              | Richer learner modeling that continues shaping preparation over time | Objective evidence outweighs self-report; conflicts surfaced with visible reasoning; fast track never skips readiness assessments or sign-off                                                  |
| Content recommendation         | Flashcards vs. Case Walkthrough  | Not implemented                                 | AI suggests format based on prior performance in the module          | Authored content only; no new questions generated                                                                                                                                              |

Every assistant answer with a matched source shows a provenance chip ("From: {module} · {topic} — open →") that deep-links back into that module's content.

---

## 14. Scope

### In Scope (Current Phase)
- Trainee login (Cerner credentials, mocked for prototype)
- Pre-assessment with per-module fast-track classification
- Course navigation shell (Modules, Progress, Journal, Practice Assistant)
- Module dependency map (Progress page)
- All 19 content formats as needed per module
- Practice quizzes, question banks, module readiness assessments (70% threshold)
- Journal (glossary and reading references, populated automatically on view)
- Scripted Practice Assistant chatbot
- Presenter demo mode
- Trainer dashboard (basic implementation; detailed design deferred)
- Machine Pre-Practice (optional theory task)
- Milestone checkpoints (planned; not yet implemented)

### Out of Scope (Deliberately, This Phase)
- Trainer sign-off workflow and competency checklists
- Instructor exam-authoring workflow
- Backend or persistence (no localStorage/sessionStorage in prototype)
- Live AI/API integration
- Real video hosting
- Real SMS/employee-ID verification
- PHIPA-relevant data handling (no real patient data exists in this build)
- VR cannulation practice (Phase 2)
- Cerner module (TBD)
- Final Assessment (to be scoped with WRHN)

---

## 15. Backend (Stub)

*This section is a placeholder — backend architecture is being planned by a separate team member.*

Known requirements:
- Authentication via existing Cerner/corporate credentials (SSO or credential pass-through)
- Per-trainee state persistence (module progress, assessment scores, Journal contents, pre-assessment results)
- Trainer dashboard data (aggregated progress metrics per trainee and cohort)
- Content versioning and audit trail (clinical review requirement)
- No real patient data; PHIPA implications limited to trainee identity and training records
- Pre-assessment results must persist to shape the trainee's learning path for the entire orientation period

---

## 16. Visual Design

The prototype uses a **Microsoft Fluent** design system — communication blue as the brand ramp, Fluent neutral greys for surfaces, and Fluent elevation shadows. Variable names use `--teal-*` for historical reasons but the values are Fluent blues.

| Token         | Value   | Use                                                |
| ---------------| ---------| ----------------------------------------------------|
| `--teal-500`  | #0078d4 | Primary brand, active states, primary buttons      |
| `--teal-200`  | #c7e0f4 | Hover/selected backgrounds                         |
| `--teal-100`  | #deecf9 | Light tint backgrounds                             |
| `--red-500`   | #d13438 | Danger, critical values, incorrect-answer feedback |
| `--green-500` | #107c10 | Success, completed states                          |
| `--amber-500` | #ffb900 | Warning                                            |
| `--grey-600`  | #605e5c | Secondary text                                     |
| `--grey-200`  | #edebe9 | Borders, dividers                                  |
| `--bg`        | #f3f2f1 | Page background                                    |
| `--surface`   | #ffffff | Card/panel background                              |

Typography: system sans-serif (`-apple-system, Segoe UI`, etc.).  

Cards: radius `--radius-lg` (8px) or `--radius-xl` (12px), Fluent depth shadows (`--shadow-sm`/`--shadow-md`).  
Functional and content-first; no decorative illustration.  
Status pills: Not started / In progress / Completed (and Locked for dependency-blocked tasks).


---

## 17. Pilot Evaluation Plan

The following metrics should be collected during the eTrainer pilot to validate the blended model:

| Kirkpatrick level | Question                                  | Measures                                                                                        |
| -------------------| -------------------------------------------| -------------------------------------------------------------------------------------------------|
| Level 1: Reaction | Did trainees find it usable and relevant? | Satisfaction, usability, perceived confidence                                                   |
| Level 2: Learning | Did knowledge improve?                    | Pre/post tests, quiz scores, scenario performance                                               |
| Level 3: Behavior | Can trainees apply learning live?         | Observed skills, trainer checklists, trainer readiness ratings                                  |
| Level 4: Results  | Did training become efficient and safe?   | Days to competency, error/re-training needs, trainer workload, knowledge retention at 2–4 weeks |

Important caveat: the literature supports e-learning for knowledge acquisition and flexibility. Whether those gains translate into better clinical readiness or more efficient orientation must be validated in the local WRHN pilot.

---

## 18. Progression & Motivation (XP & Levels)

The prototype layers a lightweight game-like progression system over the module map. Its purpose is motivational — to give trainees a visible sense of momentum through a long orientation — not evaluative. **XP and levels are never a gate and never signal readiness or competency**; they sit entirely outside the assessment and sign-off logic (§9) and must not be confused with it in UI copy.

### 18.1 XP per quest

Every quest (module task group) carries an XP value. Completing all of a quest's sub-tasks makes the XP *available to collect* — it lands in a per-quest `pendingXP` bucket and raises a "reward" notification. The trainee then explicitly **collects** it (a claim step), at which point it moves into their running total. The claim step exists so the reward feels earned and noticed rather than silently accruing.

### 18.2 Front-loaded curve

XP is deliberately **front-loaded**: earlier content rewards more than equivalent later content, so momentum from the very start of orientation carries the trainee forward. Concretely, the Introduction module is worth the most per minute of effort, and the curve flattens through the hemodialysis-specific modules.

Representative values (subject to tuning):

| Quest | XP | Notes |
|---|---|---|
| Starting Assessment (baseline survey) | 150 | Intro momentum |
| Emergency Codes | 300 | |
| Infection Control & Hep B | 400 | Largest Introduction task |
| Module check-ins (per-module pre-assessments) | 50 | Low-effort gates |
| Fluid / Intradialytic Fluid | 250 each | |
| AVG-AVF / CVC | 350 each | |
| Bloodwork Values | 350 | |
| Medication Administration | 200 | |
| Potassium Protocol | 150 | |
| Complications & Monitoring | 300 | |
| Renal Insight / Cerner | 250 each | |

Completing the **Introduction module** (150 + 300 + 400 = **850 XP**) lands exactly on the Level 2 threshold, guaranteeing that finishing orientation's first module visibly levels the trainee up.

### 18.3 Levels

Five levels, driven by cumulative collected XP against fixed thresholds:

`[0, 850, 1600, 2500, 3500]` → Levels 1–5. Everyone starts at Level 1. The thresholds are tuned so that whole-module milestones line up with level-ups (Introduction → L2; a parallel module group → L3; mid Patient Care: Assessment → L4; completing Software → L5, near the ~3,750 XP course total).

### 18.4 Notification badges

Small notification dots appear on the nav rail (`tasks`, `journal`, `assessments`) when new content of that kind becomes available — a newly unlocked task/assessment, or new pages added to the Journal. They clear when the trainee visits the corresponding view. These are attention cues, not progress state.

### 18.5 Constraints

- XP/levels are cosmetic motivation only. They never unlock gated content (prerequisites and pre-assessment fast-track do that, §6/§8), never appear in trainer-facing readiness data, and never use evaluative language.
- The claim/collect step and level-up moment are the intended "reward" beats; keep them celebratory but brief.

---

## Changelog

| Date       | Change                                                                                                                                                                                                                                                                                             |
| ------------| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2026-07-21 | Split pedagogical model & content-authoring craft into a new companion doc `LEARNING-DESIGN.md` (create-the-gap loop, research grounding, recurring-character scenario patterns, authoring checklist); linked from the header and §10.3 to keep this spec focused                                  |
| 2026-07-21 | Documented the XP & Levels progression system (new §18); updated §10.2 Journal for the explicit "Mark as Read" add; updated §11 Emergency Codes (Mark as Read) and Infection Control (concept cards, harder Spot the Mistake); flagged glossary-linking as a known regression (in §11 and in-code) |
| 2026-07-17 | Added format #20 (Spot the Mistake); updated IC module plan — task 4 is now Spot the Mistake replacing Isolation & Screening Cases                                                                                                                                                                 |
| 2026-07-08 | Initial consolidated document — derived from eTrainer Prototype.md, SPEC.md, modules.md, WRHN meetings, and orientation schedule                                                                                                                                                                   |
