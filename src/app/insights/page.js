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

export default function InsightsPage() {
  const { user } = useUser();
  const { moods } = useMoodStore();
  const { entries: feedbackEntries, getEntries: getFeedbackEntries } = useFeedbackStore();
  const { sessions: exerciseSessions, getSessions: getExerciseSessions } = useExerciseStore();
  const { conversations } = useChatStore();

  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('mood'); // mood, activity, engagement
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    getFeedbackEntries();
    getExerciseSessions();
  }, [getFeedbackEntries, getExerciseSessions]);

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
    const activities = ['breathing', 'chat', 'journal', 'game'];
    return activities.map(activity => {
      let count = 0;
      
      switch (activity) {
        case 'breathing':
          count = exerciseSessions ? exerciseSessions.filter(s => s.type === 'breathing').length : 0;
          break;
        case 'chat':
          count = conversations ? conversations.length : 0;
          break;
        case 'journal':
          count = feedbackEntries ? feedbackEntries.filter(e => e.type === 'journal').length : 0;
          break;
        case 'game':
          count = exerciseSessions ? exerciseSessions.filter(s => s.type === 'game').length : 0;
          break;
      }
      
      return {
        name: activity.charAt(0).toUpperCase() + activity.slice(1),
        value: count,
        color: {
          breathing: '#3b82f6',
          chat: '#10b981',
          journal: '#f59e0b',
          game: '#8b5cf6'
        }[activity]
      };
    });
  };

  const getEngagementStats = () => {
    const safeExerciseSessions = exerciseSessions || [];
    const safeConversations = conversations || [];
    const safeFeedbackEntries = feedbackEntries || [];
    const safeMoods = moods || [];
    
    const totalSessions = safeExerciseSessions.length + safeConversations.length + safeFeedbackEntries.length;
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const weeklyActivity = [
      ...safeExerciseSessions,
      ...safeConversations.map(c => ({ timestamp: c.updatedAt || c.createdAt })),
      ...safeFeedbackEntries
    ].filter(item => item.timestamp && new Date(item.timestamp) > thisWeek).length;

    const avgMood = safeMoods.length > 0 
      ? (safeMoods.reduce((acc, entry) => acc + entry.mood, 0) / safeMoods.length).toFixed(1)
      : 0;

    const streakDays = calculateStreakDays();

    return {
      totalSessions,
      weeklyActivity,
      avgMood,
      streakDays
    };
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
                <p className="text-2xl font-bold">{engagementStats.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  All Time
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

          {exerciseSessions.filter(s => s.type === 'breathing').length > 10 && (
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
