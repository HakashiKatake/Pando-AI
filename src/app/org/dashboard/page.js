'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Copy, 
  Check,
  BarChart3,
  Heart,
  MessageCircle,
  Calendar,
  Settings,
  Eye,
  UserPlus,
  Shield,
  Activity,
  Brain,
  Coffee,
  Star,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  Bell
} from 'lucide-react';
import PandaLogo from '@/components/PandaLogo';

export default function OrganizationDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    averageWellness: 0,
    alertCount: 0,
    totalReports: 0,
    pendingReports: 0,
    totalActivities: 0,
    weeklyGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showClassroomMenu, setShowClassroomMenu] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      const token = await getToken();

      // Load classrooms
      const classroomsResponse = await fetch(`/api/classrooms?organizationId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (classroomsResponse.ok) {
        const classroomsData = await classroomsResponse.json();
        setClassrooms(classroomsData);
      }

      // Load analytics
      const analyticsResponse = await fetch(`/api/org/analytics?organizationId=${user.id}&timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      // Load recent activity (mock data for now)
      setRecentActivity([
        {
          id: 1,
          type: 'student_joined',
          title: 'New student joined',
          description: 'Student joined "Math 101" classroom',
          time: '2 hours ago',
          icon: UserPlus,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'report_submitted',
          title: 'Anonymous report submitted',
          description: 'High priority report in "Science 202"',
          time: '4 hours ago',
          icon: Shield,
          color: 'text-red-600'
        },
        {
          id: 3,
          type: 'wellness_check',
          title: 'Wellness check completed',
          description: '25 students completed mood check-in',
          time: '6 hours ago',
          icon: Heart,
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'exercise_completed',
          title: 'Breathing exercise',
          description: '15 students completed breathing exercise',
          time: '1 day ago',
          icon: Activity,
          color: 'text-blue-600'
        },
        {
          id: 5,
          type: 'chat_session',
          title: 'AI chat sessions',
          description: '8 students had supportive conversations',
          time: '1 day ago',
          icon: MessageCircle,
          color: 'text-indigo-600'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyClassroomCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getWellnessColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const deleteClassroom = async (classroomId) => {
    if (!confirm('Are you sure you want to delete this classroom? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`/api/classrooms/${classroomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setClassrooms(classrooms.filter(c => c._id !== classroomId));
        setShowClassroomMenu(null);
      } else {
        alert('Failed to delete classroom');
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
      alert('Failed to delete classroom');
    }
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
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                Organization Dashboard
              </h1>
              <p className="mt-1 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                Monitor student wellness and manage classrooms
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/org/notifications">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative border-2 transition-all duration-200 text-xs sm:text-sm"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#8A6FBF'
                    }}
                  >
                    <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Notifications</span>
                    <span className="sm:hidden">Alerts</span>
                    <span 
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-white text-xs rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      3
                    </span>
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/org/reports">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 transition-all duration-200 text-xs sm:text-sm"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#8A6FBF'
                    }}
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">View Reports</span>
                    <span className="sm:hidden">Reports</span>
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/org/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 transition-all duration-200 text-xs sm:text-sm"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#8A6FBF'
                    }}
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden lg:inline">Settings</span>
                    <span className="lg:hidden">Config</span>
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/org/create-classroom">
                  <Button 
                    size="sm"
                    className="transition-all duration-200 text-xs sm:text-sm"
                    style={{ 
                      background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                    }}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Create Classroom</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Time Range Selector - MOBILE RESPONSIVE */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"
          variants={itemVariants}
        >
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#6E55A0' }}>
            Dashboard Overview
          </h2>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ].map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={timeRange === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(option.value)}
                  className={timeRange === option.value 
                    ? 'transition-all duration-200 text-xs sm:text-sm whitespace-nowrap'
                    : 'border-2 transition-all duration-200 text-xs sm:text-sm whitespace-nowrap'
                  }
                  style={timeRange === option.value 
                    ? { background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)' }
                    : { borderColor: '#E3DEF1', color: '#8A6FBF' }
                  }
                >
                  {option.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Analytics Cards - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-3 sm:p-6 hover:shadow-lg transition-all duration-300 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Total Students</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.totalStudents}
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                      <span className="text-xs sm:text-sm text-green-600">+{analytics.weeklyGrowth}%</span>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center self-center sm:self-auto"
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
            <Card className="p-3 sm:p-6 hover:shadow-lg transition-all duration-300 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Active Students</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.activeStudents}
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                      <span className="text-xs sm:text-sm text-green-600">
                        {analytics.totalStudents > 0 ? Math.round((analytics.activeStudents / analytics.totalStudents) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center self-center sm:self-auto"
                    style={{ backgroundColor: '#E3DEF1' }}
                  >
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#6E55A0' }} />
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
            <Card className="p-3 sm:p-6 hover:shadow-lg transition-all duration-300 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Wellness Score</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.averageWellness}/10
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <PandaLogo/>
                      <span className="text-xs sm:text-sm ml-1" style={{ color: '#8A6FBF' }}>
                        {analytics.averageWellness >= 8 ? 'Excellent' : analytics.averageWellness >= 6 ? 'Good' : 'Needs attention'}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center self-center sm:self-auto"
                    style={{ backgroundColor: '#E3DEF1' }}
                  >
                    <PandaLogo/>
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
            <Card className="p-3 sm:p-6 hover:shadow-lg transition-all duration-300 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Reports</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.totalReports}
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      {analytics.pendingReports > 0 ? (
                        <>
                          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1" />
                          <span className="text-xs sm:text-sm text-red-600">{analytics.pendingReports} pending</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                          <span className="text-xs sm:text-sm text-green-600">All reviewed</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center self-center sm:self-auto"
                    style={{ backgroundColor: '#E3DEF1' }}
                  >
                    <Shield className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#6E55A0' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Classrooms List */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                    Your Classrooms ({classrooms.length})
                  </CardTitle>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/org/create-classroom">
                      <Button 
                        size="sm"
                        className="transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm"
                        style={{ 
                          background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                        }}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Add Classroom
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                {classrooms.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                    <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: '#6E55A0' }}>
                      No classrooms yet
                    </h3>
                    <p className="mb-4 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                      Create your first classroom to start monitoring student wellness.
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link href="/org/create-classroom">
                        <Button 
                          className="text-sm sm:text-base"
                          style={{ 
                            background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Classroom
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {classrooms.map((classroom, index) => (
                      <motion.div
                        key={classroom._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-3 sm:p-4 border-2 rounded-lg hover:shadow-md transition-all relative"
                        style={{ borderColor: '#E3DEF1' }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-sm sm:text-base truncate" style={{ color: '#6E55A0' }}>
                                {classroom.name}
                              </h3>
                              <Badge 
                                variant="secondary"
                                className="text-xs"
                                style={{ backgroundColor: '#E3DEF1', color: '#6E55A0' }}
                              >
                                {classroom.subject}
                              </Badge>
                              {classroom.studentCount > 0 && (
                                <Badge 
                                  className="text-xs"
                                  style={{ 
                                    backgroundColor: '#D1FAE5',
                                    color: '#065F46'
                                  }}
                                >
                                  {classroom.studentCount} students
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2" style={{ color: '#8A6FBF' }}>
                              {classroom.description}
                            </p>
                            
                            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
                              <div className="flex items-center gap-2">
                                <code 
                                  className="px-2 py-1 rounded text-xs sm:text-sm font-mono"
                                  style={{ backgroundColor: '#F7F5FA', color: '#6E55A0' }}
                                >
                                  {classroom.code}
                                </code>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyClassroomCode(classroom.code)}
                                    style={{ color: '#8A6FBF' }}
                                    className="p-1"
                                  >
                                    {copiedCode === classroom.code ? (
                                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                              
                              <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                                Created {new Date(classroom.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Link href={`/org/classroom/${classroom._id}`}>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-2 transition-all duration-200 text-xs sm:text-sm"
                                  style={{ 
                                    borderColor: '#E3DEF1',
                                    color: '#8A6FBF'
                                  }}
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">View Details</span>
                                  <span className="sm:hidden">View</span>
                                </Button>
                              </Link>
                            </motion.div>
                            
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowClassroomMenu(
                                  showClassroomMenu === classroom._id ? null : classroom._id
                                )}
                                style={{ color: '#8A6FBF' }}
                                className="p-1 sm:p-2"
                              >
                                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              
                              {showClassroomMenu === classroom._id && (
                                <motion.div 
                                  className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg z-10 border-2"
                                  style={{ borderColor: '#E3DEF1' }}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="py-1">
                                    <Link
                                      href={`/org/classroom/${classroom._id}/edit`}
                                      className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                                      style={{ color: '#8A6FBF' }}
                                    >
                                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                      Edit Classroom
                                    </Link>
                                    <button
                                      onClick={() => deleteClassroom(classroom._id)}
                                      className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-700 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                      Delete Classroom
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Sidebar - MOBILE RESPONSIVE */}
          <div className="space-y-4 sm:space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivity.map((activity) => (
                      <motion.div 
                        key={activity.id} 
                        className="flex items-start gap-2 sm:gap-3"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div 
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#E3DEF1' }}
                        >
                          <activity.icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#6E55A0' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium" style={{ color: '#6E55A0' }}>
                            {activity.title}
                          </p>
                          <p className="text-xs sm:text-sm line-clamp-2" style={{ color: '#8A6FBF' }}>
                            {activity.description}
                          </p>
                          <p className="text-xs mt-1" style={{ color: '#8A6FBF' }}>
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats - MOBILE RESPONSIVE */}
            <motion.div variants={itemVariants}>
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Total Activities</span>
                      <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                        {analytics.totalActivities}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Avg. Session Time</span>
                      <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>12 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Completion Rate</span>
                      <span className="font-semibold text-green-600 text-sm sm:text-base">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Response Time</span>
                      <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                        &lt; 2 hours
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions - MOBILE RESPONSIVE */}
            <motion.div variants={itemVariants}>
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/org/analytics">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-2 transition-all duration-200 text-xs sm:text-sm"
                          style={{ 
                            borderColor: '#E3DEF1',
                            color: '#8A6FBF'
                          }}
                        >
                          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">View Full Analytics</span>
                          <span className="sm:hidden">Analytics</span>
                        </Button>
                      </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/org/reports">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-2 transition-all duration-200 text-xs sm:text-sm"
                          style={{ 
                            borderColor: '#E3DEF1',
                            color: '#8A6FBF'
                          }}
                        >
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Review Reports</span>
                          <span className="sm:hidden">Reports</span>
                        </Button>
                      </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/org/create-classroom">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-2 transition-all duration-200 text-xs sm:text-sm"
                          style={{ 
                            borderColor: '#E3DEF1',
                            color: '#8A6FBF'
                          }}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="hidden sm:inline">Create Classroom</span>
                          <span className="sm:hidden">Create</span>
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}