"use client"

import React, { useState, useEffect } from "react"
import { useUser } from '@clerk/nextjs'
import { useAppStore, useMoodStore, useChatStore } from '../../lib/store'
import { useDataInitialization } from '../../lib/useDataInitialization'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import PandaLogo from "@/components/PandaLogo"
import Navigation from "@/components/Navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import {
  Calendar,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Smile,
  Play,
  ChevronDown,
  MapPin,
  Heart,
  MessageCircle,
  Activity,
  Target,
  TrendingUp,
  Brain,
  BookOpen,
  Headphones,
  Settings,
  Plus
} from "lucide-react"
import Link from 'next/link'
import { getRandomQuote, getMoodData, isToday } from '../../lib/utils'
import { HabitTracker } from '../../components/HabitTracker'
import { DailyQuests } from '../../components/DailyQuests'

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showMoodModal, setShowMoodModal] = useState(false)
  const [todaysQuote, setTodaysQuote] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)

  // Store hooks
  const { user } = useUser()
  const { preferences, guestId, isDarkMode } = useAppStore()
  const { moods, todaysMood, addMood, getAverageMood } = useMoodStore()
  const { messages } = useChatStore()
  const dataInit = useDataInitialization()

  useEffect(() => {
    setTodaysQuote(getRandomQuote())
    setIsHydrated(true)
  }, [])

  // Prevent hydration mismatch
  if (!isHydrated || !dataInit.isReady) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
            <p style={{ color: '#6E55A0' }}>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Current user and time data
  const userName = preferences.name || user?.firstName || "HakashiKatake"
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
  const currentDate = "Jul 13 - Jul 29"

  // Data calculations
  const recentMoods = Array.isArray(moods) ? moods.slice(-7) : []
  const averageMood = getAverageMood(7)
  const hasChatToday = Array.isArray(messages) ? messages.some(msg => isToday(msg.timestamp)) : false
  const todaysMoodData = todaysMood ? getMoodData(todaysMood.mood) : null

  // Convert mood data for chart
  const moodChartData = recentMoods.map((mood, index) => ({
    time: new Date(mood.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    value: (mood.mood / 5) * 100,
    color: getMoodData(mood.mood).color === 'bg-red-500' ? '#EF4444' :
           getMoodData(mood.mood).color === 'bg-orange-500' ? '#F97316' :
           getMoodData(mood.mood).color === 'bg-yellow-500' ? '#EAB308' :
           getMoodData(mood.mood).color === 'bg-green-500' ? '#22C55E' :
           '#3B82F6'
  }))

  // Mock activity data (you can replace with real data)
  const activityData = [
    { day: "Sun", meditation: 40, breathing: 30, journal: 50 },
    { day: "Mon", meditation: 20, breathing: 60, journal: 40 },
    { day: "Tue", meditation: 70, breathing: 40, journal: 30 },
    { day: "Wed", meditation: 30, breathing: 50, journal: 60 },
    { day: "Thu", meditation: 60, breathing: 30, journal: 40 },
    { day: "Fri", meditation: 40, breathing: 70, journal: 50 },
    { day: "Sat", meditation: 80, breathing: 50, journal: 30 },
  ]

  // SVG Components for Stats Cards
  const SadEmojiSVG = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="#FFD700"/>
      <circle cx="18" cy="20" r="2" fill="#000"/>
      <circle cx="30" cy="20" r="2" fill="#000"/>
      <path d="M16 32 C20 28, 28 28, 32 32" stroke="#000" strokeWidth="2" fill="none"/>
      <path d="M14 18 L10 14 M34 18 L38 14" stroke="#000" strokeWidth="2"/>
    </svg>
  )

  const HappyEmojiSVG = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="#FFD700"/>
      <circle cx="18" cy="20" r="2" fill="#000"/>
      <circle cx="30" cy="20" r="2" fill="#000"/>
      <path d="M16 28 C20 32, 28 32, 32 28" stroke="#000" strokeWidth="2" fill="none"/>
    </svg>
  )

  const TrendUpSVG = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 36 L18 24 L24 30 L42 12" stroke="#4F46E5" strokeWidth="3" fill="none"/>
      <path d="M32 12 L42 12 L42 22" stroke="#4F46E5" strokeWidth="3" fill="none"/>
      <circle cx="18" cy="24" r="2" fill="#4F46E5"/>
      <circle cx="24" cy="30" r="2" fill="#4F46E5"/>
      <circle cx="42" cy="12" r="2" fill="#4F46E5"/>
    </svg>
  )

  const ChecklistSVG = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="32" height="36" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="2"/>
      <rect x="6" y="4" width="32" height="36" rx="4" fill="#374151"/>
      <path d="M14 16 L18 20 L26 12" stroke="#10B981" strokeWidth="2" fill="none"/>
      <path d="M14 24 L18 28 L26 20" stroke="#10B981" strokeWidth="2" fill="none"/>
      <rect x="12" y="32" width="16" height="2" fill="#6B7280"/>
    </svg>
  )

  const ChatBubbleSVG = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="20" r="16" fill="#3B82F6"/>
      <circle cx="18" cy="18" r="2" fill="white"/>
      <circle cx="24" cy="18" r="2" fill="white"/>
      <circle cx="30" cy="18" r="2" fill="white"/>
      <path d="M16 36 L24 28 L32 36" fill="#3B82F6"/>
      <circle cx="36" cy="12" r="8" fill="#60A5FA"/>
      <path d="M32 12 L40 12 M36 8 L36 16" stroke="white" strokeWidth="2"/>
    </svg>
  )

  // Quick actions from old dashboard
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
  ]

  // Recent activities
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
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Navigation Component */}
      <Navigation 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentUser={userName}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <PandaLogo />

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{currentDate}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <Link href="/emergency">
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  SOS
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-500 text-sm">Dashboard</p>
                <h1 className="text-3xl font-bold" style={{ color: '#6E55A0' }}>
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userName}!
                </h1>
              </div>
            </div>

            {/* Today's Inspiration */}
            <Card className="border-0 mb-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAE9ED 0%, #C4ABF5 50%, #D7D5EC 100%)' }}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2" style={{ color: '#6E55A0' }}>
                  Today's Inspiration
                </h3>
                <p style={{ color: '#6E55A0' }}>
                  "{todaysQuote}"
                </p>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Today's Mood Card */}
              <Card 
                className="border-0 text-white overflow-hidden cursor-pointer" 
                style={{ background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)' }}
                onClick={() => setShowMoodModal(true)}
              >
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/80 text-sm mb-2 font-medium">Today's Mood</p>
                      <p className="text-3xl font-bold">
                        {todaysMoodData ? todaysMoodData.label : 'Not set'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {todaysMoodData && todaysMoodData.emoji ? (
                        <div className="text-4xl">{todaysMoodData.emoji}</div>
                      ) : (
                        <SadEmojiSVG />
                      )}
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                </CardContent>
              </Card>

              {/* 7-Day Average Card */}
              <Card className="border-0 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)' }}>
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/80 text-sm mb-2 font-medium">7-Day Average</p>
                      <p className="text-3xl font-bold">
                        {averageMood > 0 ? `${averageMood}/5` : 'No data'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <TrendUpSVG />
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                </CardContent>
              </Card>

              {/* Total Check-ins Card */}
              <Card className="border-0 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)' }}>
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/80 text-sm mb-2 font-medium">Total Check-ins</p>
                      <p className="text-3xl font-bold">{moods.length}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ChecklistSVG />
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                </CardContent>
              </Card>

              {/* Chat Sessions Card */}
              <Card className="border-0 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)' }}>
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/80 text-sm mb-2 font-medium">Chat Sessions</p>
                      <p className="text-3xl font-bold">{messages.length}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ChatBubbleSVG />
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Mood Chart */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Mood Trends</CardTitle>
                <Link href="/insights">
                  <Button variant="ghost" size="icon" style={{ color: '#8A6FBF' }} className="hover:bg-gray-100">
                    <Smile className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold mb-4" style={{ color: '#6E55A0' }}>Past 7 days</h3>
                </div>
                
                {moodChartData.length > 0 ? (
                  <div className="rounded-2xl p-6 h-64" style={{ backgroundColor: '#E3DEF1' }}>
                    <div className="flex items-end justify-between h-full">
                      {moodChartData.map((point, index) => {
                        const height = (point.value / 100) * 120;
                        
                        return (
                          <div key={index} className="flex flex-col items-center relative">
                            <div className="w-8 h-8 bg-white rounded-full mb-2 flex items-center justify-center shadow-sm">
                              <div className="text-sm">{point.value > 60 ? '😊' : point.value > 40 ? '😐' : '😔'}</div>
                            </div>
                            
                            <div 
                              className="w-6 rounded-full"
                              style={{ 
                                height: `${height}px`,
                                backgroundColor: point.color,
                                minHeight: '20px'
                              }}
                            />
                            
                            <span className="text-xs mt-2 font-medium" style={{ color: '#6E55A0' }}>
                              {point.time}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Smile className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Start tracking your mood to see trends here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Growth */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Activity Growth</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Jul 2025</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <XAxis dataKey="day" />
                      <Bar dataKey="meditation" fill="#ef4444" />
                      <Bar dataKey="breathing" fill="#8A6FBF" />
                      <Bar dataKey="journal" fill="#6E55A0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center space-x-4 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span style={{ color: '#6E55A0' }}>Meditation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8A6FBF' }}></div>
                    <span style={{ color: '#6E55A0' }}>Breathing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6E55A0' }}></div>
                    <span style={{ color: '#6E55A0' }}>Journal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <ActionCard key={index} action={action} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Habit Tracker */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Habit Tracker</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="border-gray-300 text-gray-600 bg-white">Habits</Badge>
                    <Badge className="text-white" style={{ backgroundColor: '#6E55A0' }}>Tasks</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HabitTracker isWidget={true} />
              </CardContent>
            </Card>

            {/* Recent Activity & Wellness Resources */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-xl" style={{ backgroundColor: '#F7F5FA' }}>
                        <div className="p-1 bg-gray-100 rounded">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: '#6E55A0' }}>{activity.description}</p>
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

                {/* Wellness Resources */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="font-medium mb-3" style={{ color: '#6E55A0' }}>Wellness Resources</h4>
                  <div className="space-y-2">
                    <Link 
                      href="/exercises"
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Headphones className="w-4 h-4 text-green-600" />
                      <span className="text-sm" style={{ color: '#6E55A0' }}>Mindfulness</span>
                    </Link>
                    
                    <Link 
                      href="/games"
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className="text-sm" style={{ color: '#6E55A0' }}>Calming Games</span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mood Modal */}
      {showMoodModal && (
        <MoodModal 
          onClose={() => setShowMoodModal(false)}
          onSave={(moodData) => {
            addMood(moodData, dataInit.userId, dataInit.guestId);
            setShowMoodModal(false);
          }}
        />
      )}
    </div>
  )
}

// Action Card Component
function ActionCard({ action }) {
  const content = (
    <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
          {action.icon}
        </div>
        <div>
          <h4 className="font-medium text-xs" style={{ color: '#6E55A0' }}>{action.title}</h4>
        </div>
      </div>
    </div>
  );

  if (action.href) {
    return <Link href={action.href}>{content}</Link>;
  }

  return <div onClick={action.onClick}>{content}</div>;
}

// Mood Modal Component
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
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#6E55A0' }}>How are you feeling?</h2>
          <p className="text-gray-600">Track your mood to understand your patterns</p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {moods.map((moodOption) => (
            <button
              key={moodOption.value}
              onClick={() => setMood(moodOption.value)}
              className={`p-3 rounded-xl text-center transition-all duration-200 ${
                mood === moodOption.value 
                  ? `${moodOption.color} text-white ring-2 ring-offset-2` 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={mood === moodOption.value ? { ringColor: '#8A6FBF' } : {}}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
            style={{ focusRingColor: '#8A6FBF' }}
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
            className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ 
              background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)',
            }}
          >
            Save Mood
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard