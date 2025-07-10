'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Brain, 
  Heart, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { useMoodStore, useFeedbackStore, useExerciseStore, useChatStore } from '@/lib/store';
import { useDataInitialization } from '@/lib/useDataInitialization';

export default function InsightsPage() {
  const { user } = useUser();
  const { moods } = useMoodStore();
  const { entries: feedbackEntries, loadEntriesFromAPI: loadFeedbackEntries } = useFeedbackStore();
  const { sessions: exerciseSessions, loadSessionsFromAPI: loadExerciseSessions } = useExerciseStore();
  const { messages } = useChatStore();
  const dataInit = useDataInitialization();

  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('mood'); // mood, activity, engagement
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (dataInit.userId || dataInit.guestId) {
      loadFeedbackEntries(dataInit.userId, dataInit.guestId);
      loadExerciseSessions(dataInit.userId, dataInit.guestId);
    }
  }, [dataInit.userId, dataInit.guestId, loadFeedbackEntries, loadExerciseSessions]);

  // Force re-render when exercise sessions change
  useEffect(() => {
    // This effect ensures the component re-renders when exercise sessions are updated
  }, [exerciseSessions]);

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

  // Calculate insights - only after hydration and with proper null checks
  const calculateMoodTrend = () => {
    if (!moods || moods.length < 2) return 0;
    const recent = moods.slice(0, 7);
    const previous = moods.slice(7, 14);
    
    if (recent.length === 0 || previous.length === 0) return 0;
    
    const recentAvg = recent.reduce((acc, entry) => acc + entry.mood, 0) / recent.length;
    const previousAvg = previous.reduce((acc, entry) => acc + entry.mood, 0) / previous.length;
    
    return ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1);
  };

  const getMoodData = () => {
    if (!moods) return [];
    
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayEntries = moods.filter(entry => 
        entry.date && entry.date.split('T')[0] === date
      );
      const avgMood = dayEntries.length > 0 
        ? dayEntries.reduce((acc, entry) => acc + entry.mood, 0) / dayEntries.length 
        : null;
      
      return {
        date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        mood: avgMood ? avgMood.toFixed(1) : null,
        entries: dayEntries.length
      };
    }).filter(item => item.mood !== null);
  };

  const getActivityData = () => {
    const activities = ['breathing', 'memory-sequence', 'color-match', 'reaction-timer', 'chat', 'journal'];
    return activities.map(activity => {
      let count = 0;
      
      switch (activity) {
        case 'breathing':
          count = exerciseSessions ? exerciseSessions.filter(s => s.exerciseType === 'breathing').length : 0;
          break;
        case 'memory-sequence':
          count = exerciseSessions ? exerciseSessions.filter(s => s.exerciseType === 'game' && s.gameType === 'memory-sequence').length : 0;
          break;
        case 'color-match':
          count = exerciseSessions ? exerciseSessions.filter(s => s.exerciseType === 'game' && s.gameType === 'color-match').length : 0;
          break;
        case 'reaction-timer':
          count = exerciseSessions ? exerciseSessions.filter(s => s.exerciseType === 'game' && s.gameType === 'reaction-timer').length : 0;
          break;
        case 'chat':
          count = messages ? messages.length : 0;
          break;
        case 'journal':
          count = feedbackEntries ? feedbackEntries.filter(e => e.type === 'journal').length : 0;
          break;
      }
      
      return {
        name: activity === 'memory-sequence' ? 'Memory' : 
              activity === 'color-match' ? 'Color Match' : 
              activity === 'reaction-timer' ? 'Reaction' :
              activity.charAt(0).toUpperCase() + activity.slice(1),
        value: count,
        color: {
          breathing: '#3b82f6',
          'memory-sequence': '#8b5cf6',
          'color-match': '#ef4444',
          'reaction-timer': '#f59e0b',
          chat: '#10b981',
          journal: '#f59e0b'
        }[activity]
      };
    });
  };

  const getEngagementStats = () => {
    const safeExerciseSessions = exerciseSessions || [];
    const safeMessages = messages || [];
    const safeFeedbackEntries = feedbackEntries || [];
    const safeMoods = moods || [];
    
    const totalSessions = safeExerciseSessions.length + safeMessages.length + safeFeedbackEntries.length;
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const weeklyActivity = [
      ...safeExerciseSessions,
      ...safeMessages.map(c => ({ timestamp: c.timestamp || c.createdAt })),
      ...safeFeedbackEntries
    ].filter(item => item.timestamp && new Date(item.timestamp) > thisWeek).length;

    const avgMood = safeMoods.length > 0 
      ? (safeMoods.reduce((acc, entry) => acc + entry.mood, 0) / safeMoods.length).toFixed(1)
      : 0;

    const streakDays = calculateStreakDays();
    const totalExerciseTime = getTotalExerciseTime();
    const exerciseStreak = calculateExerciseStreak();
    const weeklyExerciseTime = getWeeklyExerciseTime();

    return {
      totalSessions,
      weeklyActivity,
      avgMood,
      streakDays,
      totalExerciseTime,
      exerciseStreak,
      weeklyExerciseTime
    };
  };

  const getTotalExerciseTime = () => {
    const safeExerciseSessions = exerciseSessions || [];
    return safeExerciseSessions.reduce((total, session) => total + (session.duration || 0), 0);
  };

  const getWeeklyExerciseTime = () => {
    const safeExerciseSessions = exerciseSessions || [];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    return safeExerciseSessions
      .filter(session => session.timestamp && new Date(session.timestamp) > thisWeek)
      .reduce((total, session) => total + (session.duration || 0), 0);
  };

  const calculateExerciseStreak = () => {
    const safeExerciseSessions = exerciseSessions || [];
    if (safeExerciseSessions.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasExercise = safeExerciseSessions.some(session => 
        session.timestamp && session.timestamp.split('T')[0] === dateStr
      );

      if (hasExercise) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getExerciseTypeStats = () => {
    const safeExerciseSessions = exerciseSessions || [];
    const stats = {};
    
    safeExerciseSessions.forEach(session => {
      const type = session.exerciseType || 'other';
      if (!stats[type]) {
        stats[type] = {
          count: 0,
          totalDuration: 0,
          averageDuration: 0
        };
      }
      stats[type].count++;
      stats[type].totalDuration += session.duration || 0;
    });

    // Calculate averages
    Object.keys(stats).forEach(type => {
      stats[type].averageDuration = Math.round(stats[type].totalDuration / stats[type].count);
    });

    return stats;
  };

  const calculateStreakDays = () => {
    const safeMoods = moods || [];
    const safeFeedbackEntries = feedbackEntries || [];
    const safeExerciseSessions = exerciseSessions || [];
    
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasActivity = [
        ...safeMoods.map(m => ({ timestamp: m.date })),
        ...safeFeedbackEntries,
        ...safeExerciseSessions
      ].some(item => item.timestamp && item.timestamp.split('T')[0] === dateStr);

      if (hasActivity) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const moodTrend = calculateMoodTrend();
  const moodData = getMoodData();
  const activityData = getActivityData();
  const engagementStats = getEngagementStats();
  const exerciseTypeStats = getExerciseTypeStats();

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Wellness Insights</h1>
          <p className="text-muted-foreground">
            Track your progress and discover patterns in your wellness journey
          </p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{engagementStats.avgMood}</p>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
                <div className="flex items-center gap-1 mt-1">
                  {parseFloat(moodTrend) > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${parseFloat(moodTrend) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(moodTrend)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{engagementStats.weeklyActivity}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  Activities
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{engagementStats.streakDays}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  Consistency
                </Badge>
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
                <p className="text-2xl font-bold">{formatTime(engagementStats.totalExerciseTime)}</p>
                <p className="text-sm text-muted-foreground">Exercise Time</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  All Time
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{engagementStats.exerciseStreak}</p>
                <p className="text-sm text-muted-foreground">Exercise Streak</p>
                <p className="text-xs text-muted-foreground mt-1">Consecutive days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTime(engagementStats.weeklyExerciseTime)}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-xs text-muted-foreground mt-1">Exercise time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(exerciseSessions || []).length}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-xs text-muted-foreground mt-1">Exercises completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Type Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Exercise Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(exerciseTypeStats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(exerciseTypeStats).map(([type, stats]) => (
                <div key={type} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize mb-2">
                    {type} Exercises
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                      <span className="font-medium">{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Time:</span>
                      <span className="font-medium">{formatTime(stats.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Duration:</span>
                      <span className="font-medium">{formatTime(stats.averageDuration)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No exercise data available yet</p>
                <p className="text-sm">Complete some exercises to see your breakdown</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mood Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mood Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip 
                    formatter={(value) => [value, 'Mood']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No mood data available yet</p>
                  <p className="text-sm">Start tracking your mood to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Activity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={activityData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activity data available yet</p>
                  <p className="text-sm">Start using the app to see your activity breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Pattern */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Activity Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              // Calculate activity for this day of week with null checks
              const safeMoods = moods || [];
              const safeFeedbackEntries = feedbackEntries || [];
              const safeExerciseSessions = exerciseSessions || [];
              
              const dayActivity = [
                ...safeMoods.map(m => ({ timestamp: m.date })),
                ...safeFeedbackEntries,
                ...safeExerciseSessions
              ].filter(item => item.timestamp && new Date(item.timestamp).getDay() === (index + 1) % 7)
                .length;
              
              const maxActivity = Math.max(1, ...Array.from({ length: 7 }, (_, i) => 
                [
                  ...safeMoods.map(m => ({ timestamp: m.date })),
                  ...safeFeedbackEntries,
                  ...safeExerciseSessions
                ].filter(item => item.timestamp && new Date(item.timestamp).getDay() === (i + 1) % 7)
                  .length
              ));
              
              const intensity = dayActivity / maxActivity;
              
              return (
                <div key={day} className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">{day}</p>
                  <div className="space-y-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-3 rounded ${
                          i < intensity * 5 
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{dayActivity}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Personalized Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {moodTrend && parseFloat(moodTrend) > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Mood Improving
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your mood has improved by {moodTrend}% this week. Keep up the great work!
              </p>
            </div>
          )}

          {engagementStats.exerciseStreak >= 7 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Exercise Consistency Champion
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You've maintained a {engagementStats.exerciseStreak}-day exercise streak! Your dedication to wellness is paying off.
              </p>
            </div>
          )}

          {exerciseSessions.filter(s => s.exerciseType === 'breathing').length > 10 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-200">
                  Breathing Expert
                </span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                You've completed over 10 breathing exercises! This is excellent for stress management and mindfulness.
              </p>
            </div>
          )}

          {exerciseSessions.filter(s => s.exerciseType === 'game').length > 5 && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-indigo-600" />
                <span className="font-medium text-indigo-800 dark:text-indigo-200">
                  Mental Fitness Champion
                </span>
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                You've completed multiple cognitive training games! This helps improve focus, memory, and reaction time.
              </p>
            </div>
          )}

          {exerciseSessions.filter(s => s.gameType === 'color-match').length > 3 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800 dark:text-red-200">
                  Focus Master
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                Your color matching skills are improving! This exercise enhances attention and visual processing.
              </p>
            </div>
          )}

          {engagementStats.totalExerciseTime > 300 && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-800 dark:text-emerald-200">
                  Time Investment Champion
                </span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                You've invested {formatTime(engagementStats.totalExerciseTime)} in wellness exercises! Time well spent for your mental health.
              </p>
            </div>
          )}

          {engagementStats.streakDays >= 7 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Consistency Champion
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You've maintained a {engagementStats.streakDays}-day wellness streak! Consistency is key to building healthy habits.
              </p>
            </div>
          )}

          {engagementStats.weeklyExerciseTime < 180 && (exerciseSessions || []).length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-200">
                  Gentle Exercise Reminder
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Try to spend at least 3 minutes on exercises this week. Even short sessions can make a big difference!
              </p>
            </div>
          )}

          {engagementStats.weeklyActivity < 3 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800 dark:text-orange-200">
                  Gentle Reminder
                </span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Try to engage with wellness activities at least 3 times this week for better results.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
