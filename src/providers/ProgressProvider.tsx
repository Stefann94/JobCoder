import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { fetchUserProgress, bulkUpsertUserProgress, updateUserProgress, UserProgress } from '@/lib/api';

const PROGRESS_KEY = '@jobcoder_guest_progress';

export interface CategoryProgress {
  progress_percent: number;
  completed_questions: string[];
}

export type LocalProgress = Record<string, CategoryProgress>;

interface ProgressContextType {
  progress: LocalProgress;
  updateProgress: (categoryId: string, percent: number, completedQuestions: string[]) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLoadingProgress: boolean;
}

const ProgressContext = createContext<ProgressContextType>({
  progress: {},
  updateProgress: async () => {},
  resetProgress: async () => {},
  isLoadingProgress: true,
});

export const useProgress = () => useContext(ProgressContext);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState<LocalProgress>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Funcție ajutătoare pentru a converti array-ul din Supabase într-un Record (dicționar) local
  const convertRemoteToLocal = (remoteData: UserProgress[]): LocalProgress => {
    const local: LocalProgress = {};
    remoteData.forEach(p => {
      local[p.category_id] = {
        progress_percent: p.progress_percent,
        completed_questions: p.completed_questions || [],
      };
    });
    return local;
  };

  useEffect(() => {
    if (authLoading) return;

    const loadAndSyncProgress = async () => {
      setIsLoadingProgress(true);
      try {
        const localDataStr = await AsyncStorage.getItem(PROGRESS_KEY);
        const localData: LocalProgress = localDataStr ? JSON.parse(localDataStr) : {};
        const hasLocalData = Object.keys(localData).length > 0;

        if (isAuthenticated && user) {
          // Suntem LOGAȚI -> Verificăm Cloud-ul
          const remoteData = await fetchUserProgress(user.id);
          const hasRemoteData = remoteData.length > 0;

          if (hasRemoteData && hasLocalData) {
            // CONFLICT: Există și local, și pe server!
            Alert.alert(
              'Cloud Progress Detected!',
              'We found saved progress on your account. Your current Incognito progress will be overwritten. Do you want to continue?',
              [
                {
                  text: 'Cancel (Logout)',
                  style: 'cancel',
                  onPress: async () => {
                    await supabase.auth.signOut();
                    // După logout, useEffect-ul se va re-rula pentru user = null
                  },
                },
                {
                  text: 'Load Cloud Save',
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.removeItem(PROGRESS_KEY); // Ștergem ce e local
                    setProgress(convertRemoteToLocal(remoteData));
                  },
                },
              ]
            );
          } else if (!hasRemoteData && hasLocalData) {
            // PUSH TO CLOUD: Nu are nimic pe server, dar a jucat local. Salvăm în cloud!
            const toUpsert: UserProgress[] = Object.keys(localData).map(catId => ({
              user_id: user.id,
              category_id: catId,
              progress_percent: localData[catId].progress_percent,
              completed_questions: localData[catId].completed_questions,
            }));
            await bulkUpsertUserProgress(toUpsert);
            await AsyncStorage.removeItem(PROGRESS_KEY); // Mutat în cloud, nu mai e nevoie local
            setProgress(localData);
          } else if (hasRemoteData && !hasLocalData) {
            // LOAD FROM CLOUD: Normal login behavior
            setProgress(convertRemoteToLocal(remoteData));
          } else {
            // NIMIC NICĂIERI: Cont nou, fără progres local
            setProgress({});
          }
        } else {
          // Suntem GUEST -> Încărcăm doar de pe LocalStorage
          setProgress(localData);
        }
      } catch (e) {
        console.error('Error syncing progress:', e);
      }
      setIsLoadingProgress(false);
    };

    loadAndSyncProgress();
  }, [user, isAuthenticated, authLoading]);

  const updateProgress = async (categoryId: string, percent: number, completedQuestions: string[]) => {
    // Actualizăm starea din memorie pentru UI rapid
    const newProgress = { ...progress, [categoryId]: { progress_percent: percent, completed_questions: completedQuestions } };
    setProgress(newProgress);

    if (isAuthenticated && user) {
      // Salvează în Supabase
      await updateUserProgress({
        user_id: user.id,
        category_id: categoryId,
        progress_percent: percent,
        completed_questions: completedQuestions,
      });
    } else {
      // Salvează în AsyncStorage
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    }
  };

  const resetProgress = async () => {
    setProgress({});
    if (!isAuthenticated) {
      await AsyncStorage.removeItem(PROGRESS_KEY);
    }
  };

  return (
    <ProgressContext.Provider value={{ progress, updateProgress, resetProgress, isLoadingProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}
