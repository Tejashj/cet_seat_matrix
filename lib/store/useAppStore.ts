import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudentInput, PredictionResult, Recommendation } from '@/lib/prediction/engine';

interface AppState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Student input
  studentInput: StudentInput | null;
  setStudentInput: (input: StudentInput) => void;

  // Predictions
  predictions: PredictionResult | null;
  setPredictions: (result: PredictionResult) => void;
  clearPredictions: () => void;

  // UI state
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Shortlist / reordering
  shortlist: Recommendation[];
  addToShortlist: (rec: Recommendation) => void;
  removeFromShortlist: (id: string) => void;
  reorderShortlist: (newOrder: Recommendation[]) => void;
  isShortlisted: (id: string) => boolean;

  // Filters & Sorting
  filterTier: 'all' | 'Dream' | 'Realistic' | 'Safe';
  setFilterTier: (tier: 'all' | 'Dream' | 'Realistic' | 'Safe') => void;
  sortBy: 'predictedCutoff' | 'collegeName' | 'confidenceScore';
  setSortBy: (sort: 'predictedCutoff' | 'collegeName' | 'confidenceScore') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),

      // Student input
      studentInput: null,
      setStudentInput: (input) => set({ studentInput: input }),

      // Predictions
      predictions: null,
      setPredictions: (result) => set({ predictions: result }),
      clearPredictions: () => set({ predictions: null }),

      // UI
      loading: false,
      setLoading: (loading) => set({ loading }),
      error: null,
      setError: (error) => set({ error }),

      // Shortlist
      shortlist: [],
      addToShortlist: (rec) => {
        const { shortlist } = get();
        if (!shortlist.find(r => r.id === rec.id)) {
          set({ shortlist: [...shortlist, { ...rec, priority: shortlist.length + 1 }] });
        }
      },
      removeFromShortlist: (id) => {
        set(s => ({
          shortlist: s.shortlist.filter(r => r.id !== id).map((r, i) => ({ ...r, priority: i + 1 })),
        }));
      },
      reorderShortlist: (newOrder) => {
        set({ shortlist: newOrder.map((r, i) => ({ ...r, priority: i + 1 })) });
      },
      isShortlisted: (id) => get().shortlist.some(r => r.id === id),

      // Filters & Sorting
      filterTier: 'all',
      setFilterTier: (tier) => set({ filterTier: tier }),
      sortBy: 'predictedCutoff',
      setSortBy: (sort) => set({ sortBy: sort }),
    }),
    {
      name: 'kcet-planner-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        studentInput: state.studentInput,
        predictions: state.predictions,
        shortlist: state.shortlist,
        filterTier: state.filterTier,
        sortBy: state.sortBy,
      }),
    }
  )
);
