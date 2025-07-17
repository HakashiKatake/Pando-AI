"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Clock } from "lucide-react"

const Header = () => {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }))
      
      // Format date as "Jul 17 - Jul 31" (current date to end of month)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const startDateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endDateStr = endOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      setCurrentDate(`${startDateStr} - ${endDateStr}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.header 
      className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 fixed top-0 left-0 right-0 z-30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
            <span className="text-sm sm:text-lg">🐼</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <span>{currentDate}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{currentTime}</span>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <button className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm">
            SOS
          </button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
