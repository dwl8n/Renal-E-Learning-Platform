// ─── Quest definitions ────────────────────────────────────────────────────────
export const QUESTS = {
  'introduction': {
    id: 'introduction', title: 'Introduction', type: 'task',
    xp: 600, prereqs: [],
    description: 'Welcome to the unit. Learn about the haemodialysis program, your role, and what to expect during orientation.',
    taskCount: 4,
  },
  'emergency-codes': {
    id: 'emergency-codes', title: 'Emergency Codes', type: 'task',
    xp: 75, prereqs: ['introduction'],
    description: 'Learn the facility emergency codes: Code Blue, Code Red, Code Pink, and the correct response procedures.',
    taskCount: 2,
  },
  'infection-control': {
    id: 'infection-control', title: 'Infection Control & Hep B', type: 'task',
    xp: 100, prereqs: ['introduction'],
    description: 'Dialysis-specific infection prevention: hand hygiene, PPE, clean/contaminated zones, isolation, screening, cleaning, and Hepatitis B surveillance.',
    taskCount: 4,
    tasks: [
      { key: 'reading',          label: 'Source material & Hep B overview', type: 'reading' },
      { key: 'ppe-lab',          label: 'PPE sequencing exercise',           type: 'exercise' },
      { key: 'station-safety',   label: 'Station turnover checklist',        type: 'exercise' },
      { key: 'isolation-cases',  label: 'Isolation precaution scenarios',    type: 'scenario' },
    ],
  },
  'fluid-volume': {
    id: 'fluid-volume', title: 'Fluid Assessment', type: 'task',
    xp: 150, prereqs: ['introduction'],
    description: 'Learn to calculate ultrafiltration volumes and assess whether fluid removal rates are within safe limits.',
    taskCount: 4,
    tasks: [
      { key: 'reading',    label: 'Fluid assessment overview',         type: 'reading' },
      { key: 'scenario1',  label: 'UF volume calculation practice',    type: 'exercise' },
      { key: 'scenario2',  label: 'Safe removal rate checks',          type: 'exercise' },
      { key: 'scenario3',  label: 'Combined worksheet scenarios',      type: 'exercise' },
    ],
  },
  'intradialytic-fluid': {
    id: 'intradialytic-fluid', title: 'Intradialytic Fluid Removal', type: 'task',
    xp: 150, prereqs: ['fluid-volume'],
    description: 'Monitor and manage fluid removal during a treatment: symptoms, adjustment strategies, and documentation.',
    taskCount: 3,
    tasks: [
      { key: 'reading',    label: 'Blood volume monitoring overview',  type: 'reading' },
      { key: 'scenario1',  label: 'Symptom recognition & response',   type: 'scenario' },
      { key: 'scenario2',  label: 'Fluid removal decision cases',      type: 'scenario' },
    ],
  },
  'avg-avf': {
    id: 'avg-avf', title: 'AVG / AVF Access', type: 'mixed',
    xp: 200, prereqs: ['introduction'],
    description: 'Assessment and cannulation of arteriovenous grafts and fistulas — technique, troubleshooting, and documentation.',
    taskCount: 5,
  },
  'cvc': {
    id: 'cvc', title: 'CVC Access', type: 'mixed',
    xp: 200, prereqs: ['introduction'],
    description: 'Central venous catheter care, connection/disconnection procedures, and CVC-related complications.',
    taskCount: 4,
  },
  'bloodwork-values': {
    id: 'bloodwork-values', title: 'Bloodwork Values', type: 'assessment',
    xp: 250, prereqs: ['introduction'],
    description: 'Understand which lab values are monitored, their normal ranges, critical thresholds, and the nursing response to abnormal results.',
    taskCount: 4,
    tasks: [
      { key: 'reading',     label: 'What we test and why',             type: 'reading' },
      { key: 'flashcards',  label: 'Critical values flashcards',       type: 'exercise' },
      { key: 'ranges',      label: 'Critical range identification',    type: 'exercise' },
      { key: 'assessment',  label: 'Official assessment',              type: 'assessment' },
    ],
  },
  'medication-admin': {
    id: 'medication-admin', title: 'Medication Administration', type: 'task',
    xp: 125, prereqs: ['fluid-volume'],
    description: 'Common medications given during dialysis — EPO, heparin, IV iron — indications, dosing, and charting.',
    taskCount: 3,
  },
  'potassium-protocol': {
    id: 'potassium-protocol', title: 'Potassium Protocol', type: 'task',
    xp: 100, prereqs: ['bloodwork-values'],
    description: 'Step-by-step response to critically high pre-dialysis potassium, including dialysate orders and physician notification.',
    taskCount: 2,
  },
  'complications': {
    id: 'complications', title: 'Complications & Monitoring', type: 'mixed',
    xp: 200, prereqs: ['bloodwork-values'],
    description: 'Recognise and respond to common intradialytic complications: hypotension, cramping, air embolism, and more.',
    taskCount: 5,
  },
  'renal-insight': {
    id: 'renal-insight', title: 'Renal Insight', type: 'task',
    xp: 175, prereqs: ['complications'],
    description: 'Introduction to Renal Insight documentation — charting a treatment, flagging events, and end-of-shift notes.',
    taskCount: 3,
  },
  'cerner': {
    id: 'cerner', title: 'Cerner', type: 'task',
    xp: 175, prereqs: ['complications'],
    description: 'Introduction to Renal Insight documentation — charting a treatment, flagging events, and end-of-shift notes.',
    taskCount: 3,
  },
};

// ─── Reading Content (shared between modules and Journal) ─────────────────────

export const FLUID_READING_PAGES = [
  {
    title: 'Fluid Assessment in Hemodialysis',
    sections: [
      {
        heading: 'Why Fluid Management Matters',
        body: `In end-stage renal disease (ESRD), the kidneys can no longer excrete excess fluid. Between dialysis sessions — typically 44–68 hours — patients accumulate fluid from dietary intake, beverages, and metabolic processes. This fluid builds up in the vascular and interstitial compartments, causing oedema, hypertension, and — if severe — pulmonary congestion.

Hemodialysis must safely remove this accumulated fluid during each session, typically over 3–5 hours. Too little removal leaves the patient fluid overloaded; too rapid removal causes intradialytic hypotension and cardiovascular stress.`,
      },
      {
        heading: 'What is Dry Weight?',
        body: `Dry weight (also called estimated dry weight or target weight) is the lowest weight a patient can tolerate without experiencing symptoms of dehydration or hypotension. At dry weight, the patient has no clinically significant excess fluid.

Assessing dry weight is both a science and an art. It is estimated using:
• Pre- and post-dialysis blood pressure trends
• Presence of peripheral oedema (ankles, legs, sacrum)
• Lung sounds (crackles may indicate pulmonary oedema)
• Jugular venous distension
• Patient symptoms (dyspnoea, orthopnoea, thirst)

Dry weight must be reassessed regularly, as it changes with muscle mass, nutrition, illness, and body composition over time.`,
      },
      {
        heading: 'The Ultrafiltration Goal',
        body: `Ultrafiltration (UF) is the process of removing excess fluid across the dialysis membrane using a pressure gradient. The UF volume for a given treatment is calculated from the difference between the patient's pre-dialysis weight and their target dry weight.

The challenge is removing enough fluid to achieve dry weight while minimizing cardiovascular stress. This requires careful calculation of the UF volume and UF rate.`,
      },
    ],
  },
  {
    title: 'Signs of Fluid Imbalance',
    sections: [
      {
        heading: 'Fluid Overload (Hypervolaemia)',
        body: `Common in dialysis patients who have gained significant interdialytic weight. Signs include:
• Oedema (pitting oedema of ankles, legs, sacrum)
• Hypertension — particularly pre-dialysis
• Shortness of breath, orthopnoea, paroxysmal nocturnal dyspnoea
• Crackles (rales) on lung auscultation
• Elevated jugular venous pressure (JVP)

Severe hypervolaemia may require urgent or emergency dialysis.`,
      },
      {
        heading: 'Fluid Depletion (Hypovolaemia)',
        body: `Can occur if the dry weight target is set too low, or if the patient has lost fluid through illness (vomiting, diarrhoea, fever). Signs include:
• Intradialytic hypotension (most common complication of HD)
• Dizziness, light-headedness, syncope
• Muscle cramps
• Tachycardia
• Dry mucous membranes

Always review a patient's clinical status before initiating or continuing ultrafiltration.`,
      },
      {
        heading: 'Documentation',
        body: `Accurate weight measurement is critical. Use the same scale, at the same time of day, with the patient wearing similar clothing each session. Document:
• Pre-dialysis weight
• Current dry weight target
• Calculated UF volume
• Any dry weight changes (with rationale)

When in doubt about a patient's fluid status, consult the charge nurse or nephrologist before proceeding.`,
      },
    ],
  },
];

