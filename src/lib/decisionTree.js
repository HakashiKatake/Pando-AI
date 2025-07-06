// Decision tree for guided wellness conversations
export const decisionTree = {
  greeting: {
    message: "Hello! I'm here to support your mental wellness journey. How are you feeling today?",
    options: [
      { text: "I'm doing well", next: "positive" },
      { text: "I'm struggling", next: "struggling" },
      { text: "I'm not sure", next: "uncertain" },
      { text: "I need immediate help", next: "crisis" }
    ]
  },
  
  positive: {
    message: "That's wonderful to hear! Let's help you maintain this positive momentum.",
    options: [
      { text: "Share gratitude practice", next: "gratitude" },
      { text: "Mindfulness exercise", next: "mindfulness" },
      { text: "Goal setting", next: "goals" },
      { text: "Just chat", next: "open_chat" }
    ]
  },
  
  struggling: {
    message: "I'm sorry you're having a tough time. You're not alone, and it's brave of you to reach out.",
    options: [
      { text: "I feel anxious", next: "anxiety" },
      { text: "I feel sad", next: "sadness" },
      { text: "I feel overwhelmed", next: "overwhelmed" },
      { text: "I want to talk it out", next: "open_chat" }
    ]
  },
  
  uncertain: {
    message: "It's completely normal to feel uncertain about your emotions. Let's explore this together.",
    options: [
      { text: "Help me identify my feelings", next: "emotion_check" },
      { text: "I want a mood check-in", next: "mood_checkin" },
      { text: "Tell me about coping strategies", next: "coping" },
      { text: "Just listen to me", next: "open_chat" }
    ]
  },
  
  anxiety: {
    message: "Anxiety can feel overwhelming, but there are techniques that can help you feel more grounded.",
    exercises: [
      "4-7-8 breathing technique",
      "5-4-3-2-1 grounding exercise",
      "Progressive muscle relaxation",
      "Mindful observation"
    ],
    next: "breathing"
  },
  
  sadness: {
    message: "Sadness is a natural emotion, and it's okay to feel this way. Let's work through it together.",
    exercises: [
      "Gentle self-compassion practice",
      "Journaling prompts",
      "Gratitude reflection",
      "Connect with support system"
    ],
    next: "self_compassion"
  },
  
  overwhelmed: {
    message: "When everything feels like too much, we can break it down into manageable pieces.",
    exercises: [
      "Priority setting exercise",
      "One-thing-at-a-time practice",
      "Boundary setting guidance",
      "Stress release techniques"
    ],
    next: "priority_setting"
  },
  
  breathing: {
    message: "Let's try a breathing exercise together. Breathe in for 4 counts, hold for 7, exhale for 8.",
    guidance: "Focus only on your breath. If your mind wanders, gently bring it back to counting.",
    duration: 300, // 5 minutes
    next: "check_improvement"
  },
  
  gratitude: {
    message: "Gratitude can shift our perspective. Let's think of three things you're grateful for today.",
    prompts: [
      "Something small that made you smile",
      "A person who supports you",
      "A simple pleasure you enjoyed"
    ],
    next: "reflection"
  },
  
  open_chat: {
    message: "I'm here to listen. Feel free to share whatever is on your mind.",
    guidance: "Take your time. There's no pressure to say anything specific."
  }
};

export function getNextStep(currentStep, userChoice) {
  const step = decisionTree[currentStep];
  if (!step) return decisionTree.greeting;
  
  if (step.options) {
    const option = step.options.find(opt => opt.text === userChoice);
    return option ? decisionTree[option.next] : decisionTree.open_chat;
  }
  
  return decisionTree[step.next] || decisionTree.open_chat;
}

export function getWellnessExercises() {
  return [
    {
      id: 'breathing',
      title: '4-7-8 Breathing',
      description: 'A calming breathing technique to reduce anxiety',
      duration: '5 minutes',
      steps: [
        'Inhale through nose for 4 counts',
        'Hold breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'Repeat 4-6 times'
      ]
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 Grounding',
      description: 'Use your senses to stay present',
      duration: '3-5 minutes',
      steps: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ]
    },
    {
      id: 'gratitude',
      title: 'Daily Gratitude',
      description: 'Shift focus to positive aspects of life',
      duration: '5 minutes',
      steps: [
        'Think of 3 things you\'re grateful for',
        'Write them down if possible',
        'Reflect on why each is meaningful',
        'Feel the positive emotion'
      ]
    },
    {
      id: 'body_scan',
      title: 'Body Scan Meditation',
      description: 'Progressive relaxation technique',
      duration: '10 minutes',
      steps: [
        'Lie down comfortably',
        'Start from your toes',
        'Notice tension in each body part',
        'Consciously relax each area',
        'Move up to the top of your head'
      ]
    }
  ];
}
