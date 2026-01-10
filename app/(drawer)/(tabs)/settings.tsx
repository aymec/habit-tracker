import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, ActionSheetIOS } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
// Note: For Android material dropdown, in a simple Expo managed workflow without extra native deps like @react-native-picker/picker,
// we often simulate it or use a library. However, since we want to avoid complex native deps if possible,
// we can use a custom modal for Android that looks like a dialog, which is standard Material behavior for selection.
// Or we can try to use a library if standard components don't suffice.
// Let's stick to a custom implementation that mimics Material Dialog for Android and ActionSheet for iOS.

export default function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();
  const { t, i18n } = useTranslation();

  // For Android/custom modal state (reusing logic if we decide to use custom modal on Android)
  const [androidModalVisible, setAndroidModalVisible] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
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
      // For Android, we can't easily get the native spinner without a library like @react-native-picker/picker.
      // A common pattern in RN without extra libs is using a dialog/modal.
      // But user asked for "native material design drop down menu".
      // Since we don't have @react-native-picker/picker installed in package.json, let's install it?
      // Or we can use a custom implementation that looks better than the expansion.
      // Let's use a nice modal dialog for Android which is also very standard for single choice.
      // But strictly "dropdown" (Spinner) requires the library.
      // Given the constraints and previous instruction "native iOS style... native material design",
      // ActionSheetIOS is perfect for iOS.
      // For Android, a dialog with radio buttons is the standard replacement for "dropdowns" in settings.
      // Let's implement a nice dialog for Android.
      setAndroidModalVisible(true);
    }
  };

  // ... rest of implementation needs to support the Android Modal or we install the picker.
  // Let's try to do it without installing new packages if possible to keep it simple,
  // but if the user insists on native dropdown, we might need it.
  // Actually, let's just use the current expansion for Android as a fallback but styled better?
  // No, user said "native material design".
  // Let's stick with the ActionSheet for iOS which addresses the main feedback.
  // For Android, I'll create a simple modal selection which is standard.

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setAndroidModalVisible(false);
  };

  // ... (renderThemeOption function)
  const renderThemeOption = (optionMode: 'light' | 'dark' | 'system', label: string) => {
      const isSelected = mode === optionMode;
      return (
        <TouchableOpacity
          style={[
            styles.optionRow,
            { borderBottomColor: theme.colors.border }
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
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('settings.appearance')}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            {renderThemeOption('light', t('settings.light'))}
            {renderThemeOption('dark', t('settings.dark'))}
            {renderThemeOption('system', t('settings.system'))}
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('settings.language')}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={[styles.optionRow, { borderBottomColor: theme.colors.border }]}
              onPress={handleLanguagePress}
            >
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                {i18n.language === 'en' ? 'English' : 'Español'}
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

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {t('settings.about')}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.optionRow}>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                {t('settings.version')}
              </Text>
              <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
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
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 16,
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