export const INFECTION_READING_PAGES = [
  {
    title: 'Infection Risk in Dialysis',
    sections: [
      {
        heading: 'Why Dialysis Patients Are High Risk',
        body: `Hemodialysis patients are exposed to infection risk more often than many other patients because treatment repeatedly accesses the bloodstream. Catheters and needle cannulation create opportunities for bloodstream infection, and many patients also have weakened immune systems, frequent hospital exposure, surgeries, and antimicrobial use.

The major risks highlighted in the source package are blood borne infections such as Hepatitis B and C, bloodstream infections such as Staphylococcus aureus, multi-drug resistant organisms, and respiratory infections such as influenza and rhinovirus.`,
      },
      {
        heading: 'The Clinical Goal',
        body: `The goal is not to memorize a sign colour in isolation. The safe nurse recognizes the route of spread, chooses the right precautions, separates clean from contaminated workflow, disinfects for the required wet contact time, and teaches the patient when to report infection symptoms.`,
      },
    ],
  },
  {
    title: 'Standard Precautions',
    sections: [
      {
        heading: 'How Infections Spread',
        body: `Germs move from source to host through contact, droplets, and airborne particles. In dialysis, hands, equipment, treatment stations, shared surfaces, access sites, medication handling, and respiratory symptoms all matter.

Standard and transmission-based precautions work together. Standard precautions are always active; additional precautions are added when the patient condition, organism, or suspected infection requires them.`,
      },
      {
        heading: 'Four Moments of Hand Hygiene',
        body: `Perform hand hygiene before entering patient space or touching a patient, before a clean or aseptic procedure, after body fluid exposure risk, and after touching the patient or patient surroundings.

Alcohol-based hand rub is preferred unless hands are visibly soiled. Gloves never replace hand hygiene; clean gloves are treated like clean hands and must be changed when moving from contaminated to clean care.`,
      },
    ],
  },
  {
    title: 'PPE, Medication Safety, and Clean Zones',
    sections: [
      {
        heading: 'PPE in Dialysis Workflow',
        body: `Wear gloves, gown, and face protection when contact with blood or other potentially infectious material is anticipated. Gloves and face protection are required during treatment initiation, discontinuation, and procedures with splash risk.

Do not use the same gloves for more than one patient. Change gloves during care if you move from a contaminated body site or object to a clean body site or task.`,
      },
      {
        heading: 'Medication and Supply Handling',
        body: `Needles and syringes are single-use devices. Do not administer medications from a single-dose vial or IV bag to multiple patients. Perform hand hygiene and cleanse the access port before injection.

Prepare medications in a clean area away from the patient station. While the patient is present, the treatment station is contaminated. Anything taken to the station must be discarded or cleaned and disinfected before returning to a clean area.`,
      },
    ],
  },
  {
    title: 'Additional Precautions and Environmental Cleaning',
    sections: [
      {
        heading: 'Isolation and Organism-Specific Practice',
        body: `Additional precautions include airborne/contact, bed space, contact, droplet/contact, and contact plus. The sign on the patient room or bed space tells staff what must be worn before entry.

C. difficile requires contact plus-style thinking: private room when possible, dedicated toileting equipment, sporicidal cleaning, and isolation until symptoms resolve according to policy. CPE patients should dialyze in a private room and sink contamination must be escalated for correct cleaning.`,
      },
      {
        heading: 'Cleaning Contact Times and Screening',
        body: `The entire patient chair, armrests, and dialysis machine surfaces must be cleaned and disinfected between patients. Virex II 256 is used on dialysis machines and requires 10 minutes of wet contact time. Oxivir Plus is used for routine room or bed-space cleaning and requires 5 minutes.

Routine screening includes ARI screening every treatment, Hepatitis B and C screening on admission and annually, and ARO/MDRO screening on admission and at periodic intervals. A new renal-program patient is screened for MRSA and VRE; travel or out-of-country dialysis/hospitalization can trigger MDR-GNR screening and Infection Prevention and Control notification.`,
      },
      {
        heading: 'Hepatitis B Immunization Reminder',
        body: `The source package includes an Engerix-B schedule with doses at the initial dose, 1 month, 2 months, and 6 months from the first dose. Watch for anaphylaxis for 20 minutes after injection. A serious active infection is a reason to delay the scheduled Hepatitis B vaccine.`,
      },
    ],
  },
];

export const BLOODWORK_READING_SECTIONS = [
  {
    heading: 'Why We Monitor Bloodwork',
    body: `Hemodialysis patients require regular bloodwork because their kidneys can no longer regulate the body's internal environment. Without this monitoring, life-threatening electrolyte imbalances, anaemia, bone disease, and malnutrition can develop silently.

Routine labs are typically drawn monthly for stable patients, and more frequently during illness, medication changes, or after adjusting the dialysis prescription.`,
  },
  {
    heading: 'Electrolytes',
    body: `Electrolytes are the most immediately critical values in dialysis care.

• Potassium (K⁺) — The #1 emergency electrolyte in dialysis. Elevated K⁺ causes fatal cardiac arrhythmias. Critical high > 6.0 mmol/L requires immediate physician notification.
• Sodium (Na⁺) — Reflects hydration status and guides dialysate sodium prescriptions.
• Calcium (Ca²⁺) — Closely linked to PTH and bone disease management.
• Phosphorus — Chronically elevated in ESRD; drives secondary hyperparathyroidism and vascular calcification.
• Bicarbonate (HCO₃⁻) — Reflects acid-base status. Dialysis corrects metabolic acidosis.`,
  },
  {
    heading: 'Anaemia Management',
    body: `ESRD causes anaemia primarily because the damaged kidneys produce insufficient erythropoietin (EPO) — the hormone that stimulates red blood cell production.

• Hemoglobin (Hgb) — Target for dialysis patients is 100–115 g/L. Managed with ESAs (erythropoiesis-stimulating agents) and IV iron.
• Ferritin — Measures iron stores. Dialysis target > 200 µg/L.
• TSAT (Transferrin Saturation) — Reflects iron available for red cell production. Target > 20%.
• Iron must be adequate for ESAs to work — checking both ferritin and TSAT guides iron therapy decisions.`,
  },
  {
    heading: 'Nutritional Status',
    body: `Malnutrition is common in dialysis patients due to poor appetite, dietary restrictions, and the catabolic effects of the disease.

• Albumin — Primary nutritional marker. Normal 35–50 g/L; critical low < 25 g/L. Low albumin is a strong predictor of poor outcomes.
• Protein intake target: approximately 1.2 g/kg/day for hemodialysis patients.

Patients with consistently low albumin should be referred to a renal dietitian and screened for inflammation or infection.`,
  },
  {
    heading: 'Bone and Mineral Metabolism',
    body: `CKD/ESRD disrupts the delicate balance of calcium, phosphorus, and PTH, causing renal osteodystrophy and cardiovascular calcification.

• PTH (Parathyroid Hormone) — Dialysis target is 2–9× the upper limit of normal. Managed with phosphate binders, vitamin D analogues, and calcimimetics.
• Phosphorus — Target < 1.78 mmol/L. Dietary restriction and phosphate binders are the mainstay of management.

Secondary hyperparathyroidism, if untreated, causes severe bone pain, fractures, and soft tissue calcification.`,
  },
  {
    heading: 'Dialysis Adequacy',
    body: `Ensuring adequate dialysis delivery is essential for patient outcomes.

• BUN (Blood Urea Nitrogen) — The urea clearance marker. Pre- and post-dialysis BUN are used to calculate Kt/V.
• Kt/V — The gold standard measure of dialysis adequacy. Target ≥ 1.2 per session. K = clearance, t = time, V = volume of urea distribution.
• Creatinine — Highly elevated in ESRD (expected). Used alongside urine collections to estimate residual renal function.

Inadequate dialysis is associated with increased mortality, hospitalisation, and poor quality of life.`,
  },
];

