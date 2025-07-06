'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAppStore, useMoodStore, useChatStore } from '../../lib/store';
import { 
  Heart, MessageCircle, Activity, Calendar, Target, 
  TrendingUp, Smile, Brain, Moon, Sun, Settings,
  Plus, BarChart3, BookOpen, Headphones
} from 'lucide-react';
import Link from 'next/link';
import { getRandomQuote, getMoodData, isToday } from '../../lib/utils';

export default function DashboardPage() {
  const { user } = useUser();
  const { preferences, guestId, isDarkMode } = useAppStore();
  const { moods, todaysMood, addMood, getAverageMood } = useMoodStore();
  const { messages } = useChatStore();
  
  const [todaysQuote, setTodaysQuote] = useState('');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setTodaysQuote(getRandomQuote());
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch by showing loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = preferences.name || 'Friend';
  const recentMoods = moods.slice(-7);
  const averageMood = getAverageMood(7);
  const hasChatToday = messages.some(msg => isToday(msg.timestamp));
  const todaysMoodData = todaysMood ? getMoodData(todaysMood.mood) : null;

  const stats = [
    {
      title: "Today's Mood",
      value: todaysMoodData ? `${todaysMoodData.emoji} ${todaysMoodData.label}` : 'Not set',
      icon: <Smile className="w-5 h-5" />,
      color: todaysMoodData ? todaysMoodData.color : 'bg-gray-500',
      action: () => setShowMoodModal(true)
    },
    {
      title: '7-Day Average',
      value: averageMood > 0 ? `${averageMood}/5` : 'No data',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Check-ins',
      value: moods.length,
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      title: 'Chat Sessions',
      value: messages.length,
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    {
      title: 'Chat with AI',
      description: 'Get support and guidance',
      icon: <MessageCircle className="w-6 h-6" />,
      href: '/chat',
      color: 'bg-blue-500'
    },
    {
      title: 'Mood Check-in',
      description: 'Log how you\'re feeling',
      icon: <Heart className="w-6 h-6" />,
      onClick: () => setShowMoodModal(true),
      color: 'bg-red-500'
    },
    {
      title: 'Breathing Exercise',
      description: '4-7-8 breathing technique',
      icon: <Brain className="w-6 h-6" />,
      href: '/exercises/breathing',
      color: 'bg-green-500'
    },
    {
      title: 'Journal Entry',
      description: 'Reflect and write',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/journal',
      color: 'bg-purple-500'
    }
  ];

  const recentActivities = [
    ...(todaysMood ? [{
      type: 'mood',
      time: new Date(todaysMood.date).toLocaleTimeString(),
      description: `Mood check-in: ${getMoodData(todaysMood.mood).label}`,
      icon: <Heart className="w-4 h-4" />
    }] : []),
    ...(hasChatToday ? [{
      type: 'chat',
      time: new Date().toLocaleTimeString(),
      description: 'Had a chat session',
      icon: <MessageCircle className="w-4 h-4" />
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">CalmConnect</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/emergency"
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Crisis Support
              </Link>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-2xl">
              {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userName}!
            </h1>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
            <h2 className="text-lg font-semibold mb-2">Today's Inspiration</h2>
            <p className="text-blue-100 italic">"{todaysQuote}"</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow ${
                stat.action ? 'cursor-pointer' : ''
              }`}
              onClick={stat.action}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <ActionCard key={index} action={action} />
              ))}
            </div>

            {/* Mood Trends */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mood Trends</h3>
                <Link 
                  href="/insights" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
              
              {recentMoods.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Past 7 days</span>
                    <span>Average: {averageMood}/5</span>
                  </div>
                  <div className="flex items-end space-x-2 h-24">
                    {recentMoods.map((mood, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full ${getMoodData(mood.mood).color} rounded-t`}
                          style={{ height: `${(mood.mood / 5) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(mood.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start tracking your mood to see trends here</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-1 bg-gray-100 rounded">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity today yet</p>
                </div>
              )}
            </div>

            {/* Wellness Resources */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Resources</h3>
              
              <div className="space-y-3">
                <Link 
                  href="/exercises"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Headphones className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Mindfulness Exercises</p>
                    <p className="text-sm text-gray-500">Guided meditations & breathing</p>
                  </div>
                </Link>
                
                <Link 
                  href="/games"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Calming Games</p>
                    <p className="text-sm text-gray-500">Stress-relief activities</p>
                  </div>
                </Link>
                
                <Link 
                  href="/emergency"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Crisis Support</p>
                    <p className="text-sm text-gray-500">Immediate help resources</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Modal */}
      {showMoodModal && (
        <MoodModal 
          onClose={() => setShowMoodModal(false)}
          onSave={(moodData) => {
            addMood({
              ...moodData,
              guestId: !session ? guestId : undefined,
            });
            setShowMoodModal(false);
          }}
        />
      )}
    </div>
  );
}

function ActionCard({ action }) {
  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
          {action.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
          <p className="text-sm text-gray-600">{action.description}</p>
        </div>
      </div>
    </div>
  );

  if (action.href) {
    return <Link href={action.href}>{content}</Link>;
  }

  return <div onClick={action.onClick}>{content}</div>;
}

function MoodModal({ onClose, onSave }) {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState('');
  
  const moods = [
    { value: 1, label: 'Terrible', emoji: '😢', color: 'bg-red-500' },
    { value: 2, label: 'Poor', emoji: '😔', color: 'bg-orange-500' },
    { value: 3, label: 'Okay', emoji: '😐', color: 'bg-yellow-500' },
    { value: 4, label: 'Good', emoji: '😊', color: 'bg-green-500' },
    { value: 5, label: 'Excellent', emoji: '😄', color: 'bg-blue-500' }
  ];

  const handleSave = () => {
    onSave({
      mood,
      emoji: moods.find(m => m.value === mood)?.emoji || '😐',
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How are you feeling?</h2>
          <p className="text-gray-600">Track your mood to understand your patterns</p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {moods.map((moodOption) => (
            <button
              key={moodOption.value}
              onClick={() => setMood(moodOption.value)}
              className={`p-3 rounded-xl text-center transition-all duration-200 ${
                mood === moodOption.value 
                  ? `${moodOption.color} text-white ring-2 ring-offset-2 ring-blue-500` 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">{moodOption.emoji}</div>
              <div className="text-xs font-medium">{moodOption.label}</div>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How was your day? (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What made you feel this way?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Save Mood
          </button>
        </div>
      </div>
    </div>
  );
}
