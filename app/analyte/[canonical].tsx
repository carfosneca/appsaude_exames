import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getObservationsByCanonical } from '@/lib/db';
import type { Observation } from '@/lib/db';
import { AnalyteChart } from '@/components/AnalyteChart';
import { StatusBadge } from '@/components/StatusBadge';
import { ANALYTES_DICT } from '@/lib/analytes-dictionary';

export default function AnalyteDetailScreen() {
  const { canonical } = useLocalSearchParams<{ canonical: string }>();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canonical) return;
    getObservationsByCanonical(canonical)
      .then(setObservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [canonical]);

  const definition = canonical ? ANALYTES_DICT.find((a) => a.canonical === canonical) : null;
  const displayName = definition?.display_pt ?? canonical ?? 'Analito';

  const refLow = observations.find((o) => o.reference_range_low !== null)?.reference_range_low ?? null;
  const refHigh = observations.find((o) => o.reference_range_high !== null)?.reference_range_high ?? null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {loading ? (
        <ActivityIndicator className="mt-10" color="#0694a2" />
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text className="text-xl font-bold text-gray-900 mb-1">{displayName}</Text>
          {definition?.loinc && (
            <Text className="text-xs text-gray-400 mb-4">LOINC: {definition.loinc}</Text>
          )}

          {observations.length >= 2 && (
            <AnalyteChart
              observations={observations}
              refLow={refLow}
              refHigh={refHigh}
            />
          )}

          <Text className="text-xs font-semibold uppercase text-gray-400 tracking-wider mt-6 mb-3">
            Histórico de medições
          </Text>

          {observations.map((obs) => (
            <View
              key={obs.id}
              className="bg-white rounded-2xl p-4 mb-2 border border-gray-100 flex-row items-center justify-between"
            >
              <View>
                <Text className="text-sm font-semibold text-gray-800">
                  {obs.value_numeric !== null
                    ? `${obs.value_numeric} ${obs.unit ?? ''}`
                    : obs.value_text ?? '—'}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {obs.collected_at
                    ? new Date(obs.collected_at).toLocaleDateString('pt-BR')
                    : '—'}
                </Text>
                {obs.reference_range_text && (
                  <Text className="text-xs text-gray-400">Ref: {obs.reference_range_text}</Text>
                )}
              </View>
              <StatusBadge flag={obs.flag} />
            </View>
          ))}

          {observations.length === 0 && (
            <Text className="text-gray-400 text-center mt-10">Sem medições encontradas.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
