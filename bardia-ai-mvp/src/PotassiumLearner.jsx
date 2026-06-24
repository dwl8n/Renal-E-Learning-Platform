import { useEffect, useMemo, useState } from 'react';
import {
  REMEDIATION_PACKS,
  SAMPLE_FLASHCARDS,
  SAMPLE_FLOW,
  SAMPLE_QUIZ,
} from './sampleData';

const LEARNER_SECTIONS = [
  ['overview', 'Source package', 'home'],
  ['safety', 'Safety gate', 'shield'],
  ['decision', 'Decision lab', 'target'],
  ['flow', 'Change sequence', 'workflow'],
  ['documentation', 'Documentation', 'file'],
  ['nutrition', 'Nutrition coaching', 'book'],
  ['cards', 'Flashcards', 'cards'],
  ['quiz', 'Assessment', 'target'],
  ['weakness', 'Work on weakness', 'alert'],
];

const SOURCE_FILES = [
  {
    name: 'Potassium Protocol (Updated - WRHN).pptx',
    units: '24 slides',
    use: 'Directive purpose, draw triggers, exclusions, first/second change logic and documentation screenshots.',
  },
  {
    name: 'Extra potassium protocol practice questions.pptx',
    units: '8 slides',
    use: 'Worked clinical cases used to build scenario practice and diagnostic distractors.',
  },
  {
    name: 'Potassium Protocol Chart with Instructions (Updated).pdf',
    units: '2 pages',
    use: 'Official adjustment table, eligibility gate, critical notify thresholds and follow-up rules.',
  },
  {
    name: 'ORN Nutrition Fact Sheet - Potassium.pdf',
    units: '8 pages',
    use: 'Patient education: serving size, double-boiling, draining liquids, food choices and warnings.',
  },
];

const DECISION_CASES = [
  {
    id: 'jenny',
    name: 'Jenny',
    details: ['ICHD outpatient', '3x/week', 'Current prescription: 1K', 'Potassium: 4.8 mmol/L'],
    answer: 'No change. Current 1K with potassium 4.8–5.4 stays 1K.',
    source: 'Core deck · Slide 20',
  },
  {
    id: 'hannah',
    name: 'Hannah',
    details: ['ICHD outpatient', '3x/week', 'Current prescription: 1K', 'Routine potassium: 4.7 mmol/L'],
    answer: 'Initial temporary change to 3K for this run. Next treatment starts on prescribed 1K and repeats electrolytes.',
    source: 'Practice deck · Slides 3–4',
  },
  {
    id: 'gareth',
    name: 'Gareth',
    details: ['ICHD outpatient', '3x/week', 'Current prescription: 2K', 'Diarrhea', 'Potassium: 5.4 mmol/L'],
    answer: 'Eligible to draw/review, but table indicates no bath change: current 2K with 4.8–5.4 remains 2K.',
    source: 'Practice deck · Slide 2',
  },
  {
    id: 'kurtis',
    name: 'Kurtis',
    details: ['ICHD outpatient', '4x/week', 'Current prescription: 3K', 'Weakness + high-potassium foods', 'Potassium: 5.5 mmol/L'],
    answer: 'Do not use the adjustment table. Four-times-weekly dialysis fails the table eligibility gate; escalate to provider-directed care.',
    source: 'Practice deck · Slide 5',
  },
];

const DOCUMENTATION_STEPS = [
  {
    title: 'Written order for treatment',
    detail: 'Record the current potassium, the acid/concentrate change and the plan to reassess next run.',
    image: '/assets/potassium/day-hemo-order.png',
    source: 'Core deck · Slides 14–15',
  },
  {
    title: 'Observation checkbox',
    detail: 'Mark the Bath Changed observation so the actual treatment state is visible in the record.',
    image: '/assets/potassium/bath-changed.png',
    source: 'Core deck · Slide 16',
  },
  {
    title: 'Progress note',
    detail: 'Use the Potassium Protocol progress-note template so the rationale and next step are auditable.',
    image: '/assets/potassium/progress-note.png',
    source: 'Core deck · Slide 17',
  },
  {
    title: 'Follow-up electrolytes',
    detail: 'Place the K Protocol Follow Up Lytes directive/order for the next treatment when required.',
    image: '/assets/potassium/follow-up-lytes.png',
    source: 'Core deck · Slide 18',
  },
];

