import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage, generateGuestId, shouldUseLocalStorage } from './utils';

// Simple persistence for habit store
const createHabitPersist = (name) => (config) => {
  return persist(config, {
    name,
    storage: createJSONStorage(() => localStorage),
    // Always persist to localStorage for now (can be enhanced later for authenticated users)
    partialize: (state) => ({
      habits: state.habits,
      completions: state.completions,
      quests: state.quests,
      questCompletions: state.questCompletions,
    })
  });
};

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
      setUser: (user) => {
        const isGuest = !user;
        set({ user, isGuest });
        
        // If user is signing in (was guest, now authenticated)
        if (!isGuest && get().isGuest) {
          // Clear the persistence for data stores since user is now authenticated
          if (typeof window !== 'undefined') {
            localStorage.removeItem('calm-connect-moods');
            localStorage.removeItem('calm-connect-chat');
            localStorage.removeItem('calm-connect-journal');
            localStorage.removeItem('calm-connect-exercises');
            localStorage.removeItem('calm-connect-feedback');
          }
        }
      },
      
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
          user: null,
          isGuest: true,
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

// Mood tracking store - will load from DB for authenticated users
export const useMoodStore = create((set, get) => ({
  moods: [],
  todaysMood: null,
  isLoading: false,
  
  // Load moods from API for authenticated users
  loadMoodsFromAPI: async (userId, guestId) => {
    if (!userId && !guestId) return;
    
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (userId) {
        // For authenticated users, userId will be handled by Clerk auth in the API
      } else {
        params.append('guestId', guestId);
      }
      
      const response = await fetch(`/api/mood?${params}`);
      if (response.ok) {
        const result = await response.json();
        const moods = result.success ? result.data : (Array.isArray(result) ? result : []);
        const today = new Date().toDateString();
        const todaysMood = moods.find(mood => 
          new Date(mood.date).toDateString() === today
        );
        
        set({ moods, todaysMood, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load moods:', error);
      set({ isLoading: false });
    }
  },
  
  addMood: async (moodData, userId, guestId) => {
    // For authenticated users, save to database
    if (userId) {
      try {
        const response = await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moodData),
        });
        
        if (response.ok) {
          // Reload from database
          get().loadMoodsFromAPI(userId, guestId);
        }
      } catch (error) {
        console.error('Failed to save mood:', error);
      }
    } else {
      // For guests, use local storage
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
        
        // Save to localStorage for guests
        if (guestId) {
          localStorage.setItem('calm-connect-moods', JSON.stringify(newMoods));
        }
        
        return {
          moods: newMoods,
          todaysMood: newMood,
        };
      });
    }
  },
  
  // Load from localStorage for guests
  loadFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('calm-connect-moods');
      if (stored) {
        const moods = JSON.parse(stored);
        const today = new Date().toDateString();
        const todaysMood = moods.find(mood => 
          new Date(mood.date).toDateString() === today
        );
        set({ moods, todaysMood });
      }
    }
  },
  
  getMoodsByDateRange: (startDate, endDate) => {
    return get().moods.filter(mood => {
      const moodDate = new Date(mood.date);
      return moodDate >= startDate && moodDate <= endDate;
    });
  },
  
  getAverageMood: (days = 7) => {
    const moods = get().moods;
    if (!Array.isArray(moods) || moods.length === 0) return 0;
    
    const recentMoods = moods.slice(-days);
    if (recentMoods.length === 0) return 0;
    
    const sum = recentMoods.reduce((acc, mood) => acc + mood.mood, 0);
    return Math.round((sum / recentMoods.length) * 10) / 10;
  },
  
  clearData: () => set({ moods: [], todaysMood: null }),
}));

