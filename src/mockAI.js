const responses = [
  {
    keys: ['ultrafiltration', 'uf volume', 'fluid removal', 'fluid weight'],
    answer: `**Ultrafiltration (UF)** is the process of removing excess fluid during hemodialysis by creating a pressure gradient across the dialysis membrane.

**How to calculate UF volume:**
> UF Volume (mL) = (Pre-dialysis weight − Dry weight) × 1000

For example: pre-dialysis 73.2 kg, dry weight 71.0 kg → UF = 2.2 × 1000 = **2,200 mL**

The **safe UF rate limit** is ≤ 13 mL/kg/hr (based on dry weight). Exceeding this increases the risk of intradialytic hypotension and cardiovascular events.

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['uf rate', 'ultrafiltration rate', 'safe limit', '13 ml'],
    answer: `**UF Rate** tells you how quickly fluid is being removed per hour.

> UF Rate (mL/hr) = UF Volume ÷ Treatment Time (hr)
> UF Rate/kg = UF Rate ÷ Dry Weight (kg)

**Safe limit: ≤ 13 mL/kg/hr**

If the calculated rate exceeds 13 mL/kg/hr, notify the physician. Options include extending treatment time or reducing the UF volume target.

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['dry weight', 'target weight', 'edema', 'overloaded'],
    answer: `**Dry weight** is the target post-dialysis weight at which the patient has no excess fluid.

It's assessed using clinical signs:
- Blood pressure (both seated and standing)
- Presence of oedema (ankles, sacrum)
- Lung sounds (crackles suggest fluid overload)
- Patient symptoms (dyspnoea, orthopnoea)

Dry weight must be reassessed regularly — it changes with body composition (e.g., muscle wasting, weight gain/loss).

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['potassium', 'k+', 'hyperkalemia', 'hyperkalaemia', 'low potassium', 'high potassium'],
    answer: `**Potassium (K⁺)** is one of the most critical electrolytes in hemodialysis care.

| Status | Value |
|--------|-------|
| Normal | 3.5 – 5.0 mmol/L |
| Critical low | < 3.0 mmol/L |
| Critical high | **> 6.0 mmol/L** |

**Why it matters:** Potassium abnormalities cause cardiac arrhythmias — this is one of the most common causes of sudden cardiac death in dialysis patients.

**Action for K⁺ > 6.0:** Notify the physician **immediately**. The dialysate potassium concentration may be adjusted and an urgent ECG ordered.

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['ktv', 'kt/v', 'dialysis adequacy', 'adequacy', 'bun', 'urea'],
    answer: `**Kt/V** is the standard measure of dialysis adequacy.

- **K** = dialyzer urea clearance (mL/min)
- **t** = treatment time
- **V** = volume of distribution of urea (roughly total body water)

**Target:** Kt/V ≥ 1.2 per session (single-pool)

It's calculated using pre- and post-dialysis **BUN** (Blood Urea Nitrogen) samples. A simpler proxy is the **URR** (Urea Reduction Ratio):

> URR (%) = [(Pre-BUN − Post-BUN) ÷ Pre-BUN] × 100 → Target ≥ 65%

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['phosphorus', 'phosphate', 'phosphate binder', 'hyperphosphataemia'],
    answer: `**Phosphorus** management is critical in hemodialysis patients.

| Status | Value |
|--------|-------|
| Normal | 0.97 – 1.45 mmol/L |
| Dialysis target | **< 1.78 mmol/L** |

**Why it matters:** Chronically elevated phosphorus leads to:
- Secondary hyperparathyroidism
- Vascular and soft tissue calcification
- Renal osteodystrophy

**Management:**
- Dietary phosphate restriction
- **Phosphate binders** taken with meals (e.g., calcium carbonate, sevelamer, lanthanum carbonate)
- Dialysis itself removes phosphate, but dietary intake usually outpaces removal

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['hemoglobin', 'hgb', 'anemia', 'anaemia', 'epo', 'erythropoietin'],
    answer: `**Hemoglobin (Hgb)** management in hemodialysis:

| Status | Value |
|--------|-------|
| HD target range | 100 – 115 g/L |
| Critical low | < 70 g/L |

**Cause of anemia in ESRD:** The kidneys produce erythropoietin (EPO), which stimulates red blood cell production. In ESRD, EPO production falls → anemia.

**Treatment:**
- **ESAs** (epoetin alfa, darbepoetin) — stimulate RBC production
- **IV iron** — required for ESA to work effectively (check ferritin > 200 µg/L, TSAT > 20%)

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['albumin', 'nutrition', 'malnutrition', 'protein'],
    answer: `**Albumin** is the primary nutritional marker monitored in dialysis patients.

| Status | Value |
|--------|-------|
| Normal | 35 – 50 g/L |
| Critical low | **< 25 g/L** |

Low albumin reflects **protein-energy malnutrition** or **chronic inflammation** (or both). It's a strong predictor of outcomes in dialysis patients — patients with albumin < 35 g/L have significantly higher mortality.

**Action for low albumin:**
- Notify physician
- Dietitian referral
- Review protein intake (target ~1.2 g/kg/day for HD patients)
- Screen for infection or inflammatory state

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['calcium', 'hypocalcemia', 'hypercalcemia', 'bone disease', 'pth', 'parathyroid'],
    answer: `**Calcium and PTH** are closely linked in renal bone disease.

**Calcium:**
- Normal: 2.12 – 2.52 mmol/L
- Critical low: < 1.75 mmol/L | Critical high: > 3.0 mmol/L

**PTH (Parathyroid Hormone):**
- Dialysis target: 2–9× the upper limit of normal
- Elevated PTH drives calcium out of bones → renal osteodystrophy

**In ESRD**, the kidneys fail to convert vitamin D to calcitriol, reducing calcium absorption. The parathyroid glands compensate by secreting more PTH.

**Management:** Phosphate control, vitamin D analogues, calcimimetics (e.g., cinacalcet)

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['access', 'fistula', 'avf', 'graft', 'avg', 'catheter', 'cvc', 'vascular'],
    answer: `**Vascular access** is the lifeline of hemodialysis. There are three main types:

**1. Arteriovenous Fistula (AVF)** — preferred
- Native artery-to-vein connection (usually radial/brachial)
- Lowest infection and thrombosis rates
- Needs 6–12 weeks to mature before use

**2. Arteriovenous Graft (AVG)**
- Synthetic tube connecting artery to vein
- Can be used sooner (2–3 weeks)
- Higher thrombosis and infection rates than AVF

**3. Central Venous Catheter (CVC)**
- Tunnelled (long-term) or non-tunnelled (temporary)
- Highest infection risk — use only when no other option
- No maturation time required

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['iron', 'ferritin', 'tsat', 'transferrin'],
    answer: `**Iron monitoring** in dialysis patients uses two markers together:

**Ferritin** — reflects iron stores
- Normal: 15 – 200 µg/L
- Dialysis target: **> 200 µg/L**
- Very high (> 800 µg/L) may indicate overload or inflammation

**TSAT** (Transferrin Saturation) — reflects iron available for red cell production
- Target: **> 20%** (ideally 20–50%)

**Interpretation:**
| Pattern | Meaning |
|---------|---------|
| Low ferritin + low TSAT | True iron deficiency |
| High ferritin + low TSAT | Functional iron deficiency (inflammation) |
| High ferritin + high TSAT | Iron overload — hold therapy |

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['complication', 'hypotension', 'cramp', 'nausea', 'intradialytic'],
    answer: `**Common intradialytic complications:**

**Hypotension** (most common — ~20–30% of sessions)
- Causes: excessive UF rate, vasodilation, autonomic dysfunction
- Signs: light-headedness, nausea, diaphoresis, drop in BP
- Response: reduce/pause UF, Trendelenburg position, saline bolus per order

**Muscle Cramps**
- Often from rapid fluid removal or hyponatraemia
- Response: reduce UF rate, warm saline bolus, stretching

**Nausea / Vomiting**
- May precede or accompany hypotension
- Response: slow treatment, antiemetic if ordered

**Headache**
- Can signal disequilibrium (rapid solute shift) or hypertension
- Notify charge nurse/physician if severe

Always document and report complications promptly.

_Always confirm clinical decisions with your preceptor or unit policy._`,
  },
  {
    keys: ['quiz me', 'test me', 'practice', 'question'],
    answer: `Here's a quick review question:

**A patient's pre-dialysis weight is 78.5 kg. Their dry weight is 76.0 kg. Treatment duration is 4 hours. Is the UF rate within safe limits?**

Work it through:
1. UF Volume = (78.5 − 76.0) × 1000 = **2,500 mL**
2. UF Rate = 2,500 ÷ 4 = **625 mL/hr**
3. Per kg: 625 ÷ 76 = **8.2 mL/kg/hr**
4. Safe limit is **13 mL/kg/hr** → ✅ **Safe to proceed**

Want another question? Ask me to quiz you on bloodwork values or another topic!`,
  },
];

const fallback = `That's a great question. For this orientation prototype, I'm best able to help with topics from your current modules — things like fluid calculations, bloodwork values, vascular access, and common dialysis concepts.

Try asking me:
- *"Explain ultrafiltration"*
- *"What is the normal potassium range?"*
- *"Quiz me on bloodwork values"*
- *"What happens if a patient's potassium is too high?"*

_This AI supports your learning. Always confirm clinical decisions with your preceptor or unit policy._`;

export function getMockResponse(message) {
  const lower = message.toLowerCase();
  for (const entry of responses) {
    if (entry.keys.some(k => lower.includes(k))) {
      return entry.answer;
    }
  }
  return fallback;
}
