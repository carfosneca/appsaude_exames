import * as FileSystem from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { callAnthropicWithDocument } from './anthropic-client';
import { matchAnalyte } from './matching';
import { insertReport, insertObservation, updateReportStatus, updateReportParsed } from './db';
import type { Observation } from './db';

const REPORTS_DIR = FileSystem.documentDirectory + 'reports/';

const EXTRACTION_PROMPT = `Você é um extrator de dados de laudos laboratoriais brasileiros. Analise o documento e retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem texto antes ou depois) seguindo este schema:
{
  "exam_date": "YYYY-MM-DD ou null",
  "laboratory": "nome do laboratório ou null",
  "patient_name": "string ou null",
  "patient_birthdate": "YYYY-MM-DD ou null",
  "patient_sex": "M|F|null",
  "observations": [
    {
      "analyte_name": "nome exato como aparece no laudo",
      "value_numeric": numero ou null,
      "value_text": "string se não for numérico, senão null",
      "unit": "unidade exata como no laudo",
      "reference_range_low": numero ou null,
      "reference_range_high": numero ou null,
      "reference_range_text": "texto livre da referência ou null",
      "method": "método se mencionado, senão null"
    }
  ]
}

Regras:
- NUNCA invente valores. Se não conseguir ler com certeza, use null.
- Preserve unidades exatamente como no documento (mg/dL, g/dL, etc).
- Inclua TODOS os analitos do laudo, mesmo os que você não conhece.
- Se for hemograma, extraia cada componente individualmente.
- Datas no formato ISO. Se só tiver dia/mês/ano em pt-BR, converta.`;

export type RawExtraction = {
  exam_date: string | null;
  laboratory: string | null;
  patient_name: string | null;
  patient_birthdate: string | null;
  patient_sex: 'M' | 'F' | null;
  observations: Array<{
    analyte_name: string;
    value_numeric: number | null;
    value_text: string | null;
    unit: string | null;
    reference_range_low: number | null;
    reference_range_high: number | null;
    reference_range_text: string | null;
    method: string | null;
  }>;
};

export type ParsedExam = {
  rawExtraction: RawExtraction | null;
  save: () => Promise<void>;
};

function computeFlag(
  value: number | null,
  refLow: number | null,
  refHigh: number | null
): Observation['flag'] {
  if (value === null) return null;
  if (refLow !== null && value < refLow * 0.7) return 'critical';
  if (refHigh !== null && value > refHigh * 1.3) return 'critical';
  if (refLow !== null && value < refLow) return 'low';
  if (refHigh !== null && value > refHigh) return 'high';
  if (refLow !== null || refHigh !== null) return 'normal';
  return null;
}

export async function parseDocument(params: {
  uri: string;
  type: 'pdf' | 'photo';
  filename?: string;
}): Promise<ParsedExam> {
  const { uri, type, filename } = params;

  // Ensure reports dir exists
  const dirInfo = await FileSystem.getInfoAsync(REPORTS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(REPORTS_DIR, { intermediates: true });
  }

  // Copy file to app storage
  const reportId = randomUUID();
  const ext = type === 'pdf' ? '.pdf' : '.jpg';
  const destPath = REPORTS_DIR + reportId + ext;
  await FileSystem.copyAsync({ from: uri, to: destPath });

  // Encode to base64
  const base64Data = await FileSystem.readAsStringAsync(destPath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const mediaType = type === 'pdf' ? 'application/pdf' : 'image/jpeg';

  // Create pending report
  await insertReport({
    id: reportId,
    filename: filename ?? null,
    exam_date: null,
    laboratory: null,
    patient_name: null,
    patient_birthdate: null,
    patient_sex: null,
    source_type: type,
    source_uri: destPath,
    parsing_status: 'parsing',
    parsing_notes: null,
    raw_extraction: null,
  });

  // Call Anthropic
  let rawText: string;
  try {
    rawText = await callAnthropicWithDocument({ base64Data, mediaType, prompt: EXTRACTION_PROMPT });
  } catch (err: any) {
    await updateReportStatus(reportId, 'failed', err.message);
    throw err;
  }

  // Parse JSON
  let extraction: RawExtraction;
  try {
    // Strip potential markdown fences
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    extraction = JSON.parse(cleaned);
  } catch {
    await updateReportStatus(reportId, 'failed', 'Resposta da IA não é JSON válido', rawText);
    throw new Error('A IA retornou resposta em formato inesperado. Tente novamente.');
  }

  const rawJson = JSON.stringify(extraction);

  const save = async () => {
    await updateReportParsed(
      reportId,
      {
        exam_date: extraction.exam_date ?? undefined,
        laboratory: extraction.laboratory ?? undefined,
        patient_name: extraction.patient_name ?? undefined,
        patient_birthdate: extraction.patient_birthdate ?? undefined,
        patient_sex: extraction.patient_sex ?? undefined,
      },
      rawJson
    );

    const collectedAt = extraction.exam_date ? `${extraction.exam_date}T00:00:00` : null;

    for (const rawObs of extraction.observations ?? []) {
      const match = matchAnalyte(rawObs.analyte_name);
      const flag = computeFlag(
        rawObs.value_numeric,
        rawObs.reference_range_low,
        rawObs.reference_range_high
      );

      const obs: Observation = {
        id: randomUUID(),
        report_id: reportId,
        analyte_name_original: rawObs.analyte_name,
        loinc_code: match?.loinc ?? null,
        canonical_name: match?.canonical ?? null,
        value_numeric: rawObs.value_numeric ?? null,
        value_text: rawObs.value_text ?? null,
        unit: rawObs.unit ?? null,
        reference_range_low: rawObs.reference_range_low ?? null,
        reference_range_high: rawObs.reference_range_high ?? null,
        reference_range_text: rawObs.reference_range_text ?? null,
        flag,
        method: rawObs.method ?? null,
        collected_at: collectedAt,
      };

      await insertObservation(obs);
    }
  };

  return { rawExtraction: extraction, save };
}
