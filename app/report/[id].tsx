import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { getReportById, getObservationsByReport } from '@/lib/db';
import type { Report, Observation } from '@/lib/db';
import { StatusBadge } from '@/components/StatusBadge';

const CATEGORY_LABELS: Record<string, string> = {
  hemograma: 'Hemograma',
  lipidico: 'Painel Lipídico',
  glicemia: 'Glicemia',
  renal: 'Função Renal',
  hepatica: 'Função Hepática',
  tireoide: 'Tireoide',
  vitaminas: 'Vitaminas e Minerais',
  outros: 'Outros',
  nao_mapeado: 'Analitos Não Mapeados',
};

function categorize(obs: Observation): string {
  if (!obs.canonical_name) return 'nao_mapeado';
  const c = obs.canonical_name;
  if (['hemoglobina', 'hematocrito', 'leucocitos', 'neutrofilos', 'linfocitos', 'plaquetas', 'vcm', 'hcm'].some((k) => c.includes(k))) return 'hemograma';
  if (['colesterol', 'hdl', 'ldl', 'triglicerides'].some((k) => c.includes(k))) return 'lipidico';
  if (['glicemia', 'hba1c', 'insulina'].some((k) => c.includes(k))) return 'glicemia';
  if (['creatinina', 'ureia', 'tfg'].some((k) => c.includes(k))) return 'renal';
  if (['tgo', 'tgp', 'ggt', 'fosfatase', 'bilirrubina'].some((k) => c.includes(k))) return 'hepatica';
  if (['tsh', 't4', 't3'].some((k) => c.includes(k))) return 'tireoide';
  if (['vitamina', 'ferritina', 'b12'].some((k) => c.includes(k))) return 'vitaminas';
  return 'outros';
}

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getReportById(id), getObservationsByReport(id)])
      .then(([r, obs]) => {
        setReport(r);
        setObservations(obs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const grouped = observations.reduce<Record<string, Observation[]>>((acc, obs) => {
    const cat = categorize(obs);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(obs);
    return acc;
  }, {});

  const categoryOrder = ['hemograma', 'glicemia', 'lipidico', 'renal', 'hepatica', 'tireoide', 'vitaminas', 'outros', 'nao_mapeado'];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {loading ? (
        <ActivityIndicator className="mt-10" color="#0694a2" />
      ) : !report ? (
        <Text className="text-center mt-10 text-gray-400">Exame não encontrado.</Text>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Cabeçalho */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 mb-5">
            <Text className="text-lg font-bold text-gray-900">{report.laboratory ?? 'Laboratório desconhecido'}</Text>
            <Text className="text-gray-500 text-sm mt-1">
              {report.exam_date
                ? new Date(report.exam_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : 'Data desconhecida'}
            </Text>
            {report.patient_name && (
              <Text className="text-gray-500 text-sm">Paciente: {report.patient_name}</Text>
            )}
            <View className="flex-row items-center mt-3 gap-3">
              <View className={`px-2 py-0.5 rounded-full ${report.parsing_status === 'parsed' ? 'bg-green-100' : report.parsing_status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                <Text className={`text-xs font-semibold ${report.parsing_status === 'parsed' ? 'text-green-700' : report.parsing_status === 'failed' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {report.parsing_status === 'parsed' ? 'Lido com sucesso' : report.parsing_status === 'failed' ? 'Falha na leitura' : report.parsing_status}
                </Text>
              </View>
              <Text className="text-xs text-gray-400">{observations.length} analitos</Text>
            </View>
            {report.parsing_notes && (
              <Text className="text-xs text-red-500 mt-2">{report.parsing_notes}</Text>
            )}
          </View>

          {/* Grupos de analitos */}
          {categoryOrder.filter((cat) => grouped[cat]?.length).map((cat) => (
            <View key={cat} className="mb-4">
              <Text className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                {CATEGORY_LABELS[cat]}
              </Text>
              {grouped[cat].map((obs) => (
                <TouchableOpacity
                  key={obs.id}
                  onPress={() => obs.canonical_name && router.push(`/analyte/${obs.canonical_name}`)}
                  className="bg-white rounded-2xl px-4 py-3 mb-2 border border-gray-100 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-medium text-gray-800">{obs.analyte_name_original}</Text>
                    {obs.reference_range_text && (
                      <Text className="text-xs text-gray-400">Ref: {obs.reference_range_text}</Text>
                    )}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-gray-700">
                      {obs.value_numeric !== null
                        ? `${obs.value_numeric} ${obs.unit ?? ''}`
                        : obs.value_text ?? '—'}
                    </Text>
                    <StatusBadge flag={obs.flag} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
