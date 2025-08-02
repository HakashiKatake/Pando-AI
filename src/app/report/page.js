'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';


import { 
  Shield, 
  AlertTriangle, 
  Heart, 
  Users, 
  ArrowLeft, 
  Send,
  Lock,
  Eye,
  Calendar,
  MapPin,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

export default function AnonymousReportPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  // Animation variants for consistency
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [classroomInfo, setClassroomInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    reportType: '',
    title: '',
    description: '',
    severity: 'medium',
    location: '',
    incidentDate: '',
    witnessCount: '',
    isRecurring: false,
  });

  const reportTypes = [
    { value: 'bullying', label: 'Bullying', icon: '😢', description: 'Physical, verbal, or social bullying' },
    { value: 'harassment', label: 'Harassment', icon: '😟', description: 'Unwanted behavior that makes you uncomfortable' },
    { value: 'discrimination', label: 'Discrimination', icon: '⚖️', description: 'Unfair treatment based on identity' },
    { value: 'safety_concern', label: 'Safety Concern', icon: '⚠️', description: 'Physical safety issues or threats' },
    { value: 'mental_health', label: 'Mental Health', icon: '🧠', description: 'Mental health struggles or crisis' },
    { value: 'academic_pressure', label: 'Academic Pressure', icon: '📚', description: 'Overwhelming academic stress' },
    { value: 'other', label: 'Other', icon: '💬', description: 'Something else you need to report' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800', description: 'Minor issue, no immediate danger' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Concerning but not urgent' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', description: 'Serious issue requiring attention' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', description: 'Immediate action needed' },
  ];

  useEffect(() => {
    checkStudentAccess();
  }, [user]);

  const checkStudentAccess = async () => {
    if (!user) return;

    // Check if user is a student and has a classroom
    const userType = user.unsafeMetadata?.userType;
    const classroomId = user.unsafeMetadata?.classroomId;

    if (userType !== 'student' || !classroomId) {
      router.push('/dashboard');
      return;
    }

    // Get classroom info
    try {
      const token = await getToken();
      const response = await fetch(`/api/classrooms/verify?code=${user.unsafeMetadata?.classroomCode || ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setClassroomInfo(data.classroom);
        }
      }
    } catch (error) {
      console.error('Error fetching classroom info:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reportType || !formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.description.length < 10) {
      setError('Please provide more details in the description (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = await getToken();
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          classroomId: user.unsafeMetadata?.classroomId,
          witnessCount: formData.witnessCount ? parseInt(formData.witnessCount) : 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.unsafeMetadata?.userType !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-light">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl sm:rounded-3xl p-8 text-center max-w-md shadow-sm"
        >
          <Shield className="w-16 h-16 mx-auto mb-4 text-app-purple-light" />
          <h2 className="text-xl font-bold mb-2 text-app-purple">Access Restricted</h2>
          <p className="mb-4 text-app-purple-light">
            Anonymous reporting is only available to students who are part of a classroom.
          </p>
          <motion.button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(45deg, #6E55A0, #8A6FBF)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-app-light">
        <div className="w-full max-w-2xl bg-card rounded-2xl sm:rounded-3xl shadow-sm">
          <div className="p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(45deg, #22C55E, #16A34A)' }}>
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold" style={{ color: '#6E55A0' }}>Report Submitted</h1>
                <p style={{ color: '#8A6FBF' }}>
                  Your anonymous report has been successfully submitted to your teacher/organization.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-left">
                <h3 className="font-semibold text-green-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your teacher/organization will review your report</li>
                  <li>• They may take appropriate action based on the situation</li>
                  <li>• Your identity remains completely anonymous</li>
                  <li>• You can submit additional reports if needed</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Need immediate help?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  If this is an urgent situation requiring immediate attention:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => router.push('/emergency')}
                  >
                    Emergency Resources
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/chat')}
                  >
                    Talk to AI Support
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      reportType: '',
                      title: '',
                      description: '',
                      severity: 'medium',
                      location: '',
                      incidentDate: '',
                      witnessCount: '',
                      isRecurring: false,
                    });
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 transition-colors"
                  style={{ borderColor: '#8A6FBF', color: '#6E55A0' }}
                  whileHover={{ scale: 1.02, backgroundColor: '#F7F5FA' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit Another Report
                </motion.button>
                <motion.button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white"
                  style={{ background: 'linear-gradient(45deg, #6E55A0, #8A6FBF)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Dashboard
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="px-4 sm:px-6 pb-12">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12">
            {/* Panda Security Image */}
            <motion.div 
              className="mx-auto mb-6 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.img 
                src="/asset/panda-security.png" 
                alt="Panda Security - Safe Reporting"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </motion.div>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#6E55A0' }} />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: '#6E55A0' }}>
                Anonymous Reporting
              </h1>
            </div>
            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-6" style={{ color: '#8A6FBF' }}>
              Report issues safely and anonymously. Your identity will never be revealed, and your concerns will be addressed by your teacher/organization.
            </p>
            
            {classroomInfo && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#E3DEF1' }}>
                <Users className="w-4 h-4" style={{ color: '#6E55A0' }} />
                <span className="text-sm font-medium" style={{ color: '#6E55A0' }}>
                  Reporting to: {classroomInfo.name}
                </span>
              </div>
            )}
          </motion.div>

          {/* Privacy Notice */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-card rounded-2xl sm:rounded-3xl p-6 shadow-sm border-2 border-green-500" style={{ backgroundColor: '#F0FDF4' }}>
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 mt-1" style={{ color: '#16A34A' }} />
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: '#15803D' }}>Your Privacy is Protected</h3>
                  <ul className="text-sm space-y-1" style={{ color: '#166534' }}>
                    <li>• Your identity remains completely anonymous</li>
                    <li>• No personal information is stored with your report</li>
                    <li>• Only authorized teachers/staff can view reports</li>
                    <li>• Reports help create a safer environment for everyone</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Report Form */}
          <motion.div variants={itemVariants}>
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-sm">
              <div className="p-6 border-b border-border">
                <h2 className="flex items-center gap-2 text-xl font-bold" style={{ color: '#6E55A0' }}>
                  <MessageSquare className="w-5 h-5" />
                  Submit a Report
                </h2>
              </div>
              <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#6E55A0' }}>
                    What type of issue are you reporting? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.reportType === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={formData.reportType === type.value ? 
                          { borderColor: '#6E55A0', backgroundColor: '#E3DEF1' } : 
                          { borderColor: '#E5E7EB' }
                        }
                        onClick={() => handleInputChange('reportType', type.value)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <h4 className="font-medium" style={{ color: formData.reportType === type.value ? '#6E55A0' : '#374151' }}>{type.label}</h4>
                            <p className="text-xs" style={{ color: formData.reportType === type.value ? '#8A6FBF' : '#6B7280' }}>{type.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                    Brief Title *
                  </label>
                  <Input
                    placeholder="e.g., 'Bullying in the hallway' or 'Need help with stress'"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    maxLength={100}
                    required
                    className="rounded-xl border-2 focus:border-purple-500"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#8A6FBF' }}>{formData.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                    Detailed Description *
                  </label>
                  <textarea
                    className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    style={{ borderColor: '#E5E7EB' }}
                    rows={5}
                    placeholder="Please describe what happened, when it occurred, and any other relevant details. The more information you provide, the better we can help."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs mt-1" style={{ color: '#8A6FBF' }}>{formData.description.length}/1000 characters</p>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#6E55A0' }}>
                    How serious is this issue?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {severityLevels.map((level) => (
                      <div
                        key={level.value}
                        className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.severity === level.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={formData.severity === level.value ? 
                          { borderColor: '#6E55A0', backgroundColor: '#E3DEF1' } : 
                          { borderColor: '#E5E7EB' }
                        }
                        onClick={() => handleInputChange('severity', level.value)}
                      >
                        <div className="text-center">
                          <Badge className={`${level.color} mb-2`}>{level.label}</Badge>
                          <p className="text-xs text-gray-600">{level.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location (optional)
                    </label>
                    <Input
                      placeholder="e.g., Classroom 201, Cafeteria, Playground"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      maxLength={100}
                      className="rounded-xl border-2"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      When did this happen? (optional)
                    </label>
                    <Input
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="rounded-xl border-2"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                      <Eye className="w-4 h-4 inline mr-1" />
                      Number of witnesses (optional)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={formData.witnessCount}
                      onChange={(e) => handleInputChange('witnessCount', e.target.value)}
                      className="rounded-xl border-2"
                      style={{ borderColor: '#E5E7EB' }}
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-6">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm" style={{ color: '#6E55A0' }}>
                      This is a recurring/ongoing issue
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <motion.button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 transition-colors"
                    style={{ borderColor: '#8A6FBF', color: '#6E55A0' }}
                    whileHover={{ scale: 1.02, backgroundColor: '#F7F5FA' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !formData.reportType || !formData.title.trim() || !formData.description.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(45deg, #6E55A0, #8A6FBF)' }}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Report Anonymously
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
