import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Platform, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { CATEGORIES } from '@/constants/questions';

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

export default function StatsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [totalXp] = useState(450);
  const [streak] = useState(5);
  const [completedQuizzes] = useState(8);

  const achievements: Achievement[] = [
    { id: 'ach-1', title: 'First Steps', description: 'Complete your first practice quiz', emoji: '🌱', unlocked: true },
    { id: 'ach-2', title: 'Clean Coder', description: 'Answer 5 Backend questions correctly', emoji: '🧹', unlocked: true },
    { id: 'ach-3', title: 'Algo Master', description: 'Score 100% on any Algorithms quiz', emoji: '⚔️', unlocked: true },
    { id: 'ach-4', title: 'System Designer', description: 'Complete your first System Design mock', emoji: '🏗️', unlocked: false },
    { id: 'ach-5', title: 'SOLID Practitioner', description: 'Maintain a 5-day active study streak', emoji: '💎', unlocked: true },
    { id: 'ach-6', title: 'FAANG Ready', description: 'Reach 1000 total XP', emoji: '👑', unlocked: false },
  ];

  const handleShare = async () => {
    try {
      const message = `🚀 I'm preparing for coding interviews on JobCoder! Just hit a ${streak}-day streak and earned ${totalXp} XP. Wish me luck! 💻🎯 #JobCoder #Career`;
      if (Platform.OS === 'web') {
        navigator.clipboard.writeText(message);
        alert('Copied accomplishment post to clipboard!');
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.log('Error sharing achievements:', error);
    }
  };

  // Mock progress numbers for different tracks
  const getCategoryProgress = (id: string) => {
    switch (id) {
      case 'algorithms': return 0.66; // 2/3 questions
      case 'frontend': return 0.33;  // 1/3 questions
      case 'backend': return 1.0;    // 3/3 questions
      case 'system-design': return 0.0;
      case 'hr-behavioral': return 0.66;
      default: return 0.5;
    }
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: safeAreaInsets.top + Spacing.three,
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: 80,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={styles.scrollView}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.container}>
        
        {/* Title */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>Your Career Progress</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>Track your path to getting hired</ThemedText>
        </View>

        {/* Stats Grid Widget */}
        <View style={styles.statsRow}>
          <ThemedView type="backgroundElement" style={styles.statBox}>
            <ThemedText style={styles.statEmoji}>✨</ThemedText>
            <ThemedText type="subtitle" style={styles.statNum}>{totalXp}</ThemedText>
            <ThemedText type="small" style={styles.statLabel}>Total XP</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statBox}>
            <ThemedText style={styles.statEmoji}>🔥</ThemedText>
            <ThemedText type="subtitle" style={styles.statNum}>{streak}</ThemedText>
            <ThemedText type="small" style={styles.statLabel}>Day Streak</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statBox}>
            <ThemedText style={styles.statEmoji}>📝</ThemedText>
            <ThemedText type="subtitle" style={styles.statNum}>{completedQuizzes}</ThemedText>
            <ThemedText type="small" style={styles.statLabel}>Quizzes Done</ThemedText>
          </ThemedView>
        </View>

        {/* Category Performance Bars */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Category Mastery</ThemedText>
          <ThemedView type="backgroundElement" style={styles.cardBlock}>
            {CATEGORIES.map((category) => {
              const progress = getCategoryProgress(category.id);
              const percentage = Math.round(progress * 100);

              return (
                <View key={category.id} style={styles.progressRow}>
                  <View style={styles.progressLabelRow}>
                    <ThemedText type="smallBold">{category.title}</ThemedText>
                    <ThemedText type="small" style={{ color: category.color }}>{percentage}%</ThemedText>
                  </View>
                  <View style={styles.barBackground}>
                    <View 
                      style={[
                        styles.barFill, 
                        { width: `${percentage}%`, backgroundColor: category.color }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </ThemedView>
        </View>

        {/* Unlocked Achievements list */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Unlocked Achievements</ThemedText>
          <View style={styles.achievementsGrid}>
            {achievements.map((ach) => (
              <ThemedView 
                key={ach.id} 
                type="backgroundElement" 
                style={[styles.achievementCard, !ach.unlocked && styles.lockedAchievement]}
              >
                <View style={[styles.badgeIconBg, !ach.unlocked && styles.lockedIconBg]}>
                  <ThemedText style={styles.badgeEmoji}>{ach.unlocked ? ach.emoji : '🔒'}</ThemedText>
                </View>
                <View style={styles.achievementText}>
                  <ThemedText type="smallBold" style={[styles.achTitle, !ach.unlocked && styles.lockedText]}>
                    {ach.title}
                  </ThemedText>
                  <ThemedText type="small" style={[styles.achDesc, !ach.unlocked && styles.lockedText]}>
                    {ach.description}
                  </ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>
        </View>

        {/* LinkedIn Share Button */}
        <Pressable onPress={handleShare} style={styles.shareBtn}>
          <ThemedText type="smallBold" style={styles.shareBtnText}>
            Share achievements on LinkedIn 🚀
          </ThemedText>
        </Pressable>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    gap: Spacing.four,
    width: '100%',
  },
  header: {
    gap: Spacing.half,
    marginTop: Spacing.two,
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {
    opacity: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: Spacing.one,
  },
  statNum: {
    fontWeight: '800',
  },
  statLabel: {
    opacity: 0.5,
    fontSize: 11,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  cardBlock: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  progressRow: {
    gap: Spacing.one,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#2E3135',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementsGrid: {
    gap: Spacing.two,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#2E3135',
    alignItems: 'center',
    gap: Spacing.three,
  },
  lockedAchievement: {
    borderColor: '#212225',
    opacity: 0.4,
  },
  badgeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIconBg: {
    backgroundColor: '#212225',
  },
  badgeEmoji: {
    fontSize: 20,
  },
  achievementText: {
    flex: 1,
    gap: Spacing.half,
  },
  achTitle: {
    fontWeight: '600',
  },
  achDesc: {
    opacity: 0.6,
  },
  lockedText: {
    opacity: 0.8,
  },
  shareBtn: {
    backgroundColor: '#0077B5', // LinkedIn Blue color
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  shareBtnText: {
    color: '#ffffff',
  },
});