// Quest layout positions for the SVG tree (1000 × 720 viewBox)
export const QUEST_POSITIONS = {
  'introduction':      { x: 500, y: 100 },
  'emergency-codes':   { x: 400, y: 250 },
  'infection-control': { x: 600, y: 250 },
  'fluid-volume':      { x: 500, y: 400 },
  'intradialytic-fluid':{ x: 500, y: 550 },
  'avg-avf':           { x: 350, y: 700 },
  'cvc':               { x: 350, y: 800 },
  'medication-admin':  { x: 600, y: 700 },
  'bloodwork-values':  { x: 500, y: 850 },
  'potassium-protocol':{ x: 400, y: 1000 },
  'complications':     { x: 400, y: 1150 },
  'renal-insight':     { x: 600, y: 1000 },
  'cerner':            { x: 600, y: 1100 },
};

// Edges (from → to)
export const QUEST_EDGES = [
  ['introduction', 'emergency-codes'],
  ['introduction', 'infection-control'],
  // ['introduction', 'fluid-volume'],
  ['fluid-volume', 'intradialytic-fluid'],
  ['intradialytic-fluid', 'avg-avf'],
  ['intradialytic-fluid', 'cvc'],
  ['intradialytic-fluid', 'medication-admin'],
  // ['cvc', 'bloodwork-values'],
  // ['avg-avf', 'bloodwork-values'],
  // ['medication-admin', 'bloodwork-values'],
  ['bloodwork-values', 'potassium-protocol'],
  ['potassium-protocol', 'complications'],
  ['bloodwork-values', 'renal-insight'],
  // ['bloodwork-values', 'cerner'],
];

// ─── Bloodwork Flashcards ────────────────────────────────────────────────────
export const FLASHCARDS = [
  {
    id: 'k', label: 'Potassium (K⁺)',
    front: 'What is the normal serum potassium range?',
    back: 'Normal: 3.5 – 5.0 mmol/L\n\nCritical Low: < 3.0 mmol/L\nCritical High: > 6.0 mmol/L\n\nAction: Notify physician immediately for critical values.',
  },
  {
    id: 'na', label: 'Sodium (Na⁺)',
    front: 'What is the normal serum sodium range?',
    back: 'Normal: 135 – 145 mmol/L\n\nCritical Low: < 120 mmol/L\nCritical High: > 155 mmol/L\n\nAction: Notify physician for critical values.',
  },
  {
    id: 'ca', label: 'Calcium (Ca²⁺)',
    front: 'What is the normal total serum calcium range?',
    back: 'Normal: 2.12 – 2.52 mmol/L\n\nCritical Low: < 1.75 mmol/L\nCritical High: > 3.0 mmol/L\n\nAction: Notify physician for critical values.',
  },
  {
    id: 'phos', label: 'Phosphorus',
    front: 'What is the pre-dialysis phosphorus target?',
    back: 'Normal (general): 0.97 – 1.45 mmol/L\nDialysis Target: < 1.78 mmol/L\n\nElevated: > 1.78 mmol/L → Notify physician; review phosphate binder compliance.',
  },
  {
    id: 'hgb', label: 'Hemoglobin',
    front: 'What is the hemoglobin target range for dialysis patients?',
    back: 'Target: 100 – 115 g/L\n\nCritical Low: < 70 g/L\n\nAction: Notify physician for critical low; may require EPO dose adjustment or transfusion.',
  },
  {
    id: 'alb', label: 'Albumin',
    front: 'What is the normal serum albumin range and critical low?',
    back: 'Normal: 35 – 50 g/L\n\nCritical Low: < 25 g/L → Nutritional assessment, notify physician.\n\nAlbumin is a marker of nutritional status and chronic inflammation.',
  },
  {
    id: 'bicarb', label: 'Bicarbonate (HCO₃⁻)',
    front: 'What is the normal bicarbonate range?',
    back: 'Normal: 22 – 29 mmol/L\n\nCritical Low: < 15 mmol/L (severe metabolic acidosis)\nCritical High: > 35 mmol/L\n\nAction: Notify physician for critical values.',
  },
  {
    id: 'pth', label: 'PTH',
    front: 'What does PTH stand for and what is the dialysis target?',
    back: 'Parathyroid Hormone\n\nDialysis target: 2 – 9× the upper limit of normal\n(approx. 130 – 585 pmol/L)\n\nManaged with phosphate control, vitamin D analogues, and calcimimetics.',
  },
  {
    id: 'ferritin', label: 'Ferritin',
    front: 'What is the ferritin target for dialysis patients?',
    back: 'General Normal: 15 – 200 µg/L\nDialysis Target: > 200 µg/L\n\nLow (< 100 µg/L) may indicate iron deficiency → consider IV iron.\nVery high (> 800 µg/L) may indicate inflammation or iron overload.',
  },
  {
    id: 'tsat', label: 'TSAT',
    front: 'What does TSAT measure and what is the target?',
    back: 'Transferrin Saturation — reflects how much circulating iron is available for erythropoiesis.\n\nTarget: > 20% (ideally 20 – 50%)\n\nLow TSAT despite adequate ferritin may suggest functional iron deficiency.',
  },
  {
    id: 'bun', label: 'BUN',
    front: 'What is BUN and how is it used in dialysis?',
    back: 'Blood Urea Nitrogen — a byproduct of protein metabolism cleared by the kidneys.\n\nPre-dialysis BUN is elevated in ESRD (often > 15 mmol/L).\nUsed with post-dialysis BUN to calculate Kt/V (dialysis adequacy).\n\nTarget Kt/V: ≥ 1.2 per treatment.',
  },
  {
    id: 'creat', label: 'Creatinine',
    front: 'What role does creatinine play in dialysis monitoring?',
    back: 'Creatinine is a muscle-metabolism byproduct cleared by the kidneys.\n\nHighly elevated pre-dialysis (often 400 – 1200 µmol/L) in ESRD — expected.\nUsed to estimate residual renal function (urine creatinine clearance).\n\nTrend over time indicates disease progression.',
  },
];

