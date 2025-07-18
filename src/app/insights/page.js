'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Header from '@/components/Header';
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
  Clock,
  ChevronDown
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
    // Only load from API for authenticated users, guest data is handled by persistence middleware
    if (dataInit.userId) {
      loadFeedbackEntries(dataInit.userId, dataInit.guestId);
      loadExerciseSessions(dataInit.userId, dataInit.guestId, dataInit.getToken);
    } else if (dataInit.guestId) {
      // For guests, only load feedback entries (exercises are handled by persistence)
      loadFeedbackEntries(dataInit.userId, dataInit.guestId);
    }
  }, [dataInit.userId, dataInit.guestId, dataInit.getToken, loadFeedbackEntries, loadExerciseSessions]);

  // Force re-render when exercise sessions change
  useEffect(() => {
    // This effect ensures the component re-renders when exercise sessions are updated
  }, [exerciseSessions]);

  // Prevent hydration errors by not rendering dynamic content until client-side
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
          <p style={{ color: '#6E55A0' }}>Loading your insights...</p>
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
          breathing: '#8A6FBF',
          'memory-sequence': '#E3DEF1',
          'color-match': '#6E55A0',
          'reaction-timer': '#F7F5FA',
          chat: '#8A6FBF',
          journal: '#6E55A0'
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    },
    hover: {
      y: -5,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      <Header/>

      {/* Main Content */}
      <main className="pt-20 px-6 pb-12">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title Section */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#6E55A0' }}>
                Wellness Insights
              </h1>
              <p className="text-lg" style={{ color: '#8A6FBF' }}>
                Track your progress and discover patterns in your wellness journey
              </p>
            </div>
            <div className="flex gap-2">
              {['week', 'month', 'quarter'].map((range) => (
                <motion.button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    timeRange === range
                      ? 'text-white'
                      : 'bg-white hover:text-white'
                  }`}
                  style={
                    timeRange === range
                      ? { backgroundColor: '#8A6FBF' }
                      : { 
                          color: '#6E55A0',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (timeRange !== range) {
                      e.target.style.backgroundColor = '#E3DEF1'
                      e.target.style.color = '#6E55A0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (timeRange !== range) {
                      e.target.style.backgroundColor = 'white'
                      e.target.style.color = '#6E55A0'
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Key Metrics Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Avg Mood Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute -top-2 -right-2 text-2xl opacity-20">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl opacity-20">✨</div>
              
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-sm font-medium">Avg Mood</p>
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">{engagementStats.avgMood}</p>
              <div className="flex items-center gap-1 mt-2">
                {parseFloat(moodTrend) > 0 ? (
                  <TrendingUp className="h-3 w-3 text-white" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-white" />
                )}
                <span className="text-xs text-white/80">
                  {Math.abs(moodTrend)}%
                </span>
              </div>
            </motion.div>

            {/* Weekly Activity Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-r from-green-400 to-green-500 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute -top-2 -right-2 text-2xl opacity-20">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl opacity-20">✨</div>
              
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-sm font-medium">This Week</p>
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">{engagementStats.weeklyActivity}</p>
              <p className="text-xs text-white/80 mt-2">Activities</p>
            </motion.div>

            {/* Day Streak Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute -top-2 -right-2 text-2xl opacity-20">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl opacity-20">✨</div>
              
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-sm font-medium">Day Streak</p>
                <Target className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">{engagementStats.streakDays}</p>
              <p className="text-xs text-white/80 mt-2">Consistency</p>
            </motion.div>

            {/* Exercise Time Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute -top-2 -right-2 text-2xl opacity-20">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl opacity-20">✨</div>
              
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-sm font-medium">Exercise Time</p>
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">{formatTime(engagementStats.totalExerciseTime)}</p>
              <p className="text-xs text-white/80 mt-2">All Time</p>
            </motion.div>
          </motion.div>

          {/* Additional Metrics */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#E3DEF1' }}>
                  <Activity className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#6E55A0' }}>{engagementStats.exerciseStreak}</p>
                  <p className="text-sm" style={{ color: '#8A6FBF' }}>Exercise Streak</p>
                  <p className="text-xs" style={{ color: '#8A6FBF' }}>Consecutive days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#E3DEF1' }}>
                  <Clock className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#6E55A0' }}>{formatTime(engagementStats.weeklyExerciseTime)}</p>
                  <p className="text-sm" style={{ color: '#8A6FBF' }}>This Week</p>
                  <p className="text-xs" style={{ color: '#8A6FBF' }}>Exercise time</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#E3DEF1' }}>
                  <Brain className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#6E55A0' }}>{(exerciseSessions || []).length}</p>
                  <p className="text-sm" style={{ color: '#8A6FBF' }}>Total Sessions</p>
                  <p className="text-xs" style={{ color: '#8A6FBF' }}>Exercises completed</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Exercise Type Breakdown */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#6E55A0' }}>Exercise Type Breakdown</h2>
              </div>
              
              {Object.keys(exerciseTypeStats).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(exerciseTypeStats).map(([type, stats]) => (
                    <motion.div 
                      key={type} 
                      className="rounded-xl p-4"
                      style={{ backgroundColor: '#E3DEF1' }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="font-semibold capitalize mb-2" style={{ color: '#6E55A0' }}>
                        {type} Exercises
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: '#8A6FBF' }}>Sessions:</span>
                          <span className="font-medium" style={{ color: '#6E55A0' }}>{stats.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#8A6FBF' }}>Total Time:</span>
                          <span className="font-medium" style={{ color: '#6E55A0' }}>{formatTime(stats.totalDuration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#8A6FBF' }}>Avg Duration:</span>
                          <span className="font-medium" style={{ color: '#6E55A0' }}>{formatTime(stats.averageDuration)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" style={{ color: '#8A6FBF' }} />
                    <p style={{ color: '#6E55A0' }}>No exercise data available yet</p>
                    <p className="text-sm" style={{ color: '#8A6FBF' }}>Complete some exercises to see your breakdown</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Mood Trend Chart */}
            <motion.div variants={itemVariants}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                  <h2 className="text-xl font-bold" style={{ color: '#6E55A0' }}>Mood Trend</h2>
                </div>
                
                {moodData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E3DEF1" />
                      <XAxis dataKey="date" stroke="#8A6FBF" />
                      <YAxis domain={[1, 5]} stroke="#8A6FBF" />
                      <Tooltip 
                        formatter={(value) => [value, 'Mood']}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E3DEF1',
                          borderRadius: '8px',
                          color: '#6E55A0'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="#8A6FBF"
                        fill="#8A6FBF"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center">
                    <div className="text-center">
                      <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" style={{ color: '#8A6FBF' }} />
                      <p style={{ color: '#6E55A0' }}>No mood data available yet</p>
                      <p className="text-sm" style={{ color: '#8A6FBF' }}>Start tracking your mood to see trends</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* Activity Distribution */}
            <motion.div variants={itemVariants}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <PieChart className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                  <h2 className="text-xl font-bold" style={{ color: '#6E55A0' }}>Activity Distribution</h2>
                </div>
                
                {activityData.some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={activityData.filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8A6FBF"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E3DEF1',
                          borderRadius: '8px',
                          color: '#6E55A0'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" style={{ color: '#8A6FBF' }} />
                      <p style={{ color: '#6E55A0' }}>No activity data available yet</p>
                      <p className="text-sm" style={{ color: '#8A6FBF' }}>Start using the app to see your activity breakdown</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Weekly Pattern */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#6E55A0' }}>Weekly Activity Pattern</h2>
              </div>
              
              <div className="grid grid-cols-7 gap-4">
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
                    <motion.div 
                      key={day} 
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm mb-2" style={{ color: '#8A6FBF' }}>{day}</p>
                      <div className="space-y-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <motion.div
                            key={i}
                            className="h-3 rounded"
                            style={{
                              backgroundColor: i < intensity * 5 ? '#8A6FBF' : '#E3DEF1'
                            }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#6E55A0' }}>{dayActivity}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Insights & Recommendations */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <Brain className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#6E55A0' }}>Personalized Insights</h2>
              </div>
              
              <div className="space-y-4">
                {moodTrend && parseFloat(moodTrend) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 rounded-xl border-2"
                    style={{ 
                      backgroundColor: '#D1FAE5',
                      borderColor: '#10B981',
                      color: '#059669'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">Mood Improving</span>
                    </div>
                    <p className="text-sm">
                      Your mood has improved by {moodTrend}% this week. Keep up the great work!
                    </p>
                  </motion.div>
                )}

                {engagementStats.exerciseStreak >= 7 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="p-4 rounded-xl border-2"
                    style={{ 
                      backgroundColor: '#DBEAFE',
                      borderColor: '#3B82F6',
                      color: '#1D4ED8'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Exercise Consistency Champion</span>
                    </div>
                    <p className="text-sm">
                      You've maintained a {engagementStats.exerciseStreak}-day exercise streak! Your dedication to wellness is paying off.
                    </p>
                  </motion.div>
                )}

                {exerciseSessions.filter(s => s.exerciseType === 'breathing').length > 10 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="p-4 rounded-xl border-2"
                    style={{ 
                      backgroundColor: '#F3E8FF',
                      borderColor: '#8B5CF6',
                      color: '#7C3AED'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">Breathing Expert</span>
                    </div>
                    <p className="text-sm">
                      You've completed over 10 breathing exercises! This is excellent for stress management and mindfulness.
                    </p>
                  </motion.div>
                )}

                {exerciseSessions.filter(s => s.exerciseType === 'game').length > 5 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="p-4 rounded-xl border-2"
                    style={{ 
                      backgroundColor: '#EEF2FF',
                      borderColor: '#6366F1',
                      color: '#4F46E5'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4" />
                      <span className="font-medium">Mental Fitness Champion</span>
                    </div>
                    <p className="text-sm">
                      You've completed multiple cognitive training games! This helps improve focus, memory, and reaction time.
                    </p>
                  </motion.div>
                )}

                {engagementStats.weeklyActivity < 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="p-4 rounded-xl border-2"
                    style={{ 
                      backgroundColor: '#FEF3C7',
                      borderColor: '#F59E0B',
                      color: '#D97706'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Gentle Reminder</span>
                    </div>
                    <p className="text-sm">
                      Try to engage with wellness activities at least 3 times this week for better results.
                    </p>
                  </motion.div>
                )}

                {/* Show default message if no insights */}
                {!(moodTrend && parseFloat(moodTrend) > 0) && 
                 engagementStats.exerciseStreak < 7 && 
                 exerciseSessions.filter(s => s.exerciseType === 'breathing').length <= 10 && 
                 exerciseSessions.filter(s => s.exerciseType === 'game').length <= 5 && 
                 engagementStats.weeklyActivity >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 rounded-xl border-2 text-center"
                    style={{ 
                      backgroundColor: '#E3DEF1',
                      borderColor: '#8A6FBF',
                      color: '#6E55A0'
                    }}
                  >
                    <Brain className="h-8 w-8 mx-auto mb-2" style={{ color: '#8A6FBF' }} />
                    <p className="font-medium mb-2">Keep Building Your Wellness Journey</p>
                    <p className="text-sm">
                      Continue using the app regularly to unlock personalized insights and track your progress over time.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}