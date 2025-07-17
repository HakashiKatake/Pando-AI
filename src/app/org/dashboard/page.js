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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor student wellness and manage classrooms</p>
            </div>
            <div className="flex gap-3">
              <Link href="/org/notifications">
                <Button
                  variant="outline"
                  className="relative border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>
              <Link href="/org/reports">
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </Link>
              <Link href="/org/settings">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/org/create-classroom">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Classroom
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <div className="flex gap-2">
            {[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ].map((option) => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(option.value)}
                className={timeRange === option.value ? 'bg-purple-600 text-white' : ''}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalStudents}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+{analytics.weeklyGrowth}% this week</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Students</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.activeStudents}</p>
                    <div className="flex items-center mt-2">
                      <Activity className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">
                        {analytics.totalStudents > 0 ? Math.round((analytics.activeStudents / analytics.totalStudents) * 100) : 0}% engagement
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Wellness Score</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.averageWellness}/10</p>
                    <div className="flex items-center mt-2">
                      <PandaLogo/>
                      <span className="text-sm text-purple-600">
                        {analytics.averageWellness >= 8 ? 'Excellent' : analytics.averageWellness >= 6 ? 'Good' : 'Needs attention'}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
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
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalReports}</p>
                    <div className="flex items-center mt-2">
                      {analytics.pendingReports > 0 ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm text-red-600">{analytics.pendingReports} pending</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">All reviewed</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classrooms List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Classrooms ({classrooms.length})</CardTitle>
                  <Link href="/org/create-classroom">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Classroom
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {classrooms.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No classrooms yet</h3>
                    <p className="text-gray-600 mb-4">Create your first classroom to start monitoring student wellness.</p>
                    <Link href="/org/create-classroom">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Classroom
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classrooms.map((classroom, index) => (
                      <motion.div
                        key={classroom._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-all relative"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
                              <Badge variant="secondary">{classroom.subject}</Badge>
                              {classroom.studentCount > 0 && (
                                <Badge className="bg-green-100 text-green-800">
                                  {classroom.studentCount} students
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{classroom.description}</p>
                            
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {classroom.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyClassroomCode(classroom.code)}
                                >
                                  {copiedCode === classroom.code ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                              
                              <div className="text-sm text-gray-500">
                                Created {new Date(classroom.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/org/classroom/${classroom._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowClassroomMenu(
                                  showClassroomMenu === classroom._id ? null : classroom._id
                                )}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                              
                              {showClassroomMenu === classroom._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                  <div className="py-1">
                                    <Link
                                      href={`/org/classroom/${classroom._id}/edit`}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Classroom
                                    </Link>
                                    <button
                                      onClick={() => deleteClassroom(classroom._id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Classroom
                                    </button>
                                  </div>
                                </div>
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
          </div>

          {/* Recent Activity Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.color.includes('green') ? 'bg-green-100' :
                        activity.color.includes('red') ? 'bg-red-100' :
                        activity.color.includes('purple') ? 'bg-purple-100' :
                        activity.color.includes('blue') ? 'bg-blue-100' :
                        'bg-indigo-100'
                      }`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Activities</span>
                    <span className="font-semibold">{analytics.totalActivities}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Session Time</span>
                    <span className="font-semibold">12 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold">&lt; 2 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/org/analytics">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </Link>
                  
                  <Link href="/org/reports">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Review Reports
                    </Button>
                  </Link>
                  
                  <Link href="/org/create-classroom">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Classroom
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
