"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAppStore } from "../lib/store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {MessageCircle, Heart, Music, BookOpen, Gamepad2, Brain, ArrowRight, Menu, X, Globe, Shield, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import CardSwap, { Card as SwapCard } from "@/components/CardSwap/CardSwap";

// Custom hook for counting animation
function useCountUp(end, duration = 2, start = 0) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      let startTime = null;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * (end - start) + start);
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isVisible, end, duration, start]);

  return { count, countRef };
}

// Animated Stat Card Component
function AnimatedStatCard({ icon, number, label, suffix = "", delay = 0 }) {
  const { count, countRef } = useCountUp(number, 2);
  
  return (
    <motion.div
      ref={countRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <Card className="border-0 shadow-lg bg-white bg-opacity-90 backdrop-blur-sm text-center">
        <CardContent className="p-8">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-3xl font-bold mb-2" style={{ color: '#6E55A0' }}>
            {count}{suffix}
          </h3>
          <p className="text-sm" style={{ color: '#8A6FBF' }}>
            {label}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Testimonials Carousel Component
function TestimonialsCarousel({ testimonials, direction = "left" }) {
  const controls = useAnimation();
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    const startAnimation = async () => {
      if (!isPaused) {
        controls.start({
          x: direction === "left" 
            ? `-${100 * testimonials.length}%`
            : '0%',
          transition: {
            duration: testimonials.length * 51,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }
        });
      } else {
        controls.stop();
      }
    };
    
    startAnimation();
  }, [isPaused, controls, direction, testimonials.length]);
  
  return (
    <div className="relative overflow-hidden mb-8">
      <motion.div
        className="flex gap-4"
        animate={controls}
        initial={{
          x: direction === "left" ? '0%' : `-${100 * testimonials.length}%`
        }}
        style={{
          width: `${testimonials.length * 50}%`
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={`${direction}-first-${index}`}
            className="min-w-0 flex-shrink-0"
            style={{ width: `${100 / (testimonials.length * 2)}%` }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="h-64 border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 mx-2">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="text-2xl mb-3 flex justify-center">
                  {testimonial.icon}
                </div>
                <h3 className="text-sm font-bold mb-3 text-center line-clamp-2" style={{ color: '#6E55A0' }}>
                  &ldquo;{testimonial.quote}&rdquo;
                </h3>
                <p className="text-xs leading-relaxed mb-3 flex-grow text-center line-clamp-3" style={{ color: '#8A6FBF' }}>
                  {testimonial.description}
                </p>
                <p className="font-semibold text-center text-xs" style={{ color: '#6E55A0' }}>
                  — {testimonial.author}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={`${direction}-second-${index}`}
            className="min-w-0 flex-shrink-0"
            style={{ width: `${100 / (testimonials.length * 2)}%` }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="h-64 border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 mx-2">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="text-2xl mb-3 flex justify-center">
                  {testimonial.icon}
                </div>
                <h3 className="text-sm font-bold mb-3 text-center line-clamp-2" style={{ color: '#6E55A0' }}>
                  &ldquo;{testimonial.quote}&rdquo;
                </h3>
                <p className="text-xs leading-relaxed mb-3 flex-grow text-center line-clamp-3" style={{ color: '#8A6FBF' }}>
                  {testimonial.description}
                </p>
                <p className="font-semibold text-center text-xs" style={{ color: '#6E55A0' }}>
                  — {testimonial.author}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// HeroCards component using CardSwap - BETTER VISIBILITY
function HeroCards() {
  const cards = [
    {
      title: "AI Chat Support",
      description: "Talk to your AI companion anytime you need support",
      icon: MessageCircle,
      closeSymbol: "×",
      image: "/mockup/dashboard.png",
    },
    {
      title: "Mood Tracking",
      description: "Track your emotions and see patterns over time",
      icon: Heart,
      closeSymbol: "⊗",
      image: "/mockup/music.png",
    },
    {
      title: "Mindfulness",
      description: "Practice breathing exercises and meditation",
      icon: Brain,
      closeSymbol: "⊙",
      image: "/mockup/games.png",
    },
  ];

  return (
    <div className="relative h-[510px] w-full flex items-center justify-center top-30 left-10">
      {/* More spacious container with clipping boundary */}
      <div className="relative w-full h-full max-w-lg">
        {/* Clipping boundary box with background */}
        <div 
          className="absolute inset-0 overflow-hidden rounded-2xl shadow-lg border border-white/20"
          style={{ 
            background: 'linear-gradient(135deg, rgba(227, 222, 241, 0.3) 0%, rgba(138, 111, 191, 0.1) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardSwap
            width={450}
            height={280}
            cardDistance={60}
            verticalDistance={50}
            delay={4000}
            pauseOnHover={true}
            skewAmount={6}
            easing="power2.out"
          >
            {cards.map((card, index) => (
              <SwapCard
                key={index}
                className="rounded-2xl shadow-xl border-2 border-white overflow-hidden"
                style={{ backgroundColor: '#E3DEF1' }}
              >
                <div className="w-full h-full relative overflow-hidden">
                  {/* App Mockup Image - Full Coverage */}
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  
                  {/* macOS-style window controls */}
                  <motion.div 
                    className="absolute top-3 left-3 flex gap-2 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {/* Close button - Red */}
                    <motion.div
                      className="w-3 h-3 rounded-full cursor-pointer shadow-sm"
                      style={{ backgroundColor: '#FF5F57' }}
                      whileHover={{ 
                        scale: 1.15,
                        backgroundColor: '#FF3B30',
                        boxShadow: '0 2px 8px rgba(255, 59, 48, 0.4)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 15
                      }}
                    />
                    
                    {/* Minimize button - Yellow */}
                    <motion.div
                      className="w-3 h-3 rounded-full cursor-pointer shadow-sm"
                      style={{ backgroundColor: '#FFBD2E' }}
                      whileHover={{ 
                        scale: 1.15,
                        backgroundColor: '#FF9500',
                        boxShadow: '0 2px 8px rgba(255, 149, 0, 0.4)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 15
                      }}
                    />
                    
                    {/* Maximize button - Green */}
                    <motion.div
                      className="w-3 h-3 rounded-full cursor-pointer shadow-sm"
                      style={{ backgroundColor: '#28CA42' }}
                      whileHover={{ 
                        scale: 1.15,
                        backgroundColor: '#30D158',
                        boxShadow: '0 2px 8px rgba(48, 209, 88, 0.4)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 15
                      }}
                    />
                  </motion.div>
                </div>
              </SwapCard>
            ))}
          </CardSwap>
        </div>
      </div>
    </div>
  );
}

export default function WellnessLanding() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const { guestId, isOnboarded, initializeGuest, setOnboarded } = useAppStore();
  const [isStartingAsGuest, setIsStartingAsGuest] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle authentication and guest redirects
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        const hasOrganization =user?.organizationMemberships && user.organizationMemberships.length > 0;

        if (hasOrganization) {
          router.push("/org/dashboard");
        } else {
          router.push("/chat");
        }
      } else {
        initializeGuest();
        if (guestId && isOnboarded) {
          router.push("/chat");
        }
      }
    }
  }, [
    isLoaded,
    isSignedIn,
    guestId,
    isOnboarded,
    initializeGuest,
    router,
    user,
  ]);

  const handleStartAsGuest = () => {
    setIsStartingAsGuest(true);
    router.push("/questionnaire");
  };

  const handleSignIn = () => {
    router.push("/auth/signin-select");
  };

  const handleSignUp = () => {
    router.push("/auth/signup-select");
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#8A6FBF' }}></div>
      </div>
    );
  }

  // If signed in, will redirect via useEffect
  if (isSignedIn) {
    return null;
  }

  const features = [
    {
      icon: MessageCircle,
      title: "Anonymous Chat with PandoAI",
      description:
        "Let your thoughts out in a safe, judgment-free zone. Chat with our AI companion anonymously — whenever you need someone to listen and support you.",
      color: "bg-purple-100",
    },
    {
      icon: Heart,
      title: "Mood Check-Ins",
      description: "Use simple emojis to track your emotions. Over time, see patterns and progress in how you've been feeling — and gently learn more about yourself.",
    },
    {
      icon: Brain,
      title: "Breathing & Mindfulness Exercises",
      description: "Quick guided exercises to help you calm down during stress, anxiety, or overthinking. Just 2 minutes of mindful breathing can bring peace to your day.",
    },
    {
      icon: Music,
      title: "Mood-Based Music Generator",
      description: "Feeling low, tired, or overwhelmed? Instantly generate a Spotify playlist based on your current emotion. Music to lift you up, calm you down, or help you focus.",
    },
    {
      icon: BookOpen,
      title: "Daily Journal & Gratitude Log",
      description: "Journaling helps clear your mind. Use text, voice, or image notes to express your day — and build a habit of finding small moments of gratitude.",
    },
    {
      icon: Gamepad2,
      title: "Calming Games & Challenges",
      description: "Light, relaxing games and daily mini-challenges designed to distract your mind, reduce tension, and gently boost your mood in playful ways.",
    },
  ];

  const testimonials = [
    {
      icon: "🧠",
      quote: "Finally, I don't feel weird for feeling things.",
      author: "Anonymous, Age 16",
      description: "Sometimes I don't even know what I'm feeling, but this app helped me figure it out — and that made everything feel lighter.",
    },
    {
      icon: "📝",
      quote: "It's like a quiet friend who listens.",
      author: "Anonymous, Age 17",
      description: "I didn't want to talk to a real person. I just needed to say it out loud. The chatbot helped me vent without worrying about judgment.",
    },
    {
      icon: "🌈",
      quote: "I didn't think an app could make me feel safe.",
      author: "Anonymous, Age 16",
      description: "This is the first time I've used something that cares more about how I feel than what I click. I'm glad I found this.",
    },
    {
      icon: "🎧",
      quote: "The music feature literally saved my night.",
      author: "Anonymous, Age 18",
      description: "I was spiraling and didn't want to talk. The app gave me a playlist that matched my mood perfectly. I didn't expect that to help so much.",
    },
    {
      icon: "🧩",
      quote: "Writing in the journal is my new therapy.",
      author: "Anonymous, Age 15",
      description: "Every night, I just write what I feel. No filters. It's the only place I can be fully honest, and it actually helps.",
    },
    {
      icon: "💙",
      quote: "I never thought I'd feel understood by an app.",
      author: "Anonymous, Age 17",
      description: "The AI actually gets it. It doesn't judge me for my anxiety or tell me to just get over it. It helps me work through things at my own pace.",
    },
    {
      icon: "🌟",
      quote: "This changed how I see my mental health.",
      author: "Anonymous, Age 19",
      description: "I used to think asking for help was weak. Now I realize taking care of my mental health is just as important as physical health.",
    },
    {
      icon: "🕊️",
      quote: "Finally found peace in my chaos.",
      author: "Anonymous, Age 16",
      description: "My mind was always racing, but the breathing exercises and mindfulness tips actually work. I can finally quiet my thoughts.",
    },
    {
      icon: "🎯",
      quote: "It meets me where I am emotionally.",
      author: "Anonymous, Age 18",
      description: "Whether I'm angry, sad, or confused, the app adjusts to how I'm feeling. It's like having a personalized therapist in my pocket.",
    },
    {
      icon: "🤝",
      quote: "I'm not alone in this anymore.",
      author: "Anonymous, Age 17",
      description: "Reading other people's experiences made me realize I'm not the only one struggling. It's comforting to know others understand.",
    },
    {
      icon: "🌱",
      quote: "Small steps, big changes.",
      author: "Anonymous, Age 16",
      description: "The app doesn't overwhelm me with huge changes. It suggests tiny daily habits that actually stick and make a difference.",
    },
    {
      icon: "💭",
      quote: "My thoughts don't scare me anymore.",
      author: "Anonymous, Age 18",
      description: "I used to be afraid of my own mind. Now I have tools to understand and manage my thoughts instead of being controlled by them.",
    },
    {
      icon: "🎨",
      quote: "It's creative therapy for my soul.",
      author: "Anonymous, Age 15",
      description: "The creative exercises and prompts help me express feelings I couldn't put into words. It's like art therapy but more accessible.",
    },
    {
      icon: "⚡",
      quote: "Quick relief when I need it most.",
      author: "Anonymous, Age 19",
      description: "During panic attacks, the instant calming techniques actually work. I can go from overwhelmed to centered in just a few minutes.",
    },
    {
      icon: "🔮",
      quote: "It knows what I need before I do.",
      author: "Anonymous, Age 17",
      description: "The app somehow suggests exactly what I need - whether it's a pep talk, a breathing exercise, or just a moment to reflect.",
    },
    {
      icon: "🌙",
      quote: "Better sleep, better days.",
      author: "Anonymous, Age 16",
      description: "The bedtime routines and sleep tips have improved my sleep so much. I wake up feeling more rested and ready to face the day.",
    },
    {
      icon: "🎪",
      quote: "Makes self-care feel less like work.",
      author: "Anonymous, Age 18",
      description: "The gamification and rewards make taking care of my mental health feel fun instead of like another chore on my list.",
    },
    {
      icon: "🎭",
      quote: "I can be my authentic self here.",
      author: "Anonymous, Age 17",
      description: "No masks, no pretending. This is the one place where I can be completely honest about how I'm feeling without fear of judgment.",
    },
    {
      icon: "🌊",
      quote: "Riding the waves instead of drowning.",
      author: "Anonymous, Age 19",
      description: "My emotions used to feel like tsunamis. Now I have surfboards - tools to ride through the tough times instead of being swept away.",
    },
    {
      icon: "🎈",
      quote: "Lighter days are actually possible.",
      author: "Anonymous, Age 16",
      description: "I didn't think I could feel genuinely happy again. The app helped me rediscover joy in small moments and believe in brighter days.",
    },
  ];

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
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Header */}
      <motion.header
        className="fixed w-full top-0 z-50 backdrop-blur-sm border-b"
        style={{ backgroundColor: "rgba(247, 245, 250, 0.8)" }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/logo.svg"
              alt="PandoAI Logo"
              width={32}
              height={32}
            />
            <span className="text-xl font-semibold" style={{ color: '#6E55A0' }}>PandoAI</span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="transition-colors duration-200"
              style={{ color: '#8A6FBF' }}
            >
              Features
            </Link>
            <Link 
              href="#why" 
              className="transition-colors duration-200"
              style={{ color: '#8A6FBF' }}
            >
              Why It Matters
            </Link>
            <Link
              href="#testimonials"
              className="transition-colors duration-200"
              style={{ color: '#8A6FBF' }}
            >
              Testimonials
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                onClick={handleSignIn}
                className="border-2 transition-all duration-200"
                style={{ 
                  borderColor: '#8A6FBF',
                  color: '#8A6FBF'
                }}
              >
                Sign In
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSignUp}
                className="transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                }}
              >
                Sign Up
              </Button>
            </motion.div>
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: '#8A6FBF' }}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute w-full border-b"
            style={{ backgroundColor: "#F7F5FA" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                href="#features"
                className="transition-colors duration-200"
                style={{ color: '#8A6FBF' }}
              >
                Features
              </Link>
              <Link 
                href="#why" 
                className="transition-colors duration-200"
                style={{ color: '#8A6FBF' }}
              >
                Why It Matters
              </Link>
              <Link
                href="#testimonials"
                className="transition-colors duration-200"
                style={{ color: '#8A6FBF' }}
              >
                Testimonials
              </Link>
              <hr style={{ borderColor: '#E3DEF1' }} />
              <Button
                variant="outline"
                onClick={handleSignIn}
                className="w-full border-2"
                style={{ 
                  borderColor: '#8A6FBF',
                  color: '#8A6FBF'
                }}
              >
                Sign In
              </Button>
              <Button 
                onClick={handleSignUp} 
                className="w-full"
                style={{ 
                  background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                }}
              >
                Sign Up
              </Button>
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section - IMPROVED VISIBILITY */}
      <section className="pt-32 pb-50 relative">
        <div className="container mx-auto px-4 lg:px-20 xl:px-32">
          <motion.div 
            className="grid lg:grid-cols-2 gap-16 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left side - Content */}
            <div className="max-w-2xl mx-auto lg:mx-0 text-left lg:text-left">
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-6xl font-bold mb-6"
                style={{ color: '#6E55A0' }}
              >
                Your AI Mental Wellness Companion
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl mb-8"
                style={{ color: '#8A6FBF' }}
              >
                Get personalized support, track your mood, and practice
                mindfulness with our compassionate AI companion. Available 24/7,
                completely private, and designed to support your mental health
                journey.
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={handleStartAsGuest}
                    className="text-lg transition-all duration-200"
                    style={{ 
                      background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                    }}
                  >
                    Start as Guest →
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleSignUp}
                    className="text-lg border-2 transition-all duration-200"
                    style={{ 
                      borderColor: '#8A6FBF',
                      color: '#8A6FBF'
                    }}
                  >
                    Create Account
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Right side - Interactive Cards - BETTER POSITIONED */}
            <motion.div 
              className="relative flex justify-center lg:justify-end min-h-[500px] bottom-25"
              variants={itemVariants}
            >
              <HeroCards />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      {/* Features Section */}
      <section
        id="features"
        className="py-20"
        style={{ backgroundColor: '#F7F5FA' }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-4" style={{ color: '#6E55A0' }}>Features</h2>
            <p className="text-lg font-bold text-center mb-12" style={{ color: '#8A6FBF' }}>
              Your emotional toolkit — always here, always private.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.2 },
                }}
                className="cursor-pointer"
              >
                <Card className="bg-white border shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl h-75 w-80"
                      style={{ borderColor: '#E3DEF1' }}>
                  <CardContent className="p-5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="mb-4 flex justify-center"
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                           style={{ backgroundColor: '#E3DEF1' }}>
                        <feature.icon className="w-6 h-6" style={{ color: '#6E55A0' }} />
                      </div>
                    </motion.div>
                    <h3 className="text-base font-bold mb-3 text-center" style={{ color: '#6E55A0' }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-center" style={{ color: '#8A6FBF' }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      {/* Go Deeper Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-20 xl:px-32">
          <motion.div 
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Left side - Content */}
            <div className="max-w-2xl mx-auto lg:mx-0 text-left lg:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-5xl md:text-6xl font-bold mb-6"
                style={{ color: '#6E55A0' }}
              >
                Go Deeper with PandoAI
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-xl mb-8"
                style={{ color: '#8A6FBF' }}
              >
                Your compassionate AI companion Pando offers personalized check-ins, thoughtful prompts, and real-time support to help you reflect, grow, and navigate your mental wellness journey with confidence.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <motion.div 
                  className="flex items-start gap-4"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: '#E3DEF1' }}>
                    <Globe className="w-8 h-8" style={{ color: '#6E55A0' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#6E55A0' }}>Available 24/7</h3>
                    <p style={{ color: '#8A6FBF' }}>
                      Access support whenever you need it, from anywhere
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-4"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: '#E3DEF1' }}>
                    <MessageCircle className="w-8 h-8" style={{ color: '#6E55A0' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#6E55A0' }}>Safe Space</h3>
                    <p style={{ color: '#8A6FBF' }}>
                      Share without judgment in a private, confidential environment
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-4"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: '#E3DEF1' }}>
                    <Brain className="w-8 h-8" style={{ color: '#6E55A0' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#6E55A0' }}>Growth Focus</h3>
                    <p style={{ color: '#8A6FBF' }}>
                      Learn techniques to build resilience and emotional strength
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div 
              className="relative flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="w-100 h-140 rounded-2xl shadow-xl overflow-hidden">
                <Image
                  src="/demo.png"
                  alt="PandoAI App Interface"
                  width={320}
                  height={640}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      {/* Why It Matters Section */}
      <section
        id="why"
        className="py-32 relative min-h-screen"
        style={{ 
          backgroundColor: "#F7F5FA",
          backgroundImage: "url('/matters.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-opacity-10 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-center mb-16"
              style={{ color: '#6E55A0' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Why It Matters?
            </motion.h2>
            
            <motion.div 
              className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 mb-16 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-lg leading-relaxed text-center italic" style={{ color: '#6E55A0' }}>
                Mental health struggles are more common than we think — especially among students.
                Depression, anxiety, and loneliness affect millions every year, but many stay silent, afraid, or unsupported.
                That's why we built PandoAI — to give students a safe, anonymous space to express, reflect, and heal —
                anytime, anywhere.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <AnimatedStatCard
                icon="😔"
                number={300}
                suffix="M+"
                label="People experience depression globally each year"
                delay={0}
              />
              
              <AnimatedStatCard
                icon="🎓"
                number={1}
                suffix=" in 7"
                label="Students face mental health challenges in school"
                delay={0.2}
              />
              
              <AnimatedStatCard
                icon="💙"
                number={80}
                suffix="%"
                label="Don't receive the support they need"
                delay={0.4}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      <section
        id="testimonials"
        className="py-20"
        style={{ backgroundColor: "#F7F5FA" }}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-12"
            style={{ color: '#6E55A0' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            What Our Users Say
          </motion.h2>
          
          <TestimonialsCarousel testimonials={testimonials} direction="left" />
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      {/* Enhanced Footer */}
      <footer style={{ background: 'linear-gradient(135deg, #6E55A0 0%, #8A6FBF 100%)' }} className="text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-4 gap-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Brand Section */}
            <div className="md:col-span-2">
              <motion.div 
                className="flex items-center gap-3 mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/logo.svg"
                  alt="PandoAI Logo"
                  width={40}
                  height={40}
                />
                <h3 className="text-2xl font-bold">PandoAI</h3>
              </motion.div>
              <p className="text-gray-100 mb-4 max-w-md">
                Your space to breathe, feel, and heal. An anonymous mental wellness companion built just for students.
              </p>
              <div className="flex gap-4">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  transition={{ duration: 0.2 }}
                >
                  <Globe className="w-5 h-5" />
                </motion.div>
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.div>
                <motion.div 
                  className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart className="w-5 h-5" />
                </motion.div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-3">
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    <span>🏠</span> Home
                  </Link>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#features" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    <span>💬</span> Features
                  </Link>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#why" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    <span>💡</span> Why It Matters
                  </Link>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    <span>🚀</span> Start Chat
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <div className="space-y-3">
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    <span>📝</span> Journal
                  </Link>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    <span>📧</span> Contact Us
                  </Link>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    <span>❓</span> FAQs
                  </Link>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    <span>🏥</span> Emergency Resources
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Bottom section */}
          <motion.div 
            className="border-t border-white border-opacity-20 pt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-gray-200 text-sm">© 2025 PandoAI. All rights reserved.</p>
                <p className="text-gray-200 text-sm">Made with 💙 for students, by people who care.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="text-gray-200 hover:text-white transition-colors text-sm flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Privacy Policy
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Link href="#" className="text-gray-200 hover:text-white transition-colors text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" /> Terms of Use
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}