import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Habit, Option, Entry } from '../models/types';

const STORAGE_KEYS = {
  HABITS: 'habits',
  OPTIONS: 'options',
  ENTRIES: 'entries',
};

// Platform-agnostic storage helpers
const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  }
  return await AsyncStorage.getItem(key);
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

// Generic storage helper
const saveData = async <T>(key: string, data: T): Promise<void> => {
  try {
    await setStorageItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await getStorageItem(key);
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
  await deleteOptionsForHabit(habitId);
  await deleteEntriesForHabit(habitId);
};

// Options operations
export const getOptions = async (): Promise<Option[]> => {
  const options = await getData<Option[]>(STORAGE_KEYS.OPTIONS);
  return options || [];
};

export const saveOptions = async (options: Option[]): Promise<void> => {
  await saveData(STORAGE_KEYS.OPTIONS, options);
};

export const getOptionsForHabit = async (habitId: string): Promise<Option[]> => {
  const options = await getOptions();
  return options.filter(p => p.habitId === habitId);
};

export const addOption = async (option: Option): Promise<void> => {
  const options = await getOptions();
  await saveOptions([...options, option]);
};

export const deleteOption = async (optionId: string): Promise<void> => {
  const options = await getOptions();
  await saveOptions(options.filter(p => p.id !== optionId));
};

export const deleteOptionsForHabit = async (habitId: string): Promise<void> => {
  const options = await getOptions();
  await saveOptions(options.filter(p => p.habitId !== habitId));
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
