'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
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

  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
        <Card className="p-6 sm:p-8 text-center max-w-md mx-4 border-2" style={{ borderColor: '#E3DEF1' }}>
          <CardContent className="p-0">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
            <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#6E55A0' }}>Classroom Not Found</h2>
            <p className="mb-4 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
              The classroom you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/org/dashboard">
              <Button 
                className="w-full"
                style={{ 
                  background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                }}
              >
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
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
                    Back
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
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold truncate" style={{ color: '#6E55A0' }}>
                      {classroom.name}
                    </h1>
                    <Badge 
                      variant="secondary"
                      className="text-xs sm:text-sm self-start sm:self-center"
                      style={{ backgroundColor: '#E3DEF1', color: '#6E55A0' }}
                    >
                      {classroom.subject}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm sm:text-base line-clamp-2" style={{ color: '#8A6FBF' }}>
                    {classroom.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Classroom Code</p>
                <div className="flex items-center gap-2">
                  <code 
                    className="px-2 py-1 sm:px-3 sm:py-1 rounded text-sm sm:text-lg font-mono font-bold"
                    style={{ backgroundColor: '#F7F5FA', color: '#6E55A0' }}
                  >
                    {classroom.code}
                  </code>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyClassroomCode}
                      className="border-2 transition-all duration-200 p-2"
                      style={{ 
                        borderColor: '#E3DEF1',
                        color: '#8A6FBF'
                      }}
                    >
                      {copiedCode ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </Button>
                  </motion.div>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href={`/org/classroom/${params.id}/edit`}>
                  <Button 
                    size="sm"
                    className="transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
                    style={{ 
                      background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                    }}
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Edit Classroom</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Analytics Cards - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Total Students</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.totalStudents}
                    </p>
                  </div>
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 self-center sm:self-auto mt-2 sm:mt-0" style={{ color: '#6E55A0' }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Active Students</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.activeStudents}
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 self-center sm:self-auto mt-2 sm:mt-0" style={{ color: '#6E55A0' }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Avg Wellness</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.averageWellness.toFixed(1)}
                    </p>
                  </div>
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 self-center sm:self-auto mt-2 sm:mt-0" style={{ color: '#6E55A0' }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Reports</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {analytics.totalReports}
                    </p>
                    {analytics.urgentReports > 0 && (
                      <Badge className="bg-red-100 text-red-800 mt-1 text-xs">
                        {analytics.urgentReports} urgent
                      </Badge>
                    )}
                  </div>
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 self-center sm:self-auto mt-2 sm:mt-0" style={{ color: '#6E55A0' }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs - MOBILE RESPONSIVE */}
        <motion.div className="mb-6" variants={itemVariants}>
          <div className="border-b overflow-x-auto" style={{ borderColor: '#E3DEF1' }}>
            <nav className="-mb-px flex space-x-4 sm:space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'reports', label: 'Reports', icon: Shield },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? '#8A6FBF' : 'transparent'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Recent Activity - MOBILE RESPONSIVE */}
            <motion.div variants={itemVariants}>
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { type: 'student_joined', time: '2 hours ago', description: 'New student joined the classroom' },
                      { type: 'wellness_check', time: '4 hours ago', description: '15 students completed wellness check-in' },
                      { type: 'report_submitted', time: '1 day ago', description: 'Anonymous report submitted' },
                      { type: 'exercise_completed', time: '2 days ago', description: '8 students completed breathing exercise' },
                    ].map((activity, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg"
                        style={{ backgroundColor: '#F7F5FA' }}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: '#8A6FBF' }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium line-clamp-2" style={{ color: '#6E55A0' }}>
                            {activity.description}
                          </p>
                          <p className="text-xs" style={{ color: '#8A6FBF' }}>{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Wellness Overview - MOBILE RESPONSIVE */}
            <motion.div variants={itemVariants}>
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>Wellness Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div>
                        <div className="text-lg sm:text-2xl font-bold text-green-600">85%</div>
                        <div className="text-xs" style={{ color: '#8A6FBF' }}>Good Mood</div>
                      </div>
                      <div>
                        <div className="text-lg sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>72%</div>
                        <div className="text-xs" style={{ color: '#8A6FBF' }}>Active Users</div>
                      </div>
                      <div>
                        <div className="text-lg sm:text-2xl font-bold" style={{ color: '#8A6FBF' }}>93%</div>
                        <div className="text-xs" style={{ color: '#8A6FBF' }}>Engagement</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Mood Check-ins</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ width: '85%', backgroundColor: '#22C55E' }}
                            ></div>
                          </div>
                          <span className="text-xs sm:text-sm font-medium" style={{ color: '#6E55A0' }}>85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Exercise Completion</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ width: '72%', backgroundColor: '#3B82F6' }}
                            ></div>
                          </div>
                          <span className="text-xs sm:text-sm font-medium" style={{ color: '#6E55A0' }}>72%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Chat Sessions</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ width: '68%', backgroundColor: '#8A6FBF' }}
                            ></div>
                          </div>
                          <span className="text-xs sm:text-sm font-medium" style={{ color: '#6E55A0' }}>68%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {activeTab === 'students' && (
          <motion.div variants={itemVariants}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                  Students ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {students.map((student, index) => (
                    <motion.div 
                      key={student.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-lg hover:shadow-md transition-all duration-300"
                      style={{ borderColor: '#E3DEF1' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div 
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#E3DEF1' }}
                        >
                          <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6E55A0' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate" style={{ color: '#6E55A0' }}>
                            {student.name}
                          </h4>
                          <p className="text-xs sm:text-sm truncate" style={{ color: '#8A6FBF' }}>
                            {student.email}
                          </p>
                          <p className="text-xs" style={{ color: '#8A6FBF' }}>
                            Joined {student.joinedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <Badge className={`${getWellnessColor(student.wellnessScore)} text-xs`}>
                            Wellness: {student.wellnessScore}/10
                          </Badge>
                          <p className="text-xs mt-1" style={{ color: '#8A6FBF' }}>
                            Last active: {student.lastActive.toLocaleDateString()}
                          </p>
                        </div>
                        
                        <Badge 
                          variant={student.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs self-start sm:self-center"
                          style={student.status === 'active' 
                            ? { backgroundColor: '#E3DEF1', color: '#6E55A0' }
                            : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                          }
                        >
                          {student.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div variants={itemVariants}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                    Anonymous Reports ({reports.length})
                  </CardTitle>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/org/reports">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-2 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#8A6FBF'
                        }}
                      >
                        View All Reports
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                    <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: '#6E55A0' }}>No Reports</h3>
                    <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                      No anonymous reports have been submitted for this classroom.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {reports.slice(0, 5).map((report, index) => (
                      <motion.div 
                        key={report._id} 
                        className="p-3 sm:p-4 border-2 rounded-lg"
                        style={{ borderColor: '#E3DEF1' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                            {report.title}
                          </h4>
                          <Badge className={`text-xs self-start sm:self-center ${
                            report.severity === 'urgent' ? 'bg-red-100 text-red-800' :
                            report.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.severity}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm mb-2 line-clamp-3" style={{ color: '#8A6FBF' }}>
                          {report.description.substring(0, 100)}...
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs" style={{ color: '#8A6FBF' }}>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          <Badge 
                            variant="secondary"
                            className="text-xs self-start sm:self-center"
                            style={{ backgroundColor: '#E3DEF1', color: '#6E55A0' }}
                          >
                            {report.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div variants={itemVariants}>
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>Wellness Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#6E55A0' }}>
                        {analytics.averageWellness.toFixed(1)}
                      </div>
                      <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>Average Wellness Score</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">12</div>
                        <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>High Wellness</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: '#FFFBEB' }}>
                        <div className="text-xl sm:text-2xl font-bold text-yellow-600">8</div>
                        <div className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Needs Support</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg" style={{ color: '#6E55A0' }}>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { label: 'Chat Sessions', value: 156, icon: MessageCircle },
                      { label: 'Mood Check-ins', value: 89, icon: Heart },
                      { label: 'Exercises Completed', value: 234, icon: Activity },
                      { label: 'Journal Entries', value: 67, icon: BookOpen },
                    ].map((item, index) => (
                      <motion.div 
                        key={item.label} 
                        className="flex items-center justify-between"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <item.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#8A6FBF' }} />
                          <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>{item.label}</span>
                        </div>
                        <span className="font-semibold text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                          {item.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </motion.div>
  );
}