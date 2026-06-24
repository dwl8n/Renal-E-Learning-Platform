import { useMemo, useState } from 'react';
import { useApp } from '../context';
import { MOCK_USERS, STUDENT_SNAPSHOTS, LEVEL_THRESHOLDS } from '../context';
import { ASSESSMENT_QUESTIONS, QUESTS } from '../data';
import './AdminDashboard.css';

const QUEST_LIST = Object.values(QUESTS);
const TOTAL_QUESTS = QUEST_LIST.length;
const ASSESSMENT_TOTAL = ASSESSMENT_QUESTIONS.length;

const TRAINER_TABS = [
  ['overview', 'Overview'],
  ['learners', 'Learners'],
  ['quests', 'Quest controls'],
  ['lessons', 'Lesson data'],
  ['builder', 'AI builder'],
];

const POTASSIUM_SOURCE_PACKAGE = [
  {
    name: 'Potassium Protocol (Updated - WRHN).pptx',
    type: '24 slides',
    use: 'Core directive, draw triggers, exclusion logic, first/second change rules and documentation screenshots.',
  },
  {
    name: 'Extra potassium protocol practice questions.pptx',
    type: '8 slides',
    use: 'Worked clinical cases for diagnostic distractors and trainer-assigned practice.',
  },
  {
    name: 'Potassium Protocol Chart with Instructions (Updated).pdf',
    type: '2 pages',
    use: 'Official adjustment table, eligibility gate, critical values and follow-up instructions.',
  },
  {
    name: 'ORN Nutrition Fact Sheet - Potassium.pdf',
    type: '8 pages',
    use: 'Patient coaching, serving-size guidance, double-boiling and food substitution advice.',
  },
];

const AI_DRAFT_ARTIFACTS = [
  {
    id: 'source-map',
    kind: 'Source map',
    title: 'Map all source files to the existing Potassium Protocol quest',
    source: 'All four substantive files',
    trainerControl: 'Review / exclude file evidence before publishing',
  },
  {
    id: 'eligibility-gate',
    kind: 'Micro-lesson',
    title: 'Eligibility gate before using the adjustment table',
    source: 'Protocol chart · Page 2',
    trainerControl: 'Assign to students who apply potassium value before checking criteria',
  },
  {
    id: 'decision-lab',
    kind: 'Practice lab',
    title: 'Potassium table worked cases',
    source: 'Practice deck · Slides 2–8',
    trainerControl: 'Add/remove cases and decide whether they are formative or graded',
  },
  {
    id: 'change-flow',
    kind: 'Flowchart',
    title: 'Temporary first change → next-run repeat → ongoing second change',
    source: 'Core deck · Slides 11–12',
    trainerControl: 'Require remediation when the first/second change sequence is missed',
  },
  {
    id: 'documentation-walkthrough',
    kind: 'Screenshot walkthrough',
    title: 'Day Hemo Order, Bath Changed, progress note and follow-up lytes',
    source: 'Core deck · Slides 14–18',
    trainerControl: 'Turn documentation screenshots into checklist practice',
  },
  {
    id: 'nutrition-coaching',
    kind: 'Patient coaching',
    title: 'Double-boiling, draining liquids, serving size and food choices',
    source: 'ORN nutrition fact sheet · Pages 2–8',
    trainerControl: 'Optional patient-education add-on, removable by trainer',
  },
  {
    id: 'weakness-tab',
    kind: 'Adaptive remediation',
    title: 'Work on weakness: diagnosed misconception + focused retest',
    source: 'Quiz diagnostics',
    trainerControl: 'Trainer can assign, clear, or reassign remediation packs',
  },
];

