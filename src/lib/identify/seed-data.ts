// Curated starter set for Polish market. Dominant OTC brands +
// representative Rx examples. Intended as a working baseline; the full
// dataset comes from URPL via scripts/sync-urpl.ts (TODO).
//
// Combination products (Gripex family, Augmentin) drive multi-substance
// coverage. Aliases capture colloquial / declined forms ("Apapu",
// "Gripexu") and legacy spellings.

export interface SeedSubstance {
  inn: string;
  atcCode?: string;
}

export interface SeedProduct {
  commercialName: string;
  substances: { inn: string; strength?: string }[];
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  registrationNo?: string;
  prescription?: boolean;
  source?: string;
  aliases?: { alias: string; kind: "brand" | "misspelling" | "local" | "legacy" }[];
}

export const seedSubstances: SeedSubstance[] = [
  { inn: "Paracetamol", atcCode: "N02BE01" },
  { inn: "Ibuprofen", atcCode: "M01AE01" },
  { inn: "Kwas acetylosalicylowy", atcCode: "N02BA01" },
  { inn: "Metamizol", atcCode: "N02BB02" },
  { inn: "Kodeina", atcCode: "R05DA04" },
  { inn: "Kofeina", atcCode: "N06BC01" },
  { inn: "Pseudoefedryna", atcCode: "R01BA02" },
  { inn: "Dekstrometorfan", atcCode: "R05DA09" },
  { inn: "Fenylefryna", atcCode: "R01BA03" },
  { inn: "Cetyryzyna", atcCode: "R06AE07" },
  { inn: "Loratadyna", atcCode: "R06AX13" },
  { inn: "Omeprazol", atcCode: "A02BC01" },
  { inn: "Amoksycylina", atcCode: "J01CA04" },
  { inn: "Kwas klawulanowy", atcCode: "J01CR02" },
  { inn: "Rutozyd", atcCode: "C05CA01" },
  { inn: "Kwas askorbinowy", atcCode: "A11GA01" },
  { inn: "Diklofenak", atcCode: "M01AB05" },
  { inn: "Drotaweryna", atcCode: "A03AD02" },
];

