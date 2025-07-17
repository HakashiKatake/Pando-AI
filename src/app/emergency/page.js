'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Globe, Clock, ArrowLeft, Heart, AlertTriangle, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';

export default function EmergencyPage() {
  const [selectedCountry, setSelectedCountry] = useState('IN');


  const emergencyResources = {
    IN: {
      hotlines: [
        {
          name: "National Mental Health Helpline",
          phone: "1800-599-0019",
          description: "24/7 mental health support in multiple Indian languages",
          available: "24/7",
          website: "https://mentalhealthhelpline.in"
        },
        {
          name: "Vandrevala Foundation Helpline",
          phone: "1860-2662-345 or 1800-2333-330",
          description: "Free counseling and crisis intervention support",
          available: "24/7",
          website: "https://vandrevalafoundation.com"
        },
        {
          name: "iCall Psychosocial Helpline",
          phone: "9152987821",
          description: "Professional counseling support via phone and email",
          available: "Mon-Sat 8am-10pm",
          website: "https://icallhelpline.org"
        },
        {
          name: "Sneha India Foundation",
          phone: "044-24640050",
          description: "Suicide prevention and emotional support",
          available: "24/7",
          website: "https://snehaindia.org"
        },
        {
          name: "Fortis Stress Helpline",
          phone: "8376804102",
          description: "Mental health and stress management support",
          available: "24/7",
          website: "https://fortishealthcare.com"
        },
        {
          name: "NIMHANS Helpline",
          phone: "080-46110007",
          description: "Mental health support from National Institute",
          available: "Mon-Sat 9am-5pm",
          website: "https://nimhans.ac.in"
        }
      ],
      emergency: {
        number: "102 / 108",
        description: "Call 102 (Mental Health) or 108 (Emergency) for immediate assistance"
      }
    },
    US: {
      hotlines: [
        {
          name: "National Suicide Prevention Lifeline",
          phone: "988",
          description: "24/7 free and confidential support for people in distress",
          available: "24/7",
          website: "https://suicidepreventionlifeline.org"
        },
        {
          name: "Crisis Text Line",
          phone: "Text HOME to 741741",
          description: "24/7 crisis support via text message",
          available: "24/7",
          website: "https://www.crisistextline.org"
        },
        {
          name: "National Alliance on Mental Illness (NAMI)",
          phone: "1-800-950-NAMI (6264)",
          description: "Information, support, and resources for mental health",
          available: "Mon-Fri 10am-6pm ET",
          website: "https://www.nami.org"
        },
        {
          name: "SAMHSA National Helpline",
          phone: "1-800-662-4357",
          description: "Treatment referral and information service",
          available: "24/7",
          website: "https://www.samhsa.gov"
        }
      ],
      emergency: {
        number: "911",
        description: "Call 911 for immediate emergency assistance"
      }
    },
    UK: {
      hotlines: [
        {
          name: "Samaritans",
          phone: "116 123",
          description: "Free 24/7 emotional support for anyone in distress",
          available: "24/7",
          website: "https://www.samaritans.org"
        },
        {
          name: "Crisis Text Line UK",
          phone: "Text SHOUT to 85258",
          description: "24/7 crisis support via text message",
          available: "24/7",
          website: "https://www.crisistextline.uk"
        },
        {
          name: "Mind",
          phone: "0300 123 3393",
          description: "Mental health support and information",
          available: "Mon-Fri 9am-6pm",
          website: "https://www.mind.org.uk"
        }
      ],
      emergency: {
        number: "999",
        description: "Call 999 for immediate emergency assistance"
      }
    },
    CA: {
      hotlines: [
        {
          name: "Talk Suicide Canada",
          phone: "1-833-456-4566",
          description: "24/7 bilingual crisis support",
          available: "24/7",
          website: "https://talksuicide.ca"
        },
        {
          name: "Kids Help Phone",
          phone: "1-800-668-6868 or Text CONNECT to 686868",
          description: "24/7 support for young people",
          available: "24/7",
          website: "https://kidshelpphone.ca"
        },
        {
          name: "Canadian Mental Health Association",
          phone: "Check local branch",
          description: "Mental health support and resources",
          available: "Varies by location",
          website: "https://cmha.ca"
        }
      ],
      emergency: {
        number: "911",
        description: "Call 911 for immediate emergency assistance"
      }
    }
  };

  const countries = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' }
  ];

  const warningSignsData = [
    "Talking about wanting to die or to kill themselves",
    "Looking for ways to kill themselves",
    "Talking about feeling hopeless or having no purpose",
    "Talking about feeling trapped or in unbearable pain",
    "Talking about being a burden to others",
    "Increasing use of alcohol or drugs",
    "Acting anxious, agitated, or reckless",
    "Sleeping too little or too much",
    "Withdrawing or feeling isolated",
    "Showing rage or talking about seeking revenge",
    "Displaying extreme mood swings",
    "Giving away prized possessions"
  ];

  const immediateSteps = [
    {
      title: "Stay with the person",
      description: "Don't leave them alone if possible"
    },
    {
      title: "Listen without judgment",
      description: "Let them talk about their feelings"
    },
    {
      title: "Call for help",
      description: "Contact a crisis hotline or emergency services"
    },
    {
      title: "Remove harmful items",
      description: "Remove access to means of self-harm if safe to do so"
    },
    {
      title: "Get professional help",
      description: "Connect them with mental health professionals"
    }
  ];

  const selectedResources = emergencyResources[selectedCountry];

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    },
    hover: {
      y: -2,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      
      <Header />
      {/* Main Content */}
      <main className="pt-16 sm:pt-20 px-4 sm:px-6 pb-12">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page Title */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-lg transition-colors hover:bg-white"
              style={{ color: '#8A6FBF' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: '#6E55A0' }}>
                  Crisis Support
                </h1>
                <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                  Immediate help when you need it most
                </p>
              </div>
            </div>
          </motion.div>

          {/* Immediate Danger Alert */}
          <motion.div 
            variants={itemVariants}
            className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-6 mb-8 shadow-sm"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1 text-red-600" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-red-800">
                  If you or someone you know is in immediate danger
                </h2>
                <p className="text-red-700 mb-4">
                  Please call emergency services immediately. Your life matters and help is available right now.
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.a 
                    href={`tel:${selectedResources.emergency.number.replace(/[^\d]/g, '')}`}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05, backgroundColor: '#DC2626' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call {selectedResources.emergency.number}</span>
                  </motion.a>
                  {selectedCountry === 'IN' && (
                    <motion.a 
                      href="tel:1800599019"
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.05, backgroundColor: '#2563EB' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone className="w-5 h-5" />
                      <span>Mental Health Helpline</span>
                    </motion.a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Crisis Hotlines */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div 
                variants={cardVariants}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>Crisis Hotlines</h2>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" style={{ color: '#8A6FBF' }} />
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: '#E3DEF1', color: '#6E55A0' }}
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedResources.hotlines.map((hotline, index) => (
                    <motion.div 
                      key={index} 
                      className="border-2 rounded-xl p-4 transition-all duration-200"
                      style={{ borderColor: '#E3DEF1' }}
                      whileHover={{ 
                        backgroundColor: '#F7F5FA',
                        borderColor: '#8A6FBF',
                        y: -2
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold" style={{ color: '#6E55A0' }}>{hotline.name}</h3>
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                          <Clock className="w-4 h-4" />
                          <span>{hotline.available}</span>
                        </div>
                      </div>
                      
                      <p className="mb-3" style={{ color: '#8A6FBF' }}>{hotline.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <motion.a 
                          href={`tel:${hotline.phone.replace(/[^\d]/g, '')}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                          whileHover={{ scale: 1.05, backgroundColor: '#2563EB' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Phone className="w-4 h-4" />
                          <span>{hotline.phone}</span>
                        </motion.a>
                        
                        {hotline.website && (
                          <motion.a 
                            href={hotline.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                            style={{ borderColor: '#E3DEF1', color: '#6E55A0' }}
                            whileHover={{ backgroundColor: '#F7F5FA', borderColor: '#8A6FBF' }}
                          >
                            <Globe className="w-4 h-4" />
                            <span>Website</span>
                          </motion.a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Warning Signs */}
              <motion.div 
                variants={cardVariants}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#6E55A0' }}>Warning Signs to Watch For</h2>
                <p className="mb-6" style={{ color: '#8A6FBF' }}>
                  If you notice these signs in yourself or someone else, it's important to seek help immediately:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {warningSignsData.map((sign, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-yellow-800">{sign}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div 
                variants={cardVariants}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#6E55A0' }}>If Someone is in Crisis</h3>
                
                <div className="space-y-4">
                  {immediateSteps.map((step, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white" style={{ backgroundColor: '#8A6FBF' }}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium" style={{ color: '#6E55A0' }}>{step.title}</h4>
                        <p className="text-sm" style={{ color: '#8A6FBF' }}>{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Resources */}
              <motion.div 
                variants={cardVariants}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#6E55A0' }}>Additional Resources</h3>
                
                <div className="space-y-3">
                  {selectedCountry === 'IN' && (
                    <motion.a 
                      href="https://www.mohfw.gov.in/mental-health"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-green-50 rounded-lg transition-colors border border-green-200"
                      whileHover={{ backgroundColor: '#DCFCE7' }}
                    >
                      <h4 className="font-medium text-green-900">Ministry of Health Mental Health</h4>
                      <p className="text-sm text-green-700">Government mental health resources</p>
                    </motion.a>
                  )}
                  
                  <motion.a 
                    href="https://www.mentalhealthfirstaid.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-blue-50 rounded-lg transition-colors border border-blue-200"
                    whileHover={{ backgroundColor: '#DBEAFE' }}
                  >
                    <h4 className="font-medium text-blue-900">Mental Health First Aid</h4>
                    <p className="text-sm text-blue-700">Learn how to help someone in crisis</p>
                  </motion.a>
                  
                  <Link 
                    href="/chat"
                    className="block"
                  >
                    <motion.div 
                      className="p-3 rounded-lg transition-colors border border-purple-200"
                      style={{ backgroundColor: '#E3DEF1' }}
                      whileHover={{ backgroundColor: '#D8B4FE' }}
                    >
                      <h4 className="font-medium" style={{ color: '#6E55A0' }}>AI Support Chat</h4>
                      <p className="text-sm" style={{ color: '#8A6FBF' }}>Talk to our wellness companion</p>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {/* You Matter */}
              <motion.div 
                variants={cardVariants}
                className="rounded-xl sm:rounded-2xl p-6 text-white text-center"
                style={{ background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)' }}
              >
                <Heart className="w-12 h-12 mx-auto mb-4 text-pink-200" />
                <h3 className="text-lg font-semibold mb-2">You Matter</h3>
                <p className="text-sm opacity-90">
                  Your life has value. You are not alone. Help is available, and things can get better.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}