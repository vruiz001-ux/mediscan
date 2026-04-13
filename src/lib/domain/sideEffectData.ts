// Per-molecule common side effects + red-flag symptoms.
// Sources: FDA medication guides, UK NHS medicine pages.

export type SideEffectProfile = {
  common: string[];
  redFlags: string[];
};

export const sideEffectData: Record<string, SideEffectProfile> = {
  ibuprofen: {
    common: ["Stomach upset", "Heartburn", "Nausea", "Headache"],
    redFlags: ["Black or bloody stools", "Vomiting blood", "Severe stomach pain", "Swelling of face/lips"],
  },
  aspirin: {
    common: ["Stomach upset", "Mild bleeding (bruising, nosebleed)"],
    redFlags: ["Black stools", "Vomiting blood", "Ringing in ears with higher doses"],
  },
  paracetamol: {
    common: ["Generally well tolerated at recommended doses"],
    redFlags: ["Yellowing of skin or eyes", "Right-sided abdominal pain", "Dark urine (possible liver injury)"],
  },
  warfarin: {
    common: ["Easy bruising", "Minor bleeding"],
    redFlags: ["Heavy or prolonged bleeding", "Blood in urine or stool", "Severe headache", "Sudden weakness"],
  },
  metformin: {
    common: ["Nausea", "Diarrhea", "Metallic taste"],
    redFlags: ["Muscle pain with weakness", "Deep rapid breathing (possible lactic acidosis)"],
  },
  lisinopril: {
    common: ["Dry cough", "Dizziness on standing"],
    redFlags: ["Swelling of face/lips/tongue (angioedema)", "Very low urine output"],
  },
  atorvastatin: {
    common: ["Muscle aches", "Mild digestive upset"],
    redFlags: ["Severe muscle pain or dark urine (possible rhabdomyolysis)", "Yellowing of eyes (liver injury)"],
  },
  simvastatin: {
    common: ["Muscle aches", "Mild digestive upset"],
    redFlags: ["Severe muscle pain or dark urine", "Yellowing of eyes"],
  },
  omeprazole: {
    common: ["Headache", "Diarrhea"],
    redFlags: ["Persistent watery diarrhea (possible C. difficile)", "Muscle cramps (low magnesium)"],
  },
  sertraline: {
    common: ["Nausea", "Insomnia", "Sexual side effects"],
    redFlags: ["Agitation, fever, fast heartbeat (serotonin syndrome)", "New or worsening suicidal thoughts"],
  },
  fluoxetine: {
    common: ["Nausea", "Insomnia", "Sexual side effects"],
    redFlags: ["Serotonin syndrome symptoms", "New or worsening suicidal thoughts"],
  },
  tramadol: {
    common: ["Drowsiness", "Constipation", "Nausea"],
    redFlags: ["Slow or shallow breathing", "Seizure", "Serotonin syndrome symptoms"],
  },
  diazepam: {
    common: ["Drowsiness", "Fatigue", "Unsteadiness"],
    redFlags: ["Very slow breathing", "Extreme sedation"],
  },
  amoxicillin: {
    common: ["Diarrhea", "Rash", "Nausea"],
    redFlags: ["Severe rash with blisters", "Swelling of face/lips", "Severe watery diarrhea"],
  },
  naproxen: {
    common: ["Stomach upset", "Heartburn", "Headache"],
    redFlags: ["Black stools", "Vomiting blood", "Severe stomach pain"],
  },
  clarithromycin: {
    common: ["Taste changes", "Nausea", "Diarrhea"],
    redFlags: ["Palpitations or fainting (QT prolongation)", "Severe watery diarrhea"],
  },
  codeine: {
    common: ["Constipation", "Drowsiness", "Nausea"],
    redFlags: ["Slow or shallow breathing", "Confusion"],
  },
  morphine: {
    common: ["Constipation", "Drowsiness", "Nausea"],
    redFlags: ["Slow or shallow breathing", "Extreme sedation"],
  },
  apixaban: {
    common: ["Easy bruising", "Minor bleeding"],
    redFlags: ["Unusual bleeding", "Blood in urine or stool", "Severe headache"],
  },
  clavulanate: {
    common: ["Diarrhea", "Nausea"],
    redFlags: ["Severe rash", "Severe watery diarrhea"],
  },
  caffeine: {
    common: ["Jitteriness", "Insomnia"],
    redFlags: ["Palpitations", "Chest pain"],
  },
};
