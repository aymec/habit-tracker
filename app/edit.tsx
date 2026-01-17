import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useHabit } from '../src/context/HabitContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Option } from '../src/models/types';

export default function ModalScreen() {
  const { theme } = useTheme();
  const { createNewHabit, updateHabitDetails, activeHabit, activeHabitOptions, addHabitOption, updateHabitOption, removeOption, removeHabit, habits, selectHabit } = useHabit();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = params.mode === 'edit';

  const [habitName, setHabitName] = useState('');
  const [isEditingHabitName, setIsEditingHabitName] = useState(false);
  const [editedHabitName, setEditedHabitName] = useState('');
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [optionLabel, setOptionLabel] = useState('');
  const [optionValue, setOptionValue] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);

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

  const handleCreateHabit = async () => {
    if (!habitName.trim()) {
      if (Platform.OS === 'web') {
        alert(t('habits.habitName') + ' is required');
      } else {
        Alert.alert('Error', t('habits.habitName') + ' is required');
      }
      return;
    }

    try {
      await createNewHabit(habitName.trim());
      // Navigate to edit mode for the newly created habit
      router.replace({ pathname: '/edit', params: { mode: 'edit' } });
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        alert('Failed to create habit');
      } else {
        Alert.alert('Error', 'Failed to create habit');
      }
    }
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
        router.back();
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
      {/* Use Stack.Screen to configure the header */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditing ? (activeHabit?.name ? `${t('common.edit')} ${activeHabit.name}` : t('habits.editHabit')) : t('habits.newHabit'),
          headerTitleAlign: 'center',
        }}
      />

      <ScrollView style={styles.content}>
        {/* Create New Habit Section */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              {t('habits.habitName')}
            </Text>
            <Text style={[styles.inputHint, { color: theme.colors.text }]}>
              {t('habits.habitNamePlaceholder')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  marginBottom: 20,
                },
              ]}
              value={habitName}
              onChangeText={setHabitName}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.createHabitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreateHabit}
            >
              <Text style={styles.createHabitButtonText}>{t('common.create')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Habit Name Section */}
        {isEditing && (
          <View style={[styles.section, { marginBottom: 10 }]}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              {t('habits.habitName')}
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
                  <TouchableOpacity onPress={cancelEditHabitName} style={styles.miniButton}>
                    <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveHabitName} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: '#FFFFFF' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.habitNameRow, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.habitNameText, { color: theme.colors.text }]}>
                  {activeHabit?.name}
                </Text>
                <TouchableOpacity onPress={startEditHabitName} style={styles.actionIcon}>
                  <Ionicons name="create-outline" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {isEditing && (
          <View style={[styles.optionsSection, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              {t('habits.options')}
            </Text>

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
                      <TouchableOpacity onPress={cancelOptionEdit} style={styles.miniButton}>
                        <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={saveOption} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                        <Text style={{ color: '#FFFFFF' }}>Save</Text>
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
                      ({option.value > 0 ? `+${option.value}` : option.value})
                    </Text>
                  </View>
                  <View style={styles.optionActions}>
                    <TouchableOpacity onPress={() => startEditOption(option)} style={styles.actionIcon}>
                      <Ionicons name="create-outline" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteOption(option.id)} style={styles.actionIcon}>
                      <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Add New Option Area */}
            {isAddingOption ? (
              <View style={[styles.editOptionContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 10 }]}>
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
                  <TouchableOpacity onPress={cancelOptionEdit} style={styles.miniButton}>
                    <Text style={{ color: theme.colors.textSecondary }}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveOption} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: '#FFFFFF' }}>{t('common.add')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addOptionButton, { borderColor: theme.colors.border }]}
                onPress={startAddOption}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{t('habits.addOption')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Save Button */}
        {isEditing && activeHabit && (
          <View style={styles.saveSection}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Habit Section */}
        {isEditing && activeHabit && (
          <View style={[styles.deleteSection, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.deleteHabitButton, { backgroundColor: theme.colors.danger }]}
              onPress={handleDeleteHabit}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.deleteHabitButtonText}>{t('habits.deleteHabit')}</Text>
            </TouchableOpacity>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  createHabitButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createHabitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  habitNameText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsSection: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputHint: {
    fontSize: 14,
    fontWeight: 'normal',
    marginBottom: 8,
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
    marginTop: 20,
    paddingTop: 30,
    borderTopWidth: 2,
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