const POTASSIUM_LESSON_PACKAGE = {
  title: 'Potassium Protocol: Assess, Adjust, Document & Follow Up',
  audience: 'Hemodialysis nurses in orientation or annual review',
  minutes: 38,
  difficulty: 'Applied clinical practice',
  qualityScore: 96,
  sourceUpdated: 'March-June 2025',
  summary:
    'A source-grounded module that teaches when to draw electrolytes, who is eligible for the table, how to select the correct concentrate, how the first and second changes differ, what to document, and how to coach patients about dietary potassium.',
  objectives: [
    {
      id: 'obj-1',
      text: 'Recognize clinical changes that require pre-dialysis electrolytes and timely result review.',
      source: 'Core deck · Slides 4, 7-8',
    },
    {
      id: 'obj-2',
      text: 'Confirm every eligibility criterion before using the potassium adjustment table.',
      source: 'Protocol chart · Page 2',
    },
    {
      id: 'obj-3',
      text: 'Select the indicated 1K, 2K or 3K concentrate using the current prescription and serum potassium.',
      source: 'Protocol chart · Page 1',
    },
    {
      id: 'obj-4',
      text: 'Distinguish an initial temporary change from a second consecutive ongoing prescription change.',
      source: 'Core deck · Slides 11-12',
    },
    {
      id: 'obj-5',
      text: 'Complete the machine, order, observation, progress-note and follow-up documentation.',
      source: 'Core deck · Slides 14-18',
    },
    {
      id: 'obj-6',
      text: 'Give practical potassium nutrition coaching using serving size, preparation and safer substitutions.',
      source: 'ORN nutrition fact sheet · Pages 2-8',
    },
  ],
  sections: [
    {
      id: 'section-1',
      title: 'Why potassium decisions matter',
      type: 'Guided reading',
      minutes: 4,
      summary: 'Purpose, symptoms, draw triggers, lab handling and critical notification thresholds.',
      source: 'Core deck · Slides 3-8',
    },
    {
      id: 'section-2',
      title: 'The eligibility safety gate',
      type: 'Decision tree',
      minutes: 5,
      summary: 'Outpatient ICHD, exactly three treatments weekly, chronic order, no ileostomy and no provider exclusion.',
      source: 'Protocol chart · Page 2',
    },
    {
      id: 'section-3',
      title: 'Potassium decision lab',
      type: 'Interactive calculator',
      minutes: 7,
      summary: 'Apply the adjustment matrix to worked cases and explain why the selected concentrate is correct.',
      source: 'Protocol chart · Page 1; practice deck · Slides 2-8',
    },
    {
      id: 'section-4',
      title: 'Temporary to ongoing',
      type: 'Process flowchart',
      minutes: 5,
      summary: 'Follow the first indicated change, next-treatment reset and second consecutive permanent change.',
      source: 'Core deck · Slides 11-12',
    },
    {
      id: 'section-5',
      title: 'Document the decision',
      type: 'Screenshot walkthrough',
      minutes: 6,
      summary: 'Use authentic source screenshots to rehearse the required charting sequence.',
      source: 'Core deck · Slides 14-18',
    },
    {
      id: 'section-6',
      title: 'Coach the patient',
      type: 'Nutrition coaching',
      minutes: 5,
      summary: 'Connect serving size, draining liquids, treatment completion, double-boiling and food substitutions.',
      source: 'ORN nutrition fact sheet · Pages 2-8',
    },
    {
      id: 'section-7',
      title: 'Adaptive clinical assessment',
      type: 'Diagnostic assessment',
      minutes: 6,
      summary: 'Eight source-grounded questions generate topic-specific explanations and focused retesting.',
      source: 'All four learning sources',
    },
  ],
  flow: [
    {
      step: '01',
      role: 'Safety gate',
      title: 'Confirm table eligibility',
      body: 'Use the adjustment table only for an outpatient in-centre hemodialysis patient dialyzing three times weekly with a chronic order, no ileostomy and no active provider exclusion.',
      source: 'Protocol chart · Page 2',
    },
    {
      step: '02',
      role: 'Initial indicated change',
      title: 'Change the current run temporarily',
      body: 'Program the indicated concentrate for the remainder of the current treatment and complete all required documentation.',
      source: 'Core deck · Slide 11',
    },
    {
      step: '03',
      role: 'Follow-up result',
      title: 'Apply the table again',
      body: 'At the next treatment, use the new potassium result with the prescribed starting concentrate to decide whether the same change is indicated again.',
      source: 'Core deck · Slides 11-12',
    },
    {
      step: '04',
      role: 'Second consecutive change',
      title: 'Make the concentrate ongoing',
      body: 'When the follow-up result indicates the same change again, update the standing dialysis order and document the ongoing change.',
      source: 'Core deck · Slide 12',
    },
  ],
  visuals: [
    {
      title: 'Potassium concentrate adjustment matrix',
      format: 'Decision table',
      reason: 'The official matrix is the central clinical decision aid.',
      image: '/assets/potassium/adjustment-table.png',
    },
    {
      title: 'Can I use the protocol table?',
      format: 'Branching decision tree',
      reason: 'Five eligibility checks must be passed before the table can be used.',
    },
    {
      title: 'Initial change -> next run -> second consecutive change',
      format: 'Process timeline',
      reason: 'The directive changes what is temporary and what becomes the ongoing prescription.',
    },
    {
      title: 'Cerner and paper documentation walkthrough',
      format: 'Screenshot simulation',
      reason: 'Source screenshots become charting-sequence practice.',
      image: '/assets/potassium/bath-changed.png',
    },
    {
      title: 'Double-boiling and potassium food choices',
      format: 'Patient coaching visual',
      reason: 'The nutrition source contains illustrated preparation and substitution guidance.',
      image: '/assets/potassium/double-boil-guide.png',
    },
  ],
  documentation: [
    {
      title: 'Day Hemo / Current HD order',
      image: '/assets/potassium/day-hemo-order.png',
      detail: 'Update the order trail when the change becomes ongoing.',
    },
    {
      title: 'Bath Changed observation',
      image: '/assets/potassium/bath-changed.png',
      detail: 'Record the in-treatment bath change using the source screenshot cue.',
    },
    {
      title: 'Progress note',
      image: '/assets/potassium/progress-note.png',
      detail: 'Document the potassium protocol decision and clinical rationale.',
    },
    {
      title: 'Follow-up lytes',
      image: '/assets/potassium/follow-up-lytes.png',
      detail: 'Order repeat electrolytes for the next-treatment decision point.',
    },
  ],
  quiz: [
    {
      id: 'q-1',
      topic: 'Eligibility',
      question: 'Kurtis receives in-centre hemodialysis four times per week and has potassium 5.5. What is safest?',
      answer: 'Do not use the adjustment table because he is not on a three-times-weekly schedule.',
      weakness: 'Applied the potassium number before checking eligibility.',
      action: 'Assign safety-gate micro-lesson + 2 focused questions.',
    },
    {
      id: 'q-2',
      topic: 'Adjustment table',
      question: 'Jenny is eligible, currently prescribed 1K, and her potassium is 5.1. What does the table indicate?',
      answer: 'Remain on 1K.',
      weakness: 'Used the potassium range without following the current-prescription column.',
      action: 'Assign two-axis matrix reading drill.',
    },
    {
      id: 'q-3',
      topic: 'First vs second change',
      question: 'Hannah starts on prescribed 1K. Routine potassium is 4.7 and the table indicates 3K. What happens now?',
      answer: 'Use 3K for the remainder of this run; next run starts on 1K with repeat electrolytes.',
      weakness: 'Treated the first indicated change as an ongoing prescription.',
      action: 'Assign reset-and-recheck timeline.',
    },
    {
      id: 'q-4',
      topic: 'First vs second change',
      question: 'At the next treatment, Hannah starts on 1K and repeat potassium again indicates 3K. What now?',
      answer: 'Change to 3K as the ongoing prescription and update the standing order.',
      weakness: 'Missed when a repeated indication becomes ongoing.',
      action: 'Assign second-consecutive-change retest.',
    },
    {
      id: 'q-5',
      topic: 'Critical notification',
      question: 'A potassium result is 6.6. What must occur in addition to any table-directed response?',
      answer: 'Immediately notify the most responsible provider.',
      weakness: 'Blended table action with critical-result communication.',
      action: 'Assign critical-threshold check.',
    },
    {
      id: 'q-6',
      topic: 'Documentation',
      question: 'Which documentation item specifically records that the dialysis bath was changed during treatment?',
      answer: 'Observations: Bath Changed.',
      weakness: 'Chose a chart location that does not capture the protocol-specific bath change.',
      action: 'Assign screenshot walkthrough.',
    },
    {
      id: 'q-7',
      topic: 'Nutrition',
      question: 'Which patient statement best reflects the nutrition fact sheet?',
      answer: 'Double-boiling can lower potassium in root vegetables, but portion size still matters.',
      weakness: 'Treated preparation advice as permission to ignore portions.',
      action: 'Assign patient-coaching cards.',
    },
    {
      id: 'q-8',
      topic: 'Eligibility',
      question: 'Sean receives dialysis at a satellite site three times weekly and has potassium 5.4. May the nurse use the table?',
      answer: 'No; satellite patients are excluded from table-directed adjustment.',
      weakness: 'Checked treatment frequency but missed care-location exclusion.',
      action: 'Assign all-conditions eligibility drill.',
    },
  ],
  remediation: [
    {
      topic: 'Eligibility',
      title: 'Use the safety gate before the table',
      principle: 'The patient must pass every eligibility condition before any table cell is used.',
      checks: ['Which patient is eligible for the table?', 'An in-centre patient has an ileostomy. What should you do?'],
      visual: '/assets/potassium/adjustment-table.png',
    },
    {
      topic: 'Adjustment table',
      title: 'Read the matrix on two axes',
      principle: 'Find the result row first, then trace across the patient’s current 3K, 2K or 1K column.',
      checks: ['Current 2K with potassium 5.2 maps to?', 'Current 3K with potassium 5.6 maps to?'],
      visual: '/assets/potassium/adjustment-table.png',
    },
    {
      topic: 'First vs second change',
      title: 'Separate temporary from ongoing',
      principle: 'First indicated change = remainder of this run. Second consecutive indicated change = update the ongoing order.',
      checks: ['After an initial temporary change, what bath starts the next treatment?', 'When is the standing order updated?'],
      visual: '/assets/potassium/follow-up-lytes.png',
    },
    {
      topic: 'Documentation',
      title: 'Chart the full protocol trail',
      principle: 'The record should make the result, decision, machine change, order status and follow-up plan visible.',
      checks: ['Where is Bath Changed selected?', 'Which order supports the next-run repeat test?'],
      visual: '/assets/potassium/bath-changed.png',
    },
    {
      topic: 'Nutrition',
      title: 'Coach portions and preparation together',
      principle: 'Serving size still matters, and restriction should reflect the patient’s blood levels and dietitian plan.',
      checks: ['What happens to liquid from canned vegetables?', 'Does double-boiling make root vegetables unlimited?'],
      visual: '/assets/potassium/double-boil-guide.png',
    },
  ],
};

