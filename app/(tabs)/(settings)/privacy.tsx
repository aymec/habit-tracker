import { Linking, Platform, StyleSheet, View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ISSUES_URL = 'https://github.com/aymec/habit-tracker/issues';

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleOpenIssues = () => {
    if (Platform.OS === 'web') {
      window.open(ISSUES_URL, '_blank');
    } else {
      Linking.openURL(ISSUES_URL);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: t('settings.privacyPolicy'), headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>
          Last Updated: January 12, 2026
        </Text>

        <Text style={[styles.intro, { color: theme.colors.text }]}>
          Your privacy is critically important to us. At OnTrack, we have a simple philosophy: your data belongs to you.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          1. Data Collection and Storage
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          OnTrack - Habit Tracker is designed to function as a local-only application.
        </Text>
        <Text style={[styles.bullet, { color: theme.colors.text }]}>
          • Personal Data: We do not require you to create an account or provide any personal information (such as name, email, or phone number) to use the app.
        </Text>
        <Text style={[styles.bullet, { color: theme.colors.text }]}>
          • Habit Data: All data you input regarding your habits, streaks, and schedules is stored locally on your device.
        </Text>
        <Text style={[styles.bullet, { color: theme.colors.text }]}>
          • No Server Storage: We do not operate any external servers to collect, store, or process your habit data.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          2. Data Sharing
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Since we do not collect your data, we cannot and do not sell, trade, or share your information with any third parties.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          3. Third-Party Services
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          The app is built using React Native and Expo. While the app itself does not collect data, the underlying operating system (iOS/Android) or the app store (Google Play/Apple App Store) may collect basic telemetry or crash reports as governed by their own privacy policies.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          4. Data Retention and Deletion
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Your data stays on your device for as long as the app is installed. If you delete the OnTrack app, all locally stored habit data will be permanently deleted by the operating system. We cannot recover this data for you as we never had access to it.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          5. Changes to This Policy
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          We may update our Privacy Policy from time to time. Any changes will be reflected by updating the &ldquo;Last Updated&rdquo; date at the top of this page.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          6. Contact Us
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          If you have any questions about this Privacy Policy, you can reach out via GitHub by{' '}
          <Text
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={handleOpenIssues}
          >
            opening an issue
          </Text>
          {' '}in the project repository.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
