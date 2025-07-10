'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
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

  const getScoreColor = () => {
    if (score >= 50) return 'text-purple-600';
    if (score >= 30) return 'text-blue-600';
    if (score >= 15) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
            <h1 className="text-2xl font-bold text-gray-900">Color Match Game</h1>
            <p className="text-gray-600">Train your focus and reaction time</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Best Score</p>
            <p className="text-xl font-bold text-purple-600">{bestScore}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Game Stats */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">{score}</p>
              <p className="text-sm text-gray-500">Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">{streak}</p>
              <p className="text-sm text-gray-500">Streaks</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{timeLeft}s</p>
              <p className="text-sm text-gray-500">Time left</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          {gameState === 'ready' && (
            <div className="text-center">
              <div className="mb-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Color Match Challenge</h2>
                <p className="text-gray-600 mb-4">
                  Click on the color that matches the text color, not what the text says!
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">How to Play:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Read the color name displayed</li>
                    <li>• Click on the square that matches that color</li>
                    <li>• Ignore the text color - focus on the word itself</li>
                    <li>• Get as many correct answers as possible in 60 seconds</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={startGame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Game
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Find the color:</h2>
                <div 
                  className="text-6xl font-bold mb-8"
                  style={{ color: currentTextColor }}
                >
                  {currentColor}
                </div>
                <p className="text-gray-600 mb-6">Click on the color that matches the text color.</p>
              </div>

              {/* Color Options */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                {options.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorClick(color)}
                    className={`w-32 h-32 rounded-xl ${color.bg} hover:scale-105 transition-transform duration-200 shadow-lg`}
                    aria-label={color.name}
                  />
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={pauseGame}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Paused</h2>
              <p className="text-gray-600 mb-6">Take a breath and resume when ready</p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resumeGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
                <button
                  onClick={resetGame}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Complete!</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className={`text-3xl font-bold ${getScoreColor()}`}>{score}</p>
                    <p className="text-sm text-gray-500">Final Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-orange-600">{streak}</p>
                    <p className="text-sm text-gray-500">Best Streak</p>
                  </div>
                </div>
                
                {score > bestScore && (
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <p className="text-purple-800 font-semibold">🎉 New Best Score!</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Play Again
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

        {/* Tips */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Color Matching</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium mb-2">Cognitive Benefits:</p>
              <ul className="space-y-1">
                <li>• Improves focus and attention</li>
                <li>• Enhances processing speed</li>
                <li>• Trains visual perception</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Mental Health:</p>
              <ul className="space-y-1">
                <li>• Reduces stress through engagement</li>
                <li>• Builds confidence with achievements</li>
                <li>• Provides healthy mental stimulation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
