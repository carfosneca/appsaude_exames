import '../global.css';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '@/lib/db';

export default function RootLayout() {
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="analyte/[canonical]"
        options={{ headerShown: true, title: 'Evolução do Analito', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="report/[id]"
        options={{ headerShown: true, title: 'Detalhe do Exame', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="upload"
        options={{ headerShown: true, title: 'Adicionar Exame', headerBackTitle: 'Cancelar', presentation: 'modal' }}
      />
    </Stack>
  );
}
