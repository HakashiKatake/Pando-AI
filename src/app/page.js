'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../lib/store';
import { useState, useEffect } from 'react';
import { Heart, Brain, Shield, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const { guestId, setOnboarded } = useAppStore();
  const [isStartingAsGuest, setIsStartingAsGuest] = useState(false);

  const handleStartAsGuest = () => {
    setIsStartingAsGuest(true);
    // Navigate to onboarding
    router.push('/questionnaire');
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Support",
      description: "Get personalized guidance from our compassionate AI companion trained in mental wellness practices."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Mood Tracking",
      description: "Track your emotional journey with daily check-ins and visualize your progress over time."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Complete Privacy",
      description: "Your mental health data is private and secure. Use anonymously or create an account."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Crisis Support",
      description: "Immediate access to crisis resources and professional help when you need it most."
    }
  ];

  const benefits = [
    "24/7 AI companion for emotional support",
    "Daily mood tracking and insights",
    "Guided meditation and breathing exercises",
    "Anonymous journaling and reflection",
    "Crisis detection and resource connection",
    "Progress tracking and wellness goals"
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "CalmConnect helped me understand my anxiety patterns and gave me practical tools to manage them.",
      rating: 5
    },
    {
      name: "Alex T.",
      text: "The AI companion feels genuinely caring. It's like having a therapist available anytime I need support.",
      rating: 5
    },
    {
      name: "Jordan K.",
      text: "I love that I can use it anonymously. The mood tracking really helped me see my progress.",
      rating: 5
    }
  ];

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">CalmConnect</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/emergency" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Crisis Support
            </Link>
            <button
              onClick={handleSignIn}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your AI Mental Wellness
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Companion
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get personalized support, track your mood, and practice mindfulness with our compassionate AI companion. 
            Available 24/7, completely private, and designed to support your mental health journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartAsGuest}
              disabled={isStartingAsGuest}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-70"
            >
              {isStartingAsGuest ? (
                <div className="spinner text-white"></div>
              ) : (
                <>
                  <span>Start as Guest</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <button
              onClick={handleSignUp}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Create Account
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            ✨ No credit card required • 🔒 Completely anonymous option • 🆓 Free forever
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CalmConnect?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines AI technology with proven mental health practices to provide you with personalized, accessible support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive tools and support for your mental health journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real Stories from Real People
            </h2>
            <p className="text-lg text-gray-600">
              See how CalmConnect has helped others on their mental wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="text-gray-600 font-medium">
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who have found support, clarity, and peace of mind with CalmConnect.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartAsGuest}
              disabled={isStartingAsGuest}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-70"
            >
              {isStartingAsGuest ? (
                <div className="spinner text-blue-600"></div>
              ) : (
                <>
                  <span>Start Free Today</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <button
              onClick={handleSignUp}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CalmConnect</span>
              </div>
              <p className="text-gray-400">
                Your compassionate AI mental wellness companion, available 24/7.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/emergency" className="hover:text-white transition-colors">Crisis Support</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <p className="text-gray-400 text-sm">
                If you're in crisis, please contact emergency services immediately or call the National Suicide Prevention Lifeline at 988.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CalmConnect. Made with ❤️ for mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