// Chat store - similar pattern for authenticated vs guest users
export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  currentConversationId: null,
  
  loadMessagesFromAPI: async (userId, guestId, conversationId) => {
    if (!userId && !guestId) return;
    
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (guestId) params.append('guestId', guestId);
      if (conversationId) params.append('conversationId', conversationId);
      
      const response = await fetch(`/api/chat?${params}`);
      if (response.ok) {
        const result = await response.json();
        const rawMessages = result.success && result.data ? result.data.messages : (Array.isArray(result) ? result : []);
        // Ensure all messages have proper ID format
        const messages = rawMessages.map(msg => ({
          ...msg,
          id: msg._id || msg.id || Date.now() + Math.random()
        }));
        set({ messages, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ isLoading: false });
    }
  },
  
  addMessage: async (messageData, userId, guestId) => {
    // For authenticated users, save to database
    if (userId) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...messageData, guestId }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Add both user and assistant messages from server response
            const userMessage = { 
              ...result.data.userMessage, 
              id: result.data.userMessage._id || result.data.userMessage.id,
              role: 'user' // Ensure role is correct
            };
            const assistantMessage = result.data.assistantMessage ? {
              ...result.data.assistantMessage, 
              id: result.data.assistantMessage._id || result.data.assistantMessage.id,
              role: 'assistant' // Ensure role is correct
            } : null;
            
            set(state => ({
              messages: [...state.messages, userMessage, ...(assistantMessage ? [assistantMessage] : [])]
            }));
          }
        }
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    } else {
      // For guests, save to localStorage
      const tempMessage = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...messageData,
      };
      
      set(state => ({
        messages: [...state.messages, tempMessage]
      }));
      
      const messages = [...get().messages];
      localStorage.setItem('calm-connect-chat', JSON.stringify(messages));
    }
  },
  
  loadFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('calm-connect-chat');
      if (stored) {
        const messages = JSON.parse(stored);
        set({ messages });
      }
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  startNewConversation: () => set({
    messages: [],
    currentConversationId: Date.now().toString()
  }),
  
  clearData: () => set({ messages: [], currentConversationId: null }),
}));

// Feedback store
export const useFeedbackStore = create((set, get) => ({
  entries: [],
  isLoading: false,
  
  loadEntriesFromAPI: async (userId, guestId) => {
    if (!userId && !guestId) return;
    
    if (userId) {
      // For authenticated users, load from database
      set({ isLoading: true });
      try {
        const params = new URLSearchParams();
        if (guestId) params.append('guestId', guestId);
        
        const response = await fetch(`/api/feedback?${params}`);
        if (response.ok) {
          const result = await response.json();
          const entries = result.success ? result.data : (Array.isArray(result) ? result : []);
          set({ entries, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to load feedback entries:', error);
        set({ isLoading: false });
      }
    } else {
      // For guest users, load from localStorage
      get().loadFromLocalStorage();
    }
  },
  
  addEntry: async (entryData, userId, guestId) => {
    console.log('addEntry called with:', { entryData, userId, guestId });
    
    if (userId) {
      // For authenticated users, save to database
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...entryData, guestId }),
        });
        
        if (response.ok) {
          // Reload from database
          get().loadEntriesFromAPI(userId, guestId);
        }
      } catch (error) {
        console.error('Failed to save feedback entry:', error);
      }
    } else {
      // For guests, use local storage
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        ...entryData,
      };
      
      console.log('Adding entry for guest:', newEntry);
      
      set(state => {
        const newEntries = [...state.entries, newEntry];
        console.log('New entries array:', newEntries);
        
        // Save to localStorage for guests
        if (guestId) {
          localStorage.setItem('calm-connect-feedback', JSON.stringify(newEntries));
          console.log('Saved to localStorage:', newEntries);
        }
        
        return { entries: newEntries };
      });
    }
  },
  
  loadFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('calm-connect-feedback');
      console.log('Loading feedback from localStorage:', stored);
      if (stored) {
        const entries = JSON.parse(stored);
        console.log('Parsed feedback entries:', entries);
        set({ entries });
      }
    }
  },
  
  getEntries: (filters = {}) => {
    const { entries } = get();
    return entries.filter(entry => {
      if (filters.type && entry.type !== filters.type) return false;
      if (filters.category && entry.category !== filters.category) return false;
      return true;
    });
  },
  
  clearData: () => set({ entries: [] }),
}));

