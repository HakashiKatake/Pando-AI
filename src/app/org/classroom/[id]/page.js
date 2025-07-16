'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
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
  ArrowLeft, 
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
  Clock,
  MapPin,
  Star,
  Activity,
  Brain,
  Coffee
} from 'lucide-react';

export default function ClassroomDetailsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    averageWellness: 0,
    totalReports: 0,
    pendingReports: 0,
    urgentReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id && params.id) {
      loadClassroomData();
    }
  }, [user, params.id]);

  const loadClassroomData = async () => {
    try {
      const token = await getToken();
      
      // Load classroom details
      const classroomResponse = await fetch(`/api/classrooms/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (classroomResponse.ok) {
        const classroomData = await classroomResponse.json();
        setClassroom(classroomData);
        
        // Load students (mock data for now - in real app would come from API)
        const mockStudents = Array.from({ length: classroomData.studentCount || 0 }, (_, i) => ({
          id: `student-${i + 1}`,
          name: `Student ${i + 1}`,
          email: `student${i + 1}@school.edu`,
          joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          wellnessScore: Math.floor(Math.random() * 4) + 7, // 7-10
          status: Math.random() > 0.2 ? 'active' : 'inactive',
          recentActivities: [
            'Completed mood check-in',
            'Used breathing exercise',
            'Chat session completed',
          ].slice(0, Math.floor(Math.random() * 3) + 1)
        }));
        setStudents(mockStudents);
        
        // Load reports for this classroom
        const reportsResponse = await fetch(`/api/reports?classroomId=${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setReports(reportsData);
        }
        
        // Calculate analytics
        const activeStudents = mockStudents.filter(s => s.status === 'active').length;
        const averageWellness = mockStudents.reduce((sum, s) => sum + s.wellnessScore, 0) / mockStudents.length || 0;
        const pendingReports = reportsData?.filter(r => r.status === 'pending').length || 0;
        const urgentReports = reportsData?.filter(r => r.severity === 'urgent').length || 0;
        
        setAnalytics({
          totalStudents: mockStudents.length,
          activeStudents,
          averageWellness,
          totalReports: reportsData?.length || 0,
          pendingReports,
          urgentReports,
        });
      }
    } catch (error) {
      console.error('Error loading classroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyClassroomCode = async () => {
    if (classroom?.code) {
      await navigator.clipboard.writeText(classroom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getWellnessColor = (score) => {
    if (score >= 9) return 'text-green-600 bg-green-100';
    if (score >= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent className="p-0">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Classroom Not Found</h2>
            <p className="text-gray-600 mb-4">
              The classroom you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/org/dashboard">
              <Button className="w-full">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
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
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{classroom.name}</h1>
                  <Badge variant="secondary">{classroom.subject}</Badge>
                </div>
                <p className="text-gray-600 mt-1">{classroom.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Classroom Code</p>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 bg-gray-100 rounded text-lg font-mono font-bold">
                    {classroom.code}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyClassroomCode}
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Link href={`/org/classroom/${params.id}/edit`}>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Classroom
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.activeStudents}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Wellness</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.averageWellness.toFixed(1)}</p>
                </div>
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalReports}</p>
                  {analytics.urgentReports > 0 && (
                    <Badge className="bg-red-100 text-red-800 mt-1">
                      {analytics.urgentReports} urgent
                    </Badge>
                  )}
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'reports', label: 'Reports', icon: Shield },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'student_joined', time: '2 hours ago', description: 'New student joined the classroom' },
                    { type: 'wellness_check', time: '4 hours ago', description: '15 students completed wellness check-in' },
                    { type: 'report_submitted', time: '1 day ago', description: 'Anonymous report submitted' },
                    { type: 'exercise_completed', time: '2 days ago', description: '8 students completed breathing exercise' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wellness Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Wellness Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-xs text-gray-600">Good Mood</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">72%</div>
                      <div className="text-xs text-gray-600">Active Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">93%</div>
                      <div className="text-xs text-gray-600">Engagement</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mood Check-ins</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exercise Completion</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chat Sessions</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                        </div>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'students' && (
          <Card>
            <CardHeader>
              <CardTitle>Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined {student.joinedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={getWellnessColor(student.wellnessScore)}>
                          Wellness: {student.wellnessScore}/10
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Last active: {student.lastActive.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reports' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anonymous Reports ({reports.length})</CardTitle>
                <Link href="/org/reports">
                  <Button variant="outline" size="sm">
                    View All Reports
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports</h3>
                  <p className="text-gray-600">No anonymous reports have been submitted for this classroom.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <Badge className={
                          report.severity === 'urgent' ? 'bg-red-100 text-red-800' :
                          report.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {report.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.description.substring(0, 100)}...</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        <Badge variant="secondary">{report.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Wellness Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {analytics.averageWellness.toFixed(1)}
                    </div>
                    <p className="text-gray-600">Average Wellness Score</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <div className="text-sm text-gray-600">High Wellness</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">8</div>
                      <div className="text-sm text-gray-600">Needs Support</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Chat Sessions', value: 156, icon: MessageCircle, color: 'text-blue-600' },
                    { label: 'Mood Check-ins', value: 89, icon: Heart, color: 'text-red-600' },
                    { label: 'Exercises Completed', value: 234, icon: Activity, color: 'text-green-600' },
                    { label: 'Journal Entries', value: 67, icon: BookOpen, color: 'text-purple-600' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
