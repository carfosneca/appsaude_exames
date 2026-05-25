import { View, Text, TouchableOpacity } from 'react-native';
import type { TrackedAnalyte } from '@/lib/db';
import { ANALYTES_DICT } from '@/lib/analytes-dictionary';
import { StatusBadge } from './StatusBadge';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

export function AnalyteCard({ analyte, onPress }: { analyte: TrackedAnalyte; onPress: () => void }) {
  const def = analyte.canonical_name
    ? ANALYTES_DICT.find((a) => a.canonical === analyte.canonical_name)
    : null;

  const displayName = def?.display_pt ?? analyte.analyte_name_original;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="bg-white rounded-2xl px-4 py-4 border border-gray-100 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-800">{displayName}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {analyte.measurement_count} medições · última em {formatDate(analyte.last_collected_at)}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Text className="text-sm font-bold text-gray-900">
          {analyte.last_value !== null
            ? `${analyte.last_value} ${analyte.last_unit ?? ''}`
            : analyte.last_value_text ?? '—'}
        </Text>
        <StatusBadge flag={analyte.last_flag as any} />
      </View>
    </TouchableOpacity>
  );
}
