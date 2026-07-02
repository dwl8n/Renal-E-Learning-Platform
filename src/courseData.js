import { QUESTS } from './data';

// ─── Module definitions ────────────────────────────────────────────────────────
// Modules group related tasks (quests). Each course references module IDs.
// Tasks within a module still carry their own prereq/lock state from QUESTS.
export const MODULES = [
  {
    id: 'm-introduction',
    title: 'Introduction',
    description: 'Get oriented to the dialysis unit, infection prevention, and emergency response.',
    tasks: ['introduction', 'infection-control', 'emergency-codes'],
  },
  {
    id: 'm-vascular-access',
    title: 'Vascular Access',
    description: 'Learn arteriovenous access assessment, cannulation, and central venous catheter care.',
    tasks: ['avg-avf', 'cvc'],
  },
  {
    id: 'm-patient-care-fluids',
    title: 'Patient Care: Fluids',
    description: 'Assess fluid status, manage intradialytic fluid removal, and administer common medications.',
    tasks: ['fluid-volume', 'intradialytic-fluid', 'medication-admin'],
  },
  {
    id: 'm-patient-care-assessment',
    title: 'Patient Care: Assessment',
    description: 'Interpret bloodwork values, respond to critical results, and manage complications.',
    tasks: ['bloodwork-values', 'potassium-protocol', 'complications'],
  },
  {
    id: 'm-software',
    title: 'Software Use',
    description: 'Document treatments and manage care plans using Renal Insight and Cerner.',
    tasks: ['renal-insight', 'cerner'],
  },
];

const MODULES_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]));

export function getModuleById(moduleId) {
  return MODULES_BY_ID[moduleId] || null;
}

export function getTasksForModule(module) {
  return (module.tasks || []).map((id) => QUESTS[id]).filter(Boolean);
}

export function getModuleProgress(module, questStatus, questTaskProgress) {
  const tasks = getTasksForModule(module);
  if (!tasks.length) return 0;
  const complete = tasks.filter((t) => questStatus[t.id] === 'complete').length;
  return Math.round((complete / tasks.length) * 100);
}

export function getModuleStatus(module, questStatus) {
  const tasks = getTasksForModule(module);
  if (!tasks.length) return 'locked';
  const statuses = tasks.map((t) => questStatus[t.id] || 'locked');
  if (statuses.every((s) => s === 'complete')) return 'complete';
  if (statuses.some((s) => s === 'in-progress' || s === 'complete' || s === 'unlocked')) return 'available';
  return 'locked';
}

// ─── Course catalog ────────────────────────────────────────────────────────────
export const COURSE_CATALOG = [
  {
    id: 'renal-dialysis',
    title: 'Renal Dialysis Orientation',
    clinicalArea: 'Renal',
    type: 'Orientation',
    modality: 'Hybrid',
    estimate: '12 hours',
    status: 'assigned',
    accessLabel: 'Assigned',
    actionLabel: 'Continue',
    image: '/assets/potassium/dialysis-machine.png',
    accent: '#005a9e',
    description: 'Core dialysis onboarding with self-paced modules, practice, and official assessments.',
    modules: ['m-introduction', 'm-vascular-access', 'm-patient-care-fluids', 'm-patient-care-assessment', 'm-software'],
  },
  {
    id: 'neurology-orientation',
    title: 'Neurology Orientation',
    clinicalArea: 'Neurology',
    type: 'Workshop',
    modality: 'Hybrid',
    estimate: '9 hours',
    status: 'request',
    accessLabel: 'Request access',
    actionLabel: 'Request',
    image: null,
    accent: '#6157a8',
    description: 'Neurology onboarding pathway for assessment workflow, escalation, and unit safety.',
    modules: [],
  },
  {
    id: 'perfusionist-cardiac',
    title: 'Perfusionist / Cardiac Training',
    clinicalArea: 'Cardiac',
    type: 'Workshop',
    modality: 'Restricted',
    estimate: '10 hours',
    status: 'restricted',
    accessLabel: 'Restricted',
    actionLabel: 'View details',
    image: null,
    accent: '#9d3f50',
    description: 'Cardiac and perfusion-related learning pathway available by assignment.',
    modules: [],
  },
  {
    id: 'hospital-policy',
    title: 'General Hospital Policy',
    clinicalArea: 'Policy',
    type: 'Policy',
    modality: 'Self-paced',
    estimate: '90 minutes',
    status: 'open',
    accessLabel: 'Open to all staff',
    actionLabel: 'Enroll',
    image: null,
    accent: '#55606f',
    description: 'Hospital policy learning available to authenticated staff without clinical restrictions.',
    modules: [],
  },
];

