import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LiftedPressable } from '../../../components/ui/lifted-pressable';
import { Segmented } from '../../../components/ui/segmented';
import { AveragesCard } from '../../../components/analytics/averages-card';
import { Chart } from '../../../components/analytics/chart';
import { OptionBars } from '../../../components/analytics/option-bars';
import { PeriodChips } from '../../../components/analytics/period-chips';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { getAnalyticsPrefs, setAnalyticsPrefs } from '../../../src/services/storage';
import {
  PERIODS,
  type Agg,
  type PeriodId,
  bucketByOption,
  bucketByTime,
  computeAverages,
  fmt,
  resolvePeriod,
} from '../../../src/utils/analytics';

type Mode = 'time' | 'options';
type ChartKind = 'line' | 'bar';

function LineIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 17l5-6 4 3 7-9" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BarIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 21V12M11 21V7M18 21V3" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { activeHabit, activeHabitEntries, activeHabitOptions, habits } = useHabit();

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const eyebrowColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const subtleTextColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const pointsActiveBg = isDark ? 'rgba(10,132,255,0.18)' : 'rgba(0,122,255,0.12)';
  const pointsInactiveBg = isDark ? 'rgba(118,118,128,0.18)' : 'rgba(120,120,128,0.16)';
  const pointsInactiveColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const iconColor = isDark ? '#FFFFFF' : '#000000';

  const [mode, setMode] = useState<Mode>('time');
  const [periodId, setPeriodIdState] = useState<PeriodId>('past30d');
  const [chartKind, setChartKindState] = useState<ChartKind>('line');
  const [showPoints, setShowPointsState] = useState<boolean>(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    getAnalyticsPrefs().then((p) => {
      setPeriodIdState(p.periodId);
      setChartKindState(p.chartKind);
      setShowPointsState(p.showPoints);
      setPrefsLoaded(true);
    });
  }, []);

  const persist = useCallback(
    (patch: Partial<{ periodId: PeriodId; chartKind: ChartKind; showPoints: boolean }>) => {
      setAnalyticsPrefs({
        periodId: patch.periodId ?? periodId,
        chartKind: patch.chartKind ?? chartKind,
        showPoints: patch.showPoints ?? showPoints,
      }).catch(() => {});
    },
    [periodId, chartKind, showPoints]
  );

  const setPeriodId = (id: PeriodId) => {
    setPeriodIdState(id);
    persist({ periodId: id });
  };
  const setChartKind = (k: ChartKind) => {
    setChartKindState(k);
    persist({ chartKind: k });
  };
  const setShowPoints = (v: boolean) => {
    setShowPointsState(v);
    persist({ showPoints: v });
  };

  const period = useMemo(() => resolvePeriod(periodId), [periodId]);
  const [agg, setAgg] = useState<Agg>(period.defaultAgg);
  useEffect(() => {
    setAgg(period.defaultAgg);
  }, [periodId]); // eslint-disable-line react-hooks/exhaustive-deps

  const yUnit = activeHabit?.target?.unitShort || '';

  const timeData = useMemo(() => {
    if (!activeHabit || mode !== 'time') return [];
    return bucketByTime(activeHabitEntries, period.start, period.end, agg);
  }, [activeHabit, activeHabitEntries, mode, periodId, agg]); // eslint-disable-line react-hooks/exhaustive-deps

  const optionData = useMemo(() => {
    if (!activeHabit || mode !== 'options') return [];
    return bucketByOption(activeHabitEntries, activeHabitOptions, period.start, period.end);
  }, [activeHabit, activeHabitEntries, activeHabitOptions, mode, periodId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeData = mode === 'time' ? timeData : optionData;
  const total = activeData.reduce((a, d) => a + d.value, 0);
  const nonEmpty = activeData.filter((d) => d.value > 0).length;
  const avgPerBucket = mode === 'time' && nonEmpty > 0 && timeData.length > 0 ? total / timeData.length : 0;

  const avgs = useMemo(() => computeAverages(activeHabitEntries), [activeHabitEntries]);

  const targetLine = useMemo(() => {
    if (mode !== 'time' || !activeHabit?.target) return null;
    const { value, period: tp } = activeHabit.target;
    if (tp === agg) return value;
    const perDay = tp === 'day' ? value : tp === 'week' ? value / 7 : tp === 'month' ? value / 30.44 : value / 365.25;
    if (agg === 'day') return perDay;
    if (agg === 'week') return perDay * 7;
    if (agg === 'month') return perDay * 30.44;
    return null;
  }, [mode, agg, activeHabit?.target]);

  useEffect(() => {
    if (habits.length === 0) router.dismissAll();
  }, [habits.length, router]);

  if (!activeHabit || !prefsLoaded) return null;

  const periodLabel = t(`analytics.periods.${periodId}`);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessibilityViewIsModal
    >
      {Platform.OS === 'web' && (
        <Head>
          <title>{`${t('analytics.title')} | ${activeHabit.name}`}</title>
        </Head>
      )}
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('analytics.title'),
          headerTitleAlign: 'center',
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.controlsBlock}>
          <Text style={[styles.eyebrow, { color: eyebrowColor }]}>{t('analytics.xAxis')}</Text>
          <Segmented
            options={[
              {
                value: 'time',
                label: t('analytics.modeTime'),
                accessibilityLabel: t('analytics.a11y.modeTime'),
              },
              {
                value: 'options',
                label: t('analytics.modeOptions'),
                accessibilityLabel: t('analytics.a11y.modeOptions'),
              },
            ]}
            value={mode}
            onChange={(v) => setMode(v as Mode)}
            style={{ marginBottom: 14 }}
          />

          <Text style={[styles.eyebrow, { color: eyebrowColor }]}>{t('analytics.period')}</Text>
          <PeriodChips
            items={PERIODS.map((p) => ({
              id: p.id,
              label: t(`analytics.periods.${p.id}`),
              accessibilityLabel: t('analytics.a11y.period', {
                period: t(`analytics.periods.${p.id}`),
              }),
            }))}
            activeId={periodId}
            onSelect={setPeriodId}
          />

          {mode === 'time' && (
            <View style={styles.aggRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eyebrow, { color: eyebrowColor }]}>{t('analytics.groupBy')}</Text>
                <Segmented
                  options={[
                    {
                      value: 'day',
                      label: t('analytics.agg.day'),
                      accessibilityLabel: t('analytics.a11y.groupBy', {
                        bucket: t('analytics.agg.day').toLowerCase(),
                      }),
                    },
                    {
                      value: 'week',
                      label: t('analytics.agg.week'),
                      accessibilityLabel: t('analytics.a11y.groupBy', {
                        bucket: t('analytics.agg.week').toLowerCase(),
                      }),
                    },
                    {
                      value: 'month',
                      label: t('analytics.agg.month'),
                      accessibilityLabel: t('analytics.a11y.groupBy', {
                        bucket: t('analytics.agg.month').toLowerCase(),
                      }),
                    },
                  ]}
                  value={agg}
                  onChange={(v) => setAgg(v as Agg)}
                />
              </View>
              <View style={{ width: 108 }}>
                <Text style={[styles.eyebrow, { color: eyebrowColor }]}>{t('analytics.chart')}</Text>
                <Segmented
                  options={[
                    {
                      value: 'line',
                      label: <LineIcon color={iconColor} />,
                      accessibilityLabel: t('analytics.a11y.chartLine'),
                    },
                    {
                      value: 'bar',
                      label: <BarIcon color={iconColor} />,
                      accessibilityLabel: t('analytics.a11y.chartBar'),
                    },
                  ]}
                  value={chartKind}
                  onChange={(v) => setChartKind(v as ChartKind)}
                />
              </View>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardEyebrow, { color: eyebrowColor }]}>
                {`${periodLabel.toUpperCase()} ${t('analytics.totalSuffix').toUpperCase()}`}
              </Text>
              <View style={styles.bigRow}>
                <Text style={[styles.bigNumber, { color: theme.colors.text }]}>{total}</Text>
                {yUnit ? <Text style={[styles.bigUnit, { color: subtleTextColor }]}>{yUnit}</Text> : null}
              </View>
              <Text style={[styles.cardSubtitle, { color: subtleTextColor }]}>
                {mode === 'time'
                  ? t('analytics.avgPerBucket', { value: fmt(avgPerBucket), bucket: t(`analytics.agg.${agg}`).toLowerCase() })
                  : t('analytics.optionsCount', { count: activeData.length })}
              </Text>
            </View>
            {mode === 'time' && chartKind === 'line' ? (
              <LiftedPressable
                onPress={() => setShowPoints(!showPoints)}
                accessibilityLabel={
                  showPoints ? t('analytics.a11y.pointsOn') : t('analytics.a11y.pointsOff')
                }
                style={[
                  styles.pointsPill,
                  { backgroundColor: showPoints ? pointsActiveBg : pointsInactiveBg },
                ]}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={13}
                  color={showPoints ? theme.colors.primary : pointsInactiveColor}
                />
                <Text
                  style={[
                    styles.pointsPillText,
                    { color: showPoints ? theme.colors.primary : pointsInactiveColor },
                  ]}
                >
                  {showPoints ? t('analytics.pointsOn') : t('analytics.pointsOff')}
                </Text>
              </LiftedPressable>
            ) : null}
          </View>
          {mode === 'time' ? (
            <Chart
              data={timeData}
              kind={chartKind}
              showPoints={showPoints}
              color={theme.colors.primary}
              targetLine={targetLine}
              yUnit={yUnit}
              emptyLabel={t('analytics.empty')}
            />
          ) : (
            <OptionBars data={optionData} color={theme.colors.primary} yUnit={yUnit} />
          )}
          <Text style={[styles.tip, { color: theme.colors.text }]}>
            {mode === 'time' ? t('analytics.tipTime') : t('analytics.tipOptions')}
          </Text>
        </View>

        <Text style={[styles.sectionHeader, { color: eyebrowColor }]}>
          {t('analytics.averages').toUpperCase()}
        </Text>
        <AveragesCard
          rows={[
            { label: t('analytics.perDay'), value: avgs.day },
            { label: t('analytics.perWeek'), value: avgs.week },
            { label: t('analytics.perMonth'), value: avgs.month },
            { label: t('analytics.perYear'), value: avgs.year },
            { label: t('analytics.perActiveDay'), value: avgs.active, sub: t('analytics.activeDaysDetail', { active: avgs.activeDays, span: avgs.spanDays }) },
          ]}
          unit={yUnit}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 14, paddingBottom: 130 },
  controlsBlock: { marginBottom: 12 },
  aggRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  bigRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  bigNumber: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 36,
  },
  bigUnit: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pointsPillText: { fontSize: 11, fontWeight: '600', letterSpacing: -0.1 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  tip: {
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
});
