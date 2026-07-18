import React, { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORIES } from '@/constants/questions';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  
  // Simulated user stats (portfolio style)
  const [streak] = useState(5);
  const [xp] = useState(450);
  const [completedCount] = useState(12);

  const handleStartQuiz = (categoryId: string) => {
    router.push({
      pathname: '/quiz',
      params: { category: categoryId }
    });
  };

  const handleStartMock = () => {
    router.push({
      pathname: '/quiz',
      params: { category: 'mock' }
    });
  };

  // Maps category icons to emojis for clean, reliable rendering
  const getCategoryEmoji = (id: string) => {
    switch (id) {
      case 'algorithms': return '💻';
      case 'frontend': return '🎨';
      case 'backend': return '⚙️';
      case 'system-design': return '🌐';
      case 'hr-behavioral': return '🤝';
      default: return '🚀';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Stats Bar */}
          <View style={styles.header}>
            <View>
              <ThemedText type="subtitle" style={styles.brandTitle}>JobCoder</ThemedText>
              <ThemedText type="small" style={styles.welcomeText}>Level up your career</ThemedText>
            </View>
            <View style={styles.statsContainer}>
              <ThemedView type="backgroundSelected" style={styles.statBadge}>
                <ThemedText style={styles.statText}>🔥 {streak} Days</ThemedText>
              </ThemedView>
              <ThemedView type="backgroundSelected" style={styles.statBadge}>
                <ThemedText style={styles.statText}>✨ {xp} XP</ThemedText>
              </ThemedView>
            </View>
          </View>

          {/* Quick Mock Interview Card */}
          <Pressable onPress={handleStartMock}>
            {({ pressed }) => (
              <ThemedView 
                type="backgroundElement" 
                style={[
                  styles.mockCard, 
                  pressed && styles.pressed,
                  styles.glowBorder
                ]}
              >
                <View style={styles.mockCardContent}>
                  <View style={styles.mockTextContainer}>
                    <ThemedText type="smallBold" style={styles.tagText}>RECOMMENDED</ThemedText>
                    <ThemedText type="subtitle" style={styles.mockTitle}>Quick Mock Interview</ThemedText>
                    <ThemedText type="small" style={styles.mockDescription}>
                      10 mixed random questions from all categories to test your real readiness.
                    </ThemedText>
                  </View>
                  <View style={styles.mockBadgeIcon}>
                    <ThemedText style={styles.mockIconText}>🏆</ThemedText>
                  </View>
                </View>
                
                <View style={styles.mockFooter}>
                  <ThemedText type="smallBold" style={styles.startText}>START INTERVIEW →</ThemedText>
                  <ThemedText type="small" style={styles.timeText}>~10 mins</ThemedText>
                </View>
              </ThemedView>
            )}
          </Pressable>

          {/* Section: Categories */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Practice Categories</ThemedText>
            <ThemedText type="small" style={styles.sectionSubtitle}>Select a track to build specific skills</ThemedText>
          </View>

          <View style={styles.categoryList}>
            {CATEGORIES.map((category) => (
              <Pressable 
                key={category.id} 
                onPress={() => handleStartQuiz(category.id)}
              >
                {({ pressed }) => (
                  <ThemedView 
                    type="backgroundElement" 
                    style={[styles.categoryCard, pressed && styles.pressed]}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                      <ThemedText style={styles.categoryIconEmoji}>
                        {getCategoryEmoji(category.id)}
                      </ThemedText>
                    </View>
                    <View style={styles.categoryTextContent}>
                      <View style={styles.categoryHeader}>
                        <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>
                          {category.title}
                        </ThemedText>
                        <ThemedText style={[styles.difficultyTag, { color: category.color }]}>
                          • Active
                        </ThemedText>
                      </View>
                      <ThemedText type="small" style={styles.categoryDesc}>
                        {category.description}
                      </ThemedText>
                    </View>
                  </ThemedView>
                )}
              </Pressable>
            ))}
          </View>
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
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  welcomeText: {
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBadge: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  mockCard: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  glowBorder: {
    borderColor: '#10B981', // green border highlight
  },
  mockCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mockTextContainer: {
    flex: 1,
    gap: Spacing.half,
  },
  tagText: {
    color: '#10B981',
    letterSpacing: 1,
    fontSize: 10,
  },
  mockTitle: {
    fontWeight: '700',
  },
  mockDescription: {
    opacity: 0.7,
    lineHeight: 18,
  },
  mockBadgeIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#F59E0B20',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockIconText: {
    fontSize: 32,
  },
  mockFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2E3135',
    paddingTop: Spacing.three,
  },
  startText: {
    color: '#10B981',
  },
  timeText: {
    opacity: 0.5,
  },
  sectionHeader: {
    gap: Spacing.half,
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  sectionSubtitle: {
    opacity: 0.5,
  },
  categoryList: {
    gap: Spacing.three,
  },
  categoryCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconEmoji: {
    fontSize: 22,
  },
  categoryTextContent: {
    flex: 1,
    gap: Spacing.half,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontWeight: '600',
  },
  difficultyTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryDesc: {
    opacity: 0.7,
    lineHeight: 16,
  },
});
