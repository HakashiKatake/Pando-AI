'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Brain } from 'lucide-react';
import Link from 'next/link';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

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
    { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300', sound: 'C' },
    { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300', sound: 'D' },
    { id: 2, color: 'bg-green-500', activeColor: 'bg-green-300', sound: 'E' },
    { id: 3, color: 'bg-yellow-500', activeColor: 'bg-yellow-300', sound: 'F' },
    { id: 4, color: 'bg-purple-500', activeColor: 'bg-purple-300', sound: 'G' },
    { id: 5, color: 'bg-orange-500', activeColor: 'bg-orange-300', sound: 'A' },
    { id: 6, color: 'bg-pink-500', activeColor: 'bg-pink-300', sound: 'B' },
    { id: 7, color: 'bg-cyan-500', activeColor: 'bg-cyan-300', sound: 'C2' },
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
      await addSession(sessionData, dataInit.userId, dataInit.guestId);
      console.log('Memory sequence game session saved successfully');
    } catch (error) {
      console.error('Failed to save memory sequence game session:', error);
    }
  };

  const getDifficultyColor = () => {
    if (level >= 10) return 'text-red-600';
    if (level >= 7) return 'text-orange-600';
    if (level >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
            <h1 className="text-2xl font-bold text-gray-900">Memory Sequence</h1>
            <p className="text-gray-600">Challenge your working memory</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Best Level</p>
            <p className="text-xl font-bold text-indigo-600">{bestLevel}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Game Stats */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className={`text-3xl font-bold ${getDifficultyColor()}`}>{level}</p>
              <p className="text-sm text-gray-500">Level</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{score}</p>
              <p className="text-sm text-gray-500">Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{sequence.length}</p>
              <p className="text-sm text-gray-500">Sequence Length</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          {gameState === 'ready' && (
            <div className="text-center">
              <div className="mb-8">
                <Brain className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Memory Challenge</h2>
                <p className="text-gray-600 mb-4">
                  Watch the sequence and repeat it back in the same order
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">How to Play:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Watch the sequence of buttons that light up</li>
                    <li>• Click the buttons in the same order</li>
                    <li>• Each level adds one more button to remember</li>
                    <li>• The sequence gets faster as you progress</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Game
              </button>
            </div>
          )}

          {(gameState === 'showing' || gameState === 'input' || gameState === 'playing') && (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  {gameState === 'showing' ? 'Watch the sequence...' : 'Repeat the sequence'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {gameState === 'showing' 
                    ? 'Pay attention to the order of the buttons' 
                    : 'Click the buttons in the same order you saw them'
                  }
                </p>
              </div>

              {/* Button Grid */}
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
                {buttons.map((button) => (
                  <button
                    key={button.id}
                    onClick={() => handleButtonClick(button.id)}
                    disabled={gameState !== 'input'}
                    className={`
                      w-16 h-16 rounded-lg transition-all duration-200 
                      ${activeButton === button.id ? button.activeColor : button.color}
                      ${gameState === 'input' ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                      ${gameState !== 'input' ? 'opacity-70' : 'shadow-lg'}
                    `}
                    aria-label={`Button ${button.id + 1}`}
                  />
                ))}
              </div>

              {/* Progress Indicator */}
              {gameState === 'input' && (
                <div className="mb-6">
                  <div className="flex justify-center gap-2">
                    {sequence.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index < playerSequence.length ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {playerSequence.length} / {sequence.length}
                  </p>
                </div>
              )}

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
              <p className="text-gray-600 mb-6">Take your time and resume when ready</p>
              
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Over!</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className={`text-3xl font-bold ${getDifficultyColor()}`}>{level}</p>
                    <p className="text-sm text-gray-500">Level Reached</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-600">{score}</p>
                    <p className="text-sm text-gray-500">Final Score</p>
                  </div>
                </div>
                
                {level > bestLevel && (
                  <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
                    <p className="text-indigo-800 font-semibold">🧠 New Best Level!</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
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
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Memory Training</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium mb-2">Cognitive Benefits:</p>
              <ul className="space-y-1">
                <li>• Improves working memory</li>
                <li>• Enhances concentration</li>
                <li>• Builds pattern recognition</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Daily Benefits:</p>
              <ul className="space-y-1">
                <li>• Better task switching</li>
                <li>• Improved problem solving</li>
                <li>• Enhanced mental flexibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
