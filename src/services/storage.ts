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

const removeStorageItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } else {
    await AsyncStorage.removeItem(key);
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

export const populateTestData = async (): Promise<void> => {
  console.log('Populating test data...');

  const existingHabits = await getHabits();
  if (existingHabits.length > 0) {
    console.log('Existing data found, clearing before populating.');
    await clearAllData();
  }


  const startDate = new Date('2025-12-15T00:00:00.000Z');
  const endDate = new Date('2026-01-10T23:59:59.999Z');

  const getRandomDateInRange = () => {
    const startMillis = startDate.getTime();
    const endMillis = endDate.getTime();
    const randomMillis = startMillis + Math.random() * (endMillis - startMillis);
    return new Date(randomMillis).toISOString();
  };

  const habitsData: Habit[] = JSON.parse('[{"createdAt": "2026-01-12T05:28:40.601Z", "id": "1768195720601", "name": "Drink Water 💦", "totalCount": 105}, {"createdAt": "2026-01-12T05:33:23.754Z", "id": "1768196003754", "name": "Reading 📚", "totalCount": 43}, {"createdAt": "2026-01-12T06:11:02.233Z", "id": "1768198262233", "name": "Fruits & Vegetables 😋", "totalCount": 42}]');

  const optionsData: Option[] = JSON.parse('[{"habitId": "1768195720601", "id": "1768195720829", "label": "Glass S", "value": 15}, {"habitId": "1768195720601", "id": "1768195744249", "label": "Glass L", "value": 25}, {"habitId": "1768195720601", "id": "1768195751749", "label": "Bottle", "value": 50}, {"habitId": "1768196003754", "id": "1768196003922", "label": "1 page", "value": 1}, {"habitId": "1768196003754", "id": "1768196037339", "label": "10 pages", "value": 10}, {"habitId": "1768198262233", "id": "1768198262453", "label": "🍏", "value": 1}, {"habitId": "1768198262233", "id": "1768198359819", "label": "🍌", "value": 1}, {"habitId": "1768198262233", "id": "1768198366820", "label": "🥑", "value": 1}, {"habitId": "1768198262233", "id": "1768198374136", "label": "🍅", "value": 1}, {"habitId": "1768198262233", "id": "1768198382019", "label": "🥝", "value": 1}]');

  const entriesData: Entry[] = JSON.parse('[{"habitId": "1768195720601", "id": "1768195834951", "timestamp": "2026-01-12T05:30:34.951Z", "value": 15}, {"habitId": "1768195720601", "id": "1768195836399", "timestamp": "2026-01-12T05:30:36.399Z", "value": 15}, {"habitId": "1768195720601", "id": "1768195838966", "timestamp": "2026-01-12T05:30:38.966Z", "value": 50}, {"habitId": "1768195720601", "id": "1768195841699", "timestamp": "2026-01-12T05:30:41.699Z", "value": 25}, {"habitId": "1768196003754", "id": "1768196363298", "timestamp": "2026-01-12T05:39:23.298Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196365564", "timestamp": "2026-01-12T05:39:25.564Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196365748", "timestamp": "2026-01-12T05:39:25.748Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196365915", "timestamp": "2026-01-12T05:39:25.915Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196366398", "timestamp": "2026-01-12T05:39:26.398Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196368616", "timestamp": "2026-01-12T05:39:28.616Z", "value": 10}, {"habitId": "1768196003754", "id": "1768196368916", "timestamp": "2026-01-12T05:39:28.916Z", "value": 10}, {"habitId": "1768196003754", "id": "1768196369381", "timestamp": "2026-01-12T05:39:29.381Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196370865", "timestamp": "2026-01-12T05:39:30.865Z", "value": 10}, {"habitId": "1768196003754", "id": "1768196371231", "timestamp": "2026-01-12T05:39:31.231Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196371381", "timestamp": "2026-01-12T05:39:31.381Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196371514", "timestamp": "2026-01-12T05:39:31.514Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196376302", "timestamp": "2026-01-12T05:39:36.302Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196376465", "timestamp": "2026-01-12T05:39:36.465Z", "value": 1}, {"habitId": "1768196003754", "id": "1768196376605", "timestamp": "2026-01-12T05:39:36.605Z", "value": 1}]');

  // Randomize createdAt for habits
  const habits = habitsData.map(habit => ({
    ...habit,
    createdAt: getRandomDateInRange(),
  }));

  // Randomize timestamp for entries
  const entries = entriesData.map(entry => ({
    ...entry,
    timestamp: getRandomDateInRange(),
  }));

  const options = optionsData; // Options don't have dates to randomize

  await saveHabits(habits);
  await saveOptions(options);
  await saveEntries(entries);

  console.log('Test data populated.');
};

export const clearAllData = async (): Promise<void> => {
  console.log('Clearing all data...');
  await removeStorageItem(STORAGE_KEYS.HABITS);
  await removeStorageItem(STORAGE_KEYS.OPTIONS);
  await removeStorageItem(STORAGE_KEYS.ENTRIES);
  console.log('All data cleared.');
};

export const viewAllData = async (): Promise<void> => {
  console.log('--- Current Storage Data ---');
  console.log('Habits:', await getHabits());
  console.log('Options:', await getOptions());
  console.log('Entries:', await getEntries());
  console.log('----------------------------');
};

