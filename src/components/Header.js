"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Clock } from "lucide-react"
import Link from "next/link"

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
      className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-4 fixed top-0 left-0 right-0 z-30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between max-w-full">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
            <span className="text-sm sm:text-lg">🐼</span>
          </div>
        </div>

        {/* Right side content */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0 min-w-0">
          {/* Date - hidden on mobile and tablet, visible on large screens only */}
          <div className="hidden xl:flex items-center space-x-1 text-sm text-gray-500">
            <span className="truncate">{currentDate}</span>
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          </div>
          
          {/* Time */}
          <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap font-medium">{currentTime}</span>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 hidden sm:block" />
          </div>
          
          {/* SOS Button */}
          <Link href="/emergency">
            <button className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              SOS
            </button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
