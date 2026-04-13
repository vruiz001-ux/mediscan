// Core type contracts for MediScan. DO NOT diverge from these shapes.

export type Severity = "minor" | "moderate" | "major" | "critical";
export type Status = "go" | "caution" | "no_go";

export type Molecule = {
  id: string;
  name: string;
  drugClass: string;
  aliases: string[];
  warnings: string[];
  isOTC: boolean;
};

export type DrugRecord = {
  id: string;
  displayName: string;
  kind: "brand" | "generic" | "combination";
  activeMolecules: string[];
  brandAliases: string[];
};

export type MedicineEntry = {
  inputName: string;
  normalizedName: string;
  activeMolecules: string[];
  strength?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  reasonForUse?: string;
  resolved: boolean;
  source?: "local" | "pl_registry" | "rxnav" | "unresolved";
  rxcui?: string;
};

export type PatientProfile = {
  age?: number;
  sex?: "female" | "male" | "other" | "prefer_not_to_say";
  pregnant?: boolean;
  breastfeeding?: boolean;
  allergies?: string[];
  kidneyDisease?: boolean;
  liverDisease?: boolean;
  ulcerHistory?: boolean;
  alcoholUse?: "none" | "occasional" | "regular" | "heavy";
  chronicConditions?: string[];
  notes?: string;
};

export type Finding = {
  id: string;
  type:
    | "interaction"
    | "duplicate_therapy"
    | "contraindication"
    | "side_effect"
    | "profile_risk";
  severity: Severity;
  status: Status;
  title: string;
  explanation: string;
  recommendedAction: string;
  affectedMedicines: string[];
  affectedMolecules: string[];
};

export type OverallResult = {
  overallStatus: Status;
  summary: string;
  normalizedMedicines: Array<{
    inputName: string;
    normalizedName: string;
    activeMolecules: string[];
    source?: "local" | "pl_registry" | "rxnav" | "unresolved";
    rxcui?: string;
  }>;
  findings: Finding[];
  disclaimer: string;
};

export const DISCLAIMER =
  "This is an informational medication screening tool only. Always confirm with a licensed doctor or pharmacist before taking, combining, stopping, or changing any medicine.";
