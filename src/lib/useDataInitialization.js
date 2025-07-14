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
      console.log('Loading authenticated user data from database');
      
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
      // Guest user - load from localStorage
      console.log('Loading guest user data from localStorage');
      
      moodStore.loadFromLocalStorage();
      chatStore.loadFromLocalStorage();
      feedbackStore.loadFromLocalStorage();
      exerciseStore.loadFromLocalStorage();
      habitStore.loadFromLocalStorage();
    }
  }, [isSignedIn, user, isLoaded, guestId]);

  return {
    isReady: isLoaded,
    userId: isSignedIn && user ? user.id : null,
    guestId: !isSignedIn ? guestId : null,
    isAuthenticated: isSignedIn,
    isGuest: !isSignedIn
  };
}
