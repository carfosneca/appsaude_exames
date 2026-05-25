import { ANALYTES_DICT, type AnalyteDefinition } from './analytes-dictionary';

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchAnalyte(rawName: string): AnalyteDefinition | null {
  const normalized = normalize(rawName);

  for (const def of ANALYTES_DICT) {
    for (const alias of def.aliases) {
      if (normalize(alias) === normalized) return def;
    }
  }

  // Partial match: alias contained in rawName or vice versa
  for (const def of ANALYTES_DICT) {
    for (const alias of def.aliases) {
      const normAlias = normalize(alias);
      if (normalized.includes(normAlias) || normAlias.includes(normalized)) {
        return def;
      }
    }
  }

  return null;
}
