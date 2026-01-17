import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { habits, selectHabit } = useHabit();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoalPress = (goalId: string) => {
    selectHabit(goalId);
    router.push('/(tabs)/(home)/goal');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {habits.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="clipboard-outline" size={80} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {t('habits.noHabits')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.goalList}
          style={{ backgroundColor: theme.colors.background }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.goalItem,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.m
                }
              ]}
              onPress={() => handleGoalPress(item.id)}
            >
              <Text style={[styles.goalName, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Fixed Add Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(tabs)/(home)/name')}
        >
          <Text style={styles.addButtonText}>{t('habits.newHabit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  goalList: {
    padding: 15,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    padding: 15,
    paddingBottom: 25,
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
