import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { useHabit } from '../../../src/context/HabitContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { TargetPeriod } from '../../../src/models/types';

const PERIODS: TargetPeriod[] = ['day', 'week', 'month', 'year'];

export default function TargetScreen() {
  const { theme } = useTheme();
  const { createNewHabit } = useHabit();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const habitName = params.name as string;

  const [targetValue, setTargetValue] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<TargetPeriod>('day');

  const navigateToEdit = () => {
    // Dismiss all creation screens (name, target), then push goal and edit
    // This way the stack becomes: Home → Goal → Edit
    router.dismissAll();
    router.push('/(tabs)/(home)/goal');
    router.push({ pathname: '/(tabs)/(home)/edit', params: { mode: 'edit' } });
  };

  const handleSkip = async () => {
    try {
      await createNewHabit(habitName);
      navigateToEdit();
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        alert('Failed to create goal');
      } else {
        Alert.alert(t('common.error'), 'Failed to create goal');
      }
    }
  };

  const handleNext = async () => {
    const trimmedValue = targetValue.trim();

    // If empty, show skip confirmation
    if (trimmedValue === '') {
      if (Platform.OS === 'web') {
        const confirmed = confirm(t('habits.skipTargetConfirmMessage'));
        if (confirmed) {
          handleSkip();
        }
      } else {
        Alert.alert(
          t('habits.skipTargetConfirmTitle'),
          t('habits.skipTargetConfirmMessage'),
          [
            { text: t('common.edit'), style: 'cancel' },
            { text: t('common.skip'), onPress: handleSkip }
          ]
        );
      }
      return;
    }

    // If not empty but invalid, show error
    const value = parseFloat(trimmedValue);
    if (isNaN(value) || value <= 0) {
      if (Platform.OS === 'web') {
        const confirmed = confirm(t('habits.invalidTargetMessage'));
        if (confirmed) {
          handleSkip();
        }
      } else {
        Alert.alert(
          t('habits.invalidTargetTitle'),
          t('habits.invalidTargetMessage'),
          [
            { text: t('common.edit'), style: 'cancel' },
            { text: t('common.skip'), onPress: handleSkip }
          ]
        );
      }
      return;
    }

    try {
      await createNewHabit(habitName, undefined, { value, period: selectedPeriod });
      navigateToEdit();
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        alert('Failed to create goal');
      } else {
        Alert.alert(t('common.error'), 'Failed to create goal');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('habits.newHabit'),
          headerTitleAlign: 'center',
        }}
      />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
            {t('habits.target')}
          </Text>
          <Text style={[styles.inputHint, { color: theme.colors.text }]}>
            {t('habits.targetHint')}
          </Text>

          <View style={styles.targetInputRow}>
            <TextInput
              style={[
                styles.valueInput,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={[styles.perText, { color: theme.colors.text }]}>
              {t('habits.per')}
            </Text>
          </View>

          <View style={styles.periodSelector}>
            {PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor: selectedPeriod === period ? theme.colors.primary : theme.colors.card,
                    borderColor: selectedPeriod === period ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: selectedPeriod === period ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {t(`habits.period.${period}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: theme.colors.border }]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.text }]}>{t('common.skip')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 14,
    marginBottom: 20,
  },
  targetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  valueInput: {
    height: 50,
    width: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  perText: {
    fontSize: 16,
    marginLeft: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
