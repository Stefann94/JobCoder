import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, Dimensions, ActivityIndicator, Animated, BackHandler, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { ScrollView as GHScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter, useFocusEffect, useNavigation, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { addXpToProfile } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useProgress } from '@/providers/ProgressProvider';

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

const SlideItem = ({ item, index, currentIndex, scrollX, isLastSlide, onComplete }: { item: string, index: number, currentIndex: number, scrollX: Animated.Value, isLastSlide: boolean, onComplete: () => void }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const codeScrollRefs = useRef<{ [key: number]: ScrollView | null }>({});

  useEffect(() => {
    // Reset scroll when slide becomes INACTIVE (swiped away).
    // This ensures it is already at the top when the user swipes back to it.
    if (currentIndex !== index) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      Object.values(codeScrollRefs.current).forEach(ref => {
        if (ref) {
          ref.scrollTo({ x: 0, animated: false });
        }
      });
    }
  }, [currentIndex, index]);

  const rotateY = scrollX.interpolate({
    inputRange: [
      (index - 1) * width,
      (index - 0.05) * width,
      (index + 0.05) * width,
      (index + 1) * width
    ],
    outputRange: ['60deg', '0deg', '0deg', '-60deg'],
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
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {parseSlideContent(item).map((block, i) => {
            if (block.type === 'TITLE') {
              return (
                <ThemedText key={i} style={[markdownStyles.heading1, { marginBottom: 20 }]}>
                  {block.content.trim()}
                </ThemedText>
              );
            }
            if (block.type === 'SUBTITLE') {
              return <ThemedText key={i} style={markdownStyles.heading2}>{block.content}</ThemedText>;
            }
            if (block.type === 'PARAGRAPH') {
              const textParts = block.content.split('\n').filter(t => t.trim().length > 0);
              return (
                <View key={i} style={{ marginBottom: 15 }}>
                  {textParts.map((part, index) => {
                    const isBullet = part.trim().startsWith('-') || part.trim().startsWith('•');
                    const cleanText = isBullet ? part.trim().substring(1).trim() : part.trim();
                    return (
                      <View key={index} style={{ flexDirection: 'row', marginBottom: 8, paddingLeft: isBullet ? 10 : 0 }}>
                        {isBullet && <ThemedText style={[markdownStyles.body, { marginRight: 10, color: Colors.dark.primary }]}>•</ThemedText>}
                        <ThemedText style={[markdownStyles.body, { flex: 1 }]}>
                          {cleanText}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              );
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
                  <GHScrollView 
                    ref={el => codeScrollRefs.current[i] = el as any}
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ padding: 10 }}
                  >
                    <ThemedText style={markdownStyles.code_text}>
                      {block.content}
                    </ThemedText>
                    </GHScrollView>
                </View>
              );
            }
            if (block.type === 'ALERT') {
              return (
                <View key={i} style={[markdownStyles.blockquote, { flexDirection: 'row', alignItems: 'center' }]}>
                  <FontAwesome5 name="lightbulb" size={20} color={Colors.dark.primary} solid style={{ marginRight: 15 }} />
                  <ThemedText style={{ color: Colors.dark.primary, flexShrink: 1, fontFamily: 'Inter_400Regular', lineHeight: 24 }}>{block.content}</ThemedText>
                </View>
              );
            }
            return null;
          })}

          {isLastSlide && (
            <TouchableOpacity 
              style={{
                marginTop: 40,
                backgroundColor: Colors.dark.primary,
                paddingVertical: 15,
                borderRadius: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
              }}
              onPress={() => onComplete()}
            >
              <FontAwesome5 name="check-circle" size={20} color="#000" solid />
              <ThemedText style={{ color: '#000', fontFamily: 'VT323_400Regular', fontSize: 24, letterSpacing: 1 }}>FINISH & RETURN</ThemedText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Animated.View>
  );
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
  const { updateModuleProgress, progress } = useProgress();

  const [module, setModule] = useState<LessonModule | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation();
  
  const [showExitWarning, setShowExitWarning] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isExitingRef = useRef(false);

  const flatListRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  const [showTutorial, setShowTutorial] = useState(true);
  const tutorialY = useRef(new Animated.Value(0)).current;
  const tutorialX = useRef(new Animated.Value(0)).current;
  const tutorialOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showTutorial) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(tutorialY, { toValue: -80, duration: 800, useNativeDriver: true }),
          Animated.timing(tutorialOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(tutorialY, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(tutorialOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(300),

          Animated.timing(tutorialX, { toValue: -80, duration: 800, useNativeDriver: true }),
          Animated.timing(tutorialOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(tutorialX, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(tutorialOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(300),
        ])
      ).start();
    }
  }, [showTutorial]);

  useFocusEffect(
    useCallback(() => {
      if (moduleId) {
        isExitingRef.current = false;
        setShowExitWarning(false);
        setLoading(true);
        setModule(null);
        setSlides([]);
        fetchModule();
      }
    }, [moduleId])
  );

  useEffect(() => {
    if (slides.length > 0 && module) {
      const currentSlidePercent = slides.length > 1 ? Math.round((currentIndex / (slides.length - 1)) * 100) : 100;
      const historicalPercent = progress[module.category_id]?.module_progress?.[module.id] || 0;
      const displayPercent = Math.max(currentSlidePercent, historicalPercent);
      
      Animated.timing(progressAnim, {
        toValue: displayPercent,
        duration: 300, 
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        updateModuleProgress(module.category_id, module.id, currentSlidePercent);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, slides, module, progress]);

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
        const splitSlides = data.content_markdown.split('---').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        setSlides(splitSlides.length > 0 ? splitSlides : ['*No content found.*']);
        
        const percent = progress[data.category_id]?.module_progress?.[data.id] || 0;
        const slidesCount = splitSlides.length > 0 ? splitSlides.length : 1;
        let computedStartIndex = 0;
        if (percent > 0 && percent < 100) {
          computedStartIndex = Math.floor((percent / 100) * (slidesCount - 1));
        }
        
        setStartIndex(computedStartIndex);
        setCurrentIndex(computedStartIndex);
        scrollX.setValue(computedStartIndex * width);
      } else {
        setSlides(['*Module is currently empty.*']);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!module) return;
    
    // Prevent beforeRemove from triggering the abort modal
    isExitingRef.current = true;
    
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (profile?.user) {
        const wasAlreadyCompleted = progress[module.category_id]?.module_progress?.[module.id] === 100;
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        await updateModuleProgress(module.category_id, module.id, 100);
        
        if (!wasAlreadyCompleted) {
          await addXpToProfile(profile.user.id, module.xp_reward || 0);
          await refreshProfile();
        }
      }
    } catch (e) {
      console.error('Error completing lesson', e);
    }
    
    router.replace({ pathname: '/learn', params: { returnToCategory: module.category_id, returnToModule: module.id } });
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<any> }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null && newIndex !== undefined) {
        setCurrentIndex((prev) => {
          if (prev !== newIndex) {
            Haptics.selectionAsync();
            return newIndex;
          }
          return prev;
        });
      }
    }
  }).current;

  const triggerAbortModal = () => {
    if (isExitingRef.current) return;
    
    if (slides.length > 0 && currentIndex === slides.length - 1) {
      handleFinish();
      return;
    }

    setShowExitWarning(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleCancelExit = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowExitWarning(false);
    });
  };

  const handleConfirmExit = () => {
    setShowExitWarning(false);
    isExitingRef.current = true;
    
    // Explicitly save the current progress right before exiting
    // This ensures if they went backward, the lower progress is saved instantly
    if (module && slides.length > 1) {
      const targetPercent = Math.round((currentIndex / (slides.length - 1)) * 100);
      updateModuleProgress(module.category_id, module.id, targetPercent);
    }

    if (module) {
      router.replace({ pathname: '/learn', params: { returnToCategory: module.category_id, returnToModule: module.id } });
    } else {
      router.replace('/learn');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!isExitingRef.current) {
          if (slides.length > 0 && currentIndex === slides.length - 1) {
            handleFinish();
          } else {
            triggerAbortModal();
          }
        }
        return true; 
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentIndex, slides.length])
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
      <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ThemedText style={{ color: '#EF4444' }}>Error loading module.</ThemedText>
        <Pressable onPress={() => router.navigate('/learn')} style={styles.closeBtn}>
          <ThemedText>Go Back</ThemedText>
        </Pressable>
      </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  const currentSlidePercent = slides.length > 1 ? Math.round((currentIndex / (slides.length - 1)) * 100) : 100;
  const historicalPercent = progress[module.category_id]?.module_progress?.[module.id] || 0;
  const displayPercent = Math.max(currentSlidePercent, historicalPercent);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack.Screen options={{ gestureEnabled: false, headerShown: false }} />
    <SafeAreaView style={styles.container}>
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
              <ThemedText style={styles.modalTitle}>EXIT MODULE?</ThemedText>
            </View>
            <ThemedText style={styles.modalText}>
              Are you sure you want to exit? Your progress will be automatically saved.
            </ThemedText>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalBtnCancel]} onPress={handleCancelExit}>
                <ThemedText style={styles.modalBtnText}>NO, RETURN</ThemedText>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={handleConfirmExit}>
                <ThemedText style={[styles.modalBtnText, { color: '#EF4444' }]}>YES, EXIT</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Pressable 
          onPress={triggerAbortModal} 
          style={styles.closeBtn}
        >
          <FontAwesome5 name="times" size={24} color="#888" />
        </Pressable>
        
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
          <ThemedText style={styles.progressText}>{displayPercent}%</ThemedText>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <ThemedText style={styles.moduleTitle}>{module.title}</ThemedText>
      </View>

      <Animated.FlatList
        key={moduleId}
        ref={flatListRef}
        data={slides}
        keyExtractor={(item, index) => `${moduleId}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => (
          <SlideItem 
            item={item} 
            index={index} 
            currentIndex={currentIndex} 
            scrollX={scrollX} 
            isLastSlide={index === slides.length - 1}
            onComplete={handleFinish}
          />
        )}
      />

      {currentIndex < slides.length - 1 && (
        <View style={styles.footer}>
          <View style={styles.swipeHint}>
            <ThemedText style={styles.swipeText}>SWIPE TO CONTINUE</ThemedText>
            <FontAwesome5 name="chevron-right" size={14} color="#555" />
          </View>
        </View>
      )}

      <Modal visible={showTutorial} transparent={true} animationType="fade">
        <Pressable style={styles.tutorialOverlay} onPress={() => setShowTutorial(false)}>
          <View style={styles.tutorialContent}>
            <Animated.View style={{ transform: [{ translateY: tutorialY }, { translateX: tutorialX }], opacity: tutorialOpacity }}>
              <FontAwesome5 name="hand-pointer" size={60} color={Colors.dark.primary} solid />
            </Animated.View>
            <ThemedText style={styles.tutorialText}>
              Swipe Up/Down to scroll.{'\n'}Swipe Left for the next page.{'\n\n'}(Tap anywhere to close)
            </ThemedText>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBtnCancel: {
    backgroundColor: '#222',
    borderColor: '#444',
  },
  modalBtnConfirm: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  modalBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#CCC',
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
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialContent: {
    alignItems: 'center',
    gap: 30,
    padding: 30,
  },
  tutorialText: {
    fontFamily: 'VT323_400Regular',
    color: '#FFF',
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 1,
  },
});

const markdownStyles = {
  body: {
    color: '#D1D5DB', // Softer, premium gray
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
  },
  heading1: {
    fontFamily: 'VT323_400Regular',
    fontSize: 28,
    color: Colors.dark.primary,
    marginBottom: 20,
    marginTop: 0,
    textTransform: 'uppercase' as any,
    letterSpacing: 1,
  },
  heading2: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
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
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    justifyContent: 'space-between' as any,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  mac_buttons: {
    flexDirection: 'row' as any,
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
    fontSize: 10,
    textTransform: 'uppercase' as any,
  },
  code_text: {
    fontFamily: 'monospace',
    color: '#50FA7B', // Dracula Green
    fontSize: 12,
    lineHeight: 18,
  },
  code_inline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: Colors.dark.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  strong: {
    color: '#FFF',
    fontFamily: 'Inter_700Bold',
  },
  blockquote: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 15,
    borderRadius: 8,
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

