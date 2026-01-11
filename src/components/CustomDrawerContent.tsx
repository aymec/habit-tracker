import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabit } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { habits, activeHabit, selectHabit } = useHabit();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.drawerHeader, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.drawerTitle, { color: theme.colors.text }]}>
          {t('habits.title')}
        </Text>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.habitList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.habitItem,
              {
                backgroundColor: activeHabit?.id === item.id ? theme.colors.primary : 'transparent',
                borderRadius: theme.borderRadius.m
              }
            ]}
            onPress={() => {
              selectHabit(item.id);
              props.navigation.closeDrawer();
            }}
          >
            <Text
              style={[
                styles.habitName,
                { color: activeHabit?.id === item.id ? '#FFFFFF' : theme.colors.text }
              ]}
            >
              {item.name}
            </Text>
            <View style={[styles.countBadge, { backgroundColor: activeHabit?.id === item.id ? 'rgba(255,255,255,0.2)' : theme.colors.card }]}>
              <Text style={[styles.countText, { color: activeHabit?.id === item.id ? '#FFFFFF' : theme.colors.text }]}>
                {item.totalCount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('habits.noHabits')}
            </Text>
          </View>
        }
      />

      <View style={[styles.drawerFooter, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/edit');
          }}
        >
          <Text style={styles.addButtonText}>{t('habits.newHabit')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  habitList: {
    padding: 10,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
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

export default CustomDrawerContent;
