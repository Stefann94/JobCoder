import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, ViewToken, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { FontAwesome5 } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';
import OnboardingSlide, { SlideData } from '@/components/onboarding-slide';

WebBrowser.maybeCompleteAuthSession();
const redirectUri = AuthSession.makeRedirectUri({ scheme: 'jobcoder' });

const { width } = Dimensions.get('window');

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

const TYPEWRITER_PHRASES = [
  "Choose your path, Hacker.",
  "Connecting to mainframe...",
  "Bypassing security protocols...",
  "Ready for your next interview?",
  "Encrypting data streams..."
];

function TypewriterSubtitle() {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text === currentPhrase) {
      // Pause at the end of typing
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && text === '') {
      // Move to next phrase
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
    } else {
      // Typing or deleting
      const nextText = isDeleting
        ? currentPhrase.substring(0, text.length - 1)
        : currentPhrase.substring(0, text.length + 1);

      const speed = isDeleting ? 30 : 70;
      timeout = setTimeout(() => setText(nextText), speed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  return (
    <Text style={styles.gateSubtitle}>
      // {text}
      <Text style={styles.cursor}>_</Text>
    </Text>
  );
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auth Gate states
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Button animations
  const btnOpacity = useSharedValue(0);
  const btnTranslateY = useSharedValue(30);

  // Auth Gate transition animations
  const slidesOpacity = useSharedValue(1);
  const gateOpacity = useSharedValue(0);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  // Show button animation when on last slide
  React.useEffect(() => {
    if (isLastSlide && !showAuthGate) {
      btnOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
      btnTranslateY.value = withDelay(600, withSpring(0, { damping: 10 }));
    } else {
      btnOpacity.value = 0;
      btnTranslateY.value = 30;
    }
  }, [isLastSlide, showAuthGate]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleBeginQuest = () => {
    // Transition to Auth Gate
    slidesOpacity.value = withTiming(0, { duration: 400 });
    
    setTimeout(() => {
      setShowAuthGate(true);
      gateOpacity.value = withTiming(1, { duration: 400 });
    }, 400);
  };

  const handleNext = () => {
    if (isLastSlide) {
      handleBeginQuest();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    
    setIsLoggingIn(true);
    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password });
        if (result.error) throw result.error;
        if (result.data.user) {
          Alert.alert('Success', 'Account created! Initializing profile...');
          onComplete(); 
          return;
        }
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        onComplete(); 
        return;
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setIsLoggingIn(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        Alert.alert('Error', error?.message || 'Could not start Google login.');
        setIsLoggingIn(false);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const params = new URLSearchParams(url.split('#')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          onComplete();
          return; 
        }
      }
      setIsLoggingIn(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setIsLoggingIn(false);
    }
  };

  const btnAnimStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnTranslateY.value }],
  }));

  const slidesStyle = useAnimatedStyle(() => ({
    opacity: slidesOpacity.value,
    flex: 1,
  }));

  const gateStyle = useAnimatedStyle(() => ({
    opacity: gateOpacity.value,
  }));

  return (
    <View style={styles.container}>
      
      {/* SLIDES SECTION */}
      {!showAuthGate && (
        <Animated.View style={slidesStyle}>
          {!isLastSlide && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleBeginQuest}>
              <Text style={styles.skipText}>SKIP {'>'}</Text>
            </TouchableOpacity>
          )}

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

          <View style={styles.bottomSection}>
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
        </Animated.View>
      )}

      {/* AUTH GATE SECTION */}
      {showAuthGate && (
        <Animated.View style={[styles.gateContainer, gateStyle]}>
          <ScrollView 
            style={styles.gateScroll}
            contentContainerStyle={styles.gateScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gateContentCenter}>
              <FontAwesome5 name="server" size={50} color={Colors.dark.primary} style={{ marginBottom: 15 }} />
              <Text style={styles.gateTitle}>[ ESTABLISH CONNECTION ]</Text>
              
              <TypewriterSubtitle />

              {/* Email Form */}
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Hacker Email"
                  placeholderTextColor="#555"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Encrypted Password"
                  placeholderTextColor="#555"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => handleEmailAuth(true)} disabled={isLoggingIn}>
                    <Text style={styles.btnSecondaryText}>[ REGISTER ]</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnPrimaryForm} onPress={() => handleEmailAuth(false)} disabled={isLoggingIn}>
                    <Text style={styles.btnPrimaryFormText}>{isLoggingIn ? '...' : '[ LOGIN ]'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.googleBtn} 
                onPress={handleGoogleLogin} 
                disabled={isLoggingIn}
                activeOpacity={0.8}
              >
                {isLoggingIn ? (
                  <ActivityIndicator color={Colors.dark.background} />
                ) : (
                  <>
                    <FontAwesome5 name="google" size={18} color={Colors.dark.background} />
                    <Text style={styles.googleBtnText}>CONNECT WITH GOOGLE</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.guestBtn} onPress={onComplete} disabled={isLoggingIn}>
                <Text style={styles.guestBtnText}>PROCEED INCOGNITO</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </Animated.View>
      )}

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

  // Auth Gate Styles
  gateContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gateScroll: {
    flex: 1,
    width: '100%',
  },
  gateScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 50,
  },
  gateContentCenter: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 400,
  },
  gateTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 32,
    color: Colors.dark.primary,
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 1,
  },
  gateSubtitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
    minHeight: 24, // Prevents layout jump when text is empty
  },
  cursor: {
    color: Colors.dark.primary,
    fontWeight: 'bold',
  },
  
  // Form Styles
  formContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    padding: 15,
    borderRadius: 8,
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 5,
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
  },
  btnPrimaryForm: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimaryFormText: {
    color: Colors.dark.background,
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#555',
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    marginHorizontal: 15,
  },

  googleBtn: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    gap: 12,
    marginBottom: 25,
  },
  googleBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1,
  },
  guestBtn: {
    paddingVertical: 12,
  },
  guestBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#666',
    letterSpacing: 2,
    textDecorationLine: 'underline',
  },
});
