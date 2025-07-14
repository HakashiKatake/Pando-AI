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
  X
} from "lucide-react"
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

// Navigation items mapping from old to new
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, label: "Dashboard" },
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
  { icon: HelpCircle, label: "Support", href: "/support" },
]

const Navigation = () => {
  const { isSignedIn, user } = useUser()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isGuest, guestName } = useAppStore()

  // Don't show navigation on certain pages (same logic as old navigation)
  if (pathname === '/' || 
      pathname.startsWith('/sign-') || 
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/org/') ||
      pathname === '/questionnaire' ||
      pathname === '/classroom-code') {
    return null
  }

  const currentUser = user?.fullName || user?.firstName || guestName || 'HakashiKatake'
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'Guest Mode'

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white/80 backdrop-blur-sm border-gray-200"
          style={{ color: '#6E55A0' }}
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0',
        isCollapsed ? 'w-20' : 'w-64',
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
        <div className="p-6">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <Heart className="h-5 w-5" style={{ color: '#8A6FBF' }} />
              </div>
              <h1 className="text-xl font-semibold" style={{ color: '#6E55A0' }}>CalmConnect</h1>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex justify-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <Heart className="h-5 w-5" style={{ color: '#8A6FBF' }} />
              </div>
            </Link>
          )}
        </div>

        {/* User Profile Section */}
        {!isCollapsed && (
          <div className="px-4 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: '#F7F5FA' }}>
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback style={{ backgroundColor: '#8A6FBF', color: 'white' }}>
                  {currentUser.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#6E55A0' }}>
                  {currentUser}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  {!isSignedIn && (
                    <Badge variant="secondary" className="text-xs">
                      Guest
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-lg"
                      : "hover:bg-gray-50"
                  }`}
                  style={isActive ? { backgroundColor: '#8A6FBF' } : { color: '#6E55A0' }}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </div>

          {/* Bottom Navigation Items */}
          <div className="mt-8 space-y-2">
            {bottomSidebarItems.map((item, index) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                    isActive ? "text-white" : "hover:bg-gray-50"
                  }`}
                  style={isActive ? { backgroundColor: '#8A6FBF' } : { color: '#6E55A0' }}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom Profile & Sign Out */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {/* Sign Out Button */}
          {isSignedIn && (
            <SignOutButton redirectUrl="/">
              <button className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full text-left`}
                style={{ color: '#6E55A0' }}
                title={isCollapsed ? "Sign Out" : undefined}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>Sign Out</span>}
              </button>
            </SignOutButton>
          )}

          {/* Collapsed Profile */}
          {isCollapsed && (
            <div className="flex justify-center">
              <Avatar className="w-10 h-10 flex-shrink-0">
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
              <p className="text-sm font-medium" style={{ color: '#6E55A0' }}>{currentUser}</p>
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
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}

// Default export
export default Navigation