// Exercise store
export const useExerciseStore = create((set, get) => ({
  sessions: [],
  isLoading: false,
  
  loadSessionsFromAPI: async (userId, guestId) => {
    if (!userId && !guestId) return;
    
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (guestId) params.append('guestId', guestId);
      
      const response = await fetch(`/api/exercises?${params}`);
      if (response.ok) {
        const result = await response.json();
        const sessions = result.success ? result.data : (Array.isArray(result) ? result : []);
        set({ sessions, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load exercise sessions:', error);
      set({ isLoading: false });
    }
  },
  
  addSession: async (sessionData, userId, guestId) => {
    const newSession = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...sessionData,
    };

    if (userId) {
      // For authenticated users, save to database
      try {
        const response = await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...sessionData, guestId }),
        });
        
        if (response.ok) {
          // Add to local state immediately for UI responsiveness
          set(state => ({ sessions: [...state.sessions, newSession] }));
          // Then reload from database to ensure consistency
          get().loadSessionsFromAPI(userId, guestId);
        } else {
          console.error('Failed to save exercise session to database');
        }
      } catch (error) {
        console.error('Failed to save exercise session:', error);
      }
    } else {
      // For guests, use local storage
      set(state => {
        const newSessions = [...state.sessions, newSession];
        
        // Save to localStorage for guests
        if (guestId) {
          localStorage.setItem('calm-connect-exercises', JSON.stringify(newSessions));
        }
        
        return { sessions: newSessions };
      });
    }
  },
  
  loadFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('calm-connect-exercises');
      if (stored) {
        const sessions = JSON.parse(stored);
        set({ sessions });
      }
    }
  },
  
  getSessionsByType: (exerciseType) => {
    return get().sessions.filter(session => session.exerciseType === exerciseType);
  },
  
  getTotalDuration: () => {
    return get().sessions.reduce((total, session) => total + (session.duration || 0), 0);
  },
  
  clearData: () => set({ sessions: [] }),
}));

