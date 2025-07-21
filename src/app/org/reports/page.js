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
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock, 
  Users, 
  MapPin, 
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Filter,
  Search,
  ChevronDown,
  FileText
} from 'lucide-react';

export default function ReportsManagementPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    reportType: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingReport, setUpdatingReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const reportTypeLabels = {
    bullying: 'Bullying',
    harassment: 'Harassment',
    discrimination: 'Discrimination',
    safety_concern: 'Safety Concern',
    mental_health: 'Mental Health',
    academic_pressure: 'Academic Pressure',
    other: 'Other',
  };

  const severityConfig = {
    low: { color: 'bg-green-100 text-green-800', label: 'Low' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
  };

  const statusConfig = {
    pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending', icon: Clock },
    under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review', icon: Eye },
    resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved', icon: CheckCircle },
    dismissed: { color: 'bg-red-100 text-red-800', label: 'Dismissed', icon: XCircle },
  };

  useEffect(() => {
    // Load reports if user exists - we'll let the API handle authorization
    if (user?.id) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/reports?organizationId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else if (response.status === 403) {
        // User doesn't have organization access
        console.error('Access denied - not an organization admin');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, status, adminNotes = '') => {
    setUpdatingReport(reportId);
    try {
      const token = await getToken();
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (response.ok) {
        const updatedReport = await response.json();
        setReports(prev => prev.map(report => 
          report._id === reportId ? updatedReport : report
        ));
        
        if (selectedReport?._id === reportId) {
          setSelectedReport(updatedReport);
        }
      }
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setUpdatingReport(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || report.status === filters.status;
    const matchesSeverity = filters.severity === 'all' || report.severity === filters.severity;
    const matchesType = filters.reportType === 'all' || report.reportType === filters.reportType;
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  const getReportStats = () => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const urgent = reports.filter(r => r.severity === 'urgent').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    
    return { total, pending, urgent, resolved };
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setShowDetails(true);
  };

  // Check if user has organization access by trying to load data
  const hasOrgAccess = reports.length > 0 || !loading;

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F7F5FA' }}>
        <Card className="p-6 sm:p-8 text-center max-w-md w-full border-2" style={{ borderColor: '#E3DEF1' }}>
          <CardContent className="p-0">
            <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
            <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#6E55A0' }}>Please Sign In</h2>
            <p className="mb-4 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
              You need to be signed in to access this page.
            </p>
            <Link href="/auth/signin">
              <Button 
                className="w-full"
                style={{ 
                  background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                }}
              >
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getReportStats();

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
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#6E55A0' }} />
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                      Anonymous Reports
                    </h1>
                  </div>
                  <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                    Monitor and manage student reports across all classrooms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Total Reports</p>
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#6E55A0' }}>{stats.total}</p>
                  </div>
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Pending</p>
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#6E55A0' }}>{stats.pending}</p>
                  </div>
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Urgent</p>
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#6E55A0' }}>{stats.urgent}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>Resolved</p>
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#6E55A0' }}>{stats.resolved}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search - MOBILE RESPONSIVE */}
        <motion.div variants={itemVariants}>
          <Card className="mb-4 sm:mb-6 border-2" style={{ borderColor: '#E3DEF1' }}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#8A6FBF' }} />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#6E55A0'
                    }}
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#6E55A0'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>

                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="px-3 py-2 border-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#6E55A0'
                    }}
                  >
                    <option value="all">All Severity</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    value={filters.reportType}
                    onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
                    className="px-3 py-2 border-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#6E55A0'
                    }}
                  >
                    <option value="all">All Types</option>
                    {Object.entries(reportTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile Details Modal */}
        {showDetails && selectedReport && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowDetails(false)}
          >
            <motion.div 
              className="bg-white w-full max-w-md rounded-t-lg sm:rounded-lg max-h-[90vh] overflow-y-auto"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b" style={{ borderColor: '#E3DEF1' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold" style={{ color: '#6E55A0' }}>Report Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                    style={{ color: '#8A6FBF' }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <ReportDetails 
                  report={selectedReport} 
                  updateReportStatus={updateReportStatus}
                  updatingReport={updatingReport}
                  reportTypeLabels={reportTypeLabels}
                  severityConfig={severityConfig}
                  statusConfig={statusConfig}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reports List and Details - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold" style={{ color: '#6E55A0' }}>
              Reports ({filteredReports.length})
            </h2>
            
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 sm:h-32 rounded-lg" style={{ backgroundColor: '#E3DEF1' }}></div>
                  </div>
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardContent className="p-6 sm:p-8 text-center">
                  <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                  <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: '#6E55A0' }}>
                    No reports found
                  </h3>
                  <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                    {reports.length === 0 
                      ? 'No anonymous reports have been submitted yet.'
                      : 'No reports match your current filters.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-[600px] sm:max-h-[800px] overflow-y-auto">
                {filteredReports.map((report) => {
                  const StatusIcon = statusConfig[report.status]?.icon || Clock;
                  
                  return (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                          selectedReport?._id === report._id ? 'ring-2' : ''
                        }`}
                        style={{ 
                          borderColor: selectedReport?._id === report._id ? '#8A6FBF' : '#E3DEF1',
                          ringColor: '#8A6FBF'
                        }}
                        onClick={() => handleReportSelect(report)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1 text-sm sm:text-base truncate" style={{ color: '#6E55A0' }}>
                                {report.title}
                              </h3>
                              <p className="text-xs sm:text-sm line-clamp-2" style={{ color: '#8A6FBF' }}>
                                {report.description}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1 ml-3 flex-shrink-0">
                              <Badge className={`${severityConfig[report.severity]?.color} text-xs`}>
                                {severityConfig[report.severity]?.label}
                              </Badge>
                              <Badge className={`${statusConfig[report.status]?.color} text-xs`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">{statusConfig[report.status]?.label}</span>
                                <span className="sm:hidden">{statusConfig[report.status]?.label.split(' ')[0]}</span>
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs" style={{ color: '#8A6FBF' }}>
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <span className="truncate">{reportTypeLabels[report.reportType]}</span>
                              {report.location && (
                                <span className="hidden sm:flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location}
                                </span>
                              )}
                            </div>
                            <span className="flex-shrink-0">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Report Details - DESKTOP ONLY */}
          <div className="hidden lg:block lg:sticky lg:top-4">
            {selectedReport ? (
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span style={{ color: '#6E55A0' }}>Report Details</span>
                    <div className="flex gap-2">
                      <Badge className={severityConfig[selectedReport.severity]?.color}>
                        {severityConfig[selectedReport.severity]?.label}
                      </Badge>
                      <Badge className={statusConfig[selectedReport.status]?.color}>
                        {statusConfig[selectedReport.status]?.label}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportDetails 
                    report={selectedReport} 
                    updateReportStatus={updateReportStatus}
                    updatingReport={updatingReport}
                    reportTypeLabels={reportTypeLabels}
                    severityConfig={severityConfig}
                    statusConfig={statusConfig}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
                <CardContent className="p-6 sm:p-8 text-center">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                  <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: '#6E55A0' }}>
                    Select a Report
                  </h3>
                  <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                    Click on a report from the list to view its details and take action.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}

// Report Details Component
function ReportDetails({ report, updateReportStatus, updatingReport, reportTypeLabels, severityConfig, statusConfig }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2 text-sm sm:text-base" style={{ color: '#6E55A0' }}>
          {report.title}
        </h4>
        <p className="text-sm whitespace-pre-wrap" style={{ color: '#8A6FBF' }}>
          {report.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div>
          <span className="font-medium" style={{ color: '#8A6FBF' }}>Type:</span>
          <p style={{ color: '#6E55A0' }}>{reportTypeLabels[report.reportType]}</p>
        </div>
        <div>
          <span className="font-medium" style={{ color: '#8A6FBF' }}>Severity:</span>
          <p style={{ color: '#6E55A0' }}>{severityConfig[report.severity]?.label}</p>
        </div>
        {report.location && (
          <div>
            <span className="font-medium" style={{ color: '#8A6FBF' }}>Location:</span>
            <p style={{ color: '#6E55A0' }}>{report.location}</p>
          </div>
        )}
        {report.incidentDate && (
          <div>
            <span className="font-medium" style={{ color: '#8A6FBF' }}>Incident Date:</span>
            <p style={{ color: '#6E55A0' }}>{new Date(report.incidentDate).toLocaleDateString()}</p>
          </div>
        )}
        {report.witnessCount > 0 && (
          <div>
            <span className="font-medium" style={{ color: '#8A6FBF' }}>Witnesses:</span>
            <p style={{ color: '#6E55A0' }}>{report.witnessCount}</p>
          </div>
        )}
        <div>
          <span className="font-medium" style={{ color: '#8A6FBF' }}>Recurring:</span>
          <p style={{ color: '#6E55A0' }}>{report.isRecurring ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="text-xs" style={{ color: '#8A6FBF' }}>
        <p>Submitted: {new Date(report.createdAt).toLocaleString()}</p>
        {report.resolvedAt && (
          <p>Resolved: {new Date(report.resolvedAt).toLocaleString()}</p>
        )}
      </div>

      {report.adminNotes && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
          <h5 className="font-medium mb-1 text-sm" style={{ color: '#1E40AF' }}>Admin Notes</h5>
          <p className="text-sm" style={{ color: '#1D4ED8' }}>{report.adminNotes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t" style={{ borderColor: '#E3DEF1' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateReportStatus(report._id, 'under_review')}
              disabled={updatingReport === report._id || report.status === 'under_review'}
              className="w-full border-2 transition-all duration-200 text-xs sm:text-sm"
              style={{ 
                borderColor: '#E3DEF1',
                color: '#8A6FBF'
              }}
            >
              {updatingReport === report._id ? '...' : 'Under Review'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateReportStatus(report._id, 'resolved')}
              disabled={updatingReport === report._id || report.status === 'resolved'}
              className="w-full text-green-700 border-2 border-green-300 hover:bg-green-50 transition-all duration-200 text-xs sm:text-sm"
            >
              {updatingReport === report._id ? '...' : 'Mark Resolved'}
            </Button>
          </motion.div>
        </div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateReportStatus(report._id, 'dismissed')}
            disabled={updatingReport === report._id || report.status === 'dismissed'}
            className="w-full text-red-700 border-2 border-red-300 hover:bg-red-50 transition-all duration-200 text-xs sm:text-sm"
          >
            {updatingReport === report._id ? '...' : 'Dismiss'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}