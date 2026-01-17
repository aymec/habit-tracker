import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, ActionSheetIOS, Alert } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useHabit } from '../../src/context/HabitContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { populateTestData, clearAllData } from '../../src/services/storage';

export default function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { loadHabits } = useHabit();
  const router = useRouter();

  const [androidModalVisible, setAndroidModalVisible] = useState(false);

  const languages = [
    // Latin alphabet (Alphabetical order)
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pt', label: 'Português' },

    // Non-Latin alphabets (At the end)
    { code: 'ru', label: 'Русский' }, // Cyrillic
    { code: 'ja', label: '日本語' }, // Japanese
    { code: 'zh-CN', label: '简体中文' }, // Simplified Chinese
    { code: 'zh-TW', label: '繁體中文' }, // Traditional Chinese
    { code: 'hi', label: 'हिन्दी' }, // Hindi
  ];

  const handleLanguagePress = () => {
    if (Platform.OS === 'ios') {
      const options = [...languages.map(l => l.label), t('common.cancel')];
      const cancelButtonIndex = options.length - 1;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: t('settings.language'),
        },
        (buttonIndex) => {
          if (buttonIndex !== cancelButtonIndex) {
            changeLanguage(languages[buttonIndex].code);
          }
        }
      );
    } else {
      setAndroidModalVisible(true);
    }
  };

  const handlePopulateData = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${t('data.confirmSetDemoDataTitle')}\n\n${t('data.confirmSetDemoDataMessage')}`
      );
      if (confirmed) {
        try {
          await populateTestData();
          await loadHabits();
        } catch (error) {
          window.alert(`${t('common.error')}: ${t('data.failedToSetDemoData')}`);
          console.error(error);
        }
      }
    } else {
      Alert.alert(
        t('data.confirmSetDemoDataTitle'),
        t('data.confirmSetDemoDataMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.set'),
            style: 'default',
            onPress: async () => {
              try {
                await populateTestData();
                await loadHabits();
              } catch (error) {
                Alert.alert(t('common.error'), t('data.failedToSetDemoData'));
                console.error(error);
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleClearData = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${t('data.confirmClearAllDataTitle')}\n\n${t('data.confirmClearAllDataMessage')}`
      );
      if (confirmed) {
        try {
          await clearAllData();
          await loadHabits();
        } catch (error) {
          window.alert(`${t('common.error')}: ${t('data.failedToClearData')}`);
          console.error(error);
        }
      }
    } else {
      Alert.alert(
        t('data.confirmClearAllDataTitle'),
        t('data.confirmClearAllDataMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.clearAll'),
            style: 'destructive',
            onPress: async () => {
              try {
                await clearAllData();
                await loadHabits();
              } catch (error) {
                Alert.alert(t('common.error'), t('data.failedToClearData'));
                console.error(error);
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setAndroidModalVisible(false);
  };

  const renderThemeOption = (optionMode: 'light' | 'dark' | 'system', label: string, border: boolean) => {
    const isSelected = mode === optionMode;
    return (
      <TouchableOpacity
        style={[
          styles.optionRow,
          border ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border } : {}
        ]}
        onPress={() => setMode(optionMode)}
      >
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          {label}
        </Text>
        <View style={styles.iconContainer}>
          {isSelected && (
            <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('settings.appearance')}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            {renderThemeOption('light', t('settings.light'), true)}
            {renderThemeOption('dark', t('settings.dark'), true)}
            {renderThemeOption('system', t('settings.system'), false)}
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('settings.language')}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={handleLanguagePress}
            >
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                {languages.find(l => l.code === i18n.language)?.label || 'English'}
              </Text>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={Platform.OS === 'ios' ? "chevron-down" : "caret-down"}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('data.data')}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={[styles.optionRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
              onPress={handlePopulateData}
            >
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                {t('data.setDemoData')}
              </Text>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="rocket"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={handleClearData}
            >
              <Text style={[styles.optionText, { color: theme.colors.danger }]}>
                {t('data.clearAllData')}
              </Text>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.danger}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('settings.about')}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.optionRow}>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                {t('settings.version')}
              </Text>
              <Text style={[styles.versionText, { color: theme.colors.text }]}>
                {Constants.expoConfig?.version || '1.0'}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Android/Web Selection Modal */}
      {(Platform.OS === 'android' || Platform.OS === 'web') && androidModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setAndroidModalVisible(false)}
          />
          <View style={[styles.androidModalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.androidModalTitle, { color: theme.colors.text }]}>
              {t('settings.language')}
            </Text>
            <ScrollView style={styles.androidLanguageList}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.androidOptionRow}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <Text style={[styles.optionText, { color: theme.colors.text }]}>
                    {lang.label}
                  </Text>
                  <View style={styles.androidRadioContainer}>
                    <View style={[
                      styles.androidRadioOuter,
                      { borderColor: i18n.language === lang.code ? theme.colors.primary : theme.colors.textSecondary }
                    ]}>
                      {i18n.language === lang.code && (
                        <View style={[styles.androidRadioInner, { backgroundColor: theme.colors.primary }]} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.androidCancelButton}
              onPress={() => setAndroidModalVisible(false)}
            >
              <Text style={[styles.androidCancelText, { color: theme.colors.primary }]}>
                {t('common.cancel').toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 10,
    fontWeight: '600',
  },
  sectionContent: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontSize: 16,
  },
  // Android Modal Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  androidModalContent: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 4,
    paddingVertical: 20,
    paddingHorizontal: 24,
    elevation: 24,
  },
  androidModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  androidLanguageList: {
    flexShrink: 1,
  },
  androidOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  androidRadioContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  androidCancelButton: {
    alignSelf: 'flex-end',
    marginTop: 20,
    padding: 8,
  },
  androidCancelText: {
    fontWeight: 'bold',
    fontSize: 14,
  }
});
