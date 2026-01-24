import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useMemo, useEffect, useCallback } from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { TargetPeriod, Entry } from '../../../src/models/types';
import { formatNumber, formatNumberWithSign } from '../../../src/utils/format';

const getStartOfPeriod = (period: TargetPeriod): Date => {
  const now = new Date();
  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
  }
};

const calculatePeriodCount = (entries: Entry[], period: TargetPeriod): number => {
  const startOfPeriod = getStartOfPeriod(period);
  return entries
    .filter(entry => new Date(entry.timestamp) >= startOfPeriod)
    .reduce((sum, entry) => sum + entry.value, 0);
};

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
  const { t } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { width: windowWidth } = useWindowDimensions();

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
                  period: t(`habits.period.${activeHabit.target.period}`)
                })
              : t('history.totalCount')}
          </Text>
        </View>

        {/* Option Buttons */}
        <View style={styles.optionsContainer}>
          {activeHabitOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => logEntry(activeHabit.id, option.label, option.value)}
            >
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                {option.label}
              </Text>
              <Text style={[styles.optionValue, { color: theme.colors.text }]}>
                {formatNumberWithSign(option.value)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: 'transparent', pointerEvents: 'box-none' }]}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(tabs)/(home)/edit', params: { mode: 'edit' } })}
          style={[styles.toolbarButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
        >
          <Ionicons name="build-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/(home)/history')}
          style={[styles.toolbarButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
        >
          <Ionicons name="calendar-number-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
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
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
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
  optionButton: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 12,
  },
});
