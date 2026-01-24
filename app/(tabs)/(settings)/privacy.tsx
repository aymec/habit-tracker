import { useCallback } from 'react';
import { Linking, Platform, StyleSheet, View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ISSUES_URL = 'https://github.com/aymec/habit-tracker/issues';

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Update document title on focus for web (Head component doesn't update on tab switch)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = `${t('settings.privacyPolicy')} | OnTrack`;
      }
    }, [t])
  );

  const handleOpenIssues = () => {
    if (Platform.OS === 'web') {
      window.open(ISSUES_URL, '_blank');
    } else {
      Linking.openURL(ISSUES_URL);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {Platform.OS === 'web' && (
        <Head>
          <title>{t('settings.privacyPolicy')} | OnTrack</title>
        </Head>
      )}
      <Stack.Screen options={{ title: t('settings.privacyPolicy'), headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>
          {t('privacy.lastUpdated')}
        </Text>

        <Text style={[styles.intro, { color: theme.colors.text }]}>
          {t('privacy.intro')}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('privacy.section1Title')}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          {t('privacy.section1Intro')}
        </Text>
        <Text style={[styles.bullet, { color: theme.colors.text }]}>
          • {t('privacy.section1Bullet1')}
        </Text>
        <Text style={[styles.bullet, { color: theme.colors.text }]}>
          • {t('privacy.section1Bullet2')}
        </Text>
        <Text style={[styles.bullet, { color: theme.colors.text }]}>
          • {t('privacy.section1Bullet3')}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('privacy.section2Title')}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          {t('privacy.section2Text')}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('privacy.section3Title')}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          {t('privacy.section3Text')}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('privacy.section4Title')}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          {t('privacy.section4Text')}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('privacy.section5Title')}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          {t('privacy.section5Text')}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('privacy.section6Title')}
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          {t('privacy.section6TextBefore')}
          <Text
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={handleOpenIssues}
          >
            {t('privacy.section6Link')}
          </Text>
          {t('privacy.section6TextAfter')}
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
