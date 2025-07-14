'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Users, Copy, Check, ArrowRight, Plus, BookOpen, Calendar, Clock } from 'lucide-react';

export default function CreateClassroomPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [classroomData, setClassroomData] = useState({
    name: '',
    subject: '',
    description: '',
    gradeLevel: '',
    maxStudents: '',
  });
  const [createdClassroom, setCreatedClassroom] = useState(null);

  const handleInputChange = (field, value) => {
    setClassroomData(prev => ({ ...prev, [field]: value }));
  };

  const generateClassroomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateClassroom = async () => {
    setIsCreating(true);
    
    try {
      const classroomCode = generateClassroomCode();
      const token = await getToken();
      
      const response = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...classroomData,
          code: classroomCode,
          organizationId: user.id, // This will be the organization's user ID
          createdBy: user.id,
        }),
      });

      if (response.ok) {
        const classroom = await response.json();
        setCreatedClassroom(classroom);
      } else {
        console.error('Failed to create classroom');
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyClassroomCode = async () => {
    if (createdClassroom?.code) {
      await navigator.clipboard.writeText(createdClassroom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const goToDashboard = () => {
    router.push('/org/dashboard');
  };

  const isFormValid = () => {
    return classroomData.name && classroomData.subject;
  };

  if (createdClassroom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 text-center">
              <CardContent className="p-0 space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">Classroom Created!</h1>
                  <p className="text-gray-600">
                    Your classroom "{createdClassroom.name}" has been successfully created.
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-bold text-purple-900">Classroom Code</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-lg border border-purple-200">
                      <span className="text-2xl font-mono font-bold text-purple-700">
                        {createdClassroom.code}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyClassroomCode}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-purple-700">
                    Share this code with your students so they can join the classroom
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Next Steps:</h3>
                  <div className="grid gap-3 text-left">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Share the classroom code with students</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Students will sign up and join using the code</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Monitor student wellness from your dashboard</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setCreatedClassroom(null)}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Another Classroom
                  </Button>
                  <Button
                    onClick={goToDashboard}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your First{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Classroom
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Set up a classroom to start monitoring your students' wellness
          </p>
        </motion.div>

        <Card className="p-8">
          <CardContent className="p-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Users className="w-12 h-12 text-purple-600 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900">Classroom Details</h2>
                <p className="text-gray-600">Tell us about your classroom</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classroom Name *
                    </label>
                    <Input
                      placeholder="e.g., Psychology 101"
                      value={classroomData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      placeholder="e.g., Psychology"
                      value={classroomData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Brief description of the classroom..."
                    value={classroomData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Level
                    </label>
                    <Input
                      placeholder="e.g., 10th Grade"
                      value={classroomData.gradeLevel}
                      onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Students
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 30"
                      value={classroomData.maxStudents}
                      onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Students will receive a unique classroom code</li>
                    <li>• They'll use this code during signup to join your classroom</li>
                    <li>• You'll be able to monitor their wellness data and progress</li>
                    <li>• All student data remains anonymous and aggregated</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={handleCreateClassroom}
                disabled={!isFormValid() || isCreating}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    Creating Classroom...
                  </div>
                ) : (
                  <>
                    Create Classroom
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
