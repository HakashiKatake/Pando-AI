"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Shuffle,
  Heart,
  ChevronDown,
  Calendar,
  Clock,
  Minimize2
} from "lucide-react"

const MoodMusic = () => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeated, setIsRepeated] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const audioRef = useRef(null)

  // Updated time to match your current timestamp
  const currentDateTime = "06:32"
  const currentDate = "Jul 14 - Jul 29"
  const userName = "HakashiKatake"

  // Category filters
  const categories = [
    { name: 'All', color: '#8A6FBF' },
    { name: 'Focus', color: '#8A6FBF' },
    { name: 'Chill', color: '#8A6FBF' },
    { name: 'Energy', color: '#4ADE80' },
    { name: 'Sleep', color: '#F97316' },
    { name: 'Nature', color: '#6366F1' }
  ]

  // Music tracks data with audio URLs (you can replace with actual audio files)
  const musicTracks = [
    {
      id: 1,
      title: "Deep Concentration",
      artist: "Ambient Flow",
      category: "Focus",
      image: "/api/placeholder/300/200",
      bgColor: "bg-blue-900",
      audioUrl: "https://www.soundjay.com/misc/sounds/rain-01.wav", // Replace with actual audio
      duration: 180
    },
    {
      id: 2,
      title: "Ocean Breeze",
      artist: "Chill Vibes",
      category: "Chill",
      image: "/api/placeholder/300/200",
      bgColor: "bg-blue-400",
      audioUrl: "https://www.soundjay.com/misc/sounds/rain-02.wav", // Replace with actual audio
      duration: 240
    },
    {
      id: 3,
      title: "Neon Pulse",
      artist: "Synth Wave Collective",
      category: "Energy",
      image: "/api/placeholder/300/200",
      bgColor: "bg-purple-900",
      audioUrl: "https://www.soundjay.com/misc/sounds/rain-03.wav", // Replace with actual audio
      duration: 200
    },
    {
      id: 4,
      title: "Midnight Lullaby",
      artist: "Dreamscape",
      category: "Sleep",
      image: "/api/placeholder/300/200",
      bgColor: "bg-gray-900",
      audioUrl: "https://www.soundjay.com/misc/sounds/rain-04.wav", // Replace with actual audio
      duration: 300
    },
    {
      id: 5,
      title: "Power Up",
      artist: "Energy Boost",
      category: "Energy",
      image: "/api/placeholder/300/200",
      bgColor: "bg-green-600",
      audioUrl: "https://www.soundjay.com/misc/sounds/rain-05.wav", // Replace with actual audio
      duration: 220
    },
    {
      id: 6,
      title: "Study Session",
      artist: "Brain Waves",
      category: "Focus",
      image: "/api/placeholder/300/200",
      bgColor: "bg-pink-300",
      audioUrl: "https://www.soundjay.com/misc/sounds/rain-06.wav", // Replace with actual audio
      duration: 280
    },
    {
      id: 7,
      title: "Zen Garden",
      artist: "Tranquil Sounds",
      category: "Nature",
      image: "/api/placeholder/300/200",
      bgColor: "bg-amber-200",
      audioUrl: "https://www.soundjay.com/misc/sounds/rain-07.wav", // Replace with actual audio
      duration: 260
    },
    {
      id: 8,
      title: "Rock Arena",
      artist: "The Amplifiers",
      category: "Energy",
      image: "/api/placeholder/300/200",
      bgColor: "bg-blue-500",
      audioUrl: "https://www.soundjay.com/misc/sounds/rain-08.wav", // Replace with actual audio
      duration: 190
    }
  ]

  // Filter tracks based on active category
  const filteredTracks = activeCategory === 'All' 
    ? musicTracks 
    : musicTracks.filter(track => track.category === activeCategory)

  // Handle play track
  const handlePlayTrack = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      // If same track is playing, pause it
      setIsPlaying(false)
      audioRef.current?.pause()
    } else {
      // Play new track or resume current track
      setCurrentTrack(track)
      setIsPlaying(true)
      setShowPlayer(true)
      
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl
        audioRef.current.play().catch(console.error)
      }
    }
  }

  // Handle play/pause from player
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      audioRef.current?.play().catch(console.error)
      setIsPlaying(true)
    }
  }

  // Handle skip functions
  const skipToNext = () => {
    const currentIndex = musicTracks.findIndex(track => track.id === currentTrack?.id)
    const nextIndex = (currentIndex + 1) % musicTracks.length
    handlePlayTrack(musicTracks[nextIndex])
  }

  const skipToPrevious = () => {
    const currentIndex = musicTracks.findIndex(track => track.id === currentTrack?.id)
    const prevIndex = currentIndex === 0 ? musicTracks.length - 1 : currentIndex - 1
    handlePlayTrack(musicTracks[prevIndex])
  }

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (isRepeated) {
        audio.currentTime = 0
        audio.play()
      } else {
        skipToNext()
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isRepeated])

  // Format time
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Handle progress bar click
  const handleProgressClick = (e) => {
    const rect = e.target.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

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
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  }

  const playerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      y: 100, 
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <motion.header 
        className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
              <span>{currentDateTime}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              SOS
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className={`pt-20 px-6 ${showPlayer ? 'pb-32' : 'pb-12'}`}>
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#6E55A0' }}>
              Mood Music
            </h1>
            <p className="text-xl" style={{ color: '#8A6FBF' }}>
              Find the perfect soundtrack for your current vibe
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex flex-wrap gap-4">
              {categories.map((category, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveCategory(category.name)}
                  className={`px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 border-2`}
                  style={
                    activeCategory === category.name
                      ? { 
                          backgroundColor: category.color,
                          borderColor: category.color,
                          color: 'white'
                        }
                      : { 
                          backgroundColor: 'white',
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeCategory !== category.name) {
                      e.target.style.backgroundColor = '#E3DEF1'
                      e.target.style.borderColor = '#E3DEF1'
                      e.target.style.color = '#6E55A0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== category.name) {
                      e.target.style.backgroundColor = 'white'
                      e.target.style.borderColor = '#E3DEF1'
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

          {/* Music Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredTracks.map((track, index) => (
              <motion.div
                key={track.id}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
              >
                {/* Track Image */}
                <div 
                  className={`h-48 ${track.bgColor} relative flex items-center justify-center`}
                >
                  {/* Placeholder for broken/empty image */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-gray-400 text-4xl">🎵</div>
                  </div>
                  
                  {/* Play button overlay */}
                  <div className="absolute top-4 right-4">
                    <motion.button
                      onClick={() => handlePlayTrack(track)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause 
                          className="w-5 h-5" 
                          style={{ color: '#8A6FBF' }} 
                          fill="currentColor" 
                        />
                      ) : (
                        <Play 
                          className="w-5 h-5 ml-0.5" 
                          style={{ color: '#8A6FBF' }} 
                          fill="currentColor" 
                        />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Track Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#6E55A0' }}>
                    {track.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#8A6FBF' }}>
                    {track.artist}
                  </p>

                  {/* Play button and progress bar */}
                  <div className="flex items-center gap-4 mb-4">
                    <motion.button
                      onClick={() => handlePlayTrack(track)}
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: '#E3DEF1' }}
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: '#8A6FBF'
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause 
                          className="w-5 h-5" 
                          style={{ color: '#8A6FBF' }} 
                          fill="currentColor" 
                        />
                      ) : (
                        <Play 
                          className="w-5 h-5 ml-0.5" 
                          style={{ color: '#8A6FBF' }} 
                          fill="currentColor" 
                        />
                      )}
                    </motion.button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#E3DEF1' }}>
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#8A6FBF' }}
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: currentTrack?.id === track.id 
                          ? `${(currentTime / duration) * 100}%` 
                          : `${Math.random() * 60 + 20}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty state if no tracks found */}
          {filteredTracks.length === 0 && (
            <motion.div 
              variants={itemVariants}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-2xl font-semibold mb-2" style={{ color: '#6E55A0' }}>
                No tracks found
              </h3>
              <p className="text-lg" style={{ color: '#8A6FBF' }}>
                Try selecting a different category
              </p>
            </motion.div>
          )}

          {/* Load More Button */}
          {filteredTracks.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="text-center mt-12"
            >
              <motion.button
                className="px-12 py-4 bg-white border-2 rounded-2xl font-semibold text-lg transition-colors duration-200"
                style={{ 
                  borderColor: '#E3DEF1',
                  color: '#6E55A0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#E3DEF1'
                  e.target.style.color = '#6E55A0'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                  e.target.style.color = '#6E55A0'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Load More Tracks
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Music Player - Spotify-like */}
      <AnimatePresence>
        {showPlayer && currentTrack && (
          <motion.div
            variants={playerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50"
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Track Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-xl">🎵</div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate" style={{ color: '#6E55A0' }}>
                      {currentTrack.title}
                    </h4>
                    <p className="text-sm truncate" style={{ color: '#8A6FBF' }}>
                      {currentTrack.artist}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setIsLiked(!isLiked)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart 
                      className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </motion.button>
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center flex-2 max-w-2xl mx-8">
                  {/* Control Buttons */}
                  <div className="flex items-center space-x-4 mb-2">
                    <motion.button
                      onClick={() => setIsShuffled(!isShuffled)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={isShuffled ? 'text-green-500' : 'text-gray-400'}
                    >
                      <Shuffle className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      onClick={skipToPrevious}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ color: '#6E55A0' }}
                    >
                      <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      onClick={togglePlayPause}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#8A6FBF' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" fill="currentColor" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={skipToNext}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ color: '#6E55A0' }}
                    >
                      <SkipForward className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      onClick={() => setIsRepeated(!isRepeated)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={isRepeated ? 'text-green-500' : 'text-gray-400'}
                    >
                      <Repeat className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center space-x-3 w-full">
                    <span className="text-xs" style={{ color: '#6E55A0' }}>
                      {formatTime(currentTime)}
                    </span>
                    <div 
                      className="flex-1 h-1 rounded-full cursor-pointer"
                      style={{ backgroundColor: '#E3DEF1' }}
                      onClick={handleProgressClick}
                    >
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: '#8A6FBF',
                          width: `${(currentTime / duration) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: '#6E55A0' }}>
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Volume and Extra Controls */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" style={{ color: '#6E55A0' }} />
                    <div className="w-20 h-1 rounded-full" style={{ backgroundColor: '#E3DEF1' }}>
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: '#8A6FBF',
                          width: `${volume}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => setShowPlayer(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MoodMusic