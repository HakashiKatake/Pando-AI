'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useMoodStore } from '../../lib/store';
import { Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function QuestionnairePage() {
  const router = useRouter();
  const { updatePreferences, setOnboarded, guestId } = useAppStore();
  const { addMood } = useMoodStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    mood: 3,
    communicationStyle: 'supportive',
    goals: [],
    experience: '',
  });

  const steps = [
    {
      title: "Welcome! Let's get to know you",
      subtitle: "This helps us personalize your experience",
      component: WelcomeStep
    },
    {
      title: "How are you feeling today?",
      subtitle: "This will be your mood baseline",
      component: MoodStep
    },
    {
      title: "How would you like me to communicate?",
      subtitle: "Choose the style that feels most comfortable",
      component: CommunicationStep
    },
    {
      title: "What are your wellness goals?",
      subtitle: "Select all that apply to you",
      component: GoalsStep
    },
    {
      title: "You're all set!",
      subtitle: "Let's begin your wellness journey",
      component: CompletionStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save preferences
    updatePreferences({
      name: formData.name,
      communicationStyle: formData.communicationStyle,
    });

    // Save initial mood
    addMood({
      mood: formData.mood,
      emoji: getMoodEmoji(formData.mood),
      note: 'Initial mood baseline',
      guestId: guestId,
    });

    // Mark as onboarded
    setOnboarded(true);

    // Navigate to dashboard
    router.push('/dashboard');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMoodEmoji = (mood) => {
    const emojis = { 1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '😄' };
    return emojis[mood] || '😐';
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CalmConnect</span>
          </Link>
          
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="px-6">
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {steps[currentStep].title}
            </h1>
            <p className="text-lg text-gray-600">
              {steps[currentStep].subtitle}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <CurrentStepComponent 
              formData={formData}
              updateFormData={updateFormData}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              {currentStep > 0 ? (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What would you like me to call you? (Optional)
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter your name or leave blank for anonymity"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-2">
          This helps personalize your experience, but you can always remain anonymous.
        </p>
      </div>
    </div>
  );
}

function MoodStep({ formData, updateFormData }) {
  const moods = [
    { value: 1, label: 'Terrible', emoji: '😢', color: 'bg-red-100 border-red-300 text-red-700' },
    { value: 2, label: 'Poor', emoji: '😔', color: 'bg-orange-100 border-orange-300 text-orange-700' },
    { value: 3, label: 'Okay', emoji: '😐', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
    { value: 4, label: 'Good', emoji: '😊', color: 'bg-green-100 border-green-300 text-green-700' },
    { value: 5, label: 'Excellent', emoji: '😄', color: 'bg-blue-100 border-blue-300 text-blue-700' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => updateFormData('mood', mood.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              formData.mood === mood.value 
                ? mood.color + ' ring-2 ring-blue-500' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="text-3xl mb-2">{mood.emoji}</div>
            <div className="font-medium">{mood.label}</div>
          </button>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 text-center">
        This helps us understand your starting point and track your progress over time.
      </p>
    </div>
  );
}

function CommunicationStep({ formData, updateFormData }) {
  const styles = [
    {
      value: 'supportive',
      title: 'Supportive & Encouraging',
      description: 'Warm, empathetic responses with positive reinforcement',
      example: '"You\'re taking such an important step by reaching out. That takes real courage."'
    },
    {
      value: 'direct',
      title: 'Direct & Practical',
      description: 'Clear, actionable advice focused on solutions',
      example: '"Let\'s work on three specific breathing techniques you can use right now."'
    },
    {
      value: 'gentle',
      title: 'Gentle & Patient',
      description: 'Soft, understanding approach with no pressure',
      example: '"Take all the time you need. There\'s no rush, and every small step matters."'
    }
  ];

  return (
    <div className="space-y-4">
      {styles.map((style) => (
        <button
          key={style.value}
          onClick={() => updateFormData('communicationStyle', style.value)}
          className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
            formData.communicationStyle === style.value
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <h3 className="font-semibold text-gray-900 mb-2">{style.title}</h3>
          <p className="text-gray-600 mb-3">{style.description}</p>
          <p className="text-sm text-gray-500 italic">{style.example}</p>
        </button>
      ))}
    </div>
  );
}

function GoalsStep({ formData, updateFormData }) {
  const goals = [
    'Manage anxiety and stress',
    'Improve mood and emotional well-being',
    'Build healthy coping strategies',
    'Practice mindfulness and meditation',
    'Better sleep and rest',
    'Increase self-awareness',
    'Develop positive thinking patterns',
    'Connect with my emotions',
    'Create daily wellness routines',
    'Work through difficult feelings'
  ];

  const toggleGoal = (goal) => {
    const currentGoals = formData.goals || [];
    if (currentGoals.includes(goal)) {
      updateFormData('goals', currentGoals.filter(g => g !== goal));
    } else {
      updateFormData('goals', [...currentGoals, goal]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleGoal(goal)}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              formData.goals?.includes(goal)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                formData.goals?.includes(goal)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}>
                {formData.goals?.includes(goal) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="font-medium">{goal}</span>
            </div>
          </button>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 text-center mt-4">
        Select any goals that resonate with you. You can always adjust these later.
      </p>
    </div>
  );
}

function CompletionStep({ formData }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {formData.name ? `Welcome, ${formData.name}!` : 'Welcome!'}
        </h2>
        <p className="text-lg text-gray-600">
          Your personalized wellness experience is ready. Let's begin your journey to better mental health.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your setup summary:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Communication style: <span className="font-medium capitalize">{formData.communicationStyle}</span></p>
          <p>• Initial mood: <span className="font-medium">
            {formData.mood}/5 {['😢', '😔', '😐', '😊', '😄'][formData.mood - 1]}
          </span></p>
          {formData.goals?.length > 0 && (
            <p>• Goals: <span className="font-medium">{formData.goals.length} selected</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