const INTERVENTION_TEMPLATES = [
  {
    id: 'fluid-uf-refresh',
    questId: 'fluid-volume',
    title: 'UF calculation refresh',
    focus: 'Fluid Volume Calculation',
    time: '10 min',
    description: 'Two UF volume/rate scenarios followed by trainer review if the learner misses either calculation.',
  },
  {
    id: 'bloodwork-critical-values',
    questId: 'bloodwork-values',
    title: 'Critical value micro-drill',
    focus: 'Bloodwork Values',
    time: '8 min',
    description: 'Focused potassium, sodium, hemoglobin and albumin critical-value classification before formal assessment.',
  },
  {
    id: 'potassium-eligibility',
    questId: 'potassium-protocol',
    title: 'Potassium eligibility gate',
    focus: 'Potassium Protocol',
    time: '7 min',
    description: 'Use the five-part eligibility check before selecting a dialysate potassium action.',
  },
  {
    id: 'potassium-sequence',
    questId: 'potassium-protocol',
    title: 'Temporary vs ongoing change',
    focus: 'Potassium Protocol',
    time: '9 min',
    description: 'A two-treatment timeline that separates temporary first change from second consecutive ongoing change.',
  },
  {
    id: 'documentation-screenshot',
    questId: 'potassium-protocol',
    title: 'Documentation screenshot checklist',
    focus: 'Potassium Protocol',
    time: '6 min',
    description: 'Trainer-assigned walkthrough of Day Hemo Order, Bath Changed, progress note and follow-up lytes.',
  },
  {
    id: 'infection-ppe-sequence',
    questId: 'infection-control',
    title: 'PPE sequence and splash-risk drill',
    focus: 'Infection Control & Hep B',
    time: '8 min',
    description: 'Focused review of hand hygiene moments, PPE selection and donning sequence before station practice.',
  },
  {
    id: 'infection-isolation-cases',
    questId: 'infection-control',
    title: 'Isolation and ARO screening cases',
    focus: 'Infection Control & Hep B',
    time: '9 min',
    description: 'Trainer-assigned cases covering C. diff, MRSA, CPE, Cerner isolation orders and ARO screening triggers.',
  },
];

const SEED_ASSIGNMENTS = [
  {
    id: 'emma-fluid-refresh',
    username: 'emma',
    templateId: 'fluid-uf-refresh',
    status: 'Assigned',
    reason: 'Fluid Volume Calculation is currently in progress.',
  },
  {
    id: 'emma-bloodwork-readiness',
    username: 'emma',
    templateId: 'bloodwork-critical-values',
    status: 'Suggested',
    reason: 'Bloodwork Values is unlocked but not started.',
  },
  {
    id: 'liam-bloodwork-readiness',
    username: 'liam',
    templateId: 'bloodwork-critical-values',
    status: 'Assigned',
    reason: 'Learner has Bloodwork Values unlocked and low XP progression.',
  },
  {
    id: 'liam-infection-ppe',
    username: 'liam',
    templateId: 'infection-ppe-sequence',
    status: 'Suggested',
    reason: 'Infection Control is unlocked; learner has only completed the reading task in the sample snapshot.',
  },
  {
    id: 'priya-potassium-sequence',
    username: 'priya',
    templateId: 'potassium-sequence',
    status: 'Optional',
    reason: 'Potassium Protocol is complete; use as annual-refresher evidence.',
  },
];

const LEARNER_ANALYTICS = {
  emma: {
    confidence: 64,
    timeOnTask: '5h 06m',
    lastActive: 'Today',
    recommendedAction: 'Assign UF calculation refresh, then unlock Bloodwork critical-value micro-drill after the next correct worksheet attempt.',
    topicMastery: [
      { topic: 'Orientation', score: 92 },
      { topic: 'Infection control', score: 86 },
      { topic: 'Fluid calculation', score: 54 },
      { topic: 'BVM graph reading', score: 38 },
      { topic: 'Bloodwork readiness', score: 42 },
    ],
    questionSignals: [
      { label: 'UF volume worksheet', confidence: 52, result: 'Needs practice', note: 'Missed one multi-step UF/rate item.' },
      { label: 'PPE sequence', confidence: 84, result: 'Stable', note: 'Completed Infection Control before this snapshot.' },
      { label: 'Bloodwork critical values', confidence: 40, result: 'Not attempted', note: 'Unlocked but not started.' },
    ],
  },
  liam: {
    confidence: 47,
    timeOnTask: '3h 34m',
    lastActive: 'Yesterday',
    recommendedAction: 'Assign Infection PPE sequence drill first, then Bloodwork critical-value micro-drill. Watch for low completion velocity.',
    topicMastery: [
      { topic: 'Orientation', score: 78 },
      { topic: 'Infection control', score: 39 },
      { topic: 'Fluid calculation', score: 22 },
      { topic: 'BVM graph reading', score: 0 },
      { topic: 'Bloodwork readiness', score: 35 },
    ],
    questionSignals: [
      { label: 'PPE selection', confidence: 44, result: 'Weakness', note: 'Reading done but application tasks incomplete.' },
      { label: 'ARO screening', confidence: 32, result: 'Weakness', note: 'Recommend isolation/screening cases after PPE lab.' },
      { label: 'Quest momentum', confidence: 50, result: 'Needs trainer check-in', note: 'Several unlocked quests are not started.' },
    ],
  },
  priya: {
    confidence: 91,
    timeOnTask: '9h 21m',
    lastActive: 'Today',
    recommendedAction: 'Offer advanced potassium refresh and allow progression. No urgent remediation required.',
    topicMastery: [
      { topic: 'Orientation', score: 98 },
      { topic: 'Infection control', score: 95 },
      { topic: 'Fluid calculation', score: 94 },
      { topic: 'BVM graph reading', score: 91 },
      { topic: 'Bloodwork readiness', score: 88 },
    ],
    questionSignals: [
      { label: 'Infection Control module', confidence: 95, result: 'Strength', note: 'All module tasks complete.' },
      { label: 'Bloodwork assessment', confidence: 88, result: 'Passed', note: '22 correct in the sample score record.' },
      { label: 'Potassium Protocol', confidence: 90, result: 'Annual refresh only', note: 'Use optional review scenario.' },
    ],
  },
};

