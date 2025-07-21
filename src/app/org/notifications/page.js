'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Heart,
  MessageSquare,
  Settings,
  X,
  Filter,
  Search,
  MoreVertical,
  Mark as MarkIcon,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, urgent, wellness
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, searchTerm]);

  const loadNotifications = async () => {
    try {
      // For demo, create mock notifications
      const mockNotifications = [
        {
          id: '1',
          type: 'urgent',
          title: 'Crisis Alert: Student Needs Immediate Attention',
          message: 'Michael Chen in Social Psychology has reported severe anxiety and requested immediate support.',
          studentName: 'Michael Chen',
          classroomName: 'Social Psychology',
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          actionRequired: true,
          severity: 'high'
        },
        {
          id: '2',
          type: 'wellness',
          title: 'Weekly Wellness Report Available',
          message: 'Your weekly wellness report for Psychology 101 is ready for review.',
          classroomName: 'Psychology 101',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          actionRequired: false,
          severity: 'low'
        },
        {
          id: '3',
          type: 'student',
          title: 'New Student Joined Classroom',
          message: 'Sarah Wilson has joined your Psychology 101 classroom.',
          studentName: 'Sarah Wilson',
          classroomName: 'Psychology 101',
          isRead: true,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          actionRequired: false,
          severity: 'low'
        },
        {
          id: '4',
          type: 'system',
          title: 'Monthly Backup Completed',
          message: 'All student data and reports have been successfully backed up.',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          actionRequired: false,
          severity: 'low'
        },
        {
          id: '5',
          type: 'wellness',
          title: 'Wellness Trend Alert',
          message: 'Average wellness scores in Developmental Psychology have decreased by 15% this week.',
          classroomName: 'Developmental Psychology',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          actionRequired: true,
          severity: 'medium'
        },
        {
          id: '6',
          type: 'reminder',
          title: 'Schedule Wellness Check-ins',
          message: 'It\'s time to schedule this week\'s wellness check-ins for your students.',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          actionRequired: true,
          severity: 'medium'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by type
    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.isRead);
      } else if (filter === 'urgent') {
        filtered = filtered.filter(n => n.severity === 'high' || n.type === 'urgent');
      } else {
        filtered = filtered.filter(n => n.type === filter);
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.studentName && n.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (n.classroomName && n.classroomName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNotifications(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />;
      case 'wellness': return <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />;
      case 'student': return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
      case 'system': return <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
      case 'reminder': return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />;
      default: return <Bell className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6E55A0' }} />;
    }
  };

  const getNotificationBadge = (type, severity) => {
    if (type === 'urgent' || severity === 'high') {
      return <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>;
    }
    if (severity === 'medium') {
      return <Badge className="bg-orange-100 text-orange-800 text-xs">Important</Badge>;
    }
    return null;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.severity === 'high' || n.type === 'urgent').length;

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
                    Notifications
                  </h1>
                  <p className="mt-1 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                    Stay updated with student wellness alerts and system notifications
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="border-2 transition-all duration-200 text-xs sm:text-sm"
                  style={{ 
                    borderColor: '#E3DEF1',
                    color: '#8A6FBF'
                  }}
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Mark All Read</span>
                  <span className="sm:hidden">Mark All</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadNotifications}
                  className="border-2 transition-all duration-200 text-xs sm:text-sm"
                  style={{ 
                    borderColor: '#E3DEF1',
                    color: '#8A6FBF'
                  }}
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Sync</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: '#8A6FBF' }}>
                      Total Notifications
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      {notifications.length}
                    </p>
                  </div>
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#6E55A0' }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: '#8A6FBF' }}>
                      Unread
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{unreadCount}</p>
                  </div>
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: '#8A6FBF' }}>
                      Urgent
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">{urgentCount}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters - MOBILE RESPONSIVE */}
        <motion.div variants={itemVariants}>
          <Card className="mb-4 sm:mb-6 border-2" style={{ borderColor: '#E3DEF1' }}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#8A6FBF' }} />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-4 py-2 border-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#6E55A0'
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'unread', 'urgent', 'wellness', 'student', 'system'].map((filterOption) => (
                    <motion.div
                      key={filterOption}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={filter === filterOption ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(filterOption)}
                        className={filter === filterOption 
                          ? 'transition-all duration-200 text-xs sm:text-sm'
                          : 'border-2 transition-all duration-200 text-xs sm:text-sm'
                        }
                        style={filter === filterOption 
                          ? { background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)' }
                          : { borderColor: '#E3DEF1', color: '#8A6FBF' }
                        }
                      >
                        {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications List - MOBILE RESPONSIVE */}
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                    <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: '#6E55A0' }}>
                      No Notifications
                    </h3>
                    <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                      {filter === 'all' ? 'You have no notifications at this time.' : `No ${filter} notifications found.`}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`hover:shadow-md transition-shadow border-2 ${
                      !notification.isRead 
                        ? 'border-l-4 border-l-purple-600' 
                        : ''
                    }`}
                    style={{ 
                      borderColor: '#E3DEF1',
                      backgroundColor: !notification.isRead ? '#F7F5FA' : 'white'
                    }}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className={`text-sm sm:text-lg font-semibold break-words ${
                                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                }`} style={{ color: !notification.isRead ? '#6E55A0' : '#8A6FBF' }}>
                                  {notification.title}
                                </h3>
                                {getNotificationBadge(notification.type, notification.severity)}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6E55A0' }} />
                                )}
                              </div>
                              
                              <p className="text-sm sm:text-base mb-3 break-words" style={{ color: '#8A6FBF' }}>
                                {notification.message}
                              </p>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                                <span>{formatTimeAgo(notification.createdAt)}</span>
                                {notification.studentName && (
                                  <span className="break-words">Student: {notification.studentName}</span>
                                )}
                                {notification.classroomName && (
                                  <span className="break-words">Classroom: {notification.classroomName}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.isRead && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markAsRead(notification.id)}
                                    className="border-2 transition-all duration-200 text-xs sm:text-sm"
                                    style={{ 
                                      borderColor: '#E3DEF1',
                                      color: '#8A6FBF'
                                    }}
                                  >
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    <span className="hidden sm:inline">Mark Read</span>
                                    <span className="sm:hidden">Read</span>
                                  </Button>
                                </motion.div>
                              )}
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-red-600 hover:bg-red-50 border-2 transition-all duration-200"
                                  style={{ borderColor: '#FCA5A5' }}
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                          
                          {notification.actionRequired && (
                            <div className="mt-4 p-3 border rounded-lg" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
                              <p className="text-sm font-medium" style={{ color: '#92400E' }}>Action Required</p>
                              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    size="sm" 
                                    className="transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
                                    style={{ 
                                      background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                                    }}
                                  >
                                    Take Action
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-2 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
                                    style={{ 
                                      borderColor: '#E3DEF1',
                                      color: '#8A6FBF'
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}