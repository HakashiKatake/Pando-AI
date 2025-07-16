'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Comprehensive insights into student wellness and engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Classroom:</span>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {classrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Overview Cards */}
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
                    <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalStudents}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+12% vs last period</span>
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
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Engagement Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.overview.engagementRate}%</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+5% vs last period</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
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
                    <p className="text-3xl font-bold text-gray-900">{analytics.overview.averageWellness}/10</p>
                    <div className="flex items-center mt-2">
                      <TrendingDown className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-yellow-600">-2% vs last period</span>
                    </div>
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
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.overview.responseTime}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">15% faster</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Student Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Student Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Student growth chart would be displayed here</p>
                  <p className="text-sm text-gray-500">Integration with chart library needed</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalStudents}</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.overview.activeStudents}</div>
                  <div className="text-sm text-gray-600">Active Students</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellness Score Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Wellness Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Wellness trends chart would be displayed here</p>
                  <p className="text-sm text-gray-500">Shows wellness score over time</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8.2</div>
                  <div className="text-sm text-gray-600">Highest</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">7.8</div>
                  <div className="text-sm text-gray-600">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">7.2</div>
                  <div className="text-sm text-gray-600">Lowest</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Chat Sessions', value: analytics.activities.chatSessions, icon: MessageCircle, color: 'text-blue-600' },
                  { label: 'Mood Check-ins', value: analytics.activities.moodCheckins, icon: Heart, color: 'text-red-600' },
                  { label: 'Breathing Exercises', value: analytics.activities.breathingExercises, icon: Activity, color: 'text-green-600' },
                  { label: 'Journal Entries', value: analytics.activities.journalEntries, icon: Eye, color: 'text-purple-600' },
                  { label: 'Support Requests', value: analytics.activities.supportRequests, icon: Shield, color: 'text-orange-600' }
                ].map((activity) => (
                  <div key={activity.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      <span className="text-sm text-gray-600">{activity.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{activity.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reports Analysis */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Reports Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reports by Type */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Reports by Type</h4>
                  <div className="space-y-3">
                    {analytics.reports.byType.map((report) => (
                      <div key={report.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{report.type}</span>
                          {report.urgent > 0 && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {report.urgent} urgent
                            </Badge>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{report.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Resolution Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Resolved</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.reports.resolution.resolved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">In Progress</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.reports.resolution.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Pending</span>
                      </div>
                      <span className="font-semibold text-gray-900">{analytics.reports.resolution.pending}</span>
                    </div>
                  </div>

                  {analytics.reports.resolution.pending > 0 && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">
                          {analytics.reports.resolution.pending} reports need attention
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link href="/org/reports">
                  <Button variant="outline" className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    View All Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
