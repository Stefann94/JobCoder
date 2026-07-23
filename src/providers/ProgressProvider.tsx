import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { fetchUserProgress, updateUserProgress, UserProgress } from '@/lib/api';

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

    const loadCloudProgress = async () => {
      setIsLoadingProgress(true);
      try {
        if (isAuthenticated && user) {
          // Suntem LOGAȚI -> Verificăm exclusiv Cloud-ul
          const remoteData = await fetchUserProgress(user.id);
          setProgress(convertRemoteToLocal(remoteData));
        } else {
          // GUEST -> Nimic de făcut, Auth block se ocupă de navigare
          setProgress({});
        }
      } catch (e) {
        console.error('Error syncing progress:', e);
      }
      setIsLoadingProgress(false);
    };

    loadCloudProgress();
  }, [user, isAuthenticated, authLoading]);

  const updateProgress = async (categoryId: string, percent: number, completedQuestions: string[]) => {
    // Actualizăm starea din memorie pentru UI rapid
    const newProgress = { ...progress, [categoryId]: { progress_percent: percent, completed_questions: completedQuestions } };
    setProgress(newProgress);

    if (isAuthenticated && user) {
      // Salvează direct în Supabase (cloud-only)
      await updateUserProgress({
        user_id: user.id,
        category_id: categoryId,
        progress_percent: percent,
        completed_questions: completedQuestions,
      });
    }
  };

  const resetProgress = async () => {
    setProgress({});
  };

  return (
    <ProgressContext.Provider value={{ progress, updateProgress, resetProgress, isLoadingProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}
