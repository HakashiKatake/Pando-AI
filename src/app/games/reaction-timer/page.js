'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Trophy, Zap, Timer } from 'lucide-react';
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
    if (typeof time !== 'number') return { rating: 'Invalid', color: 'text-gray-500' };
    if (time < 200) return { rating: 'Lightning Fast!', color: 'text-purple-600' };
    if (time < 250) return { rating: 'Excellent', color: 'text-blue-600' };
    if (time < 300) return { rating: 'Great', color: 'text-green-600' };
    if (time < 400) return { rating: 'Good', color: 'text-yellow-600' };
    if (time < 500) return { rating: 'Average', color: 'text-orange-600' };
    return { rating: 'Keep Practicing', color: 'text-red-600' };
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting': return 'bg-red-500';
      case 'react': return 'bg-green-500';
      default: return 'bg-gray-100';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/games"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Reaction Timer</h1>
            <p className="text-gray-600">Test your reflexes and reaction speed</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Personal Best</p>
            <p className="text-xl font-bold text-yellow-600">
              {bestTime ? `${bestTime}ms` : 'N/A'}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Game Stats */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">{attempt}</p>
              <p className="text-sm text-gray-500">Attempt</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">
                {averageTime ? `${averageTime}ms` : '--'}
              </p>
              <p className="text-sm text-gray-500">Average</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-600">
                {reactionTimes.length > 0 ? `${Math.min(...reactionTimes)}ms` : '--'}
              </p>
              <p className="text-sm text-gray-500">Session Best</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {gameState === 'ready' && (
            <div className="p-8 text-center">
              <div className="mb-8">
                <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reaction Speed Test</h2>
                <p className="text-gray-600 mb-4">
                  Test how quickly you can react to visual stimuli
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">How to Play:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Wait for the screen to turn green</li>
                    <li>• Click as soon as you see green</li>
                    <li>• Don't click while the screen is red (false start)</li>
                    <li>• Complete 5 attempts for your average</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={startGame}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Test
              </button>
            </div>
          )}

          {(gameState === 'waiting' || gameState === 'react') && (
            <div 
              className={`${getBackgroundColor()} transition-colors duration-300 cursor-pointer`}
              onClick={handleReaction}
              style={{ minHeight: '400px' }}
            >
              <div className="h-full flex items-center justify-center text-white">
                <div className="text-center">
                  {gameState === 'waiting' && (
                    <>
                      <Timer className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-2">Wait...</h2>
                      <p className="text-xl">Red means wait</p>
                    </>
                  )}
                  {gameState === 'react' && (
                    <>
                      <Zap className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-2">CLICK!</h2>
                      <p className="text-xl">Green means go</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {gameState === 'result' && (
            <div className="p-8 text-center">
              <div className="mb-8">
                {typeof currentReactionTime === 'number' ? (
                  <>
                    <div className="mb-4">
                      <p className="text-5xl font-bold text-gray-900 mb-2">
                        {currentReactionTime}ms
                      </p>
                      <p className={`text-xl font-semibold ${getReactionRating(currentReactionTime).color}`}>
                        {getReactionRating(currentReactionTime).rating}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-red-500 mb-4">
                      <p className="text-3xl font-bold mb-2">Too Early!</p>
                      <p className="text-lg">Wait for the green signal</p>
                    </div>
                  </>
                )}
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Attempt {attempt} of {maxAttempts}
                  </p>
                  <div className="flex justify-center gap-1 mt-2">
                    {Array.from({ length: maxAttempts }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < attempt ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Complete!</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">
                      {Math.min(...reactionTimes)}ms
                    </p>
                    <p className="text-sm text-gray-500">Best Time</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-orange-600">
                      {averageTime}ms
                    </p>
                    <p className="text-sm text-gray-500">Average Time</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">All Attempts:</h4>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {reactionTimes.map((time, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          time === Math.min(...reactionTimes)
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {time}ms
                      </span>
                    ))}
                  </div>
                </div>

                {Math.min(...reactionTimes) === bestTime && (
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-yellow-800 font-semibold">⚡ New Personal Best!</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Test Again
                </button>
                <Link
                  href="/games"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Back to Games
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
          <div className="text-center">
            <p className="text-lg text-gray-700 font-medium">
              {getInstructions()}
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Reaction Training</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium mb-2">Physical Benefits:</p>
              <ul className="space-y-1">
                <li>• Improves reflexes</li>
                <li>• Enhances hand-eye coordination</li>
                <li>• Builds neural pathways</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Mental Benefits:</p>
              <ul className="space-y-1">
                <li>• Increases alertness</li>
                <li>• Improves decision making speed</li>
                <li>• Enhances focus and attention</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Average human reaction time is 200-300ms. Elite athletes can achieve under 200ms!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
