import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function Segmented<T extends string>({ options, value, onChange, style }: SegmentedProps<T>) {
  return (
    <View style={[styles.track, style]}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            onPress={() => onChange(opt.value)}
            style={[styles.thumb, active && styles.thumbActive]}
          >
            {typeof opt.label === 'string' ? (
              <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
            ) : (
              opt.label
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: 'rgba(118,118,128,0.24)',
    borderRadius: 9,
    padding: 2,
  },
  thumb: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: 'transparent',
  },
  thumbActive: {
    backgroundColor: 'rgba(99,99,102,1)',
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
