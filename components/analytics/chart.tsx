import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import type { TimeBucket } from '../../src/utils/analytics';

export type ChartKind = 'line' | 'bar';

interface ChartProps {
  data: TimeBucket[];
  kind?: ChartKind;
  showPoints?: boolean;
  color?: string;
  targetLine?: number | null;
  height?: number;
  yUnit?: string;
  emptyLabel?: string;
}

const VIEWBOX_WIDTH = 342;
const PAD_LEFT = 28;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

function niceMaxOf(raw: number): number {
  if (raw <= 5) return Math.max(1, Math.ceil(raw));
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / exp;
  const nice = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
  return nice * exp;
}

function formatTick(t: number): string {
  if (t >= 1000) return `${(t / 1000).toFixed(1)}k`;
  return String(Math.round(t));
}

export function Chart({
  data,
  kind = 'line',
  showPoints = true,
  color = '#0A84FF',
  targetLine = null,
  height = 220,
  yUnit = '',
  emptyLabel = 'No data in this range',
}: ChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const layoutRef = useRef<{ x: number; width: number }>({ x: 0, width: 0 });

  const n = data.length;
  const w = VIEWBOX_WIDTH - PAD_LEFT - PAD_RIGHT;
  const h = height - PAD_TOP - PAD_BOTTOM;

  const max = Math.max(1, ...data.map((d) => d.value), targetLine || 0);
  const niceMax = useMemo(() => niceMaxOf(max), [max]);

  const xFor = (i: number): number => {
    if (n === 1) return PAD_LEFT + w / 2;
    return PAD_LEFT + (i / (n - 1)) * w;
  };
  const yFor = (v: number): number => PAD_TOP + (1 - v / niceMax) * h;

  const linePath = useMemo(() => {
    if (!n) return '';
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)} ${yFor(d.value).toFixed(1)}`)
      .join(' ');
  }, [data, niceMax, n]);

  const areaPath = useMemo(() => {
    if (!n) return '';
    const first = xFor(0).toFixed(1);
    const last = xFor(n - 1).toFixed(1);
    const mid = data.map((d, i) => `L${xFor(i).toFixed(1)} ${yFor(d.value).toFixed(1)}`).join(' ');
    return `M${first} ${PAD_TOP + h} ${mid} L${last} ${PAD_TOP + h} Z`;
  }, [data, niceMax, n]);

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= 3; i++) out.push((niceMax * i) / 3);
    return out;
  }, [niceMax]);

  const labelEvery = Math.max(1, Math.ceil(n / 6));
  const barGap = 2;
  const barW = kind === 'bar' ? Math.max(4, w / n - barGap) : 0;

  const handleMoveToX = (screenX: number) => {
    const { x: layoutX, width: layoutWidth } = layoutRef.current;
    if (layoutWidth <= 0 || n === 0) return;
    const relative = (screenX - layoutX) / layoutWidth;
    const x = relative * VIEWBOX_WIDTH;
    let idx: number;
    if (n === 1) idx = 0;
    else idx = Math.round(((x - PAD_LEFT) / w) * (n - 1));
    idx = Math.max(0, Math.min(n - 1, idx));
    if (hoverRef.current !== idx) {
      hoverRef.current = idx;
      setHover(idx);
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => handleMoveToX(e.nativeEvent.pageX),
      onPanResponderMove: (e) => handleMoveToX(e.nativeEvent.pageX),
      onPanResponderRelease: () => {
        hoverRef.current = null;
        setHover(null);
      },
      onPanResponderTerminate: () => {
        hoverRef.current = null;
        setHover(null);
      },
    })
  ).current;

  if (!n) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const hoverD = hover != null ? data[hover] : null;
  const hoverX = hover != null ? xFor(hover) : 0;
  const tooltipPct = Math.min(Math.max(0, (hoverX / VIEWBOX_WIDTH) * 100 - 12), 78);

  return (
    <View
      style={{ position: 'relative' }}
      onLayout={(e) => {
        const { x, width } = e.nativeEvent.layout;
        layoutRef.current = { x, width };
      }}
      {...responder.panHandlers}
    >
      <Svg width="100%" height={height} viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}>
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {ticks.map((t, i) => (
          <G key={`tick-${i}`}>
            <Line
              x1={PAD_LEFT}
              x2={VIEWBOX_WIDTH - PAD_RIGHT}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
              strokeDasharray={i === 0 ? undefined : '2 3'}
            />
            <SvgText
              x={PAD_LEFT - 6}
              y={yFor(t) + 3}
              fill="rgba(235,235,245,0.4)"
              fontSize="10"
              textAnchor="end"
            >
              {formatTick(t)}
            </SvgText>
          </G>
        ))}

        {targetLine != null && targetLine > 0 && targetLine <= niceMax ? (
          <G>
            <Line
              x1={PAD_LEFT}
              x2={VIEWBOX_WIDTH - PAD_RIGHT}
              y1={yFor(targetLine)}
              y2={yFor(targetLine)}
              stroke="#32D74B"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity={0.8}
            />
            <SvgText
              x={VIEWBOX_WIDTH - PAD_RIGHT - 2}
              y={yFor(targetLine) - 4}
              fill="#32D74B"
              fontSize="10"
              fontWeight="600"
              textAnchor="end"
            >
              target {targetLine}{yUnit ? ` ${yUnit}` : ''}
            </SvgText>
          </G>
        ) : null}

        {kind === 'line' ? (
          <G>
            <Path d={areaPath} fill="url(#areaFill)" />
            <Path d={linePath} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            {showPoints
              ? data.map((d, i) => (
                  <Circle
                    key={`p-${i}`}
                    cx={xFor(i)}
                    cy={yFor(d.value)}
                    r={hover === i ? 4.5 : 2.8}
                    fill={color}
                    stroke="#000"
                    strokeWidth={hover === i ? 2 : 0}
                  />
                ))
              : null}
          </G>
        ) : (
          data.map((d, i) => {
            const y = yFor(d.value);
            const barH = PAD_TOP + h - y;
            const active = hover === i;
            return (
              <Rect
                key={`b-${i}`}
                x={xFor(i) - barW / 2}
                y={y}
                width={barW}
                height={Math.max(0, barH)}
                rx={Math.min(3, barW / 2)}
                ry={Math.min(3, barW / 2)}
                fill={color}
                opacity={active ? 1 : 0.82}
              />
            );
          })
        )}

        {data.map((d, i) => {
          if (i % labelEvery !== 0 && i !== n - 1) return null;
          return (
            <SvgText
              key={`xl-${i}`}
              x={xFor(i)}
              y={height - 10}
              fill="rgba(235,235,245,0.55)"
              fontSize="10"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}

        {hoverD ? (
          <Line
            x1={hoverX}
            x2={hoverX}
            y1={PAD_TOP}
            y2={PAD_TOP + h}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
        ) : null}
      </Svg>

      {hoverD ? (
        <View
          pointerEvents="none"
          style={[styles.tooltip, { left: `${tooltipPct}%` }]}
        >
          <Text style={styles.tooltipEyebrow}>{hoverD.fullLabel || hoverD.label}</Text>
          <Text style={styles.tooltipValue}>
            {hoverD.value}{yUnit ? ` ${yUnit}` : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  tooltip: {
    position: 'absolute',
    top: 4,
    backgroundColor: 'rgba(40,40,42,0.96)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 78,
  },
  tooltipEyebrow: {
    color: 'rgba(235,235,245,0.6)',
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  tooltipValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 1,
  },
});
