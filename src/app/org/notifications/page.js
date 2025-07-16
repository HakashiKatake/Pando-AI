'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'wellness': return <Heart className="w-5 h-5 text-pink-600" />;
      case 'student': return <Users className="w-5 h-5 text-blue-600" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-600" />;
      case 'reminder': return <Clock className="w-5 h-5 text-orange-600" />;
      default: return <Bell className="w-5 h-5 text-purple-600" />;
    }
  };

  const getNotificationBadge = (type, severity) => {
    if (type === 'urgent' || severity === 'high') {
      return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
    }
    if (severity === 'medium') {
      return <Badge className="bg-orange-100 text-orange-800">Important</Badge>;
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
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">Stay updated with student wellness alerts and system notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                onClick={loadNotifications}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-3xl font-bold text-blue-600">{unreadCount}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-3xl font-bold text-red-600">{urgentCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {['all', 'unread', 'urgent', 'wellness', 'student', 'system'].map((filterOption) => (
                  <Button
                    key={filterOption}
                    variant={filter === filterOption ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterOption)}
                    className={filter === filterOption ? 'bg-purple-600 text-white' : ''}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? 'You have no notifications at this time.' : `No ${filter} notifications found.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`hover:shadow-md transition-shadow ${!notification.isRead ? 'border-l-4 border-l-purple-600 bg-purple-50/30' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h3>
                                {getNotificationBadge(notification.type, notification.severity)}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-purple-600 rounded-full" />
                                )}
                              </div>
                              
                              <p className="text-gray-700 mb-3">{notification.message}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{formatTimeAgo(notification.createdAt)}</span>
                                {notification.studentName && (
                                  <span>Student: {notification.studentName}</span>
                                )}
                                {notification.classroomName && (
                                  <span>Classroom: {notification.classroomName}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {notification.actionRequired && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800 font-medium">Action Required</p>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" className="bg-purple-600 text-white">
                                  Take Action
                                </Button>
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
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
    </div>
  );
}