const COURSE_DETAIL = {
  'renal-dialysis': {
    overview:
      'A staged learner pathway for dialysis orientation. Learners first understand the full course shape, then choose each module box for a deeper preview before starting the live activity or official assessment.',
    onlineAspects: [
      'Pre-assessment placement into novice, developing, or experienced knowledge bands.',
      'Self-paced readings, scenarios, calculations, flashcards, and official assessment attempts.',
      'Progress tracking across required modules so learners can return to unfinished work.',
    ],
    inPersonAspects: [
      'Preceptor discussion for unit workflow, emergency resources, and escalation expectations.',
      'Observed practice for safety-critical steps such as PPE flow, station turnover, and fluid removal decision-making.',
      'Trainer sign-off where policy requires a human review before independent practice.',
    ],
    completionRule:
      'Official requirements remain visible for every learner. Experienced learners see the official assessment highlighted, while learning modules stay available for review.',
  },
  'neurology-orientation': {
    overview:
      'A requested-access neurology pathway for staff who need unit-specific assessment workflow, escalation habits, and safety practice before joining the clinical area.',
    onlineAspects: [
      'Neuro assessment refreshers, escalation prompts, and policy-aligned decision checks.',
      'Stroke pathway and seizure safety cases that can be reviewed before in-person coaching.',
    ],
    inPersonAspects: [
      'Bedside neuro-check demonstration with a preceptor.',
      'Escalation walkthrough using local team roles and unit-specific resources.',
    ],
    completionRule: 'Learners can request access from the catalogue. Trainers approve enrollment before launch.',
  },
  'perfusionist-cardiac': {
    overview:
      'A restricted cardiac/perfusion workshop pathway for learners assigned to high-risk device, circuit, and emergency response training.',
    onlineAspects: [
      'Foundational circuit concepts, terminology, and safety checkpoints.',
      'Cardiac emergency review with short readiness checks.',
    ],
    inPersonAspects: [
      'Device-side demonstration with assigned trainer supervision.',
      'Competency sign-off for tasks that cannot be completed online.',
    ],
    completionRule: 'Access is assignment-controlled and should remain blocked until the trainer grants eligibility.',
  },
  'hospital-policy': {
    overview:
      'An open policy pathway available to authenticated staff. It demonstrates unrestricted access after sign-in while still tracking enrollment and completion.',
    onlineAspects: [
      'Policy readings, acknowledgement checks, and short scenario reviews.',
      'Simple learner progress tracking for audits and renewal reminders.',
    ],
    inPersonAspects: [
      'No in-person component is required by default.',
      'Managers can add a live huddle or follow-up if a local policy changes.',
    ],
    completionRule: 'Any signed-in learner can enroll without department or cohort restrictions.',
  },
};

const PREVIEW_MODULES = {
  'neurology-orientation': [
    {
      id: 'neuro-assessment-workflow',
      title: 'Neurological Assessment Workflow',
      type: 'task',
      taskCount: 3,
      description: 'A structured review of neuro checks, baseline comparison, and escalation cues.',
    },
    {
      id: 'stroke-pathway',
      title: 'Stroke Pathway and Escalation',
      type: 'mixed',
      taskCount: 4,
      description: 'Scenario practice for time-sensitive escalation and documentation expectations.',
    },
    {
      id: 'seizure-safety',
      title: 'Seizure Safety Simulation',
      type: 'mixed',
      taskCount: 3,
      description: 'Safety preparation, observation priorities, and post-event reporting practice.',
    },
  ],
  'perfusionist-cardiac': [
    {
      id: 'perfusion-circuit-basics',
      title: 'Perfusion Circuit Basics',
      type: 'task',
      taskCount: 4,
      description: 'Introductory circuit language, safety checkpoints, and common risks.',
    },
    {
      id: 'cardiac-emergency-workflow',
      title: 'Cardiac Emergency Workflow',
      type: 'mixed',
      taskCount: 3,
      description: 'Team roles, escalation rhythm, and emergency decision practice.',
    },
    {
      id: 'device-safety-signoff',
      title: 'Device Safety Sign-off',
      type: 'assessment',
      taskCount: 2,
      description: 'Trainer-observed competency review for restricted device-related practice.',
    },
  ],
  'hospital-policy': [
    {
      id: 'privacy-confidentiality',
      title: 'Privacy and Confidentiality',
      type: 'task',
      taskCount: 2,
      description: 'Core privacy expectations, documentation habits, and access boundaries.',
    },
    {
      id: 'workplace-safety',
      title: 'Workplace Safety',
      type: 'task',
      taskCount: 2,
      description: 'Safety reporting, hazard awareness, and staff responsibilities.',
    },
    {
      id: 'documentation-standards',
      title: 'Documentation Standards',
      type: 'assessment',
      taskCount: 2,
      description: 'Policy acknowledgement and scenario-based documentation checks.',
    },
  ],
};

