import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useHabit } from '../src/context/HabitContext';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Preset } from '../src/models/types';

export default function ModalScreen() {
  const { theme } = useTheme();
  const { createNewHabit, updateHabitDetails, activeHabit, activeHabitPresets, addHabitPreset, updateHabitPreset, removePreset, removeHabit, habits, selectHabit } = useHabit();
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const isEditing = params.mode === 'edit';

  const [habitName, setHabitName] = useState('');
  const [isEditingHabitName, setIsEditingHabitName] = useState(false);
  const [editedHabitName, setEditedHabitName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetLabel, setPresetLabel] = useState('');
  const [presetValue, setPresetValue] = useState('');
  const [isAddingPreset, setIsAddingPreset] = useState(false);

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

  const startEditPreset = (preset: Preset) => {
    setEditingPresetId(preset.id);
    setPresetLabel(preset.label);
    setPresetValue(preset.value.toString());
    setIsAddingPreset(false);
  };

  const startAddPreset = () => {
    setEditingPresetId(null);
    setPresetLabel('');
    setPresetValue('');
    setIsAddingPreset(true);
  };

  const cancelPresetEdit = () => {
    setEditingPresetId(null);
    setIsAddingPreset(false);
    setPresetLabel('');
    setPresetValue('');
  };

  const savePreset = async () => {
    if (!presetLabel.trim()) {
      if (Platform.OS === 'web') {
        alert('Label is required');
      } else {
        Alert.alert('Error', 'Label is required');
      }
      return;
    }
    const val = parseFloat(presetValue);
    if (isNaN(val) || val === 0) {
      if (Platform.OS === 'web') {
        alert('Value must be a valid non-zero number');
      } else {
        Alert.alert('Error', 'Value must be a valid non-zero number');
      }
      return;
    }

    try {
      if (isAddingPreset && activeHabit) {
        await addHabitPreset(activeHabit.id, presetLabel.trim(), val);
      } else if (editingPresetId) {
        // Find existing preset to get other fields like habitId
        const existing = activeHabitPresets.find(p => p.id === editingPresetId);
        if (existing) {
          await updateHabitPreset({
            ...existing,
            label: presetLabel.trim(),
            value: val
          });
        }
      }
      cancelPresetEdit();
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        alert('Failed to save preset');
      } else {
        Alert.alert('Error', 'Failed to save preset');
      }
    }
  };

  const deletePreset = (presetId: string) => {
    if (activeHabitPresets.length <= 1) {
      if (Platform.OS === 'web') {
        alert('You must have at least one preset');
      } else {
        Alert.alert('Error', 'You must have at least one preset');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = confirm('Delete this preset?');
      if (confirmed) {
        removePreset(presetId);
      }
    } else {
      Alert.alert(
        t('common.delete'),
        'Delete this preset?',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => removePreset(presetId)
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
        `Delete "${activeHabit.name}"?\n\nThis will permanently delete all presets and entries.`
      );
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        t('common.delete'),
        `Delete "${activeHabit.name}"? This will permanently delete all presets and entries.`,
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
              placeholder="e.g., Drink Water"
              placeholderTextColor={theme.colors.textSecondary}
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
              <View style={[styles.editPresetContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
                  placeholder="e.g., Drink Water"
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
          <View style={[styles.presetsSection, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
              Presets
            </Text>

            {/* Presets List */}
            {activeHabitPresets.map((preset) => {
              if (editingPresetId === preset.id) {
                return (
                  <View key={preset.id} style={[styles.editPresetContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={[styles.miniInput, { flex: 2, color: theme.colors.text, borderColor: theme.colors.border }]}
                        value={presetLabel}
                        onChangeText={setPresetLabel}
                        placeholder="Label"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                      <TextInput
                        style={[styles.miniInput, { flex: 1, color: theme.colors.text, borderColor: theme.colors.border }]}
                        value={presetValue}
                        onChangeText={setPresetValue}
                        placeholder="Val"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={cancelPresetEdit} style={styles.miniButton}>
                        <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={savePreset} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                        <Text style={{ color: '#FFFFFF' }}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              return (
                <View key={preset.id} style={[styles.presetRow, { borderBottomColor: theme.colors.border }]}>
                  <View style={styles.presetInfo}>
                    <Text style={[styles.presetLabel, { color: theme.colors.text }]}>{preset.label}</Text>
                    <Text style={[styles.presetValue, { color: theme.colors.textSecondary }]}>
                      ({preset.value > 0 ? `+${preset.value}` : preset.value})
                    </Text>
                  </View>
                  <View style={styles.presetActions}>
                    <TouchableOpacity onPress={() => startEditPreset(preset)} style={styles.actionIcon}>
                      <Ionicons name="create-outline" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deletePreset(preset.id)} style={styles.actionIcon}>
                      <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Add New Preset Area */}
            {isAddingPreset ? (
              <View style={[styles.editPresetContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 10 }]}>
                <Text style={{ color: theme.colors.text, marginBottom: 5, fontWeight: '600' }}>New Preset</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.miniInput, { flex: 2, color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={presetLabel}
                    onChangeText={setPresetLabel}
                    placeholder="Label (e.g. +1)"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoFocus
                  />
                  <TextInput
                    style={[styles.miniInput, { flex: 1, color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={presetValue}
                    onChangeText={setPresetValue}
                    placeholder="Value"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={cancelPresetEdit} style={styles.miniButton}>
                    <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={savePreset} style={[styles.miniButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: '#FFFFFF' }}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addPresetButton, { borderColor: theme.colors.border }]}
                onPress={startAddPreset}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Add Preset</Text>
              </TouchableOpacity>
            )}
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
              <Text style={styles.deleteHabitButtonText}>Delete Habit</Text>
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
  presetsSection: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  presetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  presetValue: {
    fontSize: 14,
  },
  presetActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionIcon: {
    padding: 4,
  },
  editPresetContainer: {
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
  addPresetButton: {
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
