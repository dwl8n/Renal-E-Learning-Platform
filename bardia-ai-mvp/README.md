# LearningForge AI - Bardia's E-Learning MVP

This folder is a self-contained contribution prototype. It does **not** modify the
main renal e-learning application.

The MVP demonstrates a broader product idea:

> Upload trusted source material, analyze it locally, generate a reviewable
> learning package, publish it to a learner, and use assessment performance to
> identify strengths, weaknesses and recommended interventions.

## What can be demonstrated

- Trainer and learner role selection
- Trainer dashboard and review queue
- PDF, PPTX, DOCX, TXT and Markdown ingestion through a local Python service
- Automated content cleaning, chunk scoring and keyword analysis
- Suggested learning objectives and module sequence
- Draft flashcards, multiple-choice questions and a scenario
- Visual-format recommendations such as flowchart, decision tree, timeline,
  screenshot simulation and coaching visuals
- Source references and visible quality checks
- Human approval before publishing
- "View as learner" mode
- Interactive potassium module with safety gate, decision lab, process
  flowchart, documentation walkthrough, nutrition coaching, flashcards and quiz
- Learner strength/weakness results with a focused "Work on weakness" tab
- Trainer-facing student profiles, mistake evidence and intervention recommendations
- An n8n-style workflow/architecture explanation

## Important MVP honesty

The project works without a paid AI key.

- **Live custom documents:** processed by a deterministic local prototype engine.
  It uses document extraction, cleaning, keyword frequency, rule detection and
  question templates. Its quality is intentionally modest.
- **Bundled potassium-protocol sample:** uses a cached, source-grounded result
  refined for a reliable presentation. This is the high-quality one-module MVP
  path.
- **Future upgrade:** Gemini, Claude, OpenAI or Ollama can replace individual
  pipeline stages because the frontend already expects structured JSON.

The interface labels these boundaries clearly. It does not pretend the cached
sample is a live large-language-model response.

## Quick start: visual sample only

This path needs no Python service.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5174`.

Choose **Trainer Studio**, open **AI Module Builder**, keep the included sample
selected, and click **Analyze and generate**.

## Full start: analyze custom documents locally

Install the local document readers:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Start the local analyzer in terminal 1:

```bash
python backend/server.py
```

Start the React application in terminal 2:

```bash
npm install
npm run dev
```

When the trainer page says **Local analyzer connected**, uploaded PDF, PPTX,
DOCX, TXT and Markdown files are processed on the same computer.

## Production build

```bash
npm run build
```

The static frontend is written to `dist/`.

## Source package used in the showcase

The cached module is based on every substantive file in:

`content/Bloodwork/Potassium Protocol/`

- `Potassium Protocol (Updated - WRHN).pptx`
- `Extra potassium protocol practice questions.pptx`
- `Potassium Protocol Chart with Instructions (Updated).pdf`
- `ORN Nutrition Fact Sheet - Potassium.pdf`

The folder also contained a Windows thumbnail cache and a Word lock/owner file.
Those were audited and documented as non-learning-content files. See
`POTASSIUM_SOURCE_AUDIT.md`.

## Folder map

```text
bardia-ai-mvp/
├── backend/
│   ├── engine.py        # Local content analysis and generation rules
│   ├── parsers.py       # PDF, PPTX, DOCX and text extraction
│   ├── server.py        # Small local HTTP service
│   └── requirements.txt
├── src/
│   ├── App.jsx          # Trainer, learner, analytics and workflow interfaces
│   ├── PotassiumLearner.jsx # Flagship adaptive learner module
│   ├── localEngine.js   # Frontend connection and text fallback
│   ├── sampleData.js    # Cached source-grounded demo result
│   ├── styles.css
│   └── main.jsx
├── CONTRIBUTION.md
├── DEMO_SCRIPT.md
├── POTASSIUM_SOURCE_AUDIT.md
└── package.json
```

## Safety and privacy direction

- Source-only generation is the intended production mode.
- AI-generated material remains a draft until a trainer approves it.
- Every generated object should preserve page/slide references.
- Uploaded content is processed locally in this MVP.
- The sample analytics are fictional demonstration records and contain no real
  learner information.
