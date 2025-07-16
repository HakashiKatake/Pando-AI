'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
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
  UserPlus
} from 'lucide-react';

export default function OrganizationDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    averageWellness: 0,
    alertCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

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
      const analyticsResponse = await fetch(`/api/org/analytics?organizationId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
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
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
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
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalStudents}</p>
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
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Students</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.activeStudents}</p>
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
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Wellness Score</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.averageWellness.toFixed(1)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
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
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Wellness Alerts</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.alertCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Classrooms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classrooms List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Classrooms</h2>
              <Link href="/org/create-classroom">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Classroom
                </Button>
              </Link>
            </div>

            {classrooms.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent className="p-0">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No classrooms yet</h3>
                  <p className="text-gray-600 mb-4">Create your first classroom to start monitoring student wellness</p>
                  <Link href="/org/create-classroom">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Classroom
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {classrooms.map((classroom, index) => (
                  <motion.div
                    key={classroom.id || classroom._id || `classroom-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                              <Badge variant="secondary">{classroom.subject}</Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{classroom.description}</p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{classroom.studentCount || 0} students</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Created {new Date(classroom.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">Classroom Code</p>
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {classroom.code}
                                </code>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => copyClassroomCode(classroom.code)}
                                  className="h-8 w-8"
                                >
                                  {copiedCode === classroom.code ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">New student joined</p>
                      <p className="text-gray-600">Psychology 101 • 2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Wellness alert</p>
                      <p className="text-gray-600">Student showing low mood • 4 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Increased chat activity</p>
                      <p className="text-gray-600">Mental Health 201 • 1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Analytics
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Students
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Review Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
