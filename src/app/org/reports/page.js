'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

  // Check if user has organization access by trying to load data
  const hasOrgAccess = reports.length > 0 || !loading;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent className="p-0">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-4">
              You need to be signed in to access this page.
            </p>
            <Link href="/auth/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getReportStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">Anonymous Reports</h1>
              </div>
              <p className="text-gray-600">Monitor and manage student reports across all classrooms</p>
            </div>
            <Link href="/org/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.urgent}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

        {/* Reports List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Reports ({filteredReports.length})
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600">
                    {reports.length === 0 
                      ? 'No anonymous reports have been submitted yet.'
                      : 'No reports match your current filters.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
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
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedReport?._id === report._id ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                            </div>
                            <div className="flex flex-col gap-1 ml-3">
                              <Badge className={severityConfig[report.severity]?.color}>
                                {severityConfig[report.severity]?.label}
                              </Badge>
                              <Badge className={statusConfig[report.status]?.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig[report.status]?.label}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <span>{reportTypeLabels[report.reportType]}</span>
                              {report.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location}
                                </span>
                              )}
                            </div>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Report Details */}
          <div className="lg:sticky lg:top-4">
            {selectedReport ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Report Details</span>
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
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedReport.title}</h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <p className="text-gray-900">{reportTypeLabels[selectedReport.reportType]}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Severity:</span>
                      <p className="text-gray-900">{severityConfig[selectedReport.severity]?.label}</p>
                    </div>
                    {selectedReport.location && (
                      <div>
                        <span className="font-medium text-gray-600">Location:</span>
                        <p className="text-gray-900">{selectedReport.location}</p>
                      </div>
                    )}
                    {selectedReport.incidentDate && (
                      <div>
                        <span className="font-medium text-gray-600">Incident Date:</span>
                        <p className="text-gray-900">{new Date(selectedReport.incidentDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedReport.witnessCount > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">Witnesses:</span>
                        <p className="text-gray-900">{selectedReport.witnessCount}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600">Recurring:</span>
                      <p className="text-gray-900">{selectedReport.isRecurring ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Submitted: {new Date(selectedReport.createdAt).toLocaleString()}</p>
                    {selectedReport.resolvedAt && (
                      <p>Resolved: {new Date(selectedReport.resolvedAt).toLocaleString()}</p>
                    )}
                  </div>

                  {selectedReport.adminNotes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1">Admin Notes</h5>
                      <p className="text-blue-800 text-sm">{selectedReport.adminNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReportStatus(selectedReport._id, 'under_review')}
                        disabled={updatingReport === selectedReport._id || selectedReport.status === 'under_review'}
                      >
                        {updatingReport === selectedReport._id ? '...' : 'Under Review'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReportStatus(selectedReport._id, 'resolved')}
                        disabled={updatingReport === selectedReport._id || selectedReport.status === 'resolved'}
                        className="text-green-700 border-green-300 hover:bg-green-50"
                      >
                        {updatingReport === selectedReport._id ? '...' : 'Mark Resolved'}
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateReportStatus(selectedReport._id, 'dismissed')}
                      disabled={updatingReport === selectedReport._id || selectedReport.status === 'dismissed'}
                      className="text-red-700 border-red-300 hover:bg-red-50"
                    >
                      {updatingReport === selectedReport._id ? '...' : 'Dismiss'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h3>
                  <p className="text-gray-600">
                    Click on a report from the list to view its details and take action.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
