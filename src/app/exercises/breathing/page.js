'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function BreathingExercisePage() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [selectedTechnique, setSelectedTechnique] = useState('4-7-8');
  const [startTime, setStartTime] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  const techniques = {
    '4-7-8': {
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8. Great for relaxation and sleep.',
      phases: {
        inhale: 4,
        hold: 7,
        exhale: 8
      },
      cycles: 4,
      pattern: '4-7-8 pattern'
    },
    'box': {
      name: 'Box Breathing',
      description: 'Equal counts for all phases. Perfect for focus and stress relief.',
      phases: {
        inhale: 4,
        hold: 4,
        exhale: 4,
        pause: 4
      },
      cycles: 4,
      pattern: '4-4-4-4 pattern'
    },
    'triangle': {
      name: 'Triangle Breathing',
      description: 'Simple three-phase breathing for beginners.',
      phases: {
        inhale: 4,
        hold: 4,
        exhale: 4
      },
      cycles: 6,
      pattern: '4-4-4 pattern'
    },
    'coherent': {
      name: 'Coherent Breathing',
      description: 'Equal inhale and exhale for heart rate variability.',
      phases: {
        inhale: 5,
        exhale: 5
      },
      cycles: 10,
      pattern: '5-5 pattern'
    }
  };

  const currentTechnique = techniques[selectedTechnique];
  const phaseNames = Object.keys(currentTechnique.phases);
  const currentPhaseName = phaseNames[phaseIndex];
  const currentPhaseCount = currentTechnique.phases[currentPhaseName];

  // Audio synthesis for voice guidance
  const speakPhase = (phaseName) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(phaseName === 'inhale' ? 'Inhale' : 
                                                   phaseName === 'exhale' ? 'Exhale' :
                                                   phaseName === 'hold' ? 'Hold' : 'Pause');
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.7;
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setCount(prevCount => {
          if (prevCount >= currentPhaseCount - 1) {
            // Move to next phase
            const nextPhaseIndex = (phaseIndex + 1) % phaseNames.length;
            
            if (nextPhaseIndex === 0) {
              // Completed a full cycle
              setCycle(prevCycle => {
                const newCycle = prevCycle + 1;
                if (newCycle >= currentTechnique.cycles) {
                  // Exercise complete - will be handled in useEffect
                  return newCycle; // Return the completed cycle count
                }
                return newCycle;
              });
            }
            
            setPhaseIndex(nextPhaseIndex);
            
            // Speak the new phase
            const newPhaseName = phaseNames[nextPhaseIndex];
            speakPhase(newPhaseName);
            
            return 0;
          }
          return prevCount + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, currentPhaseCount, phaseIndex, phaseNames.length, currentTechnique.cycles, audioEnabled]);

  // Handle exercise completion
  useEffect(() => {
    if (cycle >= currentTechnique.cycles && isActive) {
      // Exercise complete
      setIsActive(false);
      setPhaseIndex(0);
      setCycle(0);
      saveCompletedSession();
    }
  }, [cycle, currentTechnique.cycles, isActive]);

  const startExercise = () => {
    setIsActive(true);
    setPhaseIndex(0);
    setCount(0);
    setCycle(0);
    setStartTime(new Date());
    
    // Speak the initial phase
    speakPhase(phaseNames[0]);
  };

  const pauseExercise = () => {
    setIsActive(false);
    window.speechSynthesis.cancel();
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setCount(0);
    setCycle(0);
    window.speechSynthesis.cancel();
  };

  const resetExercise = () => {
    stopExercise();
  };

  const progress = ((count + 1) / currentPhaseCount) * 100;
  const overallProgress = ((cycle * phaseNames.length + phaseIndex) / (currentTechnique.cycles * phaseNames.length)) * 100;

  const getPhaseInstruction = (phaseName) => {
    switch (phaseName) {
      case 'inhale': return 'Breathe in slowly through your nose';
      case 'hold': return 'Hold your breath gently';
      case 'exhale': return 'Exhale slowly through your mouth';
      case 'pause': return 'Pause and relax';
      default: return 'Follow the breathing pattern';
    }
  };

  const saveCompletedSession = async () => {
    const endTime = new Date();
    const duration = startTime ? Math.round((endTime - startTime) / 1000) : 0;
    
    const sessionData = {
      exerciseType: 'breathing',
      technique: selectedTechnique,
      duration: duration,
      completedCycles: currentTechnique.cycles,
      timestamp: endTime.toISOString(),
    };

    try {
      await addSession(sessionData, dataInit.userId, dataInit.guestId, dataInit.getToken);
      console.log('Breathing session saved successfully');
    } catch (error) {
      console.error('Failed to save breathing session:', error);
    }
  };

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

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'url(/asset/card1.png) center/cover no-repeat' }}>
      {/* Overlay for readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(247,245,250,0.85)', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
      {/* Header */}
      <motion.header 
        className="px-6 py-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/dashboard"
            className="flex items-center space-x-2 transition-colors duration-200"
            style={{ color: '#8A6FBF' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <motion.button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              audioEnabled ? 'text-white' : 'text-gray-400'
            }`}
            style={{ 
              backgroundColor: audioEnabled ? '#8A6FBF' : '#E3DEF1'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Volume2 className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      <motion.div 
        className="max-w-4xl mx-auto px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          {/* Lungs Icon */}
          <motion.div 
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FFB5B5' }}
            animate={{ 
              scale: isActive && currentPhaseName === 'inhale' ? [1, 1.1, 1] : 1,
            }}
            transition={{ 
              duration: isActive ? currentPhaseCount : 0,
              repeat: isActive && currentPhaseName === 'inhale' ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C10.9 3 10 3.9 10 5V7.5C10 8.33 9.33 9 8.5 9H6C4.9 9 4 9.9 4 11V18C4 19.1 4.9 20 6 20H8.5C9.33 20 10 19.33 10 18.5V16C10 15.45 10.45 15 11 15H13C13.55 15 14 15.45 14 16V18.5C14 19.33 14.67 20 15.5 20H18C19.1 20 20 19.1 20 18V11C20 9.9 19.1 9 18 9H15.5C14.67 9 14 8.33 14 7.5V5C14 3.9 13.1 3 12 3Z"
                fill="white"
              />
            </svg>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#6E55A0' }}>
            Breathing Exercises
          </h1>
          <p className="text-sm" style={{ color: '#8A6FBF' }}>
            Find your calm through mindful breathing
          </p>
        </motion.div>

        {/* Technique Selector */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#6E55A0' }}>
            Choose Your Technique
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(techniques).map(([key, technique]) => (
              <motion.button
                key={key}
                onClick={() => {
                  setSelectedTechnique(key);
                  stopExercise();
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedTechnique === key
                    ? 'border-2'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={{
                  borderColor: selectedTechnique === key ? '#8A6FBF' : undefined,
                  backgroundColor: selectedTechnique === key ? '#E3DEF1' : undefined
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-semibold mb-1" style={{ color: '#6E55A0' }}>
                  {technique.name}
                </h3>
                <p className="text-sm mb-2" style={{ color: '#8A6FBF' }}>
                  {technique.description}
                </p>
                <div className="text-xs" style={{ color: '#8A6FBF' }}>
                  {technique.cycles} cycles • {technique.pattern}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Exercise Area */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#6E55A0' }}>
              {currentTechnique.name}
            </h3>
            <p style={{ color: '#8A6FBF' }}>
              {currentTechnique.description}
            </p>
          </motion.div>

          {/* Panda Placeholder */}
          <motion.div 
            className="w-32 h-32 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: '#E3DEF1' }}
            animate={{ 
              scale: isActive && currentPhaseName === 'inhale' ? [1, 1.15, 1] : 
                     isActive && currentPhaseName === 'exhale' ? [1, 0.85, 1] : 1,
            }}
            transition={{ 
              duration: isActive ? currentPhaseCount : 0,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <img 
              src={currentPhaseName === 'inhale' ? '/asset/panda-inhale.png' : '/asset/panda-exhale.png'}
              alt={`Panda ${currentPhaseName === 'inhale' ? 'inhaling' : 'exhaling'}`}
              className="w-24 h-24 object-contain"
            />
          </motion.div>

          {/* Phase Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhaseName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium capitalize mb-2"
                   style={{ 
                     backgroundColor: '#E3DEF1',
                     color: '#6E55A0'
                   }}>
                {currentPhaseName === 'inhale' ? 'Inhale' :
                 currentPhaseName === 'exhale' ? 'Exhale' :
                 currentPhaseName === 'hold' ? 'Hold' : 'Pause'}
              </div>
              
              <motion.div 
                className="text-4xl font-bold mb-2"
                style={{ color: '#6E55A0' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {currentPhaseCount - count}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Instruction */}
          <motion.div variants={itemVariants} className="mb-6">
            <p className="text-lg mb-2" style={{ color: '#6E55A0' }}>
              {getPhaseInstruction(currentPhaseName)}
            </p>
            <p className="text-sm" style={{ color: '#8A6FBF' }}>
              Cycle {cycle + 1} of {currentTechnique.cycles}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div variants={itemVariants} className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <motion.div 
              className="h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${overallProgress}%`,
                background: 'linear-gradient(90deg, #8A6FBF 0%, #6E55A0 100%)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
            />
          </motion.div>

          {/* Controls */}
          <motion.div variants={itemVariants} className="flex items-center justify-center space-x-4">
            {!isActive ? (
              <motion.button
                onClick={startExercise}
                className="text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 flex items-center space-x-2"
                style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #22C55E 100%)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                <span>Start</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={pauseExercise}
                className="text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 flex items-center space-x-2"
                style={{ 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </motion.button>
            )}
            
            <motion.button
              onClick={stopExercise}
              className="text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 flex items-center space-x-2"
              style={{ 
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </motion.button>
            
            <motion.button
              onClick={resetExercise}
              className="text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 flex items-center space-x-2"
              style={{ 
                background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}