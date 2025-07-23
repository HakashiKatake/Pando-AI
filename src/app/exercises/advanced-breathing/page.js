"use client";
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function AdvancedBreathingExercisePage() {
  // ...copy logic from breathing page, but use card2.png as background...
  // For brevity, only the main exercise area is shown here
  return (
    <div className="min-h-screen" style={{ background: 'url(/asset/card2.png) center/cover no-repeat' }}>
      {/* Overlay for readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(247,245,250,0.85)', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* ...existing header and controls logic from breathing page... */}
        <motion.div className="max-w-4xl mx-auto px-6 py-8">
          {/* Main Exercise Area */}
          <motion.div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            {/* Panda Placeholder */}
            <motion.div className="w-32 h-32 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E3DEF1' }}>
              <img src="/asset/panda-inhale.png" alt="Panda inhaling" className="w-24 h-24 object-contain" />
            </motion.div>
            {/* ...rest of the breathing exercise UI... */}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
