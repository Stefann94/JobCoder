import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { Colors, Spacing } from '@/constants/theme';

interface GlobalLoadingProps {
  visible?: boolean;
  message?: string;
  transparentBackground?: boolean;
}

export function GlobalLoading({ 
  visible = true, 
  message = 'LOADING DATA',
  transparentBackground = false 
}: GlobalLoadingProps) {
  const [dots, setDots] = useState('');
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Animated dots
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    // Spinning wheel
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500, // A slightly slower, elegant spin
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => clearInterval(interval);
  }, [visible, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <View style={[styles.container, transparentBackground ? styles.transparent : styles.darkBg]}>
      <View style={styles.content}>
        <ThemedText style={styles.message}>
          {message}{dots}
        </ThemedText>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <FontAwesome5 name="circle-notch" size={56} color={Colors.dark.primary} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  darkBg: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.six,
    marginBottom: 40, // Adjusts center visually slightly upward
  },
  message: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: Colors.dark.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(57, 255, 20, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    width: 250,
    textAlign: 'center',
  },
});
