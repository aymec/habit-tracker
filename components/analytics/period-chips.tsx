import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PeriodId } from '../../src/utils/analytics';
import { useTheme } from '../../src/context/ThemeContext';

export interface PeriodChipItem {
  id: PeriodId;
  label: string;
  accessibilityLabel?: string;
}

interface PeriodChipsProps {
  items: PeriodChipItem[];
  activeId: PeriodId;
  onSelect: (id: PeriodId) => void;
}

export function PeriodChips({ items, activeId, onSelect }: PeriodChipsProps) {
  const { isDark, theme } = useTheme();
  const inactiveBg = isDark ? 'rgba(118,118,128,0.24)' : 'rgba(120,120,128,0.16)';
  const inactiveText = isDark ? '#FFFFFF' : '#000000';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((it) => {
        const active = it.id === activeId;
        return (
          <Pressable
            key={it.id}
            accessibilityRole="button"
            accessibilityLabel={it.accessibilityLabel}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(it.id)}
            style={[
              styles.chip,
              { backgroundColor: active ? theme.colors.primary : inactiveBg },
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: active ? '#FFFFFF' : inactiveText },
                active && styles.textActive,
              ]}
              numberOfLines={1}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ width: 2 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.08,
  },
  textActive: {
    fontWeight: '600',
  },
});
