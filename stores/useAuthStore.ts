import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/database.types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
  updateStreak: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      logout: () => set({ user: null, error: null }),
      updateStreak: async (userId: string) => {
        try {
          const response = await fetch('/api/streak/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          const result = await response.json();

          if (response.ok && result.data) {
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  current_streak: result.data.currentStreak,
                  longest_streak: result.data.longestStreak,
                },
              });
            }
          }
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
