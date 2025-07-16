'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft,
  Settings,
  Bell,
  Shield,
  Users,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Building,
  Phone,
  MapPin,
  CheckCircle
} from 'lucide-react';

export default function OrganizationSettings() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState({
    organizationName: '',
    organizationEmail: '',
    organizationPhone: '',
    organizationAddress: '',
    website: '',
    description: '',
    
    // Notification settings
    emailNotifications: true,
    reportNotifications: true,
    wellnessAlerts: true,
    weeklyReports: true,
    
    // Privacy settings
    dataRetention: '2-years',
    anonymityLevel: 'high',
    reportVisibility: 'admin-only',
    
    // Theme settings
    primaryColor: '#7c3aed',
    theme: 'light',
    
    // Security settings
    twoFactorAuth: false,
    sessionTimeout: '4-hours',
    ipWhitelist: '',
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    // Load existing settings from API
    // For now, use mock data
    setSettings(prev => ({
      ...prev,
      organizationName: user?.firstName || 'Organization Name',
      organizationEmail: user?.emailAddresses?.[0]?.emailAddress || '',
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/org/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
                <p className="text-gray-600 mt-1">Manage your organization preferences and configuration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Settings saved!</span>
                </div>
              )}
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name *
                        </label>
                        <Input
                          value={settings.organizationName}
                          onChange={(e) => setSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                          placeholder="Your Organization Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email *
                        </label>
                        <Input
                          type="email"
                          value={settings.organizationEmail}
                          onChange={(e) => setSettings(prev => ({ ...prev, organizationEmail: e.target.value }))}
                          placeholder="contact@organization.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={settings.organizationPhone}
                          onChange={(e) => setSettings(prev => ({ ...prev, organizationPhone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <Input
                          type="url"
                          value={settings.website}
                          onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://www.organization.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <Input
                        value={settings.organizationAddress}
                        onChange={(e) => setSettings(prev => ({ ...prev, organizationAddress: e.target.value }))}
                        placeholder="123 Main St, City, State 12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={4}
                        value={settings.description}
                        onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your organization and its mission..."
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">{settings.description.length}/500 characters</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      {
                        key: 'emailNotifications',
                        label: 'Email Notifications',
                        description: 'Receive general updates and alerts via email'
                      },
                      {
                        key: 'reportNotifications',
                        label: 'Report Notifications',
                        description: 'Get notified immediately when new anonymous reports are submitted'
                      },
                      {
                        key: 'wellnessAlerts',
                        label: 'Wellness Alerts',
                        description: 'Receive alerts when students show concerning wellness patterns'
                      },
                      {
                        key: 'weeklyReports',
                        label: 'Weekly Reports',
                        description: 'Get weekly summary reports of classroom activity and wellness trends'
                      }
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{notification.label}</h4>
                          <p className="text-sm text-gray-600">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[notification.key]}
                            onChange={(e) => setSettings(prev => ({ ...prev, [notification.key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Privacy & Security Settings */}
            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Retention Period
                      </label>
                      <select
                        value={settings.dataRetention}
                        onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="1-year">1 Year</option>
                        <option value="2-years">2 Years</option>
                        <option value="3-years">3 Years</option>
                        <option value="5-years">5 Years</option>
                        <option value="indefinite">Indefinite</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Anonymity Level
                      </label>
                      <select
                        value={settings.anonymityLevel}
                        onChange={(e) => setSettings(prev => ({ ...prev, anonymityLevel: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="high">High - No identifying information stored</option>
                        <option value="medium">Medium - Limited metadata stored</option>
                        <option value="low">Low - Basic tracking for patterns</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Visibility
                      </label>
                      <select
                        value={settings.reportVisibility}
                        onChange={(e) => setSettings(prev => ({ ...prev, reportVisibility: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="admin-only">Admin Only</option>
                        <option value="teachers">Teachers & Admin</option>
                        <option value="counselors">Counselors, Teachers & Admin</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorAuth}
                          onChange={(e) => setSettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="1-hour">1 Hour</option>
                        <option value="4-hours">4 Hours</option>
                        <option value="8-hours">8 Hours</option>
                        <option value="24-hours">24 Hours</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Light', preview: 'bg-white border-2' },
                          { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-2' },
                          { value: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-white to-gray-900 border-2' }
                        ].map((theme) => (
                          <div
                            key={theme.value}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              settings.theme === theme.value
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSettings(prev => ({ ...prev, theme: theme.value }))}
                          >
                            <div className={`w-full h-8 rounded mb-2 ${theme.preview}`}></div>
                            <p className="text-sm font-medium text-center">{theme.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="grid grid-cols-6 gap-3">
                        {[
                          '#7c3aed', '#2563eb', '#059669', '#dc2626', 
                          '#ea580c', '#ca8a04', '#9333ea', '#0891b2'
                        ].map((color) => (
                          <div
                            key={color}
                            className={`w-12 h-12 rounded-lg cursor-pointer border-4 transition-all ${
                              settings.primaryColor === color
                                ? 'border-gray-400 scale-110'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSettings(prev => ({ ...prev, primaryColor: color }))}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
