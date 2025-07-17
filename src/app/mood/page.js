"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  Play,
  Pause,
  ChevronDown,
  Calendar,
  Clock,
} from "lucide-react";

import Link from "next/link";

import Header from '@/components/Header';
import { useMusicStore } from '@/lib/store';


const MoodMusic = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    setPlaylist 
  } = useMusicStore();



  const categories = [
  {
    name: 'All',
    activeBg: '#EDEADE',
    activeText: '#3A3A3A',
    inactiveBorder: '#E0DFF3',
    inactiveText: '#6B4C9A'
  },
  {
    name: 'Focus',
    activeBg: '#A7C7E7',
    activeText: '#1F3B5B',
    inactiveBorder: '#E0DFF3',
    inactiveText: '#6B4C9A'
  },
  {
    name: 'Chill',
    activeBg: '#B8C4B0',
    activeText: '#2F3B2F',
    inactiveBorder: '#E0DFF3',
    inactiveText: '#6B4C9A'
  },
  {
    name: 'Energy',
    activeBg: '#F4B942',
    activeText: '#5A3D00',
    inactiveBorder: '#E0DFF3',
    inactiveText: '#6B4C9A'
  },
  {
    name: 'Sleep',
    activeBg: '#C6B3E6',
    activeText: '#3A2C4F',
    inactiveBorder: '#E0DFF3',
    inactiveText: '#6B4C9A'
  },
  {
    name: 'Nature',
    activeBg: '#76956F',
    activeText: '#FFFFFF',
    inactiveBorder: '#E0DFF3',
    inactiveText: '#6B4C9A'
  }
];



  // Music tracks data with audio URLs (you can replace with actual audio files)
  const musicTracks = [
  // Focus
  {
    id: 1,
    title: "Deep Concentration",
    artist: "Ambient Flow",
    category: "Focus",
    bgColor: "bg-blue-900",
    audioUrl: "/music/1.mp3",
    bgImage: "/music_bg/img1.jpeg",
    duration: 180,
  },
  {
    id: 2,
    title: "Study Session",
    artist: "Brain Waves",
    category: "Focus",
    bgColor: "bg-blue-800",
    audioUrl: "/music/2.mp3",
    bgImage: "/music_bg/img2.jpeg",
    duration: 280,
  },
  {
    id: 3,
    title: "Focus Flow",
    artist: "Clarity Beats",
    category: "Focus",
    bgColor: "bg-blue-700",
    audioUrl: "/music/3.mp3",
    bgImage: "/music_bg/img3.jpeg",
    duration: 200,
  },
  {
    id: 4,
    title: "Calm Study",
    artist: "Smart Tones",
    category: "Focus",
    bgColor: "bg-blue-600",
    audioUrl: "/music/4.mp3",
    bgImage: "/music_bg/img4.jpeg",
    duration: 210,
  },
  {
    id: 5,
    title: "Zen Work",
    artist: "Productive State",
    category: "Focus",
    bgColor: "bg-blue-500",
    audioUrl: "/music/5.mp3",
    bgImage: "/music_bg/img5.jpeg",
    duration: 240,
  },

  // Chill
  {
    id: 6,
    title: "Ocean Breeze",
    artist: "Chill Vibes",
    category: "Chill",
    bgColor: "bg-blue-400",
    audioUrl: "/music/1.mp3",
    bgImage: "/music_bg/img1.jpeg",
    duration: 240,
  },
  {
    id: 7,
    title: "Mellow Sunset",
    artist: "Evening Loops",
    category: "Chill",
    bgColor: "bg-blue-300",
    audioUrl: "/music/2.mp3",
    bgImage: "/music_bg/img2.jpeg",
    duration: 220,
  },
  {
    id: 8,
    title: "Cool Tides",
    artist: "Lazy Bay",
    category: "Chill",
    bgColor: "bg-blue-200",
    audioUrl: "/music/3.mp3",
    bgImage: "/music_bg/img3.jpeg",
    duration: 250,
  },
  {
    id: 9,
    title: "Soft Drizzle",
    artist: "Ambient Drops",
    category: "Chill",
    bgColor: "bg-blue-100",
    audioUrl: "/music/4.mp3",
    bgImage: "/music_bg/img4.jpeg",
    duration: 260,
  },
  {
    id: 10,
    title: "Relaxation Mode",
    artist: "Breeze Flow",
    category: "Chill",
    bgColor: "bg-blue-50",
    audioUrl: "/music/5.mp3",
    bgImage: "/music_bg/img5.jpeg",
    duration: 245,
  },

  // Energy
  {
    id: 11,
    title: "Neon Pulse",
    artist: "Synth Wave Collective",
    category: "Energy",
    bgColor: "bg-purple-900",
    audioUrl: "/music/1.mp3",
    bgImage: "/music_bg/img1.jpeg",
    duration: 200,
  },
  {
    id: 12,
    title: "Power Up",
    artist: "Energy Boost",
    category: "Energy",
    bgColor: "bg-green-600",
    audioUrl: "/music/2.mp3",
    bgImage: "/music_bg/img2.jpeg",
    duration: 220,
  },
  {
    id: 13,
    title: "Jumpstart",
    artist: "Adrenaline Rush",
    category: "Energy",
    bgColor: "bg-purple-800",
    audioUrl: "/music/3.mp3",
    bgImage: "/music_bg/img3.jpeg",
    duration: 195,
  },
  {
    id: 14,
    title: "Ignite",
    artist: "Fuel Beats",
    category: "Energy",
    bgColor: "bg-purple-700",
    audioUrl: "/music/4.mp3",
    bgImage: "/music_bg/img4.jpeg",
    duration: 210,
  },
  {
    id: 15,
    title: "Rock Arena",
    artist: "The Amplifiers",
    category: "Energy",
    bgColor: "bg-purple-600",
    audioUrl: "/music/5.mp3",
    bgImage: "/music_bg/img5.jpeg",
    duration: 190,
  },

  // Sleep
  {
    id: 16,
    title: "Midnight Lullaby",
    artist: "Dreamscape",
    category: "Sleep",
    bgColor: "bg-gray-900",
    audioUrl: "/music/1.mp3",
    bgImage: "/music_bg/img1.jpeg",
    duration: 300,
  },
  {
    id: 17,
    title: "Starry Sky",
    artist: "Night Echo",
    category: "Sleep",
    bgColor: "bg-purple-300",
    audioUrl: "/music/2.mp3",
    bgImage: "/music_bg/img2.jpeg",
    duration: 280,
  },
  {
    id: 18,
    title: "Soft Sleep",
    artist: "Bedtime Tones",
    category: "Sleep",
    bgColor: "bg-purple-200",
    audioUrl: "/music/3.mp3",
    bgImage: "/music_bg/img3.jpeg",
    duration: 290,
  },
  {
    id: 19,
    title: "Drowsy Drift",
    artist: "Calm Night",
    category: "Sleep",
    bgColor: "bg-purple-100",
    audioUrl: "/music/4.mp3",
    bgImage: "/music_bg/img4.jpeg",
    duration: 275,
  },
  {
    id: 20,
    title: "Moon Whisper",
    artist: "Sleepscape",
    category: "Sleep",
    bgColor: "bg-purple-50",
    audioUrl: "/music/5.mp3",
    bgImage: "/music_bg/img5.jpeg",
    duration: 305,
  },

  // Nature
  {
    id: 21,
    title: "Zen Garden",
    artist: "Tranquil Sounds",
    category: "Nature",
    bgColor: "bg-amber-200",
    audioUrl: "/music/1.mp3",
    bgImage: "/music_bg/img1.jpeg",
    duration: 260,
  },
  {
    id: 22,
    title: "Forest Melody",
    artist: "Green Symphony",
    category: "Nature",
    bgColor: "bg-green-200",
    audioUrl: "/music/2.mp3",
    bgImage: "/music_bg/img2.jpeg",
    duration: 270,
  },
  {
    id: 23,
    title: "Nature's Echo",
    artist: "Wild Calm",
    category: "Nature",
    bgColor: "bg-green-300",
    audioUrl: "/music/3.mp3",
    bgImage: "/music_bg/img3.jpeg",
    duration: 265,
  },
  {
    id: 24,
    title: "Morning Dew",
    artist: "Fresh Air",
    category: "Nature",
    bgColor: "bg-green-400",
    audioUrl: "/music/4.mp3",
    bgImage: "/music_bg/img4.jpeg",
    duration: 250,
  },
  {
    id: 25,
    title: "Earth Rhythms",
    artist: "Gaia Beats",
    category: "Nature",
    bgColor: "bg-green-500",
    audioUrl: "/music/5.mp3",
    bgImage: "/music_bg/img5.jpeg",
    duration: 280,
  },
];



  // Filter tracks based on active category
  const filteredTracks = useMemo(() =>
    activeCategory === "All"
      ? musicTracks
      : musicTracks.filter((track) => track.category === activeCategory),
    [activeCategory]
  );

  // Set playlist when component mounts or category changes
  useEffect(() => {
    setPlaylist(filteredTracks);
  }, [filteredTracks]); // Remove setPlaylist from dependencies

  // Handle play track
  const handlePlayTrack = (track) => {
    playTrack(track);
  };
  

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5FA" }}>

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
            <h1 className="text-xl font-semibold" style={{ color: "#6E55A0" }}>
              CalmConnect
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{currentTime}</span>
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
      </motion.header>
