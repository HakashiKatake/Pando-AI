'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
  Activity,
  Flame,
  ChevronDown,
  Play,
  Menu
} from 'lucide-react';
import { useExerciseStore, useAppStore } from '@/lib/store';
import { useDataInitialization } from '@/lib/useDataInitialization';
import Header from '@/components/Header';

const exerciseCategories = [
  { id: 'all', name: 'All exercises', icon: Activity },
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
    route: '/exercises/breathing',
    illustration: '🧘‍♂️',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'breathing-advanced',
    title: 'Advanced Breathing',
    description: 'Complex breathing patterns for experienced practitioners',
    duration: 10,
    difficulty: 'advanced',
    category: 'breathing',
    benefits: ['Deep relaxation', 'Enhanced control', 'Better sleep'],
    route: '/exercises/breathing',
    illustration: '🌊',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'body-scan',
    title: 'Body Scan Meditation',
    description: 'Progressive relaxation technique to release tension throughout the body',
    duration: 15,
    difficulty: 'beginner',
    category: 'relaxation',
    benefits: ['Releases tension', 'Improves awareness', 'Better sleep'],
    route: '/exercises/body-scan',
    illustration: '🧘‍♀️',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 'mindful-walking',
    title: 'Mindful Walking',
    description: 'Walking meditation to connect with the present moment',
    duration: 10,
    difficulty: 'beginner',
    category: 'mindfulness',
    benefits: ['Grounds you', 'Improves focus', 'Reduces anxiety'],
    route: '/exercises/walking',
    illustration: '🚶‍♀️',
    bgColor: 'bg-green-50'
  },
  
  {
    id: 'focus-training',
    title: 'Focus Training',
    description: 'Exercises designed to improve concentration and mental clarity',
    duration: 8,
    difficulty: 'intermediate',
    category: 'focus',
    benefits: ['Improves concentration', 'Enhances productivity', 'Mental clarity'],
    route: '/exercises/focus',
    illustration: '🎯',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'progressive-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematic relaxation of muscle groups to reduce physical tension',
    duration: 20,
    difficulty: 'beginner',
    category: 'relaxation',
    benefits: ['Reduces muscle tension', 'Improves sleep', 'Stress relief'],
    route: '/exercises/progressive-relaxation',
    illustration: '😌',
    bgColor: 'bg-blue-50'
  },
  
];

