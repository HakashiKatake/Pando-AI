import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Generate UUID for guest users
export function generateGuestId() {
  return 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Local storage helpers
export const storage = {
  get: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key, value) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Local storage error:', error);
    }
  },
  
  remove: (key) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};

// Date helpers
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function isToday(date) {
  const today = new Date();
  const compareDate = new Date(date);
  return today.toDateString() === compareDate.toDateString();
}

// Mood helpers
export const moods = [
  { value: 1, label: 'Terrible', emoji: '😢', color: 'bg-red-500' },
  { value: 2, label: 'Poor', emoji: '😔', color: 'bg-orange-500' },
  { value: 3, label: 'Okay', emoji: '😐', color: 'bg-yellow-500' },
  { value: 4, label: 'Good', emoji: '😊', color: 'bg-green-500' },
  { value: 5, label: 'Excellent', emoji: '😄', color: 'bg-blue-500' }
];

export function getMoodData(value) {
  return moods.find(mood => mood.value === value) || moods[2];
}

// Wellness quotes
export const wellnessQuotes = [
  "The present moment is the only time over which we have dominion. - Thích Nhất Hạnh",
  "You are not your thoughts, you are the awareness behind your thoughts.",
  "Progress, not perfection, is the goal.",
  "Be kind to yourself. You're doing the best you can.",
  "Every small step forward is still progress.",
  "Your mental health is just as important as your physical health.",
  "It's okay to not be okay sometimes.",
  "Healing is not linear. Be patient with yourself.",
  "You are stronger than you know and more capable than you realize.",
  "Self-care is not selfish. It's essential."
];

export function getRandomQuote() {
  return wellnessQuotes[Math.floor(Math.random() * wellnessQuotes.length)];
}
