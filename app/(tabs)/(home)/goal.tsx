import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { usePressEffect } from '../../../src/theme/press-effect';
import { Entry } from '../../../src/models/types';
import { formatNumber, formatNumberWithSign } from '../../../src/utils/format';
import { calculatePeriodCount } from '../../../src/utils/period';
import { computeStreaks } from '../../../src/utils/streaks';
import { GlassCard } from '../../../components/ui/glass-card';
import { CircularProgress } from '../../../components/ui/circular-progress';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

const liquidGlass = isLiquidGlassAvailable();

const formatCount = (count: number): string => {
  return formatNumber(count);
};

const BASE_FONT_SIZE = 80;
const CONTAINER_PADDING = 40; // 20px on each side
// Approximate character width as a ratio of font size (for tabular-nums bold font)
const CHAR_WIDTH_RATIO = 0.6;
const RING_SIZE = 260;
const RING_STROKE = 8;
const RING_INNER_WIDTH = 220;

export default function GoalScreen() {
  const { activeHabit, activeHabitOptions, activeHabitEntries, logEntry, habits } = useHabit();
  const { theme } = useTheme();
  const { liftedStyle, pressedStyle } = usePressEffect();
  const { t } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Redirect to home if no habits exist (data was cleared) - only when screen is focused
  useEffect(() => {
    if (isFocused && habits.length === 0) {
      router.dismissAll();
    }
  }, [habits, router, isFocused]);

  // Update document title on focus for web (Head component doesn't update on tab switch)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web' && activeHabit) {
        document.title = `${activeHabit.name} | OnTrack`;
      }
    }, [activeHabit])
  );

  // Calculate the display count based on target period
  const displayCount = useMemo(() => {
    if (!activeHabit) return 0;
    if (!activeHabit.target) return activeHabit.totalCount;
    return calculatePeriodCount(activeHabitEntries, activeHabit.target.period);
  }, [activeHabit, activeHabitEntries]);

  const progress = useMemo(() => {
    if (!activeHabit?.target) return undefined;
    return displayCount / activeHabit.target.value;
  }, [activeHabit, displayCount]);

  const streaks = useMemo(() => {
    if (!activeHabit) return { current: 0, best: 0 };
    return computeStreaks(activeHabitEntries, activeHabit);
  }, [activeHabit, activeHabitEntries]);

  // Calculate dynamic font size for web (adjustsFontSizeToFit doesn't work on web)
  const counterFontSize = useMemo(() => {
    if (Platform.OS !== 'web') return BASE_FONT_SIZE;

    const formattedText = formatCount(displayCount);
    const availableWidth = activeHabit?.target
      ? RING_INNER_WIDTH
      : windowWidth - CONTAINER_PADDING;
    const textWidth = formattedText.length * BASE_FONT_SIZE * CHAR_WIDTH_RATIO;

    if (textWidth <= availableWidth) return BASE_FONT_SIZE;

    // Scale down the font to fit
    const scaledSize = Math.floor((availableWidth / formattedText.length) / CHAR_WIDTH_RATIO);
    return Math.max(scaledSize, 24); // Minimum font size of 24
  }, [displayCount, windowWidth, activeHabit]);

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipShownRef = useRef(false);

  const handleOptionPress = (option: { label: string; value: number; isDefault?: boolean }) => {
    if (!activeHabit) return;
    if (option.isDefault && !tooltipShownRef.current) {
      tooltipShownRef.current = true;
      setShowTooltip(true);
      // Persist so it never shows again for this habit
      const key = `tooltip-seen-${activeHabit.id}`;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, '1');
      } else {
        AsyncStorage.setItem(key, '1');
      }
    } else {
      logEntry(activeHabit.id, option.label, option.value);
    }
  };

  // Check if tooltip was already shown for this habit
  useEffect(() => {
    if (!activeHabit) return;
    const key = `tooltip-seen-${activeHabit.id}`;
    if (Platform.OS === 'web') {
      tooltipShownRef.current = window.localStorage.getItem(key) === '1';
    } else {
      AsyncStorage.getItem(key).then(val => {
        tooltipShownRef.current = val === '1';
      });
    }
  }, [activeHabit?.id]);

  // If no habit is selected (shouldn't happen, but safe to handle)
  if (!activeHabit || habits.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {Platform.OS === 'web' && (
        <Head>
          <title>{activeHabit.name} | OnTrack</title>
        </Head>
      )}
      <Stack.Screen
        options={{
          headerShown: true,
          title: activeHabit.name,
          headerTitleAlign: 'center',
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.flexibleTop} />
        {/* Counter Display */}
        <View style={styles.counterContainer}>
          {activeHabit.target ? (
            <CircularProgress
              size={RING_SIZE}
              strokeWidth={RING_STROKE}
              progress={progress}
              color={theme.colors.primary}
              trackColor={theme.colors.border}
            >
              <View style={styles.ringInner}>
                <Text
                  style={[styles.counterValue, { color: theme.colors.primary, fontSize: counterFontSize }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatCount(displayCount)}
                </Text>
                <Text style={[styles.ringLabel, { color: theme.colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>
                  {t('habits.vsTarget', {
                    value: formatNumber(activeHabit.target.value),
                    unit: activeHabit.target.unitShort ? activeHabit.target.unitShort : '',
                    period: t(`habits.period.${activeHabit.target.period}`)
                  })}
                </Text>
              </View>
            </CircularProgress>
          ) : (
            <Text
              style={[styles.counterValue, { color: theme.colors.primary, fontSize: counterFontSize }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCount(displayCount)}
            </Text>
          )}
          {!activeHabit.target && (
            <Text style={[styles.counterLabel, { color: theme.colors.text }]}>
              {t('history.totalCount')}
            </Text>
          )}
        </View>

        {/* Streak row — only shown when current or best is above 0 */}
        {(streaks.current > 0 || streaks.best > 0) && (
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={[styles.streakValue, { color: theme.colors.primary }]}>{streaks.current}</Text>
              <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
                {t('streaks.current')}
              </Text>
              <Text style={[styles.streakUnit, { color: theme.colors.textSecondary }]}>
                {t(`streaks.period.${activeHabit.target?.period ?? 'day'}`)}
              </Text>
            </View>
            <View style={[styles.streakDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.streakItem}>
              <Text style={[styles.streakValue, { color: theme.colors.primary }]}>{streaks.best}</Text>
              <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
                {t('streaks.best')}
              </Text>
              <Text style={[styles.streakUnit, { color: theme.colors.textSecondary }]}>
                {t(`streaks.period.${activeHabit.target?.period ?? 'day'}`)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.flexibleMiddle} />
        {/* Option Buttons */}
        <View style={styles.optionsContainer}>
          {activeHabitOptions.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => handleOptionPress(option)}
            >
              {({ pressed }) => (
                <GlassCard
                  glassEffect="clear"
                  fallbackBackgroundColor={theme.colors.card}
                  fallbackBorderColor={theme.colors.border}
                  borderRadius={16}
                  style={[
                    styles.optionButtonOuter,
                    liftedStyle,
                    pressed && pressedStyle,
                  ]}
                >
                  <View style={styles.optionButton}>
                    <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionValue, { color: theme.colors.text }]}>
                      {formatNumberWithSign(option.value)}
                    </Text>
                  </View>
                </GlassCard>
              )}
            </Pressable>
          ))}
        </View>
        <View style={styles.flexibleBottom} />

      </ScrollView>

      {/* Tooltip overlay - positioned absolutely so it doesn't affect layout */}
      {showTooltip && (
        <View style={styles.tooltipOverlay} pointerEvents="box-none">
          <View style={styles.tooltipBanner}>
            <View style={[styles.tooltipBubble, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.tooltipText}>{t('habits.customizeTooltip')}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('habits.a11y.dismissTip')}
                onPress={() => setShowTooltip(false)}
                style={styles.tooltipClose}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Toolbar */}
      <View style={[styles.toolbar, { bottom: liquidGlass ? Math.max(15, insets.bottom + 60) : 15, pointerEvents: 'box-none' }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('habits.a11y.settings')}
          onPress={() => {
            setShowTooltip(false);
            router.push({ pathname: '/(tabs)/(home)/edit', params: { mode: 'edit' } });
          }}
        >
          {({ pressed }) => (
            <GlassCard
              glassEffect="regular"
              fallbackBackgroundColor={theme.colors.card}
              fallbackBorderColor={showTooltip ? theme.colors.primary : theme.colors.border}
              borderRadius={21}
              style={[
                liftedStyle,
                pressed && pressedStyle,
                showTooltip && [styles.editButtonHalo, { shadowColor: theme.colors.primary }],
              ]}
            >
              <View style={styles.toolbarSideButton}>
                <Ionicons name="build-outline" size={22} color={showTooltip ? theme.colors.primary : theme.colors.text} />
              </View>
            </GlassCard>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('habits.a11y.analytics')}
          onPress={() => router.push('/(tabs)/(home)/analytics')}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.analyticsButton,
                { backgroundColor: theme.colors.primary },
                styles.analyticsShadow,
                pressed && pressedStyle,
              ]}
            >
              <Ionicons name="analytics" size={26} color="#FFFFFF" />
            </View>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('habits.a11y.history')}
          onPress={() => router.push('/(tabs)/(home)/history')}
        >
          {({ pressed }) => (
            <GlassCard
              glassEffect="regular"
              fallbackBackgroundColor={theme.colors.card}
              fallbackBorderColor={theme.colors.border}
              borderRadius={21}
              style={[
                liftedStyle,
                pressed && pressedStyle,
              ]}
            >
              <View style={styles.toolbarSideButton}>
                <Ionicons name="calendar-number-outline" size={22} color={theme.colors.text} />
              </View>
            </GlassCard>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toolbarSideButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#0A84FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 18,
      },
      android: {
        elevation: 6,
        boxShadow: '0px 6px 18px rgba(10,132,255,0.45)',
      },
      web: {
        boxShadow: '0px 6px 18px rgba(10,132,255,0.45)',
      },
    }),
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 80,
  },
  flexibleTop: {
    flex: 1,
    minHeight: 24,
    maxHeight: 80,
    width: '100%',
  },
  flexibleMiddle: {
    flex: 1,
    minHeight: 24,
    maxHeight: 100,
    width: '100%',
  },
  flexibleBottom: {
    flex: 2,
    width: '100%',
  },
  counterContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  counterValue: {
    fontSize: 80,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  counterLabel: {
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
  },
  ringInner: {
    width: RING_INNER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
    width: RING_INNER_WIDTH - 24,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 0,
  },
  streakItem: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  streakLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  streakUnit: {
    fontSize: 11,
    marginTop: 1,
  },
  streakDivider: {
    width: 1,
    height: 48,
    borderRadius: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 15,
    paddingHorizontal: 20,
  },
  optionButtonOuter: {
    width: 100,
    height: 80,
  },
  optionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionValue: {
    fontSize: 12,
  },
  tooltipOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '62%',
    alignItems: 'center',
  },
  tooltipBanner: {
    alignItems: 'center',
  },
  tooltipBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 8,
    borderRadius: 10,
    width: 150,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  tooltipClose: {
    padding: 6,
    marginLeft: 8,
  },
  editButtonHalo: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 0 12px 3px currentColor',
      },
    }),
  },
});
