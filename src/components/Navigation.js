"use client"

import React, { useState } from "react"
import { useUser, SignOutButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/Badge"
import {
  MessageCircle,
  Gamepad2,
  Target,
  BookOpen,
  Music2,
  Activity,
  Bell,
  Settings,
  HelpCircle,
  Home,
  ChevronRight,
  ChevronLeft,
  Heart,
  User,
  LogOut,
  Calendar,
  BarChart3,
  Menu,
  X,
  Shield,
  TreePine
} from "lucide-react"
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'


// Navigation items mapping from old to new
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, label: "Dashboard" },
  { name: 'Bamboo Garden', href: '/bamboo-garden', icon: TreePine, label: "Bamboo Garden" },
  { name: 'Chat', href: '/chat', icon: MessageCircle, label: "Chat" },
  { name: 'Exercises', href: '/exercises', icon: Target, label: "Exercises" },
  { name: 'Games', href: '/games', icon: Gamepad2, label: "Games" },
  { name: 'Habits', href: '/habits', icon: Calendar, label: "Habits" },
  { name: 'Mood Music', href: '/mood', icon: Music2, label: "Mood Music" },
  { name: 'Journal', href: '/feedback', icon: BookOpen, label: "Journal" },
  { name: 'Insights', href: '/insights', icon: BarChart3, label: "Insights" },
]

const bottomSidebarItems = [
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Support", href: "/emergency" },
]

const Navigation = () => {
  const { isSignedIn, user } = useUser()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isGuest, preferences } = useAppStore()

  // Don't show navigation on certain pages (same logic as old navigation)
  if (pathname === '/' || 
      pathname.startsWith('/sign-') || 
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/org/') ||
      pathname === '/questionnaire' ||
      pathname === '/classroom-code') {
    return null
  }

  // Check if user is a student in a classroom
  const isStudentInClassroom = user?.unsafeMetadata?.userType === 'student' && user?.unsafeMetadata?.classroomId

  // Add reporting option for students in classrooms
  const getNavigationItems = () => {
    const baseItems = [...navigationItems]
    
    if (isStudentInClassroom) {
      // Insert anonymous reporting after chat
      const chatIndex = baseItems.findIndex(item => item.href === '/chat')
      if (chatIndex !== -1) {
        baseItems.splice(chatIndex + 1, 0, {
          name: 'Anonymous Report',
          href: '/report',
          icon: Shield,
          label: "Anonymous Report"
        })
      }
    }
    
    return baseItems
  }

  const currentNavigationItems = getNavigationItems()

  // Determine display name based on user type
  const currentUser = isSignedIn 
    ? (user?.fullName || user?.firstName || 'User')
    : (preferences?.name || 'Guest User')
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'Guest Mode'

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg"
          style={{ color: '#6E55A0' }}
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0',
        isCollapsed ? 'w-16 sm:w-20' : 'w-64 sm:w-72 lg:w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Collapse/Expand Button - Desktop only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
          style={{ color: '#6E55A0' }}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>

        {/* Logo and Header */}
        <div className={cn(
          'flex-shrink-0 border-b border-gray-100',
          isCollapsed ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
        )}>
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                <img src="/logo.svg" alt="Logo" className="w-7 h-7" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold truncate" style={{ color: '#6E55A0' }}>
                PandoAI
              </h1>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex justify-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <img src="/logo.svg" alt="Logo" className="w-7 h-7" />
              </div>
            </Link>
          )}
        </div>

        {/* User Profile Section */}
        {!isCollapsed && (
          <div className="flex-shrink-0 px-3 sm:px-4 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: '#F7F5FA' }}>
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback style={{ backgroundColor: '#8A6FBF', color: 'white' }}>
                  {currentUser.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: '#6E55A0' }}>
                  {currentUser}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  {!isSignedIn && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      Guest
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Main Navigation Items */}
          <nav className={cn(
            'px-3 sm:px-4 py-4',
            isCollapsed ? 'px-2' : ''
          )}>
            <div className="space-y-1 sm:space-y-2">
              {currentNavigationItems.map((item) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg transition-all duration-200 group',
                      isCollapsed ? 'justify-center p-2 sm:p-3' : 'space-x-3 px-3 py-2 sm:py-3',
                      isActive
                        ? "text-white shadow-lg"
                        : "hover:bg-gray-50"
                    )}
                    style={isActive ? { backgroundColor: '#8A6FBF' } : { color: '#6E55A0' }}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Bottom Navigation Items */}
            <div className="mt-6 sm:mt-8 space-y-1 sm:space-y-2 border-t border-gray-100 pt-4 sm:pt-6">
              {bottomSidebarItems.map((item, index) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg transition-all duration-200 group',
                      isCollapsed ? 'justify-center p-2 sm:p-3' : 'space-x-3 px-3 py-2 sm:py-3',
                      isActive ? "text-white" : "hover:bg-gray-50"
                    )}
                    style={isActive ? { backgroundColor: '#8A6FBF' } : { color: '#6E55A0' }}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Bottom Profile & Sign Out - Fixed at bottom */}
        <div className={cn(
          'flex-shrink-0 border-t border-gray-100 space-y-2',
          isCollapsed ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
        )}>
          {/* Sign Out Button */}
          {isSignedIn && (
            <SignOutButton redirectUrl="/">
              <button 
                className={cn(
                  'flex items-center rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors w-full text-left group',
                  isCollapsed ? 'justify-center p-2 sm:p-3' : 'space-x-3 px-3 py-2 sm:py-3'
                )}
                style={{ color: '#6E55A0' }}
                title={isCollapsed ? "Sign Out" : undefined}
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                {!isCollapsed && <span>Sign Out</span>}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    Sign Out
                  </div>
                )}
              </button>
            </SignOutButton>
          )}

          {/* Collapsed Profile */}
          {isCollapsed && (
            <div className="flex justify-center">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback style={{ backgroundColor: '#8A6FBF', color: 'white' }}>
                  {currentUser.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Expanded Welcome Message */}
          {!isCollapsed && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">Welcome back 👋</p>
              <p className="text-xs sm:text-sm font-medium truncate" style={{ color: '#6E55A0' }}>
                {currentUser}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

export function PageLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  
  // Full width for landing page, auth pages, onboarding, and org pages
  if (pathname === '/' || 
      pathname.startsWith('/sign-') || 
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/org/') ||
      pathname === '/questionnaire' ||
      pathname === '/classroom-code') {
    return children
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      <Navigation />
      <main className={cn(
        'transition-all duration-300 ease-in-out',
        'lg:pl-64', // Default expanded width
        'pl-0' // Mobile no padding
      )}>
        <div className="p-3 sm:p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}

// Default export
export default Navigation