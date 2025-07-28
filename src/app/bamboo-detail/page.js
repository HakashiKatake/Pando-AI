"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useHabitStore } from "@/lib/store"
import Header from '@/components/Header'
import { 
  TreePine, 
  Leaf, 
  Droplets, 
  ArrowLeft,
  Heart,
  Sun,
  Wind,
  Sparkles,
  Calendar,
  Award,
  Info
} from "lucide-react"

const BambooDetail = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bambooId = searchParams.get('id')
  const bambooName = searchParams.get('name')
  const bambooGrowth = parseInt(searchParams.get('growth') || '0')
  const bambooType = searchParams.get('type')
  const plantedDate = searchParams.get('planted')
  const totalWaterings = parseInt(searchParams.get('waterings') || '0')
  
  const { addUserPoints } = useHabitStore()
  
  // Get bamboo type details
  const getBambooTypeDetails = (type, growth) => {
    if (growth === 100) {
      return {
        icon: <TreePine className="w-32 h-32" />,
        color: '#228B22',
        name: 'Mature Bamboo',
        stage: 'Fully Grown',
        description: 'A magnificent bamboo that has reached its full potential through your dedicated care.',
        image: '/asset/panda-bambo.png'
      }
    } else if (growth >= 66) {
      return {
        icon: <TreePine className="w-24 h-24" />,
        color: '#32CD32',
        name: 'Young Bamboo',
        stage: 'Growing Strong',
        description: 'Your bamboo is developing well and showing signs of maturity.',
        image: '/asset/panda-bambo.png'
      }
    } else if (growth >= 33) {
      return {
        icon: <TreePine className="w-20 h-20" />,
        color: '#90EE90',
        name: 'Growing Bamboo',
        stage: 'Developing',
        description: 'Your bamboo is making good progress with your consistent care.',
        image: '/asset/panda-bambo.png'
      }
    } else {
      return {
        icon: <Leaf className="w-16 h-16" />,
        color: '#90EE90',
        name: 'Bamboo Sprout',
        stage: 'Just Starting',
        description: 'A tender young sprout beginning its journey to become a mighty bamboo.',
        image: '/asset/panda-bambo.png'
      }
    }
  }

  // Calculate days since planting
  const getDaysSincePlanting = () => {
    if (!plantedDate) return 0
    const planted = new Date(plantedDate)
    const today = new Date()
    return Math.floor((today - planted) / (1000 * 60 * 60 * 24)) + 1
  }

  // Calculate days to maturity
  const getDaysToMaturity = () => {
    return Math.max(0, 15 - getDaysSincePlanting())
  }

  // Get care tips based on growth stage
  const getCareTips = (growth) => {
    if (growth === 100) {
      return [
        "Your bamboo is fully mature! Continue daily care to maintain its beauty.",
        "Consider harvesting for special rewards when ready.",
        "This bamboo can now inspire others in your garden."
      ]
    } else if (growth >= 66) {
      return [
        "Water 3 times daily to reach full maturity.",
        "Your bamboo is in its final growth stage.",
        "Continue consistent care for the best results."
      ]
    } else if (growth >= 33) {
      return [
        "Maintain regular watering schedule for steady growth.",
        "Your bamboo is responding well to your care.",
        "Keep up the consistent daily attention."
      ]
    } else {
      return [
        "Water 3 times daily for optimal growth.",
        "Young sprouts need extra attention and care.",
        "Be patient - great growth takes time!"
      ]
    }
  }

  const bambooDetails = getBambooTypeDetails(bambooType, bambooGrowth)
  const daysSincePlanting = getDaysSincePlanting()
  const careTips = getCareTips(bambooGrowth)

  const handleLoveBamboo = () => {
    addUserPoints(1, 'bamboo_love')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      <Header />
      
      <motion.div 
        className="pt-20 pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <main className="px-6">
          <div className="max-w-7xl mx-auto">
            {/* Navigation Header */}
            <motion.div 
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white px-6 py-3 rounded-full font-medium transition-all duration-200"
                style={{ backgroundColor: '#8A6FBF' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Garden
              </Button>
              <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-1" />
                {bambooDetails.stage}
              </Badge>
            </motion.div>

            {/* Title Section */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <img 
                  src="/asset/panda-bambo.png" 
                  alt="Panda with Bamboo"
                  className="w-24 h-24 mx-auto object-contain"
                />
              </motion.div>
              
              <h1 className="text-4xl font-bold mb-4" style={{ color: '#6E55A0' }}>
                {bambooName}
              </h1>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6E55A0' }}>
                {bambooDetails.description}
              </p>
            </motion.div>

            {/* Main Bamboo Display */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Bamboo Image Section */}
              <motion.div
                className="bg-gradient-to-r from-green-400 to-green-500 rounded-2xl p-8 text-white relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute -top-2 -right-2 text-4xl opacity-20">🎋</div>
                <div className="absolute -bottom-2 -left-2 text-4xl opacity-20">🎋</div>
                
                <div className="text-center relative z-10">
                  <div className="w-full h-96 flex items-center justify-center mb-6 relative">
                    {/* Background bamboo image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 rounded-lg"
                      style={{
                        backgroundImage: `url(${bambooDetails.image})`
                      }}
                    />
                    
                    {/* Bamboo icon overlay */}
                    <div 
                      className="relative z-10 drop-shadow-lg text-white"
                    >
                      {bambooDetails.icon}
                    </div>
                    
                    {/* Growth percentage overlay */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-sm font-bold text-green-700">{bambooGrowth}%</span>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">{bambooDetails.name}</h2>
                  <p className="text-white/90 mb-6">{bambooDetails.stage}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center gap-3">
                    <motion.button
                      onClick={handleLoveBamboo}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Heart className="w-4 h-4" />
                      Show Love (+1 point)
                    </motion.button>
                    {bambooGrowth === 100 && (
                      <motion.button 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Award className="w-4 h-4" />
                        Harvest
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Details Section */}
              <div className="space-y-6">
                {/* Growth Progress */}
                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute -top-2 -right-2 text-2xl opacity-20">📈</div>
                  <div className="absolute -bottom-2 -left-2 text-2xl opacity-20">📈</div>
                  
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TreePine className="w-5 h-5" />
                    Growth Progress
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-white/80 mb-2">
                        <span>Growth</span>
                        <span>{bambooGrowth}% Complete</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                          className="bg-white h-3 rounded-full transition-all duration-300"
                          style={{ width: `${bambooGrowth}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white/10 rounded-lg p-3">
                        <Calendar className="w-6 h-6 text-white mx-auto mb-1" />
                        <p className="text-sm font-medium text-white/80">Days Growing</p>
                        <p className="text-lg font-bold text-white">{daysSincePlanting}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <Droplets className="w-6 h-6 text-white mx-auto mb-1" />
                        <p className="text-sm font-medium text-white/80">Total Waters</p>
                        <p className="text-lg font-bold text-white">{totalWaterings}</p>
                      </div>
                    </div>
                    
                    {getDaysToMaturity() > 0 && (
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <Sun className="w-6 h-6 text-white mx-auto mb-1" />
                        <p className="text-sm font-medium text-white/80">Days to Maturity</p>
                        <p className="text-lg font-bold text-white">{getDaysToMaturity()}</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Care Information */}
                <motion.div
                  className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute -top-2 -right-2 text-2xl opacity-20">💡</div>
                  <div className="absolute -bottom-2 -left-2 text-2xl opacity-20">💡</div>
                  
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Care Tips
                  </h3>
                  
                  <div className="space-y-3">
                    {careTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                        <div className="w-6 h-6 bg-white text-orange-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-white/90">{tip}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Bamboo Stats */}
                <motion.div
                  className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute -top-2 -right-2 text-2xl opacity-20">📊</div>
                  <div className="absolute -bottom-2 -left-2 text-2xl opacity-20">📊</div>
                  
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Wind className="w-5 h-5" />
                    Bamboo Details
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-2 bg-white/10 rounded-lg">
                      <span className="text-white/80">Type:</span>
                      <span className="font-medium text-white">{bambooDetails.name}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/10 rounded-lg">
                      <span className="text-white/80">Planted Date:</span>
                      <span className="font-medium text-white">{plantedDate}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/10 rounded-lg">
                      <span className="text-white/80">Growth Stage:</span>
                      <span className="font-medium text-white">{bambooDetails.stage}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/10 rounded-lg">
                      <span className="text-white/80">Watering Efficiency:</span>
                      <span className="font-medium text-white">
                        {totalWaterings > 0 ? Math.round((totalWaterings / (daysSincePlanting * 3)) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>
      </motion.div>

    </div>
  )
}

export default BambooDetail
