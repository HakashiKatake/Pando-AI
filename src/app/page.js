"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAppStore } from "../lib/store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  MessageCircle,
  Heart,
  Music,
  BookOpen,
  Gamepad2,
  Brain,
  ArrowRight,
  Menu,
  X,
  Globe,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";

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
        
        // Easing function for smooth animation
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
          <h3 className="text-3xl font-bold mb-2 text-purple-800">
            {count}{suffix}
          </h3>
          <p className="text-gray-600 text-sm">
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
  const animationRef = useRef(null);
  
  useEffect(() => {
    const startAnimation = async () => {
      if (!isPaused) {
        // Start or continue animation
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
        // Stop animation but maintain current position
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
                <h3 className="text-sm font-bold mb-3 text-gray-900 text-center line-clamp-2">
                  &ldquo;{testimonial.quote}&rdquo;
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3 flex-grow text-center line-clamp-3">
                  {testimonial.description}
                </p>
                <p className="font-semibold text-gray-800 text-center text-xs">
                  — {testimonial.author}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {/* Second set of cards for seamless loop */}
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
                <h3 className="text-sm font-bold mb-3 text-gray-900 text-center line-clamp-2">
                  &ldquo;{testimonial.quote}&rdquo;
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3 flex-grow text-center line-clamp-3">
                  {testimonial.description}
                </p>
                <p className="font-semibold text-gray-800 text-center text-xs">
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

// HeroCards component
function HeroCards() {
  const [currentCard, setCurrentCard] = useState(0);

  const cards = [
    {
      title: "AI Chat Support",
      description: "Talk to your AI companion anytime you need support",
      color: "bg-pink-100",
      icon: MessageCircle,
    },
    {
      title: "Mood Tracking",
      description: "Track your emotions and see patterns over time",
      color: "bg-green-100",
      icon: Heart,
    },
    {
      title: "Mindfulness",
      description: "Practice breathing exercises and meditation",
      color: "bg-blue-100",
      icon: Brain,
    },
  ];

  const handleCardClick = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      {cards.map((card, index) => {
        const position = (index - currentCard + cards.length) % cards.length;

        let zIndex = 30 - position * 10;
        let scale = 1 - position * 0.05;
        let y = position * 8;
        let x = position * 4;
        let opacity = 1 - position * 0.2;
        let rotate = position * 2;

        return (
          <motion.div
            key={index}
            className={`absolute cursor-pointer ${card.color} rounded-2xl shadow-xl border-2 border-white`}
            style={{ zIndex }}
            animate={{
              scale,
              x,
              y,
              opacity,
              rotate,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
            onClick={handleCardClick}
            whileHover={{
              scale: position === 0 ? 1.05 : scale,
              y: position === 0 ? y - 5 : y,
              transition: { duration: 0.2 },
            }}
          >
            <div className="w-80 h-48 p-6 flex flex-col justify-center items-center text-center">
              <motion.div
                animate={{
                  scale: position === 0 ? 1 : 0.9,
                }}
                transition={{ duration: 0.5 }}
              >
                <card.icon className="w-12 h-12 mb-4 text-gray-700" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function WellnessLanding() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const { guestId, isOnboarded, initializeGuest } = useAppStore();
  const [isStartingAsGuest, setIsStartingAsGuest] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle authentication and guest redirects
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Check if user is part of an organization
        const hasOrganization =
          user?.organizationMemberships &&
          user.organizationMemberships.length > 0;

        if (hasOrganization) {
          // User is part of an organization - redirect to org dashboard
          router.push("/org/dashboard");
        } else {
          // Regular user - go to chat
          router.push("/chat");
        }
      } else {
        // Initialize guest if not already initialized
        initializeGuest();

        // Check if guest has already completed onboarding
        if (guestId && isOnboarded) {
          // Returning guest user who has completed onboarding - redirect to chat
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
    // Navigate to onboarding
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
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
      title: "Anonymous Chat with WellnessAI",
      description:
        "Let your thoughts out in a safe, judgment-free zone. Chat with our AI companion anonymously — whenever you need someone to listen and support you.",
      color: "bg-purple-100",
    },
    {
      icon: Heart,
      title: "Mood Check-Ins",
      description:
        "Use simple emojis to track your emotions. Over time, see patterns and progress in how you've been feeling — and gently learn more about yourself.",
      color: "bg-pink-100",
    },
    {
      icon: Brain,
      title: "Breathing & Mindfulness Exercises",
      description:
        "Quick guided exercises to help you calm down during stress, anxiety, or overthinking. Just 2 minutes of mindful breathing can bring peace to your day.",
      color: "bg-blue-100",
    },
    {
      icon: Music,
      title: "Mood-Based Music Generator",
      description:
        "Feeling low, tired, or overwhelmed? Instantly generate a Spotify playlist based on your current emotion. Music to lift you up, calm you down, or help you focus.",
      color: "bg-green-100",
    },
    {
      icon: BookOpen,
      title: "Daily Journal & Gratitude Log",
      description:
        "Journaling helps clear your mind. Use text, voice, or image notes to express your day — and build a habit of finding small moments of gratitude.",
      color: "bg-orange-100",
    },
    {
      icon: Gamepad2,
      title: "Calming Games & Challenges",
      description:
        "Light, relaxing games and daily mini-challenges designed to distract your mind, reduce tension, and gently boost your mood in playful ways.",
      color: "bg-red-100",
    },
  ];

  const stats = [
    {
      icon: "😔",
      number: "+300M",
      label: "People experience depression globally each year",
    },
    {
      icon: "🎓",
      number: "1 in 7",
      label: "Students face mental health challenges in school",
    },
    {
      icon: "💡",
      number: "80%",
      label: "Don't receive the support they need",
    },
  ];

  const testimonials = [
    {
      icon: "🧠",
      quote: "Finally, I don't feel weird for feeling things.",
      author: "Anonymous, Age 16",
      description:
        "Sometimes I don't even know what I'm feeling, but this app helped me figure it out — and that made everything feel lighter.",
    },
    {
      icon: "📝",
      quote: "It's like a quiet friend who listens.",
      author: "Anonymous, Age 17",
      description:
        "I didn't want to talk to a real person. I just needed to say it out loud. The chatbot helped me vent without worrying about judgment.",
    },
    {
      icon: "🌈",
      quote: "I didn't think an app could make me feel safe.",
      author: "Anonymous, Age 16",
      description:
        "This is the first time I've used something that cares more about how I feel than what I click. I'm glad I found this.",
    },
    {
      icon: "🎧",
      quote: "The music feature literally saved my night.",
      author: "Anonymous, Age 18",
      description:
        "I was spiraling and didn't want to talk. The app gave me a playlist that matched my mood perfectly. I didn't expect that to help so much.",
    },
    {
      icon: "🧩",
      quote: "Writing in the journal is my new therapy.",
      author: "Anonymous, Age 15",
      description:
        "Every night, I just write what I feel. No filters. It's the only place I can be fully honest, and it actually helps.",
    },
    {
      icon: "💙",
      quote: "I never thought I'd feel understood by an app.",
      author: "Anonymous, Age 17",
      description:
        "The AI actually gets it. It doesn't judge me for my anxiety or tell me to just get over it. It helps me work through things at my own pace.",
    },
    {
      icon: "🌟",
      quote: "This changed how I see my mental health.",
      author: "Anonymous, Age 19",
      description:
        "I used to think asking for help was weak. Now I realize taking care of my mental health is just as important as physical health.",
    },
    {
      icon: "🕊️",
      quote: "Finally found peace in my chaos.",
      author: "Anonymous, Age 16",
      description:
        "My mind was always racing, but the breathing exercises and mindfulness tips actually work. I can finally quiet my thoughts.",
    },
    {
      icon: "🎯",
      quote: "It meets me where I am emotionally.",
      author: "Anonymous, Age 18",
      description:
        "Whether I'm angry, sad, or confused, the app adjusts to how I'm feeling. It's like having a personalized therapist in my pocket.",
    },
    {
      icon: "🤝",
      quote: "I'm not alone in this anymore.",
      author: "Anonymous, Age 17",
      description:
        "Reading other people's experiences made me realize I'm not the only one struggling. It's comforting to know others understand.",
    },
    {
      icon: "🌱",
      quote: "Small steps, big changes.",
      author: "Anonymous, Age 16",
      description:
        "The app doesn't overwhelm me with huge changes. It suggests tiny daily habits that actually stick and make a difference.",
    },
    {
      icon: "💭",
      quote: "My thoughts don't scare me anymore.",
      author: "Anonymous, Age 18",
      description:
        "I used to be afraid of my own mind. Now I have tools to understand and manage my thoughts instead of being controlled by them.",
    },
    {
      icon: "🎨",
      quote: "It's creative therapy for my soul.",
      author: "Anonymous, Age 15",
      description:
        "The creative exercises and prompts help me express feelings I couldn't put into words. It's like art therapy but more accessible.",
    },
    {
      icon: "⚡",
      quote: "Quick relief when I need it most.",
      author: "Anonymous, Age 19",
      description:
        "During panic attacks, the instant calming techniques actually work. I can go from overwhelmed to centered in just a few minutes.",
    },
    {
      icon: "🔮",
      quote: "It knows what I need before I do.",
      author: "Anonymous, Age 17",
      description:
        "The app somehow suggests exactly what I need - whether it's a pep talk, a breathing exercise, or just a moment to reflect.",
    },
    {
      icon: "🌙",
      quote: "Better sleep, better days.",
      author: "Anonymous, Age 16",
      description:
        "The bedtime routines and sleep tips have improved my sleep so much. I wake up feeling more rested and ready to face the day.",
    },
    {
      icon: "🎪",
      quote: "Makes self-care feel less like work.",
      author: "Anonymous, Age 18",
      description:
        "The gamification and rewards make taking care of my mental health feel fun instead of like another chore on my list.",
    },
    {
      icon: "🎭",
      quote: "I can be my authentic self here.",
      author: "Anonymous, Age 17",
      description:
        "No masks, no pretending. This is the one place where I can be completely honest about how I'm feeling without fear of judgment.",
    },
    {
      icon: "🌊",
      quote: "Riding the waves instead of drowning.",
      author: "Anonymous, Age 19",
      description:
        "My emotions used to feel like tsunamis. Now I have surfboards - tools to ride through the tough times instead of being swept away.",
    },
    {
      icon: "🎈",
      quote: "Lighter days are actually possible.",
      author: "Anonymous, Age 16",
      description:
        "I didn't think I could feel genuinely happy again. The app helped me rediscover joy in small moments and believe in brighter days.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5FA" }}>
      {/* Header */}
      <header
        className="fixed w-full top-0 z-50 backdrop-blur-sm border-b"
        style={{ backgroundColor: "rgba(247, 245, 250, 0.8)" }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="CalmConnect Logo"
              width={32}
              height={32}
            />
            <span className="text-xl font-semibold">PandoAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
            <Link href="#why" className="text-gray-600 hover:text-gray-900">
              Why It Matters
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 hover:text-gray-900"
            >
              Testimonials
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" onClick={handleSignIn}>
              Sign In
            </Button>
            <Button onClick={handleSignUp}>Sign Up</Button>
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div
            className="md:hidden absolute w-full border-b"
            style={{ backgroundColor: "#F7F5FA" }}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900"
              >
                Features
              </Link>
              <Link href="#why" className="text-gray-600 hover:text-gray-900">
                Why It Matters
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900"
              >
                Testimonials
              </Link>
              <hr />
              <Button
                variant="outline"
                onClick={handleSignIn}
                className="w-full"
              >
                Sign In
              </Button>
              <Button onClick={handleSignUp} className="w-full">
                Sign Up
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-20 xl:px-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div className="max-w-2xl mx-auto lg:mx-0 text-left lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              >
                Your AI Mental Wellness Companion
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8"
              >
                Get personalized support, track your mood, and practice
                mindfulness with our compassionate AI companion. Available 24/7,
                completely private, and designed to support your mental health
                journey.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Button
                  size="lg"
                  onClick={handleStartAsGuest}
                  className="text-lg bg-purple-600 hover:bg-purple-700"
                >
                  Start as Guest →
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSignUp}
                  className="text-lg"
                >
                  Create Account
                </Button>
              </motion.div>
            </div>

            {/* Right side - Interactive Cards */}
            <div className="relative flex justify-center lg:justify-end">
              <HeroCards />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      {/* Features Section */}
      <section
        id="features"
        className="py-20"
        style={{ backgroundColor: "#F7F5FA" }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Features</h2>
          <p className="text-lg font-bold text-gray-600 text-center mb-12">
            Your emotional toolkit — always here, always private.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.2 },
                }}
                className="cursor-pointer"
              >
                <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl h-75 w-80">
                  <CardContent className="p-5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="mb-4 flex justify-center"
                    >
                      {/* Placeholder for icon - will be replaced with images later */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-gray-400" />
                      </div>
                    </motion.div>
                    <h3 className="text-base font-bold mb-3 text-gray-900 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed text-center">
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
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div className="max-w-2xl mx-auto lg:mx-0 text-left lg:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              >
                Go Deeper with PandoAI
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8"
              >
                Your compassionate AI companion Pando offers personalized check-ins, thoughtful prompts, and real-time support to help you reflect, grow, and navigate your mental wellness journey with confidence.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Available 24/7</h3>
                    <p className="text-gray-600">
                      Access support whenever you need it, from anywhere
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Safe Space</h3>
                    <p className="text-gray-600">
                      Share without judgment in a private, confidential environment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Growth Focus</h3>
                    <p className="text-gray-600">
                      Learn techniques to build resilience and emotional strength
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side - App Mockup Placeholder */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="w-80 h-96 bg-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  App Mockup<br />
                  Coming Soon
                </p>
              </div>
            </div>
          </div>
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
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-opacity-10 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 text-purple-800">
              Why It Matters?
            </h2>
            
            {/* Main description */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 mb-16 max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed text-center italic">
                Mental health struggles are more common than we think — especially among students.
                Depression, anxiety, and loneliness affect millions every year, but many stay silent, afraid, or unsupported.
                That's why we built WellnessAI — to give students a safe, anonymous space to express, reflect, and heal —
                anytime, anywhere.
              </p>
            </div>

            {/* Statistics Cards */}
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

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20"
        style={{ backgroundColor: "#F7F5FA" }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
      
          {/* First Row - Moving Right to Left */}
          <TestimonialsCarousel testimonials={testimonials} direction="left" />
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      {/* Footer */}
      <footer className="bg-gray-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 mb-12 ml-21">
            {/* Left side - Navigation Links */}
            <div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    🏠 Home
                  </Link>
                  <Link href="#features" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    💬 Features
                  </Link>
                  <Link href="#why" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    💡 Why It Matters
                  </Link>
                </div>
                <div className="space-y-4">
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    🚀 Start Chat
                  </Link>
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    📝 Journal
                  </Link>
                  <Link href="#" className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors">
                    📧 Contact Us
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side - Branding */}
            <div className="text-right mb-0 m-10 mt-0">
              <h3 className="text-2xl font-bold pr-51 pb-7">PandoAI</h3>
              <p className="text-gray-100 mb-4 pr-30">Your space to breathe, feel, and heal.</p>
              <p className="text-gray-200">An anonymous mental wellness companion built just for students.</p>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-gray-500 pt-8">
            <div className="ml-10 mr-10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-gray-200 text-sm">© 2025 PandoAI. All rights reserved.</p>
                <p className="text-gray-200 text-sm">Made with 💙 for students, by people who care.</p>
              </div>
              <div className="flex gap-6">
                <Link href="#" className="text-gray-200 hover:text-white transition-colors text-sm">
                  🛡️ Privacy Policy
                </Link>
                <Link href="#" className="text-gray-200 hover:text-white transition-colors text-sm">
                  ⚖️ Terms of Use
                </Link>
                <Link href="#" className="text-gray-200 hover:text-white transition-colors text-sm">
                  🏥 Emergency Resources
                </Link>
                <Link href="#" className="text-gray-200 hover:text-white transition-colors text-sm">
                  ❓ FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
