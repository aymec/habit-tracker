import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { OptionBucket } from '../../src/utils/analytics';

interface OptionBarsProps {
  data: OptionBucket[];
  color?: string;
  yUnit?: string;
}

const ROW_HEIGHT = 28;
const ROW_GAP = 10;
const LEFT_GUTTER = 36;
const BAR_RADIUS = 8;

export function OptionBars({ data, color = '#0A84FF', yUnit = '' }: OptionBarsProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <View style={styles.container}>
      {sorted.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <View key={d.id} style={styles.row}>
            <View style={styles.gutter}>
              <Text style={styles.emoji}>{d.label}</Text>
            </View>
            <View style={styles.trackWrap}>
              <View style={styles.track}>
                <View style={[styles.barWrap, { width: `${pct}%` }]}>
                  <Svg width="100%" height={ROW_HEIGHT}>
                    <Defs>
                      <LinearGradient id={`bar-${d.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={color} stopOpacity="1" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
                      </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height={ROW_HEIGHT} rx={BAR_RADIUS} ry={BAR_RADIUS} fill={`url(#bar-${d.id})`} />
                  </Svg>
                </View>
                <View style={styles.labelsOverlay} pointerEvents="none">
                  <Text style={styles.count}>{d.count > 0 ? `${d.count}×` : ''}</Text>
                  <Text style={styles.value}>{d.value}{yUnit ? ` ${yUnit}` : ''}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: ROW_GAP,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gutter: {
    width: LEFT_GUTTER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
    textAlign: 'center',
  },
  trackWrap: {
    flex: 1,
  },
  track: {
    height: ROW_HEIGHT,
    borderRadius: BAR_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    position: 'relative',
  },
  barWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
  },
  labelsOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  count: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
