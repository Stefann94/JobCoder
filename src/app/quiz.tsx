import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QUESTIONS, Question, CATEGORIES } from '@/constants/questions';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.category as string;

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Setup the questions based on navigation parameters
  useEffect(() => {
    let selected: Question[] = [];
    if (categoryId === 'mock') {
      // Shuffle and pick 10 random questions (or max available)
      const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, 10);
    } else {
      // Filter by specific category
      selected = QUESTIONS.filter((q) => q.category === categoryId);
    }
    setQuizQuestions(selected);
  }, [categoryId]);

  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    if (isAnswered) return; // Prevent clicking multiple times
    
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + 15); // 15 XP per correct answer
    }
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleFinish = () => {
    router.replace('/');
  };

  const getRankBadge = (scorePercentage: number) => {
    if (scorePercentage >= 90) return { title: 'Lead Architect 👑', color: '#10B981', desc: 'Flawless interview! You are ready to lead teams.' };
    if (scorePercentage >= 70) return { title: 'Senior Developer 🚀', color: '#3B82F6', desc: 'Excellent performance. Recruiters will fight for you!' };
    if (scorePercentage >= 50) return { title: 'Mid-Level Engineer ⚙️', color: '#F59E0B', desc: 'Good foundations. A bit more polish and you are golden.' };
    return { title: 'Junior Intern 📝', color: '#EC4899', desc: 'Keep practicing! Review explanations to level up.' };
  };

  if (quizQuestions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Loading questions...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];
  const progressPercent = ((currentIndex) / quizQuestions.length) * 100;
  const currentCategory = CATEGORIES.find((c) => c.id === currentQuestion.category);

  // Score Screen View
  if (quizCompleted) {
    const scorePercentage = (score / quizQuestions.length) * 100;
    const badge = getRankBadge(scorePercentage);

    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.scoreContainer}>
              <ThemedText style={styles.trophyIcon}>🏆</ThemedText>
              <ThemedText type="title">Interview Completed!</ThemedText>
              
              <View style={styles.scoreWidget}>
                <ThemedText style={styles.bigScore}>{score} / {quizQuestions.length}</ThemedText>
                <ThemedText type="small" style={styles.scoreSubtitle}>CORRECT ANSWERS</ThemedText>
              </View>

              <ThemedView type="backgroundElement" style={styles.badgeCard}>
                <ThemedText type="smallBold" style={styles.badgeTag}>YOUR INTERVIEW RANK</ThemedText>
                <ThemedText type="subtitle" style={[styles.badgeTitle, { color: badge.color }]}>
                  {badge.title}
                </ThemedText>
                <ThemedText type="small" style={styles.badgeDesc}>
                  {badge.desc}
                </ThemedText>
              </ThemedView>

              <View style={styles.xpCard}>
                <ThemedText style={styles.xpText}>✨ +{xpEarned} XP Earned</ThemedText>
              </View>

              <Pressable style={styles.actionButton} onPress={handleFinish}>
                <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
                  Back to Dashboard
                </ThemedText>
              </Pressable>
            </View>

          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {/* Quiz Progress Header */}
        <View style={styles.quizHeader}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <ThemedText type="subtitle">✕</ThemedText>
          </Pressable>
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBarFilled, { width: `${progressPercent}%` }]} />
          </View>
          <ThemedText type="small" style={styles.progressText}>
            {currentIndex + 1}/{quizQuestions.length}
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.quizScrollContent} showsVerticalScrollIndicator={false}>
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

          {/* Correct/Incorrect Explanation Banner */}
          {isAnswered && (
            <ThemedView type="backgroundSelected" style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <ThemedText style={styles.explanationEmoji}>
                  {currentQuestion.options.find((o) => o.id === selectedOptionId)?.isCorrect ? '🎉' : '❌'}
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.explanationTitle}>
                  {currentQuestion.options.find((o) => o.id === selectedOptionId)?.isCorrect ? 'Correct!' : 'Incorrect'}
                </ThemedText>
              </View>
              <ThemedText type="small" style={styles.explanationBody}>
                {currentQuestion.explanation}
              </ThemedText>
              <Pressable style={styles.nextButton} onPress={handleNext}>
                <ThemedText type="defaultSemiBold" style={styles.nextButtonText}>
                  {currentIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                </ThemedText>
              </Pressable>
            </ThemedView>
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
  scrollContent: {
    padding: Spacing.three,
    justifyContent: 'center',
    minHeight: '80%',
  },
  quizScrollContent: {
    padding: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  closeButton: {
    padding: Spacing.one,
  },
  progressBarWrapper: {
    flex: 1,
    height: 10,
    backgroundColor: '#2E3135',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: '#10B981', // green progress fill
  },
  progressText: {
    opacity: 0.7,
  },
  questionCardHeader: {
    gap: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  difficultyBadge: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  questionTitle: {
    fontWeight: '700',
    lineHeight: 28,
  },
  optionsList: {
    gap: Spacing.two,
  },
  optionCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#2E3135',
    alignItems: 'center',
    gap: Spacing.three,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.5,
    width: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
  },
  selectedOption: {
    borderColor: '#3B82F6',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#10B98115',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444415',
  },
  explanationCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.two,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  explanationEmoji: {
    fontSize: 20,
  },
  explanationTitle: {
    fontWeight: '700',
  },
  explanationBody: {
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: Spacing.two,
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  nextButtonText: {
    color: '#ffffff',
  },
  // Scoreboard styling
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.five,
  },
  trophyIcon: {
    fontSize: 72,
  },
  scoreWidget: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  bigScore: {
    fontSize: 48,
    fontWeight: '800',
    color: '#10B981',
  },
  scoreSubtitle: {
    opacity: 0.6,
    letterSpacing: 1.5,
  },
  badgeCard: {
    alignSelf: 'stretch',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  badgeTag: {
    fontSize: 10,
    opacity: 0.5,
    letterSpacing: 1,
  },
  badgeTitle: {
    fontWeight: '800',
  },
  badgeDesc: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 18,
  },
  xpCard: {
    backgroundColor: '#F59E0B20',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  xpText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 15,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.three,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
  },
});