const MODULE_DETAIL = {
  introduction: {
    estimate: '60 minutes',
    modality: 'Online',
    overview: 'Start here to understand the dialysis orientation map, learner expectations, and how the course pieces connect.',
    onlineAspects: [
      'Orientation map, learner expectations, and course navigation.',
      'Reflection prompts that help the learner identify what they already know.',
    ],
    inPersonAspects: [
      'Optional educator check-in for questions about local unit flow.',
    ],
    objectives: [
      'Describe the purpose of the renal orientation pathway.',
      'Identify where assessments, practice modules, and sign-offs fit.',
      'Know what to do next after finishing the opening module.',
    ],
  },
  'emergency-codes': {
    estimate: '45 minutes',
    modality: 'Hybrid',
    overview: 'Review facility emergency codes and the dialysis-specific response expectations before practicing escalation.',
    onlineAspects: [
      'Code meanings, first-response actions, and short response scenarios.',
      'Knowledge checks for Code Blue, Code Red, Code Pink, and unit escalation.',
    ],
    inPersonAspects: [
      'Walkthrough of emergency resources, alarms, and who to call on the unit.',
      'Preceptor discussion of local response habits.',
    ],
    objectives: [
      'Match emergency codes with the correct first action.',
      'Explain how dialysis workflow changes during an emergency.',
      'Know when to escalate to the charge nurse or response team.',
    ],
  },
  'infection-control': {
    estimate: '90 minutes',
    modality: 'Hybrid',
    overview: 'Dialysis-specific infection prevention with Hepatitis B surveillance, clean/contaminated workflow, PPE, and isolation cases.',
    onlineAspects: [
      'Source package review, PPE sequencing, cleaning requirements, and isolation scenarios.',
      'Case-based practice for transmission-based precautions.',
    ],
    inPersonAspects: [
      'Observed station turnover or PPE technique check when required by trainer policy.',
      'Discussion of unit supplies, signs, and cleaning products.',
    ],
    objectives: [
      'Separate clean and contaminated workflow in a treatment station.',
      'Choose PPE and precautions for common dialysis situations.',
      'Recognize Hepatitis B surveillance and screening requirements.',
    ],
  },
  'fluid-volume': {
    estimate: '90 minutes',
    modality: 'Online',
    overview: 'Build the calculation habits needed to determine ultrafiltration volume and judge whether a removal plan is safe.',
    onlineAspects: [
      'Fluid assessment reading, worked examples, and calculation practice.',
      'Scenario checks for dry weight, treatment time, and ultrafiltration rate.',
    ],
    inPersonAspects: [
      'Optional chart review with a preceptor using local examples.',
    ],
    objectives: [
      'Calculate ultrafiltration volume from pre-weight and dry weight.',
      'Interpret safe removal rates using the scenario context.',
      'Identify when a plan needs escalation or clarification.',
    ],
  },
  'intradialytic-fluid': {
    estimate: '90 minutes',
    modality: 'Hybrid',
    overview: 'Move from pre-treatment calculation into monitoring fluid removal during treatment, symptoms, and adjustment choices.',
    onlineAspects: [
      'Blood volume monitoring graph review and prediction practice.',
      'Decision cases for symptoms, documentation, and treatment adjustment.',
    ],
    inPersonAspects: [
      'Machine-side discussion of monitoring cues and escalation with a trainer.',
      'Review of local documentation expectations after a fluid event.',
    ],
    objectives: [
      'Recognize intradialytic symptoms related to fluid removal.',
      'Use trend information to decide when to pause, reassess, or escalate.',
      'Document treatment changes clearly.',
    ],
  },
  'bloodwork-values': {
    estimate: '90 minutes',
    modality: 'Online with official assessment',
    overview: 'Interpret renal bloodwork values, identify critical thresholds, and complete the official assessment when ready.',
    onlineAspects: [
      'Bloodwork review, flashcards, critical range practice, and official assessment.',
      'Experienced learners can move directly to the assessment when policy allows.',
    ],
    inPersonAspects: [
      'Trainer follow-up if assessment results show a safety gap or policy requires review.',
    ],
    objectives: [
      'Identify expected ranges and urgent abnormalities for common renal labs.',
      'Choose the correct nursing response to critical values.',
      'Complete the official assessment or targeted review path.',
    ],
  },
  'neuro-assessment-workflow': {
    estimate: '75 minutes',
    modality: 'Hybrid',
    overview: 'A planned neurology module for assessment rhythm, baseline comparison, and escalation decisions.',
    onlineAspects: ['Assessment checklist review and short clinical cases.'],
    inPersonAspects: ['Preceptor demonstration of focused neuro checks.'],
    objectives: ['Compare current findings against baseline.', 'Escalate changes using local workflow.'],
  },
  'stroke-pathway': {
    estimate: '90 minutes',
    modality: 'Hybrid',
    overview: 'A planned workshop module for stroke pathway recognition, urgent escalation, and documentation.',
    onlineAspects: ['Stroke pathway review and timed scenarios.'],
    inPersonAspects: ['Live escalation drill with local team roles.'],
    objectives: ['Recognize time-sensitive stroke cues.', 'Document and escalate without delay.'],
  },
  'seizure-safety': {
    estimate: '60 minutes',
    modality: 'Hybrid',
    overview: 'A planned simulation module for seizure safety, observation priorities, and post-event reporting.',
    onlineAspects: ['Safety preparation and post-event reporting review.'],
    inPersonAspects: ['Simulation or preceptor-led safety walkthrough.'],
    objectives: ['Maintain patient safety during an event.', 'Report duration, symptoms, and recovery clearly.'],
  },
  'perfusion-circuit-basics': {
    estimate: '120 minutes',
    modality: 'Hybrid',
    overview: 'A restricted cardiac learning block for circuit language, equipment awareness, and safety checkpoints.',
    onlineAspects: ['Circuit terminology and pre-work safety review.'],
    inPersonAspects: ['Device-side demonstration by assigned trainer.'],
    objectives: ['Use basic circuit terminology correctly.', 'Recognize safety checks that require trainer oversight.'],
  },
  'cardiac-emergency-workflow': {
    estimate: '90 minutes',
    modality: 'Hybrid',
    overview: 'A restricted workshop for cardiac emergency roles, escalation sequence, and response practice.',
    onlineAspects: ['Emergency role review and case prompts.'],
    inPersonAspects: ['Trainer-led response walkthrough.'],
    objectives: ['Describe team roles during escalation.', 'Follow local response sequence.'],
  },
  'device-safety-signoff': {
    estimate: '90 minutes',
    modality: 'In-person',
    overview: 'A trainer-observed sign-off for restricted device-related practice.',
    onlineAspects: ['Preparation checklist and acknowledgement.'],
    inPersonAspects: ['Observed competency review with trainer sign-off.'],
    objectives: ['Demonstrate required safety steps.', 'Know when independent practice is not permitted.'],
  },
  'privacy-confidentiality': {
    estimate: '30 minutes',
    modality: 'Online',
    overview: 'Policy learning for privacy, confidentiality, and appropriate information access.',
    onlineAspects: ['Policy reading and short acknowledgement cases.'],
    inPersonAspects: ['No in-person requirement by default.'],
    objectives: ['Protect patient information.', 'Recognize inappropriate access or disclosure.'],
  },
  'workplace-safety': {
    estimate: '30 minutes',
    modality: 'Online',
    overview: 'Policy learning for safety reporting, hazard awareness, and staff responsibilities.',
    onlineAspects: ['Safety reading and hazard-response scenarios.'],
    inPersonAspects: ['Manager huddle only if local policy requires it.'],
    objectives: ['Report hazards through the expected channel.', 'Apply core workplace safety responsibilities.'],
  },
  'documentation-standards': {
    estimate: '30 minutes',
    modality: 'Online',
    overview: 'Policy acknowledgement for clear, timely, and accountable documentation.',
    onlineAspects: ['Documentation policy review and acknowledgement check.'],
    inPersonAspects: ['Optional manager review after failed acknowledgement.'],
    objectives: ['Document clearly and on time.', 'Recognize documentation that needs correction.'],
  },
};

