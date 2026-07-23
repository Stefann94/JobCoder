import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

// Fully responsive sizing based on screen height
const VISUAL_SIZE = Math.min(height * 0.2, 200);

export interface SlideData {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
}

interface OnboardingSlideProps {
  data: SlideData;
  index: number;
  isActive: boolean;
}

export default function OnboardingSlide({ data, index, isActive }: OnboardingSlideProps) {
  // Icon
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.3);
  const iconRotation = useSharedValue(0);
  const iconTranslateY = useSharedValue(0);

  // Text
  const titleOpacity = useSharedValue(0);
  const titleTranslateX = useSharedValue(-60); // Starts further left
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateX = useSharedValue(60); // Starts further right
  const descOpacity = useSharedValue(0);
  // Ambient HUD Brackets
  const bracketScale = useSharedValue(1.5);
  const bracketOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      iconOpacity.value = 0;
      iconScale.value = 0.3;
      iconRotation.value = 0;
      iconTranslateY.value = 0;
      titleOpacity.value = 0;
      titleTranslateX.value = -60;
      subtitleOpacity.value = 0;
      subtitleTranslateX.value = 60;
      descOpacity.value = 0;
      bracketOpacity.value = 0;
      bracketScale.value = 1.5;
      return;
    }

    // Unique animation per slide
    switch (index) {
      case 0: // WELCOME — icon spins in from nothing
        iconOpacity.value = withTiming(1, { duration: 600 });
        iconScale.value = withSpring(1, { damping: 6, stiffness: 80 });
        iconRotation.value = withSpring(360, { damping: 12, stiffness: 40 });
        break;

      case 1: // LEVEL UP — fast joypad rock (gaming action)
        iconOpacity.value = withTiming(1, { duration: 300 });
        iconScale.value = withSpring(1, { damping: 8, stiffness: 100 });
        iconRotation.value = withSequence(
          withTiming(25, { duration: 80 }),
          withTiming(-20, { duration: 80 }),
          withTiming(15, { duration: 80 }),
          withTiming(-10, { duration: 80 }),
          withTiming(0, { duration: 100 })
        );
        break;

      case 2: // BOSS — icon fades in then shakes aggressively
        iconOpacity.value = withTiming(1, { duration: 400 });
        iconScale.value = withSpring(1, { damping: 10 });
        iconRotation.value = withDelay(500, withRepeat(
          withSequence(
            withTiming(-8, { duration: 60 }),
            withTiming(8, { duration: 60 }),
            withTiming(-5, { duration: 60 }),
            withTiming(5, { duration: 60 }),
            withTiming(0, { duration: 60 }),
            withTiming(0, { duration: 1500 }),
          ),
          -1
        ));
        break;

      case 3: // GUILD — icon scales up with a satisfying pop (reduced scale to stay in box)
        iconOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
        iconScale.value = withDelay(200, withSequence(
          withSpring(1.15, { damping: 5, stiffness: 180 }),
          withSpring(1, { damping: 8, stiffness: 100 })
        ));
        break;
    }

    // Ambient HUD Brackets (focuses in like a camera target)
    bracketOpacity.value = withDelay(100, withTiming(0.4, { duration: 600 }));
    bracketScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 60 }));

    // Title slides in from left
    titleOpacity.value = withDelay(350, withTiming(1, { duration: 500 }));
    titleTranslateX.value = withDelay(350, withSpring(0, { damping: 14, stiffness: 90 }));

    // Subtitle slides in from right
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    subtitleTranslateX.value = withDelay(800, withSpring(0, { damping: 14, stiffness: 90 }));

    // Description fades in smoothly with a glow
    descOpacity.value = withDelay(1250, withTiming(1, { duration: 800 }));
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
      { translateY: iconTranslateY.value },
    ],
  }));

  const bracketStyle = useAnimatedStyle(() => ({
    opacity: bracketOpacity.value,
    transform: [{ scale: bracketScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateX: titleTranslateX.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateX: subtitleTranslateX.value }],
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  }));

  return (
    <View style={[styles.slide, { width }]}>
      {/* Visual Area for Icon & Brackets */}
      <View style={styles.visualContainer}>
        {/* Animated HUD Brackets */}
        <Animated.View style={[styles.bracketContainer, bracketStyle]}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: data.accentColor }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: data.accentColor }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: data.accentColor }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: data.accentColor }]} />
        </Animated.View>
        
        {/* Icon */}
        <Animated.View style={[styles.iconArea, iconStyle]}>
          <FontAwesome5 name={data.icon as any} size={VISUAL_SIZE * 0.4} color={data.accentColor} />
        </Animated.View>
      </View>

      {/* Title */}
      <Animated.View style={titleStyle}>
        <Text style={[styles.title, { color: data.accentColor }]}>{data.title}</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={subtitleStyle}>
        <Text style={styles.subtitle}>{data.subtitle}</Text>
      </Animated.View>

      {/* Description */}
      <Animated.View style={descStyle}>
        <Text style={styles.description}>{data.description}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  visualContainer: {
    width: VISUAL_SIZE,
    height: VISUAL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bracketContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 0,
    opacity: 0.7,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  iconArea: {
    // Perfectly centered within visualContainer
  },
  title: {
    fontFamily: 'VT323_400Regular',
    fontSize: Math.min(height * 0.04, 32),
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: Math.min(height * 0.022, 18),
    color: '#666',
    textAlign: 'center',
    letterSpacing: 2,
  },
  description: {
    fontFamily: 'VT323_400Regular',
    fontSize: Math.min(height * 0.025, 20),
    color: '#aaa',
    textAlign: 'center',
    lineHeight: Math.min(height * 0.038, 30),
    maxWidth: width * 0.82,
  },
});
