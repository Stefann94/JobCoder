import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { fetchCategories, Category, fetchDailyQuests, DailyQuest, fetchBossFights, BossFight } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useProgress } from '@/providers/ProgressProvider';
import AvatarRenderer from '@/components/avatar-renderer';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const { progress } = useProgress();
  const [categories, setCategories] = useState<Category[]>([]);
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [bosses, setBosses] = useState<BossFight[]>([]);
  const [loading, setLoading] = useState(true);

  const webPadding = Platform.select({ web: { paddingTop: 80 }, default: {} });
  
  useEffect(() => {
    async function loadData() {
      const data = await fetchCategories();
      setCategories(data);
      const questsData = await fetchDailyQuests();
      setQuests(questsData);
      const bossesData = await fetchBossFights();
      setBosses(bossesData);
      setLoading(false);
    }
    loadData();
  }, []);

  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.group_name || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  const handleStartMock = () => {
    router.push({
      pathname: '/quiz',
      params: { category: 'mock' }
    });
  };

  const handleStartQuiz = (categoryId: string) => {
    router.push({
      pathname: '/quiz',
      params: { category: categoryId }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, webPadding]}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.userInfo} onPress={() => router.push('/profile')}>
              <View style={styles.avatarContainer}>
                <AvatarRenderer avatarUrl={profile?.avatar_url} size={28} />
                {!isAuthenticated && <View style={styles.notificationDot} />}
              </View>
              <View>
                <ThemedText style={styles.username}>
                  {isAuthenticated ? (profile?.username || user?.email?.split('@')[0].toUpperCase() || 'HACKER') : 'GUEST'}
                </ThemedText>
                <ThemedText style={styles.levelText}>
                  {isAuthenticated ? (profile?.title || 'Lvl 1 Hacker') : 'Not Connected (Tap to Login)'}
                </ThemedText>
              </View>
            </Pressable>
            <Pressable>
              <FontAwesome name="bell" size={22} color={Colors.dark.textSecondary} />
            </Pressable>
          </View>

          {/* Daily Quest Card */}
          {quests.length > 0 && (
            <View style={styles.questCard}>
              <FontAwesome5 name="skull" size={100} color="#333333" style={styles.questWatermark} />
              <View style={styles.questHeader}>
                <FontAwesome name="warning" size={16} color={Colors.dark.warning} />
                <ThemedText style={styles.questTitle}>{quests[0].title}</ThemedText>
              </View>
              <ThemedText style={styles.questDescription}>
                {quests[0].description}
              </ThemedText>
              
              <View style={styles.questFooter}>
                <ThemedText style={styles.questReward}>Reward: +{quests[0].xp_reward} EXP</ThemedText>
                <Pressable onPress={() => handleStartQuiz(quests[0].target_category_id || 'mock')} style={styles.questButton}>
                  <ThemedText style={styles.questButtonText}>ENTER ARENA</ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          {/* Skill Trees Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>SKILL TREES</ThemedText>
            
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
                <ThemedText style={{ marginTop: 10, fontFamily: 'VT323_400Regular', color: Colors.dark.primary }}>
                  Fetching Data from Cloud...
                </ThemedText>
              </View>
            ) : (
              Object.entries(groupedCategories).map(([groupName, groupCats]) => (
                <View key={groupName} style={{ marginBottom: Spacing.four, gap: Spacing.three }}>
                  <ThemedText style={styles.sectionSubtitle}>{groupName.toUpperCase()}</ThemedText>
                  {groupCats.map(category => {
                    const catProgress = progress[category.id]?.progress_percent || 0;
                    const catLevel = Math.floor(catProgress / 20) + 1; // 1 level per 20% progress
                    
                    return (
                      <Pressable key={category.id} onPress={() => handleStartQuiz(category.id)}>
                        {({ pressed }) => (
                          <View style={[styles.skillCard, pressed && styles.pressed]}>
                            <View style={styles.skillIconBox}>
                              <FontAwesome5 name={category.icon as any} size={20} color={category.color} />
                            </View>
                            <View style={styles.skillContent}>
                              <View style={styles.skillHeaderRow}>
                                <ThemedText style={styles.skillTitle}>{category.title}</ThemedText>
                                <ThemedText style={styles.skillLevel}>Lvl {catLevel}</ThemedText>
                              </View>
                              <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${catProgress}%` }]} />
                              </View>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={Colors.dark.textSecondary} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))
            )}
          </View>

          {/* Upcoming Boss Fights */}
          {bosses.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: Colors.dark.danger }]}>
                UPCOMING BOSS FIGHTS
              </ThemedText>
              
              {bosses.map((boss) => (
                <Pressable key={boss.id} onPress={() => handleStartQuiz(boss.category_id)}>
                  {({ pressed }) => (
                    <View style={[styles.bossCard, pressed && styles.pressed]}>
                      <View style={styles.bossIconBox}>
                        <ThemedText style={styles.bossIconText}>{boss.title.charAt(0)}</ThemedText>
                      </View>
                      <View style={styles.bossContent}>
                        <ThemedText style={styles.bossTitle}>{boss.title}</ThemedText>
                        <ThemedText style={styles.bossSubtitle}>{boss.company_name}</ThemedText>
                      </View>
                      <ThemedText style={styles.bossDangerText}>DANGER</ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: 100, // Make room for floating code button
    gap: Spacing.five,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.danger,
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  username: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.primary,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  levelText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  
  // Quest Card
  questCard: {
    backgroundColor: '#1C1C1C',
    borderWidth: 2,
    borderColor: '#2A4A33', // Subtle green border
    padding: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
  },
  questWatermark: {
    position: 'absolute',
    right: -10,
    top: 10,
    opacity: 0.3,
    transform: [{ rotate: '15deg' }],
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  questTitle: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.warning,
    fontSize: 24,
    letterSpacing: 2,
  },
  questDescription: {
    fontSize: 15,
    color: '#DDDDDD',
    marginBottom: Spacing.four,
    maxWidth: '80%',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  questReward: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  questButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  questButtonText: {
    fontFamily: 'VT323_400Regular',
    color: '#000000',
    fontSize: 18,
    letterSpacing: 1,
  },

  // Sections
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: 'VT323_400Regular',
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 2,
    marginBottom: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: Spacing.two,
  },
  sectionSubtitle: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.textSecondary,
    fontSize: 18,
    letterSpacing: 1,
  },

  // Skill Trees
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  skillIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  skillContent: {
    flex: 1,
    gap: 6,
  },
  skillHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  skillLevel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    // Note: React Native doesn't support diagonal stripes natively without SVGs,
    // so we use a solid neon green which fits the retro vibe well.
  },

  // Boss Fights
  bossCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#3A1A1A',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  bossIconBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.dark.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bossIconText: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.danger,
    fontSize: 24,
  },
  bossContent: {
    flex: 1,
    gap: 4,
  },
  bossTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  bossSubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  bossDangerText: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.danger,
    fontSize: 20,
    letterSpacing: 2,
  },
});
