"use client";

import { useState, useEffect, useRef } from "react"
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
import FeaturesSection from "@/components/FeatureSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import WaveDivider from "@/components/WaveDivider";
import WhyItMattersSection from "@/components/WhyItMattersSection";

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


      <FeaturesSection/>

   



      

      

     <WaveDivider color="#F7F5FA"/>
      <section className="py-10 pt-0" style={{ backgroundColor: '#F7F5FA'}}>
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
      <WaveDivider flip="true" color="#F7F5FA"/>

      <WaveDivider/>
      <WhyItMattersSection/>
      <WaveDivider flip="true" />

      {/* Testimonials Section */}
      <TestimonialsSection />

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