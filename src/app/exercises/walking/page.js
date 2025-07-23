'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function MindfulWalkingPage() {
  const [isActive, setIsActive] = useState(false);
  const [currentFocus, setCurrentFocus] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('10min');
  const [stepCount, setStepCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const intervalRef = useRef(null);
  
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  const durations = {
    '5min': {
      name: '5 Minute Walk',
      description: 'Quick mindful walking break',
      totalTime: 300,
      focusInterval: 60, // Change focus every minute
    },
    '10min': {
      name: '10 Minute Walk',
      description: 'Standard mindful walking session',
      totalTime: 600,
      focusInterval: 90, // Change focus every 1.5 minutes
    },
    '15min': {
      name: '15 Minute Walk',
      description: 'Extended walking meditation',
      totalTime: 900,
      focusInterval: 120, // Change focus every 2 minutes
    }
  };

  const focusAreas = [
    {
      name: 'Foot Contact',
      description: 'Feel each foot touching the ground',
      instruction: 'Notice how your feet contact the ground with each step. Feel the heel, then the toe.',
      emoji: '👣'
    },
    {
      name: 'Breathing',
      description: 'Sync your breath with your steps',
      instruction: 'Coordinate your breathing with your walking rhythm. Inhale for 2-3 steps, exhale for 2-3 steps.',
      emoji: '🫁'
    },
    {
      name: 'Body Movement',
      description: 'Notice how your body moves',
      instruction: 'Feel your arms swinging, your legs moving, the gentle sway of your body as you walk.',
      emoji: '🚶‍♀️'
    },
    {
      name: 'Surroundings',
      description: 'Observe your environment mindfully',
      instruction: 'Notice what you see, hear, and smell around you without getting lost in thoughts.',
      emoji: '🌿'
    },
    {
      name: 'Present Moment',
      description: 'Return to the now',
      instruction: 'When your mind wanders, gently bring attention back to the simple act of walking.',
      emoji: '🧘‍♀️'
    }
  ];

  const currentSession = durations[selectedDuration];
  const currentFocusArea = focusAreas[currentFocus];
  const progress = (timeElapsed / currentSession.totalTime) * 100;

  // Audio guidance for walking focus
  const speakGuidance = (focusArea) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const guidance = `Now focus on ${focusArea.name.toLowerCase()}. ${focusArea.instruction}`;
    
    const utterance = new SpeechSynthesisUtterance(guidance);
    utterance.rate = 0.7;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prevTime => {
          const newTime = prevTime + 1;
          
          // Simulate step counting (approximate)
          if (newTime % 2 === 0) {
            setStepCount(prev => prev + 1);
          }
          
          // Check if it's time to change focus
          if (newTime % currentSession.focusInterval === 0 && newTime < currentSession.totalTime) {
            const nextFocus = (currentFocus + 1) % focusAreas.length;
            setCurrentFocus(nextFocus);
            speakGuidance(focusAreas[nextFocus]);
          }
          
          // Check if session is complete
          if (newTime >= currentSession.totalTime) {
            handleComplete();
            return newTime;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, currentFocus, currentSession, focusAreas]);

  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now());
      speakGuidance(currentFocusArea);
    }
  };

  const handlePause = () => {
    setIsActive(false);
    window.speechSynthesis.cancel();
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeElapsed(0);
    setCurrentFocus(0);
    setStepCount(0);
    setStartTime(null);
    window.speechSynthesis.cancel();
  };

  const handleComplete = () => {
    setIsActive(false);
    
    // Save session data
    if (dataInit.isReady && startTime) {
      const sessionData = {
        exerciseType: 'mindful-walking',
        duration: Math.floor(timeElapsed / 60),
        technique: selectedDuration,
        steps: stepCount,
        completedAt: new Date().toISOString(),
        userId: dataInit.userId,
        guestId: dataInit.guestId
      };
      
      addSession(sessionData);
    }

    // Completion audio
    if (audioEnabled && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(`Mindful walking session complete. You took approximately ${stepCount} steps. Take a moment to notice how you feel.`);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #10B981, #A7F3D0)' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #059669, #10B981)' }}
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link href="/exercises">
            <motion.button
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#059669' }} />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#059669' }}>
              Mindful Walking
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#10B981' }}>
              Walking meditation for presence and grounding
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Session Selection */}
          <motion.div
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#059669' }}>
              Choose Your Walking Session
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(durations).map(([key, duration]) => (
                <motion.button
                  key={key}
                  onClick={() => !isActive && setSelectedDuration(key)}
                  className={`p-3 sm:p-4 rounded-xl text-left transition-all border-2 ${
                    selectedDuration === key
                      ? 'text-white'
                      : 'bg-white hover:bg-gray-50'
                  } ${isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={
                    selectedDuration === key
                      ? { 
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          borderColor: '#10B981'
                        }
                      : { 
                          borderColor: '#A7F3D0',
                          color: '#059669'
                        }
                  }
                  whileHover={{ scale: !isActive ? 1.02 : 1 }}
                  whileTap={{ scale: !isActive ? 0.98 : 1 }}
                  disabled={isActive}
                >
                  <div className="font-medium text-sm sm:text-base mb-1">{duration.name}</div>
                  <div className={`text-xs sm:text-sm ${selectedDuration === key ? 'text-white/80' : 'text-gray-600'}`}>
                    {duration.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Exercise Area */}
          <motion.div
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
            style={{
              backgroundImage: 'url(/asset/card5.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-white bg-opacity-85 rounded-2xl sm:rounded-3xl"></div>
            
            <div className="relative z-10">
            {/* Progress and Stats */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: '#059669' }}>
                  Progress
                </span>
                <div className="flex items-center space-x-4 text-sm" style={{ color: '#10B981' }}>
                  <span>{formatTime(timeElapsed)} / {formatTime(currentSession.totalTime)}</span>
                  <span className="flex items-center space-x-1">
                    <span>👣</span>
                    <span>{stepCount} steps</span>
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #10B981, #059669)',
                    width: `${progress}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Current Focus Display */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 flex items-center justify-center"
                animate={{ 
                  scale: isActive ? [1, 1.1, 1] : 1,
                  rotate: isActive ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 3, repeat: isActive ? Infinity : 0 }}
              >
                <img 
                  src="/asset/panda-walk.png" 
                  alt="Panda walking"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#059669' }}>
                Focus: {currentFocusArea.name}
              </h3>
              <p className="text-sm sm:text-base mb-3" style={{ color: '#10B981' }}>
                {currentFocusArea.description}
              </p>
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 max-w-md mx-auto">
                <p className="text-sm sm:text-base" style={{ color: '#059669' }}>
                  {currentFocusArea.instruction}
                </p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-3 sm:space-x-4 mb-6">
              {!isActive ? (
                <motion.button
                  onClick={handleStart}
                  className="flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl font-medium"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Start Walking</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={handlePause}
                  className="flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 text-white rounded-xl sm:rounded-2xl font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Pause</span>
                </motion.button>
              )}
              
              <motion.button
                onClick={handleStop}
                className="flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-red-500 text-white rounded-xl sm:rounded-2xl font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Stop</span>
              </motion.button>

              <motion.button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 sm:p-4 rounded-xl transition-colors ${
                  audioEnabled 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
                style={audioEnabled ? { backgroundColor: '#10B981' } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={audioEnabled ? 'Audio guidance enabled' : 'Audio guidance disabled'}
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* Walking Tips */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold mb-2" style={{ color: '#059669' }}>Walking Tips:</h4>
              <ul className="space-y-1 text-sm sm:text-base" style={{ color: '#059669' }}>
                <li>• Walk at a slower pace than usual</li>
                <li>• Choose a safe, familiar route or indoor space</li>
                <li>• Keep your phone on silent</li>
                <li>• When your mind wanders, gently return focus to walking</li>
                <li>• There's no destination - the journey is the practice</li>
              </ul>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
