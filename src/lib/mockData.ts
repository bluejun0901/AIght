import { Folder, ReasoningDAG, SavedSession } from '../types';
import { encryptSensitiveData } from './crypto';

export const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'folder-cardio',
    name: 'Cardiology & ACS',
    color: '#0284C7',
    description: 'Coronary syndromes, arrhythmias, heart failure cases',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'folder-neuro',
    name: 'Neurology & Stroke',
    color: '#8B5CF6',
    description: 'Acute stroke, seizures, altered mental status',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'folder-emergency',
    name: 'Emergency Medicine',
    color: '#EF4444',
    description: 'Trauma, critical resuscitation, acute abdomen',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'folder-icu',
    name: 'ICU & Sepsis',
    color: '#F59E0B',
    description: 'Septic shock, ARDS, multiorgan failure',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'folder-internal',
    name: 'Internal Medicine',
    color: '#10B981',
    description: 'DKA, severe infections, metabolic decompensation',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const SAMPLE_CLINICAL_CASES = [
  {
    id: 'case-acs',
    title: 'Acute Coronary Syndrome vs GERD',
    summary: '62yo M with acute retrosternal chest pressure radiating to left shoulder and diaphoresis.',
    folderId: 'folder-cardio',
    fullPrompt:
      '62-year-old male presents to the Emergency Department with sudden-onset acute retrosternal chest pressure lasting 45 minutes, radiating to the left shoulder and jaw, accompanied by diaphoresis and mild dyspnea. Vital signs: BP 148/92 mmHg, HR 94 bpm, SpO2 96% on room air, Temp 37.1°C. Past medical history includes hypertension and hyperlipidemia. Initial ECG shows 1.5mm ST depression in leads V4-V6. Baseline troponin I pending.',
  },
  {
    id: 'case-stroke',
    title: 'Acute Ischemic Stroke (LVO)',
    summary: '58yo F with sudden right-sided hemiparesis and expressive aphasia 75 min ago.',
    folderId: 'folder-neuro',
    fullPrompt:
      '58-year-old female presents within 75 minutes of sudden right facial droop, right arm and leg hemiparesis (NIHSS 14), and expressive aphasia. Last known well was 80 minutes ago. Vital signs: BP 172/96 mmHg, HR 82 bpm regular, glucose 118 mg/dL. Non-contrast head CT shows no acute intracranial hemorrhage, ASPECT score 9. Patient has no recent surgeries or anticoagulant use.',
  },
  {
    id: 'case-sepsis',
    title: 'Septic Shock / Severe Pneumonia',
    summary: '71yo M ICU admission with high fever, hypotension refractory to crystalloids, elevated lactate.',
    folderId: 'folder-icu',
    fullPrompt:
      '71-year-old male admitted from skilled nursing facility with severe productive cough, altered mental status, and fever of 39.2°C. Vital signs: BP 82/48 mmHg (MAP 59) after 30 mL/kg IV crystalloid bolus, HR 122 bpm, RR 28/min, SpO2 91% on 4L nasal cannula. Labs: WBC 21.4 k/uL, serum lactate 4.4 mmol/L, serum creatinine 2.1 mg/dL (baseline 1.0). CXR shows dense right middle and lower lobe consolidation.',
  },
  {
    id: 'case-dka',
    title: 'Diabetic Ketoacidosis (DKA)',
    summary: '24yo F with type 1 diabetes, nausea, Kussmaul respirations, glucose 520, anion gap 24.',
    folderId: 'folder-internal',
    fullPrompt:
      '24-year-old female with Type 1 Diabetes presents with 2 days of nausea, vomiting, severe abdominal pain, and Kussmaul breathing. Vital signs: BP 102/64 mmHg, HR 118 bpm, RR 26/min. Point-of-care glucose 520 mg/dL. Arterial Blood Gas: pH 7.18, HCO3 9 mEq/L, pCO2 24 mmHg. Serum sodium 132 mEq/L, Potassium 4.8 mEq/L, Chloride 99 mEq/L (Anion Gap 24). Urine strongly positive for ketones and glucose.',
  },
  {
    id: 'case-asthma',
    title: 'Severe Acute Asthma Exacerbation',
    summary: '32yo M with acute bronchospasm, peak flow 42% predicted, tachypneic despite SABA.',
    folderId: 'folder-emergency',
    fullPrompt:
      '32-year-old male with history of severe persistent asthma presents with acute respiratory distress triggered by viral upper respiratory infection. Peak Expiratory Flow is 190 L/min (40% of personal best). Vital signs: RR 32/min, HR 126 bpm, SpO2 90% on room air, using accessory sternocleidomastoid muscles. Auscultation reveals marked diffuse bilateral expiratory and inspiratory wheezing with decreased air entry at bases.',
  },
];

