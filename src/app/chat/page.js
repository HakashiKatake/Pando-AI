
'use client';
import Header from '@/components/Header';

import { useState, useEffect, useRef } from 'react';
import MoodModal from './MoodModal';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, useChatStore } from '../../lib/store';
import { useDataInitialization } from '../../lib/useDataInitialization';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { 
  Send, Shield, ShieldOff, Bot, User, 
  AlertTriangle, Heart, RefreshCw, MoreVertical,
  Calendar, Clock, ChevronDown, Play, Pause, Volume2, Mic, MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
export default function ChatPage() {
  const { user } = useUser();
  const { guestId, preferences } = useAppStore();
  const { messages, addMessage, setLoading, isLoading, startNewConversation } = useChatStore();
  const dataInit = useDataInitialization();
  const { todaysMood, addMood } = require('../../lib/store').useMoodStore();
  const [input, setInput] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input bar on any key press (unless modal is open or input is already focused)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only focus if not already focused and not inside a modal
      if (
        document.activeElement !== inputRef.current &&
        !document.querySelector('.framer-modal, .modal, [role="dialog"]') &&
        !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey &&
        e.key.length === 1 // Only for character keys
      ) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!todaysMood && dataInit.isReady && (dataInit.userId || dataInit.guestId)) {
      setShowMoodModal(true);
    }
  }, [todaysMood, dataInit.isReady, dataInit.userId, dataInit.guestId]);

  // Speech Recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Update input when speech recognition transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const startListening = () => {
    resetTranscript();
    setInput('');
    SpeechRecognition.startListening({ 
      continuous: true,
      language: 'en-US'
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (!conversationId) {
      const newConversationId = `conv_${Date.now()}`;
      setConversationId(newConversationId);
      startNewConversation();
    }
  }, [conversationId, startNewConversation]);

  // Auto-greeting effect
  useEffect(() => {
    if (dataInit.isReady && (dataInit.userId || dataInit.guestId) && conversationId && !hasAutoGreeted && messages.length === 0 && !showMoodModal) {
      setHasAutoGreeted(true);
      sendAutoGreeting();
    }
  }, [dataInit.isReady, dataInit.userId, dataInit.guestId, conversationId, hasAutoGreeted, messages.length, showMoodModal]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendAutoGreeting = async () => {
    // Create a personalized greeting based on user preferences
    const userName = preferences?.name || 'friend';
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
    
    let greetingMessage = `Good ${timeOfDay}, ${userName}! 🐼 How are you feeling today?`;
    
   
    if (preferences?.communicationStyle === 'casual') {
      greetingMessage = `Hey ${userName}! How's it going today?`;
    } else if (preferences?.communicationStyle === 'professional') {
      greetingMessage = `Hello ${userName}, I hope you're having a good ${timeOfDay}. How can I support you today?`;
    } else if (preferences?.communicationStyle === 'empathetic') {
      greetingMessage = `Hi ${userName}, I'm here for you today. How are you feeling right now?`;
    }

    try {
      setLoading(true);
      
      if (dataInit.userId) {
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: greetingMessage,
            guestId: dataInit.guestId,
            conversationId,
            privacy: false,
            isAutoGreeting: true,
          }),
        });

        const data = await response.json();
        if (data.success && data.data.assistantMessage) {
          addMessage({
            role: 'assistant',
            message: data.data.assistantMessage.message,
            messageType: data.data.assistantMessage.messageType,
            triggerAnalysis: data.data.triggerAnalysis,
          }, dataInit.userId, dataInit.guestId);
        }
      } else {
        // For guests - simulate getting a greeting response
        const greetingResponses = [
          `Hi there! I'm Pando 🐼, your wellness companion. I'm here to listen and support you. What's on your mind today?`,
          `Hello! Nice to meet you. I'm Pando, here if you want to chat about anything - how you're feeling, what's going on, or just need someone to listen. How are you doing?`,
          `Hey! I'm Pando, and I'm glad you're here. Whether you want to talk about your day, your feelings, or anything else, I'm here for you. What would you like to chat about?`
        ];
        
        const randomGreeting = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
        
        addMessage({
          role: 'assistant',
          message: randomGreeting,
          messageType: 'greeting',
        }, dataInit.userId, dataInit.guestId);
      }
    } catch (error) {
      console.error('Auto-greeting error:', error);
      // Fallback greeting
      addMessage({
        role: 'assistant',
        message: "Hi! I'm Pando 🐼, your wellness companion. I'm here to listen and support you. How are you feeling today?",
        messageType: 'greeting',
      }, dataInit.userId, dataInit.guestId);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Check for anxiety/related keywords and suggest features
    const anxietyKeywords = [
      'anxious', 'anxiety', 'panic', 'nervous', 'worried', 'stressed', 'overwhelmed', 'tense', 'fear', 'scared', 'afraid', 'restless'
    ];
    const lowerMsg = userMessage.toLowerCase();
    const shouldSuggest = anxietyKeywords.some(word => lowerMsg.includes(word));

    try {
      if (dataInit.userId) {
        // For authenticated users, call addMessage which handles the API call
        await addMessage({
          role: 'user',
          message: userMessage,
          privacy: privacyMode,
        }, dataInit.userId, dataInit.guestId);
      } else {
        // For guests, manually handle the flow
        // First add user message locally
        addMessage({
          role: 'user',
          message: userMessage,
          privacy: privacyMode,
        }, dataInit.userId, dataInit.guestId);

        // Then call API and add assistant response
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            guestId: dataInit.guestId,
            conversationId,
            privacy: privacyMode,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Add assistant message to store for guests
          addMessage({
            role: 'assistant',
            message: data.data.assistantMessage.message,
            messageType: data.data.assistantMessage.messageType,
            triggerAnalysis: data.data.triggerAnalysis,
          }, dataInit.userId, dataInit.guestId);
        } else {
          throw new Error(data.error || 'Failed to send message');
        }
      }

      // Suggest features if anxiety detected
      if (shouldSuggest) {
        addMessage({
          role: 'assistant',
          message:
            "I'm here for you. If you're feeling anxious or stressed, that's completely okay. Would you like to try something to help you feel calmer? You can try a breathing exercise, listen to some music, or play a relaxing game. Let me know if you'd like more support!",
          messageType: 'calm_suggestions',
        }, dataInit.userId, dataInit.guestId);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or if you're in crisis, please contact emergency services or call 988.",
        messageType: 'error',
      }, dataInit.userId, dataInit.guestId);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const newConversationId = `conv_${Date.now()}`;
    setConversationId(newConversationId);
    startNewConversation();
  };

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

  const messageVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Mood Check-in Modal */}
      {showMoodModal && (
        <MoodModal
          onClose={() => setShowMoodModal(false)}
          onSave={(moodData) => {
            addMood(moodData, dataInit.userId, dataInit.guestId);
            setShowMoodModal(false);
          }}
        />
      )}
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{
            background: 'linear-gradient(45deg, #8A6FBF, #E3DEF1)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-10"
          style={{
            background: 'linear-gradient(45deg, #6E55A0, #8A6FBF)'
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, #E3DEF1, #F7F5FA)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content Area - Mobile responsive */}
      <main className="pt-16 sm:pt-20 px-3 sm:px-6 pb-3 sm:pb-12">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Chat Header Section - Mobile optimized */}
          <motion.div 
            variants={messageVariants}
            className="mb-4 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Chat Title and Pando Info - Mobile responsive */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(45deg, #8A6FBF, #6E55A0)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <img 
                    src="/asset/panda-heart.png" 
                    alt="Pando - Your wellness companion"
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)'
                    }}
                    animate={{
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                    Pando - AI Companion
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg" style={{ color: '#8A6FBF' }}>
                    Here to support your journey
                  </p>
                </div>
              </div>

              {/* Chat Controls - Mobile responsive */}
              <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3">
                <motion.button
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    privacyMode 
                      ? 'text-white' 
                      : 'bg-white hover:text-white'
                  }`}
                  style={
                    privacyMode
                      ? { backgroundColor: '#8A6FBF' }
                      : { 
                          color: '#6E55A0',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!privacyMode) {
                      e.target.style.backgroundColor = '#E3DEF1'
                      e.target.style.color = '#6E55A0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!privacyMode) {
                      e.target.style.backgroundColor = 'white'
                      e.target.style.color = '#6E55A0'
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={privacyMode ? 'Privacy mode ON - messages are private' : 'Privacy mode OFF'}
                >
                  {privacyMode ? <Shield className="w-3 h-3 sm:w-4 sm:h-4" /> : <ShieldOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span className="hidden sm:inline">{privacyMode ? 'Private' : 'Standard'}</span>
                </motion.button>

                <motion.button
                  onClick={clearChat}
                  className="p-1 sm:p-2 rounded-full hover:bg-white transition-colors"
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  title="Start new conversation"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6E55A0' }} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Chat Container - Mobile responsive */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            {/* Messages Area - Mobile responsive */}
            <div 
              className="overflow-y-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6" 
              style={{ height: 'calc(100% - 100px)' }}
            >
              {messages.length === 0 && (
                <WelcomeMessage userName={preferences.name} />
              )}

              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                  >
                    <MessageBubble 
                      message={message} 
                      isUser={message?.role === 'user'}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-2 sm:space-x-3"
                >
                  <motion.div 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(45deg, #8A6FBF, #6E55A0)'
                    }}
                  >
                    <img 
                      src="/asset/panda-heart.png" 
                      alt="Pando"
                      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)'
                      }}
                      animate={{
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-sm border max-w-48 sm:max-w-md">
                    <div className="flex space-x-1">
                      <motion.div 
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                        style={{ backgroundColor: '#8A6FBF' }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                        style={{ backgroundColor: '#8A6FBF' }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                        style={{ backgroundColor: '#8A6FBF' }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Mobile responsive */}
            <motion.div 
              className="border-t px-3 sm:px-6 py-3 sm:py-4"
              style={{ backgroundColor: '#F7F5FA' }}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-end space-x-2 sm:space-x-3">
                <div className="flex-1 relative">
                  <motion.textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Hi ${preferences.name || 'friend'}! Pando is here to listen 🐼`}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl sm:rounded-2xl focus:outline-none resize-none transition-all duration-200 bg-white text-sm sm:text-base"
                    style={{
                      borderColor: listening ? '#8A6FBF' : '#E3DEF1',
                      color: '#6E55A0',
                      minHeight: '40px',
                      maxHeight: '100px'
                    }}
                    rows={1}
                    disabled={isLoading}
                    whileFocus={{
                      scale: 1.01,
                      transition: { duration: 0.2 }
                    }}
                  />
                  
                  {/* Voice Input Button */}
                  {browserSupportsSpeechRecognition && (
                    <motion.button
                      onClick={listening ? stopListening : startListening}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                        listening 
                          ? 'text-white' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      style={{
                        backgroundColor: listening ? '#8A6FBF' : 'transparent'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={listening ? 'Stop voice input' : 'Start voice input'}
                      disabled={isLoading}
                    >
                      {listening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </motion.button>
                  )}
                </div>
                
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-2 sm:p-3 text-white rounded-xl sm:rounded-2xl flex-shrink-0 relative overflow-hidden"
                  style={{
                    background: input.trim() && !isLoading 
                      ? 'linear-gradient(45deg, #8A6FBF, #6E55A0)' 
                      : '#E3DEF1'
                  }}
                  whileHover={{ 
                    scale: input.trim() && !isLoading ? 1.05 : 1,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  {input.trim() && !isLoading && (
                    <motion.div
                      className="absolute inset-0 rounded-xl sm:rounded-2xl"
                      style={{
                        background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)'
                      }}
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </motion.button>
              </div>
              
              <div className="flex items-center justify-between mt-1 sm:mt-2 text-xs" style={{ color: '#8A6FBF' }}>
                <span>
                  {privacyMode && (
                    <span className="flex items-center space-x-1">
                      <Shield className="w-2 h-2 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">Private mode - your messages are encrypted</span>
                      <span className="sm:hidden">Private</span>
                    </span>
                  )}
                  {listening && (
                    <span className="flex items-center space-x-1 text-purple-600">
                      <Mic className="w-2 h-2 sm:w-3 sm:h-3 animate-pulse" />
                      <span>Listening...</span>
                    </span>
                  )}
                </span>
                <span className="hidden sm:inline">
                  {browserSupportsSpeechRecognition 
                    ? "Press Enter to send, click mic for voice input" 
                    : "Press Enter to send, Shift+Enter for new line"
                  }
                </span>
                <span className="sm:hidden">
                  {browserSupportsSpeechRecognition ? "Enter to send, mic for voice" : "Enter to send"}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function WelcomeMessage({ userName }) {
  const suggestions = [
    "I'm feeling anxious about work",
    "Can you help me with breathing exercises?",
    "I'm having trouble sleeping",
    "I feel overwhelmed lately",
    "What are some coping strategies for stress?",
    "I need someone to talk to"
  ];

  return (
    <motion.div 
      className="text-center py-4 sm:py-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(45deg, #8A6FBF, #6E55A0)'
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        <img 
          src="/asset/panda-heart.png" 
          alt="Pando"
          className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)'
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
      
      <motion.h2 
        className="text-xl sm:text-2xl font-bold mb-2"
        style={{ color: '#6E55A0' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Hello{userName ? `, ${userName}` : ''}! 👋
      </motion.h2>
      
      <motion.p 
        className="mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4"
        style={{ color: '#8A6FBF' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        I'm Pando 🐼, your AI wellness companion. I'm here to provide support, listen to your concerns, 
        and help you with mental health resources. How can I support you today?
      </motion.p>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => {
              const input = document.querySelector('textarea');
              if (input) {
                input.value = suggestion;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.focus();
              }
            }}
            className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl text-left transition-all border-2 touch-manipulation"
            style={{ 
              borderColor: '#E3DEF1',
              color: '#6E55A0'
            }}
            whileHover={{ 
              scale: 1.02,
              borderColor: '#8A6FBF',
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
          >
            <span className="text-xs sm:text-sm">{suggestion}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

function MessageBubble({ message, isUser }) {
  const isCrisis = message.messageType === 'crisis_support';
  const isConcern = message.triggerAnalysis?.level === 'medium';
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechRef = useRef(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    const isSupported = typeof window !== 'undefined' && 
                       'speechSynthesis' in window && 
                       'SpeechSynthesisUtterance' in window;
    
    setSpeechSupported(isSupported);
    
    if (isSupported) {
      console.log('Speech synthesis is supported');
      
      // Try to load voices immediately
      const voices = window.speechSynthesis.getVoices();
      console.log('Initial voices loaded:', voices.length);
      
      // Listen for voices to be loaded (Chrome requires this)
      const handleVoicesChanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        console.log('Voices updated:', updatedVoices.length);
      };
      
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Cleanup function
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        if (speechRef.current) {
          window.speechSynthesis.cancel();
        }
      };
    } else {
      console.log('Speech synthesis not supported');
    }
  }, []);

  const handleTextToSpeech = () => {
    if (!speechSupported) {
      alert('Text-to-speech is not supported in this browser');
      return;
    }

    if (isPlaying) {
      // Stop current speech - simple like breathing page
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      speechRef.current = null;
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    // Clean the message text
    const textToSpeak = message.message
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/• /g, '') // Remove bullet points
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/[😊😔😢😄😃😀😁😆😅😂🤣😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾🐼]/g, '') // Remove emojis including panda
      .replace(/[^\w\s.,!?'-]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Clean up spaces
      .trim();

    if (!textToSpeak || textToSpeak.length < 3) {
      console.log('Text too short after cleaning');
      return;
    }

    // Create utterance - exactly like breathing page approach
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.7;
    
    // Simple event handlers
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      speechRef.current = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      speechRef.current = null;
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div 
      className={`flex items-start space-x-2 sm:space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden`}
        style={{
          background: isUser 
            ? 'linear-gradient(45deg, #6B7280, #4B5563)' 
            : 'linear-gradient(45deg, #8A6FBF, #6E55A0)'
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {isUser ? (
          <User className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
        ) : (
          <img 
            src="/asset/panda-heart.png" 
            alt="Pando"
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
          />
        )}
        {!isUser && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)'
            }}
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </motion.div>

      <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isUser ? 'ml-auto' : ''}`}>
        <motion.div 
          className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border-2 relative overflow-hidden ${
            isUser 
              ? 'text-white rounded-tr-sm' 
              : isCrisis
                ? 'bg-red-50 border-red-200 rounded-tl-sm'
                : isConcern
                  ? 'bg-yellow-50 border-yellow-200 rounded-tl-sm'
                  : 'bg-gray-50 rounded-tl-sm'
          }`}
          style={
            isUser 
              ? { 
                  background: 'linear-gradient(135deg, #8A6FBF, #6E55A0)',
                  borderColor: '#8A6FBF'
                }
              : { borderColor: '#E3DEF1' }
          }
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {isUser && (
            <motion.div
              className="absolute inset-0 rounded-xl sm:rounded-2xl"
              style={{
                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)'
              }}
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}

          {isCrisis && (
            <motion.div 
              className="flex items-center space-x-2 mb-2 sm:mb-3 text-red-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Crisis Support Resources</span>
            </motion.div>
          )}

          <div className={`prose prose-sm max-w-none relative z-10 ${
            isUser ? 'prose-invert' : isCrisis ? 'prose-red' : ''
          }`} style={!isUser ? { color: '#6E55A0' } : {}}>
            {message.message.split('\n').map((line, index) => (
              <p key={index} className="mb-1 sm:mb-2 last:mb-0 text-xs sm:text-sm">
                {line.startsWith('**') && line.endsWith('**') ? (
                  <strong>{line.slice(2, -2)}</strong>
                ) : line.startsWith('• ') ? (
                  <span className="block ml-3 sm:ml-4">• {line.slice(2)}</span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>

          {/* Bubble buttons for calm_suggestions */}
          {message.messageType === 'calm_suggestions' && !isUser && (
            <div className="flex flex-row gap-2 mt-4 justify-center">
              <button
                className="px-4 py-2 rounded-full bg-[#E3DEF1] text-[#6E55A0] font-semibold shadow hover:bg-[#8A6FBF] hover:text-white transition"
                onClick={() => window.location.href = 'exercises/breathing'}
              >
                Breathing Exercises
              </button>
              <button
                className="px-4 py-2 rounded-full bg-[#E3DEF1] text-[#6E55A0] font-semibold shadow hover:bg-[#8A6FBF] hover:text-white transition"
                onClick={() => window.location.href = '/mood'}
              >
                Mood Music
              </button>
              <button
                className="px-4 py-2 rounded-full bg-[#E3DEF1] text-[#6E55A0] font-semibold shadow hover:bg-[#8A6FBF] hover:text-white transition"
                onClick={() => window.location.href = '/games'}
              >
                Relaxing Games
              </button>
            </div>
          )}
        </motion.div>

        <div className={`mt-1 text-xs flex items-center ${isUser ? 'justify-end' : 'justify-between'}`} style={{ color: '#8A6FBF' }}>
          <div className="flex items-center gap-1 sm:gap-2">
            <span>{new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {message.privacy && (
              <Shield className="w-2 h-2 sm:w-3 sm:h-3" />
            )}
          </div>

          {/* Text-to-Speech button for bot messages */}
          {!isUser && (
            <motion.button
              onClick={handleTextToSpeech}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 flex-shrink-0 ${
                speechSupported 
                  ? 'hover:bg-gray-200 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ 
                color: isPlaying ? '#6E55A0' : '#8A6FBF',
                backgroundColor: isPlaying ? '#E3DEF1' : 'transparent',
                minWidth: '44px',
                minHeight: '32px'
              }}
              whileHover={{ scale: speechSupported ? 1.05 : 1 }}
              whileTap={{ scale: speechSupported ? 0.95 : 1 }}
              title={
                !speechSupported 
                  ? "Text-to-speech not supported in this browser" 
                  : isPlaying 
                    ? "Stop speech" 
                    : "Listen to message"
              }
              disabled={!speechSupported}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              <Volume2 className="w-3 h-3" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}