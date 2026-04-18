import { StyleSheet, Text, View } from 'react-native';
import { fmt } from '../../src/utils/analytics';

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
  return (
    <View style={styles.card}>
      {rows.map((r, i) => (
        <View key={r.label} style={[styles.row, i > 0 && styles.rowDivider]}>
          <View style={styles.left}>
            <Text style={styles.label}>{r.label}</Text>
            {r.sub ? <Text style={styles.sub}>{r.sub}</Text> : null}
          </View>
          <View style={styles.right}>
            <Text style={styles.value}>{fmt(r.value)}</Text>
            {unit ? <Text style={styles.unit}>{unit}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(84,84,88,0.35)',
  },
  left: {
    flex: 1,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  sub: {
    color: 'rgba(235,235,245,0.6)',
    fontSize: 11,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    color: 'rgba(235,235,245,0.6)',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 3,
  },
});
