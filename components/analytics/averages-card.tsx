import { StyleSheet, Text, View } from 'react-native';
import { fmt } from '../../src/utils/analytics';
import { useTheme } from '../../src/context/ThemeContext';

export interface AveragesRowData {
  label: string;
  value: number;
  sub?: string;
}

interface AveragesCardProps {
  rows: AveragesRowData[];
  unit?: string;
}

export function AveragesCard({ rows, unit }: AveragesCardProps) {
  const { isDark, theme } = useTheme();
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const labelColor = theme.colors.text;
  const subColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const dividerColor = isDark ? 'rgba(84,84,88,0.35)' : 'rgba(60,60,67,0.18)';

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {rows.map((r, i) => (
        <View
          key={r.label}
          style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: dividerColor }]}
        >
          <View style={styles.left}>
            <Text style={[styles.label, { color: labelColor }]}>{r.label}</Text>
            {r.sub ? <Text style={[styles.sub, { color: subColor }]}>{r.sub}</Text> : null}
          </View>
          <View style={styles.right}>
            <Text style={[styles.value, { color: labelColor }]}>{fmt(r.value)}</Text>
            {unit ? <Text style={[styles.unit, { color: subColor }]}>{unit}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  sub: {
    fontSize: 11,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 3,
  },
});
