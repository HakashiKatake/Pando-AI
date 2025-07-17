import { useUser } from '@clerk/nextjs';
import { useAppStore, useMoodStore, useChatStore, useFeedbackStore, useExerciseStore, useHabitStore } from './store';
import { useEffect } from 'react';

// Custom hook to initialize data based on authentication status
export function useDataInitialization() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { isGuest, guestId, user: storeUser } = useAppStore();
  
  const moodStore = useMoodStore();
  const chatStore = useChatStore();
  const feedbackStore = useFeedbackStore();
  const exerciseStore = useExerciseStore();
  const habitStore = useHabitStore();

  useEffect(() => {
    if (!isLoaded) return;

    const userId = isSignedIn && user ? user.id : null;
    const currentGuestId = !isSignedIn ? guestId : null;

    // Initialize data based on authentication status
    if (isSignedIn && user) {
      // Authenticated user - load from database
      console.log('Loading authenticated user data from database for user:', user.id);
      
      // Clear any existing local storage data
      moodStore.clearData();
      chatStore.clearData();
      feedbackStore.clearData();
      exerciseStore.clearData();
      habitStore.clearData();
      
      // Load from API
      moodStore.loadMoodsFromAPI(userId, null);
      chatStore.loadMessagesFromAPI(userId, null);
      feedbackStore.loadEntriesFromAPI(userId, null);
      exerciseStore.loadSessionsFromAPI(userId, null);
      habitStore.loadHabitsFromAPI(userId, null);
      
    } else if (!isSignedIn && currentGuestId) {
      // Guest user - ensure clean state with localStorage only
      console.log('Initializing guest user with clean state for guestId:', currentGuestId);
      
      // For guests, we rely on Zustand persistence to handle localStorage
      // The key fixes are:
      // 1. API endpoints now require authentication and won't return data for guests
      // 2. loadHabitsFromAPI won't run for guests (no userId provided)
      // 3. Guest data stays in localStorage only
    }
  }, [isSignedIn, user, isLoaded, guestId]);

  return {
    isReady: isLoaded,
    isLoaded: isLoaded,
    userId: isSignedIn && user ? user.id : null,
    guestId: !isSignedIn ? guestId : null,
    isAuthenticated: isSignedIn,
    isSignedIn: isSignedIn,
    isGuest: !isSignedIn
  };
}
