import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';

export default function NameScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [habitName, setHabitName] = useState('');

  const handleNext = () => {
    if (!habitName.trim()) {
      if (Platform.OS === 'web') {
        alert(t('habits.habitName') + ' is required');
      } else {
        Alert.alert(t('common.error'), t('habits.habitName') + ' is required');
      }
      return;
    }

    router.push({
      pathname: '/(tabs)/(home)/target',
      params: { name: habitName.trim() }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('habits.newHabit'),
          headerTitleAlign: 'center',
        }}
      />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
            {t('habits.habitName')}
          </Text>
          <Text style={[styles.inputHint, { color: theme.colors.text }]}>
            {t('habits.habitNamePlaceholder')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={habitName}
            onChangeText={setHabitName}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
