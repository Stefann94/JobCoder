import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, Dimensions, ActivityIndicator, Animated, BackHandler, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { addXpToProfile } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const { width } = Dimensions.get('window');

type Block = {
  type: string;
  content: string;
  language?: string;
};

const parseSlideContent = (text: string): Block[] => {
  const blocks: Block[] = [];
  const regex = /\[(TITLE|SUBTITLE|PARAGRAPH|ALERT|CODE-[a-z]+)\]([\s\S]*?)(?=\[(?:TITLE|SUBTITLE|PARAGRAPH|ALERT|CODE-[a-z]+)\]|$)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    let type = match[1];
    let content = match[2].trim();
    let language = 'javascript';
    
    if (type.startsWith('CODE-')) {
      language = type.split('-')[1];
      type = 'CODE';
      if (content.endsWith('[/CODE]')) {
        content = content.substring(0, content.length - 7).trim();
      }
    }
    
    blocks.push({ type, content, language });
  }
  
  return blocks;
};

type LessonModule = {
  id: string;
  title: string;
  content_markdown: string | null;
  xp_reward: number;
  category_id: string;
};

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const moduleId = params.id as string;
  const { refreshProfile } = useAuth();

  const [module, setModule] = useState<LessonModule | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [maxProgressReached, setMaxProgressReached] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  // Update animated progress bar when currentIndex changes
  useEffect(() => {
    if (slides.length > 0) {
      const targetPercent = slides.length > 1 ? Math.round((currentIndex / (slides.length - 1)) * 100) : 100;
      
      Animated.timing(progressAnim, {
        toValue: targetPercent,
        duration: 300, // Smooth transition
        useNativeDriver: false, // width interpolation doesn't support native driver
      }).start();

      // Only save if it's a new high score for progress to prevent unnecessary DB spam
      if (targetPercent > maxProgressReached) {
        setMaxProgressReached(targetPercent);
        saveProgress(targetPercent);
      }
    }
  }, [currentIndex, slides]);

  const fetchModule = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('id, title, content_markdown, xp_reward, category_id')
        .eq('id', moduleId)
        .single();

      if (error) throw error;
      
      setModule(data);
      if (data.content_markdown) {
        // Split by --- delimiter for slides
        const splitSlides = data.content_markdown.split('---').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        setSlides(splitSlides.length > 0 ? splitSlides : ['*No content found.*']);
      } else {
        setSlides(['*Module is currently empty.*']);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const saveProgress = async (percent: number) => {
    if (!module) return;
    
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (profile?.user) {
        // Fetch current progress object
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('module_progress')
          .eq('user_id', profile.user.id)
          .eq('category_id', module.category_id)
          .single();
          
        let modProgress = progressData?.module_progress || {};
        const currentSaved = modProgress[module.id] || 0;

        if (percent > currentSaved) {
          modProgress[module.id] = percent;
          
          await supabase
            .from('user_progress')
            .upsert({
              user_id: profile.user.id,
              category_id: module.category_id,
              module_progress: modProgress
            }, { onConflict: 'user_id, category_id' });
            
          // If first time reaching 100%, grant exactly 20 XP as requested
          if (percent === 100 && currentSaved < 100) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await addXpToProfile(profile.user.id, 20);
            await refreshProfile();
          }
        }
      }
    } catch (e) {
      console.error('Error saving live progress', e);
    }
  };

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      Haptics.selectionAsync();
    }
  };

  // Intercept hardware back button (Android / iOS gestures)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (module) {
          router.navigate({ pathname: '/learn', params: { returnToCategory: module.category_id, returnToModule: module.id } });
        } else {
          router.navigate('/learn');
        }
        return true; // Return true stops default back behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [module, router])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </SafeAreaView>
    );
  }

  if (!module) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText style={{ color: '#EF4444' }}>Error loading module.</ThemedText>
        <Pressable onPress={() => router.navigate('/learn')} style={styles.closeBtn}>
          <ThemedText>Go Back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const progressPercent = slides.length > 1 ? Math.round((currentIndex / (slides.length - 1)) * 100) : 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            if (module) {
              router.navigate({ pathname: '/learn', params: { returnToCategory: module.category_id, returnToModule: module.id } });
            } else {
              router.navigate('/learn');
            }
          }} 
          style={styles.closeBtn}
        >
          <FontAwesome5 name="times" size={24} color="#888" />
        </Pressable>
        
        {/* Progress Bar Container */}
        <View style={styles.progressWrapper}>
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressSegment, 
                { 
                  backgroundColor: Colors.dark.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>{progressPercent}%</ThemedText>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText style={styles.moduleTitle}>{module.title}</ThemedText>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

          const rotateY = scrollX.interpolate({
            inputRange,
            outputRange: ['60deg', '0deg', '-60deg'],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange: [(index - 0.5) * width, index * width, (index + 0.5) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View 
              style={[
                styles.slideContainer,
                { 
                  opacity,
                  transform: [
                    { perspective: 1000 },
                    { rotateY }
                  ]
                }
              ]}
            >
              <View style={styles.slideCard}>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {parseSlideContent(item).map((block, i) => {
                    if (block.type === 'TITLE') {
                      return <ThemedText key={i} style={markdownStyles.heading1}>{block.content}</ThemedText>;
                    }
                    if (block.type === 'SUBTITLE') {
                      return <ThemedText key={i} style={markdownStyles.heading2}>{block.content}</ThemedText>;
                    }
                    if (block.type === 'PARAGRAPH') {
                      return <ThemedText key={i} style={markdownStyles.body}>{block.content}</ThemedText>;
                    }
                    if (block.type === 'CODE') {
                      return (
                        <View key={i} style={markdownStyles.code_block_wrapper}>
                          <View style={markdownStyles.code_header}>
                            <View style={markdownStyles.mac_buttons}>
                              <View style={[markdownStyles.mac_btn, { backgroundColor: '#FF5F56' }]} />
                              <View style={[markdownStyles.mac_btn, { backgroundColor: '#FFBD2E' }]} />
                              <View style={[markdownStyles.mac_btn, { backgroundColor: '#27C93F' }]} />
                            </View>
                            <ThemedText style={markdownStyles.code_lang}>{block.language}</ThemedText>
                          </View>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 15 }}>
                            <ThemedText style={markdownStyles.code_text}>
                              {block.content}
                            </ThemedText>
                          </ScrollView>
                        </View>
                      );
                    }
                    if (block.type === 'ALERT') {
                      return (
                        <View key={i} style={markdownStyles.blockquote}>
                          <ThemedText style={{ color: Colors.dark.primary }}>{block.content}</ThemedText>
                        </View>
                      );
                    }
                    return null;
                  })}
                </ScrollView>
              </View>
            </Animated.View>
          );
        }}
      />

      {/* Footer Controls (Hint only) */}
      {currentIndex < slides.length - 1 && (
        <View style={styles.footer}>
          <View style={styles.swipeHint}>
            <ThemedText style={styles.swipeText}>SWIPE TO CONTINUE</ThemedText>
            <FontAwesome5 name="chevron-right" size={14} color="#555" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    gap: 15,
  },
  closeBtn: {
    padding: 5,
  },
  progressWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#888',
    width: 32,
    textAlign: 'right',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  moduleTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: Colors.dark.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  slideContainer: {
    width: width,
    height: '100%',
    paddingHorizontal: 20,
  },
  slideCard: {
    flex: 1,
    backgroundColor: 'rgba(20,20,20,0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.6,
  },
  swipeText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#888',
    letterSpacing: 2,
  },
  completeBtn: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  completeBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.dark.primary,
    letterSpacing: 2,
  },
  completeBtnXp: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#F59E0B',
  },
});

