'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
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
    primaryColor: '#8A6FBF',
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen"
      style={{ backgroundColor: '#F7F5FA' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - MOBILE RESPONSIVE */}
      <motion.header 
        className="border-b"
        style={{ backgroundColor: 'white', borderColor: '#E3DEF1' }}
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/org/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 transition-all duration-200 text-xs sm:text-sm"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#8A6FBF'
                    }}
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </motion.div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#E3DEF1' }}
                >
                  <Image
                    src="/logo.svg"
                    alt="PandoAI Logo"
                    width={20}
                    height={20}
                    className="sm:w-6 sm:h-6"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div 
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded"
                    style={{ backgroundColor: '#8A6FBF', display: 'none' }}
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                    Organization Settings
                  </h1>
                  <p className="mt-1 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                    Manage your organization preferences and configuration
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {saved && (
                <motion.div 
                  className="flex items-center gap-2 text-green-600"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Settings saved!</span>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full sm:w-auto transition-all duration-200 text-sm sm:text-base"
                  style={{ 
                    background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar - MOBILE RESPONSIVE */}
          <div className="lg:col-span-1">
            <motion.div variants={itemVariants}>
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardContent className="p-4 sm:p-6">
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm sm:text-base ${
                          activeTab === tab.id
                            ? 'text-white border'
                            : 'hover:bg-gray-100'
                        }`}
                        style={{
                          backgroundColor: activeTab === tab.id ? '#8A6FBF' : 'transparent',
                          borderColor: activeTab === tab.id ? '#6E55A0' : 'transparent',
                          color: activeTab === tab.id ? 'white' : '#8A6FBF'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </motion.button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content - MOBILE RESPONSIVE */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                      General Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Organization Name *
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            value={settings.organizationName}
                            onChange={(e) => setSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                            placeholder="Your Organization Name"
                            className="border-2 transition-all duration-200 text-sm sm:text-base"
                            style={{ 
                              borderColor: '#E3DEF1',
                              color: '#6E55A0'
                            }}
                          />
                        </motion.div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Contact Email *
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            type="email"
                            value={settings.organizationEmail}
                            onChange={(e) => setSettings(prev => ({ ...prev, organizationEmail: e.target.value }))}
                            placeholder="contact@organization.com"
                            className="border-2 transition-all duration-200 text-sm sm:text-base"
                            style={{ 
                              borderColor: '#E3DEF1',
                              color: '#6E55A0'
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Phone Number
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            type="tel"
                            value={settings.organizationPhone}
                            onChange={(e) => setSettings(prev => ({ ...prev, organizationPhone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                            className="border-2 transition-all duration-200 text-sm sm:text-base"
                            style={{ 
                              borderColor: '#E3DEF1',
                              color: '#6E55A0'
                            }}
                          />
                        </motion.div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Website
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            type="url"
                            value={settings.website}
                            onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://www.organization.com"
                            className="border-2 transition-all duration-200 text-sm sm:text-base"
                            style={{ 
                              borderColor: '#E3DEF1',
                              color: '#6E55A0'
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                        Address
                      </label>
                      <motion.div whileFocus={{ scale: 1.02 }}>
                        <Input
                          value={settings.organizationAddress}
                          onChange={(e) => setSettings(prev => ({ ...prev, organizationAddress: e.target.value }))}
                          placeholder="123 Main St, City, State 12345"
                          className="border-2 transition-all duration-200 text-sm sm:text-base"
                          style={{ 
                            borderColor: '#E3DEF1',
                            color: '#6E55A0'
                          }}
                        />
                      </motion.div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                        Description
                      </label>
                      <motion.textarea
                        className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-200 text-sm sm:text-base"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
                        rows={4}
                        value={settings.description}
                        onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your organization and its mission..."
                        maxLength={500}
                        whileFocus={{ 
                          borderColor: '#8A6FBF',
                          boxShadow: '0 0 0 3px rgba(138, 111, 191, 0.1)'
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: '#8A6FBF' }}>
                        {settings.description.length}/500 characters
                      </p>
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
                <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
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
                      <motion.div 
                        key={notification.key} 
                        className="flex items-center justify-between p-3 sm:p-4 border-2 rounded-lg"
                        style={{ borderColor: '#E3DEF1' }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                            {notification.label}
                          </h4>
                          <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                            {notification.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-3">
                          <input
                            type="checkbox"
                            checked={settings[notification.key]}
                            onChange={(e) => setSettings(prev => ({ ...prev, [notification.key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div 
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                            style={{
                              backgroundColor: settings[notification.key] ? '#8A6FBF' : '#E5E7EB'
                            }}
                          ></div>
                        </label>
                      </motion.div>
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
                className="space-y-4 sm:space-y-6"
              >
                <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                        Data Retention Period
                      </label>
                      <select
                        value={settings.dataRetention}
                        onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: e.target.value }))}
                        className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
                      >
                        <option value="1-year">1 Year</option>
                        <option value="2-years">2 Years</option>
                        <option value="3-years">3 Years</option>
                        <option value="5-years">5 Years</option>
                        <option value="indefinite">Indefinite</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                        Report Anonymity Level
                      </label>
                      <select
                        value={settings.anonymityLevel}
                        onChange={(e) => setSettings(prev => ({ ...prev, anonymityLevel: e.target.value }))}
                        className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
                      >
                        <option value="high">High - No identifying information stored</option>
                        <option value="medium">Medium - Limited metadata stored</option>
                        <option value="low">Low - Basic tracking for patterns</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                        Report Visibility
                      </label>
                      <select
                        value={settings.reportVisibility}
                        onChange={(e) => setSettings(prev => ({ ...prev, reportVisibility: e.target.value }))}
                        className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
                      >
                        <option value="admin-only">Admin Only</option>
                        <option value="teachers">Teachers & Admin</option>
                        <option value="counselors">Counselors, Teachers & Admin</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <motion.div 
                      className="flex items-center justify-between p-3 sm:p-4 border-2 rounded-lg"
                      style={{ borderColor: '#E3DEF1' }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                          Two-Factor Authentication
                        </h4>
                        <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-3">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorAuth}
                          onChange={(e) => setSettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div 
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            backgroundColor: settings.twoFactorAuth ? '#8A6FBF' : '#E5E7EB'
                          }}
                        ></div>
                      </label>
                    </motion.div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                        Session Timeout
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                        className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
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
                <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                      Appearance Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                        Theme
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Light', preview: 'bg-white border-2' },
                          { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-2' },
                          { value: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-white to-gray-900 border-2' }
                        ].map((theme) => (
                          <motion.div
                            key={theme.value}
                            className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              settings.theme === theme.value
                                ? 'border-purple-500'
                                : 'hover:border-gray-300'
                            }`}
                            style={{
                              borderColor: settings.theme === theme.value ? '#8A6FBF' : '#E3DEF1',
                              backgroundColor: settings.theme === theme.value ? '#F7F5FA' : 'white'
                            }}
                            onClick={() => setSettings(prev => ({ ...prev, theme: theme.value }))}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={`w-full h-6 sm:h-8 rounded mb-2 ${theme.preview}`}></div>
                            <p className="text-sm font-medium text-center" style={{ color: '#6E55A0' }}>
                              {theme.label}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                        Primary Color
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                        {[
                          '#8A6FBF', '#2563eb', '#059669', '#dc2626', 
                          '#ea580c', '#ca8a04', '#9333ea', '#0891b2'
                        ].map((color) => (
                          <motion.div
                            key={color}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer border-4 transition-all ${
                              settings.primaryColor === color
                                ? 'border-gray-400'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSettings(prev => ({ ...prev, primaryColor: color }))}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
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
    </motion.div>
  );
}