// ─── Bloodwork Assessment Questions ─────────────────────────────────────────
export const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    question: 'What is the normal serum potassium range?',
    options: ['2.5 – 3.5 mmol/L', '3.5 – 5.0 mmol/L', '5.0 – 7.0 mmol/L', '1.5 – 3.5 mmol/L'],
    correct: 1,
    explanation: 'Normal potassium is 3.5 – 5.0 mmol/L. Values outside 3.0 – 6.0 mmol/L are considered critical and require immediate physician notification.',
  },
  {
    id: 2,
    question: 'A patient\'s pre-dialysis potassium is 6.4 mmol/L. This is:',
    options: ['Within normal range', 'Mildly elevated — monitor only', 'Critically high — notify physician immediately', 'A normal finding for dialysis patients'],
    correct: 2,
    explanation: 'A potassium > 6.0 mmol/L is critically high. The physician must be notified immediately as this poses a risk of life-threatening cardiac arrhythmia.',
  },
  {
    id: 3,
    question: 'What is the pre-dialysis phosphorus target for hemodialysis patients?',
    options: ['< 0.97 mmol/L', '< 1.45 mmol/L', '< 1.78 mmol/L', '< 2.50 mmol/L'],
    correct: 2,
    explanation: 'The pre-dialysis phosphorus target is < 1.78 mmol/L. Elevated phosphorus contributes to renal osteodystrophy and cardiovascular calcification.',
  },
  {
    id: 4,
    question: 'Which hemoglobin level would be considered critically low?',
    options: ['95 g/L', '85 g/L', '75 g/L', '65 g/L'],
    correct: 3,
    explanation: 'A hemoglobin < 70 g/L is critically low. The target for dialysis patients is 100 – 115 g/L, managed with erythropoietin-stimulating agents and iron.',
  },
  {
    id: 5,
    question: 'What albumin level is considered critically low and requires physician notification?',
    options: ['< 35 g/L', '< 30 g/L', '< 25 g/L', '< 20 g/L'],
    correct: 2,
    explanation: 'Albumin < 25 g/L is critically low and indicates severe malnutrition or significant protein loss. Normal range is 35 – 50 g/L.',
  },
  {
    id: 6,
    question: 'What is the normal serum sodium range?',
    options: ['125 – 135 mmol/L', '135 – 145 mmol/L', '145 – 155 mmol/L', '115 – 130 mmol/L'],
    correct: 1,
    explanation: 'Normal sodium is 135 – 145 mmol/L. Critical thresholds are < 120 mmol/L and > 155 mmol/L.',
  },
  {
    id: 7,
    question: 'A hemoglobin of 108 g/L in a dialysis patient is:',
    options: ['Critically low', 'Within the dialysis target range', 'Elevated — reduce EPO dose', 'Normal for the general population'],
    correct: 1,
    explanation: 'The hemoglobin target for dialysis patients is 100 – 115 g/L. A result of 108 g/L is within target.',
  },
  {
    id: 8,
    question: 'What does Kt/V measure?',
    options: ['Potassium levels', 'Dialysis adequacy', 'Blood pressure control', 'Calcium-phosphorus product'],
    correct: 1,
    explanation: 'Kt/V is a measure of dialysis adequacy — K = dialyzer clearance, t = treatment time, V = volume of distribution of urea. Target is ≥ 1.2 per treatment.',
  },
  {
    id: 9,
    question: 'Which of the following is used to calculate dialysis adequacy (Kt/V)?',
    options: ['Pre- and post-dialysis potassium', 'Pre- and post-dialysis BUN', 'Pre- and post-dialysis creatinine', 'Pre- and post-dialysis albumin'],
    correct: 1,
    explanation: 'BUN (Blood Urea Nitrogen) is the primary marker used to calculate Kt/V. Pre- and post-dialysis BUN samples are required.',
  },
  {
    id: 10,
    question: 'What does TSAT measure?',
    options: ['Total serum albumin turnover', 'Transferrin saturation — circulating iron availability', 'Thyroid-stimulating antibody titer', 'Treatment session adequacy threshold'],
    correct: 1,
    explanation: 'TSAT (Transferrin Saturation) reflects how much of the circulating transferrin is bound to iron — a marker of functional iron availability for red blood cell production. Target is > 20%.',
  },
  {
    id: 11,
    question: 'Normal total serum calcium range is approximately:',
    options: ['1.50 – 2.10 mmol/L', '2.12 – 2.52 mmol/L', '2.80 – 3.50 mmol/L', '0.50 – 1.50 mmol/L'],
    correct: 1,
    explanation: 'Normal total serum calcium is 2.12 – 2.52 mmol/L. Critical low is < 1.75 mmol/L and critical high is > 3.0 mmol/L.',
  },
  {
    id: 12,
    question: 'A pre-dialysis bicarbonate of 14 mmol/L indicates:',
    options: ['Normal acid-base status', 'Metabolic alkalosis', 'Metabolic acidosis', 'Respiratory alkalosis'],
    correct: 2,
    explanation: 'Normal bicarbonate is 22 – 29 mmol/L. A value of 14 mmol/L indicates metabolic acidosis — a common finding in ESRD when not adequately managed. Critically low is < 15 mmol/L.',
  },
  {
    id: 13,
    question: 'Which lab value is the primary indicator of a patient\'s nutritional status?',
    options: ['Potassium', 'Albumin', 'Creatinine', 'Sodium'],
    correct: 1,
    explanation: 'Albumin is the most commonly used marker of nutritional status. It also reflects chronic inflammation. Target is 35 – 50 g/L; levels below 35 g/L suggest malnutrition.',
  },
  {
    id: 14,
    question: 'PTH stands for:',
    options: ['Phosphorus-Triggering Hormone', 'Parathyroid Hormone', 'Potassium Transport Hormone', 'Peritoneal Treatment Hormone'],
    correct: 1,
    explanation: 'PTH (Parathyroid Hormone) is elevated in CKD/ESRD due to phosphate retention and reduced vitamin D activation. It drives renal osteodystrophy and is a key treatment target.',
  },
  {
    id: 15,
    question: 'A ferritin of 85 µg/L in a dialysis patient suggests:',
    options: ['Iron overload — hold iron therapy', 'Adequate iron stores', 'Possible iron deficiency — consider IV iron', 'Normal finding — no action needed'],
    correct: 2,
    explanation: 'The dialysis target for ferritin is > 200 µg/L. A ferritin of 85 µg/L is below target and may indicate iron deficiency. IV iron supplementation should be considered, alongside TSAT.',
  },
  {
    id: 16,
    question: 'Which of the following is the MOST urgent finding to report immediately?',
    options: ['Albumin 32 g/L', 'Phosphorus 1.9 mmol/L', 'Potassium 6.5 mmol/L', 'Hemoglobin 100 g/L'],
    correct: 2,
    explanation: 'Potassium 6.5 mmol/L is critically elevated (> 6.0 mmol/L) and poses immediate risk of fatal cardiac arrhythmia. This requires immediate physician notification.',
  },
  {
    id: 17,
    question: 'How often is routine bloodwork typically drawn for stable hemodialysis patients?',
    options: ['Daily', 'Weekly', 'Monthly', 'Every 6 months'],
    correct: 2,
    explanation: 'Stable hemodialysis patients typically have routine bloodwork drawn monthly. More frequent labs may be ordered during episodes of instability, medication changes, or infection.',
  },
  {
    id: 18,
    question: 'A critically low sodium level is defined as:',
    options: ['< 130 mmol/L', '< 125 mmol/L', '< 120 mmol/L', '< 115 mmol/L'],
    correct: 2,
    explanation: 'Critically low sodium is < 120 mmol/L (severe hyponatraemia). This can cause cerebral oedema and requires immediate medical attention.',
  },
  {
    id: 19,
    question: 'Which of the following correctly describes the relationship between phosphorus and PTH in dialysis patients?',
    options: [
      'Low phosphorus stimulates PTH release',
      'Elevated phosphorus contributes to secondary hyperparathyroidism',
      'PTH lowers serum phosphorus directly',
      'Phosphorus and PTH are unrelated in dialysis patients',
    ],
    correct: 1,
    explanation: 'Elevated phosphorus (hyperphosphataemia) stimulates PTH secretion, contributing to secondary hyperparathyroidism and renal osteodystrophy. Managing phosphorus is central to PTH control.',
  },
  {
    id: 20,
    question: 'A patient\'s pre-dialysis BUN is 28 mmol/L and post-dialysis BUN is 10 mmol/L. This information is used to:',
    options: [
      'Diagnose acute kidney injury',
      'Calculate Kt/V and assess dialysis adequacy',
      'Determine phosphate binder dosing',
      'Adjust EPO dose',
    ],
    correct: 1,
    explanation: 'Pre- and post-dialysis BUN values are used to calculate Kt/V — the primary measure of dialysis adequacy. The reduction ratio (URR) can also be calculated from these values.',
  },
  {
    id: 21,
    question: 'Normal serum bicarbonate in a dialysis patient is maintained between:',
    options: ['15 – 20 mmol/L', '22 – 29 mmol/L', '30 – 38 mmol/L', '10 – 18 mmol/L'],
    correct: 1,
    explanation: 'The target bicarbonate range is 22 – 29 mmol/L. Dialysis corrects metabolic acidosis in ESRD by removing H⁺ ions and delivering bicarbonate from the dialysate.',
  },
  {
    id: 22,
    question: 'A pre-dialysis phosphorus of 2.2 mmol/L in a dialysis patient is:',
    options: ['Normal', 'Within the dialysis target', 'Above the dialysis target — notify physician', 'Critically high — emergency treatment required'],
    correct: 2,
    explanation: 'The pre-dialysis phosphorus target is < 1.78 mmol/L. A result of 2.2 mmol/L is above target and should be reported to the physician. Compliance with phosphate binders should be reviewed.',
  },
  {
    id: 23,
    question: 'Iron therapy in dialysis patients is best guided by monitoring which TWO values together?',
    options: ['Hemoglobin and albumin', 'Ferritin and TSAT', 'BUN and creatinine', 'Potassium and sodium'],
    correct: 1,
    explanation: 'Ferritin (iron stores) and TSAT (functional iron availability) are used together to guide iron therapy. High ferritin with low TSAT can indicate functional iron deficiency despite adequate stores.',
  },
  {
    id: 24,
    question: 'Which bloodwork result would most likely prompt a change in EPO (erythropoietin) dosing?',
    options: ['Potassium 5.2 mmol/L', 'Hemoglobin 88 g/L', 'Phosphorus 1.6 mmol/L', 'Sodium 139 mmol/L'],
    correct: 1,
    explanation: 'Hemoglobin 88 g/L is below the dialysis target of 100 – 115 g/L, suggesting suboptimal EPO response. The dose may need to be increased, or iron deficiency investigated.',
  },
  {
    id: 25,
    question: 'Which statement about creatinine in ESRD is correct?',
    options: [
      'Creatinine should be normal between dialysis treatments',
      'Elevated pre-dialysis creatinine is expected and primarily used to estimate residual renal function',
      'Creatinine > 200 µmol/L always requires dialysis to be started',
      'Creatinine is the most important marker of dialysis adequacy',
    ],
    correct: 1,
    explanation: 'Pre-dialysis creatinine is chronically elevated in ESRD (often 400 – 1200+ µmol/L) and is expected. It is primarily used alongside urine collections to estimate residual renal function, not as a marker of dialysis adequacy.',
  },
];