export const PRE_ASSESSMENT_QUESTIONS = [
  {
    id: 'experience',
    question: 'How familiar are you with hemodialysis workflow?',
    options: [
      { label: 'New to dialysis', points: 0 },
      { label: 'Some exposure', points: 1 },
      { label: 'Experienced in dialysis care', points: 2 },
    ],
  },
  {
    id: 'emergency',
    question: 'How confident are you responding to emergency codes in a renal unit?',
    options: [
      { label: 'Need full review', points: 0 },
      { label: 'Need a refresher', points: 1 },
      { label: 'Ready to assess', points: 2 },
    ],
  },
  {
    id: 'bloodwork',
    question: 'How confident are you interpreting renal bloodwork values?',
    options: [
      { label: 'Need full review', points: 0 },
      { label: 'Comfortable with common values', points: 1 },
      { label: 'Ready for case questions', points: 2 },
    ],
  },
];

export function getKnowledgeBand(score) {
  if (score >= 5) return 'experienced';
  if (score >= 3) return 'developing';
  return 'novice';
}

export const KNOWLEDGE_BAND_COPY = {
  novice: {
    label: 'Novice path',
    title: 'Start with the complete learning path',
    body: 'The recommended path keeps all learning modules in sequence before official assessment.',
  },
  developing: {
    label: 'Developing path',
    title: 'Use guided review and targeted practice',
    body: 'The recommended path keeps required modules visible and adds practice around weaker areas.',
  },
  experienced: {
    label: 'Experienced path',
    title: 'Official assessment is ready when policy allows',
    body: 'Learning modules stay available for optional review, while official assessment is highlighted as the next action.',
  },
};

