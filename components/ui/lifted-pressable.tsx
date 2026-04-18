import { ReactNode } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { usePressEffect } from '../../src/theme/press-effect';

interface LiftedPressableProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function LiftedPressable({ onPress, disabled, style, children }: LiftedPressableProps) {
  const { liftedStyle, pressedStyle } = usePressEffect();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [style, liftedStyle, !disabled && pressed && pressedStyle]}
    >
      {children}
    </Pressable>
  );
}