// ─── Fluid Volume Calculation Scenarios ──────────────────────────────────────
export const UF_VOLUME_SCENARIOS = [
  {
    id: 1,
    patientName: 'Mr. A. Okafor', age: 58,
    preDx: 73.2, dryWeight: 71.0,
    hint: 'UF Volume (mL) = (Pre-dialysis weight − Dry weight) × 1000',
    answer: 2200,
    explanation: '73.2 kg − 71.0 kg = 2.2 kg excess fluid. 2.2 × 1000 = 2,200 mL to be removed.',
  },
  {
    id: 2,
    patientName: 'Ms. L. Nguyen', age: 44,
    preDx: 62.8, dryWeight: 60.5,
    hint: 'UF Volume (mL) = (Pre-dialysis weight − Dry weight) × 1000',
    answer: 2300,
    explanation: '62.8 kg − 60.5 kg = 2.3 kg. 2.3 × 1000 = 2,300 mL to remove.',
  },
  {
    id: 3,
    patientName: 'Mr. T. Reinholt', age: 67,
    preDx: 84.5, dryWeight: 83.0,
    hint: 'UF Volume (mL) = (Pre-dialysis weight − Dry weight) × 1000',
    answer: 1500,
    explanation: '84.5 kg − 83.0 kg = 1.5 kg. 1.5 × 1000 = 1,500 mL.',
  },
  {
    id: 4,
    patientName: 'Ms. D. Ferreira', age: 52,
    preDx: 55.4, dryWeight: 54.0,
    hint: 'UF Volume (mL) = (Pre-dialysis weight − Dry weight) × 1000',
    answer: 1400,
    explanation: '55.4 kg − 54.0 kg = 1.4 kg. 1.4 × 1000 = 1,400 mL.',
  },
];

export const UF_RATE_SCENARIOS = [
  {
    id: 1,
    patientName: 'Mr. A. Okafor', dryWeight: 71.0,
    ufVolume: 2200, treatmentHrs: 4,
    answer: 'safe',
    ufRate: 550, ratePerKg: 7.75,
    explanation: 'UF Rate = 2,200 mL ÷ 4 hr = 550 mL/hr. Per kg: 550 ÷ 71 = 7.75 mL/kg/hr. This is below the 13 mL/kg/hr limit — safe to proceed.',
  },
  {
    id: 2,
    patientName: 'Mr. M. Singh', dryWeight: 58.0,
    ufVolume: 3800, treatmentHrs: 3.5,
    answer: 'unsafe',
    ufRate: 1086, ratePerKg: 18.7,
    explanation: 'UF Rate = 3,800 mL ÷ 3.5 hr ≈ 1,086 mL/hr. Per kg: 1,086 ÷ 58 ≈ 18.7 mL/kg/hr. This EXCEEDS the 13 mL/kg/hr safe limit. Notify the physician — treatment duration may need to be extended.',
  },
  {
    id: 3,
    patientName: 'Ms. R. Patel', dryWeight: 64.0,
    ufVolume: 2800, treatmentHrs: 4,
    answer: 'safe',
    ufRate: 700, ratePerKg: 10.9,
    explanation: 'UF Rate = 2,800 mL ÷ 4 hr = 700 mL/hr. Per kg: 700 ÷ 64 = 10.9 mL/kg/hr. Below 13 mL/kg/hr — safe.',
  },
  {
    id: 4,
    patientName: 'Mr. B. Chen', dryWeight: 52.0,
    ufVolume: 3200, treatmentHrs: 3,
    answer: 'unsafe',
    ufRate: 1067, ratePerKg: 20.5,
    explanation: 'UF Rate = 3,200 ÷ 3 ≈ 1,067 mL/hr. Per kg: 1,067 ÷ 52 ≈ 20.5 mL/kg/hr. Well above 13 mL/kg/hr. Notify physician immediately.',
  },
];

