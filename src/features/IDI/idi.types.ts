export type IDIStatus = "draft" | "published";

export interface KeyInteraction {
  interactionTitle: string;
  clinicalImpact: string;
  whatToDo: string;
}

export interface PracticalPearl {
  pearlTitle: string;
  pearlContent: string;
}

export interface IDI {
  id: string;

  // Basic Drug Information
  drugNameGeneric: string;
  drugClass: string;
  therapeuticCategory: string;
  brandsInIndia: string;
  strengthsAvailable: string;
  formulationsRoutes: string;

  // Clinical Information
  coreClinicalRole: string;
  preferredClinicalScenarios: string;
  whereBenefitLimited: string;

  // Dosing Information
  usualAdultDose: string;
  timingRelativeToMeals: string;
  reviewDurationPlan: string;

  // Safety Information
  commonAdverseEffects: string;
  seriousButUncommonRisks: string;
  longTermTherapyCautions: string;

  // Interactions and Pearls (repeatable blocks)
  keyInteractions: KeyInteraction[];
  practicalPrescribingPearls: PracticalPearl[];

  // Evidence Base
  guidelines: string;
  landmarkTrials: string;

  // Metadata
  status: IDIStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy?: string;
}

// DTO for creating/editing IDI
export interface CreateIDIDTO {
  // Basic Drug Information
  drugNameGeneric: string;
  drugClass: string;
  therapeuticCategory: string;
  brandsInIndia: string;
  strengthsAvailable: string;
  formulationsRoutes: string;

  // Clinical Information
  coreClinicalRole: string;
  preferredClinicalScenarios: string;
  whereBenefitLimited: string;

  // Dosing Information
  usualAdultDose: string;
  timingRelativeToMeals: string;
  reviewDurationPlan: string;

  // Safety Information
  commonAdverseEffects: string;
  seriousButUncommonRisks: string;
  longTermTherapyCautions: string;

  // Interactions and Pearls
  keyInteractions: KeyInteraction[];
  practicalPrescribingPearls: PracticalPearl[];

  // Evidence Base
  guidelines: string;
  landmarkTrials: string;

  // Status
  status?: IDIStatus;
}

export interface UpdateIDIDTO extends Partial<CreateIDIDTO> {
  id: string;
}

// Table display type
export type IDITableItem = {
  id: string;
  sno: number;
  drugNameGeneric: string;
  drugClass: string;
  therapeuticCategory: string;
  status: IDIStatus;
  createdAt: string;
  updatedAt: string;
};

