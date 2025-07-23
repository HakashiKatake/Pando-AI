'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2, Zap, ZapOff } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function ProgressiveRelaxationPage() {
  const [isActive, setIsActive] = useState(false);
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState(0);
  const [phase, setPhase] = useState('tension'); // 'tension' or 'relaxation'
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('15min');
  const [startTime, setStartTime] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const intervalRef = useRef(null);
  
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  const durations = {
    '10min': {
      name: '10 Minute Session',
      description: 'Quick muscle relaxation',
      totalTime: 600,
      tensionTime: 5,
      relaxationTime: 10,
    },
    '15min': {
      name: '15 Minute Session',
      description: 'Standard progressive relaxation',
      totalTime: 900,
      tensionTime: 7,
      relaxationTime: 15,
    },
    '20min': {
      name: '20 Minute Session',
      description: 'Deep progressive relaxation',
      totalTime: 1200,
      tensionTime: 10,
      relaxationTime: 20,
    }
  };

  const muscleGroups = [
    {
      name: 'Hands and Arms',
      instruction: 'Make fists and tense your arms. Feel the tension in your hands, forearms, and upper arms.',
      relaxInstruction: 'Release and let your arms fall naturally. Notice the contrast between tension and relaxation.',
      emoji: '💪',
      color: '#EF4444'
    },
    {
      name: 'Face and Neck',
      instruction: 'Scrunch your face muscles - forehead, eyes, cheeks, jaw. Tense your neck muscles.',
      relaxInstruction: 'Let all facial muscles soften. Release your jaw and neck. Feel the relaxation spreading.',
      emoji: '😌',
      color: '#F59E0B'
    },
    {
      name: 'Shoulders and Chest',
      instruction: 'Raise your shoulders to your ears. Tense your chest muscles by taking a deep breath.',
      relaxInstruction: 'Drop your shoulders and breathe normally. Let your chest relax completely.',
      emoji: '🫲',
      color: '#10B981'
    },
    {
      name: 'Abdomen',
      instruction: 'Tighten your stomach muscles as if preparing for a punch. Hold the tension.',
      relaxInstruction: 'Release your stomach muscles. Let them become soft and relaxed.',
      emoji: '🤰',
      color: '#06B6D4'
    },
    {
      name: 'Back',
      instruction: 'Arch your back slightly and tense the muscles along your spine.',
      relaxInstruction: 'Let your back settle into a comfortable position. Feel the tension melting away.',
      emoji: '🫂',
      color: '#8B5CF6'
    },
    {
      name: 'Hips and Glutes',
      instruction: 'Tighten your buttocks and hip muscles. Squeeze them firmly.',
      relaxInstruction: 'Release and let your hips and glutes become completely relaxed.',
      emoji: '🍑',
      color: '#EC4899'
    },
    {
      name: 'Thighs',
      instruction: 'Tense your thigh muscles by pressing your knees together or apart.',
      relaxInstruction: 'Let your thighs relax completely. Feel them heavy and loose.',
      emoji: '🦵',
      color: '#F97316'
    },
    {
      name: 'Calves and Feet',
      instruction: 'Point your toes and tense your calf muscles. Feel the tension in your lower legs.',
      relaxInstruction: 'Relax your feet and calves. Let them feel heavy and completely at ease.',
      emoji: '🦶',
      color: '#84CC16'
    }
  ];

  const currentSession = durations[selectedDuration];
  const currentGroup = muscleGroups[currentMuscleGroup];
  const progress = (timeElapsed / currentSession.totalTime) * 100;
  const phaseTime = phase === 'tension' ? currentSession.tensionTime : currentSession.relaxationTime;
  const phaseProgress = ((timeElapsed % (currentSession.tensionTime + currentSession.relaxationTime)) / (currentSession.tensionTime + currentSession.relaxationTime)) * 100;

  // Audio guidance for muscle groups
  const speakInstruction = (group, currentPhase) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    let instruction = '';
    if (currentPhase === 'tension') {
      instruction = `Tense your ${group.name.toLowerCase()}. ${group.instruction}`;
    } else {
      instruction = `Now relax your ${group.name.toLowerCase()}. ${group.relaxInstruction}`;
    }
    
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.rate = 0.6;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prevTime => {
          const newTime = prevTime + 1;
          const cycleTime = currentSession.tensionTime + currentSession.relaxationTime;
          const timeInCycle = newTime % cycleTime;
          
          // Determine current phase
          const newPhase = timeInCycle <= currentSession.tensionTime ? 'tension' : 'relaxation';
          
          // Phase transition
          if (newPhase !== phase) {
            setPhase(newPhase);
            speakInstruction(currentGroup, newPhase);
          }
          
          // Move to next muscle group
          if (timeInCycle === 0 && newTime > 0 && currentMuscleGroup < muscleGroups.length - 1) {
            const nextGroup = currentMuscleGroup + 1;
            setCurrentMuscleGroup(nextGroup);
            setPhase('tension');
            setTimeout(() => {
              speakInstruction(muscleGroups[nextGroup], 'tension');
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
  }, [isActive, phase, currentMuscleGroup, currentGroup, currentSession, muscleGroups]);

  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now());
      setPhase('tension');
      setTimeout(() => {
        speakInstruction(currentGroup, 'tension');
      }, 2000);
    }
  };

  const handlePause = () => {
    setIsActive(false);
    window.speechSynthesis.cancel();
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeElapsed(0);
    setCurrentMuscleGroup(0);
    setPhase('tension');
    setStartTime(null);
    window.speechSynthesis.cancel();
  };

  const handleComplete = () => {
    setIsActive(false);
    
    // Save session data
    if (dataInit.isReady && startTime) {
      const sessionData = {
        exerciseType: 'progressive-relaxation',
        duration: Math.floor(timeElapsed / 60),
        technique: selectedDuration,
        muscleGroupsCompleted: currentMuscleGroup + 1,
        completedAt: new Date().toISOString(),
        userId: dataInit.userId,
        guestId: dataInit.guestId
      };
      
      addSession(sessionData);
    }

    // Completion audio
    if (audioEnabled && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('Progressive muscle relaxation complete. Take a moment to notice how your entire body feels now - relaxed, heavy, and at peace.');
      utterance.rate = 0.7;
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
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #06B6D4, #A5F3FC)' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #0891B2, #06B6D4)' }}
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
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#0891B2' }} />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#0891B2' }}>
              Progressive Muscle Relaxation
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#06B6D4' }}>
              Systematic tension and release for deep relaxation
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
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#0891B2' }}>
              Choose Your Session Length
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
                          background: 'linear-gradient(135deg, #06B6D4, #0891B2)',
                          borderColor: '#06B6D4'
                        }
                      : { 
                          borderColor: '#A5F3FC',
                          color: '#0891B2'
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
              backgroundImage: 'url(/asset/card7.webp)',
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
            {/* Progress Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: '#0891B2' }}>
                  Overall Progress
                </span>
                <span className="text-sm" style={{ color: '#06B6D4' }}>
                  {formatTime(timeElapsed)} / {formatTime(currentSession.totalTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #06B6D4, #0891B2)',
                    width: `${progress}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium" style={{ color: '#0891B2' }}>
                  Current Phase: {phase === 'tension' ? 'Tension' : 'Relaxation'}
                </span>
                <span className="text-xs" style={{ color: '#06B6D4' }}>
                  Group {currentMuscleGroup + 1} of {muscleGroups.length}
                </span>
              </div>
              <div className="w-full bg-cyan-100 rounded-full h-1">
                <motion.div
                  className="h-1 rounded-full"
                  style={{ 
                    backgroundColor: currentGroup.color,
                    width: `${phaseProgress}%`
                  }}
                  animate={{ width: `${phaseProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Current Muscle Group Display */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 flex items-center justify-center"
                animate={{ 
                  scale: phase === 'tension' ? [1, 1.2, 1] : [1.2, 1, 1.2],
                }}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
              >
                <img 
                  src="/asset/panda-muscle.png" 
                  alt="Panda muscle relaxation"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#0891B2' }}>
                {currentGroup.name}
              </h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {phase === 'tension' ? (
                  <Zap className="w-5 h-5" style={{ color: '#EF4444' }} />
                ) : (
                  <ZapOff className="w-5 h-5" style={{ color: '#10B981' }} />
                )}
                <span 
                  className="text-lg font-medium"
                  style={{ color: phase === 'tension' ? '#EF4444' : '#10B981' }}
                >
                  {phase === 'tension' ? 'TENSE' : 'RELAX'}
                </span>
              </div>
              
              {/* Current Instruction */}
              <motion.div
                className={`rounded-lg p-4 sm:p-6 max-w-2xl mx-auto ${
                  phase === 'tension' ? 'bg-red-50' : 'bg-green-50'
                }`}
                key={`${currentMuscleGroup}-${phase}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p 
                  className="text-sm sm:text-base"
                  style={{ color: phase === 'tension' ? '#DC2626' : '#059669' }}
                >
                  {phase === 'tension' ? currentGroup.instruction : currentGroup.relaxInstruction}
                </p>
              </motion.div>
            </div>

            {/* Muscle Group Progress Indicators */}
            <div className="flex justify-center space-x-1 sm:space-x-2 mb-6 overflow-x-auto pb-2">
              {muscleGroups.map((group, index) => (
                <motion.div
                  key={index}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === currentMuscleGroup 
                      ? 'text-white transform scale-110' 
                      : index < currentMuscleGroup
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                  style={{
                    backgroundColor: index <= currentMuscleGroup ? group.color : undefined
                  }}
                  whileHover={{ scale: 1.1 }}
                  title={group.name}
                >
                  {group.emoji}
                </motion.div>
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-3 sm:space-x-4 mb-6">
              {!isActive ? (
                <motion.button
                  onClick={handleStart}
                  className="flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl font-medium"
                  style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Begin Relaxation</span>
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
                style={audioEnabled ? { backgroundColor: '#06B6D4' } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={audioEnabled ? 'Audio guidance enabled' : 'Audio guidance disabled'}
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold mb-2" style={{ color: '#0891B2' }}>How it works:</h4>
              <ul className="space-y-1 text-sm sm:text-base" style={{ color: '#0891B2' }}>
                <li>• Tense each muscle group for {currentSession.tensionTime} seconds</li>
                <li>• Then relax for {currentSession.relaxationTime} seconds</li>
                <li>• Notice the contrast between tension and relaxation</li>
                <li>• Find a comfortable position lying down or sitting</li>
                <li>• Follow the audio guidance for best results</li>
              </ul>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