export const COMBINED_SCENARIOS = [
  {
    id: 1,
    patientName: 'Ms. J. Kowalski', age: 61,
    preDx: 70.6, dryWeight: 68.0, treatmentHrs: 4,
    ufAnswer: 2600, ufRateAnswer: 'safe',
    ufRate: 650, ratePerKg: 9.6,
    explanation: 'UF Volume = (70.6 − 68.0) × 1000 = 2,600 mL.\nUF Rate = 2,600 ÷ 4 = 650 mL/hr.\nPer kg: 650 ÷ 68 = 9.6 mL/kg/hr. Safe (< 13 mL/kg/hr).',
  },
  {
    id: 2,
    patientName: 'Mr. O. Mensah', age: 49,
    preDx: 78.9, dryWeight: 75.0, treatmentHrs: 3,
    ufAnswer: 3900, ufRateAnswer: 'unsafe',
    ufRate: 1300, ratePerKg: 17.3,
    explanation: 'UF Volume = (78.9 − 75.0) × 1000 = 3,900 mL.\nUF Rate = 3,900 ÷ 3 = 1,300 mL/hr.\nPer kg: 1,300 ÷ 75 ≈ 17.3 mL/kg/hr. UNSAFE — notify physician.',
  },
];

// ─── Reference Data ───────────────────────────────────────────────────────────
export const CRITICAL_VALUES_TABLE = [
  { test: 'Potassium (K⁺)',    unit: 'mmol/L', normal: '3.5 – 5.0',  critLow: '< 3.0',    critHigh: '> 6.0',   action: 'Notify physician immediately' },
  { test: 'Sodium (Na⁺)',      unit: 'mmol/L', normal: '135 – 145',  critLow: '< 120',    critHigh: '> 155',   action: 'Notify physician' },
  { test: 'Calcium (Ca²⁺)',    unit: 'mmol/L', normal: '2.12 – 2.52',critLow: '< 1.75',   critHigh: '> 3.0',   action: 'Notify physician' },
  { test: 'Phosphorus',        unit: 'mmol/L', normal: '0.97 – 1.45',critLow: '—',        critHigh: '> 1.78',  action: 'Notify physician; review binders' },
  { test: 'Hemoglobin',        unit: 'g/L',    normal: '100–115 (HD)', critLow: '< 70',    critHigh: '> 200',   action: 'Notify physician; EPO review' },
  { test: 'Albumin',           unit: 'g/L',    normal: '35 – 50',    critLow: '< 25',     critHigh: '—',       action: 'Notify physician; nutritional review' },
  { test: 'Bicarbonate (HCO₃⁻)',unit:'mmol/L', normal: '22 – 29',   critLow: '< 15',     critHigh: '> 35',    action: 'Notify physician' },
  { test: 'BUN',               unit: 'mmol/L', normal: '2.5 – 7.1', critLow: '—',        critHigh: '—',       action: 'Used for Kt/V calculation' },
  { test: 'Creatinine',        unit: 'µmol/L', normal: '62 – 115',  critLow: '—',        critHigh: '—',       action: 'Elevated expected; track trend' },
  { test: 'PTH',               unit: 'pmol/L', normal: '1.6 – 6.9', critLow: '—',        critHigh: '>585',    action: 'Dialysis target 2–9× ULN' },
  { test: 'Ferritin',          unit: 'µg/L',   normal: '15 – 200',  critLow: '< 100',    critHigh: '> 800',   action: 'Dialysis target > 200' },
  { test: 'TSAT',              unit: '%',       normal: '20 – 50',   critLow: '< 20',     critHigh: '—',       action: 'Guide IV iron therapy' },
];

export const FORMULAS = [
  {
    name: 'Ultrafiltration Volume',
    formula: 'UF Volume (mL) = (Pre-dialysis weight − Dry weight) × 1000',
    notes: 'Weights in kg. Multiply by 1000 to convert kg to mL (assuming fluid density ≈ 1 kg/L).',
  },
  {
    name: 'Ultrafiltration Rate',
    formula: 'UF Rate (mL/hr) = UF Volume (mL) ÷ Treatment Time (hr)',
    notes: 'Safe limit: ≤ 13 mL/kg/hr (based on dry weight). Rates above this threshold increase risk of intradialytic hypotension and cardiovascular events.',
  },
  {
    name: 'UF Rate per kg',
    formula: 'UF Rate/kg = UF Rate (mL/hr) ÷ Dry Weight (kg)',
    notes: 'Must be ≤ 13 mL/kg/hr. If exceeded, notify physician — treatment duration may need to be extended.',
  },
  {
    name: 'Urea Reduction Ratio (URR)',
    formula: 'URR (%) = [(Pre-BUN − Post-BUN) ÷ Pre-BUN] × 100',
    notes: 'Target ≥ 65%. Provides a quick estimate of dialysis adequacy. Less accurate than Kt/V but simpler to calculate.',
  },
  {
    name: 'Kt/V (Daugirdas single-pool)',
    formula: 'Kt/V = −ln(R − 0.008 × t) + (4 − 3.5 × R) × UF/W',
    notes: 'R = post-BUN/pre-BUN, t = treatment time (hr), UF = ultrafiltration volume (L), W = post-dialysis weight (kg). Target ≥ 1.2.',
  },
];

