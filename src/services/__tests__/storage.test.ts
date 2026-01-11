import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  getHabits,
  saveHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  getPresets,
  getPresetsForHabit,
  addPreset,
  deletePreset,
  getEntries,
  getEntriesForHabit,
  addEntry,
  deleteEntry,
} from '../storage';
import { Habit, Preset, Entry } from '../../models/types';

// Mock AsyncStorage - this prevents real storage operations during tests
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Platform to test native behavior (not web)
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('Storage Service', () => {
  // This runs before each test - ensures clean slate
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Habits Operations', () => {
    const mockHabit: Habit = {
      id: '1',
      name: 'Exercise',
      icon: '🏋️',
      totalCount: 0,
      createdAt: '2026-01-11T12:00:00.000Z',
    };

    describe('getHabits', () => {
      it('should return empty array when no habits exist', async () => {
        // Arrange - Set up test data
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        // Act - Execute the function
        const result = await getHabits();

        // Assert - Verify the result
        expect(result).toEqual([]);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('habits');
      });

      it('should return parsed habits array when habits exist', async () => {
        // Arrange
        const habits = [mockHabit];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(habits));

        // Act
        const result = await getHabits();

        // Assert
        expect(result).toEqual(habits);
        expect(result[0].name).toBe('Exercise');
      });

      it('should throw error when storage fails', async () => {
        // Arrange
        const error = new Error('Storage error');
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(error);

        // Act & Assert
        await expect(getHabits()).rejects.toThrow('Storage error');
      });
    });

    describe('saveHabits', () => {
      it('should save habits to storage', async () => {
        // Arrange
        const habits = [mockHabit];
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await saveHabits(habits);

        // Assert
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'habits',
          JSON.stringify(habits)
        );
      });
    });

    describe('addHabit', () => {
      it('should add new habit to existing habits', async () => {
        // Arrange
        const existingHabit: Habit = {
          id: '1',
          name: 'Reading',
          totalCount: 5,
          createdAt: '2026-01-10T12:00:00.000Z',
        };
        const newHabit: Habit = {
          id: '2',
          name: 'Meditation',
          totalCount: 0,
          createdAt: '2026-01-11T12:00:00.000Z',
        };

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([existingHabit])
        );
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await addHabit(newHabit);

        // Assert
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'habits',
          JSON.stringify([existingHabit, newHabit])
        );
      });

      it('should add habit to empty list', async () => {
        // Arrange
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await addHabit(mockHabit);

        // Assert
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'habits',
          JSON.stringify([mockHabit])
        );
      });
    });

    describe('updateHabit', () => {
      it('should update existing habit', async () => {
        // Arrange
        const oldHabit: Habit = {
          id: '1',
          name: 'Exercise',
          totalCount: 5,
          createdAt: '2026-01-10T12:00:00.000Z',
        };
        const updatedHabit: Habit = {
          ...oldHabit,
          name: 'Morning Exercise',
          totalCount: 10,
        };

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([oldHabit])
        );
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await updateHabit(updatedHabit);

        // Assert
        const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
        const parsedData = JSON.parse(savedData);
        expect(parsedData[0].name).toBe('Morning Exercise');
        expect(parsedData[0].totalCount).toBe(10);
      });

      it('should not modify other habits when updating one', async () => {
        // Arrange
        const habit1: Habit = { id: '1', name: 'A', totalCount: 1, createdAt: '2026-01-10' };
        const habit2: Habit = { id: '2', name: 'B', totalCount: 2, createdAt: '2026-01-10' };
        const updatedHabit1: Habit = { ...habit1, name: 'Updated A' };

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
          JSON.stringify([habit1, habit2])
        );
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await updateHabit(updatedHabit1);

        // Assert
        const savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
        expect(savedData).toHaveLength(2);
        expect(savedData[0].name).toBe('Updated A');
        expect(savedData[1].name).toBe('B'); // Unchanged
      });
    });

    describe('deleteHabit', () => {
      it('should delete habit and clean up related data', async () => {
        // Arrange
        const habit1: Habit = { id: '1', name: 'A', totalCount: 1, createdAt: '2026-01-10' };
        const habit2: Habit = { id: '2', name: 'B', totalCount: 2, createdAt: '2026-01-10' };

        const presets: Preset[] = [
          { id: 'p1', habitId: '1', label: 'Low', value: 1 },
          { id: 'p2', habitId: '2', label: 'High', value: 5 },
        ];

        const entries: Entry[] = [
          { id: 'e1', habitId: '1', value: 1, timestamp: '2026-01-10' },
          { id: 'e2', habitId: '2', value: 5, timestamp: '2026-01-10' },
        ];

        // Mock responses for all storage calls
        (AsyncStorage.getItem as jest.Mock)
          .mockResolvedValueOnce(JSON.stringify([habit1, habit2])) // getHabits
          .mockResolvedValueOnce(JSON.stringify(presets)) // getPresets (for delete)
          .mockResolvedValueOnce(JSON.stringify(entries)); // getEntries (for delete)

        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await deleteHabit('1');

        // Assert
        const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;

        // Check habits were saved without deleted habit
        const savedHabits = JSON.parse(setItemCalls[0][1]);
        expect(savedHabits).toEqual([habit2]);

        // Check presets for habit were deleted
        const savedPresets = JSON.parse(setItemCalls[1][1]);
        expect(savedPresets).toEqual([presets[1]]);

        // Check entries for habit were deleted
        const savedEntries = JSON.parse(setItemCalls[2][1]);
        expect(savedEntries).toEqual([entries[1]]);
      });
    });
  });

  describe('Presets Operations', () => {
    const mockPreset: Preset = {
      id: 'p1',
      habitId: 'h1',
      label: 'Low',
      value: 1,
    };

    describe('getPresetsForHabit', () => {
      it('should return only presets for specified habit', async () => {
        // Arrange
        const presets: Preset[] = [
          { id: 'p1', habitId: 'h1', label: 'Low', value: 1 },
          { id: 'p2', habitId: 'h2', label: 'High', value: 5 },
          { id: 'p3', habitId: 'h1', label: 'Medium', value: 3 },
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(presets));

        // Act
        const result = await getPresetsForHabit('h1');

        // Assert
        expect(result).toHaveLength(2);
        expect(result.every(p => p.habitId === 'h1')).toBe(true);
      });

      it('should return empty array if no presets match habit', async () => {
        // Arrange
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

        // Act
        const result = await getPresetsForHabit('nonexistent');

        // Assert
        expect(result).toEqual([]);
      });
    });

    describe('addPreset', () => {
      it('should add preset to storage', async () => {
        // Arrange
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await addPreset(mockPreset);

        // Assert
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'presets',
          JSON.stringify([mockPreset])
        );
      });
    });
  });

  describe('Entries Operations', () => {
    describe('getEntriesForHabit', () => {
      it('should return entries sorted by timestamp descending', async () => {
        // Arrange
        const entries: Entry[] = [
          { id: 'e1', habitId: 'h1', value: 1, timestamp: '2026-01-09T10:00:00Z' },
          { id: 'e2', habitId: 'h1', value: 2, timestamp: '2026-01-11T10:00:00Z' },
          { id: 'e3', habitId: 'h1', value: 3, timestamp: '2026-01-10T10:00:00Z' },
          { id: 'e4', habitId: 'h2', value: 4, timestamp: '2026-01-11T10:00:00Z' },
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(entries));

        // Act
        const result = await getEntriesForHabit('h1');

        // Assert
        expect(result).toHaveLength(3);
        expect(result[0].timestamp).toBe('2026-01-11T10:00:00Z'); // Most recent first
        expect(result[1].timestamp).toBe('2026-01-10T10:00:00Z');
        expect(result[2].timestamp).toBe('2026-01-09T10:00:00Z');
      });
    });

    describe('addEntry', () => {
      it('should add entry to storage', async () => {
        // Arrange
        const entry: Entry = {
          id: 'e1',
          habitId: 'h1',
          value: 5,
          timestamp: '2026-01-11T12:00:00Z',
        };
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await addEntry(entry);

        // Assert
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'entries',
          JSON.stringify([entry])
        );
      });
    });

    describe('deleteEntry', () => {
      it('should remove only specified entry', async () => {
        // Arrange
        const entries: Entry[] = [
          { id: 'e1', habitId: 'h1', value: 1, timestamp: '2026-01-10' },
          { id: 'e2', habitId: 'h1', value: 2, timestamp: '2026-01-11' },
        ];
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(entries));
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

        // Act
        await deleteEntry('e1');

        // Assert
        const savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
        expect(savedData).toHaveLength(1);
        expect(savedData[0].id).toBe('e2');
      });
    });
  });
});