export function getCourseProgress(course, questStatus) {
  const modules = getCourseModulesForCourse(course);
  if (!modules.length) return 0;
  const allTasks = modules.flatMap((m) => getTasksForModule(m));
  if (!allTasks.length) return 0;
  const complete = allTasks.filter((t) => questStatus[t.id] === 'complete').length;
  return Math.round((complete / allTasks.length) * 100);
}

export function getCourseModulesForCourse(course) {
  const modules = (course.modules || []).map((id) => MODULES_BY_ID[id]).filter(Boolean);
  return modules.length ? modules : [];
}

// Legacy: returns the flat task list for a course (used by CourseCatalogue module detail flow)
export function getCourseModules(course) {
  const modules = getCourseModulesForCourse(course);
  if (modules.length) return modules.flatMap((m) => getTasksForModule(m));
  return PREVIEW_MODULES[course.id] || [];
}

export function getCourseDetail(course) {
  return COURSE_DETAIL[course.id] || {
    overview: course.description,
    onlineAspects: ['Self-paced learning activities and knowledge checks.'],
    inPersonAspects: ['Trainer follow-up can be added where policy requires it.'],
    completionRule: 'Enrollment and completion are tracked after sign-in.',
  };
}

export function getModuleDetail(module) {
  const detail = MODULE_DETAIL[module.id] || {};
  return {
    ...module,
    estimate: detail.estimate || 'To be confirmed',
    modality: detail.modality || 'To be confirmed',
    overview: detail.overview || module.description,
    onlineAspects: detail.onlineAspects || ['Online module content and knowledge checks.'],
    inPersonAspects: detail.inPersonAspects || ['Trainer review can be added if required.'],
    objectives: detail.objectives || ['Complete the assigned learning activity.'],
    live: Boolean(QUESTS[module.id]),
  };
}

export function getCourseModuleDetails(course) {
  return getCourseModules(course).map(getModuleDetail);
}
