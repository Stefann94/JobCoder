import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Animated, Platform, BackHandler, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect, useNavigation, Stack } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlobalLoading } from '@/components/global-loading';
import { useAuth } from '@/providers/AuthProvider';
import { useProgress } from '@/providers/ProgressProvider';
import { 
  fetchQuestionsByCategory, 
  fetchCategories, 
  Category, 
  Question, 
  addXpToProfile,
  fetchDailyMixQuestions
} from '@/lib/api';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';

export default function QuizScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const categoryId = params.category as string;

  const { user, refreshProfile } = useAuth();
  const { progress, updateProgress, updateLevelProgress } = useProgress();
  const progressRef = useRef(progress);
  
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [didLevelUp, setDidLevelUp] = useState(false);

  // Exit Modal States
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pendingAction, setPendingAction] = useState<any>(null);
  const isExitingRef = useRef(false);

  // Explanation Modal States
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [explFadeAnim] = useState(new Animated.Value(0));
  const [hasViewedQuestion, setHasViewedQuestion] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const triggerAbortModal = () => {
    if (quizCompleted || quizQuestions.length === 0 || isExitingRef.current) return;
    
    setShowExitWarning(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!quizCompleted && quizQuestions.length > 0 && !isExitingRef.current) {
          triggerAbortModal();
          return true; // Intercept hardware back
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [quizCompleted, quizQuestions.length, fadeAnim])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (quizCompleted || quizQuestions.length === 0 || isExitingRef.current) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();
      
      // Store the action to dispatch it later
      setPendingAction(e.data.action);
      triggerAbortModal();
    });

    return unsubscribe;
  }, [navigation, quizCompleted, quizQuestions.length, fadeAnim]);

  const handleCancelExit = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowExitWarning(false);
      setPendingAction(null);
    });
  };

  const handleConfirmExit = () => {
    setShowExitWarning(false);
    isExitingRef.current = true;
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    } else {
      router.replace('/');
    }
  };

  // Setup the questions based on navigation parameters
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        // Reset quiz state in case of re-entry
        setQuizQuestions([]);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setIsAnswered(false);
        setHasViewedQuestion(false);
        setScore(0);
        setQuizCompleted(false);
        setXpEarned(0);
        setShowExitWarning(false);
        setPendingAction(null);
        isExitingRef.current = false;

        const fetchedCats = await fetchCategories();
        if (!isActive) return;
        setCategories(fetchedCats);
        
        let fetchedQs;
        if (categoryId === 'daily_mix') {
          const learnedCategoryIds = Object.entries(progressRef.current)
            .filter(([key, val]) => val.progress_percent > 0)
            .map(([key]) => key);
          fetchedQs = await fetchDailyMixQuestions(learnedCategoryIds);
        } else if (categoryId === 'mock') {
          fetchedQs = await fetchQuestionsByCategory(categoryId);
        } else {
          // Calculăm nivelul curent pentru categorie
          const catProgress = progressRef.current[categoryId]?.level_progress || {};
          let computedLevel = 1;
          while (catProgress[computedLevel.toString()] >= 80) {
            computedLevel++;
          }
          if (computedLevel > 5) computedLevel = 5;
          setCurrentLevel(computedLevel);
          
          fetchedQs = await fetchQuestionsByCategory(categoryId, computedLevel);
        }
        
        if (!isActive) return;
        setQuizQuestions(fetchedQs);
      };
      
      loadData();

      return () => {
        isActive = false;
      };
    }, [categoryId])
  );

  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    if (isAnswered) return; // Prevent clicking multiple times
    
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const positiveFeedbacks = ['SPOT ON!', 'VALIDATED', 'NAILED IT', 'SUCCESS', 'EXACT MATCH', 'AWESOME!', 'PERFECT!', 'CORRECT!', 'BRILLIANT!', 'WELL DONE!'];
      setFeedbackText(positiveFeedbacks[Math.floor(Math.random() * positiveFeedbacks.length)]);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 150);
      const negativeFeedbacks = ['MISSED IT', 'INVALID', 'NEEDS WORK', 'FAILED', 'WRONG ANSWER', 'NOT QUITE', 'TRY AGAIN', 'INCORRECT', 'NOPE!'];
      setFeedbackText(negativeFeedbacks[Math.floor(Math.random() * negativeFeedbacks.length)]);
    }
    
    setShowExplanationModal(true);
    Animated.timing(explFadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleViewQuestion = () => {
    Animated.timing(explFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowExplanationModal(false);
      setHasViewedQuestion(true);
    });
  };

  const handleNext = async () => {
    if (showExplanationModal) {
      Animated.timing(explFadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setShowExplanationModal(false);
        proceedNext();
      });
    } else {
      proceedNext();
    }
  };
  
  const proceedNext = async () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setHasViewedQuestion(false);
    } else {
      // Finish Quiz
      setQuizCompleted(true);
      if (user && categoryId !== 'mock' && categoryId !== 'daily_mix') {
        const correctPercentage = Math.round((score / quizQuestions.length) * 100);
        const currentProgress = progress[categoryId]?.progress_percent || 0;
        
        // Verificăm dacă trece nivelul (ex: minim 80% din întrebări corecte)
        if (correctPercentage >= 80 && currentLevel <= 5) {
          // Salvăm scorul real obținut în DB (ex: 85%), nu un 100 forțat
          await updateLevelProgress(categoryId, currentLevel, correctPercentage);
          setDidLevelUp(true);
          
          // Adăugăm XP fix per nivel finalizat
          const levelXp = 30;
          setXpEarned(levelXp);
          await addXpToProfile(user.id, levelXp);
          await refreshProfile();
        }
      }
    }
  };

  const handleFinish = () => {
    router.replace('/');
  };

  const getRankBadge = (scorePercentage: number) => {
    if (scorePercentage >= 100) return { title: 'God Tier Architect', icon: 'crown', color: '#8B5CF6', desc: 'Flawless execution! You are writing the documentation now.' };
    if (scorePercentage >= 70) return { title: 'Senior Developer', icon: 'rocket', color: '#10B981', desc: 'Excellent performance! Recruiters are already messaging you.' };
    if (scorePercentage >= 50) return { title: 'Mid-Level Engineer', icon: 'cogs', color: '#F59E0B', desc: 'Solid foundation. A bit more polish and you will master this.' };
    if (scorePercentage >= 40) return { title: 'Junior Developer', icon: 'laptop-code', color: '#3B82F6', desc: 'You are getting there! Keep studying the fundamentals.' };
    if (scorePercentage >= 20) return { title: 'Intern', icon: 'coffee', color: '#EC4899', desc: 'Everyone starts somewhere. Review the explanations and try again.' };
    return { title: 'Lost Tourist', icon: 'skull', color: '#EF4444', desc: 'Did you even read the documentation? Do not give up!' };
  };

  if (quizQuestions.length === 0) {
    return <GlobalLoading message="LOADING QUEST" transparentBackground={false} />;
  }

  const currentQuestion = quizQuestions[currentIndex];
  const progressPercent = ((currentIndex) / quizQuestions.length) * 100;
  const currentCategory = categories.find((c) => c.id === currentQuestion.category_id);

  // Score Screen View
  if (quizCompleted) {
    const scorePercentage = (score / quizQuestions.length) * 100;
    const badge = getRankBadge(scorePercentage);

    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.scoreFullScreen}>
            
            <View style={styles.headerGroup}>
              {didLevelUp ? (
                <>
                  <FontAwesome5 name="star" size={56} color={Colors.dark.primary} solid />
                  <ThemedText style={[styles.completionTitle, { color: Colors.dark.primary }]}>LEVEL UP!</ThemedText>
                  <ThemedText style={styles.scoreSubtitle}>{currentCategory?.title.toUpperCase()} - LEVEL {currentLevel} COMPLETED</ThemedText>
                </>
              ) : (
                <>
                  <FontAwesome5 
                    name={scorePercentage >= 80 ? "trophy" : "skull"} 
                    size={56} 
                    color={scorePercentage >= 80 ? "#F59E0B" : "#EF4444"} 
                  />
                  <ThemedText style={styles.completionTitle}>
                    {scorePercentage >= 80 ? "INTERVIEW COMPLETED" : "INTERVIEW FAILED"}
                  </ThemedText>
                </>
              )}
            </View>
            
            <View style={styles.scoreWidget}>
              <View style={styles.scoreRow}>
                <ThemedText style={styles.bigScore}>{score}</ThemedText>
                <ThemedText style={styles.bigScoreDivider}>/</ThemedText>
                <ThemedText style={styles.bigScore}>{quizQuestions.length}</ThemedText>
              </View>
              <ThemedText style={styles.scoreSubtitle}>CORRECT ANSWERS</ThemedText>
            </View>

            {!didLevelUp && (
              <ThemedView type="backgroundElement" style={styles.badgeCard}>
                <ThemedText style={styles.badgeTag}>YOUR INTERVIEW RANK</ThemedText>
                <View style={styles.badgeTitleRow}>
                  <ThemedText style={[styles.badgeTitle, { color: badge.color }]}>
                    {badge.title}
                  </ThemedText>
                  <FontAwesome5 name={badge.icon} size={24} color={badge.color} />
                </View>
                <ThemedText style={styles.badgeDesc}>
                  {badge.desc}
                </ThemedText>
              </ThemedView>
            )}

            <View style={styles.footerGroup}>
              <View style={styles.xpCard}>
                <FontAwesome5 name="bolt" size={16} color="#F59E0B" />
                <ThemedText style={styles.xpText}>+{xpEarned} XP EARNED</ThemedText>
              </View>

              <Pressable style={styles.actionButton} onPress={handleFinish}>
                <ThemedText style={styles.actionButtonText}>
                  BACK TO DASHBOARD
                </ThemedText>
              </Pressable>
            </View>

          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const webPadding = Platform.select({ web: { paddingTop: 80 }, default: {} });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ gestureEnabled: false, headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, webPadding]} edges={['top', 'left', 'right']}>
        
        {/* EXIT WARNING MODAL */}
        <Modal
          transparent={true}
          visible={showExitWarning}
          animationType="none"
          onRequestClose={handleCancelExit}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
              <View style={styles.modalHeader}>
                <FontAwesome5 name="exclamation-triangle" size={24} color="#F59E0B" />
                <ThemedText style={styles.modalTitle}>ABORT MISSION?</ThemedText>
              </View>
              <ThemedText style={styles.modalText}>
                Are you sure you want to exit? All progress in this session will be lost permanently.
              </ThemedText>
              <View style={styles.modalActions}>
                <Pressable style={[styles.modalBtn, styles.modalBtnCancel]} onPress={handleCancelExit}>
                  <ThemedText style={styles.modalBtnText}>NO, RETURN</ThemedText>
                </Pressable>
                <Pressable style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={handleConfirmExit}>
                  <ThemedText style={[styles.modalBtnText, { color: '#EF4444' }]}>YES, ABORT</ThemedText>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* EXPLANATION MODAL */}
        <Modal
          transparent={true}
          visible={showExplanationModal}
          animationType="none"
          onRequestClose={handleViewQuestion}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: explFadeAnim }]}>
              <View style={styles.explanationHeader}>
                {currentQuestion.options.find((o) => o.id === selectedOptionId)?.isCorrect ? (
                  <FontAwesome5 name="check-circle" solid size={28} color={Colors.dark.primary} />
                ) : (
                  <FontAwesome5 name="bug" size={28} color="#EF4444" />
                )}
                <ThemedText type="smallBold" style={[styles.explanationTitle, { color: currentQuestion.options.find((o) => o.id === selectedOptionId)?.isCorrect ? Colors.dark.primary : '#EF4444' }]}>
                  {feedbackText}
                </ThemedText>
              </View>
              <ThemedText style={styles.explanationBodyModal}>
                {currentQuestion.explanation}
              </ThemedText>
              <View style={styles.modalActions}>
                <Pressable style={[styles.modalBtn, styles.modalBtnCancel]} onPress={handleViewQuestion}>
                  <ThemedText style={styles.modalBtnText} adjustsFontSizeToFit numberOfLines={1}>VIEW QUESTION</ThemedText>
                </Pressable>
                <Pressable style={[styles.modalBtn, styles.modalBtnNext]} onPress={handleNext}>
                  <ThemedText style={[styles.modalBtnText, { color: Colors.dark.primary }]} adjustsFontSizeToFit numberOfLines={1}>NEXT QUESTION</ThemedText>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Quiz Progress Header */}
        <View style={styles.quizHeader}>
          <Pressable onPress={triggerAbortModal} style={styles.closeButton}>
            <ThemedText type="subtitle">✕</ThemedText>
          </Pressable>
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBarFilled, { width: `${progressPercent}%` }]} />
          </View>
          <ThemedText type="small" style={styles.progressText}>
            {currentIndex + 1}/{quizQuestions.length}
          </ThemedText>
        </View>

        <ScrollView 
          contentContainerStyle={styles.quizScrollContent}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card Header */}
          <View style={styles.questionCardHeader}>
            <View style={styles.metaRow}>
              <ThemedText style={[styles.categoryTag, { color: currentCategory?.color }]}>
                {currentCategory?.title.toUpperCase()}
              </ThemedText>
              <ThemedView type="backgroundSelected" style={styles.difficultyBadge}>
                <ThemedText style={styles.difficultyText}>{currentQuestion.difficulty}</ThemedText>
              </ThemedView>
            </View>
            <ThemedText type="subtitle" style={styles.questionTitle}>
              {currentQuestion.title}
            </ThemedText>
          </View>

          {/* Options Grid */}
          <View style={styles.optionsList}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const optionStyle = isAnswered
                ? option.isCorrect
                  ? styles.correctOption
                  : isSelected
                    ? styles.incorrectOption
                    : null
                : isSelected
                  ? styles.selectedOption
                  : null;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleOptionSelect(option.id, option.isCorrect)}
                  disabled={isAnswered}
                >
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.optionCard, optionStyle]}
                  >
                    <ThemedText style={styles.optionLetter}>
                      {option.id.toUpperCase()}
                    </ThemedText>
                    <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>

          {/* Correct/Incorrect Explanation Banner (Replaced with Next Button) */}
          {isAnswered && hasViewedQuestion && (
            <Pressable style={styles.inlineNextButton} onPress={handleNext}>
              <ThemedText style={styles.inlineNextButtonText}>
                {currentIndex === quizQuestions.length - 1 ? 'FINISH QUIZ' : 'NEXT QUESTION →'}
              </ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: '#F59E0B',
  },
  modalText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: '#888',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalBtnCancel: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  modalBtnConfirm: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  modalBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: '#DDD',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    justifyContent: 'center',
    minHeight: '80%',
  },
  quizScrollContent: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: 100, // Extra padding so navbar doesn't obscure the content
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 10,
  },
  closeButton: {
    padding: Spacing.one,
  },
  progressBarWrapper: {
    flex: 1,
    height: 12,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: Colors.dark.primary, // terminal green
  },
  progressText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#888',
  },
  questionCardHeader: {
    gap: Spacing.two,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    fontFamily: 'VT323_400Regular',
    fontSize: 14,
    color: '#888',
    letterSpacing: 1.2,
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#111',
  },
  difficultyText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 12,
    color: '#AAA',
    textTransform: 'uppercase',
  },
  questionTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: '#FFF',
    lineHeight: 26,
    marginTop: 5,
  },
  optionsList: {
    gap: Spacing.two,
  },
  optionCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    gap: Spacing.three,
  },
  optionLetter: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#666',
    width: 24,
  },
  optionText: {
    flex: 1,
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#DDD',
  },
  selectedOption: {
    borderColor: Colors.dark.primary,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
  },
  correctOption: {
    borderColor: Colors.dark.primary,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: Spacing.two,
  },

  explanationTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: '#FFF',
  },
  explanationBodyModal: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#CCC',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalBtnNext: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderColor: Colors.dark.primary,
  },
  inlineNextButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    marginTop: Spacing.four,
  },
  inlineNextButtonText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.dark.primary,
    letterSpacing: 1,
  },
  // Scoreboard styling
  scoreFullScreen: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  headerGroup: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  completionTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 42,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 44,
  },
  scoreWidget: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  bigScore: {
    fontFamily: 'VT323_400Regular',
    fontSize: 76,
    lineHeight: 84,
    color: Colors.dark.primary,
  },
  bigScoreDivider: {
    fontFamily: 'VT323_400Regular',
    fontSize: 64,
    lineHeight: 74,
    color: '#666',
  },
  scoreSubtitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#888',
    letterSpacing: 3,
    textAlign: 'center',
  },
  badgeCard: {
    alignSelf: 'stretch',
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
  },
  badgeTag: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#666',
    letterSpacing: 2,
  },
  badgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  badgeTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    textAlign: 'center',
  },
  badgeDesc: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    textAlign: 'center',
    color: '#AAA',
    lineHeight: 24,
  },
  footerGroup: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.four,
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 4,
  },
  xpText: {
    fontFamily: 'VT323_400Regular',
    color: '#F59E0B',
    fontSize: 22,
    letterSpacing: 2,
  },
  actionButton: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 4,
  },
  actionButtonText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.dark.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
