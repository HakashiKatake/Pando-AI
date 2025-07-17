'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  // Game objects
  const gameObjectsRef = useRef({
    chicken: null,
    platforms: [],
    eggs: [],
    particles: [],
    camera: { x: 0, y: 0 }
  });

  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GRAVITY = 0.8;
  const JUMP_POWER = 20;
  const VOICE_THRESHOLD = 30;

  // Load best score on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chirp-jump-best-score');
      if (stored) setBestScore(parseInt(stored));
    }
  }, []);

  // Game Classes
  const createChicken = (x, y) => ({
    x,
    y,
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    animFrame: 0,

    update() {
      this.animFrame++;
      
      // Apply gravity
      if (!this.onGround) {
        this.velocityY += GRAVITY;
      }

      // Update position
      this.x += this.velocityX;
      this.y += this.velocityY;

      // Air resistance
      this.velocityX *= 0.95;

      // Check platform collisions
      this.onGround = false;
      gameObjectsRef.current.platforms.forEach(platform => {
        if (this.x < platform.x + platform.width &&
            this.x + this.width > platform.x &&
            this.y < platform.y + platform.height &&
            this.y + this.height > platform.y) {
          
          if (this.velocityY > 0 && this.y < platform.y) {
            this.y = platform.y - this.height;
            this.velocityY = 0;
            this.onGround = true;
          }
        }
      });

      // Check egg collisions
      gameObjectsRef.current.eggs = gameObjectsRef.current.eggs.filter(egg => {
        if (this.x < egg.x + egg.width &&
            this.x + this.width > egg.x &&
            this.y < egg.y + egg.height &&
            this.y + this.height > egg.y) {
          
          setEggsCollected(prev => prev + 1);
          setScore(prev => prev + 100);
          return false;
        }
        return true;
      });

      // Check if fallen
      if (this.y > CANVAS_HEIGHT + 100) {
        setGameState('gameOver');
      }
    },

    jump(power) {
      if (this.onGround || this.velocityY > -5) {
        this.velocityY = -Math.min(power, JUMP_POWER);
        this.onGround = false;
      }
    },

    draw(ctx) {
      const camera = gameObjectsRef.current.camera;
      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      
      ctx.save();
      ctx.translate(screenX, screenY);

      // Body
      ctx.fillStyle = '#FFDD44';
      ctx.fillRect(5, 15, 30, 20);
      
      // Head
      ctx.fillRect(0, 5, 25, 20);
      
      // Beak
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(25, 12, 8, 6);
      
      // Eye
      ctx.fillStyle = '#000';
      ctx.fillRect(18, 8, 4, 4);
      ctx.fillStyle = '#FFF';
      ctx.fillRect(19, 9, 2, 2);
      
      // Comb
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(8, 0, 4, 8);
      ctx.fillRect(12, 2, 4, 6);
      
      // Wings
      ctx.fillStyle = '#FFCC33';
      ctx.fillRect(10, 12, 15, 8);
      
      // Legs (only when on ground)
      if (this.onGround) {
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(8, 35, 3, 8);
        ctx.fillRect(20, 35, 3, 8);
      }
      
      ctx.restore();
    }
  });

  const createPlatform = (x, y, width, type = 'normal') => ({
    x,
    y,
    width,
    height: 20,
    type,
    oscillation: 0,
    originalY: y,

    update() {
      if (this.type === 'moving') {
        this.oscillation += 0.05;
        this.y = this.originalY + Math.sin(this.oscillation) * 30;
      }
      this.x -= 2;
    },

    draw(ctx) {
      const camera = gameObjectsRef.current.camera;
      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      
      // Platform
      ctx.fillStyle = this.type === 'moving' ? '#FF6B6B' : '#4ECDC4';
      ctx.fillRect(screenX, screenY, this.width, this.height);
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(screenX, screenY, this.width, 4);
    }
  });

  const createEgg = (x, y) => ({
    x,
    y,
    width: 20,
    height: 25,
    rotation: 0,

    update() {
      this.rotation += 0.05;
      this.x -= 2;
    },

    draw(ctx) {
      const camera = gameObjectsRef.current.camera;
      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      
      ctx.save();
      ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
      ctx.rotate(this.rotation);
      
      // Egg
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(-this.width / 2 + 3, -this.height / 2 + 3, this.width - 6, 6);
      
      ctx.restore();
    }
  });

  // Audio functions
  const initAudio = async () => {
    try {
      setMicError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
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

  const getVoiceLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return 0;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    
    return sum / dataArrayRef.current.length;
  };

  // Game functions
  const initGame = () => {
    const objects = gameObjectsRef.current;
    
    // Create chicken
    objects.chicken = createChicken(100, 300);
    
    // Create platforms
    objects.platforms = [
      createPlatform(50, 500, 150),
      createPlatform(250, 400, 120),
      createPlatform(420, 350, 100, 'moving'),
      createPlatform(580, 450, 130),
      createPlatform(750, 380, 110),
      createPlatform(920, 320, 100, 'moving')
    ];
    
    // Create eggs
    objects.eggs = [
      createEgg(270, 360),
      createEgg(440, 310),
      createEgg(600, 410)
    ];
    
    // Reset camera
    objects.camera = { x: 0, y: 0 };
    
    // Reset scores
    setScore(0);
    setEggsCollected(0);
  };

  const updateGame = () => {
    if (gameState !== 'playing') return;
    
    const objects = gameObjectsRef.current;
    if (!objects.chicken) return;
    
    // Voice control
    const currentVoiceLevel = getVoiceLevel();
    setVoiceLevel(currentVoiceLevel);
    
    if (currentVoiceLevel > VOICE_THRESHOLD) {
      const jumpPower = Math.min((currentVoiceLevel - VOICE_THRESHOLD) / 5, JUMP_POWER);
      objects.chicken.jump(jumpPower);
    }
    
    // Update chicken
    objects.chicken.update();
    
    // Update camera to follow chicken
    objects.camera.x = objects.chicken.x - CANVAS_WIDTH / 3;
    objects.camera.y = objects.chicken.y - CANVAS_HEIGHT / 2;
    
    // Update platforms
    objects.platforms.forEach(platform => platform.update());
    
    // Update eggs
    objects.eggs.forEach(egg => egg.update());
    
    // Remove off-screen objects
    objects.platforms = objects.platforms.filter(p => p.x + p.width > objects.camera.x - 200);
    objects.eggs = objects.eggs.filter(e => e.x + e.width > objects.camera.x - 200);
    
    // Generate new platforms
    const rightmost = objects.platforms.reduce((max, p) => Math.max(max, p.x + p.width), 0);
    
    while (rightmost < objects.chicken.x + CANVAS_WIDTH * 2) {
      const x = rightmost + 120 + Math.random() * 80;
      const y = 200 + Math.random() * 250;
      const width = 80 + Math.random() * 80;
      const isMoving = Math.random() < 0.3;
      
      objects.platforms.push(createPlatform(x, y, width, isMoving ? 'moving' : 'normal'));
      
      if (Math.random() < 0.5) {
        objects.eggs.push(createEgg(x + 20, y - 30));
      }
    }
    
    // Increase score
    setScore(prev => prev + 1);
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const objects = gameObjectsRef.current;
    
    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#F0F8FF');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 6; i++) {
      const x = (i * 200 - objects.camera.x * 0.2) % (CANVAS_WIDTH + 100);
      const y = 50 + (i % 3) * 40;
      
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw game objects
    objects.platforms.forEach(platform => platform.draw(ctx));
    objects.eggs.forEach(egg => egg.draw(ctx));
    
    if (objects.chicken) {
      objects.chicken.draw(ctx);
    }
  };

  const gameLoop = () => {
    updateGame();
    drawGame();
    
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const startGame = async () => {
    setStartTime(new Date());
    await initAudio();
    initGame();
    setGameState('playing');
    gameLoop();
  };

  const resetGame = () => {
    initGame();
    setGameState('playing');
    gameLoop();
  };

  const handleGameOver = async () => {
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
  };

  // Effects
  useEffect(() => {
    if (gameState === 'gameOver') {
      handleGameOver();
    }
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'playing' && gameObjectsRef.current.chicken) {
        if (e.code === 'Space') {
          e.preventDefault();
          gameObjectsRef.current.chicken.jump(JUMP_POWER);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Cleanup
  useEffect(() => {
    return () => {
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
                      <p>🔊 Speak loudly to make the chicken jump</p>
                      <p>🥚 Collect golden eggs for bonus points!</p>
                      <p className="text-yellow-300">🎮 Backup: Press Space to jump</p>
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
                      Speak loudly to make the chicken jump
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      The louder you speak, the higher the jump
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Press Space bar as backup control
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#8A6FBF' }}></span>
                      Microphone icon shows voice activity
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
                      Survive as long as possible for high score
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#E3DEF1' }}>
                <p className="text-sm" style={{ color: '#8A6FBF' }}>
                  <strong>💡 Pro Tip:</strong> Try different sounds like "hey!", "woo!", or whistling to control your chicken. 
                  The game responds to voice volume, so louder sounds create bigger jumps!
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}