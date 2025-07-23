'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2, Heart } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function LovingKindnessPage() {
  const [isActive, setIsActive] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('12min');
  const [startTime, setStartTime] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const intervalRef = useRef(null);
  
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  const durations = {
    '8min': {
      name: '8 Minute Practice',
      description: 'Quick loving kindness meditation',
      totalTime: 480,
      targetTime: 120, // 2 minutes per target
    },
    '12min': {
      name: '12 Minute Practice',
      description: 'Standard loving kindness session',
      totalTime: 720,
      targetTime: 180, // 3 minutes per target
    },
    '16min': {
      name: '16 Minute Practice',
      description: 'Extended compassion practice',
      totalTime: 960,
      targetTime: 240, // 4 minutes per target
    }
  };

  const targets = [
    {
      name: 'Yourself',
      description: 'Start by offering loving kindness to yourself',
      emoji: '🤗',
      color: '#F59E0B'
    },
    {
      name: 'Loved One',
      description: 'Someone you care about deeply',
      emoji: '💝',
      color: '#EF4444'
    },
    {
      name: 'Neutral Person',
      description: 'Someone you neither like nor dislike',
      emoji: '🙂',
      color: '#6B7280'
    },
    {
      name: 'Difficult Person',
      description: 'Someone you have challenges with',
      emoji: '🕊️',
      color: '#8B5CF6'
    },
    {
      name: 'All Beings',
      description: 'Extend love to all living beings',
      emoji: '🌍',
      color: '#10B981'
    }
  ];

  const phrases = [
    'May you be happy',
    'May you be healthy',
    'May you be safe',
    'May you live with ease',
    'May you be free from suffering'
  ];

  const currentSession = durations[selectedDuration];
  const currentTargetObj = targets[currentTarget];
  const currentPhraseText = phrases[currentPhrase];
  const progress = (timeElapsed / currentSession.totalTime) * 100;
  const targetProgress = ((timeElapsed % currentSession.targetTime) / currentSession.targetTime) * 100;

  // Audio guidance for loving kindness phrases
  const speakPhrase = (phrase, target) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    let personalizedPhrase = phrase;
    if (target === 'Yourself') {
      personalizedPhrase = phrase.replace('you', 'I').replace('May I', 'May I');
    }
    
    const utterance = new SpeechSynthesisUtterance(personalizedPhrase);
    utterance.rate = 0.6;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  const introduceTarget = (target) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    let introduction = '';
    switch (target) {
      case 'Yourself':
        introduction = 'Now focus on yourself. Bring yourself to mind with kindness and compassion.';
        break;
      case 'Loved One':
        introduction = 'Now think of someone you love deeply. Picture them clearly in your mind.';
        break;
      case 'Neutral Person':
        introduction = 'Now bring to mind someone neutral - perhaps a cashier, neighbor, or acquaintance.';
        break;
      case 'Difficult Person':
        introduction = 'Now think of someone you have difficulties with. Start small if needed.';
        break;
      case 'All Beings':
        introduction = 'Finally, extend your loving kindness to all living beings everywhere.';
        break;
    }
    
    const utterance = new SpeechSynthesisUtterance(introduction);
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
          
          // Change phrase every 20 seconds
          if (newTime % 20 === 0) {
            const nextPhrase = (currentPhrase + 1) % phrases.length;
            setCurrentPhrase(nextPhrase);
            speakPhrase(phrases[nextPhrase], currentTargetObj.name);
          }
          
          // Change target based on target time
          if (newTime % currentSession.targetTime === 0 && currentTarget < targets.length - 1) {
            const nextTarget = currentTarget + 1;
            setCurrentTarget(nextTarget);
            setCurrentPhrase(0);
            setTimeout(() => {
              introduceTarget(targets[nextTarget].name);
              setTimeout(() => {
                speakPhrase(phrases[0], targets[nextTarget].name);
              }, 3000);
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
  }, [isActive, currentTarget, currentPhrase, currentSession, currentTargetObj, targets, phrases]);

  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now());
      setTimeout(() => {
        introduceTarget(currentTargetObj.name);
        setTimeout(() => {
          speakPhrase(currentPhraseText, currentTargetObj.name);
        }, 3000);
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
    setCurrentTarget(0);
    setCurrentPhrase(0);
    setStartTime(null);
    window.speechSynthesis.cancel();
  };

  const handleComplete = () => {
    setIsActive(false);
    
    // Save session data
    if (dataInit.isReady && startTime) {
      const sessionData = {
        exerciseType: 'loving-kindness',
        duration: Math.floor(timeElapsed / 60),
        technique: selectedDuration,
        completedAt: new Date().toISOString(),
        userId: dataInit.userId,
        guestId: dataInit.guestId
      };
      
      addSession(sessionData);
    }

    // Completion audio
    if (audioEnabled && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('Your loving kindness meditation is complete. May the compassion you have cultivated spread out into your day and into the world.');
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
    <div className="min-h-screen" style={{ backgroundColor: '#FDF2F8' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #EC4899, #F9A8D4)' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #BE185D, #EC4899)' }}
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
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#BE185D' }} />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#BE185D' }}>
              Loving Kindness Meditation
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#EC4899' }}>
              Cultivate compassion and positive emotions
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
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#BE185D' }}>
              Choose Your Practice Duration
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
                          background: 'linear-gradient(135deg, #EC4899, #BE185D)',
                          borderColor: '#EC4899'
                        }
                      : { 
                          borderColor: '#F9A8D4',
                          color: '#BE185D'
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
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Progress Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: '#BE185D' }}>
                  Overall Progress
                </span>
                <span className="text-sm" style={{ color: '#EC4899' }}>
                  {formatTime(timeElapsed)} / {formatTime(currentSession.totalTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #EC4899, #BE185D)',
                    width: `${progress}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium" style={{ color: '#BE185D' }}>
                  Current Target Progress
                </span>
                <span className="text-xs" style={{ color: '#EC4899' }}>
                  {Math.floor(targetProgress)}%
                </span>
              </div>
              <div className="w-full bg-pink-100 rounded-full h-1">
                <motion.div
                  className="h-1 rounded-full"
                  style={{ 
                    backgroundColor: currentTargetObj.color,
                    width: `${targetProgress}%`
                  }}
                  animate={{ width: `${targetProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Current Target and Phrase Display */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                className="text-6xl sm:text-8xl mb-4"
                animate={{ 
                  scale: isActive ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 4, repeat: isActive ? Infinity : 0 }}
              >
                {currentTargetObj.emoji}
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#BE185D' }}>
                {currentTargetObj.name}
              </h3>
              <p className="text-sm sm:text-base mb-4" style={{ color: '#EC4899' }}>
                {currentTargetObj.description}
              </p>
              
              {/* Current Phrase */}
              <motion.div
                className="bg-pink-50 rounded-lg p-4 sm:p-6 max-w-md mx-auto"
                key={currentPhrase}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-lg sm:text-xl font-medium" style={{ color: '#BE185D' }}>
                  {currentPhraseText.replace('you', currentTarget === 0 ? 'I' : 'you')}
                </p>
              </motion.div>
            </div>

            {/* Target Progress Indicators */}
            <div className="flex justify-center space-x-2 sm:space-x-3 mb-6">
              {targets.map((target, index) => (
                <motion.div
                  key={index}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    index === currentTarget 
                      ? 'text-white transform scale-110' 
                      : index < currentTarget
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                  style={{
                    backgroundColor: index <= currentTarget ? target.color : undefined
                  }}
                  whileHover={{ scale: 1.1 }}
                  title={target.name}
                >
                  {target.emoji}
                </motion.div>
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-3 sm:space-x-4 mb-6">
              {!isActive ? (
                <motion.button
                  onClick={handleStart}
                  className="flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl font-medium"
                  style={{ background: 'linear-gradient(135deg, #EC4899, #BE185D)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Begin Practice</span>
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
                style={audioEnabled ? { backgroundColor: '#EC4899' } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={audioEnabled ? 'Audio guidance enabled' : 'Audio guidance disabled'}
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* All Phrases Display */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold mb-3" style={{ color: '#BE185D' }}>Loving Kindness Phrases:</h4>
              <div className="space-y-2">
                {phrases.map((phrase, index) => (
                  <div 
                    key={index}
                    className={`text-sm sm:text-base p-2 rounded ${
                      index === currentPhrase && isActive 
                        ? 'bg-pink-100 font-medium' 
                        : ''
                    }`}
                    style={{ color: '#BE185D' }}
                  >
                    • {phrase}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
