"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  Percent, 
  Flame, 
  Target,
  Calendar as CalendarIcon,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Dumbbell,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { useHabitStore, useAppStore } from '@/lib/store'
import { useDataInitialization } from '@/lib/useDataInitialization'
import { DailyQuests } from '@/components/DailyQuests'


const HABIT_CATEGORIES = [
  { id: 'health', name: 'Health & Fitness', icon: '💪', color: 'bg-green-100 text-green-800' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', color: 'bg-blue-100 text-blue-800' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: 'bg-purple-100 text-purple-800' },
  { id: 'learning', name: 'Learning', icon: '📚', color: 'bg-orange-100 text-orange-800' },
  { id: 'social', name: 'Social', icon: '👥', color: 'bg-pink-100 text-pink-800' },
  { id: 'creative', name: 'Creative', icon: '🎨', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'other', name: 'Other', icon: '📝', color: 'bg-gray-100 text-gray-800' }
]

const HABIT_FREQUENCIES = [
  { id: 'daily', name: 'Daily', description: 'Every day' },
  { id: 'weekdays', name: 'Weekdays', description: 'Monday to Friday' },
  { id: 'weekends', name: 'Weekends', description: 'Saturday and Sunday' },
  { id: 'weekly', name: 'Weekly', description: 'Once a week' },
  { id: 'custom', name: 'Custom', description: 'Choose specific days' }
]

function CreateHabitDialog({ isOpen, onOpenChange, onHabitCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'health',
    frequency: 'daily',
    targetValue: 1,
    unit: '',
    reminderTime: '',
    isActive: true
  })
  
  const { addHabit } = useHabitStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    await addHabit(formData)
    
    setFormData({
      title: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      targetValue: 1,
      unit: '',
      reminderTime: '',
      isActive: true
    })
    
    onHabitCreated()
    onOpenChange(false)
  }

  const selectedCategory = HABIT_CATEGORIES.find(cat => cat.id === formData.category)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#6E55A0' }}>Create New Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: '#6E55A0' }}>Habit Name</label>
            <Input
              placeholder="e.g., Morning run, Read for 30 minutes"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="border-2"
              style={{ borderColor: '#E3DEF1', color: '#6E55A0' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: '#6E55A0' }}>Description (Optional)</label>
            <Input
              placeholder="Why is this habit important to you?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="border-2"
              style={{ borderColor: '#E3DEF1', color: '#6E55A0' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: '#6E55A0' }}>Category</label>
            <div className="grid grid-cols-2 gap-2">
              {HABIT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    formData.category === category.id 
                      ? 'text-white' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  style={
                    formData.category === category.id
                      ? { 
                          backgroundColor: '#8A6FBF',
                          borderColor: '#8A6FBF'
                        }
                      : { 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }
                  }
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: '#6E55A0' }}>Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full p-3 border-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ borderColor: '#E3DEF1', color: '#6E55A0' }}
            >
              {HABIT_FREQUENCIES.map((freq) => (
                <option key={freq.id} value={freq.id}>
                  {freq.name} - {freq.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#6E55A0' }}>Target</label>
              <Input
                type="number"
                min="1"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                className="border-2"
                style={{ borderColor: '#E3DEF1', color: '#6E55A0' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#6E55A0' }}>Unit (Optional)</label>
              <Input
                placeholder="e.g., minutes, pages, cups"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="border-2"
                style={{ borderColor: '#E3DEF1', color: '#6E55A0' }}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-2"
              style={{ borderColor: '#E3DEF1', color: '#6E55A0' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="text-white"
              style={{ backgroundColor: '#8A6FBF' }}
            >
              Create Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const HabitTracker = () => {
  // Initialize calendar to current month/year
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()) // Current month (0-indexed)
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isHydrated, setIsHydrated] = useState(false)

  // Use the actual habit store
  const { 
    habits, 
    completions, 
    toggleHabitCompletion, 
    deleteHabit,
    getHabitStreak,
    getHabitCompletionRate,
    getTodaysHabits,
    loadFromLocalStorage,
    generateDailyQuests,
    updateQuestProgress,
    addHabit
  } = useHabitStore()
  
  // Initialize app store for guest handling
  const { initializeGuest, guestId } = useAppStore()
  
  const dataInit = useDataInitialization()

  useEffect(() => {
    setIsHydrated(true)
    // Initialize guest if not already done
    initializeGuest()
    // Note: Data loading is handled by useDataInitialization hook
    // No need to manually call loadFromLocalStorage here as it would cause double loading
    // Initialize quest system
    generateDailyQuests()
    updateQuestProgress()
  }, [initializeGuest, generateDailyQuests, updateQuestProgress])

  const handleToggleHabit = async (habitId) => {
    console.log('=== HABIT TOGGLE DEBUG ===');
    console.log('Toggling habit:', habitId);
    console.log('Current guestId:', guestId);
    console.log('Current completions before toggle:', completions);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Calling toggleHabitCompletion with date:', today);
      await toggleHabitCompletion(habitId, today, !completions[`${habitId}-${today}`]);
      console.log('Habit toggled successfully');
      console.log('Current completions after toggle:', useHabitStore.getState().completions);
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
    
    console.log('=== END HABIT TOGGLE DEBUG ===');
  }

  const handleHabitCreated = () => {
    // No need to manually refresh - store is reactive
  }

  const handleDeleteHabit = async (habitId) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habitId)
    }
  }

  // Get today's habits directly from store
  const todaysHabits = isHydrated ? getTodaysHabits() : []

  const getOverallStats = () => {
    const total = todaysHabits.length
    const completed = todaysHabits.filter(h => h.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const totalStreak = todaysHabits.reduce((sum, habit) => sum + habit.streak, 0)
    const avgCompletionRate = total > 0 
      ? Math.round(todaysHabits.reduce((sum, habit) => sum + habit.completionRate, 0) / total)
      : 0
    
    return { total, completed, percentage, totalStreak, avgCompletionRate }
  }

  const filteredHabits = selectedCategory === 'all' 
    ? todaysHabits 
    : todaysHabits.filter(habit => habit.category === selectedCategory)

  const stats = getOverallStats()

  // Stats data using real data
  const statsData = [
    {
      title: "Todays Progress",
      value: `${stats.completed}/${stats.total}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-gradient-to-r from-pink-400 to-pink-500"
    },
    {
      title: "Completion Rate",
      value: `${stats.percentage}%`,
      icon: <Percent className="w-5 h-5" />,
      color: "bg-gradient-to-r from-orange-400 to-orange-500"
    },
    {
      title: "Streak",
      value: stats.totalStreak.toString(),
      icon: <Flame className="w-5 h-5" />,
      color: "bg-gradient-to-r from-indigo-500 to-purple-600"
    },
    {
      title: "Weekly Progress",
      value: `${stats.avgCompletionRate}%`,
      icon: <Target className="w-5 h-5" />,
      color: "bg-gradient-to-r from-green-400 to-green-500"
    }
  ]

  // Generate calendar days for July 2025
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const days = []

    // Add days from previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false
      })
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: day,
        isCurrentMonth: true,
        isNextMonth: false
      })
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day: day,
        isCurrentMonth: false,
        isNextMonth: true
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Calendar stats using real habit completion data
  const calculateCalendarStats = () => {
    const activeHabits = habits.filter(habit => habit.isActive !== false)
    if (activeHabits.length === 0) {
      return {
        perfectDays: 0,
        activeDays: 0,
        avgCompletion: 0,
        totalHabits: 0
      }
    }

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    let perfectDays = 0
    let activeDays = 0
    let totalCompletions = 0
    let totalPossibleCompletions = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      const completedHabits = activeHabits.filter(habit => {
        const completionKey = `${habit.id}-${dateStr}`
        return completions[completionKey] === true
      })

      if (completedHabits.length > 0) {
        activeDays++
        totalCompletions += completedHabits.length
      }

      if (completedHabits.length === activeHabits.length && activeHabits.length > 0) {
        perfectDays++
      }

      totalPossibleCompletions += activeHabits.length
    }

    const avgCompletion = totalPossibleCompletions > 0 
      ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
      : 0

    return {
      perfectDays,
      activeDays,
      avgCompletion,
      totalHabits: activeHabits.length
    }
  }

  const calendarStatsData = calculateCalendarStats()
  const calendarStats = [
    { title: "Perfect days", value: calendarStatsData.perfectDays.toString(), color: "#10B981" },
    { title: "Active days", value: calendarStatsData.activeDays.toString(), color: "#FBBF24" },
    { title: "Avg completion", value: `${calendarStatsData.avgCompletion}%`, color: "#60A5FA" },
    { title: "Total habits", value: calendarStatsData.totalHabits.toString(), color: "#8B5CF6" }
  ]

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

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
          <p style={{ color: '#6E55A0' }}>Loading your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="px-4 sm:px-6 pb-12">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title Section */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4" style={{ color: '#6E55A0' }}>
              Habit Tracker
            </h1>
            <p className="text-sm sm:text-base lg:text-lg" style={{ color: '#8A6FBF' }}>
              Build lasting habits that improve your life. Track your progress and stay motivated with 
              streaks and insights
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className={`${stat.color} rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white relative overflow-hidden`}
              >
                <div className="absolute -top-2 -right-2 text-lg sm:text-2xl opacity-20">✨</div>
                <div className="absolute -bottom-2 -left-2 text-lg sm:text-2xl opacity-20">✨</div>
                
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <p className="text-white/80 text-xs sm:text-sm font-medium">{stat.title}</p>
                  {stat.icon}
                </div>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Today's Progress Section */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: '#6E55A0' }}>
                  Today's Progress
                </h2>
                <span className="text-sm" style={{ color: '#8A6FBF' }}>{stats.completed}/{stats.total} Completed</span>
              </div>
              
              {/* Progress Bar */}
              {stats.total > 0 && (
                <div className="space-y-2">
                  <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#E3DEF1' }}>
                    <motion.div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ backgroundColor: '#8A6FBF', width: `${stats.percentage}%` }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${stats.percentage}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Habit Categories and List */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  selectedCategory === 'all' ? 'text-white' : 'bg-white border border-gray-200'
                }`}
                style={
                  selectedCategory === 'all'
                    ? { backgroundColor: '#FBBF24' }
                    : { color: '#8A6FBF' }
                }
              >
                All Habits
              </button>
              {HABIT_CATEGORIES.map((category) => {
                const categoryHabits = todaysHabits.filter(h => h.category === category.id)
                if (categoryHabits.length === 0) return null
                
                return (
                  <button 
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-white border border-gray-200 flex items-center gap-2 transition-colors ${
                      selectedCategory === category.id ? 'text-white' : ''
                    }`}
                    style={
                      selectedCategory === category.id
                        ? { backgroundColor: '#8A6FBF', borderColor: '#8A6FBF' }
                        : { color: '#8A6FBF' }
                    }
                  >
                    <span>{category.icon}</span>
                    {category.name}
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-700">{categoryHabits.length}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                {selectedCategory === 'all' ? 'All Habits' : HABIT_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h2>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-full font-medium text-sm"
                    style={{ backgroundColor: '#8A6FBF' }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Habit
                  </motion.button>
                </DialogTrigger>
                <CreateHabitDialog 
                  isOpen={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  onHabitCreated={handleHabitCreated}
                />
              </Dialog>
            </div>
            
            {/* Habits List */}
            {filteredHabits.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-sm">
                <Target className="h-12 w-12 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: '#6E55A0' }}>
                  {todaysHabits.length === 0 ? 'No habits yet' : 'No habits in this category'}
                </h3>
                <p className="mb-4" style={{ color: '#8A6FBF' }}>
                  {todaysHabits.length === 0 
                    ? 'Create your first habit to start building a better routine'
                    : 'Try selecting a different category or create a new habit'
                  }
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="text-white"
                  style={{ backgroundColor: '#8A6FBF' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Habit
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredHabits.map((habit, index) => {
                  const category = HABIT_CATEGORIES.find(cat => cat.id === habit.category)
                  
                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                          <motion.button
                            onClick={() => {
                              console.log('Button clicked for habit:', habit);
                              console.log('habit.id:', habit.id);
                              handleToggleHabit(habit.id);
                            }}
                            className="flex-shrink-0 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {habit.completed ? (
                              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#22C55E' }} />
                            ) : (
                              <Circle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 hover:text-purple-500" />
                            )}
                          </motion.button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold text-sm sm:text-base ${habit.completed ? 'line-through text-gray-400' : ''}`} style={{ color: habit.completed ? '#9CA3AF' : '#6E55A0' }}>
                                {habit.title}
                              </h3>
                              {category && (
                                <span 
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{ backgroundColor: '#E3DEF1', color: '#8A6FBF' }}
                                >
                                  {category.icon} {category.name}
                                </span>
                              )}
                            </div>
                            
                            {habit.description && (
                              <p className="text-sm mb-2" style={{ color: '#8A6FBF' }}>{habit.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                              <span>🔥 {habit.streak} day streak</span>
                              <span>📊 {habit.completionRate}% this week</span>
                              {habit.targetValue > 1 && (
                                <span>🎯 {habit.targetValue} {habit.unit}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Daily Quests Section */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <DailyQuests />
          </motion.div>

          {/* Habit Calendar - Single Calendar Only */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#6E55A0' }} />
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                  Habit Calendar
                </h2>
              </div>
              <p className="text-sm sm:text-base mb-4 sm:mb-6" style={{ color: '#8A6FBF' }}>
                Track your habit completion over time
              </p>

              {/* Calendar Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {calendarStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl"
                    style={{ backgroundColor: stat.color + '20' }}
                  >
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                      {stat.title}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11)
                        setCurrentYear(prev => prev - 1)
                      } else {
                        setCurrentMonth(prev => prev - 1)
                      }
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: '#8A6FBF' }} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0)
                        setCurrentYear(prev => prev + 1)
                      } else {
                        setCurrentMonth(prev => prev + 1)
                      }
                    }}
                  >
                    <ChevronRight className="w-5 h-5" style={{ color: '#8A6FBF' }} />
                  </motion.button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="text-center p-3 text-sm font-medium border-b" style={{ color: '#8A6FBF' }}>
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((dayObj, index) => {
                  const { day, isCurrentMonth, isNextMonth } = dayObj
                  
                  // Check if this is actually today
                  const today = new Date()
                  const isToday = isCurrentMonth && 
                    day === today.getDate() && 
                    currentMonth === today.getMonth() && 
                    currentYear === today.getFullYear()
                  
                  // Calculate habit completion for this date
                  const dateStr = isCurrentMonth 
                    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    : null
                  
                  let completionStatus = null
                  if (dateStr && habits.length > 0) {
                    const habitsForDate = habits.filter(habit => habit.isActive !== false)
                    const completedHabits = habitsForDate.filter(habit => {
                      const completionKey = `${habit.id}-${dateStr}`
                      return completions[completionKey] === true
                    })
                    
                    if (habitsForDate.length > 0) {
                      const allCompleted = completedHabits.length === habitsForDate.length
                      const anyCompleted = completedHabits.length > 0
                      
                      if (allCompleted) {
                        completionStatus = 'complete' // Green
                      } else if (anyCompleted) {
                        completionStatus = 'partial' // Orange/Yellow
                      } else {
                        completionStatus = 'incomplete' // Red
                      }
                    }
                  }
                  
                  // Get background color based on completion status
                  const getBackgroundColor = () => {
                    if (!isCurrentMonth) return ''
                    
                    // Today gets special dark background
                    if (isToday) return 'bg-gray-900 text-white'
                    
                    // Completion status colors for other days
                    switch (completionStatus) {
                      case 'complete':
                        return 'bg-green-100 border-green-300'
                      case 'partial':
                        return 'bg-yellow-100 border-yellow-300'
                      case 'incomplete':
                        return 'bg-red-100 border-red-300'
                      default:
                        return ''
                    }
                  }

                  return (
                    <motion.div
                      key={index}
                      className={`min-h-[60px] sm:min-h-[80px] p-2 border-b border-r border-gray-100 relative ${getBackgroundColor()}`}
                      whileHover={isCurrentMonth ? { backgroundColor: '#F9FAFB' } : {}}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1">
                        <span 
                          className={`text-sm font-medium ${
                            isToday 
                              ? 'w-6 h-6 rounded-full flex items-center justify-center text-white' 
                              : isCurrentMonth 
                                ? 'text-gray-900' 
                                : 'text-gray-400'
                          }`}
                        >
                          {day}
                        </span>
                      </div>

                      {/* Show completion indicator text for current month dates with habits */}
                      {isCurrentMonth && completionStatus && (
                        <div className="text-xs text-center opacity-75">
                          {completionStatus === 'complete' && '✓'}
                          {completionStatus === 'partial' && '○'}
                          {completionStatus === 'incomplete' && '✗'}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default HabitTracker