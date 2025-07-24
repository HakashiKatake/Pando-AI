import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Generate a unique guest ID
export function generateGuestId() {
  return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Check if localStorage is available
export function shouldUseLocalStorage() {
  try {
    return typeof window !== 'undefined' && window.localStorage;
  } catch {
    return false;
  }
}

// Storage abstraction
export const storage = {
  getItem: (key) => {
    if (!shouldUseLocalStorage()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    if (!shouldUseLocalStorage()) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  },
  removeItem: (key) => {
    if (!shouldUseLocalStorage()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
};

// Clear all guest data from localStorage
export function clearGuestData() {
  if (!shouldUseLocalStorage()) return;
  
  try {
    // Get the current guest ID if it exists
    const guestId = storage.getItem('calm-connect-guest-id');
    
    // Clear all main localStorage keys
    const keysToRemove = [
      'calm-connect-app',
      'calm-connect-moods', 
      'calm-connect-chat',
      'calm-connect-journal',
      'calm-connect-exercises',
      'calm-connect-feedback',
      'calm-connect-habits',
      'calm-connect-guest-id'
    ];
    
    keysToRemove.forEach(key => {
      storage.removeItem(key);
    });
    
    // Clear guest-specific habit data if guest ID exists
    if (guestId) {
      storage.removeItem(`calm-connect-habits-guest-${guestId}`);
    }
    
    console.log('Guest data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
}

// Check if a date is today
export function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
}

// Get mood data for display
export function getMoodData(moodValue) {
  const moodMap = {
    1: { label: 'Terrible', color: '#EF4444', emoji: '😞' },
    2: { label: 'Poor', color: '#F97316', emoji: '😔' },
    3: { label: 'Okay', color: '#EAB308', emoji: '😐' },
    4: { label: 'Good', color: '#22C55E', emoji: '😊' },
    5: { label: 'Excellent', color: '#3B82F6', emoji: '😄' }
  };
  return moodMap[moodValue] || moodMap[3];
}

// Random inspirational quotes
const quotes = [
  "Every day is a new beginning. Take a deep breath and start again.",
  "You are stronger than you think and more capable than you imagine.",
  "Progress, not perfection, is the goal.",
  "Your mental health is just as important as your physical health.",
  "It's okay to not be okay sometimes. What matters is that you keep going.",
  "Small steps every day lead to big changes over time.",
  "You have survived 100% of your difficult days so far. You're doing great.",
  "Be kind to yourself. You're doing the best you can.",
  "Your feelings are valid, and seeking help is a sign of strength.",
  "Remember: this feeling is temporary, but your strength is permanent."
];

export function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
