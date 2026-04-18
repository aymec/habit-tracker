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
import { GlassCard } from '../../../components/ui/glass-card';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

const liquidGlass = isLiquidGlassAvailable();

const formatCount = (count: number): string => {
  return formatNumber(count);
};

const BASE_FONT_SIZE = 80;
const CONTAINER_PADDING = 40; // 20px on each side
// Approximate character width as a ratio of font size (for tabular-nums bold font)
const CHAR_WIDTH_RATIO = 0.6;

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

  // Calculate dynamic font size for web (adjustsFontSizeToFit doesn't work on web)
  const counterFontSize = useMemo(() => {
    if (Platform.OS !== 'web') return BASE_FONT_SIZE;

    const formattedText = formatCount(displayCount);
    const availableWidth = windowWidth - CONTAINER_PADDING;
    const textWidth = formattedText.length * BASE_FONT_SIZE * CHAR_WIDTH_RATIO;

    if (textWidth <= availableWidth) return BASE_FONT_SIZE;

    // Scale down the font to fit
    const scaledSize = Math.floor((availableWidth / formattedText.length) / CHAR_WIDTH_RATIO);
    return Math.max(scaledSize, 24); // Minimum font size of 24
  }, [displayCount, windowWidth]);

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
        {/* Counter Display */}
        <View style={styles.counterContainer}>
          <Text
            style={[styles.counterValue, { color: theme.colors.primary, fontSize: counterFontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCount(displayCount)}
          </Text>
          <Text style={[styles.counterLabel, { color: theme.colors.text }]}>
            {activeHabit.target
              ? t('habits.vsTarget', {
                  value: formatNumber(activeHabit.target.value),
                  unit: activeHabit.target.unitShort ? activeHabit.target.unitShort : '',
                  period: t(`habits.period.${activeHabit.target.period}`)
                })
              : t('history.totalCount')}
          </Text>
        </View>

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

      </ScrollView>

      {/* Tooltip overlay - positioned absolutely so it doesn't affect layout */}
      {showTooltip && (
        <View style={styles.tooltipOverlay} pointerEvents="box-none">
          <View style={styles.tooltipBanner}>
            <View style={[styles.tooltipBubble, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.tooltipText}>{t('habits.customizeTooltip')}</Text>
              <TouchableOpacity onPress={() => setShowTooltip(false)} style={styles.tooltipClose}>
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Toolbar */}
      <View style={[styles.toolbar, { bottom: liquidGlass ? Math.max(15, insets.bottom + 60) : 15, pointerEvents: 'box-none' }]}>
        <Pressable
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
              borderRadius={27}
              style={[
                liftedStyle,
                pressed && pressedStyle,
                showTooltip && [styles.editButtonHalo, { shadowColor: theme.colors.primary }],
              ]}
            >
              <View style={styles.toolbarButton}>
                <Ionicons name="build-outline" size={29} color={showTooltip ? theme.colors.primary : theme.colors.text} />
              </View>
            </GlassCard>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/(home)/history')}>
          {({ pressed }) => (
            <GlassCard
              glassEffect="regular"
              fallbackBackgroundColor={theme.colors.card}
              fallbackBorderColor={theme.colors.border}
              borderRadius={27}
              style={[
                liftedStyle,
                pressed && pressedStyle,
              ]}
            >
              <View style={styles.toolbarButton}>
                <Ionicons name="calendar-number-outline" size={29} color={theme.colors.text} />
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
    paddingHorizontal: 20,
  },
  toolbarButton: {
    width: 53,
    height: 53,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 80,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 50,
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
    marginTop: 5,
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
