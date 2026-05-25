import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTrackedAnalytes } from '@/lib/db';
import type { TrackedAnalyte } from '@/lib/db';
import { AnalyteCard } from '@/components/AnalyteCard';

export default function AnalytesScreen() {
  const router = useRouter();
  const [analytes, setAnalytes] = useState<TrackedAnalyte[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getTrackedAnalytes()
        .then((data) => active && setAnalytes(data))
        .catch(console.error)
        .finally(() => active && setLoading(false));
      return () => { active = false; };
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-6 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Analitos</Text>
        <Text className="text-gray-500 mt-1">Todos com pelo menos 2 medições</Text>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" color="#0694a2" />
      ) : (
        <FlatList
          data={analytes}
          keyExtractor={(item) => item.canonical_name ?? item.analyte_name_original}
          contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Text className="text-4xl mb-3">📈</Text>
              <Text className="text-gray-500 text-center">
                Nenhum analito com múltiplas medições ainda.{'\n'}Adicione mais exames!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <AnalyteCard
              analyte={item}
              onPress={() =>
                item.canonical_name && router.push(`/analyte/${item.canonical_name}`)
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
