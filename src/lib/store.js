import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage, generateGuestId, shouldUseLocalStorage } from './utils';

// Custom persistence for authenticated vs guest users
const createConditionalPersist = (name) => (config) => {
  // For authenticated users, we'll manually sync with the database
  // For guests, we'll use localStorage persistence
  return persist(config, {
    name,
    storage: createJSONStorage(() => localStorage),
    // Only persist for guests - authenticated users will use DB
    partialize: (state) => {
      // Only persist if we're in guest mode
      if (typeof window !== 'undefined') {
        const appStore = JSON.parse(localStorage.getItem('calm-connect-app') || '{}');
        return appStore.state?.isGuest !== false ? state : {};
      }
      return state;
    }
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
  },
  
  addEntry: async (entryData, userId, guestId) => {
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
        createdAt: new Date().toISOString(),
        ...entryData,
      };
      
      set(state => {
        const newEntries = [...state.entries, newEntry];
        
        // Save to localStorage for guests
        if (guestId) {
          localStorage.setItem('calm-connect-feedback', JSON.stringify(newEntries));
        }
        
        return { entries: newEntries };
      });
    }
  },
  
  loadFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('calm-connect-feedback');
      if (stored) {
        const entries = JSON.parse(stored);
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
    if (userId) {
      // For authenticated users, save to database
      try {
        const response = await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...sessionData, guestId }),
        });
        
        if (response.ok) {
          // Reload from database
          get().loadSessionsFromAPI(userId, guestId);
        }
      } catch (error) {
        console.error('Failed to save exercise session:', error);
      }
    } else {
      // For guests, use local storage
      const newSession = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...sessionData,
      };
      
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
