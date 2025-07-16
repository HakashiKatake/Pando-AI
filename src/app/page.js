"use client"

import { useState, useEffect } from "react"
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useAppStore } from '../lib/store'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { MessageCircle, Heart, Music, BookOpen, Gamepad2, Brain, ArrowRight, Menu, X } from "lucide-react"
import Link from "next/link"
import { motion } from 'framer-motion'

export default function WellnessLanding() {
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()
  const { guestId, isOnboarded, setOnboarded, initializeGuest } = useAppStore()
  const [isStartingAsGuest, setIsStartingAsGuest] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle authentication and guest redirects
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Check if user is part of an organization
        const hasOrganization = user?.organizationMemberships && user.organizationMemberships.length > 0;
        
        if (hasOrganization) {
          // User is part of an organization - redirect to org dashboard
          router.push('/org/dashboard');
        } else {
          // Regular user - go to chat
          router.push('/chat');
        }
      } else {
        // Initialize guest if not already initialized
        initializeGuest()
        
        // Check if guest has already completed onboarding
        if (guestId && isOnboarded) {
          // Returning guest user who has completed onboarding - redirect to chat
          router.push('/chat')
        }
      }
    }
  }, [isLoaded, isSignedIn, guestId, isOnboarded, initializeGuest, router, user])

  const handleStartAsGuest = () => {
    setIsStartingAsGuest(true)
    // Navigate to onboarding
    router.push('/questionnaire')
  }

  const handleSignIn = () => {
    router.push('/auth/signin-select')
  }

  const handleSignUp = () => {
    router.push('/auth/signup-select')
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  // If signed in, will redirect via useEffect
  if (isSignedIn) {
    return null
  }

  const features = [
    {
      icon: MessageCircle,
      title: "Anonymous Chat with WellnessAI",
      description:
        "Let your thoughts flow in a safe, judgment-free zone. Chat with our AI companion anytime, anywhere you need someone to talk to and support you.",
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: Heart,
      title: "Mood Check-ins",
      description:
        "Use simple emojis to track your emotions. Over time, see patterns and progress in how you're been feeling — and gently learn more about yourself.",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: Brain,
      title: "Breathing & Mindfulness Exercises",
      description:
        "Quick guided sessions to help you calm down during stress, anxiety, or overwhelming. Just 2 minutes of mindful breathing can bring peace to your day.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Music,
      title: "Mood-Based Music Generator",
      description:
        "Feeling low, tired, or overwhelmed? Instantly generate a Spotify playlist based on your current emotion. Music is lift your spirits and help you feel your best.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: BookOpen,
      title: "Daily Journal & Gratitude Log",
      description:
        "Journaling helps clear your mind. Use text, voice, or image notes to express your day — and build a foundation of self-awareness and gratitude.",
      color: "from-orange-500 to-amber-600",
    },
    {
      icon: Gamepad2,
      title: "Calming Games & Challenges",
      description:
        "Light, relaxing games and daily mini-challenges designed to distract your mind, reduce tension, and gently boost your mood in playful ways.",
      color: "from-violet-500 to-purple-600",
    },
  ]

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
  ]

  const testimonials = [
    {
      quote: "Finally, I don't feel weird for feeling things.",
      author: "Anonymous, Age 19",
      description: "Did you know that over 1 in 5 young adults has experienced major depression in the past year?",
      color: "from-purple-400 to-pink-400",
    },
    {
      quote: "It's like a quiet friend who listens.",
      author: "Anonymous, Age 17",
      description:
        "I didn't want to talk to my parents. I just needed to say it out loud. The chatbot helped me work without worrying about judgment.",
      color: "from-blue-400 to-indigo-400",
    },
    {
      quote: "I didn't think an app could make me feel safe.",
      author: "Anonymous, Age 16",
      description:
        "This is the first time I've used something like this where I feel like I can be myself without fear that I feel like that much in a good friend too.",
      color: "from-green-400 to-teal-400",
    },
    {
      quote: "The music feature literally saved my night.",
      author: "Anonymous, Age 18",
      description:
        "I was spiraling and didn't want to talk. The app gave me a playlist that matched exactly how I was feeling and helped me to feel so much.",
      color: "from-yellow-400 to-orange-400",
    },
    {
      quote: "Writing in the journal is my new therapy.",
      author: "Anonymous, Age 20",
      description:
        "Every night, I can write about how my day is, the app gives me prompts that help me think about my place I can be fully honest and it always helps.",
      color: "from-rose-400 to-pink-400",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CalmConnect</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors">
                Testimonials
              </Link>
              <Link
                href="/emergency"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Crisis Support
              </Link>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-purple-600"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-purple-100 animate-in slide-in-from-top duration-200">
            <div className="px-4 py-4 space-y-4">
              <Link href="#features" className="block text-gray-700 hover:text-purple-600">
                Features
              </Link>
              <Link href="#testimonials" className="block text-gray-700 hover:text-purple-600">
                Testimonials
              </Link>
              <Link
                href="/emergency"
                className="block text-gray-600 hover:text-gray-900 transition-colors"
              >
                Crisis Support
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-700"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in slide-in-from-left duration-1000">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your AI Mental Wellness{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Companion
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg">
                  Get personalized support, track your mood, and practice mindfulness with our compassionate AI
                  companion. Available 24/7, completely private, and designed to support your mental health journey.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "tween", duration: 0.05, ease: "easeInOut" }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white group disabled:opacity-70"
                    onClick={handleStartAsGuest}
                    disabled={isStartingAsGuest}
                  >
                    {isStartingAsGuest ? (
                      <div className="spinner text-white"></div>
                    ) : (
                      <>
                        <span>Start as Guest</span>
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                  onClick={handleSignUp}
                >
                  Create Account
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                ✨ No credit card required • 🔒 Completely anonymous option • 🆓 Free forever
              </p>
            </div>

            <div className="relative animate-in slide-in-from-right duration-1000 delay-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">WellnessAI</h3>
                      <p className="text-sm text-gray-500">Always here for you</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-700">
                      How are you feeling today? I'm here to listen and support you through whatever you're
                      experiencing. 💜
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-purple-100 rounded-full px-4 py-2 text-sm text-purple-700">😊 Good</div>
                    <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-600">😐 Okay</div>
                    <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-600">😔 Not great</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your emotional toolkit — always here, always private.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Card
                  className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg animate-in fade-in duration-1000"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-indigo-50 to-pink-50"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-400 rounded-full animate-bounce"></div>
          <div
            className="absolute bottom-10 right-10 w-16 h-16 bg-indigo-400 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-12 h-12 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why It Matters?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Mental health struggles are more common than you think — especially among students. Depression, anxiety,
              and loneliness affect millions every year, but many stay silent, afraid, or unsupported. That's why we
              built WellnessAI — to give students a safe, anonymous space to express, reflect, and heal — anytime,
              anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-in fade-in duration-1000"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-purple-700 mb-2">{stat.number}</div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Testimonials</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Card
                  className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg animate-in fade-in duration-1000"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-full h-2 rounded-full bg-gradient-to-r ${testimonial.color}`}></div>
                    <blockquote className="text-gray-900 font-medium italic">"{testimonial.quote}"</blockquote>
                    <p className="text-gray-600 text-sm">{testimonial.description}</p>
                    <p className="text-purple-700 font-medium text-sm">— {testimonial.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="space-y-8 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Go Deeper with WellnessAI</h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Your compassionate AI companion offers personalized check-ins, thoughtful prompts, and real-time support
              to help you reflect, grow, and navigate your mental wellness journey with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-700 hover:bg-gray-100 group disabled:opacity-70"
                onClick={handleStartAsGuest}
                disabled={isStartingAsGuest}
              >
                {isStartingAsGuest ? (
                  <div className="spinner text-purple-700"></div>
                ) : (
                  <>
                    <span>Start Your Journey</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-700 bg-transparent"
                onClick={handleSignUp}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">CalmConnect</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your space to feel, heal, and heal.
                <br />
                An anonymous mental wellness companion built just for students.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-purple-400">Product</h3>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">
                  🏠 Home
                </Link>
                <Link href="#features" className="block text-gray-400 hover:text-white transition-colors">
                  ✨ Features
                </Link>
                <Link href="#testimonials" className="block text-gray-400 hover:text-white transition-colors">
                  💜 Why It Matters
                </Link>
                <Link href="/chat" className="block text-gray-400 hover:text-white transition-colors">
                  💬 Start Chat
                </Link>
                <Link href="/journal" className="block text-gray-400 hover:text-white transition-colors">
                  📝 Journal
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  📞 Contact Us
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-purple-400">Legal</h3>
              <div className="space-y-2 text-sm">
                <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  🔒 Privacy Policy
                </Link>
                <Link href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  📋 Terms of Use
                </Link>
                <Link href="/emergency" className="block text-gray-400 hover:text-white transition-colors">
                  🚨 Emergency Resources
                </Link>
                <Link href="/help" className="block text-gray-400 hover:text-white transition-colors">
                  ❓ FAQs
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-purple-400">Connect</h3>
              <p className="text-gray-400 text-sm">
                Made with 💜 for students, by people who care.
              </p>
              <p className="text-gray-400 text-sm">
                If you're in crisis, please contact emergency services
                immediately or call the National Suicide Prevention Lifeline at
                988.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 CalmConnect. Made with ❤️ for mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}