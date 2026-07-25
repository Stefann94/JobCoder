import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Platform, LayoutAnimation, UIManager, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { GlobalLoading } from '@/components/global-loading';
import { MaxContentWidth, Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

// LayoutAnimation is enabled by default in the New Architecture (Fabric)

type FileItem = { id: string; title: string; desc: string; type: 'doc' | 'exec'; xp: number; progress: number; isLocked?: boolean; tier?: 'core' | 'advanced' };
type DirectoryItem = { id: string; title: string; desc: string; icon: string; color: string; files: FileItem[] };

export default function LearnScreen() {
  const router = useRouter();
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDirId, setCurrentDirId] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      // Fetch all categories from the database
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*');
        
      if (catError) throw catError;

      // Fetch all theory modules from the database
      const { data: modulesData, error: modError } = await supabase
        .from('learning_modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (modError) throw modError;

      // Build the directory structure based on categories
      const builtDirectories: DirectoryItem[] = categoriesData.map((cat: any) => {
        const catModules = modulesData.filter((m: any) => m.category_id === cat.id);
        
        return {
          id: cat.id,
          title: cat.title,
          desc: cat.description,
          icon: cat.icon || 'folder',
          color: cat.color || Colors.dark.primary,
          files: catModules.map((m: any) => ({
            id: m.id,
            title: m.title,
            desc: m.description,
            type: m.type === 'theory' ? 'doc' : 'exec',
            xp: m.xp_reward,
            progress: 0,
            isLocked: false,
            tier: m.tier || 'core',
          }))
        };
      });

      // Keep only categories that have at least one theory file defined
      const activeDirectories = builtDirectories.filter(dir => dir.files.length > 0);
      
      setDirectories(activeDirectories);
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToDir = (id: string | null) => {
    // Smooth fade & slide animation
    LayoutAnimation.configureNext(
      LayoutAnimation.create(300, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
    setCurrentDirId(id);
  };

  const handleFilePress = (file: FileItem) => {
    if (file.isLocked) return;
    // router.push(`/lesson/${file.id}`)
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentDirId) {
          navigateToDir(null);
          return true; // Intercept hardware back
        }
        return false; // Default behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
      };
    }, [currentDirId])
  );

  const activeDir = currentDirId ? directories.find(d => d.id === currentDirId) : null;

  const coreIds = ['frontend', 'backend', 'database', 'algorithms'];
  const coreDirectories = directories.filter(dir => coreIds.includes(dir.id));
  const advancedDirectories = directories.filter(dir => !coreIds.includes(dir.id));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, activeDir && { paddingBottom: 15 }]}>
        {!activeDir ? (
          <>
            <ThemedText style={styles.title}>{'>'} KNOWLEDGE_BASE</ThemedText>
            <ThemedText style={styles.subtitle}>
              {'// root/ - Select a directory to mount.'}
            </ThemedText>
          </>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={() => navigateToDir(null)} style={{ paddingRight: 15, paddingVertical: 5 }}>
              <FontAwesome5 name="chevron-left" size={24} color={Colors.dark.primary} />
            </Pressable>
            <ThemedText style={[styles.title, { marginBottom: 0, flex: 1 }]} numberOfLines={1}>
              {activeDir.title.toUpperCase()}
            </ThemedText>
            <FontAwesome5 name={activeDir.icon as any} size={24} color={activeDir.color} style={{ marginLeft: 10 }} />
          </View>
        )}
      </View>

      {loading ? (
        <GlobalLoading message="FETCHING FILES" transparentBackground />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!activeDir ? (
            // ROOT LEVEL - SHOW DIRECTORIES
            <View style={styles.grid}>
              {coreDirectories.length > 0 && (
                <View style={styles.groupContainer}>
                  <ThemedText style={styles.groupTitle}>CORE INTERVIEW ESSENTIALS</ThemedText>
                  <View style={styles.groupDivider} />
                  <View style={styles.gridCardsContainer}>
                    {coreDirectories.map(dir => (
                      <Pressable key={dir.id} style={[styles.gridCard, { overflow: 'hidden' }]} onPress={() => navigateToDir(dir.id)}>
                        <FontAwesome5 name={dir.icon as any} size={70} color={dir.color} style={styles.gridCardWatermark} />
                        <View style={styles.gridCardIconWrapper}>
                          <FontAwesome5 name={dir.icon as any} size={20} color={dir.color} />
                        </View>
                        <View style={styles.gridCardContent}>
                          <ThemedText style={styles.gridCardTitle} numberOfLines={2}>{dir.title.toUpperCase()}</ThemedText>
                          <ThemedText style={styles.gridCardSubtitle}>[ {dir.files.length} MODULES ]</ThemedText>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {advancedDirectories.length > 0 && (
                <View style={styles.groupContainer}>
                  <ThemedText style={styles.groupTitle}>ADVANCED TOPICS</ThemedText>
                  <View style={styles.groupDivider} />
                  <View style={styles.gridCardsContainer}>
                    {advancedDirectories.map(dir => (
                      <Pressable key={dir.id} style={[styles.gridCard, { overflow: 'hidden' }]} onPress={() => navigateToDir(dir.id)}>
                        <FontAwesome5 name={dir.icon as any} size={70} color={dir.color} style={styles.gridCardWatermark} />
                        <View style={styles.gridCardIconWrapper}>
                          <FontAwesome5 name={dir.icon as any} size={20} color={dir.color} />
                        </View>
                        <View style={styles.gridCardContent}>
                          <ThemedText style={styles.gridCardTitle} numberOfLines={2}>{dir.title.toUpperCase()}</ThemedText>
                          <ThemedText style={styles.gridCardSubtitle}>[ {dir.files.length} MODULES ]</ThemedText>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            // DIRECTORY LEVEL - SHOW FILES
            <View style={styles.fileSystem}>

              <View style={[styles.activeDirHeader, { marginTop: 0 }]}>
                <ThemedText style={styles.dirDesc}>{activeDir.desc}</ThemedText>
              </View>
              
              <View style={styles.timelineContainer}>
                
                {/* CORE FUNDAMENTALS SECTION */}
                <View style={styles.tierHeaderContainer}>
                  <ThemedText style={[styles.tierHeader, { color: Colors.dark.primary }]}>[ CORE FUNDAMENTALS ]</ThemedText>
                </View>
                
                {activeDir.files.filter(f => f.tier === 'core').map((file, index, arr) => {
                  const isLast = index === arr.length - 1 && activeDir.files.filter(f => f.tier === 'advanced').length === 0;
                  const isCompleted = file.progress === 100;
                  const isLocked = file.isLocked;
                  const nodeColor = isCompleted ? Colors.dark.primary : (isLocked ? '#333' : Colors.dark.primary);

                  return (
                    <View key={file.id} style={styles.timelineItem}>
                      <View style={styles.timelineVisual}>
                        <View style={[styles.timelineNode, { borderColor: nodeColor, backgroundColor: isCompleted ? Colors.dark.primary : '#111' }]}>
                          {isCompleted ? (
                            <FontAwesome5 name="check" size={10} color="#000" />
                          ) : isLocked ? (
                            <FontAwesome5 name="lock" size={10} color="#555" />
                          ) : (
                            <View style={styles.timelineNodeInner} />
                          )}
                        </View>
                        {!isLast && <View style={[styles.timelineLine, { backgroundColor: isCompleted ? Colors.dark.primary : '#333' }]} />}
                      </View>
                      
                      <Pressable 
                        onPress={() => handleFilePress(file)}
                        style={[styles.timelineCard, isLocked && styles.timelineCardLocked, isCompleted && styles.timelineCardCompleted]}
                      >
                        <View style={styles.fileMain}>
                          <View style={styles.fileHeader}>
                            <ThemedText style={[styles.fileTitle, isLocked && styles.textLocked, isCompleted && styles.textCompleted]}>
                              {file.title}
                            </ThemedText>
                            <View style={styles.fileRight}>
                              {!isLocked && (
                                <>
                                  <ThemedText style={styles.fileXp}>+{file.xp} XP</ThemedText>
                                </>
                              )}
                            </View>
                          </View>
                          <ThemedText style={[styles.fileDesc, isLocked && styles.textLocked]}>{file.desc}</ThemedText>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}

                {/* ADVANCED CONCEPTS SECTION */}
                {activeDir.files.filter(f => f.tier === 'advanced').length > 0 && (
                  <>
                    <View style={styles.tierHeaderContainer}>
                      <ThemedText style={[styles.tierHeader, { color: '#EF4444', marginTop: 20 }]}>[ ADVANCED CONCEPTS ]</ThemedText>
                    </View>
                    
                    {activeDir.files.filter(f => f.tier === 'advanced').map((file, index, arr) => {
                      const isLast = index === arr.length - 1;
                      const isCompleted = file.progress === 100;
                      const isLocked = file.isLocked;
                      const nodeColor = isCompleted ? '#EF4444' : (isLocked ? '#333' : '#EF4444');

                      return (
                        <View key={file.id} style={styles.timelineItem}>
                          <View style={styles.timelineVisual}>
                            <View style={[styles.timelineNode, { borderColor: nodeColor, backgroundColor: isCompleted ? '#EF4444' : '#111' }]}>
                              {isCompleted ? (
                                <FontAwesome5 name="check" size={10} color="#000" />
                              ) : isLocked ? (
                                <FontAwesome5 name="lock" size={10} color="#555" />
                              ) : (
                                <View style={[styles.timelineNodeInner, { backgroundColor: '#EF4444' }]} />
                              )}
                            </View>
                            {!isLast && <View style={[styles.timelineLine, { backgroundColor: isCompleted ? '#EF4444' : '#333' }]} />}
                          </View>
                          
                          <Pressable 
                            onPress={() => handleFilePress(file)}
                            style={[styles.timelineCard, isLocked && styles.timelineCardLocked, isCompleted && { borderColor: '#EF4444' }]}
                          >
                            <View style={styles.fileMain}>
                              <View style={styles.fileHeader}>
                                <ThemedText style={[styles.fileTitle, isLocked && styles.textLocked, isCompleted && { color: '#EF4444' }]}>
                                  {file.title}
                                </ThemedText>
                                <View style={styles.fileRight}>
                                  {!isLocked && (
                                    <>
                                      <ThemedText style={[styles.fileXp, { color: '#EF4444' }]}>+{file.xp} XP</ThemedText>
                                    </>
                                  )}
                                </View>
                              </View>
                              <ThemedText style={[styles.fileDesc, isLocked && styles.textLocked]}>{file.desc}</ThemedText>
                            </View>
                          </Pressable>
                        </View>
                      );
                    })}
                  </>
                )}
                
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  scrollView: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 120, 
    flexGrow: 1 
  },
  
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 30,
    paddingBottom: 20,
    borderBottomWidth: 1, 
    borderBottomColor: '#222',
    marginBottom: 20
  },
  title: { fontFamily: 'VT323_400Regular', fontSize: 32, letterSpacing: 2, color: Colors.dark.primary, marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', fontStyle: 'italic', fontFamily: 'VT323_400Regular' },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginTop: 50
  },
  loadingText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#888'
  },

  grid: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  
  groupContainer: {
    marginBottom: 35,
    gap: 12,
  },
  groupTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.dark.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  groupDivider: {
    height: 1,
    backgroundColor: Colors.dark.primary,
    opacity: 0.3,
    marginTop: -5,
    marginBottom: 10,
  },

  gridCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  gridCardWatermark: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.08,
    transform: [{ rotate: '-15deg' }],
  },
  gridCardIconWrapper: {
    width: 38,
    height: 38,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardContent: {
    gap: 4,
  },
  gridCardTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#DDD',
    letterSpacing: 1,
    lineHeight: 20,
  },
  gridCardSubtitle: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontFamily: 'VT323_400Regular',
    letterSpacing: 1,
  },

  fileSystem: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#1a1a1a',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  backButtonText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.dark.primary,
    letterSpacing: 1,
  },

  activeDirHeader: {
    marginBottom: 30,
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeDirHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  activeDirTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 26,
    color: '#DDD',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dirDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 22,
  },
  
  timelineContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  
  tierHeaderContainer: {
    marginLeft: 32, // align with cards
    marginBottom: 15,
    marginTop: 5,
  },
  tierHeader: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  
  timelineVisual: {
    width: 40,
    alignItems: 'center',
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#333',
    marginVertical: -2,
    zIndex: 1,
  },
  
  timelineCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    marginBottom: 20,
    marginLeft: 10,
  },
  timelineCardLocked: {
    opacity: 0.6,
    borderColor: '#1a1a1a',
    backgroundColor: '#0f0f0f',
  },
  timelineCardCompleted: {
    borderColor: 'rgba(57, 255, 20, 0.3)',
    backgroundColor: 'rgba(57, 255, 20, 0.02)',
  },
  
  fileMain: {
    gap: 10,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: '#EEE',
    flex: 1,
  },
  fileDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  textLocked: {
    color: '#555',
  },
  textCompleted: {
    color: Colors.dark.primary,
  },
  
  fixedBackButtonContainer: {
    paddingHorizontal: 24,
    marginBottom: 5,
  },
  
  fileRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  fileXp: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#F59E0B',
  },
  fileProgress: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#888',
  },
});
