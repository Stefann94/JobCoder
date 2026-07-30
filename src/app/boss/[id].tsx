import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, Animated, Easing, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlobalLoading } from '@/components/global-loading';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { fetchBossQuestions, fetchBossFights, BossFight, Question, addXpToProfile, consumeBossFightAttempt } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const { width } = Dimensions.get('window');
const TIMER_DURATION = 30; // 30 secunde
const MAX_LIVES = 3;
const BOSS_XP_REWARD = 350;

export default function BossFightScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // boss ID
  const { user, refreshProfile } = useAuth();

  const [boss, setBoss] = useState<BossFight | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [blinkState, setBlinkState] = useState(false);

  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [attemptsLeft, setAttemptsLeft] = useState(2);
  const [timeLeftToMidnight, setTimeLeftToMidnight] = useState('');

  useEffect(() => {
    if (user) {
      if (user.last_boss_fight_at === todayStr) {
        const left = 2 - (user.boss_attempts || 0);
        setAttemptsLeft(left < 0 ? 0 : left);
      } else {
        setAttemptsLeft(2);
      }
    }
  }, [user]);

  useEffect(() => {
    if (attemptsLeft <= 0) {
      const interval = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = tomorrow.getTime() - now.getTime();
        
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeftToMidnight(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [attemptsLeft]);

  useEffect(() => {
    async function initBoss() {
      const bosses = await fetchBossFights();
      const currentBoss = bosses.find(b => b.id === id);
      if (currentBoss) {
        setBoss(currentBoss);
        const qs = await fetchBossQuestions(currentBoss.category_id);
        setQuestions(qs);
      }
      setLoading(false);
    }
    initBoss();
  }, [id]);

  useEffect(() => {
    if (!loading && questions.length > 0 && !isAnswered && !gameOver && !victory) {
      startTimer();
    }
    return () => stopTimer();
  }, [currentIndex, isAnswered, loading, gameOver, victory]);

  const startTimer = () => {
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: TIMER_DURATION * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    timerRef.current = setTimeout(() => {
      handleTimeout();
    }, TIMER_DURATION * 1000);
  };

  const stopTimer = () => {
    timerAnim.stopAnimation();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleTimeout = () => {
    if (isAnswered) return;
    processAnswer(false, null);
  };

  const processAnswer = async (isCorrect: boolean, optionId: string | null) => {
    setIsAnswered(true);
    setSelectedOptionId(optionId);
    stopTimer();

    if (isCorrect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setLives(prev => prev - 1);
    }

    // Blink rapid 2 ori cu stare de React
    let blinks = 0;
    const blinkInterval = setInterval(() => {
      setBlinkState(prev => !prev);
      blinks++;
      if (blinks >= 4) { // 4 toggles = 2 blinks completi
        clearInterval(blinkInterval);
        setBlinkState(false);
      }
    }, 150);

    setTimeout(async () => {
      if (!isCorrect && lives - 1 <= 0) {
        setGameOver(true);
        if (user) {
          await consumeBossFightAttempt(user.id);
          await refreshProfile();
        }
      } else {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsAnswered(false);
          setSelectedOptionId(null);
          setBlinkState(false);
        } else {
          setVictory(true);
          if (user) {
            setXpEarned(BOSS_XP_REWARD);
            await addXpToProfile(user.id, BOSS_XP_REWARD);
            await consumeBossFightAttempt(user.id);
            await refreshProfile();
          }
        }
      }
    }, 800); // 800ms este mult mai rapid decat 1500ms
  };

  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    if (isAnswered) return;
    processAnswer(isCorrect, optionId);
  };

  if (loading) {
    return <GlobalLoading message="SUMMONING BOSS..." transparentBackground={false} />;
  }

  if (!loading && attemptsLeft <= 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.endArea}>
          <FontAwesome5 name="lock" size={80} color="#555" style={{ marginBottom: 20 }} />
          <ThemedText style={[styles.endTitle, { color: '#888' }]}>LOCKED</ThemedText>
          <ThemedText style={styles.endSubtitle}>You used all your attempts for today.</ThemedText>
          
          <ThemedText style={{ fontFamily: 'VT323_400Regular', fontSize: 60, color: '#EF4444', marginTop: 20 }}>
             {timeLeftToMidnight}
          </ThemedText>
          <ThemedText style={{ color: '#888', marginTop: 8, marginBottom: 40, fontFamily: 'VT323_400Regular', fontSize: 20 }}>UNTIL NEXT CHANCE</ThemedText>

          <Pressable style={[styles.btnAction, { backgroundColor: '#333' }]} onPress={() => router.replace('/')}>
            <ThemedText style={[styles.btnActionText, { color: '#CCC' }]}>RETURN TO BASE</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!boss || questions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText style={{ color: 'red', textAlign: 'center', fontSize: 24, marginTop: 40 }}>BOSS NOT FOUND</ThemedText>
          <Pressable style={styles.btnAction} onPress={() => router.replace('/')}>
            <ThemedText style={styles.btnActionText}>FLEE</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (gameOver) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.endArea}>
          <FontAwesome5 name="skull-crossbones" size={80} color="#EF4444" style={{ marginBottom: 20 }} />
          <ThemedText style={styles.endTitle}>YOU DIED</ThemedText>
          <ThemedText style={styles.endSubtitle}>The boss crushed your code.</ThemedText>
          
          <Pressable style={styles.btnAction} onPress={() => router.replace('/')}>
            <ThemedText style={styles.btnActionText}>RETURN TO BASE</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (victory) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.endArea}>
          <FontAwesome5 name="trophy" size={80} color="#F59E0B" style={{ marginBottom: 20 }} />
          <ThemedText style={[styles.endTitle, { color: '#F59E0B' }]}>BOSS DEFEATED!</ThemedText>
          <ThemedText style={styles.endSubtitle}>You proved your worth against {boss.company_name}.</ThemedText>
          <ThemedText style={[styles.endTitle, { color: '#10B981', fontSize: 40, marginTop: 20 }]}>+{xpEarned} XP</ThemedText>

          <Pressable style={[styles.btnAction, { backgroundColor: '#F59E0B', marginTop: 40 }]} onPress={() => router.replace('/')}>
            <ThemedText style={[styles.btnActionText, { color: '#000' }]}>CLAIM REWARD</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const currentQ = questions[currentIndex];
  const timerWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.livesContainer}>
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <FontAwesome5 
                key={i} 
                name="heart" 
                solid={i < lives} 
                size={24} 
                color={i < lives ? "#EF4444" : "#444"} 
              />
            ))}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText style={styles.bossName}>{boss.title}</ThemedText>
            <ThemedText style={styles.qCount}>{currentIndex + 1} / {questions.length}</ThemedText>
          </View>
        </View>

        {/* TIMER BAR */}
        <View style={styles.timerTrack}>
          <Animated.View style={[styles.timerFill, { width: timerWidth }]} />
        </View>

        {/* QUESTION */}
        <View style={styles.questionCard}>
          <ThemedText style={styles.questionText}>{currentQ.title}</ThemedText>
        </View>

        {/* OPTIONS */}
        <View style={styles.optionsContainer}>
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle: any = [styles.optionBtn];
            let txtStyle: any = [styles.optionText];

            if (isAnswered) {
              if (opt.isCorrect) {
                btnStyle.push(styles.optionCorrect);
                txtStyle.push(styles.optionTextCorrect);
                if (isSelected && blinkState) {
                  btnStyle.push({ opacity: 0.3 });
                }
              } else if (isSelected) {
                btnStyle.push(styles.optionWrong);
                txtStyle.push(styles.optionTextWrong);
                if (blinkState) {
                  btnStyle.push({ opacity: 0.3 });
                }
              } else {
                btnStyle.push({ opacity: 0.4 });
              }
            }

            return (
              <Pressable 
                key={opt.id} 
                onPress={() => handleOptionSelect(opt.id, opt.isCorrect)}
                style={btnStyle}
                disabled={isAnswered}
              >
                <ThemedText style={txtStyle}>{opt.text}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0000',
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  bossName: {
    fontFamily: 'VT323_400Regular',
    color: '#EF4444',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  qCount: {
    fontFamily: 'VT323_400Regular',
    color: '#888',
    fontSize: 14,
  },
  timerTrack: {
    height: 6,
    backgroundColor: '#331111',
    width: '100%',
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  timerFill: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  questionCard: {
    backgroundColor: '#1a0505',
    borderWidth: 2,
    borderColor: '#EF4444',
    padding: Spacing.three,
    marginBottom: Spacing.four,
    minHeight: 100,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: Spacing.two,
  },
  optionBtn: {
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#333',
    padding: Spacing.three,
  },
  optionText: {
    fontSize: 15,
    color: '#DDD',
    textAlign: 'center',
  },
  optionCorrect: {
    backgroundColor: '#064e3b',
    borderColor: '#10B981',
  },
  optionTextCorrect: {
    color: '#10B981',
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
  },
  optionWrong: {
    backgroundColor: '#450a0a',
    borderColor: '#EF4444',
  },
  optionTextWrong: {
    color: '#EF4444',
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
  },
  endArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  endTitle: {
    fontFamily: 'VT323_400Regular',
    color: '#EF4444',
    fontSize: 50,
    lineHeight: 60,
    textAlign: 'center',
    letterSpacing: 2,
  },
  endSubtitle: {
    color: '#AAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.six,
  },
  btnAction: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '80%',
    alignItems: 'center',
  },
  btnActionText: {
    fontFamily: 'VT323_400Regular',
    color: '#000',
    fontSize: 24,
  }
});
