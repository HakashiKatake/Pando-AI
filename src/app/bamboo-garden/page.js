"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useHabitStore } from "@/lib/store"
import { 
  TreePine, 
  Leaf, 
  Sun, 
  Droplets, 
  Wind,
  Sparkles,
  Clock,
  Award,
  Coins
} from "lucide-react"

const BambooGarden = () => {
  const router = useRouter()
  const [selectedBamboo, setSelectedBamboo] = useState(null)
  const [plantingMode, setPlantingMode] = useState(false)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [videoForBamboo, setVideoForBamboo] = useState(null)
  
  // Use centralized points system from store
  const { 
    userPoints, 
    addUserPoints, 
    deductUserPoints, 
    calculateTotalUserPoints 
  } = useHabitStore()
  
  // Initialize points calculation on component mount
  useEffect(() => {
    // Initialize with a starting amount for new users if they have no points
    const initializePoints = async () => {
      calculateTotalUserPoints()
      // Give new users starting points if they have exactly 0 points (first time)
      if (userPoints === 0) {
        setTimeout(() => {
          addUserPoints(50, 'welcome_bonus')
        }, 100)
      }
    }
    
    initializePoints()
  }, [calculateTotalUserPoints, addUserPoints]) // Removed userPoints dependency
  
  // For a new user, start with an empty garden. This example shows day 2 for testing
  const [bambooGarden, setBambooGarden] = useState([
    { 
      id: 1, 
      type: 'sprout', 
      growth: 0, // Will be calculated based on days since planting
      planted: '2025-07-26', // Day 2 for testing (planted yesterday)
      name: 'Mindful Moment', 
      lastWatered: '2025-07-27',
      dailyWaterCount: 0, // 3 waters remaining today
      lastWateredDate: '2025-07-27', // Date when last watered
      totalWaterings: 3 // Day 1: 3 waterings completed
    },
  ])
  
  // For a completely new user, use this instead:
  // const [bambooGarden, setBambooGarden] = useState([])

  // Calculate bamboo growth based on days since planting and watering consistency
  const calculateGrowth = (plantedDate, dailyWaterCount = 0, totalWaterings = 0) => {
    const planted = new Date(plantedDate)
    const today = new Date()
    
    // Calculate days since planting (add 1 because day 1 starts immediately after planting)
    const daysSincePlanting = Math.floor((today - planted) / (1000 * 60 * 60 * 24)) + 1
    
    // Base growth: 6% per day (day 1 = 6%, day 7 = 42%, day 15 = 90%, day 16+ = 100%)
    let currentGrowth = Math.min(15, daysSincePlanting) * 6
    
    // Calculate expected waterings vs actual waterings
    const expectedWaterings = daysSincePlanting * 3 // 3 waterings per day expected
    const actualWaterings = totalWaterings || 0
    
    // If user hasn't watered enough, reduce growth proportionally
    if (expectedWaterings > 0) {
      const wateringRatio = Math.min(1, actualWaterings / expectedWaterings)
      currentGrowth = currentGrowth * wateringRatio
    }
    
    // Growth penalty: if no watering for 2+ consecutive days, reduce by 10% per missed day
    const lastWaterDay = Math.ceil(actualWaterings / 3)
    const daysSinceLastWater = Math.max(0, daysSincePlanting - lastWaterDay)
    if (daysSinceLastWater > 2) {
      const penalty = (daysSinceLastWater - 2) * 10
      currentGrowth = Math.max(0, currentGrowth - penalty)
    }
    
    return Math.round(Math.min(100, Math.max(0, currentGrowth)))
  }

  // Determine bamboo type based on growth percentage
  const getBambooType = (growth) => {
    if (growth < 33) return 'sprout'
    if (growth < 66) return 'young'
    return 'mature'
  }

  // Update bamboo growth on component mount and when bamboo changes
  useEffect(() => {
    setBambooGarden(prevGarden => 
      prevGarden.map(bamboo => {
        const today = new Date().toISOString().split('T')[0]
        // Don't include today's waterings in the calculation since they're tracked separately
        const calculatedGrowth = calculateGrowth(bamboo.planted, 0, bamboo.totalWaterings || 0)
        const newType = getBambooType(calculatedGrowth)
        
        const planted = new Date(bamboo.planted)
        const currentDate = new Date()
        const daysSincePlanting = Math.floor((currentDate - planted) / (1000 * 60 * 60 * 24)) + 1
        
        console.log(`Bamboo ${bamboo.name}: Day ${daysSincePlanting}, Total waterings: ${bamboo.totalWaterings}, Calculated growth: ${calculatedGrowth}%`)
        
        return {
          ...bamboo,
          growth: calculatedGrowth,
          type: newType
        }
      })
    )
  }, [])

  const bambooTypes = [
    { type: 'sprout', icon: <Leaf className="w-8 h-8" />, color: '#90EE90', name: 'Sprout', cost: 10 },
    { type: 'young', icon: <TreePine className="w-8 h-8" />, color: '#32CD32', name: 'Young Bamboo', cost: 25 },
    { type: 'mature', icon: <TreePine className="w-12 h-12" />, color: '#228B22', name: 'Mature Bamboo', cost: 50 },
  ]

  // Check if user can plant a new bamboo (only one every 15 days)
  const canPlantNewBamboo = () => {
    if (bambooGarden.length === 0) return true // Can always plant the first bamboo
    
    // Find the most recently planted bamboo
    const latestPlanted = bambooGarden.reduce((latest, current) => {
      return new Date(current.planted) > new Date(latest.planted) ? current : latest
    })
    
    const daysSinceLastPlant = Math.floor((new Date() - new Date(latestPlanted.planted)) / (1000 * 60 * 60 * 24))
    return daysSinceLastPlant >= 15
  }

  // Get days remaining until user can plant next bamboo
  const getDaysUntilNextPlant = () => {
    if (bambooGarden.length === 0) return 0
    
    const latestPlanted = bambooGarden.reduce((latest, current) => {
      return new Date(current.planted) > new Date(latest.planted) ? current : latest
    })
    
    const daysSinceLastPlant = Math.floor((new Date() - new Date(latestPlanted.planted)) / (1000 * 60 * 60 * 24))
    return Math.max(0, 15 - daysSinceLastPlant)
  }

  const handlePlantBamboo = (type) => {
    if (!canPlantNewBamboo()) {
      return // Prevent planting if not allowed
    }

    // Check if user has enough points
    if (userPoints < type.cost) {
      return // Prevent planting if not enough points
    }
    
    const today = new Date().toISOString().split('T')[0]
    const newBamboo = {
      id: Date.now(),
      type: 'sprout', // Always start as sprout
      growth: 0, // Start with 0% growth
      planted: today,
      lastWatered: today,
      lastWateredDate: today,
      dailyWaterCount: 0,
      totalWaterings: 0, // Track total waterings
      name: `New ${type.name}`
    }
    setBambooGarden([...bambooGarden, newBamboo])
    deductUserPoints(type.cost, 'bamboo_planting') // Deduct points using centralized system
    setPlantingMode(false)
  }

  // Check if bamboo can be watered (max 3 times per day)
  const canWaterBamboo = (bamboo) => {
    const today = new Date().toISOString().split('T')[0]
    
    // If last watered on a different day, reset the count
    if (bamboo.lastWateredDate !== today) {
      return true // Can always water on a new day
    }
    
    // Check if already watered 3 times today
    return bamboo.dailyWaterCount < 3
  }

  // Get remaining waters for today
  const getRemainingWaters = (bamboo) => {
    const today = new Date().toISOString().split('T')[0]
    
    // If last watered on a different day, reset the count
    if (bamboo.lastWateredDate !== today) {
      return 3
    }
    
    return Math.max(0, 3 - bamboo.dailyWaterCount)
  }

  const handleWaterBamboo = (id) => {
    const today = new Date().toISOString().split('T')[0]
    let wateringSuccessful = false
    
    // Start video playback for this specific bamboo
    setVideoForBamboo(id)
    setIsPlayingVideo(true)
    
    // Auto-stop video after 8 seconds
    setTimeout(() => {
      setIsPlayingVideo(false)
      setVideoForBamboo(null)
    }, 8000)
    
    setBambooGarden(prevGarden => 
      prevGarden.map(bamboo => {
        if (bamboo.id === id) {
          // Check if can water this bamboo
          if (!canWaterBamboo(bamboo)) {
            return bamboo // Return unchanged if can't water
          }
          
          // Mark that watering was successful
          wateringSuccessful = true
          
          // Reset daily count if it's a new day
          let newDailyCount = bamboo.lastWateredDate === today ? bamboo.dailyWaterCount + 1 : 1
          let newTotalWaterings = (bamboo.totalWaterings || 0) + 1
          
          const updatedBamboo = { 
            ...bamboo, 
            lastWatered: today,
            lastWateredDate: today,
            dailyWaterCount: newDailyCount,
            totalWaterings: newTotalWaterings
          }
          
          // Calculate new growth based on total waterings (not including today's partial count)
          const newGrowth = calculateGrowth(bamboo.planted, 0, newTotalWaterings)
          const newType = getBambooType(newGrowth)
          
          return {
            ...updatedBamboo,
            growth: newGrowth,
            type: newType
          }
        }
        return bamboo
      })
    )
    
    // Award points after state update is complete, but only if watering was successful
    if (wateringSuccessful) {
      setTimeout(() => {
        addUserPoints(2, 'bamboo_watering')
      }, 0)
    }
  }

  // Get days remaining until bamboo is fully mature
  const getDaysToMaturity = (plantedDate) => {
    const planted = new Date(plantedDate)
    const today = new Date()
    const daysSincePlanting = Math.floor((today - planted) / (1000 * 60 * 60 * 24))
    return Math.max(0, 15 - daysSincePlanting)
  }

  // Check if bamboo needs watering (more than 1 day since last watered)
  const needsWatering = (lastWatered) => {
    const lastWater = new Date(lastWatered)
    const today = new Date()
    const daysSinceWatering = Math.floor((today - lastWater) / (1000 * 60 * 60 * 24))
    return daysSinceWatering >= 1
  }

  // Handle bamboo click to navigate to detail page
  const handleBambooClick = (bamboo) => {
    const params = new URLSearchParams({
      id: bamboo.id.toString(),
      name: bamboo.name,
      growth: bamboo.growth.toString(),
      type: bamboo.type,
      planted: bamboo.planted,
      waterings: (bamboo.totalWaterings || 0).toString()
    })
    router.push(`/bamboo-detail?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bamboo Garden</h1>
                <p className="text-gray-600">Grow your mindfulness through virtual bamboo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Coins className="w-4 h-4 mr-1" />
                {userPoints} Points
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Sparkles className="w-4 h-4 mr-1" />
                Level 5 Gardener
              </Badge>
              {!canPlantNewBamboo() && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  <Clock className="w-4 h-4 mr-1" />
                  Next plant in {getDaysUntilNextPlant()} days
                </Badge>
              )}
              <Button 
                onClick={() => setPlantingMode(!plantingMode)}
                className={`${
                  canPlantNewBamboo() 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!canPlantNewBamboo()}
              >
                <Leaf className="w-4 h-4 mr-2" />
                {canPlantNewBamboo() ? 'Plant New Bamboo' : 'Planting Locked'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Points Earning Guide */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-600" />
              How to Earn Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="w-15 h-15 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">5</span>
                </div>
                <p className="font-medium text-gray-700">Habit Completion</p>
                <p className="text-gray-500 text-xs">Complete daily habits</p>
              </div>
              <div className="text-center">
                <div className="w-15 h-15 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">15-50</span>
                </div>
                <p className="font-medium text-gray-700">Task Completion</p>
                <p className="text-gray-500 text-xs">Complete daily tasks</p>
              </div>
              <div className="text-center">
                <div className="w-15 h-15 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">10</span>
                </div>
                <p className="font-medium text-gray-700">Exercise/Games</p>
                <p className="text-gray-500 text-xs">Complete exercises</p>
              </div>
              <div className="text-center">
                <div className="w-15 h-15 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600 font-bold">8-12</span>
                </div>
                <p className="font-medium text-gray-700">Mood & Journal</p>
                <p className="text-gray-500 text-xs">Track mood & write</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <strong>Bamboo Garden:</strong> Water bamboo (+2 points) • Plant new bamboo (costs 10-50 points)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{bambooGarden.length}</p>
              <p className="text-sm text-gray-600">Total Bamboo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{(() => {
                // Calculate gardening streak (consecutive days with at least one watering)
                const today = new Date()
                let streak = 0
                for (let i = 0; i < 365; i++) {
                  const checkDate = new Date(today)
                  checkDate.setDate(today.getDate() - i)
                  const dateStr = checkDate.toISOString().split('T')[0]
                  
                  // Check if any bamboo was watered on this date
                  const hasWateredToday = bambooGarden.some(bamboo => {
                    return bamboo.lastWateredDate === dateStr || 
                           (bamboo.totalWaterings > 0 && new Date(bamboo.planted) <= checkDate)
                  })
                  
                  if (hasWateredToday || i === 0) { // Include today even if not watered yet
                    streak++
                  } else {
                    break
                  }
                }
                return streak
              })()}</p>
              <p className="text-sm text-gray-600">Days Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{(() => {
                // Calculate total times watered across all bamboo
                return bambooGarden.reduce((total, bamboo) => {
                  return total + (bamboo.totalWaterings || 0)
                }, 0)
              })()}</p>
              <p className="text-sm text-gray-600">Times Watered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{(() => {
                // Calculate achievements: mature bamboos + perfect days + milestones
                let achievements = 0
                
                // Mature bamboos (1 achievement each)
                achievements += bambooGarden.filter(bamboo => bamboo.growth === 100).length
                
                // Milestone achievements
                const totalWaterings = bambooGarden.reduce((total, bamboo) => total + (bamboo.totalWaterings || 0), 0)
                if (totalWaterings >= 100) achievements += 1 // Watering master
                if (totalWaterings >= 50) achievements += 1 // Dedicated gardener
                if (totalWaterings >= 20) achievements += 1 // Green thumb
                if (bambooGarden.length >= 3) achievements += 1 // Garden expander
                if (bambooGarden.length >= 1) achievements += 1 // First bamboo
                
                return achievements
              })()}</p>
              <p className="text-sm text-gray-600">Achievements</p>
            </CardContent>
          </Card>
        </div>

        {/* Planting Mode */}
        {plantingMode && canPlantNewBamboo() && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Bamboo</h3>
              <p className="text-sm text-gray-600 mb-4">
                You can plant one bamboo every 15 days. Choose wisely!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bambooTypes.map((type) => {
                  const canAfford = userPoints >= type.cost
                  return (
                    <Card 
                      key={type.type}
                      className={`transition-all border-2 ${
                        canAfford 
                          ? 'cursor-pointer hover:shadow-lg border-transparent hover:border-green-300' 
                          : 'cursor-not-allowed opacity-60 border-red-200'
                      }`}
                      onClick={() => canAfford && handlePlantBamboo(type)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="mb-3" style={{ color: canAfford ? type.color : '#9CA3AF' }}>
                          {type.icon}
                        </div>
                        <h4 className={`font-semibold ${canAfford ? 'text-gray-900' : 'text-gray-500'}`}>
                          {type.name}
                        </h4>
                        <p className={`text-sm mb-2 ${canAfford ? 'text-gray-600' : 'text-gray-400'}`}>
                          Cost: {type.cost} points
                        </p>
                        <Button 
                          size="sm" 
                          className={`w-full ${
                            canAfford 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!canAfford}
                        >
                          {canAfford ? 'Plant Now' : 'Insufficient Points'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Planting Restriction Message */}
        {plantingMode && !canPlantNewBamboo() && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Planting Cooldown Active</h3>
              <p className="text-gray-600 mb-4">
                You can only plant one bamboo every 15 days to ensure each one gets proper care and attention.
              </p>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Next planting available in {getDaysUntilNextPlant()} days
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Garden Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bambooGarden.map((bamboo) => {
            const bambooType = bambooTypes.find(t => t.type === bamboo.type)
            return (
              <Card 
                key={bamboo.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => handleBambooClick(bamboo)}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-64 h-48 mx-auto mb-3 flex items-center justify-center relative overflow-hidden rounded-lg bg-green-50">
                      {/* Watering Video - appears when watering this specific bamboo */}
                      {isPlayingVideo && videoForBamboo === bamboo.id && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 rounded-lg">
                          <video
                            autoPlay
                            muted
                            className="w-full h-full object-cover rounded-lg"
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onEnded={() => {
                              setIsPlayingVideo(false)
                              setVideoForBamboo(null)
                            }}
                          >
                            <source src="/asset/watering_panda.mp4" type="video/quicktime" />
                            <source src="/asset/watering_panda.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      
                      {/* Bamboo Image */}
                      <img 
                        src="/asset/bamboo.png" 
                        alt="Bamboo Plant"
                        className="w-60 h-60 object-fill rounded-lg"

                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">{bamboo.name}</h3>
                    <p className="text-sm text-gray-600">Planted: {bamboo.planted}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {getDaysToMaturity(bamboo.planted) > 0 
                          ? `${getDaysToMaturity(bamboo.planted)} days to maturity`
                          : 'Fully mature!'
                        }
                      </p>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                        {getRemainingWaters(bamboo)}/3 waters left
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-gray-400">
                        Day {Math.floor((new Date() - new Date(bamboo.planted)) / (1000 * 60 * 60 * 24)) + 1}/15 
                        ({bamboo.totalWaterings || 0}/{(Math.floor((new Date() - new Date(bamboo.planted)) / (1000 * 60 * 60 * 24)) + 1) * 3} waters)
                      </p>
                    </div>
                  </div>

                  {/* Growth Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Growth</span>
                      <span>{bamboo.growth}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${bamboo.growth}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className={`w-full ${
                        canWaterBamboo(bamboo) && !isPlayingVideo
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWaterBamboo(bamboo.id)
                      }}
                      disabled={!canWaterBamboo(bamboo) || isPlayingVideo}
                    >
                      <Droplets className="w-4 h-4 mr-2" />
                      {isPlayingVideo && videoForBamboo === bamboo.id
                        ? 'Watering...'
                        : canWaterBamboo(bamboo) 
                          ? `Water (helps growth)` 
                          : 'Daily limit reached'
                      }
                    </Button>
                    {bamboo.growth === 100 && (
                      <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600">
                        <Award className="w-4 h-4 mr-2" />
                        Harvest
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 6 - bambooGarden.length) }).map((_, index) => (
            <Card 
              key={`empty-${index}`}
              className={`border-dashed border-2 transition-colors ${
                canPlantNewBamboo() 
                  ? 'border-gray-300 cursor-pointer hover:border-green-400' 
                  : 'border-gray-200 cursor-not-allowed opacity-50'
              }`}
              onClick={() => canPlantNewBamboo() && setPlantingMode(true)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                  <div className={`w-12 h-12 border-2 border-dashed rounded-full flex items-center justify-center ${
                    canPlantNewBamboo() ? 'border-gray-400' : 'border-gray-300'
                  }`}>
                    {canPlantNewBamboo() ? (
                      <Leaf className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                </div>
                <p className={canPlantNewBamboo() ? 'text-gray-500' : 'text-gray-400'}>
                  {canPlantNewBamboo() 
                    ? 'Plant New Bamboo' 
                    : `Wait ${getDaysUntilNextPlant()} days`
                  }
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Garden Background */}
        <div 
          className="fixed inset-0 -z-10 opacity-10"
          style={{
            backgroundImage: 'url(/asset/bamboo.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>
    </div>
  )
}

export default BambooGarden
