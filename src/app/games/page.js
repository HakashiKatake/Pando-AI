"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { 
  Calendar,
  Clock,
  ChevronDown,
  Gamepad2,
  Brain,
  Timer,
  Zap,
  Eye,
  Target,
  Trophy,
  Palette,
  Mic
} from "lucide-react"
import { useExerciseStore } from '@/lib/store'
import { useDataInitialization } from '@/lib/useDataInitialization'


const WellnessGames = () => {
  const router = useRouter()
  const { sessions } = useExerciseStore()
  const dataInit = useDataInitialization()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Games data with routes and functionality
  const games = [
    {
      id: 'color-match',
      title: "Color Match",
      category: "Focus",
      duration: "2-5 mins",
      description: "Match color names with their actual colors to improve focus and reduce anxiety",
      difficulty: ["Easy", "Medium", "Hard"],
      difficultyLevels: [
        { level: "Easy", color: "#22C55E", active: true },
        { level: "Medium", color: "#F59E0B", active: false },
        { level: "Hard", color: "#EF4444", active: false }
      ],
      backgroundColor: "#1F2937",
      textColor: "#FFFFFF",
      buttonColor: "#8B5CF6",
      icon: Palette,
      route: '/games/color-match',
      benefits: [
        "Reduces Stress",
        "Improves focus", 
        "Calms mind"
      ]
    },
    {
      id: 'memory-sequence',
      title: "Memory Sequence",
      category: "Memory",
      duration: "3-7 mins",
      description: "Remember and repeat sequence to boost working memory and concentration",
      difficulty: ["Easy", "Medium", "Hard"],
      difficultyLevels: [
        { level: "Easy", color: "#22C55E", active: true },
        { level: "Medium", color: "#F59E0B", active: false },
        { level: "Hard", color: "#EF4444", active: false }
      ],
      backgroundColor: "#E0F2FE",
      textColor: "#1E293B",
      buttonColor: "#8B5CF6",
      icon: Brain,
      route: '/games/memory-sequence',
      benefits: [
        "Boost memory",
        "Improves focus"
      ]
    },
    {
      id: 'reaction-timer',
      title: "Reaction Timer",
      category: "Mindfulness",
      duration: "2-5 mins",
      description: "Test and improve your reaction time with this mindfulness-based game",
      difficulty: ["Easy", "Medium", "Hard"],
      difficultyLevels: [
        { level: "Easy", color: "#22C55E", active: true },
        { level: "Medium", color: "#F59E0B", active: false },
        { level: "Hard", color: "#EF4444", active: false }
      ],
      backgroundColor: "#6366F1",
      textColor: "#FFFFFF",
      buttonColor: "#8B5CF6",
      icon: Zap,
      route: '/games/reaction-timer',
      benefits: [
        "Improves reaction time",
        "Enhances Mindfulness"
      ]
    },
    {
  id: 'chirp-jump',
  title: "Chirp Jump",
  category: "Focus",
  duration: "3-8 mins",
  description: "Voice-controlled jumping adventure that improves focus and breathing control",
  difficulty: ["Easy", "Medium", "Hard"],
  difficultyLevels: [
    { level: "Easy", color: "#22C55E", active: true },
    { level: "Medium", color: "#F59E0B", active: false },
    { level: "Hard", color: "#EF4444", active: false }
  ],
  backgroundColor: "#87CEEB",
  textColor: "#FFFFFF", 
  buttonColor: "#8B5CF6",
  icon: Mic,
  route: '/games/chirp',
  benefits: [
    "Improves vocal control",
    "Enhances focus",
    "Builds coordination"
  ]
}

  ]

  // Game functionality from old code
  const handleStartGame = (game) => {
    router.push(game.route)
  }

  const getGameStats = () => {
    if (!isHydrated) return { totalGames: 0, totalTime: 0, bestScores: {}, recentSessions: [] }
    
    // Filter sessions to only include games
    const gameSessions = sessions.filter(session => 
      session.exerciseType === 'game' || 
      ['color-match', 'memory-sequence', 'reaction-timer'].includes(session.gameType || session.exerciseId)
    )
    
    const totalGames = gameSessions.length
    const totalTime = gameSessions.reduce((acc, session) => acc + (session.duration || 0), 0)
    const bestScores = {}
    
    // Calculate best scores for each game type
    gameSessions.forEach(session => {
      const gameType = session.gameType || session.exerciseId
      if (gameType && session.score !== undefined) {
        if (!bestScores[gameType] || session.score > bestScores[gameType]) {
          bestScores[gameType] = session.score
        }
      }
    })

    return {
      totalGames,
      totalTime: Math.round(totalTime),
      bestScores,
      recentSessions: gameSessions.slice(-5).reverse()
    }
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const stats = getGameStats()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  }

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7 }
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  }

  // Prevent hydration errors
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
          <p style={{ color: '#6E55A0' }}>Loading your games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="px-4 sm:px-6 pb-12">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title Section */}
          <motion.div 
            variants={itemVariants}
            className="text-center mb-8 sm:mb-12"
          >
            {/* Panda Game Image */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img 
                src="/asset/panda-game.png" 
                alt="Panda Playing Games"
                className="w-24 h-24 mx-auto object-contain"
              />
            </motion.div>

            <motion.h1 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
              style={{ color: '#6E55A0' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Wellness Games
            </motion.h1>
            
            <motion.p 
              className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: '#6E55A0' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Play engaging mini-games designed to improve focus, memory, and mindfulness while reducing stress and anxiety
            </motion.p>
          </motion.div>

          {/* Game Stats */}
          {stats.totalGames > 0 && (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
            >
              <motion.div
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#E3DEF1' }}>
                    <Gamepad2 className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#6E55A0' }}>{stats.totalGames}</p>
                    <p className="text-sm" style={{ color: '#8A6FBF' }}>Games Played</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#E3DEF1' }}>
                    <Trophy className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#6E55A0' }}>
                      {Object.keys(stats.bestScores).length > 0 
                        ? Math.max(...Object.values(stats.bestScores)) 
                        : 0}
                    </p>
                    <p className="text-sm" style={{ color: '#8A6FBF' }}>Best Score</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#E3DEF1' }}>
                    <Clock className="h-6 w-6" style={{ color: '#8A6FBF' }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#6E55A0' }}>{formatTime(stats.totalTime)}</p>
                    <p className="text-sm" style={{ color: '#8A6FBF' }}>Total Time</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Games Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12"
            variants={containerVariants}
          >
            {games.map((game, index) => {
              const gameStats = stats.bestScores[game.id]
              const Icon = game.icon
              
              return (
                <motion.div
                  key={game.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg"
                >
                  {/* Game Image */}
                  <div 
                    className="h-48 sm:h-56 relative overflow-hidden"
                    style={{ backgroundColor: game.backgroundColor }}
                  >
                    {/* Placeholder for game image */}
                    <div className="w-full h-full flex items-center justify-center">
                      {game.id === 'color-match' && (
                        // Color Match - Colorful grid pattern
                        <div className="grid grid-cols-4 gap-1 p-4">
                          {[
                            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
                            '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
                            '#00D2D3', '#FF9F43', '#0FB9B1', '#EE5A24',
                            '#FD79A8', '#FDCB6E', '#6C5CE7', '#A29BFE'
                          ].map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                      {game.id === 'memory-sequence' && (
                        // Memory Sequence - Brain illustration placeholder
                        <div className="flex items-center justify-center">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-pink-200 flex items-center justify-center">
                            <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-pink-600" />
                          </div>
                        </div>
                      )}
                      {game.id === 'reaction-timer' && (
                        // Reaction Timer - Mobile device placeholder
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-24 sm:w-20 sm:h-32 bg-white rounded-lg border-4 border-gray-300 flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-1">
                              {['#FF6B6B', '#4ECDC4', '#FECA57', '#96CEB4'].map((color, i) => (
                                <div
                                  key={i}
                                  className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {game.id === 'chirp-jump' && (
                        // Chirp Jump - Chicken with platforms and clouds
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                          {/* Background clouds */}
                          <div className="absolute inset-0">
                            <div className="absolute top-8 left-8 w-12 h-8 bg-white opacity-80 rounded-full"></div>
                            <div className="absolute top-6 left-12 w-16 h-10 bg-white opacity-60 rounded-full"></div>
                            <div className="absolute top-12 right-12 w-10 h-6 bg-white opacity-70 rounded-full"></div>
                            <div className="absolute top-4 right-16 w-14 h-8 bg-white opacity-50 rounded-full"></div>
                          </div>
                          
                          {/* Platforms */}
                          <div className="absolute bottom-16 left-4 w-16 h-3 bg-teal-400 rounded shadow-lg"></div>
                          <div className="absolute bottom-24 right-6 w-20 h-3 bg-teal-400 rounded shadow-lg"></div>
                          <div className="absolute bottom-32 left-8 w-14 h-3 bg-red-400 rounded shadow-lg"></div>
                          
                          {/* Golden eggs */}
                          <div className="absolute bottom-20 left-8 w-3 h-4 bg-yellow-400 rounded-full shadow-md"></div>
                          <div className="absolute bottom-28 right-10 w-3 h-4 bg-yellow-400 rounded-full shadow-md"></div>
                          
                          {/* Main chicken image */}
                          <div className="relative z-10 flex items-center justify-center">
                            <img 
                              src="/asset/chicken.png" 
                              alt="Chirp Jump Chicken"
                              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg"
                              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                            />
                          </div>
                          
                          {/* Microphone indicator */}
                          <div className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                            <Mic className="w-4 h-4 text-gray-600" />
                          </div>
                          
                          {/* Voice waves animation effect */}
                          <div className="absolute bottom-8 right-8">
                            <div className="flex items-center space-x-1">
                              <div className="w-1 bg-white opacity-60 rounded-full animate-pulse" style={{ height: '8px', animationDelay: '0ms' }}></div>
                              <div className="w-1 bg-white opacity-80 rounded-full animate-pulse" style={{ height: '12px', animationDelay: '100ms' }}></div>
                              <div className="w-1 bg-white opacity-60 rounded-full animate-pulse" style={{ height: '6px', animationDelay: '200ms' }}></div>
                              <div className="w-1 bg-white opacity-90 rounded-full animate-pulse" style={{ height: '10px', animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Game Title Overlay */}
                    <div className="absolute bottom-4 left-4">
                      <h3 
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: game.textColor }}
                      >
                        {game.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-6">
                    {/* Category and Duration */}
                    <div className="flex items-center justify-between mb-3">
                      <span 
                        className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: '#E3DEF1',
                          color: '#8A6FBF'
                        }}
                      >
                        {game.category}
                      </span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: '#6B7280' }}
                      >
                        {game.duration}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                      {game.description}
                    </p>

                    {/* Personal Best Score */}
                    {gameStats && (
                      <div className="flex items-center gap-2 p-2 mb-4 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                        <Trophy className="h-4 w-4" style={{ color: '#D97706' }} />
                        <span className="text-sm font-medium" style={{ color: '#92400E' }}>Best: {gameStats}</span>
                      </div>
                    )}

                    {/* Difficulty Levels */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        Difficulty levels:
                      </p>
                      <div className="flex gap-2">
                        {game.difficultyLevels.map((level, levelIndex) => (
                          <span
                            key={levelIndex}
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: level.color }}
                          >
                            {level.level}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <p className="text-sm font-medium mb-3" style={{ color: '#374151' }}>
                        Benefits:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {game.benefits.map((benefit, benefitIndex) => (
                          <motion.span
                            key={benefitIndex}
                            className="text-xs px-3 py-1 rounded-full border"
                            style={{ 
                              borderColor: '#E3DEF1',
                              color: '#8A6FBF',
                              backgroundColor: '#F7F5FA'
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 + benefitIndex * 0.1 }}
                          >
                            {benefit}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Play Button */}
                    <motion.button
                      className="w-full py-3 sm:py-4 rounded-xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2"
                      style={{ backgroundColor: game.buttonColor }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleStartGame(game)}
                    >
                      <span>▶</span>
                      Play Game
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Recent Sessions */}
          {stats.recentSessions.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#6E55A0' }}>Recent Game Sessions</h2>
              <div className="space-y-3">
                {stats.recentSessions.map((session, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-xl p-4 shadow-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#E3DEF1' }}>
                          <Trophy className="h-4 w-4" style={{ color: '#8A6FBF' }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#6E55A0' }}>
                            {games.find(g => g.id === (session.gameType || session.exerciseId))?.title || 'Game'}
                          </p>
                          <p className="text-sm" style={{ color: '#8A6FBF' }}>
                            {formatTime(session.duration || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: '#8A6FBF' }}>
                          {session.score !== undefined ? session.score : 'N/A'}
                        </p>
                        <p className="text-xs" style={{ color: '#8A6FBF' }}>Score</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Additional Info Section */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <motion.div
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E3DEF1' }}>
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#8A6FBF' }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#6E55A0' }}>
                  Why Play Wellness Games?
                </h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed max-w-3xl mx-auto" style={{ color: '#8A6FBF' }}>
                Our carefully designed mini-games combine fun with science-backed techniques to enhance cognitive function, 
                reduce stress, and improve overall mental well-being. Each game targets specific areas of brain health 
                while providing an enjoyable and engaging experience.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default WellnessGames