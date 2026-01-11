import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import { Habit, Preset, Entry } from '../models/types';
import * as Storage from '../services/storage';

interface HabitContextType {
  habits: Habit[];
  activeHabit: Habit | null;
  activeHabitPresets: Preset[];
  activeHabitEntries: Entry[];
  isLoading: boolean;

  // Actions
  loadHabits: () => Promise<void>;
  selectHabit: (habitId: string) => void;
  createNewHabit: (name: string, icon?: string) => Promise<void>;
  updateHabitDetails: (habit: Habit) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;

  // Preset Actions
  addHabitPreset: (habitId: string, label: string, value: number) => Promise<void>;
  updateHabitPreset: (preset: Preset) => Promise<void>;
  removePreset: (presetId: string) => Promise<void>;

  // Entry Actions
  logEntry: (habitId: string, value: number) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null);
  const [activeHabitPresets, setActiveHabitPresets] = useState<Preset[]>([]);
  const [activeHabitEntries, setActiveHabitEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeHabit = habits.find(h => h.id === activeHabitId) || null;

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedHabits = await Storage.getHabits();
      setHabits(loadedHabits);

      // If no active habit but we have habits, select the first one
      if (!activeHabitId && loadedHabits.length > 0) {
        setActiveHabitId(loadedHabits[0].id);
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeHabitId]);

  // Load related data when active habit changes
  useEffect(() => {
    const loadHabitData = async () => {
      if (!activeHabitId) {
        setActiveHabitPresets([]);
        setActiveHabitEntries([]);
        return;
      }

      try {
        const [presets, entries] = await Promise.all([
          Storage.getPresetsForHabit(activeHabitId),
          Storage.getEntriesForHabit(activeHabitId)
        ]);

        // If no presets exist for this habit (new habit), create default +1 preset
        if (presets.length === 0) {
          const defaultPreset: Preset = {
            id: Date.now().toString(),
            habitId: activeHabitId,
            label: '+1',
            value: 1
          };
          await Storage.addPreset(defaultPreset);
          setActiveHabitPresets([defaultPreset]);
        } else {
          setActiveHabitPresets(presets);
        }

        setActiveHabitEntries(entries);
      } catch (error) {
        console.error('Failed to load habit data:', error);
      }
    };

    loadHabitData();
  }, [activeHabitId]);

  // Initial load
  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const selectHabit = (habitId: string) => {
    setActiveHabitId(habitId);
  };

  const createNewHabit = async (name: string, icon?: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      icon,
      totalCount: 0,
      createdAt: new Date().toISOString()
    };

    await Storage.addHabit(newHabit);
    await loadHabits();
    selectHabit(newHabit.id);
  };

  const updateHabitDetails = async (habit: Habit) => {
    await Storage.updateHabit(habit);
    await loadHabits();
  };

  const removeHabit = async (habitId: string) => {
    await Storage.deleteHabit(habitId);
    if (activeHabitId === habitId) {
      setActiveHabitId(null);
    }
    await loadHabits();
  };

  const addHabitPreset = async (habitId: string, label: string, value: number) => {
    const newPreset: Preset = {
      id: Date.now().toString(),
      habitId,
      label,
      value
    };

    await Storage.addPreset(newPreset);
    if (activeHabitId === habitId) {
      const presets = await Storage.getPresetsForHabit(habitId);
      setActiveHabitPresets(presets);
    }
  };

  const updateHabitPreset = async (preset: Preset) => {
    const allPresets = await Storage.getPresets();
    const newPresets = allPresets.map(p => p.id === preset.id ? preset : p);
    await Storage.savePresets(newPresets);

    if (activeHabitId === preset.habitId) {
      const presets = await Storage.getPresetsForHabit(preset.habitId);
      setActiveHabitPresets(presets);
    }
  };

  const removePreset = async (presetId: string) => {
    await Storage.deletePreset(presetId);
    if (activeHabitId) {
      const presets = await Storage.getPresetsForHabit(activeHabitId);
      setActiveHabitPresets(presets);
    }
  };

  const logEntry = async (habitId: string, value: number) => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      habitId,
      value,
      timestamp: new Date().toISOString()
    };

    await Storage.addEntry(newEntry);

    // Update habit total count
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      const updatedHabit = { ...habit, totalCount: habit.totalCount + value };
      await Storage.updateHabit(updatedHabit);

      // Update local state immediately for responsiveness
      setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
      if (activeHabitId === habitId) {
        setActiveHabitEntries(prev => [newEntry, ...prev]);
      }
    }
  };

  const removeEntry = async (entryId: string) => {
    const entry = activeHabitEntries.find(e => e.id === entryId);
    if (!entry) return;

    await Storage.deleteEntry(entryId);

    // Update habit total count
    if (activeHabit) {
      const updatedHabit = { ...activeHabit, totalCount: activeHabit.totalCount - entry.value };
      await Storage.updateHabit(updatedHabit);

      // Update local state
      setHabits(prev => prev.map(h => h.id === activeHabit.id ? updatedHabit : h));
      setActiveHabitEntries(prev => prev.filter(e => e.id !== entryId));
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        activeHabit,
        activeHabitPresets,
        activeHabitEntries,
        isLoading,
        loadHabits,
        selectHabit,
        createNewHabit,
        updateHabitDetails,
        removeHabit,
        addHabitPreset,
        updateHabitPreset,
        removePreset,
        logEntry,
        removeEntry,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabit must be used within a HabitProvider');
  }
  return context;
};
