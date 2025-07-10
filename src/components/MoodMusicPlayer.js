
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Chill, cozy, cold, light purple/pink/blue theme for all moods
const moodColors = {
  sad: 'from-[#e0c3fc] via-[#8ec5fc] to-[#f9d6e9]', // light purple to blue to pink
  angry: 'from-[#e0c3fc] via-[#8ec5fc] to-[#f9d6e9]',
  anxious: 'from-[#e0c3fc] via-[#8ec5fc] to-[#f9d6e9]',
  happy: 'from-[#e0c3fc] via-[#8ec5fc] to-[#f9d6e9]',
  tired: 'from-[#e0c3fc] via-[#8ec5fc] to-[#f9d6e9]',
};

const moods = [
  { name: 'sad', emoji: '😢' },
  { name: 'angry', emoji: '😡' },
  { name: 'anxious', emoji: '😰' },
  { name: 'happy', emoji: '😊' },
  { name: 'tired', emoji: '😴' },
];

export default function MoodMusicPlayer() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [musicList, setMusicList] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    setPlaying(null);
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    setPaused(false);
    const res = await fetch(`/api/music?mood=${mood}`);
    const data = await res.json();
    setMusicList(data.urls || []);
    setLoading(false);
  };

  const handlePlay = (url) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new window.Audio(url);
    setAudio(newAudio);
    setPlaying(url);
    setPaused(false);
    newAudio.play();
    newAudio.onended = () => {
      setPlaying(null);
      setPaused(false);
    };
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
      setPaused(true);
    }
  };

  const handleResume = () => {
    if (audio) {
      audio.play();
      setPaused(false);
    }
  };

  const handleStop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(null);
      setPaused(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] w-full transition-all duration-500 bg-gradient-to-br ${selectedMood ? moodColors[selectedMood] : 'from-[#e0c3fc] via-[#8ec5fc] to-[#f9d6e9]'}`}>
      <motion.h2
        className="text-3xl font-extrabold mb-8 tracking-tight drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        How are you feeling today?
      </motion.h2>
      <div className="flex gap-8 mb-12">
        {moods.map((mood) => (
          <motion.button
            key={mood.name}
            whileHover={{ scale: 1.25, rotate: 8, boxShadow: '0 4px 24px #a5b4fc' }}
            whileTap={{ scale: 0.95 }}
            className={`text-6xl transition-all duration-200 shadow-lg rounded-full p-2 border-2 ${selectedMood === mood.name ? 'ring-8 ring-opacity-40 ring-blue-400 scale-110 bg-white' : 'bg-white/80 border-blue-200'}`}
            onClick={() => handleMoodSelect(mood.name)}
            aria-label={mood.name}
            style={{ filter: selectedMood === mood.name ? 'drop-shadow(0 0 8px #60a5fa)' : '' }}
          >
            {mood.emoji}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-blue-100 backdrop-blur-md"
          >
            <motion.h3
              className="text-2xl font-bold mb-4 text-center animate-pulse text-blue-700"
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Pick a tune for your mood
            </motion.h3>
            {loading ? (
              <div className="text-center animate-bounce text-lg font-semibold text-blue-400">Loading...</div>
            ) : (
              <div className="flex flex-col gap-4">
                {musicList.length === 0 && <div className="text-center text-gray-500">No tunes found.</div>}
                {musicList.map((url, idx) => (
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 shadow-md transition-all duration-200 bg-white/80 relative ${playing === url ? 'border-blue-400 scale-105' : 'border-blue-100'}`}
                  >
                    <button
                      className={`flex items-center gap-3 focus:outline-none text-lg font-medium ${playing === url ? 'font-bold text-blue-700' : 'text-gray-700'} cursor-pointer`}
                      style={{ flex: 1, textAlign: 'left' }}
                      onClick={() => handlePlay(url)}
                    >
                      <span className="mr-2">{playing === url ? 'Now Playing:' : 'Play'}</span>
                      <span className="">Tone {idx + 1}</span>
                      <span className="ml-3">
                        {playing === url ? (
                          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            🎵
                          </motion.span>
                        ) : (
                          '▶️'
                        )}
                      </span>
                    </button>
                    {playing === url && (
                      <div className="flex gap-2 ml-auto">
                        <button
                          className="px-3 py-1 rounded-lg bg-red-200 hover:bg-red-300 text-red-800 font-semibold shadow border border-red-300"
                          onClick={handleStop}
                        >
                          Stop
                        </button>
                        {!paused ? (
                          <button
                            className="px-3 py-1 rounded-lg bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-semibold shadow border border-yellow-300"
                            onClick={handlePause}
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1 rounded-lg bg-green-200 hover:bg-green-300 text-green-800 font-semibold shadow border border-green-300"
                            onClick={handleResume}
                          >
                            Continue
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
