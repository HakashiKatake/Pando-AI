'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Calendar, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function ColorMatchGame() {
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, finished
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentColor, setCurrentColor] = useState('');
  const [currentTextColor, setCurrentTextColor] = useState('');
  const [options, setOptions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [bestScore, setBestScore] = useState(0);
  
  const intervalRef = useRef(null);
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  // Updated time to match your current timestamp
  const currentTime = "07:03"
  const currentDate = "Jul 16, 2025"

  const colors = [
    { name: 'RED', value: '#dc2626', bg: 'bg-red-600' },
    { name: 'BLUE', value: '#2563eb', bg: 'bg-blue-600' },
    { name: 'GREEN', value: '#16a34a', bg: 'bg-green-600' },
    { name: 'YELLOW', value: '#ca8a04', bg: 'bg-yellow-500' },
    { name: 'PURPLE', value: '#9333ea', bg: 'bg-purple-600' },
    { name: 'ORANGE', value: '#ea580c', bg: 'bg-orange-600' },
    { name: 'PINK', value: '#db2777', bg: 'bg-pink-600' },
    { name: 'CYAN', value: '#0891b2', bg: 'bg-cyan-600' },
  ];

  useEffect(() => {
    // Load best score from localStorage
    const stored = localStorage.getItem('color-match-best-score');
    if (stored) {
      setBestScore(parseInt(stored));
    }
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [gameState, timeLeft]);

  // FIXED: Corrected generateQuestion function
  const generateQuestion = () => {
    // Pick a random color name to display
    const colorName = colors[Math.floor(Math.random() * colors.length)];
    // Pick a random color for the text (might be different from the name)
    const textColor = colors[Math.floor(Math.random() * colors.length)];
    
    setCurrentColor(colorName.name);
    setCurrentTextColor(textColor.value);
    
    // Generate 4 options including the correct answer (color that matches the text, not the text color)
    const correctAnswer = colorName;
    const incorrectAnswers = colors.filter(c => c.name !== correctAnswer.name);
    const selectedIncorrect = [];
    
    // FIXED: Corrected typo from 'selectedIncorrected' to 'selectedIncorrect'
    while (selectedIncorrect.length < 3) {
      const randomColor = incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];
      if (!selectedIncorrect.includes(randomColor)) {
        selectedIncorrect.push(randomColor);
      }
    }
    
    const allOptions = [correctAnswer, ...selectedIncorrect];
    // Shuffle the options
    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    
    console.log('Generated question:', {
      colorName: colorName.name,
      textColor: textColor.value,
      correctAnswer: correctAnswer.name,
      options: shuffled.map(o => o.name)
    });
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setStartTime(new Date());
    generateQuestion();
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setCurrentColor('');
    setCurrentTextColor('');
    setOptions([]);
  };

  const finishGame = async () => {
    setGameState('finished');
    
    // Update best score
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('color-match-best-score', score.toString());
    }
    
    // Save session
    const endTime = new Date();
    const duration = startTime ? Math.round((endTime - startTime) / 1000) : 0;
    
    const sessionData = {
      exerciseType: 'game',
      gameType: 'color-match',
      duration: duration,
      score: score,
      streak: streak,
      timestamp: endTime.toISOString(),
    };

    try {
      await addSession(sessionData, dataInit.userId, dataInit.guestId);
      console.log('Color match game session saved successfully');
    } catch (error) {
      console.error('Failed to save color match game session:', error);
    }
  };

  const handleColorClick = (selectedColor) => {
    if (gameState !== 'playing') return;
    
    const isCorrect = selectedColor.name === currentColor;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    // Generate next question
    generateQuestion();
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

  // Debug: Log current state
  console.log('Current game state:', { gameState, options: options.length, currentColor, currentTextColor });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Header - Consistent with other pages */}
      <motion.header 
        className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 fixed top-0 left-0 right-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-sm sm:text-lg">🐼</span>
            </div>
            <h1 className="text-base sm:text-xl font-semibold" style={{ color: '#6E55A0' }}>CalmConnect</h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{currentTime}</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm">
              SOS
            </button>
          </div>
        </div>
      </motion.header>

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
                Color Match Game
              </h1>
              <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                Train your focus and reaction time by matching colors
              </p>
            </div>
          </motion.div>

          {/* Game Stats */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#6E55A0' }}>{score}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Score</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#F59E0B' }}>{streak}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Streak</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#3B82F6' }}>{timeLeft}s</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Time Left</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#8A6FBF' }}>{bestScore}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Best Score</p>
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
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#8A6FBF' }} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#6E55A0' }}>Color Match Challenge</h2>
                  <p className="mb-6" style={{ color: '#8A6FBF' }}>
                    Click on the color that matches the word, not the text color!
                  </p>
                  
                  <div className="rounded-xl p-4 sm:p-6 mb-6" style={{ backgroundColor: '#F7F5FA' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>How to Play:</h3>
                    <ul className="text-sm space-y-2 text-left" style={{ color: '#8A6FBF' }}>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Read the color name displayed
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Click on the square that matches that color
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Ignore the text color - focus on the word itself
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Get as many correct answers as possible in 60 seconds
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

            {gameState === 'playing' && (
              <div className="text-center">
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg font-semibold mb-4" style={{ color: '#6E55A0' }}>Find the color:</h2>
                  <div 
                    className="text-4xl sm:text-6xl font-bold mb-8"
                    style={{ color: currentTextColor }}
                  >
                    {currentColor}
                  </div>
                  <p className="mb-6" style={{ color: '#8A6FBF' }}>Click on the color that matches the word.</p>
                </motion.div>

                {/* Color Options - FIXED: Added proper styling and ensured colors show */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto mb-8">
                  {options.map((color, index) => (
                    <motion.button
                      key={`${color.name}-${index}`}
                      onClick={() => handleColorClick(color)}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl shadow-lg transition-transform duration-200 border-2 border-gray-200"
                      style={{ backgroundColor: color.value }} // FIXED: Use direct color value instead of Tailwind class
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={color.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  ))}
                </div>

                {/* Debug info - Remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                    Debug: {options.length} options, Current: {currentColor}, Correct: {colors.find(c => c.name === currentColor)?.name}
                  </div>
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
                <p className="mb-6" style={{ color: '#8A6FBF' }}>Take a breath and resume when ready</p>
                
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
                  <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#6E55A0' }}>Game Complete!</h2>
                  
                  <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#F7F5FA' }}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#8A6FBF' }}>{score}</p>
                        <p className="text-sm" style={{ color: '#8A6FBF' }}>Final Score</p>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#F59E0B' }}>{streak}</p>
                        <p className="text-sm" style={{ color: '#8A6FBF' }}>Best Streak</p>
                      </div>
                    </div>
                    
                    {score > bestScore && (
                      <motion.div 
                        className="mt-4 p-3 rounded-lg"
                        style={{ backgroundColor: '#E3DEF1' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <p className="font-semibold" style={{ color: '#8A6FBF' }}>🎉 New Best Score!</p>
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
                Benefits of Color Matching
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>Cognitive Benefits:</h4>
                  <ul className="space-y-2 text-sm" style={{ color: '#8A6FBF' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Improves focus and attention
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Enhances processing speed
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Trains visual perception
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>Mental Health:</h4>
                  <ul className="space-y-2 text-sm" style={{ color: '#8A6FBF' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Reduces stress through engagement
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Builds confidence with achievements
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Provides healthy mental stimulation
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