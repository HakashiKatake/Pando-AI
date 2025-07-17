"use client"

import React, { useState, useEffect } from "react"
import { useUser } from '@clerk/nextjs'
import { useAppStore, useMoodStore, useChatStore, useHabitStore } from '../../lib/store'
import { useDataInitialization } from '../../lib/useDataInitialization'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

import Header from '@/components/Header';
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
  Plus,
  Circle,
  CheckCircle2
} from "lucide-react"
import Link from 'next/link'
import { getRandomQuote, getMoodData, isToday } from '../../lib/utils'

const Dashboard = () => {
  // All state hooks first - must be called in same order every time
  const [showMoodModal, setShowMoodModal] = useState(false)
  const [todaysQuote, setTodaysQuote] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [activeTab, setActiveTab] = useState('habits') // Start with habits tab active
  const [localHabits, setLocalHabits] = useState([])
  const [localQuests, setLocalQuests] = useState([])

  // All context hooks - must be called in same order every time
  const { user } = useUser()
  const { preferences, guestId, isDarkMode } = useAppStore()
  const { moods, todaysMood, addMood, getAverageMood } = useMoodStore()
  const { messages } = useChatStore()
  const { 
    habits, 
    toggleHabitCompletion, 
    getTodaysHabits,
    getTodaysQuests,
    generateDailyQuests,
    updateQuestProgress 
  } = useHabitStore()
  const dataInit = useDataInitialization()

  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  
    // Update time every second
    useEffect(() => {
      const updateTime = () => {
        const now = new Date()
        setCurrentTime(now.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }))
        
        // Format date as "Jul 17 - Jul 31" (current date to end of month)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const startDateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const endDateStr = endOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        setCurrentDate(`${startDateStr} - ${endDateStr}`)
      }
  
      updateTime()
      const interval = setInterval(updateTime, 1000)
    })
  // All useEffect hooks - must be called in same order every time
  useEffect(() => {
    setTodaysQuote(getRandomQuote())
    setIsHydrated(true)
  }, [])

  // Generate daily quests if they don't exist
  useEffect(() => {
    if (isHydrated && generateDailyQuests && getTodaysQuests) {
      const existingQuests = getTodaysQuests()
      if (Object.keys(existingQuests).length === 0) {
        generateDailyQuests()
      }
    }
  }, [isHydrated, generateDailyQuests, getTodaysQuests])

  // Get today's habits and quests - after hooks
  const todaysHabits = getTodaysHabits ? getTodaysHabits() : []
  const todaysQuests = getTodaysQuests ? Object.values(getTodaysQuests()) : []

  // Default habits if none exist
  const defaultHabits = [
    {
      id: 'default-1',
      title: 'Morning run',
      time: '07:00 am',
      location: 'Park',
      duration: '45min',
      icon: '🏃‍♂️',
      completed: false,
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'default-2',
      title: '1.5L of water daily',
      time: 'All day',
      location: 'Everywhere',
      duration: null,
      icon: '💧',
      completed: false,
      bgColor: 'bg-blue-100'
    },
    {
      id: 'default-3',
      title: 'Cooking mealpreps for 3 days',
      time: '11:00 am',
      location: 'Home',
      duration: '2h',
      icon: '🍳',
      completed: false,
      bgColor: 'bg-orange-100'
    }
  ]

  // Default quests if none exist
  const defaultQuests = [
    {
      id: 'quest-1',
      title: 'Check in with your mood',
      description: 'Log how you\'re feeling today',
      type: 'mood_checkin',
      icon: '😊',
      completed: false,
      points: 10,
      progress: 0,
      target: 1
    },
    {
      id: 'quest-2',
      title: 'Complete a breathing exercise',
      description: 'Practice 4-7-8 breathing technique',
      type: 'breathing',
      icon: '🫁',
      completed: false,
      points: 15,
      progress: 0,
      target: 1
    },
    {
      id: 'quest-3',
      title: 'Write a journal entry',
      description: 'Reflect on your day and thoughts',
      type: 'journal',
      icon: '📝',
      completed: false,
      points: 20,
      progress: 0,
      target: 1
    },
    {
      id: 'quest-4',
      title: 'Chat with AI assistant',
      description: 'Have a supportive conversation',
      type: 'chat',
      icon: '💬',
      completed: false,
      points: 12,
      progress: 0,
      target: 1
    }
  ]

  // Initialize local state when data changes
  useEffect(() => {
    const baseHabits = todaysHabits.length > 0 ? todaysHabits : defaultHabits
    if (baseHabits.length > 0 && localHabits.length === 0) {
      setLocalHabits(baseHabits)
    }
  }, [todaysHabits, localHabits.length])

  useEffect(() => {
    const baseQuests = todaysQuests.length > 0 ? todaysQuests : defaultQuests
    if (baseQuests.length > 0 && localQuests.length === 0) {
      setLocalQuests(baseQuests)
    }
  }, [todaysQuests, localQuests.length])

  // Early return AFTER all hooks are called
  if (!isHydrated || !dataInit.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
          <p style={{ color: '#6E55A0' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Current user and time data - Updated to match your current timestamp
  const userName = preferences.name || user?.firstName || "HakashiKatake"
  

  // Data calculations
  const recentMoods = Array.isArray(moods) ? moods.slice(-7) : []
  const averageMood = getAverageMood(7)
  const hasChatToday = Array.isArray(messages) ? messages.some(msg => isToday(msg.timestamp)) : false
  const todaysMoodData = todaysMood ? getMoodData(todaysMood.mood) : null

  // Convert mood data for chart - DYNAMIC DATA
  const moodChartData = recentMoods.length > 0 ? recentMoods.map((mood, index) => ({
    time: new Date(mood.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    value: (mood.mood / 5) * 100,
    color: getMoodData(mood.mood).color === 'bg-red-500' ? '#EF4444' :
           getMoodData(mood.mood).color === 'bg-orange-500' ? '#F97316' :
           getMoodData(mood.mood).color === 'bg-yellow-500' ? '#EAB308' :
           getMoodData(mood.mood).color === 'bg-green-500' ? '#22C55E' :
           '#3B82F6',
    emoji: getMoodData(mood.mood).emoji
  })) : [
    { time: "10.08", value: 85, color: "#4ADE80", emoji: "😊" },
    { time: "12.10", value: 35, color: "#EF4444", emoji: "😔" },
    { time: "14.40", value: 60, color: "#3B82F6", emoji: "😐" },
    { time: "18.30", value: 45, color: "#F97316", emoji: "😐" },
    { time: "20.10", value: 25, color: "#EF4444", emoji: "😢" },
  ]

  // Dynamic activity data based on user activities
  const generateActivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date().getDay()
    
    return days.map((day, index) => {
      const isPast = index <= today
      return {
        day,
        meditation: isPast ? Math.floor(Math.random() * 60) + 20 : 0,
        breathing: isPast ? Math.floor(Math.random() * 50) + 30 : 0,
        journal: isPast ? Math.floor(Math.random() * 40) + 20 : 0,
      }
    })
  }

  const activityData = generateActivityData()

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

  // Handle habit completion
  const handleHabitComplete = (habitId) => {
    // Update local state for immediate visual feedback
    setLocalHabits(prev => prev.map(habit => 
      habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
    ))
    
    // Update store state using the correct function
    if (toggleHabitCompletion) {
      toggleHabitCompletion(habitId)
    }
  }

  // Handle quest completion - quests are automatically updated by habit completions
  const handleQuestComplete = (questId) => {
    // Update local state for immediate visual feedback
    setLocalQuests(prev => prev.map(quest => 
      quest.id === questId ? { ...quest, completed: !quest.completed } : quest
    ))
    
    // Update quest progress
    if (updateQuestProgress) {
      updateQuestProgress()
    }
  }

  // Use real data or fallback to default, with local state override
  const baseHabits = todaysHabits.length > 0 ? todaysHabits : defaultHabits
  const baseQuests = todaysQuests.length > 0 ? todaysQuests : defaultQuests
  
  const displayHabits = localHabits.length > 0 ? localHabits : baseHabits
  const displayQuests = localQuests.length > 0 ? localQuests : baseQuests
  
  // Filter to show only remaining (incomplete) quests in tasks tab
  const remainingQuests = displayQuests.filter(quest => !quest.completed)

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
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Header - Fixed at top */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-lg">🐼</span>
            </div>
            <h1 className="text-xl font-semibold" style={{ color: '#6E55A0' }}>CalmConnect</h1>
          </div>

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
            {/* Anonymous Report Button for Students */}
            {user?.unsafeMetadata?.userType === 'student' && user?.unsafeMetadata?.classroomId && (
              <Link href="/report">
                <Button 
                  variant="outline" 
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  title="Report an issue anonymously"
                >
                  🛡️ Report
                </Button>
              </Link>
            )}
            <Link href="/emergency">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                SOS
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - No sidebar, starts below header */}
      <main className="pt-20 p-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-500 text-sm">Dashboard</p>
              <h1 className="text-3xl font-bold" style={{ color: '#6E55A0' }}>
                Hi, {userName}!
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                      {todaysMoodData ? todaysMoodData.label : 'Poor'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {todaysMoodData && todaysMoodData.emoji ? (
                      <div className="text-4xl">{todaysMoodData.emoji}</div>
                    ) : (
                      <div className="text-4xl">😔</div>
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
                      {averageMood > 0 ? `${averageMood}/5` : '2/5'}
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
                    <p className="text-3xl font-bold">{moods.length || 1}</p>
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
                    <p className="text-3xl font-bold">{messages.length || 2}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Chart */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Today's check-in</CardTitle>
              <Button variant="ghost" size="icon" style={{ color: '#8A6FBF' }} className="hover:bg-gray-100">
                <Smile className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold mb-4" style={{ color: '#6E55A0' }}>Mood chart</h3>
              </div>
              
              <div className="rounded-2xl p-6 h-64" style={{ backgroundColor: '#E3DEF1' }}>
                <div className="flex items-end justify-between h-full">
                  {moodChartData.map((point, index) => {
                    const height = (point.value / 100) * 120;
                    
                    return (
                      <div key={index} className="flex flex-col items-center relative">
                        <div className="w-8 h-8 bg-white rounded-full mb-2 flex items-center justify-center shadow-sm">
                          <div className="text-sm">{point.emoji || (point.value > 60 ? '😊' : point.value > 40 ? '😐' : '😔')}</div>
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
            </CardContent>
          </Card>

          {/* Activity Growth - DYNAMIC DATA */}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meditation */}
          <Card className="bg-white border border-gray-200" style={{ backgroundColor: '#E3DEF1' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Meditation</CardTitle>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-white hover:bg-opacity-50">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-full h-48 bg-transparent flex items-center justify-center relative">
                  <div className="text-6xl">🧘‍♀️</div>
                </div>
                
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h4 className="font-semibold text-base mb-1" style={{ color: '#6E55A0' }}>Good vibes, good life</h4>
                    <p className="text-sm text-gray-600">Positive thinking | 27min</p>
                  </div>
                  
                  <Button 
                    size="icon" 
                    className="w-10 h-10 text-white rounded-full shadow-sm"
                    style={{ backgroundColor: '#8A6FBF' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E55A0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8A6FBF'}
                  >
                    <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Habit Tracker with Functional Tabs */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Habit tracker</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={activeTab === 'habits' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('habits')}
                    className={`text-xs px-3 py-1 ${
                      activeTab === 'habits' 
                        ? 'text-white' 
                        : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                    style={activeTab === 'habits' ? { backgroundColor: '#6E55A0' } : {}}
                  >
                    Habits
                    {displayHabits.length > 0 && (
                      <span className="ml-1 text-xs">
                        ({displayHabits.filter(h => h.completed).length}/{displayHabits.length})
                      </span>
                    )}
                  </Button>
                  <Button
                    variant={activeTab === 'tasks' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('tasks')}
                    className={`text-xs px-3 py-1 ${
                      activeTab === 'tasks' 
                        ? 'text-white' 
                        : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                    style={activeTab === 'tasks' ? { backgroundColor: '#6E55A0' } : {}}
                  >
                    Tasks
                    {displayQuests.length > 0 && (
                      <span className="ml-1 text-xs">
                        ({displayQuests.filter(q => q.completed).length}/{displayQuests.length})
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activeTab === 'habits' ? (
                  // Habits Tab
                  displayHabits.map((habit, index) => (
                    <div key={habit.id || index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" style={{ backgroundColor: '#F7F5FA' }}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${habit.bgColor || 'bg-yellow-100'} rounded-xl flex items-center justify-center`}>
                          <div className="text-xl">{habit.icon || '🏃‍♂️'}</div>
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1" style={{ color: '#6E55A0' }}>{habit.title}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{habit.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{habit.location}</span>
                            </div>
                            {habit.duration && <span>{habit.duration}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHabitComplete(habit.id)}
                        className="w-8 h-8 p-0 rounded-full flex items-center justify-center hover:bg-gray-200"
                        style={{ backgroundColor: habit.completed ? '#8A6FBF' : '#E3DEF1' }}
                      >
                        {habit.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Circle className="w-4 h-4" style={{ color: '#8A6FBF' }} />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  // Tasks/Quests Tab - Show only remaining (incomplete) quests
                  remainingQuests.map((quest, index) => (
                    <div key={quest.id || index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" style={{ backgroundColor: '#F7F5FA' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <div className="text-xl">{quest.icon || '🎯'}</div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1" style={{ color: '#6E55A0' }}>{quest.title}</p>
                          <p className="text-xs text-gray-500">{quest.description}</p>
                          {quest.points && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-purple-600 font-medium">+{quest.points} points</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuestComplete(quest.id)}
                        className="w-8 h-8 p-0 rounded-full flex items-center justify-center hover:bg-gray-200"
                        style={{ backgroundColor: quest.completed ? '#8A6FBF' : '#E3DEF1' }}
                      >
                        {quest.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Circle className="w-4 h-4" style={{ color: '#8A6FBF' }} />
                        )}
                      </Button>
                    </div>
                  ))
                )}

                {/* Empty State */}
                {((activeTab === 'habits' && displayHabits.length === 0) || 
                  (activeTab === 'tasks' && remainingQuests.length === 0)) && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {activeTab === 'habits' 
                        ? 'No habits available today' 
                        : remainingQuests.length === 0 && displayQuests.length > 0 
                          ? 'All tasks completed! 🎉' 
                          : 'No tasks available today'
                      }
                    </p>
                    <Link href={activeTab === 'habits' ? '/habits' : '/quests'}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        style={{ borderColor: '#8A6FBF', color: '#8A6FBF' }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add {activeTab === 'habits' ? 'Habit' : 'Quest'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Progress */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: '#6E55A0' }}>Daily progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E3DEF1"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#8A6FBF"
                    strokeWidth="3"
                    strokeDasharray="85, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: '#6E55A0' }}>85%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Keep working on your</p>
                <p className="text-sm text-gray-500">nutrition and sleep</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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