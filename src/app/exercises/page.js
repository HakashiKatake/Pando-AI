'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ExerciseGrid } from '@/components/ExerciseCard';
import { 
  Wind, 
  Brain, 
  Heart, 
  Target, 
  Search, 
  Filter,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useExerciseStore } from '@/lib/store';

const exerciseCategories = [
  { id: 'all', name: 'All Exercises', icon: Activity },
  { id: 'breathing', name: 'Breathing', icon: Wind },
  { id: 'mindfulness', name: 'Mindfulness', icon: Brain },
  { id: 'relaxation', name: 'Relaxation', icon: Heart },
  { id: 'focus', name: 'Focus', icon: Target }
];

const exercises = [
  {
    id: 'breathing-basic',
    title: 'Basic Breathing',
    description: 'Simple breathing exercises for beginners to reduce stress and anxiety',
    duration: 5,
    difficulty: 'beginner',
    category: 'breathing',
    benefits: ['Reduces stress', 'Improves focus', 'Calms mind'],
    route: '/exercises/breathing'
  },
  {
    id: 'breathing-advanced',
    title: 'Advanced Breathing',
    description: 'Complex breathing patterns for experienced practitioners',
    duration: 10,
    difficulty: 'advanced',
    category: 'breathing',
    benefits: ['Deep relaxation', 'Enhanced control', 'Better sleep'],
    route: '/exercises/breathing'
  },
  {
    id: 'body-scan',
    title: 'Body Scan Meditation',
    description: 'Progressive relaxation technique to release tension throughout the body',
    duration: 15,
    difficulty: 'beginner',
    category: 'relaxation',
    benefits: ['Releases tension', 'Improves awareness', 'Better sleep'],
    route: '/exercises/body-scan'
  },
  {
    id: 'mindful-walking',
    title: 'Mindful Walking',
    description: 'Walking meditation to connect with the present moment',
    duration: 10,
    difficulty: 'beginner',
    category: 'mindfulness',
    benefits: ['Grounds you', 'Improves focus', 'Reduces anxiety'],
    route: '/exercises/walking'
  },
  {
    id: 'loving-kindness',
    title: 'Loving Kindness',
    description: 'Meditation practice to cultivate compassion and positive emotions',
    duration: 12,
    difficulty: 'intermediate',
    category: 'mindfulness',
    benefits: ['Increases compassion', 'Reduces negative emotions', 'Improves relationships'],
    route: '/exercises/loving-kindness'
  },
  {
    id: 'focus-training',
    title: 'Focus Training',
    description: 'Exercises designed to improve concentration and mental clarity',
    duration: 8,
    difficulty: 'intermediate',
    category: 'focus',
    benefits: ['Improves concentration', 'Enhances productivity', 'Mental clarity'],
    route: '/exercises/focus'
  },
  {
    id: 'progressive-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematic relaxation of muscle groups to reduce physical tension',
    duration: 20,
    difficulty: 'beginner',
    category: 'relaxation',
    benefits: ['Reduces muscle tension', 'Improves sleep', 'Stress relief'],
    route: '/exercises/progressive-relaxation'
  },
  {
    id: 'visualization',
    title: 'Guided Visualization',
    description: 'Mental imagery exercises for relaxation and goal achievement',
    duration: 15,
    difficulty: 'intermediate',
    category: 'mindfulness',
    benefits: ['Enhances creativity', 'Reduces stress', 'Improves motivation'],
    route: '/exercises/visualization'
  }
];

export default function ExercisesPage() {
  const router = useRouter();
  const { sessions, getSessions, addExerciseSession } = useExerciseStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    getSessions();
  }, [getSessions]);

  useEffect(() => {
    // Mark exercises as completed based on sessions
    const completed = new Set(sessions.map(session => session.exerciseId).filter(Boolean));
    setCompletedExercises(completed);
  }, [sessions]);

  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  const handleStartExercise = (exercise) => {
    router.push(exercise.route);
  };

  const getExerciseStats = () => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const completedCount = completedExercises.size;
    const streak = calculateStreak();

    return {
      totalSessions,
      totalMinutes: Math.round(totalMinutes / 60), // Convert to minutes
      completedCount,
      streak
    };
  };

  const calculateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasSession = sessions.some(session => 
        session.timestamp && session.timestamp.split('T')[0] === dateStr
      );

      if (hasSession) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const stats = getExerciseStats();

  // Prevent hydration errors by not rendering dynamic content until client-side
  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Wellness Exercises</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from a variety of guided exercises designed to improve your mental health, 
          reduce stress, and enhance overall well-being.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMinutes}m</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {exerciseCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md text-sm bg-background"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No exercises found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setDifficultyFilter('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ExerciseGrid
          exercises={filteredExercises.map(exercise => ({
            ...exercise,
            isCompleted: completedExercises.has(exercise.id)
          }))}
          onStartExercise={handleStartExercise}
        />
      )}

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Sessions</h2>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{session.name || session.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.difficulty && `${session.difficulty} • `}
                          {session.duration ? `${Math.round(session.duration / 60)}m` : 'Completed'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {session.timestamp && new Date(session.timestamp).toLocaleDateString()}
                      </p>
                      {session.score && (
                        <p className="font-bold text-primary">{session.score} pts</p>
                      )}
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
