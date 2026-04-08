import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../src/context/ThemeContext';
import { useHabit } from '../../../src/context/HabitContext';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { TargetPeriod, HabitTarget } from '../../../src/models/types';

const PERIODS: TargetPeriod[] = ['day', 'week', 'month', 'year'];

interface UnitDef {
  key: string;
  category: 'volume' | 'weight' | 'distance' | 'time' | 'other';
}

const UNIT_DEFS: UnitDef[] = [
  { key: 'liters', category: 'volume' },
  { key: 'milliliters', category: 'volume' },
  { key: 'cups', category: 'volume' },
  { key: 'fluidOunces', category: 'volume' },
  { key: 'gallons', category: 'volume' },
  { key: 'kilograms', category: 'weight' },
  { key: 'grams', category: 'weight' },
  { key: 'pounds', category: 'weight' },
  { key: 'ounces', category: 'weight' },
  { key: 'kilometers', category: 'distance' },
  { key: 'miles', category: 'distance' },
  { key: 'meters', category: 'distance' },
  { key: 'minutes', category: 'time' },
  { key: 'hours', category: 'time' },
  { key: 'calories', category: 'other' },
  { key: 'steps', category: 'other' },
  { key: 'pages', category: 'other' },
  { key: 'reps', category: 'other' },
];

const CATEGORIES = ['volume', 'weight', 'distance', 'time', 'other'] as const;

export default function TargetScreen() {
  const { theme } = useTheme();
  const { createNewHabit } = useHabit();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const habitName = params.name as string;

  const [targetValue, setTargetValue] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<TargetPeriod>('day');
  const [selectedUnitKey, setSelectedUnitKey] = useState<string | null>(null);
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitName, setCustomUnitName] = useState('');
  const [customUnitShort, setCustomUnitShort] = useState('');

  // Update document title on focus for web (Head component doesn't update on tab switch)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = `${t('habits.setTarget')} | OnTrack`;
      }
    }, [t])
  );

  const handleUnitPress = (unitKey: string) => {
    setIsCustomUnit(false);
    if (selectedUnitKey === unitKey) {
      setSelectedUnitKey(null);
    } else {
      setSelectedUnitKey(unitKey);
    }
  };

  const handleCustomPress = () => {
    setSelectedUnitKey(null);
    setIsCustomUnit(!isCustomUnit);
  };

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
      const target: HabitTarget = { value, period: selectedPeriod };
      if (isCustomUnit && customUnitName.trim()) {
        target.unit = customUnitName.trim();
        target.unitShort = customUnitShort.trim() || customUnitName.trim();
      } else if (selectedUnitKey) {
        target.unit = t(`units.${selectedUnitKey}.name`);
        target.unitShort = t(`units.${selectedUnitKey}.short`);
      }
      await createNewHabit(habitName, undefined, target);
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
      {Platform.OS === 'web' && (
        <Head>
          <title>{t('habits.setTarget')} | OnTrack</title>
        </Head>
      )}
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

          {/* Unit Picker */}
          <View style={styles.unitSection}>
            <Text style={[styles.unitSectionLabel, { color: theme.colors.textSecondary }]}>
              {t('units.optional')}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
              <View style={styles.unitPillsRow}>
                {CATEGORIES.map((category) => {
                  const categoryUnits = UNIT_DEFS.filter(u => u.category === category);
                  return (
                    <View key={category} style={styles.unitCategoryGroup}>
                      <Text style={[styles.unitCategoryLabel, { color: theme.colors.textSecondary }]}>
                        {t(`units.categories.${category}`)}
                      </Text>
                      <View style={styles.unitCategoryPills}>
                        {categoryUnits.map((unitDef) => (
                          <TouchableOpacity
                            key={unitDef.key}
                            style={[
                              styles.unitPill,
                              {
                                backgroundColor: selectedUnitKey === unitDef.key ? theme.colors.primary : theme.colors.card,
                                borderColor: selectedUnitKey === unitDef.key ? theme.colors.primary : theme.colors.border,
                              },
                            ]}
                            onPress={() => handleUnitPress(unitDef.key)}
                          >
                            <Text
                              style={[
                                styles.unitPillText,
                                { color: selectedUnitKey === unitDef.key ? '#FFFFFF' : theme.colors.text },
                              ]}
                            >
                              {t(`units.${unitDef.key}.short`)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                })}
                {/* Custom pill */}
                <View style={styles.unitCategoryGroup}>
                  <Text style={[styles.unitCategoryLabel, { color: theme.colors.textSecondary }]}>{' '}</Text>
                  <View style={styles.unitCategoryPills}>
                    <TouchableOpacity
                      style={[
                        styles.unitPill,
                        {
                          backgroundColor: isCustomUnit ? theme.colors.primary : theme.colors.card,
                          borderColor: isCustomUnit ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                      onPress={handleCustomPress}
                    >
                      <Text
                        style={[
                          styles.unitPillText,
                          { color: isCustomUnit ? '#FFFFFF' : theme.colors.text },
                        ]}
                      >
                        {t('units.custom')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>

            {isCustomUnit && (
              <View style={styles.customUnitInputs}>
                <TextInput
                  style={[
                    styles.customUnitInput,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      flex: 2,
                    },
                  ]}
                  value={customUnitName}
                  onChangeText={setCustomUnitName}
                  placeholder={t('units.customName')}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TextInput
                  style={[
                    styles.customUnitInput,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      flex: 1,
                    },
                  ]}
                  value={customUnitShort}
                  onChangeText={setCustomUnitShort}
                  placeholder={t('units.customShort')}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            )}
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
    textAlign: 'right',
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
  unitSection: {
    marginTop: 20,
  },
  unitSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  unitScroll: {
    marginBottom: 10,
  },
  unitPillsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  unitCategoryGroup: {
    gap: 6,
  },
  unitCategoryLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unitCategoryPills: {
    flexDirection: 'row',
    gap: 6,
  },
  unitPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  unitPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customUnitInputs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  customUnitInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});