const NUTRITION_TABS = [
  {
    id: 'principles',
    title: 'Principles',
    bullets: [
      'Potassium helps nerves, muscles and heartbeat; severe high or low levels can be dangerous.',
      'Restriction is based on blood levels, kidney function, medication and dialysis schedule—not a one-size-fits-all ban.',
      'Serving size matters even when a food is described as lower potassium.',
      'Completing dialysis treatments helps remove potassium between sessions.',
    ],
    image: '/assets/potassium/patient.png',
    source: 'ORN nutrition fact sheet · Pages 2–3',
  },
  {
    id: 'double-boil',
    title: 'Double-boil',
    bullets: [
      'Peel, cut small, boil in plenty of water, drain, add fresh water, boil again and drain.',
      'Double-boiling can lower potassium in root vegetables, but does not make portions unlimited.',
      'Discard liquid from canned, cooked or frozen vegetables because potassium can move into the liquid.',
    ],
    image: '/assets/potassium/double-boil-guide.png',
    source: 'ORN nutrition fact sheet · Page 4',
  },
  {
    id: 'food-choices',
    title: 'Food choices',
    bullets: [
      'Choose examples include apples, berries, grapes, pineapple, white rice, pasta and drained/boiled vegetables.',
      'Limit or avoid examples include banana, orange, avocado, tomato juice, potatoes unless prepared properly, legumes, chocolate, nuts and potassium salt substitutes.',
      'Grapefruit may interact with medications, and starfruit can be toxic for people with kidney disease.',
    ],
    image: '/assets/potassium/food-choices.png',
    source: 'ORN nutrition fact sheet · Pages 5–8',
  },
];

function seedMistake() {
  return {
    id: 'seed-first-second',
    topic: 'First vs second change',
    question: 'Trainer-seeded example: a learner treated the first indicated bath change as permanent.',
    selected: 'Update the standing order immediately after the first result.',
    correct: 'First change is temporary; only the second consecutive indicated change becomes ongoing.',
    source: 'Core deck · Slides 11–12; protocol chart · Page 2',
    diagnostic: {
      misconception: 'Confused “change for the rest of this treatment” with “change the ongoing prescription.”',
      coaching: 'Think of the protocol as a two-run confirmation: first run is temporary, next run starts on the prescribed bath, then a repeated indication can become ongoing.',
      visual: '/assets/potassium/follow-up-lytes.png',
    },
  };
}

