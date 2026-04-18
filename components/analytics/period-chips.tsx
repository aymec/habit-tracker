import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PeriodId } from '../../src/utils/analytics';

export interface PeriodChipItem {
  id: PeriodId;
  label: string;
}

interface PeriodChipsProps {
  items: PeriodChipItem[];
  activeId: PeriodId;
  onSelect: (id: PeriodId) => void;
}

export function PeriodChips({ items, activeId, onSelect }: PeriodChipsProps) {
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
            onPress={() => onSelect(it.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]} numberOfLines={1}>
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
    backgroundColor: 'rgba(118,118,128,0.24)',
  },
  chipActive: {
    backgroundColor: '#0A84FF',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.08,
  },
  textActive: {
    fontWeight: '600',
  },
});
