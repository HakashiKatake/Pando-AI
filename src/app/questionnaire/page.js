'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useMoodStore } from '../../lib/store';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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

    // Navigate to chat
    router.push('/chat');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMoodEmoji = (mood) => {
    const emojis = { 1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '😄' };
    return emojis[mood] || '😐';
  };

  const CurrentStepComponent = steps[currentStep].component;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen"
      style={{ backgroundColor: '#F7F5FA' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Navigation */}
      <motion.nav 
        className="px-4 sm:px-6 py-4"
        variants={itemVariants}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#E3DEF1' }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              
              <Image
                src="/logo.svg"
                alt="PandoAI Logo"
                width={24}
                height={24}
                className="sm:w-6 sm:h-6"
                onError={(e) => {
                  
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded"
                style={{ backgroundColor: '#8A6FBF', display: 'none' }}
              />
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
              PandoAI
            </span>
          </Link>
          
          <div className="text-sm" style={{ color: '#8A6FBF' }}>
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </motion.nav>

      {/* Progress Bar */}
      <motion.div 
        className="px-4 sm:px-6"
        variants={itemVariants}
      >
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)',
                width: `${((currentStep + 1) / steps.length) * 100}%`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        className="px-4 sm:px-6 py-8 sm:py-12"
        variants={itemVariants}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            variants={itemVariants}
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#6E55A0' }}>
              {steps[currentStep].title}
            </h1>
            <p className="text-base sm:text-lg" style={{ color: '#8A6FBF' }}>
              {steps[currentStep].subtitle}
            </p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
            variants={itemVariants}
            key={currentStep} // Re-animate when step changes
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CurrentStepComponent 
              formData={formData}
              updateFormData={updateFormData}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6 sm:mt-8">
              {currentStep > 0 ? (
                <motion.button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 transition-colors"
                  style={{ color: '#8A6FBF' }}
                  whileHover={{ scale: 1.05, color: '#6E55A0' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Previous</span>
                </motion.button>
              ) : (
                <div></div>
              )}

              <motion.button
                onClick={handleNext}
                className="text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                style={{ 
                  background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm sm:text-base">
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Step Components
function WelcomeStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
          What would you like me to call you? (Optional)
        </label>
        <motion.input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter your name or leave blank for anonymity"
          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
          style={{ 
            borderColor: '#E3DEF1',
            focusRingColor: '#8A6FBF',
            focusBorderColor: '#8A6FBF'
          }}
          whileFocus={{ 
            borderColor: '#8A6FBF',
            boxShadow: '0 0 0 3px rgba(138, 111, 191, 0.1)'
          }}
        />
        <p className="text-sm mt-2" style={{ color: '#8A6FBF' }}>
          This helps personalize your experience, but you can always remain anonymous.
        </p>
      </div>
    </div>
  );
}

function MoodStep({ formData, updateFormData }) {
  const moods = [
    { value: 1, label: 'Terrible', emoji: '😢', color: '#EF4444' },
    { value: 2, label: 'Poor', emoji: '😔', color: '#F97316' },
    { value: 3, label: 'Okay', emoji: '😐', color: '#EAB308' },
    { value: 4, label: 'Good', emoji: '😊', color: '#22C55E' },
    { value: 5, label: 'Excellent', emoji: '😄', color: '#3B82F6' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {moods.map((mood) => (
          <motion.button
            key={mood.value}
            onClick={() => updateFormData('mood', mood.value)}
            className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              formData.mood === mood.value 
                ? 'ring-2' 
                : 'hover:bg-gray-50'
            }`}
            style={{
              borderColor: formData.mood === mood.value ? mood.color : '#E3DEF1',
              backgroundColor: formData.mood === mood.value ? `${mood.color}10` : 'white',
              color: formData.mood === mood.value ? mood.color : '#6E55A0',
              ringColor: formData.mood === mood.value ? mood.color : 'transparent'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{mood.emoji}</div>
            <div className="font-medium text-xs sm:text-sm">{mood.label}</div>
          </motion.button>
        ))}
      </div>
      
      <p className="text-sm text-center" style={{ color: '#8A6FBF' }}>
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
        <motion.button
          key={style.value}
          onClick={() => updateFormData('communicationStyle', style.value)}
          className={`w-full p-4 sm:p-6 rounded-xl border-2 text-left transition-all duration-200 ${
            formData.communicationStyle === style.value
              ? 'ring-2'
              : 'hover:bg-gray-50'
          }`}
          style={{
            borderColor: formData.communicationStyle === style.value ? '#8A6FBF' : '#E3DEF1',
            backgroundColor: formData.communicationStyle === style.value ? '#F7F5FA' : 'white',
            ringColor: formData.communicationStyle === style.value ? '#8A6FBF' : 'transparent'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h3 className="font-semibold mb-2" style={{ color: '#6E55A0' }}>
            {style.title}
          </h3>
          <p className="mb-3" style={{ color: '#8A6FBF' }}>
            {style.description}
          </p>
          <p className="text-sm italic" style={{ color: '#8A6FBF' }}>
            {style.example}
          </p>
        </motion.button>
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
          <motion.button
            key={goal}
            onClick={() => toggleGoal(goal)}
            className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200`}
            style={{
              borderColor: formData.goals?.includes(goal) ? '#8A6FBF' : '#E3DEF1',
              backgroundColor: formData.goals?.includes(goal) ? '#F7F5FA' : 'white',
              color: formData.goals?.includes(goal) ? '#6E55A0' : '#8A6FBF'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center`}
                style={{
                  backgroundColor: formData.goals?.includes(goal) ? '#8A6FBF' : 'white',
                  borderColor: formData.goals?.includes(goal) ? '#8A6FBF' : '#E3DEF1'
                }}
              >
                {formData.goals?.includes(goal) && (
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="font-medium text-sm sm:text-base">{goal}</span>
            </div>
          </motion.button>
        ))}
      </div>
      
      <p className="text-sm text-center mt-4" style={{ color: '#8A6FBF' }}>
        Select any goals that resonate with you. You can always adjust these later.
      </p>
    </div>
  );
}

function CompletionStep({ formData }) {
  return (
    <div className="text-center space-y-6">
      <motion.div 
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto"
        style={{ background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#6E55A0' }}>
          {formData.name ? `Welcome, ${formData.name}!` : 'Welcome!'}
        </h2>
        <p className="text-base sm:text-lg" style={{ color: '#8A6FBF' }}>
          Your personalized wellness experience is ready. Let's begin your journey to better mental health.
        </p>
      </motion.div>

      <motion.div 
        className="rounded-xl p-4 sm:p-6"
        style={{ backgroundColor: '#F7F5FA' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="font-semibold mb-4" style={{ color: '#6E55A0' }}>
          Your setup summary:
        </h3>
        <div className="space-y-2 text-sm">
          <p style={{ color: '#8A6FBF' }}>
            • Communication style: <span className="font-medium capitalize">{formData.communicationStyle}</span>
          </p>
          <p style={{ color: '#8A6FBF' }}>
            • Initial mood: <span className="font-medium">
              {formData.mood}/5 {['😢', '😔', '😐', '😊', '😄'][formData.mood - 1]}
            </span>
          </p>
          {formData.goals?.length > 0 && (
            <p style={{ color: '#8A6FBF' }}>
              • Goals: <span className="font-medium">{formData.goals.length} selected</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}