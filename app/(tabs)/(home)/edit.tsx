import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '../../../src/context/ThemeContext';
import { useHabit } from '../../../src/context/HabitContext';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Ionicons } from '@expo/vector-icons';
import { LiftedPressable } from '../../../components/ui/lifted-pressable';
import { Option, TargetPeriod, HabitTarget } from '../../../src/models/types';
import { formatNumber, formatNumberWithSign } from '../../../src/utils/format';

const liquidGlass = isLiquidGlassAvailable();

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

export default function ModalScreen() {
  const { theme } = useTheme();
  const { updateHabitDetails, activeHabit, activeHabitOptions, addHabitOption, updateHabitOption, removeOption, removeHabit, habits, selectHabit } = useHabit();
  const { t } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  // Redirect to home if no habits exist (data was cleared) - only when screen is focused
  useEffect(() => {
    if (isFocused && habits.length === 0) {
      router.dismissAll();
    }
  }, [habits, router, isFocused]);

  // Update document title on focus for web (Head component doesn't update on tab switch)
  const pageTitle = activeHabit?.name ? `${t('common.edit')} ${activeHabit.name}` : t('habits.editHabit');
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = `${pageTitle} | OnTrack`;
      }
    }, [pageTitle])
  );

  const [isEditingHabitName, setIsEditingHabitName] = useState(false);
  const [editedHabitName, setEditedHabitName] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editedTargetValue, setEditedTargetValue] = useState('');
  const [editedTargetPeriod, setEditedTargetPeriod] = useState<TargetPeriod | null>('day');
  const [editedTargetUnit, setEditedTargetUnit] = useState<string | null>(null);
  const [editedTargetUnitShort, setEditedTargetUnitShort] = useState<string | null>(null);
  const [selectedUnitKey, setSelectedUnitKey] = useState<string | null>(null);
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const customUnitNameRef = useRef<TextInput>(null);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [optionLabel, setOptionLabel] = useState('');
  const [optionValue, setOptionValue] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);

  const PERIODS: TargetPeriod[] = ['day', 'week', 'month', 'year'];

  const startEditHabitName = () => {
    if (activeHabit) {
      setEditedHabitName(activeHabit.name);
      setIsEditingHabitName(true);
    }
  };

  const cancelEditHabitName = () => {
    setIsEditingHabitName(false);
    setEditedHabitName('');
  };

  const saveHabitName = async () => {
    if (!editedHabitName.trim()) {
      if (Platform.OS === 'web') {
        alert(t('habits.habitName') + ' is required');
      } else {
        Alert.alert('Error', t('habits.habitName') + ' is required');
      }
      return;
    }

    try {
      if (activeHabit) {
        await updateHabitDetails({
          ...activeHabit,
          name: editedHabitName.trim()
        });
      }
      setIsEditingHabitName(false);
      setEditedHabitName('');
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        alert('Failed to save habit name');
      } else {
        Alert.alert('Error', 'Failed to save habit name');
      }
    }
  };

  const startEditTarget = () => {
    if (activeHabit) {
      setEditedTargetValue(activeHabit.target?.value?.toString() || '');
      setEditedTargetPeriod(activeHabit.target?.period || null);
      setEditedTargetUnit(activeHabit.target?.unit || null);
      setEditedTargetUnitShort(activeHabit.target?.unitShort || null);

      // Detect if current unit matches a predefined one
      const matchingUnit = activeHabit.target?.unitShort
        ? UNIT_DEFS.find(u => t(`units.${u.key}.short`) === activeHabit.target!.unitShort)
        : null;
      if (matchingUnit) {
        setSelectedUnitKey(matchingUnit.key);
        setIsCustomUnit(false);
      } else if (activeHabit.target?.unit) {
        setSelectedUnitKey(null);
        setIsCustomUnit(true);
      } else {
        setSelectedUnitKey(null);
        setIsCustomUnit(false);
      }

      setShowUnitPicker(false);
      setShowPeriodPicker(false);
      setIsEditingTarget(true);
    }
  };

  const cancelEditTarget = () => {
    setIsEditingTarget(false);
    setEditedTargetValue('');
    setEditedTargetPeriod(null);
    setEditedTargetUnit(null);
    setEditedTargetUnitShort(null);
    setSelectedUnitKey(null);
    setIsCustomUnit(false);
    setShowUnitPicker(false);
    setShowPeriodPicker(false);
  };

  const handleEditUnitPress = (unitKey: string) => {
    setIsCustomUnit(false);
    if (selectedUnitKey === unitKey) {
      setSelectedUnitKey(null);
      setEditedTargetUnit(null);
      setEditedTargetUnitShort(null);
    } else {
      setSelectedUnitKey(unitKey);
      setEditedTargetUnit(t(`units.${unitKey}.name`));
      setEditedTargetUnitShort(t(`units.${unitKey}.short`));
    }
    setShowUnitPicker(false);
  };

  const handleUnitNone = () => {
    setSelectedUnitKey(null);
    setIsCustomUnit(false);
    setEditedTargetUnit(null);
    setEditedTargetUnitShort(null);
    setShowUnitPicker(false);
  };

  const handleEditCustomPress = () => {
    setSelectedUnitKey(null);
    setIsCustomUnit(true);
    setEditedTargetUnit(null);
    setEditedTargetUnitShort(null);
    setShowUnitPicker(false);
    setTimeout(() => customUnitNameRef.current?.focus(), 50);
  };

  const saveTarget = async () => {
    try {
      if (activeHabit) {
        let newTarget: HabitTarget | undefined = undefined;
        const value = parseFloat(editedTargetValue);
        if (!isNaN(value) && value > 0 && editedTargetPeriod) {
          newTarget = { value, period: editedTargetPeriod };
          if (editedTargetUnit) {
            newTarget.unit = editedTargetUnit;
            newTarget.unitShort = editedTargetUnitShort || editedTargetUnit;
          }
        }
        await updateHabitDetails({
          ...activeHabit,
          target: newTarget
        });
      }
      cancelEditTarget();
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        alert('Failed to save target');
      } else {
        Alert.alert('Error', 'Failed to save target');
      }
    }
  };

  const clearAllTarget = () => {
    const performClear = async () => {
      try {
        if (activeHabit) {
          await updateHabitDetails({
            ...activeHabit,
            target: undefined
          });
        }
        cancelEditTarget();
      } catch (error) {
        console.error(error);
        if (Platform.OS === 'web') {
          alert('Failed to clear target');
        } else {
          Alert.alert('Error', 'Failed to clear target');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = confirm(t('habits.clearTargetConfirm'));
      if (confirmed) {
        performClear();
      }
    } else {
      Alert.alert(
        t('common.clear'),
        t('habits.clearTargetConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.clear'), style: 'destructive', onPress: performClear }
        ]
      );
    }
  };

  const formatTarget = (target?: HabitTarget): string => {
    if (!target) return t('habits.noTarget');
    return t('habits.targetDisplay', {
      value: formatNumber(target.value),
      unit: target.unitShort ? target.unitShort : '',
      period: t(`habits.period.${target.period}`)
    });
  };

  const startEditOption = (option: Option) => {
    setEditingOptionId(option.id);
    setOptionLabel(option.label);
    setOptionValue(option.value.toString());
    setIsAddingOption(false);
  };

  const startAddOption = () => {
    setEditingOptionId(null);
    setOptionLabel('');
    setOptionValue('');
    setIsAddingOption(true);
  };

  const cancelOptionEdit = () => {
    setEditingOptionId(null);
    setIsAddingOption(false);
    setOptionLabel('');
    setOptionValue('');
  };

  const saveOption = async () => {
    if (!optionLabel.trim()) {
      if (Platform.OS === 'web') {
        alert('Label is required');
      } else {
        Alert.alert('Error', 'Label is required');
      }
      return;
    }
    const val = parseFloat(optionValue);
    if (isNaN(val) || val === 0) {
      if (Platform.OS === 'web') {
        alert('Value must be a valid non-zero number');
      } else {
        Alert.alert('Error', 'Value must be a valid non-zero number');
      }
      return;
    }

    try {
      if (isAddingOption && activeHabit) {
        await addHabitOption(activeHabit.id, optionLabel.trim(), val);
      } else if (editingOptionId) {
        // Find existing option to get other fields like habitId
        const existing = activeHabitOptions.find(p => p.id === editingOptionId);
        if (existing) {
          await updateHabitOption({
            ...existing,
            label: optionLabel.trim(),
            value: val
          });
        }
      }
      cancelOptionEdit();
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        alert('Failed to save option');
      } else {
        Alert.alert('Error', 'Failed to save option');
      }
    }
  };

  const deleteOption = (optionId: string) => {
    if (activeHabitOptions.length <= 1) {
      if (Platform.OS === 'web') {
        alert('You must have at least one option');
      } else {
        Alert.alert('Error', 'You must have at least one option');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = confirm('Delete this option?');
      if (confirmed) {
        removeOption(optionId);
      }
    } else {
      Alert.alert(
        t('common.delete'),
        'Delete this option?',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => removeOption(optionId)
          }
        ]
      );
    }
  };

  const handleDeleteHabit = () => {
    if (!activeHabit) return;

    const performDelete = async () => {
      try {
        const habitId = activeHabit.id;
        await removeHabit(habitId);

        // Navigate to first available habit or home
        const remainingHabits = habits.filter(h => h.id !== habitId);
        if (remainingHabits.length > 0) {
          selectHabit(remainingHabits[0].id);
        }

        // Go back to home
        router.replace('/(tabs)/(home)');
      } catch (error) {
        console.error(error);
        if (Platform.OS === 'web') {
          alert('Failed to delete habit');
        } else {
          Alert.alert('Error', 'Failed to delete habit');
        }
      }
    };

    // Use native confirm on web, Alert.alert on native platforms
    if (Platform.OS === 'web') {
      const confirmed = confirm(
        t('habits.deleteHabitWebMessage', { name: activeHabit.name })
      );
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        t('common.delete'),
        t('habits.deleteHabitFullMessage', { name: activeHabit.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: performDelete
          }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {Platform.OS === 'web' && (
        <Head>
          <title>{pageTitle} | OnTrack</title>
        </Head>
      )}
      {/* Use Stack.Screen to configure the header */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: pageTitle,
          headerTitleAlign: 'center',
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: liquidGlass ? Math.max(25, insets.bottom + 60) : 25 }}
      >
        {/* Goal Section */}
        <View style={[styles.section, { marginBottom: 10 }]}>
          <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
            {t('habits.goal')}
          </Text>
            {isEditingHabitName ? (
              <View style={[styles.editOptionContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      marginBottom: 10,
                    },
                  ]}
                  value={editedHabitName}
                  onChangeText={setEditedHabitName}
                  placeholder={t('habits.habitNamePlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={cancelEditHabitName} style={[styles.miniButton, { borderWidth: 1, borderColor: theme.colors.border }]}>
                    <Text style={{ color: theme.colors.text }}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveHabitName} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: '#FFFFFF' }}>{t('common.save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.habitNameRow, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.habitNameText, { color: theme.colors.text }]}>
                  {activeHabit?.name}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t('habits.a11y.editName')}
                  onPress={startEditHabitName}
                  style={styles.actionIcon}
                >
                  <Ionicons name="create-outline" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            )}

            {/* Target Row */}
            {isEditingTarget ? (
              <View style={[styles.editOptionContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 10 }]}>
                {/* Inline target row */}
                <View style={styles.targetInlineRow}>
                  <TextInput
                    style={[
                      styles.targetValueInput,
                      {
                        backgroundColor: theme.colors.card,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={editedTargetValue}
                    onChangeText={setEditedTargetValue}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textSecondary}
                    accessibilityLabel={t('habits.a11y.targetValue')}
                  />
                  <TouchableOpacity
                    style={[
                      styles.dropdownTrigger,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: showUnitPicker ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => { setShowUnitPicker(!showUnitPicker); setShowPeriodPicker(false); }}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('habits.a11y.targetUnit')}, ${editedTargetUnitShort || t('habits.noTarget')}`}
                  >
                    <Text style={[styles.dropdownText, { color: editedTargetUnitShort ? theme.colors.text : theme.colors.textSecondary }]}>
                      {editedTargetUnitShort || '—'}
                    </Text>
                    <Ionicons name={showUnitPicker ? 'chevron-up' : 'chevron-down'} size={14} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={[styles.perInlineText, { color: theme.colors.text }]}>
                    {t('habits.per')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownTrigger,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: showPeriodPicker ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => { setShowPeriodPicker(!showPeriodPicker); setShowUnitPicker(false); }}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('habits.a11y.targetPeriod')}, ${
                      editedTargetPeriod ? t(`habits.period.${editedTargetPeriod}`) : t('habits.noTarget')
                    }`}
                  >
                    <Text style={[styles.dropdownText, { color: editedTargetPeriod ? theme.colors.text : theme.colors.textSecondary }]}>
                      {editedTargetPeriod ? t(`habits.period.${editedTargetPeriod}`) : '—'}
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
                            onPress={() => handleEditUnitPress(unitDef.key)}
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
                      onPress={handleEditCustomPress}
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
                    ref={customUnitNameRef}
                    style={[
                      styles.customUnitInput,
                      {
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={editedTargetUnitShort || ''}
                    onChangeText={(text) => {
                      setEditedTargetUnitShort(text || null);
                      setEditedTargetUnit(text || null);
                    }}
                    placeholder={t('units.unitPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                )}

                {/* Period dropdown */}
                {showPeriodPicker && (
                <View style={[styles.dropdownList, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, !editedTargetPeriod && { backgroundColor: theme.colors.primary + '18' }]}
                    onPress={() => { setEditedTargetPeriod(null); setShowPeriodPicker(false); }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.colors.text, fontStyle: 'italic' }]}>
                      {t('common.none')}
                    </Text>
                    {!editedTargetPeriod && (
                      <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                  {PERIODS.map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[styles.dropdownItem, editedTargetPeriod === period && { backgroundColor: theme.colors.primary + '18' }]}
                      onPress={() => { setEditedTargetPeriod(period); setShowPeriodPicker(false); }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.colors.text }]}>
                        {capitalize(t(`habits.period.${period}`))}
                      </Text>
                      {editedTargetPeriod === period && (
                        <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                )}

                <View style={styles.editActions}>
                  <TouchableOpacity onPress={clearAllTarget} style={[styles.miniButton, { backgroundColor: theme.colors.danger }]}>
                    <Text style={{ color: '#FFFFFF' }}>{t('common.clear')}</Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity onPress={cancelEditTarget} style={[styles.miniButton, { borderWidth: 1, borderColor: theme.colors.border }]}>
                    <Text style={{ color: theme.colors.text }}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveTarget} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: '#FFFFFF' }}>{t('common.save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.targetRow, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.targetText, { color: theme.colors.text }]}>
                  {t('habits.target')}: {formatTarget(activeHabit?.target)}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t('habits.a11y.editTarget')}
                  onPress={startEditTarget}
                  style={styles.actionIcon}
                >
                  <Ionicons name="create-outline" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            )}
          </View>

        <View style={styles.optionsSection}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              {t('habits.options')}
            </Text>

            {/* Add New Option Area */}
            {isAddingOption ? (
              <View style={[styles.editOptionContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginBottom: 10 }]}>
                <View style={styles.inputRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t('habits.optionLabelPlaceholder')}</Text>
                    <TextInput
                      style={[styles.miniInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                      value={optionLabel}
                      onChangeText={setOptionLabel}
                      autoFocus
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t('habits.optionValue')}</Text>
                    <TextInput
                      style={[styles.miniInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                      value={optionValue}
                      onChangeText={setOptionValue}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={cancelOptionEdit} style={[styles.miniButton, { borderWidth: 1, borderColor: theme.colors.border }]}>
                    <Text style={{ color: theme.colors.text }}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveOption} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: '#FFFFFF' }}>{t('common.add')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <LiftedPressable
                style={[styles.addOptionButton, { borderColor: theme.colors.border, marginBottom: 15, backgroundColor: 'transparent' }]}
                onPress={startAddOption}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{t('habits.addOption')}</Text>
              </LiftedPressable>
            )}

            {/* Options List */}
            {activeHabitOptions.map((option) => {
              if (editingOptionId === option.id) {
                return (
                  <View key={option.id} style={[styles.editOptionContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={[styles.miniInput, { flex: 2, color: theme.colors.text, borderColor: theme.colors.border }]}
                        value={optionLabel}
                        onChangeText={setOptionLabel}
                        placeholder="Label"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                      <TextInput
                        style={[styles.miniInput, { flex: 1, color: theme.colors.text, borderColor: theme.colors.border }]}
                        value={optionValue}
                        onChangeText={setOptionValue}
                        placeholder="Val"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={cancelOptionEdit} style={[styles.miniButton, { borderWidth: 1, borderColor: theme.colors.border }]}>
                        <Text style={{ color: theme.colors.text }}>{t('common.cancel')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={saveOption} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                        <Text style={{ color: '#FFFFFF' }}>{t('common.save')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              return (
                <View key={option.id} style={[styles.optionRow, { borderBottomColor: theme.colors.border }]}>
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionLabel, { color: theme.colors.text }]}>{option.label}</Text>
                    <Text style={[styles.optionValue, { color: theme.colors.textSecondary }]}>
                      ({formatNumberWithSign(option.value)})
                    </Text>
                  </View>
                  <View style={styles.optionActions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t('habits.a11y.editOption')}
                      onPress={() => startEditOption(option)}
                      style={styles.actionIcon}
                    >
                      <Ionicons name="create-outline" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t('habits.a11y.deleteOption')}
                      onPress={() => deleteOption(option.id)}
                      style={styles.actionIcon}
                    >
                      <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

        {/* Save Button */}
        {activeHabit && (
          <View style={styles.saveSection}>
            <LiftedPressable
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </LiftedPressable>
          </View>
        )}

        {/* Delete Habit Section */}
        {activeHabit && (
          <View style={styles.deleteSection}>
            <LiftedPressable
              style={[styles.deleteHabitButton, { backgroundColor: theme.colors.danger }]}
              onPress={handleDeleteHabit}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.deleteHabitButtonText}>{t('habits.deleteHabit')}</Text>
            </LiftedPressable>
          </View>
        )}
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
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
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  habitNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  habitNameText: {
    fontSize: 16,
    fontWeight: '500',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  targetText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  targetInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  targetValueInput: {
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
  optionsSection: {
    marginTop: 10,
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionValue: {
    fontSize: 14,
  },
  optionActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionIcon: {
    padding: 4,
  },
  editOptionContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  miniInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  miniButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 15,
    borderStyle: 'dashed',
    gap: 5,
  },
  saveSection: {
    marginTop: 30,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteSection: {
    marginTop: 12,
    paddingBottom: 40,
  },
  deleteHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  deleteHabitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
