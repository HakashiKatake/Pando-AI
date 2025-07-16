'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !classroom.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent className="p-0">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Classroom Not Found</h2>
            <p className="text-gray-600 mb-4">
              The classroom you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Link href="/org/dashboard">
              <Button className="w-full">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Classroom Updated!</h1>
                <p className="text-gray-600">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/org/classroom/${params.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Classroom
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Classroom</h1>
                <p className="text-gray-600 mt-1">Update your classroom information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={deleteClassroom}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Classroom
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Classroom Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classroom Name *
                    </label>
                    <Input
                      value={classroom.name}
                      onChange={(e) => setClassroom(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Psychology 101"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      value={classroom.subject}
                      onChange={(e) => setClassroom(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Psychology"
                      required
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                    value={classroom.description}
                    onChange={(e) => setClassroom(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your classroom and what students can expect..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{classroom.description.length}/500 characters</p>
                </div>

                {/* Classroom Code (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classroom Code
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-mono font-bold text-gray-900">
                        {classroom.code}
                      </code>
                      <span className="text-sm text-gray-500">Share this code with students to join</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Classroom codes cannot be changed. If you need a new code, you'll need to create a new classroom.
                  </p>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Changes will be visible to all students in this classroom</li>
                    <li>• The classroom code cannot be modified</li>
                    <li>• Student data and reports will remain unchanged</li>
                    <li>• All updates are saved automatically</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Link href={`/org/classroom/${params.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={saving || !classroom.name.trim() || !classroom.subject.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