const markdownStyles = {
  body: {
    color: '#E0E0E0',
    fontSize: 17,
    lineHeight: 26,
    fontFamily: 'sans-serif',
  },
  heading1: {
    fontFamily: 'VT323_400Regular',
    fontSize: 34,
    color: Colors.dark.primary,
    marginBottom: 20,
    marginTop: 0,
    textTransform: 'uppercase' as any,
    letterSpacing: 1,
  },
  heading2: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: '#FFF',
    marginBottom: 15,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(57, 255, 20, 0.2)',
    paddingBottom: 5,
  },
  paragraph: {
    marginBottom: 15,
  },
  code_block_wrapper: {
    marginVertical: 15,
    borderRadius: 8,
    overflow: 'hidden' as any,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#0F0F0F',
  },
  code_header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  mac_buttons: {
    flexDirection: 'row',
    gap: 6,
  },
  mac_btn: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  code_lang: {
    fontFamily: 'monospace',
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase' as any,
  },
  code_text: {
    fontFamily: 'monospace',
    color: '#50FA7B', // Dracula Green
    fontSize: 14,
    lineHeight: 22,
  },
  code_inline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: Colors.dark.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 15,
  },
  strong: {
    color: '#FFF',
    fontWeight: 'bold' as any,
  },
  blockquote: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 15,
    borderRadius: 4,
  },
  list_item: {
    marginBottom: 10,
    flexDirection: 'row' as any,
  },
  bullet_list_icon: {
    color: Colors.dark.primary,
    fontSize: 20,
    marginRight: 10,
  }
};