export const GLOSSARY = [
  { term: 'Arteriovenous Fistula (AVF)', def: 'A surgically created connection between an artery and vein, usually in the forearm or upper arm. The gold-standard vascular access for hemodialysis — lower infection risk, longer lifespan.', quest: 'avg-avf' },
  { term: 'Arteriovenous Graft (AVG)', def: 'A synthetic tube connecting an artery to a vein, used when native vessels are unsuitable for a fistula. Higher infection and thrombosis rates than AVF.', quest: 'avg-avf' },
  { term: 'Central Venous Catheter (CVC)', def: 'A large-bore tunnelled or non-tunnelled catheter placed in a central vein (jugular, subclavian, femoral). Used when no permanent access is available — higher infection risk.', quest: 'cvc' },
  { term: 'Dialysate', def: 'The electrolyte solution used in the dialyzer. Flows countercurrent to blood, creating concentration gradients that drive diffusion of waste products and electrolyte correction.' },
  { term: 'Dry Weight', def: 'The target post-dialysis weight at which the patient has no excess fluid — assessed by clinical signs (BP, edema, lung sounds). Must be reassessed regularly as body composition changes.', quest: 'fluid-volume' },
  { term: 'Erythropoiesis-Stimulating Agent (ESA)', def: 'Medications (e.g., epoetin alfa, darbepoetin) that stimulate red blood cell production to treat anemia in CKD/ESRD. Effectiveness depends on adequate iron stores.' },
  { term: 'Hemodialysis (HD)', def: 'A renal replacement therapy where blood is pumped through an extracorporeal circuit, passed through a dialyzer (artificial kidney), and returned to the patient. Typically 3× per week, 3–5 hours per session.' },
  { term: 'Heparin', def: 'An anticoagulant used during hemodialysis to prevent clotting in the extracorporeal circuit. Given as a bolus and/or continuous infusion; contraindicated in some bleeding states.' },
  { term: 'Kt/V', def: 'A dimensionless index of dialysis adequacy. K = dialyzer urea clearance, t = time, V = urea distribution volume. Single-pool target is ≥ 1.2 per session.', quest: 'bloodwork-values' },
  { term: 'Phosphate Binder', def: 'Medications taken with meals to bind dietary phosphate and prevent its absorption. Examples: calcium carbonate, sevelamer, lanthanum carbonate. Critical for managing hyperphosphataemia.' },
  { term: 'Recirculation', def: 'When dialyzed blood re-enters the dialyzer before returning to systemic circulation, reducing treatment efficiency. Assessed by blood sampling or dilution methods.' },
  { term: 'Residual Renal Function (RRF)', def: 'Remaining kidney function in dialysis patients, measured by urine output and clearance. Preservation of RRF is associated with better survival outcomes.' },
  { term: 'Secondary Hyperparathyroidism', def: 'Excessive PTH secretion driven by hypocalcaemia, hyperphosphataemia, and reduced calcitriol production in CKD. Leads to renal osteodystrophy and cardiovascular calcification.', quest: 'bloodwork-values' },
  { term: 'Ultrafiltration (UF)', def: 'The process of removing excess fluid from the blood during hemodialysis by creating a pressure gradient across the dialysis membrane.', quest: 'fluid-volume' },
  { term: 'Urea Reduction Ratio (URR)', def: 'The percentage reduction in blood urea nitrogen (BUN) during a single dialysis session. Target ≥ 65%. Used as a simplified measure of dialysis adequacy.' },
  { term: 'Vascular Access', def: 'The site used to connect the patient to the dialysis circuit. Types: AVF (preferred), AVG, and CVC. Complications include thrombosis, stenosis, and infection.' },
  { term: 'Blood Volume Monitor (BVM)', def: 'A device that uses ultrasound to measure hemoglobin/hematocrit concentration in blood. As fluid is removed, blood concentrates and RBV drops. Provides real-time feedback on vascular refill.', quest: 'intradialytic-fluid' },
  { term: 'Relative Blood Volume (RBV)', def: 'The percentage of blood volume remaining relative to the start of treatment (baseline = 100%). A drop in RBV indicates blood is becoming more concentrated as fluid is removed. Policy minimum is 85%.', quest: 'intradialytic-fluid' },
  { term: 'Vascular Refill', def: 'The process by which fluid moves from interstitial (tissue) spaces back into the bloodstream during fluid removal. Driven by oncotic pressure (albumin) and osmotic forces. When refill cannot keep pace with the UFR, RBV drops rapidly.', quest: 'intradialytic-fluid' },
  { term: 'UF Profile', def: 'A programmed pattern of UFR changes over the course of a dialysis treatment. Some patients tolerate a higher UFR early (when interstitial reserves are high) and need a lower rate toward the end.', quest: 'intradialytic-fluid' },
];

// ─── Phoebe Case (Clinical Walkthrough — Bloodwork module) ───────────────────
export const PHOEBE_CASE = {
  patient: {
    name: 'Phoebe',
    treatment: '4 hr HD · 3×/week',
    access: 'Right IJ tunnelled CVC (in situ since 2015)',
    dialysate: '2K bath',
  },
  phases: [
    {
      id: 'adequacy',
      title: 'Phase 1: Dialysis Adequacy',
      subtitle: 'BUN · Creatinine · Kt/V',
      intro: 'Before reviewing electrolytes, we assess whether dialysis is doing its job. Kt/V measures how much urea was cleared relative to the patient\'s size.',
      annotation: {
        title: 'Kt/V & URR Targets',
        body: 'The GRH minimum Kt/V per treatment is 1.4. Phoebe\'s Kt/V is 1.55 — above target. Her URR of 70.1% also exceeds the 65% threshold, confirming adequate clearance.',
      },
      kpis: [
        { label: 'Kt/V', value: '1.55', target: '≥ 1.4',  status: 'ok' },
        { label: 'URR',  value: '70.1%', target: '≥ 65%', status: 'ok' },
      ],
      rangeBars: [
        { key: 'preBUN',     label: 'Pre-Dialysis BUN',  value: 20.4, unit: 'mmol/L', critLow: null, normal: '2.5–7.1', critHigh: null, displayNote: 'Elevated — expected in ESRD' },
        { key: 'postBUN',    label: 'Post-Dialysis BUN', value: 6.1,  unit: 'mmol/L', critLow: null, normal: '2.5–7.1', critHigh: null },
        { key: 'creatinine', label: 'Creatinine',         value: 671,  unit: 'µmol/L', critLow: null, normal: '62–115',  critHigh: null, displayNote: 'Elevated — expected in ESRD' },
      ],
      question: {
        text: 'Based on Phoebe\'s Kt/V of 1.55 and URR of 70.1%, is she adequately dialyzed?',
        options: [
          'Yes — both markers exceed their targets',
          'No — Kt/V must be ≥ 2.0 to be adequate',
          'Unclear — sodium levels must be reviewed first',
        ],
        correct: 0,
        explanation: 'Phoebe is well-dialyzed. Her Kt/V of 1.55 exceeds the GRH minimum of 1.4, and her URR of 70.1% exceeds the 65% threshold. Pre-dialysis BUN is high (expected in ESRD) — what matters is the relative clearance, not the absolute pre-value.',
      },
    },
    {
      id: 'electrolytes',
      title: 'Phase 2: Electrolytes',
      subtitle: 'K⁺ · Na⁺ · HCO₃⁻',
      intro: 'Electrolytes must be reviewed each treatment. Potassium is the most urgent — a critical high can cause fatal arrhythmia. Sodium often reflects hydration status in dialysis patients.',
      annotation: {
        title: 'Hyponatraemia in Dialysis',
        body: 'Sodium of 131 mmol/L is below normal. In dialysis patients this most often reflects fluid overload (dilutional hyponatraemia) rather than true sodium loss. The 2K bath is appropriate — Phoebe\'s potassium is within normal range.',
      },
      rangeBars: [
        { key: 'k',    label: 'Potassium',   value: 4.8, unit: 'mmol/L', critLow: 3.0, normal: '3.5–5.0', critHigh: 6.0 },
        { key: 'na',   label: 'Sodium',      value: 131, unit: 'mmol/L', critLow: 120, normal: '135–145', critHigh: 155 },
        { key: 'hco3', label: 'Bicarbonate', value: 25,  unit: 'mmol/L', critLow: 15,  normal: '22–29',   critHigh: 35  },
      ],
      question: {
        text: 'Phoebe\'s sodium is 131 mmol/L. What does this most likely indicate in a dialysis patient?',
        options: [
          'Fluid overload (dilutional hyponatraemia) — the most common cause in dialysis',
          'True sodium loss — the patient needs IV sodium supplementation immediately',
          'This is a normal sodium range for dialysis patients',
        ],
        correct: 0,
        explanation: 'In hemodialysis patients, hyponatraemia is almost always dilutional — caused by excess fluid intake between sessions. At 131 mmol/L it is below normal (135–145), but well above the critical threshold of 120. Fluid compliance counselling and monitoring are the primary interventions.',
      },
    },
    {
      id: 'minerals',
      title: 'Phase 3: Minerals & Bone',
      subtitle: 'Ca²⁺ · PO₄ · PTH',
      intro: 'CKD disrupts the balance between calcium, phosphorus, and PTH — a condition called CKD-MBD. Untreated, it leads to progressive bone disease and cardiovascular calcification.',
      annotation: {
        title: 'The CKD-MBD Cycle',
        body: 'Declining kidney function → phosphorus rises, vitamin D falls → serum calcium drops → PTH rises to compensate → calcium is mobilised from bone → bone disease progresses. Managing all three values together is essential.',
      },
      rangeBars: [
        { key: 'ca',   label: 'Calcium',    value: 1.92, unit: 'mmol/L', critLow: 1.75, normal: '2.12–2.52', critHigh: 3.0  },
        { key: 'phos', label: 'Phosphorus', value: 1.49, unit: 'mmol/L', critLow: null, normal: '0.97–1.45', critHigh: 1.78 },
        { key: 'pth',  label: 'PTH',        value: 18.9, unit: 'pmol/L', critLow: null, normal: '1.6–6.9',   critHigh: 585  },
      ],
      question: {
        text: 'Phoebe\'s calcium is 1.92 mmol/L — below normal but above the critical threshold of 1.75. What is the appropriate nursing response?',
        options: [
          'Notify the physician — calcium is below normal and should be reviewed in the context of CKD-MBD',
          'No action needed — calcium is above the critical low threshold of 1.75',
          'Give IV calcium gluconate immediately',
        ],
        correct: 0,
        explanation: 'While 1.92 is above the critical threshold (1.75 mmol/L), it is below normal (2.12–2.52). Combined with elevated phosphorus and PTH, this pattern is consistent with CKD-MBD. The physician should be notified to review Phoebe\'s calcitriol and phosphate binder regimen.',
      },
    },
    {
      id: 'hematology',
      title: 'Phase 4: Haematology & Nutrition',
      subtitle: 'Hgb · Ferritin · TSAT · Albumin',
      intro: 'Anaemia is nearly universal in ESRD due to reduced erythropoietin production. Iron stores must be assessed alongside hemoglobin before adjusting EPO therapy.',
      annotation: {
        title: 'EPO & Iron: The Two-Key System',
        body: 'EPO stimulates red blood cell production, but iron is the raw material. Without adequate iron, EPO is ineffective. Before increasing EPO, confirm iron status: Ferritin (iron stores) and TSAT (functional iron availability) must both meet dialysis targets.',
      },
      rangeBars: [
        { key: 'hgb',      label: 'Hemoglobin', value: 90,  unit: 'g/L',  critLow: 70,  normal: '100–115', critHigh: 200 },
        { key: 'ferritin', label: 'Ferritin',    value: 184, unit: 'µg/L', critLow: 100, normal: '200–500', critHigh: 800, displayNote: 'Below dialysis target of >200 µg/L' },
        { key: 'tsat',     label: 'TSAT',        value: 23,  unit: '%',    critLow: 20,  normal: '20–50',   critHigh: null },
        { key: 'alb',      label: 'Albumin',     value: 31,  unit: 'g/L',  critLow: 25,  normal: '35–50',   critHigh: null },
      ],
      question: {
        text: 'Phoebe\'s Hgb is 90 g/L (below target). Ferritin is 184 µg/L and TSAT is 23%. What is the most appropriate next step?',
        options: [
          'Increase the EPO dose — hemoglobin is below target',
          'Consider IV iron first — ferritin is below the dialysis target of 200 µg/L and stores should be replenished before adjusting EPO',
          'Arrange a blood transfusion — Hgb is critically low',
          'No action needed — TSAT of 23% is within range',
        ],
        correct: 1,
        explanation: 'Phoebe\'s Hgb of 90 g/L is below the dialysis target (100–115 g/L), but ferritin of 184 µg/L is just under the dialysis target of >200 µg/L. Iron stores should be replenished before increasing EPO — EPO is ineffective without adequate iron. TSAT of 23% is borderline. A transfusion is not indicated at 90 g/L (critical threshold: <70). Notify the physician to review iron supplementation.',
      },
    },
  ],
  summary: [
    { label: 'Dialysis Adequacy', finding: 'Adequate — Kt/V 1.55, URR 70.1%',                              status: 'ok'   },
    { label: 'Potassium',         finding: '4.8 mmol/L — within normal range on 2K bath',                   status: 'ok'   },
    { label: 'Sodium',            finding: '131 mmol/L — dilutional hyponatraemia; review fluid compliance', status: 'warn' },
    { label: 'Bicarbonate',       finding: '25 mmol/L — within normal range',                                status: 'ok'   },
    { label: 'Calcium',           finding: '1.92 mmol/L — below normal; notify physician',                   status: 'warn' },
    { label: 'Phosphorus',        finding: '1.49 mmol/L — above dialysis target; review phosphate binders',  status: 'warn' },
    { label: 'PTH',               finding: '18.9 pmol/L — elevated; review CKD-MBD management plan',         status: 'warn' },
    { label: 'Hemoglobin',        finding: '90 g/L — below target; consider IV iron before EPO adjustment',  status: 'warn' },
    { label: 'Albumin',           finding: '31 g/L — below normal; nutritional review indicated',             status: 'warn' },
  ],
};