export const seedProducts: SeedProduct[] = [
  {
    commercialName: "Apap",
    substances: [{ inn: "Paracetamol", strength: "500 mg" }],
    dosageForm: "tabletki powlekane",
    strength: "500 mg",
    manufacturer: "US Pharmacia",
    prescription: false,
    source: "URPL",
    aliases: [
      { alias: "Apap 500", kind: "brand" },
      { alias: "Apapu", kind: "local" },
      { alias: "Apap tabletki", kind: "brand" },
    ],
  },
  {
    commercialName: "Apap Noc",
    substances: [
      { inn: "Paracetamol", strength: "500 mg" },
      { inn: "Cetyryzyna", strength: "25 mg" },
    ],
    dosageForm: "tabletki powlekane",
    manufacturer: "US Pharmacia",
    prescription: false,
    source: "URPL",
    aliases: [{ alias: "ApapNoc", kind: "misspelling" }],
  },
  {
    commercialName: "Panadol",
    substances: [{ inn: "Paracetamol", strength: "500 mg" }],
    dosageForm: "tabletki powlekane",
    manufacturer: "GSK",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Paracetamol",
    substances: [{ inn: "Paracetamol", strength: "500 mg" }],
    dosageForm: "tabletki",
    manufacturer: "Polfarmex",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Ibuprom",
    substances: [{ inn: "Ibuprofen", strength: "200 mg" }],
    dosageForm: "tabletki drażowane",
    manufacturer: "US Pharmacia",
    prescription: false,
    source: "URPL",
    aliases: [{ alias: "Ibupromu", kind: "local" }],
  },
  {
    commercialName: "Nurofen",
    substances: [{ inn: "Ibuprofen", strength: "200 mg" }],
    dosageForm: "tabletki powlekane",
    manufacturer: "Reckitt Benckiser",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Polopiryna S",
    substances: [{ inn: "Kwas acetylosalicylowy", strength: "300 mg" }],
    dosageForm: "tabletki",
    manufacturer: "Polpharma",
    prescription: false,
    source: "URPL",
    aliases: [
      { alias: "Polopiryna", kind: "legacy" },
      { alias: "Polopirynka", kind: "local" },
    ],
  },
  {
    commercialName: "Acard",
    substances: [{ inn: "Kwas acetylosalicylowy", strength: "75 mg" }],
    dosageForm: "tabletki dojelitowe",
    manufacturer: "Polpharma",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Pyralgina",
    substances: [{ inn: "Metamizol", strength: "500 mg" }],
    dosageForm: "tabletki",
    manufacturer: "Polpharma",
    prescription: false,
    source: "URPL",
    aliases: [{ alias: "Pyralginka", kind: "local" }],
  },
  {
    commercialName: "Gripex",
    substances: [
      { inn: "Paracetamol", strength: "325 mg" },
      { inn: "Pseudoefedryna", strength: "30 mg" },
      { inn: "Dekstrometorfan", strength: "10 mg" },
    ],
    dosageForm: "tabletki powlekane",
    manufacturer: "US Pharmacia",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Gripex Max",
    substances: [
      { inn: "Paracetamol", strength: "500 mg" },
      { inn: "Pseudoefedryna", strength: "30 mg" },
      { inn: "Dekstrometorfan", strength: "15 mg" },
    ],
    dosageForm: "tabletki powlekane",
    manufacturer: "US Pharmacia",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Gripex Noc",
    substances: [
      { inn: "Paracetamol", strength: "500 mg" },
      { inn: "Pseudoefedryna", strength: "30 mg" },
      { inn: "Dekstrometorfan", strength: "15 mg" },
      { inn: "Cetyryzyna", strength: "10 mg" },
    ],
    dosageForm: "tabletki powlekane",
    manufacturer: "US Pharmacia",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Zyrtec",
    substances: [{ inn: "Cetyryzyna", strength: "10 mg" }],
    dosageForm: "tabletki powlekane",
    manufacturer: "UCB",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Claritine",
    substances: [{ inn: "Loratadyna", strength: "10 mg" }],
    dosageForm: "tabletki",
    manufacturer: "Bayer",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Polprazol",
    substances: [{ inn: "Omeprazol", strength: "20 mg" }],
    dosageForm: "kapsulki dojelitowe",
    manufacturer: "Polpharma",
    prescription: false,
    source: "URPL",
  },
  {
    commercialName: "Augmentin",
    substances: [
      { inn: "Amoksycylina", strength: "875 mg" },
      { inn: "Kwas klawulanowy", strength: "125 mg" },
    ],
    dosageForm: "tabletki powlekane",
    manufacturer: "GSK",
    prescription: true,
    source: "URPL",
  },
  {
    commercialName: "Rutinoscorbin",
    substances: [
      { inn: "Rutozyd", strength: "25 mg" },
      { inn: "Kwas askorbinowy", strength: "100 mg" },
    ],
    dosageForm: "tabletki powlekane",
    manufacturer: "GSK",
    prescription: false,
    source: "URPL",
    aliases: [{ alias: "Rutinoskorbin", kind: "misspelling" }],
  },
  {
    commercialName: "No-Spa",
    substances: [{ inn: "Drotaweryna", strength: "40 mg" }],
    dosageForm: "tabletki",
    manufacturer: "Sanofi",
    prescription: false,
    source: "URPL",
    aliases: [{ alias: "Nospa", kind: "misspelling" }, { alias: "No Spa", kind: "brand" }],
  },
  {
    commercialName: "Voltaren",
    substances: [{ inn: "Diklofenak", strength: "25 mg" }],
    dosageForm: "tabletki dojelitowe",
    manufacturer: "GSK",
    prescription: false,
    source: "URPL",
  },
];
