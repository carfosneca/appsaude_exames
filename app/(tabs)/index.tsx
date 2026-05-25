import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLatestReport, getAlertsFromLatestReport } from '@/lib/db';
import type { Report, Observation } from '@/lib/db';
import { ReportCard } from '@/components/ReportCard';
import { StatusBadge } from '@/components/StatusBadge';

export default function HomeScreen() {
  const router = useRouter();
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [alerts, setAlerts] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([getLatestReport(), getAlertsFromLatestReport()])
        .then(([report, obs]) => {
          if (!active) return;
          setLatestReport(report);
          setAlerts(obs);
        })
        .catch(console.error)
        .finally(() => active && setLoading(false));
      return () => { active = false; };
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Meus Exames</Text>
          <Text className="text-gray-500 mt-1">Histórico de resultados laboratoriais</Text>
        </View>

        {loading ? (
          <ActivityIndicator className="mt-10" color="#0694a2" />
        ) : latestReport === null ? (
          <View className="mx-5 mt-4 bg-white rounded-3xl p-6 items-center border border-gray-100">
            <Text className="text-4xl mb-3">🧪</Text>
            <Text className="text-gray-700 font-semibold text-base">Nenhum exame ainda</Text>
            <Text className="text-gray-400 text-sm text-center mt-1">
              Toque no botão + para adicionar seu primeiro laudo
            </Text>
          </View>
        ) : (
          <>
            <View className="px-5 mb-2">
              <Text className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                Último exame
              </Text>
              <ReportCard report={latestReport} onPress={() => router.push(`/report/${latestReport.id}`)} />
            </View>

            {alerts.length > 0 && (
              <View className="px-5 mt-4">
                <Text className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                  Em alerta
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {alerts.map((obs) => (
                    <TouchableOpacity
                      key={obs.id}
                      onPress={() => obs.canonical_name && router.push(`/analyte/${obs.canonical_name}`)}
                      className="bg-white rounded-2xl px-3 py-2 border border-gray-100 flex-row items-center gap-2"
                    >
                      <StatusBadge flag={obs.flag} compact />
                      <Text className="text-sm font-medium text-gray-700">
                        {obs.canonical_name ?? obs.analyte_name_original}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {obs.value_numeric !== null ? `${obs.value_numeric} ${obs.unit ?? ''}` : obs.value_text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/upload')}
        className="absolute bottom-8 right-6 bg-primary-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.85}
      >
        <Text className="text-white text-3xl leading-none">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
