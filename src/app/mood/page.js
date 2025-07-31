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
  // Animated music notes for hero section
  const MusicNoteSVG = ({ className = "" }) => (
    <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4v16.5a4.5 4.5 0 1 1-2-3.7V8h-8v12.5a4.5 4.5 0 1 1-2-3.7V4h12z" stroke="#8A6FBF" strokeWidth="2" fill="#E3DEF1" />
    </svg>
  );
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
    title: "Calm Down",
    artist: "Ambient Flow",
    category: "Focus",
    bgColor: "bg-blue-900",
    audioUrl: "/music/1.wav",
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
    audioUrl: "/music/1.wav",
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
    audioUrl: "/music/1.wav",
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
    audioUrl: "/music/1.wav",
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
    audioUrl: "/music/1.wav",
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
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "linear-gradient(135deg, #F7F5FA 0%, #E3DEF1 100%)" }}>
      {/* Decorative floating notes */}
      <div className="absolute top-0 left-0 w-full h-0 pointer-events-none z-0">
        <MusicNoteSVG className="absolute left-12 top-8 animate-bounce" />
        <MusicNoteSVG className="absolute right-24 top-16 animate-spin-slow" />
        <MusicNoteSVG className="absolute left-1/2 top-24 animate-bounce-slow" />
      </div>

      {/* Hidden audio element */}
      {/* <audio ref={audioRef} /> */}

      <Header/>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-12 mb-8">
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className="absolute left-0 right-0 top-0 h-64 bg-gradient-to-br from-purple-100 via-blue-100 to-transparent opacity-60" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <img src="/asset/happy.png" alt="Panda Mascot" className="w-24 h-24 mb-4 drop-shadow-xl animate-float" />
          <h1 className="text-5xl font-extrabold mb-2 text-center" style={{ color: "#6E55A0", textShadow: "0 2px 12px #E3DEF1" }}>
            Mood Music
          </h1>
          <p className="text-xl text-center mb-2" style={{ color: "#8A6FBF" }}>
            Find the perfect soundtrack for your current vibe
          </p>
          <div className="flex gap-2 mt-2">
            <MusicNoteSVG className="animate-bounce" />
            <MusicNoteSVG className="animate-spin-slow" />
            <MusicNoteSVG className="animate-bounce-slow" />
          </div>
        </div>
      </section>

          {/* Category Filters */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category, index) => {
                const isActive = activeCategory === category.name;
                const icons = {
                  Focus: '🧠',
                  Chill: '🌊',
                  Energy: '⚡',
                  Sleep: '🌙',
                  Nature: '🌿',
                  All: '🎶',
                };
                return (
                  <motion.button
                    key={index}
                    onClick={() => setActiveCategory(category.name)}
                    className={`px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 border-2 shadow-md flex items-center gap-2 ${isActive ? 'scale-105' : ''}`}
                    style={{
                      background: isActive ? `linear-gradient(90deg, ${category.activeBg} 60%, #F7F5FA 100%)` : "white",
                      borderColor: isActive ? category.activeBg : category.inactiveBorder,
                      color: isActive ? category.activeText : category.inactiveText,
                      boxShadow: isActive ? '0 2px 16px #E3DEF1' : 'none',
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-2xl">{icons[category.name]}</span>
                    {category.name}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Music Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredTracks.map((track, index) => (
              <motion.div
                key={track.id}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative transition-all duration-300"
                style={{ boxShadow: '0 4px 32px #E3DEF1', border: '2px solid #E3DEF1' }}
              >
                <div
                  className={`h-56 relative flex items-center justify-center group`}
                  style={{
                    backgroundImage: `url(${track.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 to-blue-100/30 pointer-events-none" />
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-purple-200 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-glow" />
                  {/* Panda mascot overlay for extra fun */}
                  <img src="/asset/happy.png" alt="Panda" className="absolute bottom-2 right-2 w-10 h-10 opacity-80 group-hover:scale-110 transition-transform duration-300" />
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
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-blue-100"
                      whileHover={{ scale: 1.15, backgroundColor: "#8A6FBF" }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ color: '#8A6FBF' }}
                        whileHover={{ color: '#fff' }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="w-6 h-6" fill="currentColor" />
                        ) : (
                          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                        )}
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* Track duration and category badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                      {track.category}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')} min
                    </span>
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
                className="px-12 py-4 bg-gradient-to-br from-purple-100 to-blue-100 border-2 rounded-2xl font-semibold text-lg transition-colors duration-200 shadow-lg"
                style={{
                  borderColor: "#E3DEF1",
                  color: "#6E55A0",
                  boxShadow: '0 2px 16px #E3DEF1',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#E3DEF1";
                  e.target.style.color = "#6E55A0";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "";
                  e.target.style.color = "#6E55A0";
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
              >
                Load More Tracks
              </motion.button>
            </motion.div>
          )}
    </div>
  
      
  );
};

export default MoodMusic;
