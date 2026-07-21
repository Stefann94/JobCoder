import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, ViewToken } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  FadeOut,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import OnboardingSlide, { SlideData } from '@/components/onboarding-slide';

const { width, height } = Dimensions.get('window');

const SLIDES: SlideData[] = [
  {
    icon: 'shield-alt',
    title: 'WELCOME, HACKER',
    subtitle: 'INITIATING SYSTEM...',
    description: 'Your journey to landing the ultimate tech job starts here. Prepare for battle.',
    accentColor: Colors.dark.primary,
  },
  {
    icon: 'gamepad',
    title: 'LEVEL UP YOUR SKILLS',
    subtitle: 'GRIND FOR XP',
    description: 'Master coding challenges, earn XP, and unlock new skill trees. Every question brings you closer to your dream job.',
    accentColor: '#60A5FA',
  },
  {
    icon: 'user-tie',
    title: 'FACE THE BOSS',
    subtitle: 'SIMULATE INTERVIEWS',
    description: 'Face off against brutal AI interviewers. Answer technical questions, negotiate salary, and survive the pressure.',
    accentColor: Colors.dark.danger,
  },
  {
    icon: 'trophy',
    title: 'JOIN THE GUILD',
    subtitle: 'BECOME A LEGEND',
    description: 'Aced the interview? Track your progress, rank up on leaderboards, and become an elite developer.',
    accentColor: Colors.dark.warning,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isExiting = useSharedValue(false);

  // Button animations
  const btnOpacity = useSharedValue(0);
  const btnTranslateY = useSharedValue(30);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  // Show button animation when on last slide
  React.useEffect(() => {
    if (isLastSlide) {
      btnOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
      btnTranslateY.value = withDelay(600, withSpring(0, { damping: 10 }));
    } else {
      btnOpacity.value = 0;
      btnTranslateY.value = 30;
    }
  }, [isLastSlide]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const btnAnimStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Skip button (top right) */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipBtn} onPress={onComplete}>
          <Text style={styles.skipText}>SKIP {'>'}</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <OnboardingSlide data={item} index={index} isActive={index === activeIndex} />
        )}
      />

      {/* Bottom section: dots + button */}
      <View style={styles.bottomSection}>
        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && [styles.dotActive, { backgroundColor: slide.accentColor }],
              ]}
            />
          ))}
        </View>

        {/* Next / Begin button */}
        {isLastSlide ? (
          <Animated.View style={btnAnimStyle}>
            <TouchableOpacity style={styles.beginBtn} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.beginBtnText}>[ BEGIN YOUR QUEST ]</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>NEXT {'>'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  skipBtn: {
    position: 'absolute',
    top: 55,
    right: 25,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: '#666',
    letterSpacing: 2,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 30,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  dotActive: {
    width: 28,
    borderRadius: 5,
    backgroundColor: Colors.dark.primary,
  },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
  },
  nextBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: '#aaa',
    letterSpacing: 2,
  },
  beginBtn: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  beginBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: Colors.dark.background,
    letterSpacing: 2,
  },
});
