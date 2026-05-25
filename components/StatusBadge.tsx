import { View, Text } from 'react-native';

type Flag = 'normal' | 'low' | 'high' | 'critical' | null | undefined;

const CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  normal: { label: 'Normal', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  low: { label: 'Baixo', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  high: { label: 'Alto', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  critical: { label: 'Crítico', bg: 'bg-red-200', text: 'text-red-800', dot: 'bg-red-700' },
};

export function StatusBadge({ flag, compact }: { flag: Flag; compact?: boolean }) {
  if (!flag || !CONFIG[flag]) return null;
  const cfg = CONFIG[flag];

  if (compact) {
    return <View className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />;
  }

  return (
    <View className={`px-2 py-0.5 rounded-full ${cfg.bg}`}>
      <Text className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</Text>
    </View>
  );
}
