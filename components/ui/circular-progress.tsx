import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { ReactNode } from 'react';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress?: number; // 0-1, undefined = no-target ring
  color: string;
  trackColor?: string;
  children?: ReactNode;
}

export function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  trackColor,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const hasProgress = progress !== undefined;
  const clampedProgress = hasProgress ? Math.min(progress, 1) : 0;
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {hasProgress && trackColor ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        ) : null}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={hasProgress ? circumference : undefined}
          strokeDashoffset={hasProgress ? strokeDashoffset : undefined}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.childrenContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  childrenContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
