import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  accessibilityLabel?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function Segmented<T extends string>({ options, value, onChange, style }: SegmentedProps<T>) {
  const { isDark } = useTheme();
  const trackBg = isDark ? 'rgba(118,118,128,0.24)' : 'rgba(120,120,128,0.16)';
  const thumbBg = isDark ? 'rgba(99,99,102,1)' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const activeShadow = isDark ? null : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  };

  return (
    <View style={[styles.track, { backgroundColor: trackBg }, style]}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityLabel={opt.accessibilityLabel}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.value)}
            style={[
              styles.thumb,
              active && { backgroundColor: thumbBg },
              active && activeShadow,
            ]}
          >
            {typeof opt.label === 'string' ? (
              <Text style={[styles.text, { color: textColor }, active && styles.textActive]}>
                {opt.label}
              </Text>
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
  text: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.08,
  },
  textActive: {
    fontWeight: '600',
  },
});
