'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Circle, Plus, Clock, TrendingUp, Target } from 'lucide-react';
import { useHabitStore } from '@/lib/store';
import Link from 'next/link';

export function HabitTracker({ isWidget = false }) {
  const { 
    habits, 
    completions, 
    toggleHabitCompletion, 
    getTodaysHabits, 
    loadFromLocalStorage,
    generateDailyQuests,
    updateQuestProgress 
  } = useHabitStore();
  
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    loadFromLocalStorage();
    // Generate daily quests and update progress on mount
    generateDailyQuests();
    updateQuestProgress();
  }, [loadFromLocalStorage, generateDailyQuests, updateQuestProgress]);

  const handleToggleHabit = async (habitId) => {
    await toggleHabitCompletion(habitId);
  };

  // Get today's habits directly from store, no local state needed
  const todaysHabits = isHydrated ? getTodaysHabits() : [];

  const getCompletionStats = () => {
    const total = todaysHabits.length;
    const completed = todaysHabits.filter(h => h.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  };

  const stats = getCompletionStats();

  if (!isHydrated) {
    return (
      <Card className={isWidget ? "h-full" : ""}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Widget view for dashboard
  if (isWidget) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Habits</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.completed}/{stats.total}</span>
                <Badge variant={stats.percentage >= 80 ? "default" : stats.percentage >= 50 ? "secondary" : "outline"}>
                  {stats.percentage}%
                </Badge>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Today's completion</p>
            </div>

            {/* Today's Habits Preview */}
            <div className="space-y-2">
              {todaysHabits.slice(0, 3).map((habit) => (
                <div key={habit.id} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className="flex-shrink-0"
                  >
                    {habit.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                  <span className={`text-xs flex-1 ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {habit.title}
                  </span>
                  {habit.streak > 0 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {habit.streak}
                    </Badge>
                  )}
                </div>
              ))}
              
              {todaysHabits.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{todaysHabits.length - 3} more habits
                </p>
              )}
              
              {todaysHabits.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No habits yet. Create your first habit!
                </p>
              )}
            </div>

            {/* Action Button */}
            <Link href="/habits">
              <Button variant="outline" size="sm" className="w-full">
                {todaysHabits.length > 0 ? 'View All Habits' : 'Create Habit'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full view (not currently used in this component, but ready for expansion)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Habits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todaysHabits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggleHabit(habit.id)}
                  className="flex-shrink-0"
                >
                  {habit.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                <div>
                  <h3 className={`font-medium ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {habit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{habit.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {habit.streak > 0 && (
                  <Badge variant="outline">
                    {habit.streak} day streak
                  </Badge>
                )}
                <Badge variant="secondary">
                  {habit.completionRate}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
