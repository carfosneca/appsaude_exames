import { View, Dimensions } from 'react-native';
import { LineChart as LineChartBase } from 'react-native-gifted-charts';
import type { LineChartPropsType } from 'react-native-gifted-charts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LineChart = LineChartBase as any;
import type { Observation } from '@/lib/db';

const SCREEN_W = Dimensions.get('window').width;

type Props = {
  observations: Observation[];
  refLow: number | null;
  refHigh: number | null;
};

export function AnalyteChart({ observations, refLow, refHigh }: Props) {
  const points = observations
    .filter((o) => o.value_numeric !== null)
    .map((o) => ({
      value: o.value_numeric as number,
      label: o.collected_at
        ? new Date(o.collected_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : '?',
      dataPointColor: flagColor(o.flag),
    }));

  if (points.length < 2) return null;

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values, ...(refLow !== null ? [refLow] : []));
  const maxVal = Math.max(...values, ...(refHigh !== null ? [refHigh] : []));
  const padding = (maxVal - minVal) * 0.2 || 1;

  const refLineProps: Partial<LineChartPropsType> = {};
  if (refLow !== null) {
    refLineProps.referenceLine1Position = refLow;
    refLineProps.referenceLine1Config = {
      color: '#fbbf24',
      dashWidth: 6,
      dashGap: 4,
      labelText: `Mín: ${refLow}`,
      labelTextStyle: { color: '#92400e', fontSize: 10 },
    };
  }
  if (refHigh !== null) {
    refLineProps.referenceLine2Position = refHigh;
    refLineProps.referenceLine2Config = {
      color: '#f87171',
      dashWidth: 6,
      dashGap: 4,
      labelText: `Máx: ${refHigh}`,
      labelTextStyle: { color: '#7f1d1d', fontSize: 10 },
    };
  }

  return (
    <View className="bg-white rounded-3xl p-4 border border-gray-100">
      <LineChart
        data={points}
        width={SCREEN_W - 80}
        height={180}
        color="#0694a2"
        thickness={2.5}
        curved
        areaChart
        startFillColor="#0694a2"
        startOpacity={0.15}
        endOpacity={0.01}
        dataPointsColor="#0694a2"
        dataPointsRadius={5}
        yAxisColor="transparent"
        xAxisColor="#e5e7eb"
        rulesColor="#f3f4f6"
        yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
        maxValue={maxVal + padding}
        minValue={minVal - padding}
        noOfSections={4}
        adjustToWidth
        {...refLineProps}
      />
    </View>
  );
}

function flagColor(flag: string | null | undefined): string {
  switch (flag) {
    case 'high':
    case 'critical':
      return '#ef4444';
    case 'low':
      return '#f59e0b';
    default:
      return '#0694a2';
  }
}
