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

  const now = new Date();

  // Generate dynamic Drink Water entries for the last 7 days
  const drinkWaterOptions = [
    { label: 'Glass S', value: 0.15 },
    { label: 'Glass L', value: 0.25 },
    { label: 'Bottle', value: 0.5 },
  ];
  const drinkWaterHabitId = '1768195720601';
  const drinkWaterEntries: Entry[] = [];
  let drinkWaterTotal = 0;

  for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    day.setHours(0, 0, 0, 0);

    // 3-7 entries per day
    const entriesPerDay = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < entriesPerDay; i++) {
      const option = drinkWaterOptions[Math.floor(Math.random() * drinkWaterOptions.length)];
      const timestamp = new Date(day);
      timestamp.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

      drinkWaterEntries.push({
        habitId: drinkWaterHabitId,
        id: `dw-${daysAgo}-${i}-${Date.now()}`,
        label: option.label,
        timestamp: timestamp.toISOString(),
        value: option.value,
      });
      drinkWaterTotal += option.value;
    }
  }

  const habitsData: Habit[] = [
    { createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), id: '1768198262233', name: 'Fruits & Vegetables 😋', totalCount: 42, target: { value: 5, period: 'day' } },
    { createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), id: drinkWaterHabitId, name: 'Drink Water 💦', totalCount: Math.round(drinkWaterTotal * 100) / 100, target: { value: 2, period: 'day' } },
    { createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), id: '1768196003754', name: 'Reading 📚', totalCount: 3, target: { value: 50, period: 'year' } },
  ];

  const optionsData: Option[] = JSON.parse('[{"habitId": "1768195720601", "id": "1768195720829", "label": "Glass S", "value": 0.15}, {"habitId": "1768195720601", "id": "1768195744249", "label": "Glass L", "value": 0.25}, {"habitId": "1768195720601", "id": "1768195751749", "label": "Bottle", "value": 0.5}, {"habitId": "1768196003754", "id": "1768196003922", "label": "One book", "value": 1}, {"habitId": "1768198262233", "id": "1768198262453", "label": "🍏", "value": 1}, {"habitId": "1768198262233", "id": "1768198359819", "label": "🍌", "value": 1}, {"habitId": "1768198262233", "id": "1768198366820", "label": "🥑", "value": 1}, {"habitId": "1768198262233", "id": "1768198374136", "label": "🍅", "value": 1}, {"habitId": "1768198262233", "id": "1768198382019", "label": "🥝", "value": 1}]');

  // Static entries for Reading and Fruits & Vegetables (with dynamic dates)
  const staticEntries: Entry[] = [];

  // Reading entries - spread over last 30 days
  const readingDates = [3, 15, 25];
  readingDates.forEach((daysAgo, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    staticEntries.push({
      habitId: '1768196003754',
      id: `reading-${i}-${Date.now()}`,
      label: 'One book',
      timestamp: date.toISOString(),
      value: 1,
    });
  });

  // Fruits & Vegetables entries - spread over last 7 days
  const fruitEmojis = ['🍏', '🍌', '🥑', '🍅', '🥝'];
  for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    // 5-7 fruits per day
    const fruitsPerDay = Math.floor(Math.random() * 3) + 5;
    for (let i = 0; i < fruitsPerDay; i++) {
      const emoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
      const timestamp = new Date(day);
      timestamp.setHours(7 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));
      staticEntries.push({
        habitId: '1768198262233',
        id: `fruit-${daysAgo}-${i}-${Date.now()}`,
        label: emoji,
        timestamp: timestamp.toISOString(),
        value: 1,
      });
    }
  }

  // Calculate actual fruit total
  const fruitTotal = staticEntries.filter(e => e.habitId === '1768198262233').length;
  habitsData[0].totalCount = fruitTotal;

  const allEntries = [...drinkWaterEntries, ...staticEntries];

  await saveHabits(habitsData);
  await saveOptions(optionsData);
  await saveEntries(allEntries);

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