// ─── BVM Reading Pages (Intradialytic Fluid Removal module) ───────────────────
export const BVM_READING_PAGES = [
  {
    title: 'How Fluid Removal Works',
    sections: [
      {
        heading: 'The vascular refill loop',
        body: `During hemodialysis, the UF pump creates a pressure gradient across the dialysis membrane, drawing fluid out of the patient's blood. As blood volume drops, the body compensates through vascular refill — proteins like albumin create an osmotic pull that draws water from the interstitial (tissue) spaces back into the bloodstream.

When vascular refill keeps pace with the UF rate, the patient tolerates treatment comfortably. When fluid is removed faster than the body can replenish, blood volume drops too quickly — leading to hypotension, cramping, and reduced clearance.`,
      },
      {
        heading: 'Dry weight and the treatment goal',
        body: `Each patient has a target post-dialysis weight called dry weight — the lowest weight they can tolerate without signs of dehydration. The difference between their pre-dialysis weight and dry weight determines how much fluid must be removed that session.

Vascular refill capacity varies by patient and by session — affected by nutritional status, recent illness, and interdialytic fluid intake. The same patient can tolerate a different removal rate on different days.`,
      },
    ],
  },
  {
    title: 'The Blood Volume Monitor (BVM)',
    sections: [
      {
        heading: 'What it measures',
        body: `The BVM uses ultrasound to measure the concentration of hemoglobin in the blood. As fluid is removed, blood becomes more concentrated — the BVM tracks this change as a percentage called Relative Blood Volume (RBV).

RBV starts at 100% at the beginning of each treatment. It is relative to that patient's starting blood volume for that session — not a universal value. An RBV of 90% means the blood is approximately 10% more concentrated than it was at the start.`,
      },
      {
        heading: 'The 85% policy threshold',
        body: `Grand River Hospital policy requires RBV to be monitored every 30 minutes. If RBV approaches or drops below 85%, intervention is required.

Below 85%, patients are at increased risk of intradialytic hypotension, cramping, and organ hypoperfusion. Intervention options include reducing the UFR, pausing ultrafiltration, or giving a saline flush — always in consultation with your charge nurse or preceptor.`,
      },
    ],
  },
  {
    title: 'Key Terminology',
    sections: [
      {
        heading: 'Terms on the BVM screen',
        body: `UF (Ultrafiltration) — the process of removing fluid across the dialysis membrane using a transmembrane pressure gradient.

UFR (Ultrafiltration Rate) — how fast fluid is being removed, in mL/h. Lower UFR is gentler; higher UFR removes fluid faster but increases the risk of hypotension.

RBV (Relative Blood Volume) — real-time percentage of blood volume remaining relative to the start of treatment. Starts at 100%. Policy minimum: 85%.

UF Profile — a programmed pattern of UFR changes over the session. Some patients benefit from starting at a higher rate and tapering toward the end as their interstitial reserve depletes.`,
      },
    ],
  },
];
