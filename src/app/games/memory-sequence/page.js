'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Brain, Calendar, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';
import Header from '@/components/Header';

export default function MemorySequenceGame() {
  const [gameState, setGameState] = useState('ready'); // ready, playing, showing, input, paused, finished
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bestLevel, setBestLevel] = useState(0);
  const [activeButton, setActiveButton] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showSpeed, setShowSpeed] = useState(800);
  
  const timeoutRef = useRef(null);
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();



  const buttons = [
    { id: 0, color: '#dc2626', activeColor: '#fca5a5', name: 'Red' },
    { id: 1, color: '#2563eb', activeColor: '#93c5fd', name: 'Blue' },
    { id: 2, color: '#16a34a', activeColor: '#86efac', name: 'Green' },
    { id: 3, color: '#ca8a04', activeColor: '#fde047', name: 'Yellow' },
    { id: 4, color: '#9333ea', activeColor: '#c4b5fd', name: 'Purple' },
    { id: 5, color: '#ea580c', activeColor: '#fdba74', name: 'Orange' },
    { id: 6, color: '#db2777', activeColor: '#f9a8d4', name: 'Pink' },
    { id: 7, color: '#0891b2', activeColor: '#67e8f9', name: 'Cyan' },
  ];

  useEffect(() => {
    // Load best level from localStorage
    const stored = localStorage.getItem('memory-sequence-best-level');
    if (stored) {
      setBestLevel(parseInt(stored));
    }
  }, []);

  const generateSequence = (length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * buttons.length));
    }
    return newSequence;
  };

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setStartTime(new Date());
    startLevel(1);
  };

  const startLevel = (levelNum) => {
    const newSequence = generateSequence(levelNum + 2); // Start with 3 buttons, add 1 each level
    setSequence(newSequence);
    setPlayerSequence([]);
    setCurrentIndex(0);
    
    // Adjust speed based on level (faster as level increases)
    const speed = Math.max(400, 800 - (levelNum - 1) * 50);
    setShowSpeed(speed);
    
    showSequence(newSequence, speed);
  };

  const showSequence = (seq, speed) => {
    setGameState('showing');
    let index = 0;
    
    const showNext = () => {
      if (index >= seq.length) {
        setGameState('input');
        return;
      }
      
      setActiveButton(seq[index]);
      
      timeoutRef.current = setTimeout(() => {
        setActiveButton(null);
        
        timeoutRef.current = setTimeout(() => {
          index++;
          showNext();
        }, speed / 4);
      }, speed / 2);
    };
    
    // Start after a brief delay
    timeoutRef.current = setTimeout(showNext, 1000);
  };

  const handleButtonClick = (buttonId) => {
    if (gameState !== 'input') return;
    
    const newPlayerSequence = [...playerSequence, buttonId];
    setPlayerSequence(newPlayerSequence);
    
    // Flash the button
    setActiveButton(buttonId);
    setTimeout(() => setActiveButton(null), 200);
    
    // Check if the input matches so far
    if (buttonId !== sequence[newPlayerSequence.length - 1]) {
      // Wrong input - game over
      finishGame();
      return;
    }
    
    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      // Level complete!
      const newScore = score + (level * 10);
      setScore(newScore);
      setLevel(prev => prev + 1);
      
      // Brief pause before next level
      setTimeout(() => {
        startLevel(level + 1);
      }, 1500);
    }
  };

  const pauseGame = () => {
    setGameState('paused');
    clearTimeout(timeoutRef.current);
  };

  const resumeGame = () => {
    if (playerSequence.length === 0) {
      // Resume showing sequence
      showSequence(sequence, showSpeed);
    } else {
      // Resume input phase
      setGameState('input');
    }
  };

  const resetGame = () => {
    setGameState('ready');
    setLevel(1);
    setScore(0);
    setSequence([]);
    setPlayerSequence([]);
    setCurrentIndex(0);
    setActiveButton(null);
    clearTimeout(timeoutRef.current);
  };

  const finishGame = async () => {
    setGameState('finished');
    clearTimeout(timeoutRef.current);
    
    // Update best level
    if (level > bestLevel) {
      setBestLevel(level);
      localStorage.setItem('memory-sequence-best-level', level.toString());
    }
    
    // Save session
    const endTime = new Date();
    const duration = startTime ? Math.round((endTime - startTime) / 1000) : 0;
    
    const sessionData = {
      exerciseType: 'game',
      gameType: 'memory-sequence',
      duration: duration,
      level: level,
      score: score,
      timestamp: endTime.toISOString(),
    };

    try {
      console.log('Memory sequence game saving session with:', {
        sessionData,
        userId: dataInit.userId,
        guestId: dataInit.guestId,
        dataInit
      });
      await addSession(sessionData, dataInit.userId, dataInit.guestId);
      console.log('Memory sequence game session saved successfully');
    } catch (error) {
      console.error('Failed to save memory sequence game session:', error);
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
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    },
    hover: {
      y: -5,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Header - Consistent with other pages */}
      <Header/>
      {/* Main Content */}
      <main className="pt-16 sm:pt-20 px-4 sm:px-6 pb-12">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button and Title */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <Link 
              href="/games"
              className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-lg transition-colors hover:bg-white"
              style={{ color: '#8A6FBF' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Games</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#6E55A0' }}>
                Memory Sequence
              </h1>
              <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                Challenge your working memory and concentration
              </p>
            </div>
          </motion.div>

          {/* Game Stats */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#6E55A0' }}>{level}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Level</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#8A6FBF' }}>{score}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Score</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#3B82F6' }}>{sequence.length}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Sequence</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#8A6FBF' }}>{bestLevel}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Best Level</p>
              </div>
            </div>
          </motion.div>

          {/* Game Area */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 mb-6 sm:mb-8">
            {gameState === 'ready' && (
              <div className="text-center">
                <motion.div 
                  className="mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E3DEF1' }}>
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#8A6FBF' }} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#6E55A0' }}>Memory Challenge</h2>
                  <p className="mb-6" style={{ color: '#8A6FBF' }}>
                    Watch the sequence and repeat it back in the same order
                  </p>
                  
                  <div className="rounded-xl p-4 sm:p-6 mb-6" style={{ backgroundColor: '#F7F5FA' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>How to Play:</h3>
                    <ul className="text-sm space-y-2 text-left" style={{ color: '#8A6FBF' }}>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Watch the sequence of buttons that light up
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Click the buttons in the same order
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Each level adds one more button to remember
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        The sequence gets faster as you progress
                      </li>
                    </ul>
                  </div>
                </motion.div>
                
                <motion.button
                  onClick={startGame}
                  className="px-8 py-3 sm:py-4 rounded-xl font-semibold text-white transition-all"
                  style={{ backgroundColor: '#8A6FBF' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Game
                </motion.button>
              </div>
            )}

            {(gameState === 'showing' || gameState === 'input' || gameState === 'playing') && (
              <div className="text-center">
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg font-semibold mb-4" style={{ color: '#6E55A0' }}>
                    {gameState === 'showing' ? 'Watch the sequence...' : 'Repeat the sequence'}
                  </h2>
                  <p className="mb-6" style={{ color: '#8A6FBF' }}>
                    {gameState === 'showing' 
                      ? 'Pay attention to the order of the buttons' 
                      : 'Click the buttons in the same order you saw them'
                    }
                  </p>
                </motion.div>

                {/* Button Grid */}
                <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto mb-8">
                  {buttons.map((button, index) => (
                    <motion.button
                      key={button.id}
                      onClick={() => handleButtonClick(button.id)}
                      disabled={gameState !== 'input'}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all duration-200 shadow-lg border-2 border-gray-200"
                      style={{ 
                        backgroundColor: activeButton === button.id ? button.activeColor : button.color,
                        cursor: gameState === 'input' ? 'pointer' : 'default',
                        opacity: gameState !== 'input' ? 0.7 : 1
                      }}
                      whileHover={gameState === 'input' ? { scale: 1.05 } : {}}
                      whileTap={gameState === 'input' ? { scale: 0.95 } : {}}
                      aria-label={`${button.name} button`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: gameState !== 'input' ? 0.7 : 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    />
                  ))}
                </div>

                {/* Progress Indicator */}
                {gameState === 'input' && (
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-center gap-2 mb-2">
                      {sequence.map((_, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full transition-colors duration-200"
                          style={{ 
                            backgroundColor: index < playerSequence.length ? '#22C55E' : '#D1D5DB' 
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-sm" style={{ color: '#8A6FBF' }}>
                      {playerSequence.length} / {sequence.length}
                    </p>
                  </motion.div>
                )}

                <div className="flex flex-wrap gap-3 justify-center">
                  <motion.button
                    onClick={pauseGame}
                    className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                    style={{ backgroundColor: '#6B7280' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </motion.button>
                  <motion.button
                    onClick={resetGame}
                    className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                    style={{ backgroundColor: '#EF4444' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </motion.button>
                </div>
              </div>
            )}

            {gameState === 'paused' && (
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#6E55A0' }}>Game Paused</h2>
                <p className="mb-6" style={{ color: '#8A6FBF' }}>Take your time and resume when ready</p>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <motion.button
                    onClick={resumeGame}
                    className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                    style={{ backgroundColor: '#22C55E' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </motion.button>
                  <motion.button
                    onClick={resetGame}
                    className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                    style={{ backgroundColor: '#6B7280' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </motion.button>
                </div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#F59E0B' }} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#6E55A0' }}>Game Over!</h2>
                  
                  <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#F7F5FA' }}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#8A6FBF' }}>{level}</p>
                        <p className="text-sm" style={{ color: '#8A6FBF' }}>Level Reached</p>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#8A6FBF' }}>{score}</p>
                        <p className="text-sm" style={{ color: '#8A6FBF' }}>Final Score</p>
                      </div>
                    </div>
                    
                    {level > bestLevel && (
                      <motion.div 
                        className="mt-4 p-3 rounded-lg"
                        style={{ backgroundColor: '#E3DEF1' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <p className="font-semibold" style={{ color: '#8A6FBF' }}>🧠 New Best Level!</p>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    <motion.button
                      onClick={startGame}
                      className="px-6 py-2 rounded-lg font-semibold text-white transition-colors"
                      style={{ backgroundColor: '#8A6FBF' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Play Again
                    </motion.button>
                    <Link
                      href="/games"
                      className="inline-block px-6 py-2 rounded-lg font-semibold text-white transition-colors"
                      style={{ backgroundColor: '#6B7280' }}
                    >
                      Back to Games
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Benefits Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#6E55A0' }}>
                Benefits of Memory Training
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>Cognitive Benefits:</h4>
                  <ul className="space-y-2 text-sm" style={{ color: '#8A6FBF' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Improves working memory
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Enhances concentration
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Builds pattern recognition
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>Daily Benefits:</h4>
                  <ul className="space-y-2 text-sm" style={{ color: '#8A6FBF' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Better task switching
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Improved problem solving
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Enhanced mental flexibility
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}