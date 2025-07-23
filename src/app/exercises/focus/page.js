'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2, Target, Eye, Brain } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function FocusTrainingPage() {
  const [isActive, setIsActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('8min');
  const [focusScore, setFocusScore] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const intervalRef = useRef(null);
  
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  const durations = {
    '5min': {
      name: '5 Minute Focus',
      description: 'Quick concentration boost',
      totalTime: 300,
      exerciseTime: 150, // 2.5 minutes per exercise
    },
    '8min': {
      name: '8 Minute Focus',
      description: 'Standard focus training',
      totalTime: 480,
      exerciseTime: 240, // 4 minutes per exercise
    },
    '12min': {
      name: '12 Minute Focus',
      description: 'Extended concentration practice',
      totalTime: 720,
      exerciseTime: 360, // 6 minutes per exercise
    }
  };

  const exercises = [
    {
      name: 'Single Point Focus',
      description: 'Focus on the center dot without letting your mind wander',
      instruction: 'Keep your attention on the center point. When you notice your mind wandering, gently bring it back.',
      emoji: '🎯',
      color: '#8B5CF6',
      visualElement: 'dot'
    },
    {
      name: 'Breath Counting',
      description: 'Count your breaths from 1 to 10, then start over',
      instruction: 'Count each exhale: 1, 2, 3... up to 10, then start at 1 again. If you lose count, start over.',
      emoji: '🫁',
      color: '#06B6D4',
      visualElement: 'counter'
    }
  ];

  const currentSession = durations[selectedDuration];
  const currentExerciseObj = exercises[currentExercise];
  const progress = (timeElapsed / currentSession.totalTime) * 100;
  const exerciseProgress = ((timeElapsed % currentSession.exerciseTime) / currentSession.exerciseTime) * 100;

  // Visual focus elements
  const [breathCount, setBreathCount] = useState(1);
  const [dotSize, setDotSize] = useState(20);

  // Audio guidance for focus exercises
  const speakInstruction = (exercise) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const instruction = `Now beginning ${exercise.name}. ${exercise.instruction}`;
    
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.rate = 0.7;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleDistraction = () => {
    setDistractionCount(prev => prev + 1);
    // Reduce focus score slightly for each distraction
    setFocusScore(prev => Math.max(0, prev - 5));
  };

  const handleFocusReturn = () => {
    // Increase focus score when returning attention
    setFocusScore(prev => Math.min(100, prev + 2));
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prevTime => {
          const newTime = prevTime + 1;
          
          // Gradually increase focus score over time
          if (newTime % 5 === 0) {
            setFocusScore(prev => Math.min(100, prev + 1));
          }
          
          // Animate dot for single point focus
          if (currentExerciseObj.visualElement === 'dot') {
            setDotSize(20 + Math.sin(newTime * 0.1) * 5);
          }
          
          // Auto-increment breath count for breath counting
          if (currentExerciseObj.visualElement === 'counter' && newTime % 6 === 0) {
            setBreathCount(prev => prev >= 10 ? 1 : prev + 1);
          }
          
          // Switch exercise halfway through
          if (newTime === Math.floor(currentSession.totalTime / 2) && exercises.length > 1) {
            const nextExercise = (currentExercise + 1) % exercises.length;
            setCurrentExercise(nextExercise);
            setBreathCount(1);
            setTimeout(() => {
              speakInstruction(exercises[nextExercise]);
            }, 1000);
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
  }, [isActive, currentExercise, currentExerciseObj, currentSession, exercises]);

  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now());
      setFocusScore(50); // Start with moderate focus score
      setTimeout(() => {
        speakInstruction(currentExerciseObj);
      }, 1000);
    }
  };

  const handlePause = () => {
    setIsActive(false);
    window.speechSynthesis.cancel();
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeElapsed(0);
    setCurrentExercise(0);
    setFocusScore(0);
    setDistractionCount(0);
    setBreathCount(1);
    setStartTime(null);
    window.speechSynthesis.cancel();
  };

  const handleComplete = () => {
    setIsActive(false);
    
    // Save session data
    if (dataInit.isReady && startTime) {
      const sessionData = {
        exerciseType: 'focus-training',
        duration: Math.floor(timeElapsed / 60),
        technique: selectedDuration,
        focusScore,
        distractionCount,
        completedAt: new Date().toISOString(),
        userId: dataInit.userId,
        guestId: dataInit.guestId
      };
      
      addSession(sessionData);
    }

    // Completion audio
    if (audioEnabled && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(`Focus training complete. Your focus score is ${focusScore} out of 100. You noticed ${distractionCount} distractions and successfully brought your attention back.`);
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

  const getFocusColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#6B7280';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F6' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #8B5CF6, #C4B5FD)' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #6D28D9, #8B5CF6)' }}
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
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#6D28D9' }} />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6D28D9' }}>
              Focus Training
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#8B5CF6' }}>
              Improve concentration and mental clarity
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
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#6D28D9' }}>
              Choose Your Training Duration
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
                          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                          borderColor: '#8B5CF6'
                        }
                      : { 
                          borderColor: '#C4B5FD',
                          color: '#6D28D9'
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
              backgroundImage: 'url(/asset/card6.jpg)',
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: getFocusColor(focusScore) }}>
                    {focusScore}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Focus Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#6D28D9' }}>
                    {distractionCount}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Distractions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#8B5CF6' }}>
                    {formatTime(timeElapsed)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#A855F7' }}>
                    {Math.floor(progress)}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Complete</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                    width: `${progress}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Current Exercise Display */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 flex items-center justify-center"
                animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
              >
                <img 
                  src="/asset/panda-focus.png" 
                  alt="Panda focusing"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#6D28D9' }}>
                {currentExerciseObj.name}
              </h3>
              <p className="text-sm sm:text-base mb-4" style={{ color: '#8B5CF6' }}>
                {currentExerciseObj.description}
              </p>
              
              {/* Visual Focus Element */}
              <div className="bg-gray-50 rounded-lg p-8 sm:p-12 min-h-48 flex items-center justify-center">
                {currentExerciseObj.visualElement === 'dot' ? (
                  <motion.div
                    className="rounded-full"
                    style={{
                      backgroundColor: currentExerciseObj.color,
                      width: `${dotSize}px`,
                      height: `${dotSize}px`
                    }}
                    animate={{
                      scale: isActive ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 3, repeat: isActive ? Infinity : 0 }}
                  />
                ) : (
                  <motion.div
                    className="text-6xl sm:text-8xl font-bold"
                    style={{ color: currentExerciseObj.color }}
                    animate={{
                      scale: isActive ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 6, repeat: isActive ? Infinity : 0 }}
                  >
                    {breathCount}
                  </motion.div>
                )}
              </div>
              
              <div className="mt-4 text-sm sm:text-base" style={{ color: '#6D28D9' }}>
                {currentExerciseObj.instruction}
              </div>
            </div>

            {/* Distraction Buttons */}
            {isActive && (
              <div className="flex justify-center space-x-3 sm:space-x-4 mb-6">
                <motion.button
                  onClick={handleDistraction}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mind Wandered
                </motion.button>
                <motion.button
                  onClick={handleFocusReturn}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Refocused
                </motion.button>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center space-x-3 sm:space-x-4 mb-6">
              {!isActive ? (
                <motion.button
                  onClick={handleStart}
                  className="flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl font-medium"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Start Training</span>
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
                style={audioEnabled ? { backgroundColor: '#8B5CF6' } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={audioEnabled ? 'Audio guidance enabled' : 'Audio guidance disabled'}
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold mb-2" style={{ color: '#6D28D9' }}>Training Tips:</h4>
              <ul className="space-y-1 text-sm sm:text-base" style={{ color: '#6D28D9' }}>
                <li>• It's normal for your mind to wander - that's the training!</li>
                <li>• Click "Mind Wandered" when you notice distractions</li>
                <li>• Click "Refocused" when you bring attention back</li>
                <li>• Be patient and gentle with yourself</li>
                <li>• Consistent practice builds stronger focus over time</li>
              </ul>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
