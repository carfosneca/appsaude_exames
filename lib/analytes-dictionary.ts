export type AnalyteDefinition = {
  canonical: string;
  display_pt: string;
  loinc: string;
  unit_default: string;
  aliases: string[];
};

export const ANALYTES_DICT: AnalyteDefinition[] = [
  // ── Hemograma ────────────────────────────────────────────────────────────
  {
    canonical: 'hemoglobina',
    display_pt: 'Hemoglobina',
    loinc: '718-7',
    unit_default: 'g/dL',
    aliases: ['hemoglobina', 'hb', 'hgb', 'hemoglobin'],
  },
  {
    canonical: 'hematocrito',
    display_pt: 'Hematócrito',
    loinc: '4544-3',
    unit_default: '%',
    aliases: ['hematocrito', 'hematócrito', 'ht', 'hct'],
  },
  {
    canonical: 'leucocitos',
    display_pt: 'Leucócitos',
    loinc: '6690-2',
    unit_default: 'mil/mm³',
    aliases: ['leucocitos', 'leucócitos', 'leucócitos totais', 'leucocitos totais', 'wbc', 'globulos brancos', 'glóbulos brancos'],
  },
  {
    canonical: 'neutrofilos',
    display_pt: 'Neutrófilos',
    loinc: '26499-4',
    unit_default: '%',
    aliases: ['neutrofilos', 'neutrófilos', 'neutrofilo', 'neutróf.', 'segmentados'],
  },
  {
    canonical: 'linfocitos',
    display_pt: 'Linfócitos',
    loinc: '26474-7',
    unit_default: '%',
    aliases: ['linfocitos', 'linfócitos', 'linfocito', 'linfócito'],
  },
  {
    canonical: 'plaquetas',
    display_pt: 'Plaquetas',
    loinc: '777-3',
    unit_default: 'mil/mm³',
    aliases: ['plaquetas', 'plaqueta', 'plaq', 'plt', 'trombocitos', 'trombócitos'],
  },
  {
    canonical: 'vcm',
    display_pt: 'VCM',
    loinc: '787-2',
    unit_default: 'fL',
    aliases: ['vcm', 'volume corpuscular médio', 'volume corpuscular medio', 'mcv'],
  },
  {
    canonical: 'hcm',
    display_pt: 'HCM',
    loinc: '785-6',
    unit_default: 'pg',
    aliases: ['hcm', 'hemoglobina corpuscular média', 'hemoglobina corpuscular media', 'mch'],
  },
  // ── Glicemia ─────────────────────────────────────────────────────────────
  {
    canonical: 'glicemia_jejum',
    display_pt: 'Glicemia em jejum',
    loinc: '1558-6',
    unit_default: 'mg/dL',
    aliases: ['glicemia', 'glicemia em jejum', 'glicemia jejum', 'glicose', 'glicose jejum', 'glucose', 'glucose jejum', 'glicemia de jejum'],
  },
  {
    canonical: 'hba1c',
    display_pt: 'Hemoglobina Glicada (HbA1c)',
    loinc: '4548-4',
    unit_default: '%',
    aliases: ['hba1c', 'hemoglobina glicada', 'hemoglobina glicosada', 'a1c', 'glycohemoglobin', 'hb a1c'],
  },
  // ── Lipídico ─────────────────────────────────────────────────────────────
  {
    canonical: 'colesterol_total',
    display_pt: 'Colesterol Total',
    loinc: '2093-3',
    unit_default: 'mg/dL',
    aliases: ['colesterol total', 'colesterol', 'ct', 'cholesterol total'],
  },
  {
    canonical: 'hdl',
    display_pt: 'HDL-Colesterol',
    loinc: '2085-9',
    unit_default: 'mg/dL',
    aliases: ['hdl', 'hdl colesterol', 'hdl-c', 'hdl-colesterol', 'colesterol hdl'],
  },
  {
    canonical: 'ldl',
    display_pt: 'LDL-Colesterol',
    loinc: '13457-7',
    unit_default: 'mg/dL',
    aliases: ['ldl', 'ldl colesterol', 'ldl-c', 'ldl-colesterol', 'colesterol ldl'],
  },
  {
    canonical: 'triglicerides',
    display_pt: 'Triglicerídeos',
    loinc: '2571-8',
    unit_default: 'mg/dL',
    aliases: ['triglicerides', 'triglicérides', 'triglicerídeos', 'triglicerideos', 'triglycerides', 'tg'],
  },
  // ── Função Renal ─────────────────────────────────────────────────────────
  {
    canonical: 'creatinina',
    display_pt: 'Creatinina',
    loinc: '2160-0',
    unit_default: 'mg/dL',
    aliases: ['creatinina', 'creatinine'],
  },
  {
    canonical: 'ureia',
    display_pt: 'Ureia',
    loinc: '3094-0',
    unit_default: 'mg/dL',
    aliases: ['ureia', 'uréia', 'urea', 'bun'],
  },
  {
    canonical: 'tfg',
    display_pt: 'TFG Estimada',
    loinc: '62238-1',
    unit_default: 'mL/min/1.73m²',
    aliases: ['tfg', 'taxa de filtração glomerular', 'filtração glomerular', 'egfr', 'tfge', 'tfg estimada'],
  },
  // ── Função Hepática ──────────────────────────────────────────────────────
  {
    canonical: 'tgo_ast',
    display_pt: 'TGO/AST',
    loinc: '1920-8',
    unit_default: 'U/L',
    aliases: ['tgo', 'ast', 'tgo/ast', 'aspartato aminotransferase', 'aspartate aminotransferase', 'sgot'],
  },
  {
    canonical: 'tgp_alt',
    display_pt: 'TGP/ALT',
    loinc: '1742-6',
    unit_default: 'U/L',
    aliases: ['tgp', 'alt', 'tgp/alt', 'alanina aminotransferase', 'alanine aminotransferase', 'sgpt'],
  },
  {
    canonical: 'ggt',
    display_pt: 'GGT',
    loinc: '2324-2',
    unit_default: 'U/L',
    aliases: ['ggt', 'gama gt', 'gama-gt', 'gama glutamiltransferase', 'gamma-gt', 'gamma glutamyl transferase'],
  },
  {
    canonical: 'fosfatase_alcalina',
    display_pt: 'Fosfatase Alcalina',
    loinc: '6768-6',
    unit_default: 'U/L',
    aliases: ['fosfatase alcalina', 'alkaline phosphatase', 'alp', 'fa'],
  },
  // ── Tireoide ─────────────────────────────────────────────────────────────
  {
    canonical: 'tsh',
    display_pt: 'TSH',
    loinc: '3016-3',
    unit_default: 'mUI/L',
    aliases: ['tsh', 'hormônio estimulante da tireoide', 'hormonio estimulante da tireoide', 'thyroid stimulating hormone'],
  },
  {
    canonical: 't4_livre',
    display_pt: 'T4 Livre',
    loinc: '3024-7',
    unit_default: 'ng/dL',
    aliases: ['t4 livre', 't4l', 'free t4', 'tiroxina livre', 'ft4'],
  },
  // ── Vitaminas e Minerais ─────────────────────────────────────────────────
  {
    canonical: 'vitamina_d',
    display_pt: 'Vitamina D (25-OH)',
    loinc: '1989-3',
    unit_default: 'ng/mL',
    aliases: ['vitamina d', 'vitamina d 25-oh', '25-oh vitamina d', '25(oh)d', 'vitamina d total', '25-hidroxivitamina d', 'calcidiol'],
  },
  {
    canonical: 'vitamina_b12',
    display_pt: 'Vitamina B12',
    loinc: '2132-9',
    unit_default: 'pg/mL',
    aliases: ['vitamina b12', 'b12', 'cobalamina', 'cianocobalamina', 'vitamin b12'],
  },
  {
    canonical: 'ferritina',
    display_pt: 'Ferritina',
    loinc: '2276-4',
    unit_default: 'ng/mL',
    aliases: ['ferritina', 'ferritin'],
  },
  {
    canonical: 'pcr',
    display_pt: 'PCR Ultrassensível',
    loinc: '30522-7',
    unit_default: 'mg/L',
    aliases: ['pcr', 'proteína c reativa', 'proteina c reativa', 'c reactive protein', 'pcr ultrassensível', 'pcr us', 'hs-crp'],
  },
  {
    canonical: 'acido_urico',
    display_pt: 'Ácido Úrico',
    loinc: '3084-1',
    unit_default: 'mg/dL',
    aliases: ['acido urico', 'ácido úrico', 'uric acid'],
  },
];
