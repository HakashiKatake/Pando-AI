'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Trophy, Zap, Timer, Calendar, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function ReactionTimerGame() {
  const [gameState, setGameState] = useState('ready'); // ready, waiting, react, result, finished
  const [attempt, setAttempt] = useState(0);
  const [currentReactionTime, setCurrentReactionTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [waitTime, setWaitTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [averageTime, setAverageTime] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  const timeoutRef = useRef(null);
  const reactionStartRef = useRef(null);
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  // Updated time to match your current timestamp
  const currentTime = "07:09"
  const currentDate = "Jul 16, 2025"

  const maxAttempts = 5;

  useEffect(() => {
    // Load best time from localStorage
    const stored = localStorage.getItem('reaction-timer-best');
    if (stored) {
      setBestTime(parseInt(stored));
    }
  }, []);

  useEffect(() => {
    if (reactionTimes.length > 0) {
      const avg = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
      setAverageTime(Math.round(avg));
      
      const best = Math.min(...reactionTimes);
      if (!bestTime || best < bestTime) {
        setBestTime(best);
        localStorage.setItem('reaction-timer-best', best.toString());
      }
    }
  }, [reactionTimes, bestTime]);

  const startGame = () => {
    setGameState('ready');
    setAttempt(0);
    setReactionTimes([]);
    setCurrentReactionTime(null);
    setAverageTime(null);
    setSessionStartTime(new Date());
    startAttempt();
  };

  const startAttempt = () => {
    if (attempt >= maxAttempts) {
      finishGame();
      return;
    }

    setAttempt(prev => prev + 1);
    setGameState('waiting');
    setCurrentReactionTime(null);
    
    // Random wait time between 2-6 seconds
    const wait = 2000 + Math.random() * 4000;
    setWaitTime(wait);
    
    timeoutRef.current = setTimeout(() => {
      setGameState('react');
      reactionStartRef.current = Date.now();
    }, wait);
  };

  const handleReaction = () => {
    if (gameState === 'waiting') {
      // Too early - false start
      clearTimeout(timeoutRef.current);
      setGameState('result');
      setCurrentReactionTime('Too early!');
      
      setTimeout(() => {
        startAttempt();
      }, 2000);
      return;
    }
    
    if (gameState === 'react') {
      // Calculate reaction time
      const reactionTime = Date.now() - reactionStartRef.current;
      setCurrentReactionTime(reactionTime);
      setReactionTimes(prev => [...prev, reactionTime]);
      setGameState('result');
      
      setTimeout(() => {
        if (attempt < maxAttempts) {
          startAttempt();
        } else {
          finishGame();
        }
      }, 2000);
    }
  };

  const resetGame = () => {
    clearTimeout(timeoutRef.current);
    setGameState('ready');
    setAttempt(0);
    setReactionTimes([]);
    setCurrentReactionTime(null);
    setAverageTime(null);
  };

  const finishGame = async () => {
    setGameState('finished');
    
    // Save session
    const endTime = new Date();
    const duration = sessionStartTime ? Math.round((endTime - sessionStartTime) / 1000) : 0;
    
    const sessionData = {
      exerciseType: 'game',
      gameType: 'reaction-timer',
      duration: duration,
      attempts: reactionTimes.length,
      bestReactionTime: reactionTimes.length > 0 ? Math.min(...reactionTimes) : null,
      averageReactionTime: averageTime,
      allTimes: reactionTimes,
      timestamp: endTime.toISOString(),
    };

    try {
      await addSession(sessionData, dataInit.userId, dataInit.guestId);
      console.log('Reaction timer game session saved successfully');
    } catch (error) {
      console.error('Failed to save reaction timer game session:', error);
    }
  };

  const getReactionRating = (time) => {
    if (typeof time !== 'number') return { rating: 'Invalid', color: '#6B7280' };
    if (time < 200) return { rating: 'Lightning Fast!', color: '#8A6FBF' };
    if (time < 250) return { rating: 'Excellent', color: '#3B82F6' };
    if (time < 300) return { rating: 'Great', color: '#22C55E' };
    if (time < 400) return { rating: 'Good', color: '#F59E0B' };
    if (time < 500) return { rating: 'Average', color: '#F97316' };
    return { rating: 'Keep Practicing', color: '#EF4444' };
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting': return '#EF4444';
      case 'react': return '#22C55E';
      default: return '#F7F5FA';
    }
  };

  const getInstructions = () => {
    switch (gameState) {
      case 'ready':
        return 'Click "Start Test" to begin your reaction time test';
      case 'waiting':
        return 'Wait for the green signal... Don\'t click yet!';
      case 'react':
        return 'Click NOW!';
      case 'result':
        return typeof currentReactionTime === 'number' 
          ? `${currentReactionTime}ms - ${getReactionRating(currentReactionTime).rating}`
          : currentReactionTime;
      default:
        return 'Test your reflexes and reaction time';
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
                Reaction Timer
              </h1>
              <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                Test your reflexes and reaction speed
              </p>
            </div>
          </motion.div>

          {/* Game Stats */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#6E55A0' }}>{attempt}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Attempt</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#F97316' }}>
                  {averageTime ? `${averageTime}ms` : '--'}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Average</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#F59E0B' }}>
                  {reactionTimes.length > 0 ? `${Math.min(...reactionTimes)}ms` : '--'}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Session Best</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#8A6FBF' }}>
                  {bestTime ? `${bestTime}ms` : '--'}
                </p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Personal Best</p>
              </div>
            </div>
          </motion.div>

          {/* Game Area */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden mb-6 sm:mb-8">
            {gameState === 'ready' && (
              <div className="p-6 sm:p-8 text-center">
                <motion.div 
                  className="mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E3DEF1' }}>
                    <Zap className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#8A6FBF' }} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#6E55A0' }}>Reaction Speed Test</h2>
                  <p className="mb-6" style={{ color: '#8A6FBF' }}>
                    Test how quickly you can react to visual stimuli
                  </p>
                  
                  <div className="rounded-xl p-4 sm:p-6 mb-6" style={{ backgroundColor: '#F7F5FA' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>How to Play:</h3>
                    <ul className="text-sm space-y-2 text-left" style={{ color: '#8A6FBF' }}>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Wait for the screen to turn green
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Click as soon as you see green
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Don't click while the screen is red (false start)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                        Complete 5 attempts for your average
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
                  Start Test
                </motion.button>
              </div>
            )}

            {(gameState === 'waiting' || gameState === 'react') && (
              <motion.div 
                className="cursor-pointer transition-colors duration-300"
                onClick={handleReaction}
                style={{ backgroundColor: getBackgroundColor(), minHeight: '400px' }}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-full flex items-center justify-center text-white">
                  <motion.div 
                    className="text-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {gameState === 'waiting' && (
                      <>
                        <Timer className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Wait...</h2>
                        <p className="text-lg sm:text-xl">Red means wait</p>
                      </>
                    )}
                    {gameState === 'react' && (
                      <>
                        <Zap className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">CLICK!</h2>
                        <p className="text-lg sm:text-xl">Green means go</p>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {gameState === 'result' && (
              <div className="p-6 sm:p-8 text-center">
                <motion.div 
                  className="mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {typeof currentReactionTime === 'number' ? (
                    <>
                      <div className="mb-4">
                        <p className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: '#6E55A0' }}>
                          {currentReactionTime}ms
                        </p>
                        <p className="text-lg sm:text-xl font-semibold" style={{ color: getReactionRating(currentReactionTime).color }}>
                          {getReactionRating(currentReactionTime).rating}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4" style={{ color: '#EF4444' }}>
                        <p className="text-2xl sm:text-3xl font-bold mb-2">Too Early!</p>
                        <p className="text-lg">Wait for the green signal</p>
                      </div>
                    </>
                  )}
                  
                  <div className="rounded-lg p-4" style={{ backgroundColor: '#F7F5FA' }}>
                    <p className="text-sm" style={{ color: '#8A6FBF' }}>
                      Attempt {attempt} of {maxAttempts}
                    </p>
                    <div className="flex justify-center gap-1 mt-2">
                      {Array.from({ length: maxAttempts }, (_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full transition-colors duration-200"
                          style={{ 
                            backgroundColor: i < attempt ? '#8A6FBF' : '#D1D5DB' 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="p-6 sm:p-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#F59E0B' }} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#6E55A0' }}>Test Complete!</h2>
                  
                  <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#F7F5FA' }}>
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#F59E0B' }}>
                          {Math.min(...reactionTimes)}ms
                        </p>
                        <p className="text-sm" style={{ color: '#8A6FBF' }}>Best Time</p>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#F97316' }}>
                          {averageTime}ms
                        </p>
                        <p className="text-sm" style={{ color: '#8A6FBF' }}>Average Time</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold" style={{ color: '#6E55A0' }}>All Attempts:</h4>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {reactionTimes.map((time, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={
                              time === Math.min(...reactionTimes)
                                ? { backgroundColor: '#E3DEF1', color: '#8A6FBF' }
                                : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                            }
                          >
                            {time}ms
                          </span>
                        ))}
                      </div>
                    </div>

                    {Math.min(...reactionTimes) === bestTime && (
                      <motion.div 
                        className="mt-4 p-3 rounded-lg"
                        style={{ backgroundColor: '#E3DEF1' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <p className="font-semibold" style={{ color: '#8A6FBF' }}>⚡ New Personal Best!</p>
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
                      Test Again
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

          {/* Instructions */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
              <div className="text-center">
                <p className="text-base sm:text-lg font-medium" style={{ color: '#6E55A0' }}>
                  {getInstructions()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#6E55A0' }}>
                Benefits of Reaction Training
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>Physical Benefits:</h4>
                  <ul className="space-y-2 text-sm" style={{ color: '#8A6FBF' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Improves reflexes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Enhances hand-eye coordination
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Builds neural pathways
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>Mental Benefits:</h4>
                  <ul className="space-y-2 text-sm" style={{ color: '#8A6FBF' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Increases alertness
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Improves decision making speed
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Enhances focus and attention
                    </li>
                  </ul>
                </div>
              </div>
              
              <motion.div 
                className="mt-4 p-3 rounded-lg"
                style={{ backgroundColor: '#E3DEF1' }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm" style={{ color: '#8A6FBF' }}>
                  <strong>Tip:</strong> Average human reaction time is 200-300ms. Elite athletes can achieve under 200ms!
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}