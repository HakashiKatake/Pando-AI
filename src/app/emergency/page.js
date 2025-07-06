'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Globe, Clock, ArrowLeft, Heart, AlertTriangle, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function EmergencyPage() {
  const [selectedCountry, setSelectedCountry] = useState('US');

  const emergencyResources = {
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
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' }
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

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="p-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Crisis Support</h1>
                <p className="text-red-100">Immediate help when you need it most</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-semibold">Need immediate help?</p>
            <p className="text-red-100">Call {selectedResources.emergency.number} now</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Immediate Danger Alert */}
        <div className="bg-red-100 border border-red-400 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-red-800 mb-2">
                If you or someone you know is in immediate danger
              </h2>
              <p className="text-red-700 mb-4">
                Please call emergency services immediately. Your life matters and help is available right now.
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href={`tel:${selectedResources.emergency.number}`}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call {selectedResources.emergency.number}</span>
                </a>
                <a 
                  href="tel:988"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call 988 (Suicide & Crisis Lifeline)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Crisis Hotlines */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crisis Hotlines</h2>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {countries.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {selectedResources.hotlines.map((hotline, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{hotline.name}</h3>
                      <div className="flex items-center space-x-1 text-green-600 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{hotline.available}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{hotline.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={`tel:${hotline.phone.replace(/[^\d]/g, '')}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{hotline.phone}</span>
                      </a>
                      
                      {hotline.website && (
                        <a 
                          href={hotline.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Signs */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Warning Signs to Watch For</h2>
              <p className="text-gray-600 mb-6">
                If you notice these signs in yourself or someone else, it's important to seek help immediately:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {warningSignsData.map((sign, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">{sign}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">If Someone is in Crisis</h3>
              
              <div className="space-y-4">
                {immediateSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
              
              <div className="space-y-3">
                <a 
                  href="https://www.mentalhealthfirstaid.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h4 className="font-medium text-blue-900">Mental Health First Aid</h4>
                  <p className="text-sm text-blue-700">Learn how to help someone in crisis</p>
                </a>
                
                <a 
                  href="https://www.nimh.nih.gov/health/find-help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <h4 className="font-medium text-green-900">Find Mental Health Services</h4>
                  <p className="text-sm text-green-700">Locate professionals in your area</p>
                </a>
                
                <Link 
                  href="/chat"
                  className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <h4 className="font-medium text-purple-900">AI Support Chat</h4>
                  <p className="text-sm text-purple-700">Talk to our wellness companion</p>
                </Link>
              </div>
            </div>

            {/* You Matter */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-200" />
              <h3 className="text-lg font-semibold mb-2">You Matter</h3>
              <p className="text-blue-100 text-sm">
                Your life has value. You are not alone. Help is available, and things can get better.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
