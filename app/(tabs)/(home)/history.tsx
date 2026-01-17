import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Entry } from '../../../src/models/types';

export default function EntryHistoryScreen() {
  const { activeHabitEntries, removeEntry, activeHabit, habits } = useHabit();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isFocused = useIsFocused();

  // Redirect to home if no habits exist (data was cleared) - only when screen is focused
  useEffect(() => {
    if (isFocused && habits.length === 0) {
      router.replace('/(tabs)/(home)');
    }
  }, [habits, router, isFocused]);

  const handleDeleteEntry = (entry: Entry) => {
    Alert.alert(
      t('common.delete'),
      t('history.deleteEntryConfirmation'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => removeEntry(entry.id),
        },
      ]
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: activeHabit?.name ? `${activeHabit.name} ${t('history.title')}` : t('history.title'), headerTitleAlign: 'center' }} />

      <FlatList
        data={activeHabitEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.entryItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.entryInfo}>
              <Text style={[styles.entryLabel, { color: theme.colors.text }]}>
                {item.label} ({item.value > 0 ? `+${item.value}` : item.value})
              </Text>
              <Text style={[styles.entryDate, { color: theme.colors.text }]}>
                {formatDate(item.timestamp)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteEntry(item)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('history.noEntries')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  entryInfo: {
    flex: 1,
  },
  entryLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
