import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, Preset, Entry } from '../models/types';

const STORAGE_KEYS = {
  HABITS: 'habits',
  PRESETS: 'presets',
  ENTRIES: 'entries',
};

// Generic storage helper
const saveData = async <T>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    throw error;
  }
};

// Habits operations
export const getHabits = async (): Promise<Habit[]> => {
  const habits = await getData<Habit[]>(STORAGE_KEYS.HABITS);
  return habits || [];
};

export const saveHabits = async (habits: Habit[]): Promise<void> => {
  await saveData(STORAGE_KEYS.HABITS, habits);
};

export const addHabit = async (habit: Habit): Promise<void> => {
  const habits = await getHabits();
  await saveHabits([...habits, habit]);
};

export const updateHabit = async (updatedHabit: Habit): Promise<void> => {
  const habits = await getHabits();
  const newHabits = habits.map(h => h.id === updatedHabit.id ? updatedHabit : h);
  await saveHabits(newHabits);
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  const habits = await getHabits();
  await saveHabits(habits.filter(h => h.id !== habitId));
  // Also clean up related data
  await deletePresetsForHabit(habitId);
  await deleteEntriesForHabit(habitId);
};

// Presets operations
export const getPresets = async (): Promise<Preset[]> => {
  const presets = await getData<Preset[]>(STORAGE_KEYS.PRESETS);
  return presets || [];
};

export const savePresets = async (presets: Preset[]): Promise<void> => {
  await saveData(STORAGE_KEYS.PRESETS, presets);
};

export const getPresetsForHabit = async (habitId: string): Promise<Preset[]> => {
  const presets = await getPresets();
  return presets.filter(p => p.habitId === habitId);
};

export const addPreset = async (preset: Preset): Promise<void> => {
  const presets = await getPresets();
  await savePresets([...presets, preset]);
};

export const deletePreset = async (presetId: string): Promise<void> => {
  const presets = await getPresets();
  await savePresets(presets.filter(p => p.id !== presetId));
};

export const deletePresetsForHabit = async (habitId: string): Promise<void> => {
  const presets = await getPresets();
  await savePresets(presets.filter(p => p.habitId !== habitId));
};

// Entries operations
export const getEntries = async (): Promise<Entry[]> => {
  const entries = await getData<Entry[]>(STORAGE_KEYS.ENTRIES);
  return entries || [];
};

export const saveEntries = async (entries: Entry[]): Promise<void> => {
  await saveData(STORAGE_KEYS.ENTRIES, entries);
};

export const getEntriesForHabit = async (habitId: string): Promise<Entry[]> => {
  const entries = await getEntries();
  return entries.filter(e => e.habitId === habitId).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const addEntry = async (entry: Entry): Promise<void> => {
  const entries = await getEntries();
  await saveEntries([...entries, entry]);
};

export const deleteEntry = async (entryId: string): Promise<void> => {
  const entries = await getEntries();
  await saveEntries(entries.filter(e => e.id !== entryId));
};

export const deleteEntriesForHabit = async (habitId: string): Promise<void> => {
  const entries = await getEntries();
  await saveEntries(entries.filter(e => e.habitId !== habitId));
};
