import { View, Text, TouchableOpacity } from 'react-native';
import type { Report } from '@/lib/db';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Data desconhecida';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function ReportCard({ report, onPress }: { report: Report; onPress: () => void }) {
  const isParsing = report.parsing_status === 'parsing' || report.parsing_status === 'pending';
  const isFailed = report.parsing_status === 'failed';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="bg-white rounded-3xl p-5 border border-gray-100"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {report.laboratory ?? 'Laboratório desconhecido'}
          </Text>
          <Text className="text-sm text-gray-400 mt-0.5">{formatDate(report.exam_date)}</Text>
        </View>

        {isParsing && (
          <View className="bg-yellow-100 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-semibold text-yellow-700">Processando…</Text>
          </View>
        )}
        {isFailed && (
          <View className="bg-red-100 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-semibold text-red-700">Falha</Text>
          </View>
        )}
      </View>

      {report.patient_name && (
        <Text className="text-xs text-gray-400 mt-2">{report.patient_name}</Text>
      )}

      {report.source_type && (
        <View className="flex-row items-center mt-3 gap-2">
          <Text className="text-xs text-gray-400">
            {report.source_type === 'pdf' ? '📄 PDF' : '📷 Foto'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
