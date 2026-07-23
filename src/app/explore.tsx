import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Platform, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, Colors } from '@/constants/theme';
import { fetchCategories, Category } from '@/lib/api';
import { useProgress } from '@/providers/ProgressProvider';
import { useAuth } from '@/providers/AuthProvider';

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

  const { progress } = useProgress();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  
  React.useEffect(() => {
    async function loadData() {
      const data = await fetchCategories();
      setCategories(data);
    }
    loadData();
  }, []);

  const totalXp = profile?.xp || 0;
  const streak = 1; // Fake streak for now until implemented
  const completedQuizzes = Object.keys(progress).length;

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

  const getCategoryProgress = (id: string) => {
    const p = progress[id]?.progress_percent || 0;
    return p / 100;
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
          <ThemedText type="subtitle" style={styles.title}>{'>'} USER_STATS_LOG</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>Tracking career progression vectors...</ThemedText>
        </View>

        {/* Stats Grid Widget */}
        <View style={styles.statsRow}>
          <ThemedView type="backgroundElement" style={styles.statBox}>
            <ThemedText style={styles.statEmoji}>✨</ThemedText>
            <ThemedText type="subtitle" style={styles.statNum}>{totalXp}</ThemedText>
            <ThemedText type="small" style={styles.statLabel}>TOTAL XP</ThemedText>
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
          <ThemedText type="smallBold" style={styles.sectionTitle}>{'>'} CATEGORY_MASTERY</ThemedText>
          <ThemedView type="backgroundElement" style={styles.cardBlock}>
            {categories.map((category) => {
              const progress = getCategoryProgress(category.id);
              const percentage = Math.round(progress * 100);

              return (
                <View key={category.id} style={styles.progressRow}>
                  <View style={styles.progressLabelRow}>
                    <ThemedText type="smallBold" style={styles.catTitle}>{category.title.toUpperCase()}</ThemedText>
                    <ThemedText type="small" style={{ color: Colors.dark.primary, fontFamily: 'VT323_400Regular', fontSize: 16 }}>{percentage}%</ThemedText>
                  </View>
                  <View style={styles.barBackground}>
                    <View 
                      style={[
                        styles.barFill, 
                        { width: `${percentage}%` }
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
          <ThemedText type="smallBold" style={styles.sectionTitle}>{'>'} ACHIEVEMENTS_UNLOCKED</ThemedText>
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
            [ EXECUTE SHARE_LINKEDIN ]
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
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: Spacing.two,
  },
  title: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    letterSpacing: 2,
    color: Colors.dark.primary,
  },
  subtitle: {
    fontFamily: 'VT323_400Regular',
    opacity: 0.7,
    fontSize: 16,
    color: Colors.dark.textSecondary,
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
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#151515',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: Spacing.one,
  },
  statNum: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: Colors.dark.primary,
  },
  statLabel: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.textSecondary,
    fontSize: 14,
    letterSpacing: 1,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: 'VT323_400Regular',
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: 2,
  },
  cardBlock: {
    padding: Spacing.four,
    borderRadius: 0,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#111111',
  },
  progressRow: {
    gap: Spacing.one,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#DDDDDD',
    letterSpacing: 1,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
  },
  achievementsGrid: {
    gap: Spacing.two,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#2A4A33',
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    gap: Spacing.three,
  },
  lockedAchievement: {
    borderColor: '#333333',
    backgroundColor: '#151515',
    opacity: 0.6,
  },
  badgeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIconBg: {
    borderColor: '#333333',
    backgroundColor: '#111111',
  },
  badgeEmoji: {
    fontSize: 20,
  },
  achievementText: {
    flex: 1,
    gap: 2,
  },
  achTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.dark.primary,
    letterSpacing: 1,
  },
  achDesc: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  lockedText: {
    color: '#888888',
  },
  shareBtn: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.three,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  shareBtnText: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.primary,
    fontSize: 18,
    letterSpacing: 2,
  },
});