=======
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
          <motion.div variants={itemVariants} className="mb-12">
            <h1
              className="text-5xl font-bold mb-4"
              style={{ color: "#6E55A0" }}
            >
              Mood Music
            </h1>
            <p className="text-xl" style={{ color: "#8A6FBF" }}>
              Find the perfect soundtrack for your current vibe
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex flex-wrap gap-4">
              {categories.map((category, index) => {
                const isActive = activeCategory === category.name;

                return (
                  <motion.button
                    key={index}
                    onClick={() => setActiveCategory(category.name)}
                    className="px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 border-2"
                    style={{
                      backgroundColor: isActive ? category.activeBg : "white",
                      borderColor: isActive
                        ? category.activeBg
                        : category.inactiveBorder,
                      color: isActive
                        ? category.activeText
                        : category.inactiveText,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor =
                          category.inactiveBorder;
                        e.target.style.borderColor = category.inactiveBorder;
                        e.target.style.color = category.inactiveText;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = "white";
                        e.target.style.borderColor = category.inactiveBorder;
                        e.target.style.color = category.inactiveText;
                      }
                    }}
                  >
                    {category.name}
                  </motion.button>
                );
              })}
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
                <div
                  className={`h-48 relative flex items-center justify-center`}
                  style={{
                    backgroundImage: `url(${track.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                {/* Overlay for gradient only, more transparent for clearer image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200/10 to-gray-300/20 pointer-events-none" />

                  {/* Play button overlay */}
                  <div className="absolute top-4 right-4 z-10">
                    <motion.button
                      onClick={() => handlePlayTrack(track)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause
                          className="w-5 h-5"
                          style={{ color: "#8A6FBF" }}
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          className="w-5 h-5 ml-0.5"
                          style={{ color: "#8A6FBF" }}
                          fill="currentColor"
                        />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Track Info */}
                <div className="p-6">
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "#6E55A0" }}
                  >
                    {track.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#8A6FBF" }}>
                    {track.artist}
                  </p>

                  {/* Play button and progress bar */}
                  <div className="flex items-center gap-4 mb-4">
                    <motion.button
                      onClick={() => handlePlayTrack(track)}
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: "#E3DEF1" }}
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "#8A6FBF",
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause
                          className="w-5 h-5"
                          style={{ color: "#8A6FBF" }}
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          className="w-5 h-5 ml-0.5"
                          style={{ color: "#8A6FBF" }}
                          fill="currentColor"
                        />
                      )}
                    </motion.button>
                  </div>

                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty state if no tracks found */}
          {filteredTracks.length === 0 && (
            <motion.div variants={itemVariants} className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3
                className="text-2xl font-semibold mb-2"
                style={{ color: "#6E55A0" }}
              >
                No tracks found
              </h3>
              <p className="text-lg" style={{ color: "#8A6FBF" }}>
                Try selecting a different category
              </p>
            </motion.div>
          )}

          {/* Load More Button */}
          {filteredTracks.length > 0 && (
            <motion.div variants={itemVariants} className="text-center mt-12">
              <motion.button
                className="px-12 py-4 bg-white border-2 rounded-2xl font-semibold text-lg transition-colors duration-200"
                style={{
                  borderColor: "#E3DEF1",
                  color: "#6E55A0",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#E3DEF1";
                  e.target.style.color = "#6E55A0";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "#6E55A0";
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
    </div>
  );
};

export default MoodMusic;
