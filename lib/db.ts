import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('consolidaexames.db');

// ── Types ────────────────────────────────────────────────────────────────────

export type Report = {
  id: string;
  filename: string | null;
  uploaded_at: string;
  exam_date: string | null;
  laboratory: string | null;
  patient_name: string | null;
  patient_birthdate: string | null;
  patient_sex: string | null;
  source_type: 'pdf' | 'photo';
  source_uri: string;
  parsing_status: 'pending' | 'parsing' | 'parsed' | 'failed';
  parsing_notes: string | null;
  raw_extraction: string | null;
};

export type Observation = {
  id: string;
  report_id: string;
  analyte_name_original: string;
  loinc_code: string | null;
  canonical_name: string | null;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
  reference_range_low: number | null;
  reference_range_high: number | null;
  reference_range_text: string | null;
  flag: 'normal' | 'low' | 'high' | 'critical' | null;
  method: string | null;
  collected_at: string | null;
};

export type TrackedAnalyte = {
  canonical_name: string | null;
  analyte_name_original: string;
  last_value: number | null;
  last_value_text: string | null;
  last_unit: string | null;
  last_flag: string | null;
  last_collected_at: string | null;
  measurement_count: number;
};

// ── Init ─────────────────────────────────────────────────────────────────────

export async function initDatabase(): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      filename TEXT,
      uploaded_at DATETIME NOT NULL,
      exam_date DATE,
      laboratory TEXT,
      patient_name TEXT,
      patient_birthdate DATE,
      patient_sex TEXT,
      source_type TEXT NOT NULL,
      source_uri TEXT NOT NULL,
      parsing_status TEXT NOT NULL DEFAULT 'pending',
      parsing_notes TEXT,
      raw_extraction TEXT
    );

    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      analyte_name_original TEXT NOT NULL,
      loinc_code TEXT,
      canonical_name TEXT,
      value_numeric REAL,
      value_text TEXT,
      unit TEXT,
      reference_range_low REAL,
      reference_range_high REAL,
      reference_range_text TEXT,
      flag TEXT,
      method TEXT,
      collected_at DATETIME
    );

    CREATE INDEX IF NOT EXISTS idx_obs_canonical ON observations(canonical_name);
    CREATE INDEX IF NOT EXISTS idx_obs_report ON observations(report_id);
    CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(exam_date);
  `);
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function insertReport(report: Omit<Report, 'uploaded_at'>): Promise<void> {
  await db.runAsync(
    `INSERT INTO reports (id, filename, uploaded_at, exam_date, laboratory, patient_name,
      patient_birthdate, patient_sex, source_type, source_uri, parsing_status, parsing_notes, raw_extraction)
     VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      report.id, report.filename ?? null, report.exam_date ?? null,
      report.laboratory ?? null, report.patient_name ?? null,
      report.patient_birthdate ?? null, report.patient_sex ?? null,
      report.source_type, report.source_uri, report.parsing_status,
      report.parsing_notes ?? null, report.raw_extraction ?? null,
    ]
  );
}

export async function updateReportStatus(
  id: string,
  status: Report['parsing_status'],
  notes?: string,
  raw?: string
): Promise<void> {
  await db.runAsync(
    `UPDATE reports SET parsing_status = ?, parsing_notes = ?, raw_extraction = ? WHERE id = ?`,
    [status, notes ?? null, raw ?? null, id]
  );
}

export async function updateReportParsed(
  id: string,
  data: Partial<Pick<Report, 'exam_date' | 'laboratory' | 'patient_name' | 'patient_birthdate' | 'patient_sex'>>,
  rawExtraction: string
): Promise<void> {
  await db.runAsync(
    `UPDATE reports SET
      parsing_status = 'parsed',
      exam_date = ?,
      laboratory = ?,
      patient_name = ?,
      patient_birthdate = ?,
      patient_sex = ?,
      raw_extraction = ?
     WHERE id = ?`,
    [
      data.exam_date ?? null, data.laboratory ?? null,
      data.patient_name ?? null, data.patient_birthdate ?? null,
      data.patient_sex ?? null, rawExtraction, id,
    ]
  );
}

export async function getReports(): Promise<Report[]> {
  return db.getAllAsync<Report>(
    `SELECT * FROM reports ORDER BY exam_date DESC, uploaded_at DESC`
  );
}

export async function getLatestReport(): Promise<Report | null> {
  return db.getFirstAsync<Report>(
    `SELECT * FROM reports WHERE parsing_status = 'parsed' ORDER BY exam_date DESC, uploaded_at DESC LIMIT 1`
  );
}

export async function getReportById(id: string): Promise<Report | null> {
  return db.getFirstAsync<Report>(`SELECT * FROM reports WHERE id = ?`, [id]);
}

// ── Observations ─────────────────────────────────────────────────────────────

export async function insertObservation(obs: Observation): Promise<void> {
  await db.runAsync(
    `INSERT INTO observations (id, report_id, analyte_name_original, loinc_code, canonical_name,
      value_numeric, value_text, unit, reference_range_low, reference_range_high,
      reference_range_text, flag, method, collected_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      obs.id, obs.report_id, obs.analyte_name_original, obs.loinc_code ?? null,
      obs.canonical_name ?? null, obs.value_numeric ?? null, obs.value_text ?? null,
      obs.unit ?? null, obs.reference_range_low ?? null, obs.reference_range_high ?? null,
      obs.reference_range_text ?? null, obs.flag ?? null, obs.method ?? null,
      obs.collected_at ?? null,
    ]
  );
}

export async function getObservationsByReport(reportId: string): Promise<Observation[]> {
  return db.getAllAsync<Observation>(
    `SELECT * FROM observations WHERE report_id = ? ORDER BY analyte_name_original`,
    [reportId]
  );
}

export async function getObservationsByCanonical(canonical: string): Promise<Observation[]> {
  return db.getAllAsync<Observation>(
    `SELECT o.*, r.exam_date
     FROM observations o
     JOIN reports r ON r.id = o.report_id
     WHERE o.canonical_name = ?
     ORDER BY COALESCE(o.collected_at, r.exam_date) ASC`,
    [canonical]
  );
}

export async function getAlertsFromLatestReport(): Promise<Observation[]> {
  return db.getAllAsync<Observation>(
    `SELECT o.*
     FROM observations o
     JOIN reports r ON r.id = o.report_id
     WHERE r.id = (
       SELECT id FROM reports WHERE parsing_status = 'parsed'
       ORDER BY exam_date DESC, uploaded_at DESC LIMIT 1
     ) AND o.flag IN ('low','high','critical')
     ORDER BY o.flag DESC`
  );
}

export async function getTrackedAnalytes(): Promise<TrackedAnalyte[]> {
  return db.getAllAsync<TrackedAnalyte>(
    `SELECT
       canonical_name,
       analyte_name_original,
       value_numeric AS last_value,
       value_text AS last_value_text,
       unit AS last_unit,
       flag AS last_flag,
       collected_at AS last_collected_at,
       COUNT(*) AS measurement_count
     FROM (
       SELECT o.*, ROW_NUMBER() OVER (PARTITION BY COALESCE(o.canonical_name, o.analyte_name_original) ORDER BY COALESCE(o.collected_at, r.exam_date) DESC) AS rn
       FROM observations o
       JOIN reports r ON r.id = o.report_id
       WHERE r.parsing_status = 'parsed'
     )
     WHERE rn = 1
     GROUP BY COALESCE(canonical_name, analyte_name_original)
     HAVING COUNT(*) >= 2
     ORDER BY last_collected_at DESC`
  );
}
