import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FC, ReactNode } from 'react';
import { Habit, Option, Entry } from '../models/types';
import * as Storage from '../services/storage';

interface HabitContextType {
  habits: Habit[];
  activeHabit: Habit | null;
  activeHabitOptions: Option[];
  activeHabitEntries: Entry[];
  isLoading: boolean;

  // Actions
  loadHabits: () => Promise<void>;
  selectHabit: (habitId: string) => void;
  createNewHabit: (name: string, icon?: string) => Promise<void>;
  updateHabitDetails: (habit: Habit) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;

  // Option Actions
  addHabitOption: (habitId: string, label: string, value: number) => Promise<void>;
  updateHabitOption: (option: Option) => Promise<void>;
  removeOption: (optionId: string) => Promise<void>;

  // Entry Actions
  logEntry: (habitId: string, label: string, value: number) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null);
  const [activeHabitOptions, setActiveHabitOptions] = useState<Option[]>([]);
  const [activeHabitEntries, setActiveHabitEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeHabit = habits.find(h => h.id === activeHabitId) || null;

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedHabits = await Storage.getHabits();
      setHabits(loadedHabits);

      if (loadedHabits.length === 0) {
        setActiveHabitId(null);
      } else if (loadedHabits.length > 0) {
        // Select first habit if no active habit, or if current active habit no longer exists
        const activeHabitExists = loadedHabits.some(h => h.id === activeHabitId);
        if (!activeHabitId || !activeHabitExists) {
          setActiveHabitId(loadedHabits[0].id);
        }
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
        setActiveHabitOptions([]);
        setActiveHabitEntries([]);
        return;
      }

      try {
        const [options, entries] = await Promise.all([
          Storage.getOptionsForHabit(activeHabitId),
          Storage.getEntriesForHabit(activeHabitId)
        ]);

        // If no options exist for this habit (new habit), create default +1 option
        if (options.length === 0) {
          const defaultOption: Option = {
            id: Date.now().toString(),
            habitId: activeHabitId,
            label: 'One Unit',
            value: 1
          };
          await Storage.addOption(defaultOption);
          setActiveHabitOptions([defaultOption]);
        } else {
          setActiveHabitOptions(options);
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

  const addHabitOption = async (habitId: string, label: string, value: number) => {
    const newOption: Option = {
      id: Date.now().toString(),
      habitId,
      label,
      value
    };

    await Storage.addOption(newOption);
    if (activeHabitId === habitId) {
      const options = await Storage.getOptionsForHabit(habitId);
      setActiveHabitOptions(options);
    }
  };

  const updateHabitOption = async (option: Option) => {
    const allOptions = await Storage.getOptions();
    const newOptions = allOptions.map(p => p.id === option.id ? option : p);
    await Storage.saveOptions(newOptions);

    if (activeHabitId === option.habitId) {
      const options = await Storage.getOptionsForHabit(option.habitId);
      setActiveHabitOptions(options);
    }
  };

  const removeOption = async (optionId: string) => {
    await Storage.deleteOption(optionId);
    if (activeHabitId) {
      const options = await Storage.getOptionsForHabit(activeHabitId);
      setActiveHabitOptions(options);
    }
  };

  const logEntry = async (habitId: string, label: string, value: number) => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      habitId,
      label,
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
        activeHabitOptions,
        activeHabitEntries,
        isLoading,
        loadHabits,
        selectHabit,
        createNewHabit,
        updateHabitDetails,
        removeHabit,
        addHabitOption,
        updateHabitOption,
        removeOption,
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