// Habit tracking store
export const useHabitStore = create(
  createHabitPersist('calm-connect-habits')(
    (set, get) => ({
      habits: [],
      completions: {}, // { habitId: { date: completed } }
      quests: {}, // { date: { questId: quest } }
      questCompletions: {}, // { questId-date: completed }
      
      // Actions
      addHabit: async (habit) => {
        const { user, isGuest, guestId } = useAppStore.getState();
        const userId = user?.id;
        
        const newHabit = {
          id: Date.now().toString(),
          ...habit,
          createdAt: new Date().toISOString(),
          userId: isGuest ? guestId : userId,
        };
        
        // Always update the store state first for immediate UI feedback
        set(state => {
          const currentHabits = Array.isArray(state.habits) ? state.habits : [];
          return { habits: [...currentHabits, newHabit] };
        });
        
        if (!isGuest && userId) {
          try {
            const response = await fetch('/api/habits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newHabit),
            });
            
            if (response.ok) {
              const savedHabit = await response.json();
              // Update with server response if different
              if (savedHabit.id !== newHabit.id) {
                set(state => {
                  const currentHabits = Array.isArray(state.habits) ? state.habits : [];
                  return { 
                    habits: currentHabits.map(h => h.id === newHabit.id ? savedHabit : h)
                  };
                });
              }
              return savedHabit;
            } else {
              console.warn('Failed to save habit to database, keeping local state');
              return newHabit;
            }
          } catch (error) {
            console.error('Failed to save habit to database:', error);
            return newHabit;
          }
        } else {
          // For guests, the persistence middleware will handle localStorage automatically
          return newHabit;
        }
      },
      
      // Helper method to safely get habits array
      getHabits: () => {
        const habits = get().habits;
        return Array.isArray(habits) ? habits : [];
      },
      
      updateHabit: async (habitId, updates) => {
        const { user, isGuest } = useAppStore.getState();
        const userId = user?.id;
        
        if (!isGuest && userId) {
          try {
            const response = await fetch(`/api/habits/${habitId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            });
            
            if (response.ok) {
              const updatedHabit = await response.json();
              set(state => {
                const currentHabits = Array.isArray(state.habits) ? state.habits : [];
                return {
                  habits: currentHabits.map(h => h.id === habitId ? updatedHabit : h)
                };
              });
            }
          } catch (error) {
            console.error('Failed to update habit in database:', error);
          }
        } else {
          // For guests, update state (persistence middleware handles localStorage)
          set(state => {
            const currentHabits = Array.isArray(state.habits) ? state.habits : [];
            return {
              habits: currentHabits.map(h => 
                h.id === habitId ? { ...h, ...updates } : h
              )
            };
          });
        }
      },
      
      deleteHabit: async (habitId) => {
        const { user, isGuest } = useAppStore.getState();
        const userId = user?.id;
        
        if (!isGuest && userId) {
          try {
            const response = await fetch(`/api/habits/${habitId}`, {
              method: 'DELETE',
            });
            
            if (response.ok) {
              set(state => {
                const currentHabits = Array.isArray(state.habits) ? state.habits : [];
                return {
                  habits: currentHabits.filter(h => h.id !== habitId),
                  completions: Object.fromEntries(
                    Object.entries(state.completions || {}).filter(([key]) => !key.startsWith(habitId))
                  )
                };
              });
            }
          } catch (error) {
            console.error('Failed to delete habit from database:', error);
          }
        } else {
          // For guests, update state (persistence middleware handles localStorage)
          set(state => {
            const currentHabits = Array.isArray(state.habits) ? state.habits : [];
            return {
              habits: currentHabits.filter(h => h.id !== habitId),
              completions: Object.fromEntries(
                Object.entries(state.completions || {}).filter(([key]) => !key.startsWith(habitId))
              )
            };
          });
        }
      },
      
      toggleHabitCompletion: async (habitId, date = null) => {
        const appState = useAppStore.getState();
        const { user, isGuest, guestId } = appState;
        
        // Ensure we have a valid guest ID if we're in guest mode
        if (isGuest && !guestId) {
          console.warn('No guest ID found, initializing guest...');
          useAppStore.getState().initializeGuest();
          // Get the updated state after initialization
          const updatedAppState = useAppStore.getState();
          if (!updatedAppState.guestId) {
            console.error('Failed to initialize guest ID');
            return;
          }
        }
        
        const userId = user?.id;
        const targetDate = date || new Date().toISOString().split('T')[0];
        const completionKey = `${habitId}-${targetDate}`;
        
        const currentCompletions = get().completions || {};
        const newCompletionStatus = !currentCompletions[completionKey];
        
        const newCompletion = {
          habitId,
          date: targetDate,
          completed: newCompletionStatus,
          timestamp: new Date().toISOString(),
          userId: isGuest ? (guestId || useAppStore.getState().guestId) : userId,
        };
        
        // Update state immediately for UI responsiveness
        set(state => ({
          completions: {
            ...state.completions,
            [completionKey]: newCompletionStatus
          }
        }));
        
        // Force persist the state change
        if (typeof window !== 'undefined') {
          const stateToStore = {
            habits: get().habits,
            completions: {
              ...get().completions,
              [completionKey]: newCompletionStatus
            },
            quests: get().quests,
            questCompletions: get().questCompletions,
          };
          localStorage.setItem('calm-connect-habits', JSON.stringify({ state: stateToStore }));
        }
        
        if (!isGuest && userId) {
          try {
            const response = await fetch('/api/habit-completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newCompletion),
            });
            
            if (!response.ok) {
              console.warn('Failed to save habit completion to database, keeping local state');
              // Don't revert on error for now, keep local state
            }
          } catch (error) {
            console.error('Failed to save habit completion to database:', error);
            // Don't revert on error for now, keep local state
          }
        }
        // For guests, the persistence middleware handles localStorage automatically
        
        // Update quest progress after habit completion
        get().updateQuestProgress();
      },
      
      loadHabitsFromAPI: async (userId, guestId) => {
        if (!userId && !guestId) return;
        
        try {
          const response = await fetch(`/api/habits?userId=${userId || guestId}`);
          if (response.ok) {
            const { habits, completions } = await response.json();
            const habitsArray = Array.isArray(habits) ? habits : [];
            set({ habits: habitsArray, completions: completions || {} });
          }
        } catch (error) {
          console.error('Failed to load habits from API:', error);
          // Fallback to local storage for guests
          if (guestId) {
            get().loadFromLocalStorage();
          }
        }
      },
      
      loadFromLocalStorage: () => {
        // With persistence middleware, this is handled automatically
        // This method is kept for compatibility but does nothing
      },
      
      getHabitStreak: (habitId) => {
        const completions = get().completions || {};
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const completionKey = `${habitId}-${dateStr}`;
          
          if (completions[completionKey]) {
            streak++;
          } else if (i > 0) {
            // If today isn't completed, don't break the streak yet
            break;
          }
        }
        
        return streak;
      },
      
      getHabitCompletionRate: (habitId, days = 30) => {
        const completions = get().completions || {};
        const today = new Date();
        let completed = 0;
        
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const completionKey = `${habitId}-${dateStr}`;
          
          if (completions[completionKey]) {
            completed++;
          }
        }
        
        return Math.round((completed / days) * 100);
      },
      
      getTodaysHabits: () => {
        const habits = get().getHabits();
        const completions = get().completions || {};
        const today = new Date().toISOString().split('T')[0];
        
        return habits.map(habit => ({
          ...habit,
          completed: completions[`${habit.id}-${today}`] || false,
          streak: get().getHabitStreak(habit.id),
          completionRate: get().getHabitCompletionRate(habit.id, 7)
        }));
      },
      
      // Quest methods
      generateDailyQuests: (date = null) => {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const habits = get().getHabits();
        const existingQuests = get().quests[targetDate];
        
        if (existingQuests && Object.keys(existingQuests).length > 0) {
          return existingQuests;
        }
        
        const questTemplates = [
          { type: 'streak', title: 'Maintain Your Streak', description: 'Keep your longest habit streak going', points: 20 },
          { type: 'complete_all', title: 'Perfect Day', description: 'Complete all your habits today', points: 50 },
          { type: 'early_bird', title: 'Early Bird', description: 'Complete 3 habits before noon', points: 25 },
          { type: 'consistency', title: 'Stay Consistent', description: 'Complete the same habit 3 days in a row', points: 30 },
          { type: 'habit_combo', title: 'Habit Combo', description: 'Complete any 5 habits today', points: 35 },
          { type: 'weekend_warrior', title: 'Weekend Warrior', description: 'Complete all habits on weekend', points: 40 },
        ];
        
        // Generate 3 random quests for the day
        const dailyQuests = {};
        const selectedTemplates = questTemplates.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        selectedTemplates.forEach((template, index) => {
          const questId = `${targetDate}-quest-${index}`;
          dailyQuests[questId] = {
            id: questId,
            ...template,
            date: targetDate,
            completed: false,
            progress: 0,
            target: template.type === 'complete_all' ? habits.length : 
                    template.type === 'early_bird' ? 3 :
                    template.type === 'habit_combo' ? 5 : 1
          };
        });
        
        set(state => ({
          quests: {
            ...state.quests,
            [targetDate]: dailyQuests
          }
        }));
        
        return dailyQuests;
      },
      
      updateQuestProgress: (date = null) => {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const quests = get().quests[targetDate];
        const completions = get().completions || {};
        const habits = get().getHabits();
        
        if (!quests) return;
        
        const updatedQuests = { ...quests };
        const currentHour = new Date().getHours();
        
        Object.values(updatedQuests).forEach(quest => {
          let progress = 0;
          let completed = false;
          
          switch (quest.type) {
            case 'complete_all':
              progress = habits.filter(h => completions[`${h.id}-${targetDate}`]).length;
              completed = progress === habits.length && habits.length > 0;
              break;
              
            case 'early_bird':
              // Check if 3 habits completed before noon
              const earlyCompletions = habits.filter(h => {
                const completion = completions[`${h.id}-${targetDate}`];
                return completion && currentHour < 12;
              }).length;
              progress = Math.min(earlyCompletions, 3);
              completed = progress >= 3;
              break;
              
            case 'habit_combo':
              progress = habits.filter(h => completions[`${h.id}-${targetDate}`]).length;
              completed = progress >= 5;
              break;
              
            case 'streak':
              const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => get().getHabitStreak(h.id)), 0) : 0;
              progress = maxStreak > 0 ? 1 : 0;
              completed = maxStreak > 0;
              break;
              
            case 'consistency':
              // Check if any habit completed 3 days in a row
              const threeRowCheck = habits.length > 0 && habits.some(habit => {
                let consecutive = 0;
                for (let i = 0; i < 3; i++) {
                  const checkDate = new Date();
                  checkDate.setDate(checkDate.getDate() - i);
                  const dateStr = checkDate.toISOString().split('T')[0];
                  if (completions[`${habit.id}-${dateStr}`]) {
                    consecutive++;
                  } else {
                    break;
                  }
                }
                return consecutive >= 3;
              });
              progress = threeRowCheck ? 1 : 0;
              completed = threeRowCheck;
              break;
              
            case 'weekend_warrior':
              const isWeekend = new Date(targetDate).getDay() === 0 || new Date(targetDate).getDay() === 6;
              if (isWeekend) {
                progress = habits.filter(h => completions[`${h.id}-${targetDate}`]).length;
                completed = progress === habits.length && habits.length > 0;
              }
              break;
          }
          
          updatedQuests[quest.id] = {
            ...quest,
            progress,
            completed
          };
        });
        
        set(state => ({
          quests: {
            ...state.quests,
            [targetDate]: updatedQuests
          }
        }));
      },
      
      getTodaysQuests: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().quests[today] || {};
      },
      
      getQuestPoints: (date = null) => {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const quests = get().quests[targetDate];
        if (!quests) return 0;
        
        return Object.values(quests)
          .filter(quest => quest.completed)
          .reduce((total, quest) => total + quest.points, 0);
      },
      
      getTotalQuestPoints: () => {
        const allQuests = get().quests;
        let total = 0;
        
        Object.values(allQuests).forEach(dayQuests => {
          Object.values(dayQuests).forEach(quest => {
            if (quest.completed) {
              total += quest.points;
            }
          });
        });
        
        return total;
      },
      
      getMonthlyCalendar: (year = null, month = null) => {
        const targetYear = year || new Date().getFullYear();
        const targetMonth = month || new Date().getMonth();
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const firstDay = new Date(targetYear, targetMonth, 1).getDay();
        
        const calendar = [];
        const completions = get().completions || {};
        const habits = get().getHabits();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
          calendar.push(null);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(targetYear, targetMonth, day);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayHabits = habits.map(habit => ({
            ...habit,
            completed: completions[`${habit.id}-${dateStr}`] || false
          }));
          
          const completedCount = dayHabits.filter(h => h.completed).length;
          const totalCount = habits.length;
          const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          
          calendar.push({
            day,
            date: dateStr,
            completedCount,
            totalCount,
            completionRate,
            isToday: dateStr === new Date().toISOString().split('T')[0]
          });
        }
        
        return calendar;
      },
      
      clearData: () => set({ habits: [], completions: {}, quests: {}, questCompletions: {} }),
    })
  )
);
