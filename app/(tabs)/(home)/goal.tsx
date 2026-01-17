import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMemo, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { TargetPeriod, Entry } from '../../../src/models/types';

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
  const rounded = Math.round(count * 100) / 100;
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  return rounded.toFixed(2);
};

export default function GoalScreen() {
  const { activeHabit, activeHabitOptions, activeHabitEntries, logEntry, habits } = useHabit();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();

  // Redirect to home if no habits exist (data was cleared) - only when screen is focused
  useEffect(() => {
    if (isFocused && habits.length === 0) {
      router.replace('/(tabs)/(home)');
    }
  }, [habits, router, isFocused]);

  // Calculate the display count based on target period
  const displayCount = useMemo(() => {
    if (!activeHabit) return 0;
    if (!activeHabit.target) return activeHabit.totalCount;
    return calculatePeriodCount(activeHabitEntries, activeHabit.target.period);
  }, [activeHabit, activeHabitEntries]);

  // If no habit is selected (shouldn't happen, but safe to handle)
  if (!activeHabit || habits.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: activeHabit.name,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerLeft}
            >
              <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Counter Display */}
        <View style={styles.counterContainer}>
          <Text style={[styles.counterValue, { color: theme.colors.primary }]}>
            {formatCount(displayCount)}
          </Text>
          <Text style={[styles.counterLabel, { color: theme.colors.text }]}>
            {activeHabit.target
              ? t('habits.vsTarget', {
                  value: activeHabit.target.value,
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
                {option.value > 0 ? `+${option.value}` : option.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: 'transparent' }]} pointerEvents="box-none">
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
  headerLeft: {
    padding: 4,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
