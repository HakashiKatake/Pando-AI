'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { BookOpen, ArrowRight, Users, Check, X } from 'lucide-react';

export default function ClassroomCodePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [classroomCode, setClassroomCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [classroom, setClassroom] = useState(null);

  const handleCodeChange = (e) => {
    const code = e.target.value.toUpperCase();
    setClassroomCode(code);
    setError('');
  };

  const verifyClassroomCode = async () => {
    if (!classroomCode.trim()) {
      setError('Please enter a classroom code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const token = await getToken();
      
      const response = await fetch(`/api/classrooms/verify?code=${classroomCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.valid) {
        setClassroom(data.classroom);
      } else {
        setError('Invalid classroom code. Please check and try again.');
      }
    } catch (error) {
      console.error('Error verifying classroom code:', error);
      setError('Failed to verify classroom code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const joinClassroom = async () => {
    if (!classroom || !user) return;

    try {
      const token = await getToken();
      
      const response = await fetch('/api/classrooms/join', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          classroomId: classroom.id,
          studentId: user.id,
          studentEmail: user.primaryEmailAddress?.emailAddress,
        }),
      });

      if (response.ok) {
        // Store classroom info in user metadata
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            classroomId: classroom.id,
            classroomCode: classroom.code,
            userType: 'student',
          },
        });

        // Redirect to questionnaire
        router.push('/questionnaire');
      } else {
        setError('Failed to join classroom. Please try again.');
      }
    } catch (error) {
      console.error('Error joining classroom:', error);
      setError('Failed to join classroom. Please try again.');
    }
  };

  const skipClassroom = () => {
    // Store that user is not part of a classroom
    user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        userType: 'individual',
      },
    });
    
    // Redirect to questionnaire
    router.push('/questionnaire');
  };

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
            Join Your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Classroom
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Enter the classroom code provided by your teacher or organization to join your class.
          </p>
        </motion.div>

        <Card className="p-8">
          <CardContent className="p-0">
            {!classroom ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
                  <h2 className="text-2xl font-bold text-gray-900">Enter Classroom Code</h2>
                  <p className="text-gray-600">Your teacher will provide you with a unique code</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classroom Code
                    </label>
                    <Input
                      placeholder="Enter 6-character code (e.g., ABC123)"
                      value={classroomCode}
                      onChange={handleCodeChange}
                      maxLength={6}
                      className="text-center text-lg font-mono uppercase tracking-wider"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          verifyClassroomCode();
                        }
                      }}
                    />
                    {error && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {error}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={verifyClassroomCode}
                    disabled={isVerifying || !classroomCode.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="spinner"></div>
                        Verifying...
                      </div>
                    ) : (
                      <>
                        Verify Code
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-3">
                    Don't have a classroom code?
                  </p>
                  <Button
                    variant="outline"
                    onClick={skipClassroom}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Continue as Individual User
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Why join a classroom?</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Your teacher can provide additional support</li>
                    <li>• Access to classroom-specific resources</li>
                    <li>• Anonymous wellness monitoring for better care</li>
                    <li>• All your personal data remains private</li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Classroom Found!</h2>
                  <p className="text-gray-600">Ready to join this classroom?</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">{classroom.name}</h3>
                    <p className="text-gray-600">{classroom.subject}</p>
                    {classroom.description && (
                      <p className="text-gray-500 text-sm mt-2">{classroom.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{classroom.studentCount || 0} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Code: {classroom.code}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setClassroom(null)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Try Different Code
                  </Button>
                  <Button
                    onClick={joinClassroom}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Join Classroom
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Complete a quick wellness questionnaire</li>
                    <li>• Access your personal dashboard</li>
                    <li>• Start using wellness tools and chat with AI</li>
                    <li>• Your teacher can provide support when needed</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
