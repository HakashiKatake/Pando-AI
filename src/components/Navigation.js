'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  MessageCircle, 
  Heart, 
  Target, 
  Gamepad2,
  BarChart3,
  BookOpen,
  User,
  LogOut,
  Settings,
  Music2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Exercises', href: '/exercises', icon: Target },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Habits', href: '/habits', icon: Gamepad2 },
  { name: 'Mood Music', href: '/mood', icon: Music2 },
  { name: 'Journal', href: '/feedback', icon: BookOpen },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
];

export function Navigation() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isGuest, guestName } = useAppStore();

  // Don't show navigation on landing page, auth pages, or onboarding
  if (pathname === '/' || 
      pathname.startsWith('/sign-') || 
      pathname.startsWith('/auth/') ||
      pathname === '/questionnaire') {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-transform duration-200 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">CalmConnect</span>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.fullName || guestName || 'Guest User'}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress || 'Guest Mode'}
                  </p>
                  {!isSignedIn && (
                    <Badge variant="secondary" className="text-xs">
                      Guest
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-base font-semibold transition-all duration-200 shadow-sm',
                    isActive
                      ? 'bg-gradient-to-r from-[#e0c3fc] via-[#8ec5fc] to-[#f9d6e9] text-blue-900 ring-2 ring-blue-300 scale-105 shadow-lg'
                      : 'text-muted-foreground hover:text-blue-700 hover:bg-blue-100/60'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t space-y-2">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            
            {isSignedIn && (
              <SignOutButton redirectUrl="/">
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full text-left">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </SignOutButton>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export function PageLayout({ children }) {
  const pathname = usePathname();
  
  // Full width for landing page, auth pages, and onboarding
  if (pathname === '/' || 
      pathname.startsWith('/sign-') || 
      pathname.startsWith('/auth/') ||
      pathname === '/questionnaire') {
    return children;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
