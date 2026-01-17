import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useHabit } from '../../../src/context/HabitContext';
import { useTheme } from '../../../src/context/ThemeContext';

export default function GoalScreen() {
  const { activeHabit, activeHabitOptions, logEntry } = useHabit();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // If no habit is selected (shouldn't happen, but safe to handle)
  if (!activeHabit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: activeHabit.name,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerLeft}
            >
              <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(tabs)/(home)/edit', params: { mode: 'edit' } })}
                style={styles.iconButton}
              >
                <Ionicons name="create-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/(home)/history')}
                style={styles.iconButton}
              >
                <Ionicons name="time-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Counter Display */}
        <View style={styles.counterContainer}>
          <Text style={[styles.counterValue, { color: theme.colors.primary }]}>
            {activeHabit.totalCount}
          </Text>
          <Text style={[styles.counterLabel, { color: theme.colors.text }]}>
            {t('history.totalCount')}
          </Text>
        </View>

        {/* Option Buttons */}
        <View style={styles.optionsContainer}>
          {activeHabitOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => logEntry(activeHabit.id, option.label, option.value)}
            >
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                {option.label}
              </Text>
              <Text style={[styles.optionValue, { color: theme.colors.text }]}>
                {option.value > 0 ? `+${option.value}` : option.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLeft: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 15,
    paddingHorizontal: 20,
  },
  optionButton: {
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
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 12,
  },
});
