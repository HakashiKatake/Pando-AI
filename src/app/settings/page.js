'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAppStore, useMoodStore, useFeedbackStore, useExerciseStore } from '@/lib/store';
import { useDataInitialization } from '@/lib/useDataInitialization';


export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const { 
    guestName, 
    setGuestName, 
    preferences, 
    updatePreferences,
    clearAllData 
  } = useAppStore();
  
  const [localName, setLocalName] = useState(guestName || '');
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setLocalName(guestName || '');
    setLocalPreferences(preferences);
  }, [guestName, preferences]);

  const handleSaveProfile = () => {
    if (localName.trim()) {
      setGuestName(localName.trim());
    }
  };

  const handleSavePreferences = () => {
    updatePreferences(localPreferences);
  };

  const handleExportData = () => {
    const data = {
      profile: {
        name: user?.fullName || user?.firstName || guestName,
        email: user?.primaryEmailAddress?.emailAddress,
        isGuest: !user
      },
      preferences: preferences,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calmconnect-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllData = () => {
    clearAllData();
    setShowDeleteConfirm(false);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, preferences, and privacy settings
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">
                    {user?.fullName || user?.firstName || guestName || 'Guest User'}
                  </h3>
                  {!user && (
                    <Badge variant="secondary">Guest Mode</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress || 'No email address'}
                </p>
              </div>
            </div>

            {!user && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Display Name
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                    />
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    You're using guest mode. Your data is stored locally and will be lost if you clear your browser data.
                    Consider creating an account to sync your data across devices.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        theme === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Mood Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get reminded to check in with your mood
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localPreferences.notifications?.moodReminders ?? true}
                  onChange={(e) => 
                    setLocalPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        moodReminders: e.target.checked
                      }
                    }))
                  }
                  className="toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Exercise Suggestions</p>
                  <p className="text-sm text-muted-foreground">
                    Receive suggestions for wellness exercises
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localPreferences.notifications?.exerciseReminders ?? true}
                  onChange={(e) => 
                    setLocalPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        exerciseReminders: e.target.checked
                      }
                    }))
                  }
                  className="toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Get weekly summaries of your progress
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localPreferences.notifications?.weeklyInsights ?? true}
                  onChange={(e) => 
                    setLocalPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        weeklyInsights: e.target.checked
                      }
                    }))
                  }
                  className="toggle"
                />
              </div>
            </div>

            <Button onClick={handleSavePreferences} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Private Chat Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Keep conversations private by default
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localPreferences.privacy?.privateChatDefault ?? true}
                  onChange={(e) => 
                    setLocalPreferences(prev => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        privateChatDefault: e.target.checked
                      }
                    }))
                  }
                  className="toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage analytics to improve the service
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localPreferences.privacy?.allowAnalytics ?? false}
                  onChange={(e) => 
                    setLocalPreferences(prev => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        allowAnalytics: e.target.checked
                      }
                    }))
                  }
                  className="toggle"
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>

              <div className="space-y-2">
                {!showDeleteConfirm ? (
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Data
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">
                          Are you sure?
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This will permanently delete all your local data including mood entries, 
                        journal entries, and exercise sessions. This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAllData}
                        size="sm"
                      >
                        Yes, Delete Everything
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDeleteConfirm(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
