'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft,
  Save,
  AlertTriangle,
  BookOpen,
  Users,
  Calendar,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';

export default function EditClassroomPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const [classroom, setClassroom] = useState({
    name: '',
    subject: '',
    description: '',
    code: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.id && params.id) {
      loadClassroom();
    }
  }, [user, params.id]);

  const loadClassroom = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/classrooms/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const classroomData = await response.json();
        setClassroom(classroomData);
      } else {
        setError('Classroom not found');
      }
    } catch (error) {
      console.error('Error loading classroom:', error);
      setError('Failed to load classroom');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!classroom.name.trim() || !classroom.subject.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = await getToken();
      const response = await fetch(`/api/classrooms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: classroom.name.trim(),
          subject: classroom.subject.trim(),
          description: classroom.description.trim(),
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push(`/org/classroom/${params.id}`);
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update classroom');
      }
    } catch (error) {
      console.error('Error updating classroom:', error);
      setError('Failed to update classroom. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteClassroom = async () => {
    if (!confirm('Are you sure you want to delete this classroom? This action cannot be undone and will remove all student data associated with it.')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`/api/classrooms/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/org/dashboard');
      } else {
        alert('Failed to delete classroom');
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
      alert('Failed to delete classroom');
    }
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

  if (error && !classroom.name) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F7F5FA' }}>
        <Card className="p-6 sm:p-8 text-center max-w-md w-full border-2" style={{ borderColor: '#E3DEF1' }}>
          <CardContent className="p-0">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
            <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#6E55A0' }}>Classroom Not Found</h2>
            <p className="mb-4 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
              The classroom you're trying to edit doesn't exist or you don't have permission to edit it.
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

  if (saved) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          background: 'linear-gradient(135deg, #F7F5FA 0%, #E3DEF1 50%, #F7F5FA 100%)'
        }}
      >
        <Card className="w-full max-w-2xl border-2" style={{ borderColor: '#E3DEF1' }}>
          <CardContent className="p-6 sm:p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 sm:space-y-6"
            >
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                }}
              >
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                  Classroom Updated!
                </h1>
                <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                  Your classroom has been successfully updated. Redirecting you to the classroom details...
                </p>
              </div>
            </motion.div>
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
                <Link href={`/org/classroom/${params.id}`}>
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
                    Back to Classroom
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
                    Edit Classroom
                  </h1>
                  <p className="mt-1 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                    Update your classroom information
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteClassroom}
                  className="border-2 transition-all duration-200 border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="hidden sm:inline">Delete Classroom</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div variants={itemVariants}>
          <Card className="border-2" style={{ borderColor: '#E3DEF1' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ color: '#6E55A0' }}>
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                Classroom Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {error && (
                  <motion.div 
                    className="p-3 border rounded-lg flex items-center gap-2"
                    style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                      Classroom Name *
                    </label>
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <Input
                        value={classroom.name}
                        onChange={(e) => setClassroom(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Psychology 101"
                        required
                        maxLength={100}
                        className="border-2 transition-all duration-200 text-sm sm:text-base"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
                      />
                    </motion.div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                      Subject *
                    </label>
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <Input
                        value={classroom.subject}
                        onChange={(e) => setClassroom(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g., Psychology"
                        required
                        maxLength={50}
                        className="border-2 transition-all duration-200 text-sm sm:text-base"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#6E55A0'
                        }}
                      />
                    </motion.div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                    Description
                  </label>
                  <motion.textarea
                    className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      borderColor: '#E3DEF1',
                      color: '#6E55A0'
                    }}
                    rows={4}
                    value={classroom.description}
                    onChange={(e) => setClassroom(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your classroom and what students can expect..."
                    maxLength={500}
                    whileFocus={{ 
                      borderColor: '#8A6FBF',
                      boxShadow: '0 0 0 3px rgba(138, 111, 191, 0.1)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#8A6FBF' }}>
                    {classroom.description.length}/500 characters
                  </p>
                </div>

                {/* Classroom Code (Read-only) - MOBILE RESPONSIVE */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                    Classroom Code
                  </label>
                  <div 
                    className="p-3 border-2 rounded-lg"
                    style={{ backgroundColor: '#F7F5FA', borderColor: '#E3DEF1' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <code className="text-base sm:text-lg font-mono font-bold" style={{ color: '#6E55A0' }}>
                        {classroom.code}
                      </code>
                      <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                        Share this code with students to join
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#8A6FBF' }}>
                    Classroom codes cannot be changed. If you need a new code, you'll need to create a new classroom.
                  </p>
                </div>

                {/* Additional Info - MOBILE RESPONSIVE */}
                <div 
                  className="p-3 sm:p-4 rounded-lg"
                  style={{ backgroundColor: '#F0F9FF' }}
                >
                  <h3 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: '#1E40AF' }}>
                    Important Notes
                  </h3>
                  <ul className="text-xs sm:text-sm space-y-1" style={{ color: '#1D4ED8' }}>
                    <li>• Changes will be visible to all students in this classroom</li>
                    <li>• The classroom code cannot be modified</li>
                    <li>• Student data and reports will remain unchanged</li>
                    <li>• All updates are saved automatically</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <motion.div 
                    className="flex-1"
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href={`/org/classroom/${params.id}`} className="block">
                      <Button 
                        variant="outline" 
                        className="w-full border-2 transition-all duration-200 text-sm sm:text-base"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#8A6FBF'
                        }}
                      >
                        Cancel
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div 
                    className="flex-1"
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={saving || !classroom.name.trim() || !classroom.subject.trim()}
                      className="w-full transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                      style={{ 
                        background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                      }}
                    >
                      {saving ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span className="text-sm sm:text-base">Saving...</span>
                        </div>
                      ) : (
                        <>
                          <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="text-sm sm:text-base">Save Changes</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </motion.div>
  );
}