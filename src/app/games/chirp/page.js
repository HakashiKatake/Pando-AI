'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Trophy, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function ChirpJumpGame() {
  // Game states
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [eggsCollected, setEggsCollected] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  
  // Audio states
  const [micPermission, setMicPermission] = useState('prompt');
  const [isListening, setIsListening] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [micError, setMicError] = useState('');

  // Refs
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const dataArrayRef = useRef(null);
  const isGameRunningRef = useRef(false);
  const chickenImageRef = useRef(null);
  
  // Game objects ref - using ref for better performance
  const gameObjectsRef = useRef({
    chicken: null,
    platforms: [],
    eggs: [],
    particles: [],
    camera: { x: 0, y: 0 }
  });

  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  // Game constants - ADJUSTED WITH BOUNDARY CHECKS
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GRAVITY = 0.8;
  const JUMP_POWER = 18; // Reduced from 22 to prevent excessive jumping
  const VOICE_THRESHOLD = 25;
  const VOICE_MULTIPLIER = 3; // Reduced from 4 for better control
  const TOP_BOUNDARY = 50; // Minimum Y position (top boundary)
  const BOTTOM_BOUNDARY = CANVAS_HEIGHT + 100; // Maximum Y position before death

  // Load best score on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chirp-jump-best-score');
      if (stored) setBestScore(parseInt(stored));
    }
  }, []);

  // Load chicken image
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      chickenImageRef.current = image;
    };
    image.src = '/asset/chicken.png';
  }, []);

  // Audio functions - BALANCED SENSITIVITY
  const initAudio = async () => {
    try {
      setMicError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Balanced analyzer settings
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.5;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      source.connect(analyserRef.current);
      setIsListening(true);
      setMicPermission('granted');
      
      return true;
    } catch (error) {
      console.error('Microphone error:', error);
      setMicPermission('denied');
      setMicError('Microphone access denied. You can still play with keyboard controls (Space to jump).');
      return false;
    }
  };

  // BALANCED VOICE LEVEL DETECTION
  const getVoiceLevel = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return 0;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    let sum = 0;
    let max = 0;
    
    // Focus on mid-range frequencies where voice is clear
    const startIndex = Math.floor(dataArrayRef.current.length * 0.2);
    const endIndex = Math.floor(dataArrayRef.current.length * 0.6);
    
    for (let i = startIndex; i < endIndex; i++) {
      const value = dataArrayRef.current[i];
      sum += value;
      max = Math.max(max, value);
    }
    
    const average = sum / (endIndex - startIndex);
    
    // Balanced calculation - more weight on average for stability
    return (average * 0.7) + (max * 0.3);
  }, []);

  // Game functions
  const initGame = useCallback(() => {
    console.log('Initializing game...');
    
    gameObjectsRef.current = {
      chicken: {
        x: 100,
        y: 300,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        animFrame: 0
      },
      platforms: [
        { x: 50, y: 500, width: 150, height: 20, type: 'normal', oscillation: 0, originalY: 500 },
        { x: 250, y: 400, width: 120, height: 20, type: 'normal', oscillation: 0, originalY: 400 },
        { x: 420, y: 350, width: 100, height: 20, type: 'moving', oscillation: 0, originalY: 350 },
        { x: 580, y: 450, width: 130, height: 20, type: 'normal', oscillation: 0, originalY: 450 },
        { x: 750, y: 380, width: 110, height: 20, type: 'normal', oscillation: 0, originalY: 380 },
        { x: 920, y: 320, width: 100, height: 20, type: 'moving', oscillation: 0, originalY: 320 }
      ],
      eggs: [
        { x: 270, y: 360, width: 20, height: 25, rotation: 0 },
        { x: 440, y: 310, width: 20, height: 25, rotation: 0 },
        { x: 600, y: 410, width: 20, height: 25, rotation: 0 }
      ],
      particles: [],
      camera: { x: 0, y: 0 }
    };
    
    setScore(0);
    setEggsCollected(0);
    
    console.log('Game initialized with chicken at:', gameObjectsRef.current.chicken);
    
    // Draw initial frame
    drawGame();
  }, []);

  const updateGame = useCallback(() => {
    if (!isGameRunningRef.current) return;
    
    const objects = gameObjectsRef.current;
    
    if (!objects.chicken) return;
    
    // Update chicken animation frame
    objects.chicken.animFrame++;
    
    // Apply gravity
    if (!objects.chicken.onGround) {
      objects.chicken.velocityY += GRAVITY;
    }

    // Update position
    objects.chicken.x += objects.chicken.velocityX;
    objects.chicken.y += objects.chicken.velocityY;

    // BOUNDARY CHECKS - PREVENT GOING OFF TOP OF SCREEN
    if (objects.chicken.y < TOP_BOUNDARY) {
      objects.chicken.y = TOP_BOUNDARY;
      objects.chicken.velocityY = Math.max(objects.chicken.velocityY, 0); // Stop upward velocity
    }

    // Air resistance
    objects.chicken.velocityX *= 0.95;

    // Check platform collisions
    objects.chicken.onGround = false;
    objects.platforms.forEach(platform => {
      if (objects.chicken.x < platform.x + platform.width &&
          objects.chicken.x + objects.chicken.width > platform.x &&
          objects.chicken.y < platform.y + platform.height &&
          objects.chicken.y + objects.chicken.height > platform.y) {
        
        if (objects.chicken.velocityY > 0 && objects.chicken.y < platform.y) {
          objects.chicken.y = platform.y - objects.chicken.height;
          objects.chicken.velocityY = 0;
          objects.chicken.onGround = true;
        }
      }
    });

    // Check egg collisions
    const eggsBeforeCollection = objects.eggs.length;
    objects.eggs = objects.eggs.filter(egg => {
      if (objects.chicken.x < egg.x + egg.width &&
          objects.chicken.x + objects.chicken.width > egg.x &&
          objects.chicken.y < egg.y + egg.height &&
          objects.chicken.y + objects.chicken.height > egg.y) {
        return false; // Remove this egg
      }
      return true;
    });
    
    // Update score if eggs were collected
    const eggsCollectedNow = eggsBeforeCollection - objects.eggs.length;
    if (eggsCollectedNow > 0) {
      setEggsCollected(prev => prev + eggsCollectedNow);
      setScore(prev => prev + (eggsCollectedNow * 100));
    }

    // Check if fallen below bottom boundary (game over)
    if (objects.chicken.y > BOTTOM_BOUNDARY) {
      isGameRunningRef.current = false;
      setGameState('gameOver');
      return;
    }
    
    // Update camera to follow chicken with boundary consideration
    objects.camera.x = objects.chicken.x - CANVAS_WIDTH / 3;
    objects.camera.y = Math.min(objects.chicken.y - CANVAS_HEIGHT / 2, 0); // Don't go above screen
    
    // Update platforms
    objects.platforms.forEach(platform => {
      if (platform.type === 'moving') {
        platform.oscillation += 0.05;
        platform.y = platform.originalY + Math.sin(platform.oscillation) * 30;
      }
      platform.x -= 2;
    });
    
    // Update eggs
    objects.eggs.forEach(egg => {
      egg.rotation += 0.05;
      egg.x -= 2;
    });
    
    // Remove off-screen objects
    objects.platforms = objects.platforms.filter(p => p.x + p.width > objects.camera.x - 200);
    objects.eggs = objects.eggs.filter(e => e.x + e.width > objects.camera.x - 200);
    
    // Generate new platforms
    const rightmost = objects.platforms.reduce((max, p) => Math.max(max, p.x + p.width), 0);
    
    if (rightmost < objects.chicken.x + CANVAS_WIDTH * 2) {
      const x = rightmost + 120 + Math.random() * 80;
      const y = Math.max(TOP_BOUNDARY + 100, 200 + Math.random() * 250); // Ensure platforms aren't too high
      const width = 80 + Math.random() * 80;
      const isMoving = Math.random() < 0.3;
      
      objects.platforms.push({
        x,
        y,
        width,
        height: 20,
        type: isMoving ? 'moving' : 'normal',
        oscillation: 0,
        originalY: y
      });
      
      if (Math.random() < 0.5) {
        objects.eggs.push({
          x: x + 20,
          y: y - 30,
          width: 20,
          height: 25,
          rotation: 0
        });
      }
    }
    
    // Increase score
    setScore(prev => prev + 1);
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const objects = gameObjectsRef.current;
    
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#F0F8FF');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw top boundary indicator (subtle)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, TOP_BOUNDARY);
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 6; i++) {
      const x = (i * 200 - objects.camera.x * 0.2) % (CANVAS_WIDTH + 100);
      const y = Math.max(TOP_BOUNDARY + 10, 50 + (i % 3) * 40); // Keep clouds below boundary
      
      if (x > -100 && x < CANVAS_WIDTH + 100) {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw platforms
    objects.platforms.forEach(platform => {
      const screenX = platform.x - objects.camera.x;
      const screenY = platform.y - objects.camera.y;
      
      // Platform shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(screenX + 2, screenY + 2, platform.width, platform.height);
      
      // Platform
      ctx.fillStyle = platform.type === 'moving' ? '#FF6B6B' : '#4ECDC4';
      ctx.fillRect(screenX, screenY, platform.width, platform.height);
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(screenX, screenY, platform.width, 4);
    });
    
    // Draw eggs
    objects.eggs.forEach(egg => {
      const screenX = egg.x - objects.camera.x;
      const screenY = egg.y - objects.camera.y;
      
      ctx.save();
      ctx.translate(screenX + egg.width / 2, screenY + egg.height / 2);
      ctx.rotate(egg.rotation);
      
      // Egg shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(-egg.width / 2 + 1, -egg.height / 2 + 1, egg.width, egg.height);
      
      // Egg
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-egg.width / 2, -egg.height / 2, egg.width, egg.height);
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(-egg.width / 2 + 3, -egg.height / 2 + 3, egg.width - 6, 6);
      
      ctx.restore();
    });
    
    // Draw chicken
    if (objects.chicken && chickenImageRef.current) {
      const chicken = objects.chicken;
      const screenX = chicken.x - objects.camera.x;
      const screenY = chicken.y - objects.camera.y;
      
      ctx.save();
      ctx.translate(screenX, screenY);

      const bobOffset = chicken.onGround ? Math.sin(chicken.animFrame * 0.3) * 2 : 0;
      
      // Chicken shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(2, 37, 38, 8);
      
      // Draw chicken image with bob animation
      ctx.drawImage(
        chickenImageRef.current,
        0,
        bobOffset,
        chicken.width,
        chicken.height
      );
      
      ctx.restore();
    }
  }, []);

  // BALANCED GAME LOOP WITH BOUNDARY CHECKS
  const gameLoop = useCallback(() => {
    if (!isGameRunningRef.current) return;
    
    // Voice control with balanced sensitivity
    const currentVoiceLevel = getVoiceLevel();
    setVoiceLevel(currentVoiceLevel);
    
    if (currentVoiceLevel > VOICE_THRESHOLD) {
      const objects = gameObjectsRef.current;
      if (objects.chicken) {
        // Balanced jump power calculation with boundary consideration
        const rawJumpPower = (currentVoiceLevel - VOICE_THRESHOLD) * VOICE_MULTIPLIER;
        const jumpPower = Math.min(rawJumpPower, JUMP_POWER);
        
        // Standard jumping conditions
        if (objects.chicken.onGround || objects.chicken.velocityY > -3) {
          // Check if chicken is not too close to top boundary before allowing jump
          if (objects.chicken.y > TOP_BOUNDARY + 50) {
            objects.chicken.velocityY = -Math.max(jumpPower, 8); // Reduced minimum jump power
            objects.chicken.onGround = false;
            
            // Slight horizontal momentum when jumping
            if (objects.chicken.velocityX < 1) {
              objects.chicken.velocityX += 0.3;
            }
          }
        }
      }
    }
    
    updateGame();
    drawGame();
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, drawGame, getVoiceLevel]);

  const startGame = async () => {
    console.log('Starting game...');
    setStartTime(new Date());
    await initAudio();
    initGame();
    setGameState('playing');
    isGameRunningRef.current = true;
    gameLoop();
  };

  const resetGame = () => {
    console.log('Resetting game...');
    initGame();
    setGameState('playing');
    isGameRunningRef.current = true;
    gameLoop();
  };

  const handleGameOver = useCallback(async () => {
    console.log('Game over triggered');
    isGameRunningRef.current = false;
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    // Update best score
    if (score > bestScore) {
      setBestScore(score);
      if (typeof window !== 'undefined') {
        localStorage.setItem('chirp-jump-best-score', score.toString());
      }
    }
    
    // Save session
    if (startTime) {
      const duration = Math.round((new Date() - startTime) / 1000);
      
      const sessionData = {
        exerciseType: 'game',
        gameType: 'chirp-jump',
        duration,
        score,
        eggsCollected,
        timestamp: new Date().toISOString(),
      };

      try {
        await addSession(sessionData, dataInit.userId, dataInit.guestId);
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }
  }, [score, bestScore, startTime, eggsCollected, addSession, dataInit.userId, dataInit.guestId]);

  // Effects
  useEffect(() => {
    if (gameState === 'gameOver') {
      handleGameOver();
    }
  }, [gameState, handleGameOver]);

  // Keyboard controls with boundary checks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'playing' && isGameRunningRef.current) {
        if (e.code === 'Space') {
          e.preventDefault();
          
          const objects = gameObjectsRef.current;
          if (objects.chicken) {
            if (objects.chicken.onGround || objects.chicken.velocityY > -5) {
              // Check if chicken is not too close to top boundary before allowing jump
              if (objects.chicken.y > TOP_BOUNDARY + 50) {
                objects.chicken.velocityY = -JUMP_POWER;
                objects.chicken.onGround = false;
              }
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Cleanup
  useEffect(() => {
    return () => {
      isGameRunningRef.current = false;
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      <main className="px-4 sm:px-6 py-8">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <Link 
              href="/games"
              className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-lg transition-colors hover:bg-white"
              style={{ color: '#8A6FBF' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Games</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#6E55A0' }}>
                🐔 Chirp Jump 🐔
              </h1>
              <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                Voice-controlled jumping adventure
              </p>
            </div>
          </motion.div>

          {/* Error Alert */}
          {micError && (
            <motion.div 
              variants={itemVariants}
              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Voice Control Unavailable</h3>
                  <p className="text-yellow-700 text-sm">{micError}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#6E55A0' }}>{score}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Score</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#F59E0B' }}>{eggsCollected}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Eggs</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm text-center col-span-2 lg:col-span-1">
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#8A6FBF' }}>{bestScore}</p>
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Best Score</p>
              </div>
            </div>
          </motion.div>

          {/* Game Canvas */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden mb-6 sm:mb-8"
          >
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-auto max-w-full"
                style={{ display: 'block', borderRadius: '1rem' }}
              />
              
              {/* Voice Indicator */}
              <div className={`absolute top-4 right-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 border-white transition-all duration-100 ${
                voiceLevel > VOICE_THRESHOLD ? 'bg-red-400 scale-110' : isListening ? 'bg-green-400' : 'bg-gray-400'
              }`}>
                {isListening ? (
                  <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                )}
              </div>

              {/* Voice Level Debug Display */}
              {isListening && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
                  Voice: {Math.round(voiceLevel)} / {VOICE_THRESHOLD}
                </div>
              )}

              {/* Game State Overlays */}
              {gameState === 'ready' && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white text-center rounded-2xl">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
                      🐔 Chirp Jump 🐔
                    </h2>
                    <div className="space-y-2 mb-6 text-sm sm:text-base">
                      <p>🎤 Use your voice to control the chicken!</p>
                      <p>🔊 Speak moderately loud to make the chicken jump</p>
                      <p>🥚 Collect golden eggs for bonus points!</p>
                      <p className="text-yellow-300">🎮 Backup: Press Space to jump</p>
                      <p className="text-red-300 text-xs">⚠️ Don't jump too high - stay in bounds!</p>
                    </div>
                    
                    <motion.button
                      onClick={startGame}
                      className="px-8 py-3 rounded-xl font-semibold text-white"
                      style={{ background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Chirping!
                    </motion.button>
                  </motion.div>
                </div>
              )}

              {gameState === 'gameOver' && (
                <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white text-center rounded-2xl">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                      <Trophy className="w-8 h-8" style={{ color: '#F59E0B' }} />
                    </div>
                    <h2 className="text-2xl font-bold mb-6">Game Over!</h2>
                    
                    <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'rgba(247, 245, 250, 0.1)' }}>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-yellow-400">{score}</p>
                          <p className="text-sm text-gray-300">Final Score</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-400">{eggsCollected}</p>
                          <p className="text-sm text-gray-300">Eggs Collected</p>
                        </div>
                      </div>
                      
                      {score === bestScore && score > 0 && (
                        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(227, 222, 241, 0.2)' }}>
                          <p className="text-yellow-400 font-semibold">🎉 New Best Score!</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <motion.button
                        onClick={resetGame}
                        className="px-6 py-2 rounded-lg font-semibold"
                        style={{ background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Play Again
                      </motion.button>
                      <Link
                        href="/games"
                        className="inline-block px-6 py-2 rounded-lg font-semibold text-white"
                        style={{ backgroundColor: '#6B7280' }}
                      >
                        Back to Games
                      </Link>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#6E55A0' }}>
                How to Play Chirp Jump
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>Controls:</h4>
                  <ul className="space-y-2 text-sm" style={{ color: '#8A6FBF' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Speak clearly and moderately loud to jump
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Voice level needs to reach 25+ to trigger jump
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Press Space bar as backup control
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Top boundary prevents excessive jumping
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: '#6E55A0' }}>Objectives:</h4>
                  <ul className="space-y-2 text-sm" style={{ color: '#8A6FBF' }}>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Jump across platforms to stay alive
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Collect golden eggs for 100 points each
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Watch out for moving red platforms
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Don't fall into the void below!
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#E3DEF1' }}>
                <p className="text-sm" style={{ color: '#8A6FBF' }}>
                  <strong>🎯 Game Balance:</strong> The chicken now has a top boundary - you can't jump off the top of the screen! 
                  Fall below the screen to end the game. Jump smart, not just high!
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}