function getLevel(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

function completedCount(questStatus) {
  return Object.values(questStatus || {}).filter((status) => status === 'complete').length;
}

function getQuestProgress(student, questId) {
  const quest = QUESTS[questId];
  const progress = student.snap.questTaskProgress?.[questId] || {};
  const done = Object.values(progress).filter(Boolean).length;
  const status = student.snap.questStatus?.[questId] || 'locked';
  return {
    quest,
    status,
    done,
    total: quest?.taskCount || 0,
    pct: quest?.taskCount ? Math.round((done / quest.taskCount) * 100) : 0,
  };
}

function buildStudentProfile(user) {
  const snap = STUDENT_SNAPSHOTS[user.username] || {};
  const questStatus = snap.questStatus || {};
  const xp = snap.xp || 0;
  const done = completedCount(questStatus);
  const completion = Math.round((done / TOTAL_QUESTS) * 100);
  const bloodworkScore = snap.assessmentScoreRecord?.['bloodwork-values'];
  const scorePct = bloodworkScore ? Math.round((bloodworkScore.score / ASSESSMENT_TOTAL) * 100) : null;
  const activeQuest =
    QUEST_LIST.find((quest) => questStatus[quest.id] === 'in-progress') ||
    QUEST_LIST.find((quest) => questStatus[quest.id] === 'unlocked') ||
    QUEST_LIST.find((quest) => questStatus[quest.id] === 'locked') ||
    QUEST_LIST[0];

  const weakSignals = [];
  const infectionProgress = getQuestProgress({ snap }, 'infection-control');
  if (infectionProgress.status === 'in-progress' || (infectionProgress.status === 'unlocked' && infectionProgress.done > 0)) weakSignals.push('Infection Control application');
  if (getQuestProgress({ snap }, 'fluid-volume').status === 'in-progress') weakSignals.push('Fluid Volume Calculation');
  if (questStatus['bloodwork-values'] === 'unlocked' && !bloodworkScore) weakSignals.push('Bloodwork readiness');
  if (bloodworkScore && !bloodworkScore.passed) weakSignals.push('Bloodwork retake');
  if (questStatus['potassium-protocol'] === 'locked') weakSignals.push('Potassium Protocol locked');
  if (questStatus['potassium-protocol'] === 'complete') weakSignals.push('Annual potassium refresh');
  if (!weakSignals.length) weakSignals.push('Maintain momentum');

  let risk = 'On track';
  if (completion < 20 || (scorePct !== null && scorePct < 80)) risk = 'Needs attention';
  else if (weakSignals.includes('Bloodwork readiness') || weakSignals.includes('Potassium Protocol locked')) risk = 'Watch';

  return {
    ...user,
    snap,
    xp,
    level: getLevel(xp),
    completedQuests: done,
    completion,
    activeQuest,
    risk,
    weakSignals,
    bloodworkScore,
    scorePct,
    infection: infectionProgress,
    fluid: getQuestProgress({ snap }, 'fluid-volume'),
    intradialytic: getQuestProgress({ snap }, 'intradialytic-fluid'),
    bloodwork: getQuestProgress({ snap }, 'bloodwork-values'),
    potassium: getQuestProgress({ snap }, 'potassium-protocol'),
  };
}

function getLearnerAnalytics(student) {
  return LEARNER_ANALYTICS[student.username] || {
    confidence: student.completion,
    timeOnTask: 'Not recorded',
    lastActive: 'Unknown',
    recommendedAction: 'Review current quest progress and assign the shortest remediation pack tied to the first incomplete prerequisite.',
    topicMastery: [
      { topic: 'Overall completion', score: student.completion },
      { topic: 'Infection control', score: student.infection?.pct || 0 },
      { topic: 'Fluid calculation', score: student.fluid?.pct || 0 },
      { topic: 'Bloodwork readiness', score: student.scorePct || 0 },
    ],
    questionSignals: [],
  };
}

function templateById(id) {
  return INTERVENTION_TEMPLATES.find((template) => template.id === id);
}

function createQuestSettings() {
  return QUEST_LIST.reduce((settings, quest) => {
    settings[quest.id] = {
      visible: true,
      trainerReview: quest.id === 'bloodwork-values' || quest.id === 'potassium-protocol',
      aiDraftAttached: false,
      removedFromPath: false,
    };
    return settings;
  }, {});
}

function createDraftState() {
  return AI_DRAFT_ARTIFACTS.reduce((state, artifact) => {
    state[artifact.id] = true;
    return state;
  }, {});
}

export default function AdminDashboard() {
  const { state, dispatch } = useApp();
  const { currentUser } = state;
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudentId, setSelectedStudentId] = useState(4);
  const [learnerDrawerTab, setLearnerDrawerTab] = useState('summary');
  const [selectedQuestId, setSelectedQuestId] = useState('potassium-protocol');
  const [questSettings, setQuestSettings] = useState(createQuestSettings);
  const [assignments, setAssignments] = useState(SEED_ASSIGNMENTS);
  const [selectedTemplateId, setSelectedTemplateId] = useState('potassium-eligibility');
  const [draftEnabled, setDraftEnabled] = useState(createDraftState);

  const students = useMemo(
    () => MOCK_USERS.filter((user) => user.role === 'student').map(buildStudentProfile),
    [],
  );

  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0];
  const selectedQuest = QUESTS[selectedQuestId] || QUESTS['potassium-protocol'];
  const learnerAssignments = assignments.filter((assignment) => assignment.username === selectedStudent.username);
  const atRisk = students.filter((student) => student.risk !== 'On track');
  const avgXP = Math.round(students.reduce((sum, student) => sum + student.xp, 0) / students.length);
  const avgComplete = Math.round(students.reduce((sum, student) => sum + student.completedQuests, 0) / students.length);
  const enabledArtifacts = AI_DRAFT_ARTIFACTS.filter((artifact) => draftEnabled[artifact.id]);
  const potassiumAttached = questSettings['potassium-protocol']?.aiDraftAttached;

  function toggleQuest(questId, key) {
    setQuestSettings((current) => ({
      ...current,
      [questId]: {
        ...current[questId],
        [key]: !current[questId]?.[key],
      },
    }));
  }

  function hideQuest(questId) {
    setQuestSettings((current) => ({
      ...current,
      [questId]: {
        ...current[questId],
        visible: false,
        removedFromPath: true,
      },
    }));
  }

  function restoreQuest(questId) {
    setQuestSettings((current) => ({
      ...current,
      [questId]: {
        ...current[questId],
        visible: true,
        removedFromPath: false,
      },
    }));
  }

  function attachDraftToQuest() {
    setQuestSettings((current) => ({
      ...current,
      [selectedQuestId]: {
        ...current[selectedQuestId],
        aiDraftAttached: true,
        trainerReview: true,
        visible: true,
        removedFromPath: false,
      },
    }));
  }

  function removeDraftFromQuest() {
    setQuestSettings((current) => ({
      ...current,
      [selectedQuestId]: {
        ...current[selectedQuestId],
        aiDraftAttached: false,
      },
    }));
  }

  function addAssignment() {
    const template = templateById(selectedTemplateId);
    if (!template) return;
    const id = `${selectedStudent.username}-${template.id}`;
    setAssignments((current) => {
      if (current.some((assignment) => assignment.id === id)) return current;
      return [
        {
          id,
          username: selectedStudent.username,
          templateId: template.id,
          status: 'Assigned',
          reason: `Trainer assigned from ${template.focus}.`,
        },
        ...current,
      ];
    });
  }

  function removeAssignment(id) {
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
  }

  return (
    <div className="admin-bg">
      <header className="admin-header">
        <div className="admin-header__left">
          <span className="admin-header__logo">⚕</span>
          <div>
            <div className="admin-header__title">Renal E-Learning Platform</div>
            <div className="admin-header__sub">Trainer command centre</div>
          </div>
        </div>

        <nav className="admin-tabs" aria-label="Trainer dashboard sections">
          {TRAINER_TABS.map(([id, label]) => (
            <button
              key={id}
              className={activeTab === id ? 'admin-tabs__btn admin-tabs__btn--active' : 'admin-tabs__btn'}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-header__right">
          <div className="admin-header__user">
            <span className="admin-header__user-name">{currentUser?.fullName}</span>
            <span className="admin-header__user-role">{currentUser?.title}</span>
          </div>
          <button className="admin-logout-btn" onClick={() => dispatch({ type: 'LOGOUT' })}>
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-body">
        {activeTab === 'overview' && (
          <OverviewPanel
            students={students}
            atRisk={atRisk}
            avgXP={avgXP}
            avgComplete={avgComplete}
            enabledArtifacts={enabledArtifacts}
            potassiumAttached={potassiumAttached}
            onOpenBuilder={() => setActiveTab('builder')}
            onOpenLessons={() => setActiveTab('lessons')}
            onOpenLearner={(studentId) => {
              setSelectedStudentId(studentId);
              setActiveTab('learners');
            }}
          />
        )}

        {activeTab === 'learners' && (
          <LearnerPanel
            students={students}
            selectedStudent={selectedStudent}
            selectedStudentId={selectedStudentId}
            drawerTab={learnerDrawerTab}
            assignments={learnerAssignments}
            selectedTemplateId={selectedTemplateId}
            onSelectStudent={setSelectedStudentId}
            onSelectDrawerTab={setLearnerDrawerTab}
            onSelectTemplate={setSelectedTemplateId}
            onAddAssignment={addAssignment}
            onRemoveAssignment={removeAssignment}
          />
        )}

        {activeTab === 'quests' && (
          <QuestControlPanel
            questSettings={questSettings}
            selectedQuestId={selectedQuestId}
            onSelectQuest={setSelectedQuestId}
            onToggle={toggleQuest}
            onHide={hideQuest}
            onRestore={restoreQuest}
            onOpenBuilder={() => setActiveTab('builder')}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonDataPanel onOpenBuilder={() => setActiveTab('builder')} />
        )}

        {activeTab === 'builder' && (
          <AIBuilderPanel
            selectedQuest={selectedQuest}
            selectedQuestId={selectedQuestId}
            questSettings={questSettings[selectedQuestId]}
            draftEnabled={draftEnabled}
            enabledArtifacts={enabledArtifacts}
            onSelectQuest={setSelectedQuestId}
            onToggleArtifact={(artifactId) => {
              setDraftEnabled((current) => ({ ...current, [artifactId]: !current[artifactId] }));
            }}
            onAttach={attachDraftToQuest}
            onRemoveDraft={removeDraftFromQuest}
            onCreateAssignment={() => {
              setSelectedTemplateId('potassium-eligibility');
              setActiveTab('learners');
            }}
          />
        )}
      </main>
    </div>
  );
}

function OverviewPanel({ students, atRisk, avgXP, avgComplete, enabledArtifacts, potassiumAttached, onOpenBuilder, onOpenLessons, onOpenLearner }) {
  return (
    <>
      <section className="admin-hero">
        <div className="admin-hero__copy">
          <span className="admin-eyebrow">Trainer POV · Integrated with current app</span>
          <h1>Control the existing orientation path, not a separate prototype.</h1>
          <p>
            This dashboard reads the same quests, users, XP, bloodwork assessment records and
            task progress that learners already see. The AI draft is staged against the real
            Potassium Protocol quest for trainer review.
          </p>
          <div className="admin-hero__actions">
            <button className="btn btn--primary" onClick={onOpenBuilder}>Open AI builder</button>
            <button className="btn btn--outline" onClick={onOpenLessons}>Review lesson data</button>
            <span className={potassiumAttached ? 'admin-live-pill admin-live-pill--ready' : 'admin-live-pill'}>
              {potassiumAttached ? 'Potassium draft attached' : 'Potassium draft staged'}
            </span>
          </div>
        </div>

        <div className="admin-path-card">
          <span>Current learner pathway</span>
          <div className="admin-path-line">
            <b>Bloodwork Values</b>
            <i />
            <b>Potassium Protocol</b>
            <i />
            <b>Complications</b>
          </div>
          <p>AI content attaches at the Potassium Protocol node after Bloodwork Values.</p>
        </div>
      </section>

      <div className="admin-stats">
        <StatCard value={students.length} label="Students enrolled" note="From MOCK_USERS" />
        <StatCard value={avgXP.toLocaleString()} label="Average XP" note="Uses existing XP snapshots" />
        <StatCard value={`${avgComplete}/${TOTAL_QUESTS}`} label="Average quests completed" note="Quest map aligned" />
        <StatCard value={enabledArtifacts.length} label="AI artifacts staged" note="Trainer can remove any item" />
      </div>

      <div className="admin-grid admin-grid--overview">
        <section className="admin-section admin-panel">
          <PanelHeader
            title="Learners needing trainer attention"
            subtitle="Based on existing quest status, assessment records and staged interventions."
          />
          <div className="admin-attention-list">
            {atRisk.map((student) => (
              <button key={student.id} onClick={() => onOpenLearner(student.id)}>
                <div>
                  <strong>{student.fullName}</strong>
                  <span>{student.activeQuest.title} · {student.weakSignals.slice(0, 2).join(' / ')}</span>
                </div>
                <RiskBadge value={student.risk} />
              </button>
            ))}
          </div>
        </section>

        <section className="admin-section admin-panel">
          <PanelHeader title="AI source-to-quest workflow" subtitle="n8n-style stages, mapped to this app." />
          <div className="admin-mini-workflow">
            {['Upload files', 'Analyze source', 'Draft activities', 'Trainer review', 'Attach to quest'].map((step, index) => (
              <div key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
          <div className="admin-note">
            The current MVP stores a refined/cached potassium draft. A funded version can replace
            the analysis stage with Gemini, Claude, OpenAI or local models without changing this trainer workflow.
          </div>
        </section>
      </div>
    </>
  );
}

function LearnerPanel({
  students,
  selectedStudent,
  selectedStudentId,
  drawerTab,
  assignments,
  selectedTemplateId,
  onSelectStudent,
  onSelectDrawerTab,
  onSelectTemplate,
  onAddAssignment,
  onRemoveAssignment,
}) {
  const analytics = getLearnerAnalytics(selectedStudent);

  return (
    <div className="admin-grid admin-grid--learners">
      <section className="admin-section admin-panel">
        <PanelHeader title="Student Progress" subtitle="Same users and progress snapshots used by the learner app." />
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Level</th>
                <th>XP</th>
                <th>Quests</th>
                <th>Progress</th>
                <th>Bloodwork assessment</th>
                <th>Attention</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className={selectedStudentId === student.id ? 'admin-table-row--active' : ''}
                  onClick={() => onSelectStudent(student.id)}
                >
                  <td>
                    <div className="admin-student-name">{student.fullName}</div>
                    <div className="admin-student-user">@{student.username} · {student.cohort}</div>
                  </td>
                  <td><span className="admin-level">Lv {student.level}</span></td>
                  <td><span className="admin-xp">{student.xp.toLocaleString()} XP</span></td>
                  <td><span className="admin-complete">{student.completedQuests} / {TOTAL_QUESTS}</span></td>
                  <td>
                    <ProgressBar value={student.completion} />
                  </td>
                  <td>
                    {student.scorePct !== null ? (
                      <span className={`admin-score ${student.bloodworkScore.passed ? 'admin-score--pass' : 'admin-score--fail'}`}>
                        {student.bloodworkScore.passed ? '✓' : '✗'} {student.scorePct}% ({student.bloodworkScore.score}/{ASSESSMENT_TOTAL})
                      </span>
                    ) : (
                      <span className="admin-score admin-score--none">Not attempted</span>
                    )}
                  </td>
                  <td><RiskBadge value={student.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="admin-section admin-panel admin-student-drawer">
        <PanelHeader title={selectedStudent.fullName} subtitle={`@${selectedStudent.username} · ${selectedStudent.cohort}`} />

        <div className="admin-drawer-tabs" role="tablist" aria-label="Selected learner details">
          {[
            ['summary', 'Summary'],
            ['statistics', 'Statistics'],
            ['actions', 'AI actions'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={drawerTab === id ? 'admin-drawer-tab admin-drawer-tab--active' : 'admin-drawer-tab'}
              onClick={() => onSelectDrawerTab(id)}
              role="tab"
              aria-selected={drawerTab === id}
            >
              {label}
            </button>
          ))}
        </div>

        {drawerTab === 'summary' && (
          <>
            <div className="admin-student-metrics">
              <Metric label="Current focus" value={selectedStudent.activeQuest.title} />
              <Metric label="Quest completion" value={`${selectedStudent.completion}%`} />
              <Metric label="Bloodwork score" value={selectedStudent.scorePct === null ? 'Not attempted' : `${selectedStudent.scorePct}%`} />
            </div>

            <div className="admin-focus-stack">
              <MiniQuestProgress label="Infection Control" data={selectedStudent.infection} />
              <MiniQuestProgress label="Fluid Volume" data={selectedStudent.fluid} />
              <MiniQuestProgress label="Intradialytic Fluid" data={selectedStudent.intradialytic} />
              <MiniQuestProgress label="Bloodwork Values" data={selectedStudent.bloodwork} />
              <MiniQuestProgress label="Potassium Protocol" data={selectedStudent.potassium} />
            </div>

            <div className="admin-weakness-box">
              <h3>Trainer evidence</h3>
              {selectedStudent.weakSignals.map((signal) => (
                <span key={signal}>{signal}</span>
              ))}
              <p>
                These signals come from the learner’s existing quest state. The trainer can now assign
                targeted practice without changing the learner-side module code.
              </p>
            </div>
          </>
        )}

        {drawerTab === 'statistics' && (
          <LearnerStatisticsTab student={selectedStudent} analytics={analytics} />
        )}

        {drawerTab === 'actions' && (
          <LearnerActionsTab
            analytics={analytics}
            assignments={assignments}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={onSelectTemplate}
            onAddAssignment={onAddAssignment}
            onRemoveAssignment={onRemoveAssignment}
          />
        )}
      </aside>
    </div>
  );
}

function LearnerStatisticsTab({ student, analytics }) {
  const questBars = [
    { label: 'Infection', value: student.infection.status === 'complete' ? 100 : student.infection.pct, status: student.infection.status },
    { label: 'Fluid', value: student.fluid.status === 'complete' ? 100 : student.fluid.pct, status: student.fluid.status },
    { label: 'BVM', value: student.intradialytic.status === 'complete' ? 100 : student.intradialytic.pct, status: student.intradialytic.status },
    { label: 'Bloodwork', value: student.bloodwork.status === 'complete' ? 100 : student.bloodwork.pct, status: student.bloodwork.status },
    { label: 'Potassium', value: student.potassium.status === 'complete' ? 100 : student.potassium.pct, status: student.potassium.status },
  ];

  return (
    <div className="admin-learner-stats-tab">
      <div className="admin-stat-info-grid">
        <Metric label="Confidence" value={`${analytics.confidence}%`} />
        <Metric label="Time on task" value={analytics.timeOnTask} />
        <Metric label="Last active" value={analytics.lastActive} />
      </div>

      <div className="admin-chart-card">
        <h3>Module progress bars</h3>
        <div className="admin-bar-chart">
          {questBars.map((bar) => (
            <div className="admin-bar-row" key={bar.label}>
              <span>{bar.label}</span>
              <div className="admin-bar-track">
                <div className="admin-bar-fill" style={{ width: `${bar.value}%` }} />
              </div>
              <em>{bar.status}</em>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-chart-card">
        <h3>Topic mastery</h3>
        <div className="admin-vertical-chart">
          {analytics.topicMastery.map((topic) => (
            <div className="admin-vertical-bar" key={topic.topic}>
              <div>
                <span style={{ height: `${topic.score}%` }} />
              </div>
              <strong>{topic.score}%</strong>
              <em>{topic.topic}</em>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-chart-card">
        <h3>Question confidence signals</h3>
        <div className="admin-question-signal-list">
          {analytics.questionSignals.map((signal) => (
            <article key={signal.label}>
              <div>
                <strong>{signal.label}</strong>
                <span>{signal.result} · {signal.confidence}% confidence</span>
              </div>
              <ProgressBar value={signal.confidence} />
              <p>{signal.note}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="admin-recommendation-card">
        <span>Recommended AI action</span>
        <p>{analytics.recommendedAction}</p>
      </div>
    </div>
  );
}

function LearnerActionsTab({
  analytics,
  assignments,
  selectedTemplateId,
  onSelectTemplate,
  onAddAssignment,
  onRemoveAssignment,
}) {
  return (
    <>
      <div className="admin-recommendation-card admin-recommendation-card--actions">
        <span>Recommended AI action</span>
        <p>{analytics.recommendedAction}</p>
      </div>

      <div className="admin-assignment-control">
        <label htmlFor="assignment-template">Assign remediation</label>
        <div>
          <select id="assignment-template" value={selectedTemplateId} onChange={(event) => onSelectTemplate(event.target.value)}>
            {INTERVENTION_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>{template.title}</option>
            ))}
          </select>
          <button className="btn btn--primary btn--sm" onClick={onAddAssignment}>Assign</button>
        </div>
      </div>

      <div className="admin-assignment-list">
        {assignments.length ? assignments.map((assignment) => {
          const template = templateById(assignment.templateId);
          if (!template) return null;
          return (
            <article key={assignment.id}>
              <div>
                <strong>{template.title}</strong>
                <span>{assignment.status} · {template.time} · {template.focus}</span>
              </div>
              <p>{assignment.reason}</p>
              <button className="admin-link-btn" onClick={() => onRemoveAssignment(assignment.id)}>Remove</button>
            </article>
          );
        }) : (
          <div className="admin-empty-state">No interventions assigned yet.</div>
        )}
      </div>
    </>
  );
}

function QuestControlPanel({ questSettings, selectedQuestId, onSelectQuest, onToggle, onHide, onRestore, onOpenBuilder }) {
  return (
    <div className="admin-grid admin-grid--quests">
      <section className="admin-section admin-panel">
        <PanelHeader
          title="Quest controls"
          subtitle="Trainer-side controls for the same QUESTS object powering the learner path."
        />
        <div className="admin-quest-control-grid">
          {QUEST_LIST.map((quest) => {
            const settings = questSettings[quest.id];
            return (
              <article
                key={quest.id}
                className={`admin-quest-control ${selectedQuestId === quest.id ? 'admin-quest-control--active' : ''}`}
                onClick={() => onSelectQuest(quest.id)}
              >
                <header>
                  <span className={`tag tag--${quest.type}`}>{quest.type}</span>
                  {settings?.aiDraftAttached && <span className="badge badge--teal">AI draft</span>}
                </header>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <div className="admin-quest-control__meta">
                  <span>{quest.taskCount} tasks</span>
                  <span>{quest.xp} XP</span>
                  <span>{quest.prereqs.length ? `Requires ${quest.prereqs.map((id) => QUESTS[id]?.title).join(', ')}` : 'No prereq'}</span>
                </div>
                <div className="admin-control-row">
                  <button className={settings?.visible ? 'admin-toggle admin-toggle--on' : 'admin-toggle'} onClick={(event) => { event.stopPropagation(); onToggle(quest.id, 'visible'); }}>
                    {settings?.visible ? 'Visible' : 'Hidden'}
                  </button>
                  <button className={settings?.trainerReview ? 'admin-toggle admin-toggle--on' : 'admin-toggle'} onClick={(event) => { event.stopPropagation(); onToggle(quest.id, 'trainerReview'); }}>
                    Review {settings?.trainerReview ? 'on' : 'off'}
                  </button>
                  {settings?.removedFromPath ? (
                    <button className="admin-link-btn" onClick={(event) => { event.stopPropagation(); onRestore(quest.id); }}>Restore</button>
                  ) : (
                    <button className="admin-link-btn admin-link-btn--danger" onClick={(event) => { event.stopPropagation(); onHide(quest.id); }}>Remove</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="admin-section admin-panel">
        <PanelHeader title="Selected quest" subtitle={QUESTS[selectedQuestId]?.id} />
        <div className="admin-selected-quest">
          <h2>{QUESTS[selectedQuestId]?.title}</h2>
          <p>{QUESTS[selectedQuestId]?.description}</p>
          <Metric label="Learner path status" value={questSettings[selectedQuestId]?.visible ? 'Visible' : 'Hidden'} />
          <Metric label="Trainer review" value={questSettings[selectedQuestId]?.trainerReview ? 'Required' : 'Not required'} />
          <Metric label="AI draft" value={questSettings[selectedQuestId]?.aiDraftAttached ? 'Attached' : 'Not attached'} />
          <button className="btn btn--primary" onClick={onOpenBuilder}>Open builder for this quest</button>
        </div>
        <div className="admin-note">
          “Remove” hides the quest in this trainer control layer for the MVP. It does not delete the source QUESTS object or student code.
        </div>
      </aside>
    </div>
  );
}

function AIBuilderPanel({
  selectedQuest,
  selectedQuestId,
  questSettings,
  draftEnabled,
  enabledArtifacts,
  onSelectQuest,
  onToggleArtifact,
  onAttach,
  onRemoveDraft,
  onCreateAssignment,
}) {
  return (
    <div className="admin-grid admin-grid--builder">
      <section className="admin-section admin-panel">
        <PanelHeader
          title="AI module builder"
          subtitle="Uses the potassium MVP content as a trainer-reviewed draft attached to the existing app."
        />

        <div className="admin-builder-target">
          <label htmlFor="quest-target">Attach draft to existing quest</label>
          <select id="quest-target" value={selectedQuestId} onChange={(event) => onSelectQuest(event.target.value)}>
            {QUEST_LIST.map((quest) => (
              <option key={quest.id} value={quest.id}>{quest.title}</option>
            ))}
          </select>
        </div>

        <div className="admin-existing-quest-card">
          <span className={`tag tag--${selectedQuest.type}`}>{selectedQuest.type}</span>
          <h2>{selectedQuest.title}</h2>
          <p>{selectedQuest.description}</p>
          <div>
            <span>{selectedQuest.taskCount} tasks</span>
            <span>{selectedQuest.xp} XP</span>
            <span>{selectedQuest.prereqs.length ? `Prereq: ${selectedQuest.prereqs.map((id) => QUESTS[id]?.title).join(', ')}` : 'No prereq'}</span>
          </div>
        </div>

        <GeneratedLessonSummary />

        <div className="admin-source-package">
          <h3>Potassium source package ready for trainer review</h3>
          {POTASSIUM_SOURCE_PACKAGE.map((file) => (
            <article key={file.name}>
              <strong>{file.name}</strong>
              <span>{file.type}</span>
              <p>{file.use}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section admin-panel">
        <PanelHeader
          title="Draft artifacts"
          subtitle="Trainer can add/remove generated pieces before attaching anything to the quest."
        />
        <div className="admin-artifact-list">
          {AI_DRAFT_ARTIFACTS.map((artifact) => (
            <article key={artifact.id} className={!draftEnabled[artifact.id] ? 'admin-artifact admin-artifact--disabled' : 'admin-artifact'}>
              <label>
                <input
                  type="checkbox"
                  checked={draftEnabled[artifact.id]}
                  onChange={() => onToggleArtifact(artifact.id)}
                />
                <span>
                  <strong>{artifact.title}</strong>
                  <em>{artifact.kind} · {artifact.source}</em>
                </span>
              </label>
              <p>{artifact.trainerControl}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="admin-section admin-panel admin-builder-review">
        <PanelHeader title="Publish control" subtitle="MVP-safe, trainer-approved handoff." />
        <div className="admin-review-meter">
          <strong>{enabledArtifacts.length}</strong>
          <span>of {AI_DRAFT_ARTIFACTS.length} artifacts enabled</span>
        </div>
        <div className="admin-review-checks">
          <span>✓ Existing quest selected: {selectedQuest.title}</span>
          <span>✓ Source package accounted for: 4 files</span>
          <span>✓ Lesson package included: {POTASSIUM_LESSON_PACKAGE.sections.length} sections, {POTASSIUM_LESSON_PACKAGE.quiz.length} diagnostic questions</span>
          <span>✓ Trainer can remove artifacts</span>
          <span>✓ Weakness packs can be assigned manually</span>
          <span>{questSettings?.aiDraftAttached ? '✓ Draft attached to quest' : '○ Draft not attached yet'}</span>
        </div>
        <button className="btn btn--primary" onClick={onAttach}>Attach draft to selected quest</button>
        <button className="btn btn--outline" onClick={onCreateAssignment}>Create learner remediation</button>
        <button className="btn btn--ghost" onClick={onRemoveDraft}>Remove draft from quest</button>
        <div className="admin-note">
          This does not overwrite the learner module yet. It creates a trainer-approved plan that correlates
          the MVP content with the real app’s quest structure.
        </div>
      </aside>
    </div>
  );
}

function GeneratedLessonSummary() {
  return (
    <div className="admin-builder-lesson-summary">
      <div>
        <span>Generated lesson package</span>
        <h3>{POTASSIUM_LESSON_PACKAGE.title}</h3>
        <p>{POTASSIUM_LESSON_PACKAGE.summary}</p>
      </div>
      <div className="admin-builder-lesson-metrics">
        <Metric label="Sections" value={POTASSIUM_LESSON_PACKAGE.sections.length} />
        <Metric label="Quiz items" value={POTASSIUM_LESSON_PACKAGE.quiz.length} />
        <Metric label="Remediation packs" value={POTASSIUM_LESSON_PACKAGE.remediation.length} />
      </div>
    </div>
  );
}

function LessonDataPanel({ onOpenBuilder }) {
  const lesson = POTASSIUM_LESSON_PACKAGE;

  return (
    <div className="admin-grid admin-grid--lessons">
      <section className="admin-section admin-panel admin-lesson-hero admin-lesson-full">
        <div>
          <span className="admin-eyebrow">One high-quality generated module</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.summary}</p>
          <div className="admin-lesson-meta">
            <span>{lesson.audience}</span>
            <span>{lesson.minutes} min</span>
            <span>{lesson.difficulty}</span>
            <span>{lesson.qualityScore}% source quality</span>
            <span>Updated {lesson.sourceUpdated}</span>
          </div>
        </div>
        <div className="admin-lesson-hero-card">
          <strong>Trainer handoff</strong>
          <p>
            This is the cached MVP result that would normally come from the AI pipeline:
            source analysis, lesson plan, visuals, diagnostic quiz, weakness detection and
            assigned remediation.
          </p>
          <button className="btn btn--primary" onClick={onOpenBuilder}>Attach/review in AI builder</button>
        </div>
      </section>

      <section className="admin-section admin-panel admin-lesson-full">
        <PanelHeader
          title="Learning objectives"
          subtitle="The learner-facing goals generated from the source package and available for trainer review."
        />
        <div className="admin-objective-grid">
          {lesson.objectives.map((objective) => (
            <article key={objective.id} className="admin-objective-card">
              <strong>{objective.text}</strong>
              <span>{objective.source}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section admin-panel">
        <PanelHeader
          title="Lesson sequence"
          subtitle="This is the missing data/lesson layer from the prototype, now styled inside the real trainer dashboard."
        />
        <div className="admin-lesson-sequence">
          {lesson.sections.map((section, index) => (
            <article key={section.id} className="admin-lesson-step">
              <div className="admin-lesson-step__num">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <span>{section.type} · {section.minutes} min</span>
                <h3>{section.title}</h3>
                <p>{section.summary}</p>
                <em>{section.source}</em>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section admin-panel">
        <PanelHeader
          title="Clinical flowchart logic"
          subtitle="The part that can become a flowchart, timeline, animation or branching simulation."
        />
        <div className="admin-flow-lane">
          {lesson.flow.map((step) => (
            <article key={step.step} className="admin-flow-card">
              <span>{step.step} · {step.role}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <em>{step.source}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section admin-panel admin-lesson-full">
        <PanelHeader
          title="Source visuals turned into activities"
          subtitle="These are the prototype images copied into the real app so the generated module feels grounded."
        />
        <div className="admin-visual-grid">
          {lesson.visuals.map((visual) => (
            <article key={visual.title} className="admin-visual-card">
              {visual.image ? <img src={visual.image} alt={visual.title} /> : <div className="admin-visual-placeholder">Flow</div>}
              <div>
                <span>{visual.format}</span>
                <h3>{visual.title}</h3>
                <p>{visual.reason}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section admin-panel">
        <PanelHeader
          title="Documentation screenshot walkthrough"
          subtitle="Trainer can assign this as a charting-sequence practice item."
        />
        <div className="admin-doc-preview-grid">
          {lesson.documentation.map((doc) => (
            <article key={doc.title} className="admin-doc-step">
              <img src={doc.image} alt={doc.title} />
              <div>
                <strong>{doc.title}</strong>
                <p>{doc.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section admin-panel">
        <PanelHeader
          title="Diagnostic quiz + AI weakness action"
          subtitle="Every wrong answer maps to a misconception and a trainer-visible recommended action."
        />
        <div className="admin-quiz-list">
          {lesson.quiz.map((item) => (
            <article key={item.id} className="admin-quiz-item">
              <span>{item.topic}</span>
              <h3>{item.question}</h3>
              <p><strong>Correct:</strong> {item.answer}</p>
              <p><strong>Weakness detected:</strong> {item.weakness}</p>
              <em>{item.action}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section admin-panel admin-lesson-full">
        <PanelHeader
          title="Work-on-weakness remediation packs"
          subtitle="The same packs can appear in the learner’s weakness tab and the trainer’s assignment panel."
        />
        <div className="admin-remediation-grid">
          {lesson.remediation.map((pack) => (
            <article key={pack.topic} className="admin-remediation-card">
              <img src={pack.visual} alt={pack.title} />
              <div>
                <span>{pack.topic}</span>
                <h3>{pack.title}</h3>
                <p>{pack.principle}</p>
                <ul>
                  {pack.checks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label, note }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card__num">{value}</div>
      <div className="admin-stat-card__label">{label}</div>
      <small>{note}</small>
    </div>
  );
}

function PanelHeader({ title, subtitle }) {
  return (
    <header className="admin-panel-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}

function RiskBadge({ value }) {
  const className = value === 'Needs attention' ? 'admin-risk admin-risk--high' : value === 'Watch' ? 'admin-risk admin-risk--watch' : 'admin-risk';
  return <span className={className}>{value}</span>;
}

function ProgressBar({ value }) {
  return (
    <div className="admin-prog-wrap">
      <div className="admin-prog-bar">
        <div className="admin-prog-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="admin-prog-pct">{value}%</span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniQuestProgress({ label, data }) {
  return (
    <div className="admin-mini-quest">
      <div>
        <strong>{label}</strong>
        <span>{data.status} · {data.done}/{data.total}</span>
      </div>
      <ProgressBar value={data.status === 'complete' ? 100 : data.pct} />
    </div>
  );
}
