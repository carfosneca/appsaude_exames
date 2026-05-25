import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getReports } from '@/lib/db';
import type { Report } from '@/lib/db';
import { ReportCard } from '@/components/ReportCard';

export default function ExamsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [labFilter, setLabFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getReports();
    setReports(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      load().catch(console.error).finally(() => active && setLoading(false));
      return () => { active = false; };
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load().catch(console.error);
    setRefreshing(false);
  };

  const labs = [...new Set(reports.map((r) => r.laboratory).filter(Boolean))] as string[];
  const filtered = labFilter ? reports.filter((r) => r.laboratory === labFilter) : reports;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-6 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Exames</Text>
      </View>

      {labs.length > 0 && (
        <View className="px-5 pb-3">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[null, ...labs]}
            keyExtractor={(item) => item ?? '__all__'}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setLabFilter(item)}
                className={`mr-2 px-3 py-1.5 rounded-full border ${
                  labFilter === item
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-sm ${labFilter === item ? 'text-white font-semibold' : 'text-gray-600'}`}>
                  {item ?? 'Todos'}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator className="mt-10" color="#0694a2" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0694a2" />}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Text className="text-4xl mb-3">📋</Text>
              <Text className="text-gray-500">Nenhum exame encontrado</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ReportCard report={item} onPress={() => router.push(`/report/${item.id}`)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
