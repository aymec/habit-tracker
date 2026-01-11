import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';

export default function HomeScreen() {
  const { activeHabit, activeHabitPresets, logEntry, habits } = useHabit();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();

  // If no habits exist, show a welcome message
  if (habits.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="clipboard-outline" size={80} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {t('habits.noHabits')}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/edit')}
          >
            <Text style={styles.createButtonText}>{t('habits.newHabit')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If habits exist but none selected (shouldn't happen due to context logic, but safe to handle)
  if (!activeHabit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
              onPress={() => router.push({ pathname: '/edit', params: { mode: 'edit' } })}
              style={styles.iconButton}
          >
              <Ionicons name="create-outline" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => router.push('/history')}
              style={styles.iconButton}
          >
              <Ionicons name="time-outline" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Habit Title */}
        <Text style={[styles.habitTitle, { color: theme.colors.text }]}>
          {activeHabit.name}
        </Text>

        {/* Counter Display */}
        <View style={styles.counterContainer}>
          <Text style={[styles.counterValue, { color: theme.colors.primary }]}>
            {activeHabit.totalCount}
          </Text>
          <Text style={[styles.counterLabel, { color: theme.colors.textSecondary }]}>
            {t('history.totalCount')}
          </Text>
        </View>

        {/* Preset Buttons */}
        <View style={styles.presetsContainer}>
          {activeHabitPresets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => logEntry(activeHabit.id, preset.value)}
            >
              <Text style={[styles.presetLabel, { color: theme.colors.text }]}>
                {preset.label}
              </Text>
              <Text style={[styles.presetValue, { color: theme.colors.textSecondary }]}>
                {preset.value > 0 ? `+${preset.value}` : preset.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  menuButton: {
    padding: 8,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
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
    marginBottom: 30,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  counterValue: {
    fontSize: 80,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  counterLabel: {
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 5,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 15,
    paddingHorizontal: 20,
  },
  presetButton: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  presetLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  presetValue: {
    fontSize: 12,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