export default function LearnerExperience({ module, learner, exitLabel, onExit }) {
  const [section, setSection] = useState('overview');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [caseIndex, setCaseIndex] = useState(0);
  const [caseRevealed, setCaseRevealed] = useState(false);
  const [docStep, setDocStep] = useState(0);
  const [nutritionTab, setNutritionTab] = useState('principles');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mistakes, setMistakes] = useState(() => [seedMistake()]);
  const [activeWeakness, setActiveWeakness] = useState('First vs second change');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [section]);

  const quiz = module.quiz || SAMPLE_QUIZ;
  const flashcards = module.flashcards || SAMPLE_FLASHCARDS;
  const flow = module.flow?.length ? module.flow : SAMPLE_FLOW;
  const analysis = module.analysis;
  const currentQuestion = quiz[questionIndex];
  const currentCase = DECISION_CASES[caseIndex];
  const currentDoc = DOCUMENTATION_STEPS[docStep];
  const nutrition = NUTRITION_TABS.find((tab) => tab.id === nutritionTab) || NUTRITION_TABS[0];
  const activeMistake = mistakes.find((mistake) => mistake.topic === activeWeakness) || mistakes[0];
  const sectionIndex = Math.max(LEARNER_SECTIONS.findIndex(([id]) => id === section), 0);
  const progress = showResults ? 100 : Math.round((sectionIndex / (LEARNER_SECTIONS.length - 1)) * 100);

  const score = useMemo(
    () => Object.entries(answers).filter(([index, value]) => quiz[Number(index)]?.correct === value).length,
    [answers, quiz],
  );

  const topicResults = useMemo(() => {
    const totals = {};
    quiz.forEach((question, index) => {
      totals[question.topic] ||= { correct: 0, total: 0 };
      totals[question.topic].total += 1;
      if (answers[index] === question.correct) totals[question.topic].correct += 1;
    });
    return Object.entries(totals).map(([topic, value]) => ({
      topic,
      score: Math.round((value.correct / value.total) * 100),
    }));
  }, [answers, quiz]);

  function recordMistake(question, selectedIndex) {
    if (selectedIndex === question.correct) return;
    const nextMistake = {
      id: `${question.id}-${selectedIndex}-${Date.now()}`,
      topic: question.topic,
      question: question.question,
      selected: question.options[selectedIndex] || 'No answer selected',
      correct: question.options[question.correct],
      source: question.source,
      diagnostic: question.diagnostic,
    };
    setMistakes((current) => [
      nextMistake,
      ...current.filter((mistake) => mistake.topic !== question.topic),
    ].slice(0, 8));
    setActiveWeakness(question.topic);
  }

  function completeWeakness(topic) {
    setMistakes((current) => {
      const remaining = current.filter((mistake) => mistake.topic !== topic);
      setActiveWeakness(remaining[0]?.topic || '');
      return remaining;
    });
  }

  return (
    <div className="learner-shell">
      <header className="learner-topbar">
        <div className="learner-brand"><BrandMark /><strong>LearningForge</strong></div>
        <div className="learner-module-title">
          <span>Potassium Protocol flagship module</span>
          <strong>{analysis.title}</strong>
        </div>
        <div className="learner-user">
          <button className="btn btn--ghost btn--small" onClick={onExit}><Icon name="swap" /> {exitLabel}</button>
          <span>{learner.initials}</span>
        </div>
      </header>

      <aside className="learner-sidebar">
        <div className="learner-progress">
          <div><span>Module progress</span><strong>{progress}%</strong></div>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>
        <nav>
          {LEARNER_SECTIONS.map(([id, label, icon], index) => (
            <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>
              <span>{index < sectionIndex || showResults ? '✓' : <Icon name={icon} />}</span>
              {label}
              {id === 'weakness' && mistakes.length > 0 && <em>{mistakes.length}</em>}
            </button>
          ))}
        </nav>
        <div className="learner-sidebar__source">
          <Icon name="shield" />
          <strong>Source-grounded</strong>
          <span>Every decision, quiz and remediation card points back to the approved source package.</span>
        </div>
      </aside>

      <main className="learner-content">
        {section === 'overview' && (
          <div className="learner-page">
            <section className="module-hero potassium-hero">
              <div className="potassium-hero__copy">
                <span className="content-type">Generated from 4 source files</span>
                <h1>{analysis.title}</h1>
                <p>{analysis.description}</p>
                <div>
                  <span><Icon name="clock" /> {analysis.estimatedMinutes} minutes</span>
                  <span><Icon name="target" /> {analysis.objectives.length} objectives</span>
                  <span><Icon name="cards" /> {quiz.length} diagnostic questions</span>
                </div>
                <button className="btn btn--primary" onClick={() => setSection('safety')}>Begin module <Icon name="arrow" /></button>
              </div>
              <div className="source-showcase">
                <img src="/assets/potassium/adjustment-table.png" alt="Potassium adjustment table" />
                <img src="/assets/potassium/dialysis-machine.png" alt="Dialysis machine illustration from source deck" />
              </div>
            </section>

            <section className="learner-card">
              <Subheading title="Everything the AI used" />
              <div className="source-package-list">
                {SOURCE_FILES.map((file) => (
                  <article key={file.name}>
                    <strong>{file.name}</strong>
                    <span>{file.units}</span>
                    <p>{file.use}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="learner-card">
              <Subheading title="Objectives generated from the source package" />
              <div className="learner-objectives">
                {analysis.objectives.map((objective, index) => (
                  <div key={objective.id}>
                    <span>{index + 1}</span>
                    <p>{objective.text}<small>{objective.source}</small></p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {section === 'safety' && (
          <div className="learner-page learner-reading">
            <div className="lesson-heading">
              <span>01 · SAFETY GATE</span>
              <h1>Before the table: should this nurse use the protocol?</h1>
              <p>The safest mistake to prevent is applying the potassium number before checking whether the patient qualifies.</p>
            </div>

            <section className="learner-card safety-hero">
              <div>
                <h2>Draw or review electrolytes when the clinical picture changes</h2>
                <p>
                  The source deck highlights acute vomiting, weakness, diarrhea, palpitations, missed or shortened treatments,
                  recent high-potassium dietary nonadherence and unusual acute weight change as triggers for pre-dialysis electrolytes.
                </p>
                <SourceTag value="Core deck · Slides 4, 7–8" />
              </div>
              <img src="/assets/potassium/patient.png" alt="Patient education illustration" />
            </section>

            <div className="critical-strip">
              <Icon name="alert" />
              <div>
                <strong>Immediate provider notification</strong>
                <span>Potassium below 3.0 mmol/L or above 6.5 mmol/L must be reported, even when the table also gives an action.</span>
              </div>
            </div>

            <section className="learner-card">
              <Subheading title="Five checks before using the adjustment table" />
              <div className="eligibility-grid">
                {[
                  'Outpatient in-centre hemodialysis',
                  'Dialyzes exactly three times weekly',
                  'Has a chronic HD order',
                  'No ileostomy',
                  'No active provider exclusion/removal order',
                ].map((item) => (
                  <div key={item}><Icon name="check" /><span>{item}</span></div>
                ))}
              </div>
              <div className="callout callout--teal">
                <Icon name="info" />
                <p><strong>Teaching point:</strong> satellites, inpatients, four-times-weekly schedules and provider-excluded patients need a provider-directed plan rather than automatic table adjustment.</p>
              </div>
              <SourceTag value="Protocol chart · Page 2; core deck · Slides 4–5" />
            </section>
            <LessonNav back={() => setSection('overview')} next={() => setSection('decision')} nextLabel="Open decision lab" />
          </div>
        )}

        {section === 'decision' && (
          <div className="learner-page">
            <div className="lesson-heading">
              <span>02 · DECISION LAB</span>
              <h1>Use the table like a two-axis clinical calculator</h1>
              <p>First choose the patient’s current prescription column, then the serum potassium row.</p>
            </div>

            <div className="decision-lab-grid">
              <section className="learner-card case-picker">
                <Subheading title="Choose a worked case" />
                {DECISION_CASES.map((item, index) => (
                  <button
                    key={item.id}
                    className={caseIndex === index ? 'active' : ''}
                    onClick={() => {
                      setCaseIndex(index);
                      setCaseRevealed(false);
                    }}
                  >
                    <strong>{item.name}</strong>
                    <span>{item.details.slice(-2).join(' · ')}</span>
                  </button>
                ))}
              </section>

              <section className="learner-card decision-stage">
                <span className="content-type">Worked source case</span>
                <h2>{currentCase.name}</h2>
                <div className="case-vitals">
                  {currentCase.details.map((detail) => <span key={detail}>{detail}</span>)}
                </div>
                <img src="/assets/potassium/adjustment-table.png" alt="Official potassium adjustment table" />
                {!caseRevealed ? (
                  <button className="btn btn--primary" onClick={() => setCaseRevealed(true)}>Reveal protocol decision</button>
                ) : (
                  <div className="decision-answer">
                    <Icon name="check" />
                    <div>
                      <strong>Protocol decision</strong>
                      <p>{currentCase.answer}</p>
                      <SourceTag value={currentCase.source} />
                    </div>
                  </div>
                )}
              </section>
            </div>
            <LessonNav back={() => setSection('safety')} next={() => setSection('flow')} nextLabel="Continue to change sequence" />
          </div>
        )}

        {section === 'flow' && (
          <div className="learner-page">
            <div className="lesson-heading">
              <span>03 · PROCESS FLOW</span>
              <h1>Temporary first change, ongoing second consecutive change</h1>
              <p>This is the part learners often blur. The module turns it into a visible treatment-to-treatment timeline.</p>
            </div>

            <div className="learning-flow">
              {flow.map((step, index) => (
                <div className="learning-flow__step" key={step.step}>
                  <span className="learning-flow__number">{step.step}</span>
                  <article>
                    <span className="content-type">{step.role}</span>
                    <h2>{step.title}</h2>
                    <p>{step.body}</p>
                    <div><Icon name="check" /><span><strong>Complete when:</strong> {step.completion}</span></div>
                    <SourceTag value={step.source} />
                  </article>
                  {index < flow.length - 1 && <div className="learning-flow__arrow"><Icon name="arrowDown" /></div>}
                </div>
              ))}
            </div>

            <section className="learner-card sequence-memory">
              <Subheading title="Memory hook" />
              <div><strong>1st indicated change</strong><span>Temporary for the remainder of today’s run.</span></div>
              <div><strong>Next run</strong><span>Start on the prescribed bath again and repeat electrolytes.</span></div>
              <div><strong>2nd consecutive indicated change</strong><span>Now update the ongoing order.</span></div>
            </section>
            <LessonNav back={() => setSection('decision')} next={() => setSection('documentation')} nextLabel="Document it" />
          </div>
        )}

        {section === 'documentation' && (
          <div className="learner-page">
            <div className="lesson-heading">
              <span>04 · DOCUMENTATION WALKTHROUGH</span>
              <h1>The source deck becomes a screenshot simulation</h1>
              <p>The MVP uses the real screenshots as guided practice objects, which is exactly the kind of transformation the final product should automate.</p>
            </div>

            <div className="documentation-layout">
              <section className="learner-card documentation-steps">
                {DOCUMENTATION_STEPS.map((step, index) => (
                  <button key={step.title} className={docStep === index ? 'active' : ''} onClick={() => setDocStep(index)}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <small>{step.source}</small>
                    </div>
                  </button>
                ))}
                <div className="documentation-note">
                  <Icon name="shield" />
                  <p>Trainer view can see exactly which documentation concept the learner missed and assign focused retesting.</p>
                </div>
              </section>

              <section className="learner-card documentation-preview">
                <img src={currentDoc.image} alt={currentDoc.title} />
                <h2>{currentDoc.title}</h2>
                <p>{currentDoc.detail}</p>
                <SourceTag value={currentDoc.source} />
              </section>
            </div>
            <LessonNav back={() => setSection('flow')} next={() => setSection('nutrition')} nextLabel="Coach the patient" />
          </div>
        )}

        {section === 'nutrition' && (
          <div className="learner-page">
            <div className="lesson-heading">
              <span>05 · PATIENT COACHING</span>
              <h1>Translate the protocol into education the patient can act on</h1>
              <p>The nutrition fact sheet becomes a coaching card, visual, and quiz category.</p>
            </div>

            <section className="learner-card nutrition-tabs">
              <div>
                {NUTRITION_TABS.map((tab) => (
                  <button key={tab.id} className={nutritionTab === tab.id ? 'active' : ''} onClick={() => setNutritionTab(tab.id)}>
                    {tab.title}
                  </button>
                ))}
              </div>
              <div className="nutrition-principles">
                <div>
                  <span className="content-type">{nutrition.title}</span>
                  <h2>{nutrition.title === 'Double-boil' ? 'Prepare foods in a way that reduces potassium' : nutrition.title}</h2>
                  <ul>
                    {nutrition.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                  <SourceTag value={nutrition.source} />
                </div>
                <img className="nutrition-source-visual" src={nutrition.image} alt={`${nutrition.title} source visual`} />
              </div>
              <div className="nutrition-warning">
                <Icon name="alert" />
                <span>Patient education is supportive. Clinical potassium management still follows bloodwork, dialysis adequacy and provider direction.</span>
              </div>
            </section>
            <LessonNav back={() => setSection('documentation')} next={() => setSection('cards')} nextLabel="Review flashcards" />
          </div>
        )}

        {section === 'cards' && (
          <div className="learner-page">
            <div className="lesson-heading">
              <span>06 · ACTIVE RECALL</span>
              <h1>Flashcard review</h1>
              <p>Each card is source-linked so a trainer can audit where it came from.</p>
            </div>
            <div className="learner-flashcard-wrap">
              <div className="card-counter">Card {cardIndex + 1} of {flashcards.length}</div>
              <button className={`learner-flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((value) => !value)}>
                <div className="learner-flashcard__inner">
                  <div className="learner-flashcard__face">
                    <span>{flashcards[cardIndex].topic}</span>
                    <h2>{flashcards[cardIndex].front}</h2>
                    <small><Icon name="repeat" /> Click to reveal</small>
                  </div>
                  <div className="learner-flashcard__face learner-flashcard__back">
                    <span>Answer</span>
                    <p>{flashcards[cardIndex].back}</p>
                    <SourceTag value={flashcards[cardIndex].source} />
                    <small><Icon name="repeat" /> Click to see question</small>
                  </div>
                </div>
              </button>
              <div className="flashcard-controls">
                <button className="btn btn--ghost" disabled={cardIndex === 0} onClick={() => { setCardIndex((value) => value - 1); setFlipped(false); }}><Icon name="arrowLeft" /> Previous</button>
                <div>{flashcards.map((card, index) => <button key={card.id} className={index === cardIndex ? 'active' : ''} onClick={() => { setCardIndex(index); setFlipped(false); }} />)}</div>
                <button className="btn btn--primary" onClick={() => {
                  if (cardIndex < flashcards.length - 1) {
                    setCardIndex((value) => value + 1);
                    setFlipped(false);
                  } else {
                    setSection('quiz');
                  }
                }}>{cardIndex < flashcards.length - 1 ? <>Next <Icon name="arrow" /></> : <>Start assessment <Icon name="arrow" /></>}</button>
              </div>
            </div>
          </div>
        )}

        {section === 'quiz' && (
          <div className="learner-page">
            {!showResults ? (
              <>
                <div className="quiz-progress">
                  <div><span>Diagnostic assessment</span><strong>Question {questionIndex + 1} of {quiz.length}</strong></div>
                  <div><i style={{ width: `${((questionIndex + 1) / quiz.length) * 100}%` }} /></div>
                </div>
                <section className="learner-card learner-quiz">
                  <span className="content-type">{currentQuestion.topic}</span>
                  <h1>{currentQuestion.question}</h1>
                  <div className="learner-options">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={option}
                        className={[
                          answers[questionIndex] === index ? 'selected' : '',
                          submitted && index === currentQuestion.correct ? 'correct' : '',
                          submitted && answers[questionIndex] === index && index !== currentQuestion.correct ? 'wrong' : '',
                        ].filter(Boolean).join(' ')}
                        disabled={submitted}
                        onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [questionIndex]: index }))}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        <p>{option}</p>
                        {submitted && index === currentQuestion.correct && <Icon name="check" />}
                      </button>
                    ))}
                  </div>
                  {submitted && (
                    <>
                      <div className={`answer-feedback ${answers[questionIndex] === currentQuestion.correct ? 'answer-feedback--correct' : ''}`}>
                        <Icon name={answers[questionIndex] === currentQuestion.correct ? 'check' : 'alert'} />
                        <div>
                          <strong>{answers[questionIndex] === currentQuestion.correct ? 'Correct' : 'Not quite'}</strong>
                          <p>{currentQuestion.explanation}</p>
                          <SourceTag value={currentQuestion.source} />
                        </div>
                      </div>
                      {answers[questionIndex] !== currentQuestion.correct && currentQuestion.diagnostic && (
                        <div className="diagnostic-feedback">
                          <strong>Added to Work on Weakness</strong>
                          <p>{currentQuestion.diagnostic.coaching}</p>
                          <button className="text-btn" onClick={() => setSection('weakness')}>Open targeted practice</button>
                        </div>
                      )}
                    </>
                  )}
                  <div className="quiz-actions">
                    {!submitted ? (
                      <button
                        className="btn btn--primary"
                        disabled={answers[questionIndex] === undefined}
                        onClick={() => {
                          recordMistake(currentQuestion, answers[questionIndex]);
                          setSubmitted(true);
                        }}
                      >
                        Check answer
                      </button>
                    ) : (
                      <button className="btn btn--primary" onClick={() => {
                        if (questionIndex < quiz.length - 1) {
                          setQuestionIndex((value) => value + 1);
                          setSubmitted(false);
                        } else {
                          setShowResults(true);
                        }
                      }}>{questionIndex < quiz.length - 1 ? <>Next question <Icon name="arrow" /></> : <>View my results <Icon name="arrow" /></>}</button>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <LearnerResults
                score={score}
                total={quiz.length}
                topics={topicResults}
                mistakes={mistakes}
                onReturn={onExit}
                returnLabel={exitLabel}
                onWeakness={() => setSection('weakness')}
                onRetry={() => {
                  setAnswers({});
                  setQuestionIndex(0);
                  setSubmitted(false);
                  setShowResults(false);
                }}
              />
            )}
          </div>
        )}

        {section === 'weakness' && (
          <WeaknessWorkspace
            mistakes={mistakes}
            activeMistake={activeMistake}
            activeTopic={activeWeakness}
            onSelect={setActiveWeakness}
            onComplete={completeWeakness}
            onAssessment={() => {
              setSection('quiz');
              setShowResults(false);
            }}
          />
        )}
      </main>
    </div>
  );
}

function WeaknessWorkspace({ mistakes, activeMistake, activeTopic, onSelect, onComplete, onAssessment }) {
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const pack = REMEDIATION_PACKS[activeMistake?.topic] || REMEDIATION_PACKS[activeTopic];

  useEffect(() => {
    setPracticeAnswers({});
    setChecked(false);
  }, [activeMistake?.topic]);

  if (!mistakes.length || !activeMistake || !pack) {
    return (
      <div className="learner-page">
        <section className="learner-card weakness-empty">
          <Icon name="check" />
          <h1>No active weakness card</h1>
          <p>When a learner misses a diagnostic question, the system creates a focused remediation path here and mirrors the evidence to the trainer tab.</p>
          <button className="btn btn--primary" onClick={onAssessment}>Take assessment <Icon name="arrow" /></button>
        </section>
      </div>
    );
  }

  const correctCount = pack.checks.filter((check, index) => practiceAnswers[index] === check.correct).length;
  const passed = checked && correctCount === pack.checks.length;

  return (
    <div className="learner-page">
      <div className="lesson-heading">
        <span>ADAPTIVE REMEDIATION</span>
        <h1>Work on weakness: {activeMistake.topic}</h1>
        <p>This tab shows what a real AI tutor would do after an error: diagnose the misconception, reteach with the source, then retest narrowly.</p>
      </div>

      <div className="weakness-layout">
        <aside className="learner-card weakness-list">
          <Subheading title="Detected weakness cards" count={mistakes.length} />
          {mistakes.map((mistake) => (
            <button key={mistake.id} className={mistake.topic === activeMistake.topic ? 'active' : ''} onClick={() => onSelect(mistake.topic)}>
              <strong>{mistake.topic}</strong>
              <span>{mistake.source}</span>
            </button>
          ))}
        </aside>

        <section className="learner-card weakness-main">
          <div className="misconception-card">
            <span className="content-type">Learner evidence</span>
            <h2>{activeMistake.question}</h2>
            <div className="misconception-diagnosis">
              <div><strong>Selected</strong><p>{activeMistake.selected}</p></div>
              <div><strong>Correct</strong><p>{activeMistake.correct}</p></div>
            </div>
            <div className="callout callout--teal">
              <Icon name="info" />
              <p><strong>Diagnosis:</strong> {activeMistake.diagnostic?.misconception || pack.summary}</p>
            </div>
            <SourceTag value={activeMistake.source} />
          </div>

          <div className="remediation-explainer">
            <div>
              <span className="content-type">{pack.title}</span>
              <h2>{pack.summary}</h2>
              <p>{pack.principle}</p>
              <SourceTag value={pack.source} />
            </div>
            {pack.visual && <img src={pack.visual} alt={`${pack.title} source visual`} />}
          </div>

          <div className="focused-practice">
            <Subheading title="Focused retest" />
            {pack.checks.map((check, index) => {
              const isCorrect = practiceAnswers[index] === check.correct;
              return (
                <article className="focused-question" key={check.question}>
                  <h3>{index + 1}. {check.question}</h3>
                  <div>
                    {check.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        className={[
                          practiceAnswers[index] === optionIndex ? 'selected' : '',
                          checked && optionIndex === check.correct ? 'correct' : '',
                          checked && practiceAnswers[index] === optionIndex && !isCorrect ? 'wrong' : '',
                        ].filter(Boolean).join(' ')}
                        disabled={checked}
                        onClick={() => setPracticeAnswers((current) => ({ ...current, [index]: optionIndex }))}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {checked && (
                    <p className={isCorrect ? 'practice-correct' : 'practice-wrong'}>
                      {isCorrect ? 'Correct.' : 'Review this point.'} {check.explanation}
                    </p>
                  )}
                </article>
              );
            })}
            {passed && (
              <div className="mastery-confirmed">
                <Icon name="check" />
                <span>Focused retest passed. This weakness can be marked complete for the learner and shown to the trainer as resolved.</span>
              </div>
            )}
            <div className="quiz-actions">
              {!checked ? (
                <button
                  className="btn btn--primary"
                  disabled={Object.keys(practiceAnswers).length < pack.checks.length}
                  onClick={() => setChecked(true)}
                >
                  Check focused practice
                </button>
              ) : (
                <>
                  <button className="btn btn--ghost" onClick={() => { setPracticeAnswers({}); setChecked(false); }}><Icon name="repeat" /> Try again</button>
                  <button className="btn btn--primary" disabled={!passed} onClick={() => onComplete(activeMistake.topic)}>Mark weakness complete <Icon name="check" /></button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LearnerResults({ score, total, topics, mistakes, onReturn, returnLabel, onRetry, onWeakness }) {
  const percent = Math.round((score / total) * 100);
  const strengths = topics.filter((topic) => topic.score >= 80);
  const weaknesses = topics.filter((topic) => topic.score < 80);
  return (
    <div className="results-page">
      <div className="results-hero">
        <RingScore value={percent} large />
        <div>
          <span>{percent >= 80 ? 'Module mastered' : 'Review recommended'}</span>
          <h1>{score} of {total} correct</h1>
          <p>Your answers were converted into topic-level strengths, weaknesses and trainer-visible evidence.</p>
        </div>
      </div>

      <div className="results-grid">
        <section className="learner-card">
          <Subheading title="Topic performance" />
          <div className="mastery-list">
            {topics.map((topic) => (
              <div key={topic.topic}>
                <span>{topic.topic}</span>
                <div><i className={topic.score < 60 ? 'low' : topic.score < 80 ? 'medium' : ''} style={{ width: `${topic.score}%` }} /></div>
                <strong>{topic.score}%</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="learner-card results-insights">
          <div>
            <h3><Icon name="strength" /> Your strengths</h3>
            {(strengths.length ? strengths : [{ topic: 'Keep practising to establish a strength' }]).map((topic) => <span key={topic.topic}>{topic.topic}</span>)}
          </div>
          <div>
            <h3><Icon name="alert" /> Review next</h3>
            {(weaknesses.length ? weaknesses : mistakes.map((mistake) => ({ topic: mistake.topic }))).slice(0, 4).map((topic) => <span key={topic.topic}>{topic.topic}</span>)}
          </div>
        </section>
      </div>
      <section className="learner-card personalized-next">
        <Icon name="sparkles" />
        <div>
          <span>RECOMMENDED NEXT STEP</span>
          <h2>{mistakes.length ? `Open Work on Weakness for ${mistakes[0].topic}.` : 'Continue to the next orientation module.'}</h2>
          <p>The recommendation is explainable from the mistake evidence and topic scores shown above.</p>
        </div>
      </section>
      <div className="results-actions">
        <button className="btn btn--ghost" onClick={onRetry}><Icon name="repeat" /> Retry quiz</button>
        <button className="btn btn--primary" disabled={!mistakes.length} onClick={onWeakness}>Work on weakness <Icon name="arrow" /></button>
        <button className="btn btn--ghost" onClick={onReturn}>{returnLabel}</button>
      </div>
    </div>
  );
}

function LessonNav({ back, next, nextLabel }) {
  return (
    <div className="lesson-nav">
      <button className="btn btn--ghost" onClick={back}>Back</button>
      <button className="btn btn--primary" onClick={next}>{nextLabel} <Icon name="arrow" /></button>
    </div>
  );
}

function Subheading({ title, count }) {
  return <div className="subheading"><h3>{title}</h3>{count !== undefined && <span>{count}</span>}</div>;
}

function SourceTag({ value }) {
  return <span className="source-tag"><Icon name="link" /> {value}</span>;
}

function RingScore({ value, large }) {
  return (
    <div className={`ring-score ${large ? 'ring-score--large' : ''}`} style={{ '--score': value }}>
      <div><strong>{value}%</strong>{large && <span>score</span>}</div>
    </div>
  );
}

function BrandMark({ large }) {
  return (
    <span className={`brand-mark ${large ? 'brand-mark--large' : ''}`}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M11 8.5C16.5 9 19.2 13 20 18c.8-5 3.5-9 9-9.5-1 5.4-4.2 8-9 8.7 4.8.7 8 3.3 9 8.7-5.5-.5-8.2-4.5-9-9.5-.8 5-3.5 9-9 9.5 1-5.4 4.2-8 9-8.7-4.8-.7-8-3.3-9-8.7Z" />
        <circle cx="20" cy="20" r="2.4" />
      </svg>
    </span>
  );
}

function Icon({ name }) {
  const paths = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    workflow: <><rect x="3" y="3" width="6" height="5" rx="1" /><rect x="15" y="16" width="6" height="5" rx="1" /><rect x="15" y="3" width="6" height="5" rx="1" /><path d="M9 5.5h6M18 8v8M9 5.5v13h6" /></>,
    cards: <><rect x="3" y="5" width="14" height="16" rx="2" /><path d="m7 5 2-3h10a2 2 0 0 1 2 2v13l-4 2" /></>,
    alert: <><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    arrowLeft: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    arrowDown: <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    repeat: <><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
    swap: <><path d="M7 7h14l-4-4M17 17H3l4 4" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></>,
    sparkles: <><path d="m12 3 1.2 3.2L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.3L12 3Z" /><path d="m18.5 13 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" /></>,
    strength: <><path d="M7 11V5a2 2 0 0 1 4 0v5M11 10V3a2 2 0 0 1 4 0v7M15 10V5a2 2 0 0 1 4 0v8c0 5-3 9-8 9s-8-4-8-9v-2a2 2 0 0 1 4 0Z" /></>,
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.info}
    </svg>
  );
}