// Mock data
export const mockIDI: IDI[] = [
  {
    id: "1",
    drugNameGeneric: "Metformin",
    drugClass: "Biguanide",
    therapeuticCategory: "Antidiabetic",
    brandsInIndia: "Glycomet, Glucophage, Obimet, Glyciphage",
    strengthsAvailable: "500 mg, 850 mg, 1000 mg",
    formulationsRoutes: "Oral tablet, Extended-release tablet",
    coreClinicalRole: "First-line oral agent for type 2 diabetes mellitus",
    preferredClinicalScenarios: "Newly diagnosed T2DM, Prediabetes, PCOS with insulin resistance",
    whereBenefitLimited: "Type 1 diabetes, Severe renal impairment (eGFR <30), Acute metabolic acidosis",
    usualAdultDose: "Start 500 mg once or twice daily with meals; may titrate to max 2000-2550 mg/day in divided doses",
    timingRelativeToMeals: "With or immediately after meals to reduce GI upset",
    reviewDurationPlan: "Review after 2-4 weeks for tolerance; HbA1c every 3 months",
    commonAdverseEffects: "GI upset (nausea, diarrhea, abdominal pain), metallic taste",
    seriousButUncommonRisks: "Lactic acidosis (rare but serious); Vitamin B12 deficiency with long-term use",
    longTermTherapyCautions: "Monitor renal function annually; Consider B12 supplementation after 4+ years",
    keyInteractions: [
      {
        interactionTitle: "Contrast Media (iodinated)",
        clinicalImpact: "Increased risk of contrast-induced nephropathy and lactic acidosis",
        whatToDo: "Withhold metformin 48h before and after contrast procedures; resume only after renal function confirmed stable"
      },
      {
        interactionTitle: "Alcohol (excessive)",
        clinicalImpact: "Potentiates lactic acidosis risk",
        whatToDo: "Counsel patients to avoid heavy alcohol consumption"
      }
    ],
    practicalPrescribingPearls: [
      {
        pearlTitle: "Starting Low and Slow",
        pearlContent: "Begin with 500 mg once daily for 1 week, then twice daily to minimize GI side effects"
      },
      {
        pearlTitle: "Extended-Release for Tolerability",
        pearlContent: "Switch to ER formulation if standard release causes persistent GI upset"
      }
    ],
    guidelines: "ADA Standards of Care 2024, IDF Global Guideline 2022",
    landmarkTrials: "UKPDS 34 (1998), DPP (Diabetes Prevention Program, 2002)",
    status: "published",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "admin1"
  },
  {
    id: "2",
    drugNameGeneric: "Atorvastatin",
    drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
    therapeuticCategory: "Antilipemic",
    brandsInIndia: "Atorva, Storvas, Lipitor, Tonact",
    strengthsAvailable: "10 mg, 20 mg, 40 mg, 80 mg",
    formulationsRoutes: "Oral tablet",
    coreClinicalRole: "Lipid-lowering agent for primary and secondary prevention of cardiovascular disease",
    preferredClinicalScenarios: "Hyperlipidemia, Post-MI, Stroke prevention, High cardiovascular risk",
    whereBenefitLimited: "Active liver disease, Pregnancy/breastfeeding, Unexplained persistent elevated transaminases",
    usualAdultDose: "10-80 mg once daily; typical starting dose 10-20 mg",
    timingRelativeToMeals: "Can be taken with or without food, anytime of day",
    reviewDurationPlan: "Lipid panel after 4-12 weeks; LFTs at baseline and as clinically indicated",
    commonAdverseEffects: "Myalgia, headache, GI upset, elevated liver enzymes",
    seriousButUncommonRisks: "Rhabdomyolysis, hepatotoxicity, new-onset diabetes (small increase)",
    longTermTherapyCautions: "Monitor for muscle pain; check CK if symptomatic; periodic LFT monitoring",
    keyInteractions: [
      {
        interactionTitle: "Gemfibrozil and fibrates",
        clinicalImpact: "Significantly increased risk of myopathy and rhabdomyolysis",
        whatToDo: "Avoid combination; if essential, use fenofibrate with caution at lowest statin dose"
      }
    ],
    practicalPrescribingPearls: [
      {
        pearlTitle: "Evening Dosing Not Required",
        pearlContent: "Unlike older statins, atorvastatin has long half-life; can be dosed anytime for compliance"
      }
    ],
    guidelines: "ACC/AHA Cholesterol Guidelines 2018, ESC/EAS Dyslipidemia 2019",
    landmarkTrials: "ASCOT-LLA (2003), TNT (2005), SPARCL (2006)",
    status: "published",
    createdAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-18T14:00:00Z",
    createdBy: "admin1"
  },
  {
    id: "3",
    drugNameGeneric: "Amoxicillin",
    drugClass: "Beta-lactam antibiotic (Aminopenicillin)",
    therapeuticCategory: "Antibacterial",
    brandsInIndia: "Mox, Novamox, Wymox, Amoxil",
    strengthsAvailable: "250 mg, 500 mg, 1 g",
    formulationsRoutes: "Oral capsule, tablet, suspension; IV formulation available",
    coreClinicalRole: "Broad-spectrum antibiotic for common bacterial infections",
    preferredClinicalScenarios: "Acute otitis media, pharyngitis, skin infections, community-acquired pneumonia",
    whereBenefitLimited: "Penicillin allergy, infectious mononucleosis (risk of rash), beta-lactamase-producing organisms",
    usualAdultDose: "250-500 mg every 8 hours or 500-875 mg every 12 hours depending on severity",
    timingRelativeToMeals: "Can be taken with or without food",
    reviewDurationPlan: "Typical course 5-10 days depending on indication; reassess if no improvement in 48-72h",
    commonAdverseEffects: "Diarrhea, nausea, rash",
    seriousButUncommonRisks: "Anaphylaxis (rare), Clostridioides difficile colitis, Drug-induced liver injury",
    longTermTherapyCautions: "Not typically used long-term; if needed, monitor for resistance and superinfection",
    keyInteractions: [
      {
        interactionTitle: "Oral Contraceptives",
        clinicalImpact: "May reduce efficacy of oral contraceptives",
        whatToDo: "Advise backup contraception during treatment and for 7 days after completion"
      }
    ],
    practicalPrescribingPearls: [
      {
        pearlTitle: "Add Clavulanate for Resistant Organisms",
        pearlContent: "Use amoxicillin-clavulanate for beta-lactamase-producing bacteria (sinusitis, bite wounds)"
      }
    ],
    guidelines: "IDSA Guidelines for Community-Acquired Pneumonia 2019",
    landmarkTrials: "N/A - established standard therapy",
    status: "draft",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z",
    createdBy: "admin1"
  }
];

export const DRUG_CLASSES = [
  "Biguanide",
  "HMG-CoA Reductase Inhibitor (Statin)",
  "Beta-lactam antibiotic (Aminopenicillin)",
  "ACE Inhibitor",
  "ARB (Angiotensin Receptor Blocker)",
  "Beta Blocker",
  "Calcium Channel Blocker",
  "Diuretic",
  "NSAID",
  "Proton Pump Inhibitor",
  "SSRI",
  "Benzodiazepine",
  "Antihistamine",
  "Corticosteroid",
  "Bronchodilator"
] as const;

export const THERAPEUTIC_CATEGORIES = [
  "Antidiabetic",
  "Antilipemic",
  "Antibacterial",
  "Antihypertensive",
  "Analgesic",
  "Antiulcer",
  "Antidepressant",
  "Anxiolytic",
  "Antiallergic",
  "Anti-inflammatory",
  "Bronchodilator",
  "Cardiovascular"
] as const;