export const INITIAL_ACS_DAG: ReasoningDAG = {
  prompt: SAMPLE_CLINICAL_CASES[0].fullPrompt,
  generatedAt: new Date().toISOString(),
  summaryDiagnosis: 'Non-ST-Elevation Acute Coronary Syndrome (NSTE-ACS) / High-Risk Unstable Angina',
  treatmentPlan:
    'Immediate dual antiplatelet therapy (DAPT), parenteral anticoagulation with enoxaparin/unfractionated heparin, sublingual nitroglycerin for ischemic symptom relief, statin therapy, continuous telemetry, and urgent cardiology consultation for invasive coronary angiography within 24 hours.',
  prescriptions: [
    {
      drug: 'Aspirin (Chewable)',
      dosage: '324 mg (4 x 81 mg tabs)',
      route: 'Oral (Chewed)',
      frequency: 'Once STAT',
      duration: 'Immediate loading dose',
      rationale: 'Rapid platelet cyclooxygenase-1 inhibition to arrest intracoronary thrombus propagation.',
    },
    {
      drug: 'Ticagrelor (Brilinta)',
      dosage: '180 mg loading dose, then 90 mg BID',
      route: 'Oral',
      frequency: 'BID',
      duration: '12 months',
      rationale: 'Potent P2Y12 platelet inhibitor superior to clopidogrel in acute coronary syndrome.',
    },
    {
      drug: 'Enoxaparin (Lovenox)',
      dosage: '1 mg/kg (80 mg)',
      route: 'Subcutaneous',
      frequency: 'Every 12 hours',
      duration: 'Until revascularization or discharge (max 8 days)',
      rationale: 'Low-molecular-weight heparin anticoagulation for antithrombin activation and clot stabilization.',
    },
    {
      drug: 'Atorvastatin',
      dosage: '80 mg',
      route: 'Oral',
      frequency: 'Daily at bedtime',
      duration: 'Long-term',
      rationale: 'High-intensity statin therapy for plaque stabilization and pleiotropic anti-inflammatory vascular effects.',
    },
    {
      drug: 'Nitroglycerin Sublingual',
      dosage: '0.4 mg SL',
      route: 'Sublingual',
      frequency: 'q5min PRN chest pain (max 3 doses)',
      duration: 'Acute symptom management',
      rationale: 'Coronary vasodilation and preload reduction to relieve active myocardial ischemia.',
    },
  ],
  contraindicationsChecked: [
    'No active gastrointestinal hemorrhage (evaluated prior to DAPT & anticoagulation)',
    'Systolic BP > 100 mmHg confirmed before nitrate administration; no phosphodiesterase-5 inhibitor use in last 48 hours',
    'Creatinine clearance adequate (> 30 mL/min) for standard enoxaparin weight-based dosing',
    'No prior history of heparin-induced thrombocytopenia (HIT)',
  ],
  followUpInstructions:
    'Transfer patient to Cardiac Care Unit (CCU). Serial high-sensitivity troponins at 0h, 1h, 3h. 12-lead ECG every 15-30 minutes or immediately with recurrent pain. Urgent echocardiogram to evaluate regional wall motion abnormalities.',
  nodes: [
    {
      id: 'node-1',
      type: 'OBSERVATION',
      title: 'Patient Presentation & Hemodynamics',
      summary: 'Patient presents with acute chest pain and shortness of breath.',
      detail:
        '62-year-old male with sudden-onset crushing retrosternal pressure radiating to left shoulder. Hemodynamically stable but symptomatic (BP 148/92, HR 94, SpO2 96%). Risk factors include hypertension and hyperlipidemia.',
      confidence: 96,
      computeTime: '0.2s compute',
      evidence: [
        'Patient age 62 with hypertension and hypercholesterolemia',
        'Pain described as crushing "pressure" radiating to left shoulder and jaw',
        'Duration > 30 minutes unprovoked at rest with diaphoresis',
      ],
      references: [
        {
          title: '2020 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation',
          source: 'European Heart Journal (2021) 42, 1289–1367',
        },
      ],
      clinicalMetrics: {
        'Blood Pressure': '148/92 mmHg',
        'Heart Rate': '94 bpm',
        'TIMI Risk Score': '4 (Intermediate/High)',
      },
      x: 80,
      y: 160,
    },
    {
      id: 'node-2',
      type: 'HYPOTHESIS',
      title: 'Gastroesophageal Reflux Disease (GERD)',
      summary: 'Likely GERD flare-up. Recommend antacids.',
      detail:
        'Preliminary differential considering acid reflux or esophageal spasm given retrosternal location. (Note: Clinically risky to prioritize over ischemic etiology in this risk cohort).',
      confidence: 38,
      computeTime: '0.3s compute',
      evidence: [
        'Retrosternal discomfort location can overlap with esophageal spasm',
        'However, lack of postprandial trigger or acid regurgitation makes GERD less probable',
        'Fails to account for diaphoresis and left shoulder radiation',
      ],
      references: [
        {
          title: 'Differentiating Atypical Chest Pain Presentations',
          source: 'Am J Emerg Med. 2021;45:112-118',
        },
      ],
      flaggedIncorrect: true,
      flagReason: 'User Flagged: Incorrect Path. Patient has high cardiovascular risk and ischemic radiation; GERD is a dangerous false lead.',
      x: 360,
      y: 290,
    },
    {
      id: 'node-3',
      type: 'ACTION',
      title: 'Acute Coronary Syndrome Evaluation',
      summary: 'Evaluate for Acute Coronary Syndrome (ACS). Order ECG and Troponin.',
      detail:
        'Prioritizing high-probability Acute Coronary Syndrome due to classic ischemic radiation, autonomic diaphoresis, and age/risk profile. Subtle ST-depression (1.5mm) in leads V4-V6 strongly indicates active subendocardial ischemia.',
      confidence: 94,
      computeTime: '0.4s compute',
      evidence: [
        'Patient age > 60 with hypertension and dyslipidemia',
        'Pain described as "pressure" radiating to left shoulder and jaw',
        'ST-segment depression in V4-V6 on 12-lead ECG',
        'Troponin levels pending but clinical presentation highly suggestive of NSTE-ACS',
      ],
      references: [
        {
          title: 'AHA Guidelines for Non-ST-Elevation Acute Coronary Syndromes',
          source: 'Circulation. 2020;142:e214–e220',
          doiOrUrl: '10.1161/CIR.0000000000000929',
        },
        {
          title: 'Differentiating Atypical Chest Pain Presentations in the Emergency Setting',
          source: 'Am J Emerg Med. 2021;45:112-118',
          doiOrUrl: '10.1016/j.ajem.2021.02.019',
        },
      ],
      clinicalMetrics: {
        'ECG Findings': '1.5mm ST-depression V4-V6',
        'HEART Score': '7 (High Risk for MACE)',
      },
      x: 640,
      y: 160,
    },
    {
      id: 'node-4',
      type: 'PROPOSED_ACTION',
      title: 'Immediate Ischemic Resuscitation & Consultation',
      summary: 'Administer Aspirin, prepare for immediate cardiology consult.',
      detail:
        'Initiate acute DAPT loading (chewable Aspirin 324 mg + Ticagrelor 180 mg), therapeutic LMWH anticoagulation, sublingual nitroglycerin, high-intensity atorvastatin 80 mg, and activate the cardiac catheterization lab team.',
      confidence: 95,
      computeTime: '0.4s compute',
      evidence: [
        'AHA/ACC Class I Recommendation for Aspirin loading in suspected ACS',
        'PLATO trial demonstrates Ticagrelor mortality benefit over Clopidogrel in NSTE-ACS',
        'Early invasive coronary angiography recommended within 24 hours for intermediate-to-high risk TIMI score',
      ],
      references: [
        {
          title: 'ACC/AHA Guideline for the Management of Patients With Non-ST-Elevation Acute Coronary Syndromes',
          source: 'J Am Coll Cardiol. 2021;78(18):e1-e120',
        },
      ],
      clinicalMetrics: {
        'Aspirin Dose': '324 mg chewable',
        'P2Y12 Inhibitor': 'Ticagrelor 180 mg',
        'Anticoagulation': 'Enoxaparin 1 mg/kg SQ',
      },
      x: 640,
      y: 400,
    },
    {
      id: 'node-5',
      type: 'RX_INSTRUCTION',
      title: 'Full Pharmacotherapy & DAPT Protocol',
      summary: 'Prescribe Aspirin 324mg + Ticagrelor 180mg + Enoxaparin 1mg/kg SQ.',
      detail:
        'Prescribe complete evidence-based medical regimen with contraindication screening for GI bleeding, intracranial hemorrhage, and severe hypotension.',
      confidence: 97,
      computeTime: '0.3s compute',
      evidence: [
        'Confirmed no history of intracranial hemorrhage or GI bleeding',
        'Systolic BP 148 mmHg allows safe sublingual nitroglycerin administration',
        'Telemetry monitoring initiated',
      ],
      references: [
        {
          title: 'Dual Antiplatelet Therapy in Acute Coronary Syndrome: Focused Update',
          source: 'New England Journal of Medicine 2022; 387:1400-1412',
        },
      ],
      x: 940,
      y: 280,
    },
  ],
  edges: [
    {
      id: 'edge-1-2',
      source: 'node-1',
      target: 'node-2',
      label: 'Initial Differentials',
      isFlaggedPath: true,
    },
    {
      id: 'edge-1-3',
      source: 'node-1',
      target: 'node-3',
      label: 'Primary Cardiac Pathway',
    },
    {
      id: 'edge-3-4',
      source: 'node-3',
      target: 'node-4',
      label: 'Clinical Plan',
    },
    {
      id: 'edge-4-5',
      source: 'node-4',
      target: 'node-5',
      label: 'Rx Order Set',
    },
  ],
};

export const INITIAL_SAVED_SESSIONS: SavedSession[] = [
  {
    id: 'session-101',
    title: 'Acute Coronary Syndrome Review - Pt. J. Doe (62M)',
    patientNameEncrypted: encryptSensitiveData('John Doe'),
    patientAgeGenderEncrypted: encryptSensitiveData('62yo Male'),
    patientPromptEncrypted: encryptSensitiveData(SAMPLE_CLINICAL_CASES[0].fullPrompt),
    previewSummary: 'Corrected false GERD hypothesis; enforced high-risk NSTE-ACS DAPT protocol and cardiac cath consult.',
    dagData: INITIAL_ACS_DAG,
    folderId: 'folder-cardio',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    doctorEmail: 'sarah.lin.md@hospital.org',
    doctorName: 'Dr. Sarah Lin, MD',
    overriddenNodesCount: 1,
  },
];
