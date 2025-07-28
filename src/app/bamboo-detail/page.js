"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useHabitStore } from "@/lib/store"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Garden
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Sparkles className="w-4 h-4 mr-1" />
              {bambooDetails.stage}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Bamboo Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bamboo Image Section */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-100">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-full h-96 flex items-center justify-center mb-6 relative">
                  {/* Background bamboo image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 rounded-lg"
                    style={{
                      backgroundImage: `url(${bambooDetails.image})`
                    }}
                  />
                  
                  {/* Bamboo icon overlay */}
                  <div 
                    className="relative z-10 drop-shadow-lg"
                    style={{ color: bambooDetails.color }}
                  >
                    {bambooDetails.icon}
                  </div>
                  
                  {/* Growth percentage overlay */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-bold text-green-700">{bambooGrowth}%</span>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{bambooName}</h1>
                <p className="text-lg text-gray-600 mb-4">{bambooDetails.description}</p>
                
                {/* Action Buttons */}
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={handleLoveBamboo}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Show Love (+1 point)
                  </Button>
                  {bambooGrowth === 100 && (
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Award className="w-4 h-4 mr-2" />
                      Harvest
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Growth Progress */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-green-600" />
                  Growth Progress
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Growth</span>
                      <span>{bambooGrowth}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${bambooGrowth}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-700">Days Growing</p>
                      <p className="text-lg font-bold text-blue-600">{daysSincePlanting}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <Droplets className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-700">Total Waters</p>
                      <p className="text-lg font-bold text-green-600">{totalWaterings}</p>
                    </div>
                  </div>
                  
                  {getDaysToMaturity() > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <Sun className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-700">Days to Maturity</p>
                      <p className="text-lg font-bold text-yellow-600">{getDaysToMaturity()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Care Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Care Tips
                </h3>
                
                <div className="space-y-3">
                  {careTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bamboo Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-gray-600" />
                  Bamboo Details
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{bambooDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Planted Date:</span>
                    <span className="font-medium">{plantedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Stage:</span>
                    <span className="font-medium">{bambooDetails.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Watering Efficiency:</span>
                    <span className="font-medium">
                      {totalWaterings > 0 ? Math.round((totalWaterings / (daysSincePlanting * 3)) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Background */}
      <div 
        className="fixed inset-0 -z-10 opacity-5"
        style={{
          backgroundImage: 'url(/asset/bamboo.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  )
}

export default BambooDetail
