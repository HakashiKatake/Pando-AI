import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage, generateGuestId } from './utils';

// Main app store
export const useAppStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isGuest: true,
      guestId: null,
      guestName: '',
      
      // App state
      isOnboarded: false,
      currentStep: 'greeting',
      isDarkMode: false,
      
      // User preferences
      preferences: {
        name: '',
        communicationStyle: 'supportive',
        privacyMode: false,
        notificationsEnabled: true,
      },
      
      // Actions
      setUser: (user) => set({ user, isGuest: !user }),
      
      setGuestName: (name) => set({ guestName: name }),
      
      initializeGuest: () => {
        const existingGuestId = get().guestId;
        if (!existingGuestId) {
          set({ guestId: generateGuestId() });
        }
      },
      
      setOnboarded: (status) => set({ isOnboarded: status }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      updatePreferences: (newPreferences) => 
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        })),
      
      toggleDarkMode: () => 
        set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      resetGuestData: () => set({
        guestId: generateGuestId(),
        isOnboarded: false,
        currentStep: 'greeting',
        preferences: {
          name: '',
          communicationStyle: 'supportive',
          privacyMode: false,
          notificationsEnabled: true,
        },
      }),
      
      clearAllData: () => {
        // Clear all localStorage data
        localStorage.removeItem('calm-connect-app');
        localStorage.removeItem('calm-connect-moods');
        localStorage.removeItem('calm-connect-chat');
        localStorage.removeItem('calm-connect-journal');
        localStorage.removeItem('calm-connect-exercises');
        localStorage.removeItem('calm-connect-feedback');
        
        // Reset app state
        set({
          guestId: generateGuestId(),
          isOnboarded: false,
          currentStep: 'greeting',
          preferences: {
            name: '',
            communicationStyle: 'supportive',
            privacyMode: false,
            notificationsEnabled: true,
          },
        });
      },
    }),
    {
      name: 'calm-connect-app',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Mood tracking store
export const useMoodStore = create(
  persist(
    (set, get) => ({
      moods: [],
      todaysMood: null,
      
      addMood: (moodData) => {
        const today = new Date().toDateString();
        const existingMoodIndex = get().moods.findIndex(
          mood => new Date(mood.date).toDateString() === today
        );
        
        const newMood = {
          id: Date.now(),
          date: new Date().toISOString(),
          ...moodData,
        };
        
        set((state) => {
          const newMoods = [...state.moods];
          if (existingMoodIndex >= 0) {
            newMoods[existingMoodIndex] = newMood;
          } else {
            newMoods.push(newMood);
          }
          
          return {
            moods: newMoods,
            todaysMood: newMood,
          };
        });
      },
      
      getMoodsByDateRange: (startDate, endDate) => {
        return get().moods.filter(mood => {
          const moodDate = new Date(mood.date);
          return moodDate >= startDate && moodDate <= endDate;
        });
      },
      
      getAverageMood: (days = 7) => {
        const recentMoods = get().moods.slice(-days);
        if (recentMoods.length === 0) return 0;
        
        const sum = recentMoods.reduce((acc, mood) => acc + mood.mood, 0);
        return Math.round((sum / recentMoods.length) * 10) / 10;
      },
    }),
    {
      name: 'calm-connect-moods',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Chat store
export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      currentConversation: null,
      
      addMessage: (message) => 
        set((state) => ({
          messages: [...state.messages, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...message,
          }],
        })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      clearMessages: () => set({ messages: [] }),
      
      startNewConversation: () => set({
        currentConversation: Date.now(),
        messages: [],
      }),
      
      updateLastMessage: (updates) =>
        set((state) => {
          const messages = [...state.messages];
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              ...updates,
            };
          }
          return { messages };
        }),
    }),
    {
      name: 'calm-connect-chat',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Journal store
export const useJournalStore = create(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry) =>
        set((state) => ({
          entries: [...state.entries, {
            id: Date.now(),
            date: new Date().toISOString(),
            ...entry,
          }],
        })),
      
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),
      
      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter(entry => entry.id !== id),
        })),
      
      getEntriesByDate: (date) =>
        get().entries.filter(entry => 
          new Date(entry.date).toDateString() === new Date(date).toDateString()
        ),
    }),
    {
      name: 'calm-connect-journal',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Exercise store
export const useExerciseStore = create(
  persist(
    (set, get) => ({
      sessions: [],
      completedExercises: new Set(),
      
      addExerciseSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...session,
          }],
          completedExercises: new Set([...state.completedExercises, session.exerciseId].filter(Boolean)),
        })),
      
      getSessions: () => get().sessions,
      
      getSessionsByType: (type) =>
        get().sessions.filter(session => session.type === type),
      
      getTotalDuration: () =>
        get().sessions.reduce((total, session) => total + (session.duration || 0), 0),
      
      getCompletedCount: () => get().completedExercises.size,
      
      clearSessions: () => set({ sessions: [], completedExercises: new Set() }),
    }),
    {
      name: 'calm-connect-exercises',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Feedback store (for journal entries and feedback)
export const useFeedbackStore = create(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      
      addEntry: async (entry) => {
        set({ isLoading: true });
        try {
          const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...entry,
          };
          
          set((state) => ({
            entries: [...state.entries, newEntry],
            isLoading: false,
          }));
          
          return newEntry;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      getEntries: () => get().entries,
      
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),
      
      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter(entry => entry.id !== id),
        })),
      
      getEntriesByType: (type) =>
        get().entries.filter(entry => entry.type === type),
      
      getEntriesByDateRange: (startDate, endDate) =>
        get().entries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= startDate && entryDate <= endDate;
        }),
      
      clearEntries: () => set({ entries: [] }),
    }),
    {
      name: 'calm-connect-feedback',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
