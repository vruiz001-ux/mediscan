export interface IdentifyResultBase {
  input_name: string;
  normalized_name: string;
  country: "Poland";
  identified: boolean;
  confidence_score: number;
  matched_source: string;
  notes: string;
}

export interface IdentifySingle extends IdentifyResultBase {
  identified: true;
  commercial_name: string;
  active_substance: string;
  atc_code: string;
  dosage_form: string;
  strength: string;
  manufacturer: string;
}

export interface IdentifyCombo extends IdentifyResultBase {
  identified: true;
  commercial_name: string;
  active_substances: string[];
  atc_code: string;
  dosage_form: string;
  strength: string;
  manufacturer: string;
}

export interface IdentifyMiss extends IdentifyResultBase {
  identified: false;
  candidates: { commercial_name: string; confidence_score: number }[];
}

export type IdentifyResult = IdentifySingle | IdentifyCombo | IdentifyMiss;
