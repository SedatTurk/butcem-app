import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface CustomSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  activeColor?: string;
}

export default function CustomSwitch({ enabled, onToggle, activeColor = Colors.neonGreen }: CustomSwitchProps) {
  const animValue = useRef(new Animated.Value(enabled ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: enabled ? 1 : 0,
      useNativeDriver: false, // Color interpolation cannot use native driver
      bounciness: 8,
      speed: 14,
    }).start();
  }, [enabled]);

  const trackColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.textMuted + '40', activeColor + '30'],
  });

  const thumbColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.textMuted, activeColor],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 23], // 48 (track width) - 22 (thumb size) - 3 (padding)
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onToggle}>
      <Animated.View style={[styles.customToggleTrack, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.customToggleThumb, { backgroundColor: thumbColor, transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  customToggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  customToggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
  },
});
