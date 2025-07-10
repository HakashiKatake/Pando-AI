'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Gamepad2, Trophy, Target, Brain, Palette, Clock, Zap } from 'lucide-react';
import { useExerciseStore } from '@/lib/store';
import { useDataInitialization } from '@/lib/useDataInitialization';

const games = [
  {
    id: 'color-match',
    title: 'Color Match Challenge',
    description: 'Train your focus and reaction time by matching color names with their actual colors',
    icon: Palette,
    category: 'Focus',
    difficulty: 'Beginner',
    benefits: ['Improves focus', 'Enhances reaction time', 'Builds concentration'],
    estimatedTime: '2-5 minutes',
    route: '/games/color-match'
  },
  {
    id: 'memory-sequence',
    title: 'Memory Sequence',
    description: 'Challenge your working memory by remembering and repeating sequences',
    icon: Brain,
    category: 'Memory',
    difficulty: 'Intermediate',
    benefits: ['Improves working memory', 'Enhances concentration', 'Builds pattern recognition'],
    estimatedTime: '3-7 minutes',
    route: '/games/memory-sequence'
  },
  {
    id: 'reaction-timer',
    title: 'Reaction Timer',
    description: 'Test and improve your reflexes with this reaction speed challenge',
    icon: Zap,
    category: 'Mindfulness',
    difficulty: 'Beginner',
    benefits: ['Improves reflexes', 'Increases alertness', 'Enhances decision making speed'],
    estimatedTime: '1-3 minutes',
    route: '/games/reaction-timer'
  }
];

export default function GamesPage() {
  const router = useRouter();
  const { sessions } = useExerciseStore();
  const dataInit = useDataInitialization();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleStartGame = (game) => {
    router.push(game.route);
  };

  const getGameStats = () => {
    // Filter sessions to only include games
    const gameSessions = sessions.filter(session => 
      session.exerciseType === 'game' || 
      ['color-match', 'memory-sequence', 'reaction-timer'].includes(session.gameType || session.exerciseId)
    );
    
    const totalGames = gameSessions.length;
    const totalTime = gameSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const bestScores = {};
    
    // Calculate best scores for each game type
    gameSessions.forEach(session => {
      const gameType = session.gameType || session.exerciseId;
      if (gameType && session.score !== undefined) {
        if (!bestScores[gameType] || session.score > bestScores[gameType]) {
          bestScores[gameType] = session.score;
        }
      }
    });

    return {
      totalGames,
      totalTime: Math.round(totalTime),
      bestScores,
      recentSessions: gameSessions.slice(-5).reverse()
    };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Prevent hydration errors
  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const stats = getGameStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Gamepad2 className="h-8 w-8" />
          Wellness Games
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Play engaging mini-games designed to improve focus, memory, and mindfulness while reducing stress and anxiety.
        </p>
      </div>

      {/* Game Stats */}
      {stats.totalGames > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Gamepad2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalGames}</p>
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
                    {Object.keys(stats.bestScores).length > 0 
                      ? Math.max(...Object.values(stats.bestScores)) 
                      : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Best Score</p>
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
                  <p className="text-2xl font-bold">{formatTime(stats.totalTime)}</p>
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
          const gameStats = stats.bestScores[game.id];
          
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
                      <Badge className={getDifficultyColor(game.difficulty)}>
                        {game.difficulty}
                      </Badge>
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

                {/* Personal Best Score */}
                {gameStats && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Best: {gameStats}</span>
                  </div>
                )}

                <Button
                  onClick={() => handleStartGame(game)}
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
      {stats.recentSessions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Game Sessions</h2>
          <div className="space-y-3">
            {stats.recentSessions.map((session, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {games.find(g => g.id === (session.gameType || session.exerciseId))?.title || 'Game'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(session.duration || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {session.score !== undefined ? session.score : 'N/A'}
                      </p>
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
