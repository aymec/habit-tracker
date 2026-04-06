import { View, ViewProps, StyleSheet } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

type GlassEffectStyle = 'regular' | 'clear';

interface GlassCardProps extends ViewProps {
  glassEffect?: GlassEffectStyle;
  fallbackBackgroundColor: string;
  fallbackBorderColor?: string;
  borderRadius?: number;
}

const glassAvailable = isLiquidGlassAvailable();

export function GlassCard({
  children,
  glassEffect = 'regular',
  fallbackBackgroundColor,
  fallbackBorderColor,
  borderRadius = 8,
  style,
  ...rest
}: GlassCardProps) {
  if (glassAvailable) {
    return (
      <GlassView
        glassEffectStyle={glassEffect}
        style={[{ borderRadius, overflow: 'hidden' }, style]}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: fallbackBackgroundColor,
          borderColor: fallbackBorderColor,
          borderWidth: fallbackBorderColor ? 1 : 0,
          borderRadius,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
