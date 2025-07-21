'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Shield,
  MessageCircle,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Filter,
  Eye,
  Clock,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function OrganizationAnalytics() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  
  const [analytics, setAnalytics] = useState({
    overview: {
      totalStudents: 245,
      activeStudents: 198,
      averageWellness: 7.8,
      totalReports: 23,
      engagementRate: 81,
      responseTime: '1.2 hours'
    },
    trends: {
      studentGrowth: [
        { month: 'Jan', students: 180, active: 145 },
        { month: 'Feb', students: 195, active: 156 },
        { month: 'Mar', students: 210, active: 168 },
        { month: 'Apr', students: 225, active: 182 },
        { month: 'May', students: 245, active: 198 }
      ],
      wellnessTrends: [
        { month: 'Jan', score: 7.2 },
        { month: 'Feb', score: 7.4 },
        { month: 'Mar', score: 7.6 },
        { month: 'Apr', score: 7.9 },
        { month: 'May', score: 7.8 }
      ]
    },
    activities: {
      chatSessions: 1250,
      moodCheckins: 890,
      breathingExercises: 650,
      journalEntries: 420,
      supportRequests: 89
    },
    reports: {
      byType: [
        { type: 'Bullying', count: 8, urgent: 2 },
        { type: 'Mental Health', count: 6, urgent: 3 },
        { type: 'Academic Pressure', count: 5, urgent: 1 },
        { type: 'Harassment', count: 3, urgent: 1 },
        { type: 'Other', count: 1, urgent: 0 }
      ],
      resolution: {
        resolved: 18,
        pending: 5,
        inProgress: 7
      }
    }
  });

  const [classrooms, setClassrooms] = useState([
    { id: 'all', name: 'All Classrooms', students: 245 },
    { id: '1', name: 'Psychology 101', students: 65 },
    { id: '2', name: 'Mental Health 201', students: 45 },
    { id: '3', name: 'Counseling Basics', students: 38 },
    { id: '4', name: 'Crisis Intervention', students: 42 },
    { id: '5', name: 'Group Therapy', students: 35 },
    { id: '6', name: 'Advanced Counseling', students: 20 }
  ]);

  useEffect(() => {
    loadAnalytics();
  }, [user, timeRange, selectedClassroom]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, fetch from API based on timeRange and selectedClassroom
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Generate CSV or PDF report
    console.log('Exporting analytics data...');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#8A6FBF' }}></div>
      </div>
    );
  }

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
                    Analytics Dashboard
                  </h1>
                  <p className="mt-1 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                    Comprehensive insights into student wellness and engagement
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportData}
                  className="border-2 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
                  style={{ 
                    borderColor: '#E3DEF1',
                    color: '#8A6FBF'
                  }}
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters - MOBILE RESPONSIVE */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#8A6FBF' }} />
            <span className="text-xs sm:text-sm font-medium" style={{ color: '#6E55A0' }}>Time Range:</span>
            <motion.select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border-2 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all duration-200 flex-1 sm:flex-none"
              style={{ 
                borderColor: '#E3DEF1',
                color: '#6E55A0'
              }}
              whileFocus={{ 
                borderColor: '#8A6FBF',
                boxShadow: '0 0 0 3px rgba(138, 111, 191, 0.1)'
              }}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </motion.select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#8A6FBF' }} />
            <span className="text-xs sm:text-sm font-medium" style={{ color: '#6E55A0' }}>Classroom:</span>
            <motion.select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="border-2 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all duration-200 flex-1 sm:flex-none"
              style={{ 
                borderColor: '#E3DEF1',
                color: '#6E55A0'
              }}
              whileFocus={{ 
                borderColor: '#8A6FBF',
                boxShadow: '0 0 0 3px rgba(138, 111, 191, 0.1)'
              }}
            >
              {classrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </motion.select>
          </div>
        </motion.div>

        {/* Overview Cards - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-3 sm:p-6 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Total Students</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.overview.totalStudents}
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                      <span className="text-xs sm:text-sm text-green-600">+12%</span>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center self-center sm:self-auto mt-2 sm:mt-0"
                    style={{ backgroundColor: '#E3DEF1' }}
                  >
                    <Users className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#6E55A0' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-3 sm:p-6 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Engagement Rate</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.overview.engagementRate}%
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                      <span className="text-xs sm:text-sm text-green-600">+5%</span>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center self-center sm:self-auto mt-2 sm:mt-0"
                    style={{ backgroundColor: '#E3DEF1' }}
                  >
                    <Activity className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#6E55A0' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-3 sm:p-6 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Avg Wellness</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.overview.averageWellness}/10
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1" />
                      <span className="text-xs sm:text-sm text-yellow-600">-2%</span>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center self-center sm:self-auto mt-2 sm:mt-0"
                    style={{ backgroundColor: '#E3DEF1' }}
                  >
                    <Heart className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#6E55A0' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-3 sm:p-6 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Response Time</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.overview.responseTime}
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                      <span className="text-xs sm:text-sm text-green-600">15% faster</span>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center self-center sm:self-auto mt-2 sm:mt-0"
                    style={{ backgroundColor: '#E3DEF1' }}
                  >
                    <Clock className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#6E55A0' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Student Growth Chart */}
          <motion.div variants={itemVariants}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                  Student Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="h-48 sm:h-64 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: '#F7F5FA' }}
                >
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                    <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                      Student growth chart would be displayed here
                    </p>
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                      Integration with chart library needed
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.overview.totalStudents}
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Total Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">
                      {analytics.overview.activeStudents}
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Active Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wellness Score Trends */}
          <motion.div variants={itemVariants}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                  Wellness Score Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="h-48 sm:h-64 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: '#F7F5FA' }}
                >
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                    <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                      Wellness trends chart would be displayed here
                    </p>
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                      Shows wellness score over time
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">8.2</div>
                    <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Highest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>7.8</div>
                    <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Current</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">7.2</div>
                    <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Lowest</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activity Summary and Reports - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Activity Summary */}
          <motion.div 
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: 'Chat Sessions', value: analytics.activities.chatSessions, icon: MessageCircle },
                    { label: 'Mood Check-ins', value: analytics.activities.moodCheckins, icon: Heart },
                    { label: 'Breathing Exercises', value: analytics.activities.breathingExercises, icon: Activity },
                    { label: 'Journal Entries', value: analytics.activities.journalEntries, icon: Eye },
                    { label: 'Support Requests', value: analytics.activities.supportRequests, icon: Shield }
                  ].map((activity, index) => (
                    <motion.div 
                      key={activity.label} 
                      className="flex items-center justify-between"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <activity.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#8A6FBF' }} />
                        <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>{activity.label}</span>
                      </div>
                      <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                        {activity.value.toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reports Analysis */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                  Reports Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Reports by Type */}
                  <div>
                    <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                      Reports by Type
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {analytics.reports.byType.map((report, index) => (
                        <motion.div 
                          key={report.type} 
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>{report.type}</span>
                            {report.urgent > 0 && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                {report.urgent} urgent
                              </Badge>
                            )}
                          </div>
                          <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                            {report.count}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Status */}
                  <div>
                    <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                      Resolution Status
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      <motion.div 
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Resolved</span>
                        </div>
                        <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                          {analytics.reports.resolution.resolved}
                        </span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>In Progress</span>
                        </div>
                        <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                          {analytics.reports.resolution.inProgress}
                        </span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Pending</span>
                        </div>
                        <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                          {analytics.reports.resolution.pending}
                        </span>
                      </motion.div>
                    </div>

                    {analytics.reports.resolution.pending > 0 && (
                      <motion.div 
                        className="mt-3 sm:mt-4 p-3 rounded-lg"
                        style={{ backgroundColor: '#FEF2F2' }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-red-900">
                            {analytics.reports.resolution.pending} reports need attention
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t" style={{ borderColor: '#E3DEF1' }}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/org/reports">
                      <Button 
                        variant="outline" 
                        className="w-full border-2 transition-all duration-200 text-xs sm:text-sm"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#8A6FBF'
                        }}
                      >
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View All Reports
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}