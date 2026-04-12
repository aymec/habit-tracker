import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../src/context/ThemeContext';
import { useHabit } from '../../../src/context/HabitContext';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Ionicons } from '@expo/vector-icons';
import { TargetPeriod, HabitTarget } from '../../../src/models/types';

const PERIODS: TargetPeriod[] = ['day', 'week', 'month', 'year'];

interface UnitDef {
  key: string;
  category: 'volume' | 'weight' | 'distance' | 'time' | 'other';
}

const UNIT_DEFS: UnitDef[] = [
  { key: 'milliliters', category: 'volume' },
  { key: 'fluidOunces', category: 'volume' },
  { key: 'cups', category: 'volume' },
  { key: 'liters', category: 'volume' },
  { key: 'gallons', category: 'volume' },
  { key: 'grams', category: 'weight' },
  { key: 'ounces', category: 'weight' },
  { key: 'pounds', category: 'weight' },
  { key: 'kilograms', category: 'weight' },
  { key: 'meters', category: 'distance' },
  { key: 'kilometers', category: 'distance' },
  { key: 'miles', category: 'distance' },
  { key: 'minutes', category: 'time' },
  { key: 'hours', category: 'time' },
  { key: 'days', category: 'time' },
  { key: 'weeks', category: 'time' },
  { key: 'months', category: 'time' },
  { key: 'calories', category: 'other' },
  { key: 'steps', category: 'other' },
  { key: 'pages', category: 'other' },
  { key: 'reps', category: 'other' },
];

const CATEGORIES = ['volume', 'weight', 'distance', 'time', 'other'] as const;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function TargetScreen() {
  const { theme } = useTheme();
  const { createNewHabit } = useHabit();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const habitName = params.name as string;

  const [targetValue, setTargetValue] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<TargetPeriod | null>(null);
  const [selectedUnitKey, setSelectedUnitKey] = useState<string | null>(null);
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitShort, setCustomUnitShort] = useState('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

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
    setShowUnitPicker(false);
  };

  const handleUnitNone = () => {
    setSelectedUnitKey(null);
    setIsCustomUnit(false);
    setShowUnitPicker(false);
  };

  const handleCustomPress = () => {
    setSelectedUnitKey(null);
    setIsCustomUnit(true);
    setCustomUnitShort('');
    setShowUnitPicker(false);
  };

  const navigateToEdit = () => {
    // Replace target with goal (name was already replaced by target),
    // so the stack becomes: Home → Goal → Edit
    router.replace('/(tabs)/(home)/goal');
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

    // If value is present but no period, show skip confirmation
    if (!selectedPeriod) {
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

    try {
      const target: HabitTarget = { value, period: selectedPeriod };
      if (isCustomUnit && customUnitShort.trim()) {
        target.unit = customUnitShort.trim();
        target.unitShort = customUnitShort.trim();
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

          {/* Inline target row */}
          <View style={styles.targetInlineRow}>
            <TextInput
              style={[styles.valueInput, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TouchableOpacity
              style={[styles.dropdownTrigger, { backgroundColor: theme.colors.card, borderColor: showUnitPicker ? theme.colors.primary : theme.colors.border }]}
              onPress={() => { setShowUnitPicker(!showUnitPicker); setShowPeriodPicker(false); }}
            >
              <Text style={[styles.dropdownText, { color: selectedUnitKey || isCustomUnit ? theme.colors.text : theme.colors.textSecondary }]}>
                {selectedUnitKey ? t(`units.${selectedUnitKey}.short`) : isCustomUnit ? (customUnitShort || '—') : '—'}
              </Text>
              <Ionicons name={showUnitPicker ? 'chevron-up' : 'chevron-down'} size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.perInlineText, { color: theme.colors.text }]}>
              {t('habits.per')}
            </Text>
            <TouchableOpacity
              style={[styles.dropdownTrigger, { backgroundColor: theme.colors.card, borderColor: showPeriodPicker ? theme.colors.primary : theme.colors.border }]}
              onPress={() => { setShowPeriodPicker(!showPeriodPicker); setShowUnitPicker(false); }}
            >
              <Text style={[styles.dropdownText, { color: selectedPeriod ? theme.colors.text : theme.colors.textSecondary }]}>
                {selectedPeriod ? t(`habits.period.${selectedPeriod}`) : '—'}
              </Text>
              <Ionicons name={showPeriodPicker ? 'chevron-up' : 'chevron-down'} size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Unit dropdown */}
          {showUnitPicker && (
          <View style={[styles.dropdownList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              <TouchableOpacity
                style={[styles.dropdownItem, !selectedUnitKey && !isCustomUnit && { backgroundColor: theme.colors.primary + '18' }]}
                onPress={handleUnitNone}
              >
                <Text style={[styles.dropdownItemText, { color: theme.colors.text, fontStyle: 'italic' }]}>
                  {t('common.none')}
                </Text>
                {!selectedUnitKey && !isCustomUnit && (
                  <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
              {CATEGORIES.flatMap((category) => {
                const categoryUnits = UNIT_DEFS.filter(u => u.category === category);
                return [
                  <View key={`cat-${category}`} style={[styles.dropdownCategoryHeader, { borderTopColor: theme.colors.border }]}>
                    <Text style={[styles.dropdownCategoryText, { color: theme.colors.textSecondary }]}>
                      {t(`units.categories.${category}`)}
                    </Text>
                  </View>,
                  ...categoryUnits.map((unitDef) => (
                    <TouchableOpacity
                      key={unitDef.key}
                      style={[styles.dropdownItem, selectedUnitKey === unitDef.key && { backgroundColor: theme.colors.primary + '18' }]}
                      onPress={() => handleUnitPress(unitDef.key)}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>
                        {capitalize(t(`units.${unitDef.key}.name`))} ({t(`units.${unitDef.key}.short`)})
                      </Text>
                      {selectedUnitKey === unitDef.key && (
                        <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))
                ];
              })}
              <TouchableOpacity
                style={[styles.dropdownItem, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border }, isCustomUnit && { backgroundColor: theme.colors.primary + '18' }]}
                onPress={handleCustomPress}
              >
                <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>
                  {t('units.custom')}...
                </Text>
                {isCustomUnit && (
                  <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
          )}

          {/* Custom unit input */}
          {isCustomUnit && !showUnitPicker && (
            <TextInput
              style={[styles.customUnitInput, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={customUnitShort}
              onChangeText={setCustomUnitShort}
              placeholder={t('units.unitPlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
          )}

          {/* Period dropdown */}
          {showPeriodPicker && (
          <View style={[styles.dropdownList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.dropdownItem, !selectedPeriod && { backgroundColor: theme.colors.primary + '18' }]}
              onPress={() => { setSelectedPeriod(null); setShowPeriodPicker(false); }}
            >
              <Text style={[styles.dropdownItemText, { color: theme.colors.text, fontStyle: 'italic' }]}>
                {t('common.none')}
              </Text>
              {!selectedPeriod && (
                <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            {PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.dropdownItem, selectedPeriod === period && { backgroundColor: theme.colors.primary + '18' }]}
                onPress={() => { setSelectedPeriod(period); setShowPeriodPicker(false); }}
              >
                <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>
                  {capitalize(t(`habits.period.${period}`))}
                </Text>
                {selectedPeriod === period && (
                  <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          )}
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
  targetInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  valueInput: {
    height: 40,
    width: 80,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  perInlineText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  dropdownCategoryHeader: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dropdownCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customUnitInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    marginBottom: 10,
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
