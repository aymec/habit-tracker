import { useCallback, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { populateTestData } from '../../../src/services/storage';
import { CircularProgress } from '../../../components/ui/circular-progress';
import { GlassCard } from '../../../components/ui/glass-card';
import { LiftedPressable } from '../../../components/ui/lifted-pressable';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { calculatePeriodCount } from '../../../src/utils/period';
import { formatNumber } from '../../../src/utils/format';
import { Entry } from '../../../src/models/types';
import * as Storage from '../../../src/services/storage';
import { usePressEffect } from '../../../src/theme/press-effect';

const liquidGlass = isLiquidGlassAvailable();

const CARD_MIN_WIDTH = 160;
const CARD_GAP = 12;
const GRID_PADDING = 15;
const RING_SIZE = 90;
const RING_STROKE = 7;

export default function HomeScreen() {
  const { habits, selectHabit, loadHabits } = useHabit();
  const { theme } = useTheme();
  const { liftedStyle, pressedStyle } = usePressEffect();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [allEntries, setAllEntries] = useState<Entry[]>([]);

  const numColumns = Math.min(
    Math.max(habits.length, 1),
    Math.max(2, Math.floor((windowWidth - GRID_PADDING * 2 + CARD_GAP) / (CARD_MIN_WIDTH + CARD_GAP)))
  );

  // Load all entries on focus for period calculations
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = `${t('habits.title')} | OnTrack`;
      }
      Storage.getEntries().then(setAllEntries);
    }, [t])
  );

  const handleGoalPress = (goalId: string) => {
    selectHabit(goalId);
    router.push('/(tabs)/(home)/goal');
  };

  const handleStartDemo = async () => {
    try {
      await populateTestData(t);
      await loadHabits();
      const entries = await Storage.getEntries();
      setAllEntries(entries);
      if (Platform.OS === 'web') {
        window.alert(`${t('data.demoDataSetTitle')}\n\n${t('data.demoDataSetMessage')}`);
      } else {
        Alert.alert(t('data.demoDataSetTitle'), t('data.demoDataSetMessage'));
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(`${t('common.error')}: ${t('data.failedToSetDemoData')}`);
      } else {
        Alert.alert(t('common.error'), t('data.failedToSetDemoData'));
      }
      console.error(error);
    }
  };

  // Pre-compute entries per habit
  const entriesByHabit = useMemo(() => {
    const map: Record<string, Entry[]> = {};
    for (const entry of allEntries) {
      if (!map[entry.habitId]) {
        map[entry.habitId] = [];
      }
      map[entry.habitId].push(entry);
    }
    return map;
  }, [allEntries]);

  // Build rows of cards for the grid
  const rows = useMemo(() => {
    const result: typeof habits[] = [];
    for (let i = 0; i < habits.length; i += numColumns) {
      result.push(habits.slice(i, i + numColumns));
    }
    return result;
  }, [habits, numColumns]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {Platform.OS === 'web' && (
        <Head>
          <title>{t('habits.title')} | OnTrack</title>
        </Head>
      )}
      {habits.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="clipboard-outline" size={80} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {t('habits.noHabits')}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.gridContainer}
          style={{ backgroundColor: theme.colors.background }}
        >
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((habit) => {
                const habitEntries = entriesByHabit[habit.id] || [];
                const hasTarget = !!habit.target;
                const periodCount = hasTarget
                  ? calculatePeriodCount(habitEntries, habit.target!.period)
                  : habit.totalCount;
                const progress = hasTarget
                  ? periodCount / habit.target!.value
                  : undefined;

                return (
                  <Pressable
                    key={habit.id}
                    style={styles.card}
                    onPress={() => handleGoalPress(habit.id)}
                  >
                    {({ pressed }) => (
                      <View
                        style={[
                          styles.card,
                          { borderRadius: theme.borderRadius.l, backgroundColor: 'transparent' },
                          liftedStyle,
                          pressed && pressedStyle,
                        ]}
                      >
                        <GlassCard
                          glassEffect="clear"
                          fallbackBackgroundColor={theme.colors.card}
                          fallbackBorderColor={theme.colors.border}
                          borderRadius={theme.borderRadius.l}
                          style={styles.card}
                        >
                          <View style={styles.cardContent}>
                            <Text
                              style={[styles.cardName, { color: theme.colors.text }]}
                              numberOfLines={2}
                            >
                              {habit.name}
                            </Text>
                            <CircularProgress
                              size={RING_SIZE}
                              strokeWidth={RING_STROKE}
                              progress={progress}
                              color={theme.colors.primary}
                              trackColor={theme.colors.border}
                            >
                              <Text style={[styles.ringText, { color: theme.colors.text }]}>
                                {hasTarget
                                  ? `${formatNumber(periodCount)} / ${formatNumber(habit.target!.value)}`
                                  : formatNumber(periodCount)}
                              </Text>
                            </CircularProgress>
                          </View>
                        </GlassCard>
                      </View>
                    )}
                  </Pressable>
                );
              })}
              {/* Fill remaining space in last row with empty views */}
              {row.length < numColumns &&
                Array.from({ length: numColumns - row.length }).map((_, i) => (
                  <View key={`spacer-${i}`} style={styles.card} />
                ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Fixed Footer */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background, paddingBottom: liquidGlass ? Math.max(25, insets.bottom + 60) : 25 }]}>
        {habits.length === 0 && (
          <LiftedPressable
            style={[styles.demoButton, { borderColor: theme.colors.primary }]}
            onPress={handleStartDemo}
          >
            <Text style={[styles.demoButtonText, { color: theme.colors.primary }]}>
              {t('habits.startDemo')}
            </Text>
          </LiftedPressable>
        )}
        <LiftedPressable
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(tabs)/(home)/name')}
        >
          <Text style={styles.addButtonText}>{t('habits.newHabit')}</Text>
        </LiftedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  gridContainer: {
    padding: GRID_PADDING,
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    flex: 1,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  ringText: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  footer: {
    padding: 15,
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 10,
  },
  demoButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
