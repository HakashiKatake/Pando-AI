'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function BodyScanPage() {
  const [isActive, setIsActive] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('15min');
  const [startTime, setStartTime] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const intervalRef = useRef(null);
  
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  const durations = {
    '10min': {
      name: '10 Minute Body Scan',
      description: 'Quick body scan for busy schedules',
      totalTime: 600, // 10 minutes in seconds
      stageTime: 40, // seconds per body part
      stages: [
        'Crown of head', 'Forehead and eyes', 'Jaw and neck', 'Shoulders', 
        'Arms and hands', 'Chest', 'Upper back', 'Abdomen', 'Lower back', 
        'Hips', 'Thighs', 'Knees', 'Calves', 'Feet and toes', 'Whole body'
      ]
    },
    '15min': {
      name: '15 Minute Body Scan',
      description: 'Standard body scan meditation',
      totalTime: 900, // 15 minutes in seconds
      stageTime: 60, // seconds per body part
      stages: [
        'Crown of head', 'Forehead and eyes', 'Jaw and neck', 'Shoulders', 
        'Right arm and hand', 'Left arm and hand', 'Chest', 'Upper back', 
        'Abdomen', 'Lower back', 'Hips', 'Right thigh', 'Left thigh', 
        'Right knee and calf', 'Left knee and calf', 'Right foot', 'Left foot', 'Whole body'
      ]
    },
    '20min': {
      name: '20 Minute Deep Body Scan',
      description: 'Extended session for deep relaxation',
      totalTime: 1200, // 20 minutes in seconds
      stageTime: 75, // seconds per body part
      stages: [
        'Top of head', 'Forehead', 'Eyes and temples', 'Nose and cheeks', 
        'Mouth and jaw', 'Neck', 'Right shoulder', 'Left shoulder', 'Right arm', 
        'Right hand', 'Left arm', 'Left hand', 'Chest', 'Heart area', 'Upper back', 
        'Abdomen', 'Lower back', 'Hips', 'Right thigh', 'Left thigh', 'Right knee', 
        'Left knee', 'Right calf', 'Left calf', 'Right foot', 'Left foot', 'Whole body'
      ]
    }
  };

  const currentSession = durations[selectedDuration];
  const totalStages = currentSession.stages.length;
  const currentStageName = currentSession.stages[currentStage] || 'Complete';
  const progress = (currentStage / totalStages) * 100;

  // Audio guidance for body parts
  const speakStage = (stageName) => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const guidance = `Focus on your ${stageName.toLowerCase()}. Notice any sensations, tension, or relaxation in this area. Breathe naturally and let go of any tension you find.`;
    
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
          
          // Check if it's time to move to next stage
          if (newTime % currentSession.stageTime === 0 && currentStage < totalStages - 1) {
            const nextStage = currentStage + 1;
            setCurrentStage(nextStage);
            speakStage(currentSession.stages[nextStage]);
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
  }, [isActive, currentStage, currentSession, totalStages]);

  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now());
      speakStage(currentSession.stages[currentStage]);
    }
  };

  const handlePause = () => {
    setIsActive(false);
    window.speechSynthesis.cancel();
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeElapsed(0);
    setCurrentStage(0);
    setStartTime(null);
    window.speechSynthesis.cancel();
  };

  const handleComplete = () => {
    setIsActive(false);
    
    // Save session data
    if (dataInit.isReady && startTime) {
      const sessionData = {
        exerciseType: 'body-scan',
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
      const utterance = new SpeechSynthesisUtterance('Body scan meditation complete. Take a moment to notice how your body feels now.');
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

  const getBodyPartIcon = (stageName) => {
    if (stageName.includes('head') || stageName.includes('forehead')) return '🧠';
    if (stageName.includes('eye')) return '👁️';
    if (stageName.includes('jaw') || stageName.includes('mouth')) return '👄';
    if (stageName.includes('neck')) return '🦴';
    if (stageName.includes('shoulder')) return '💪';
    if (stageName.includes('arm') || stageName.includes('hand')) return '🤲';
    if (stageName.includes('chest') || stageName.includes('heart')) return '❤️';
    if (stageName.includes('back')) return '🫂';
    if (stageName.includes('abdomen')) return '🤰';
    if (stageName.includes('hip')) return '🦴';
    if (stageName.includes('thigh') || stageName.includes('knee') || stageName.includes('calf')) return '🦵';
    if (stageName.includes('foot')) return '🦶';
    if (stageName.includes('whole')) return '🧘‍♀️';
    return '✨';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #8A6FBF, #E3DEF1)' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(45deg, #6E55A0, #8A6FBF)' }}
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
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#6E55A0' }} />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
              Body Scan Meditation
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
              Progressive relaxation through body awareness
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
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#6E55A0' }}>
              Choose Your Session
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
                          background: 'linear-gradient(135deg, #8A6FBF, #6E55A0)',
                          borderColor: '#8A6FBF'
                        }
                      : { 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
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
              backgroundImage: 'url(/asset/card3.png)',
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
                <span className="text-sm font-medium" style={{ color: '#6E55A0' }}>
                  Progress
                </span>
                <span className="text-sm" style={{ color: '#8A6FBF' }}>
                  {formatTime(timeElapsed)} / {formatTime(currentSession.totalTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #8A6FBF, #6E55A0)',
                    width: `${(timeElapsed / currentSession.totalTime) * 100}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(timeElapsed / currentSession.totalTime) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Current Stage Display */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 flex items-center justify-center"
                animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
              >
                <img 
                  src="/asset/panda-focus.png" 
                  alt="Panda focusing"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#6E55A0' }}>
                {currentStageName}
              </h3>
              <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                Stage {currentStage + 1} of {totalStages}
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-3 sm:space-x-4 mb-6">
              {!isActive ? (
                <motion.button
                  onClick={handleStart}
                  className="flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl font-medium"
                  style={{ background: 'linear-gradient(135deg, #8A6FBF, #6E55A0)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Start</span>
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
                style={audioEnabled ? { backgroundColor: '#8A6FBF' } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={audioEnabled ? 'Audio guidance enabled' : 'Audio guidance disabled'}
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold mb-2" style={{ color: '#6E55A0' }}>Instructions:</h4>
              <ul className="space-y-1 text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                <li>• Find a comfortable position lying down or sitting</li>
                <li>• Close your eyes and breathe naturally</li>
                <li>• Focus on each body part as guided</li>
                <li>• Notice sensations without trying to change them</li>
                <li>• Let go of any tension you discover</li>
              </ul>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