export default function ExercisesPage() {
  const router = useRouter();
  const { sessions, addSession } = useExerciseStore();
  const dataInit = useDataInitialization();
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  const userName = "HakashiKatake"

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Mark exercises as completed based on sessions
    const completed = new Set(sessions.map(session => session.exerciseId).filter(Boolean));
    setCompletedExercises(completed);
  }, [sessions]);

  // Filter exercises based on state
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

  // Prevent hydration errors by not rendering dynamic content until client-side
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
          <p style={{ color: '#6E55A0' }}>Loading your exercises...</p>
        </div>
      </div>
    );
  }

  // Stats data with real values
  const statsData = [
    {
      title: "Total Sessions",
      value: stats.totalSessions.toString(),
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-gradient-to-r from-pink-400 to-pink-500",
      decoration: "✨"
    },
    {
      title: "Total Time",
      value: `${stats.totalMinutes}m`,
      icon: <Clock className="w-6 h-6" />,
      color: "bg-gradient-to-r from-orange-400 to-orange-500",
      decoration: "✨"
    },
    {
      title: "Completed",
      value: stats.completedCount.toString(),
      icon: <Target className="w-6 h-6" />,
      color: "bg-gradient-to-r from-indigo-500 to-purple-600",
      decoration: "✨"
    },
    {
      title: "Day Streak",
      value: stats.streak.toString(),
      icon: <Flame className="w-6 h-6" />,
      color: "bg-gradient-to-r from-green-400 to-green-500",
      decoration: "✨"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      <Header />

      {/* Main Content */}
      <main className="pt-20 px-6 pb-12">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#6E55A0' }}>
              Wellness Exercises
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6E55A0' }}>
              Choose from a variety of guided exercises designed to improve your 
              mental health, reduce stress, and enhance overall being-well
            </p>
          </motion.div>

          {/* Stats Cards with Real Data */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                className={`${stat.color} rounded-2xl p-6 text-white relative overflow-hidden`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 text-2xl opacity-20">
                  {stat.decoration}
                </div>
                <div className="absolute -bottom-2 -left-2 text-2xl opacity-20">
                  {stat.decoration}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Category Filters */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {exerciseCategories.map((category, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'text-white'
                      : 'bg-white hover:text-white'
                  }`}
                  style={
                    selectedCategory === category.id
                      ? { backgroundColor: '#8A6FBF' }
                      : { 
                          color: '#6E55A0',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      e.target.style.backgroundColor = '#E3DEF1'
                      e.target.style.color = '#6E55A0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      e.target.style.backgroundColor = 'white'
                      e.target.style.color = '#6E55A0'
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Menu className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#6E55A0' }} />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-3 rounded-xl border-gray-200"
                style={{ 
                  color: '#6E55A0',
                }}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#6E55A0' }} />
            </div>
            
            <div className="relative">
              <select 
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none"
                style={{ 
                  color: '#6E55A0',
                }}
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#6E55A0' }} />
            </div>
          </motion.div>

          {/* Exercise Cards */}
          {filteredExercises.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4" style={{ color: '#6E55A0' }} />
                  <h3 className="text-lg font-medium mb-2" style={{ color: '#6E55A0' }}>No exercises found</h3>
                  <p className="mb-4" style={{ color: '#6E55A0' }}>
                    Try adjusting your search terms or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setDifficultyFilter('all');
                    }}
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#6E55A0'
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredExercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`${exercise.bgColor} rounded-3xl overflow-hidden shadow-sm`}
                >
                  {/* Exercise Card Image */}
                  <div className="h-48 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#E3DEF1' }}>
                    <img
                      src={
                        exercise.id === 'breathing-basic' ? '/asset/card1.png' :
                        exercise.id === 'breathing-advanced' ? '/asset/card2.png' :
                        exercise.id === 'body-scan' ? '/asset/card3.png' :
                        exercise.id === 'mindful-walking' ? '/asset/card5.png' :
                        exercise.id === 'focus-training' ? '/asset/card6.jpg' :
                        exercise.id === 'progressive-relaxation' ? '/asset/card7.webp' :
                        ''
                      }
                      alt={exercise.title}
                      className="w-full h-full object-cover"
                      style={{ maxHeight: '180px' }}
                    />
                    {/* Decorative elements */}
                    <div className="absolute top-4 left-4 w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="absolute top-8 right-8 w-2 h-2 bg-white/20 rounded-full"></div>
                    <div className="absolute bottom-6 left-8 w-4 h-4 bg-white/25 rounded-full"></div>
                    {/* Completed indicator */}
                    {completedExercises.has(exercise.id) && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6E55A0' }}>
                      {exercise.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex gap-2 mb-3">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                        style={{ 
                          backgroundColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
                      >
                        {exercise.category}
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                        style={{ 
                          backgroundColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: '#6E55A0' }}>
                      {exercise.description}
                    </p>

                    {/* Duration */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <span className="font-medium" style={{ color: '#8A6FBF' }}>{exercise.duration} min</span>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <p className="text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>Benefits:</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.benefits.map((benefit, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 rounded-md text-xs"
                            style={{ 
                              backgroundColor: 'rgba(227, 222, 241, 0.6)',
                              color: '#6E55A0'
                            }}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Start Button */}
                    <motion.button
                      onClick={() => handleStartExercise(exercise)}
                      className="w-full text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-colors duration-200"
                      style={{ backgroundColor: '#8A6FBF' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#6E55A0'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#8A6FBF'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play className="w-5 h-5" fill="currentColor" />
                      Start Exercise
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Recent Sessions */}
          {sessions.length > 0 && (
            <motion.div variants={itemVariants} className="mt-12">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#6E55A0' }}>Recent Sessions</h2>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: '#E3DEF1' }}>
                              <Activity className="h-4 w-4" style={{ color: '#8A6FBF' }} />
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: '#6E55A0' }}>{session.name || session.type}</p>
                              <p className="text-sm" style={{ color: '#6E55A0' }}>
                                {session.difficulty && `${session.difficulty} • `}
                                {session.duration ? `${Math.round(session.duration / 60)}m` : 'Completed'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm" style={{ color: '#6E55A0' }}>
                              {session.timestamp && new Date(session.timestamp).toLocaleDateString()}
                            </p>
                            {session.score && (
                              <p className="font-bold" style={{ color: '#8A6FBF' }}>{session.score} pts</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}