'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Shuffle, RotateCcw, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const colors = [
  { name: 'red', bg: 'bg-red-500', text: 'Red' },
  { name: 'blue', bg: 'bg-blue-500', text: 'Blue' },
  { name: 'green', bg: 'bg-green-500', text: 'Green' },
  { name: 'yellow', bg: 'bg-yellow-500', text: 'Yellow' },
  { name: 'purple', bg: 'bg-purple-500', text: 'Purple' },
  { name: 'orange', bg: 'bg-orange-500', text: 'Orange' },
  { name: 'pink', bg: 'bg-pink-500', text: 'Pink' },
  { name: 'indigo', bg: 'bg-indigo-500', text: 'Indigo' }
];

export function GameColorMatch({ 
  onComplete,
  difficulty = 'easy', // easy, medium, hard
  className 
}) {
  const [gameState, setGameState] = useState('ready'); // ready, playing, completed
  const [currentColor, setCurrentColor] = useState(null);
  const [targetText, setTargetText] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameColors, setGameColors] = useState([]);

  const difficultySettings = {
    easy: { gridSize: 4, timeLimit: 60, points: 10 },
    medium: { gridSize: 6, timeLimit: 45, points: 15 },
    hard: { gridSize: 8, timeLimit: 30, points: 20 }
  };

  const settings = difficultySettings[difficulty];

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setTimeLeft(settings.timeLimit);
    generateColors();
    generateChallenge();
  };

  const generateColors = () => {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    setGameColors(shuffled.slice(0, settings.gridSize));
  };

  const generateChallenge = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomTextColor = colors[Math.floor(Math.random() * colors.length)];
    
    setCurrentColor(randomColor);
    setTargetText(randomTextColor.text);
  };

  const handleColorClick = (selectedColor) => {
    if (gameState !== 'playing') return;

    const isCorrect = selectedColor.name === currentColor.name;
    
    if (isCorrect) {
      setScore(prev => prev + settings.points + (streak * 2));
      setStreak(prev => prev + 1);
      generateChallenge();
    } else {
      setStreak(0);
      // Small penalty for wrong answer
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const endGame = () => {
    setGameState('completed');
    onComplete?.({
      score,
      streak,
      difficulty,
      timeSpent: settings.timeLimit - timeLeft
    });
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setStreak(0);
    setTimeLeft(settings.timeLimit);
  };

  if (gameState === 'ready') {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Target className="h-6 w-6" />
            Color Match Game
          </CardTitle>
          <div className="space-y-2">
            <Badge variant="outline">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Badge>
            <p className="text-sm text-muted-foreground">
              Match the color name with the correct color!
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm">
              <strong>Time Limit:</strong> {settings.timeLimit}s
            </p>
            <p className="text-sm">
              <strong>Grid Size:</strong> {settings.gridSize} colors
            </p>
            <p className="text-sm">
              <strong>Points per Match:</strong> {settings.points}
            </p>
          </div>
          <Button onClick={startGame} className="w-full">
            Start Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'completed') {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Game Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">{score}</div>
            <p className="text-sm text-muted-foreground">Final Score</p>
            <div className="flex justify-center gap-4 text-sm">
              <div>
                <div className="font-medium">Best Streak</div>
                <div className="text-muted-foreground">{streak}</div>
              </div>
              <div>
                <div className="font-medium">Difficulty</div>
                <div className="text-muted-foreground">{difficulty}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetGame} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
            <Button onClick={startGame} className="flex-1">
              <Shuffle className="h-4 w-4 mr-2" />
              New Game
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-lg mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{streak}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time Left</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Challenge */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Find the color:</p>
          <div 
            className={cn('text-2xl font-bold', currentColor?.bg)}
            style={{ 
              color: colors.find(c => c.text === targetText)?.name || 'black',
              WebkitTextStroke: '1px white'
            }}
          >
            {targetText}
          </div>
          <p className="text-xs text-muted-foreground">
            Click the {currentColor?.text.toLowerCase()} color below
          </p>
        </div>

        {/* Color Grid */}
        <div className={cn(
          'grid gap-3',
          settings.gridSize === 4 && 'grid-cols-2',
          settings.gridSize === 6 && 'grid-cols-3', 
          settings.gridSize === 8 && 'grid-cols-4'
        )}>
          {gameColors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorClick(color)}
              className={cn(
                'aspect-square rounded-lg transition-all duration-200 hover:scale-105 active:scale-95',
                color.bg,
                'shadow-lg hover:shadow-xl'
              )}
              aria-label={`Select ${color.text}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
