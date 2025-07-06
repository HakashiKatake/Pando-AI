'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GameColorMatch } from '@/components/GameColorMatch';
import { Gamepad2, Trophy, Target, Brain, Palette, Clock } from 'lucide-react';
import { useExerciseStore } from '@/lib/store';

const games = [
  {
    id: 'color-match',
    title: 'Color Match',
    description: 'Match color names with their actual colors to improve focus and reduce anxiety',
    icon: Palette,
    category: 'Focus',
    difficulty: ['easy', 'medium', 'hard'],
    benefits: ['Improves focus', 'Reduces anxiety', 'Enhances cognitive flexibility'],
    estimatedTime: '2-5 minutes'
  },
  {
    id: 'memory-sequence',
    title: 'Memory Sequence',
    description: 'Remember and repeat sequences to boost working memory and concentration',
    icon: Brain,
    category: 'Memory',
    difficulty: ['easy', 'medium', 'hard'],
    benefits: ['Boosts memory', 'Improves concentration', 'Enhances pattern recognition'],
    estimatedTime: '3-7 minutes'
  },
  {
    id: 'reaction-time',
    title: 'Reaction Timer',
    description: 'Test and improve your reaction time with this mindfulness-based game',
    icon: Clock,
    category: 'Mindfulness',
    difficulty: ['easy', 'medium', 'hard'],
    benefits: ['Improves reaction time', 'Enhances mindfulness', 'Reduces stress'],
    estimatedTime: '1-3 minutes'
  }
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [gameHistory, setGameHistory] = useState([]);
  const { addExerciseSession } = useExerciseStore();

  const handleGameComplete = async (gameData) => {
    const sessionData = {
      type: 'game',
      name: selectedGame.title,
      difficulty: selectedDifficulty,
      duration: gameData.timeSpent || 0,
      score: gameData.score,
      metadata: {
        gameId: selectedGame.id,
        ...gameData
      }
    };

    try {
      await addExerciseSession(sessionData);
      setGameHistory(prev => [sessionData, ...prev]);
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Game Selection Screen
  if (!selectedGame) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Wellness Games</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Play engaging mini-games designed to improve focus, memory, and mindfulness while reducing stress and anxiety.
          </p>
        </div>

        {/* Game Stats */}
        {gameHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Gamepad2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{gameHistory.length}</p>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.max(...gameHistory.map(g => g.score || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">High Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(gameHistory.reduce((acc, g) => acc + (g.duration || 0), 0) / 60)}m
                    </p>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card key={game.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                        <Icon className="h-5 w-5" />
                        {game.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{game.category}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          {game.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{game.description}</p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Difficulty Levels:</p>
                    <div className="flex gap-1">
                      {game.difficulty.map((level) => (
                        <Badge
                          key={level}
                          className={`text-xs ${getDifficultyColor(level)}`}
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Benefits:</p>
                    <div className="flex flex-wrap gap-1">
                      {game.benefits.slice(0, 2).map((benefit) => (
                        <Badge key={benefit} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                      {game.benefits.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{game.benefits.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedGame(game)}
                    className="w-full"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Play Game
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Sessions */}
        {gameHistory.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Recent Sessions</h2>
            <div className="space-y-3">
              {gameHistory.slice(0, 5).map((session, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Trophy className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{session.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.difficulty} • {session.duration}s
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{session.score}</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Game Play Screen
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="outline" onClick={handleBackToMenu}>
            ← Back to Games
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{selectedGame.category}</Badge>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            {selectedGame.difficulty.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {selectedGame.id === 'color-match' && (
          <GameColorMatch
            difficulty={selectedDifficulty}
            onComplete={handleGameComplete}
          />
        )}

        {selectedGame.id === 'memory-sequence' && (
          <Card>
            <CardHeader>
              <CardTitle>Memory Sequence Game</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Memory Sequence game coming soon!
              </p>
            </CardContent>
          </Card>
        )}

        {selectedGame.id === 'reaction-time' && (
          <Card>
            <CardHeader>
              <CardTitle>Reaction Timer Game</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Reaction Timer game coming soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
