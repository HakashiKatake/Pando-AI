'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Users, Copy, Check, ArrowRight, Plus, BookOpen, Calendar, Clock, ArrowLeft } from 'lucide-react';

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

  if (createdClassroom) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          background: 'linear-gradient(135deg, #F7F5FA 0%, #E3DEF1 50%, #F7F5FA 100%)'
        }}
      >
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 sm:p-8 text-center border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0 space-y-4 sm:space-y-6">
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                  }}
                >
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#6E55A0' }}>
                    Classroom Created!
                  </h1>
                  <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                    Your classroom "{createdClassroom.name}" has been successfully created.
                  </p>
                </div>

                <div 
                  className="p-4 sm:p-6 rounded-xl space-y-3 sm:space-y-4"
                  style={{ backgroundColor: '#F7F5FA' }}
                >
                  <h3 className="text-base sm:text-lg font-bold" style={{ color: '#6E55A0' }}>
                    Classroom Code
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <div 
                      className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg border-2"
                      style={{ backgroundColor: 'white', borderColor: '#E3DEF1' }}
                    >
                      <span className="text-xl sm:text-2xl font-mono font-bold" style={{ color: '#6E55A0' }}>
                        {createdClassroom.code}
                      </span>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyClassroomCode}
                        className="border-2 transition-all duration-200"
                        style={{ 
                          borderColor: '#E3DEF1',
                          color: '#8A6FBF'
                        }}
                      >
                        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </motion.div>
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                    Share this code with your students so they can join the classroom
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#6E55A0' }}>
                    Next Steps:
                  </h3>
                  <div className="grid gap-2 sm:gap-3 text-left">
                    <motion.div 
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: '#F7F5FA' }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6E55A0' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                        Share the classroom code with students
                      </span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: '#F7F5FA' }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6E55A0' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                        Students will sign up and join using the code
                      </span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: '#F7F5FA' }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6E55A0' }} />
                      <span className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                        Monitor student wellness from your dashboard
                      </span>
                    </motion.div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setCreatedClassroom(null)}
                      variant="outline"
                      className="w-full sm:w-auto border-2 transition-all duration-200 text-sm sm:text-base"
                      style={{ 
                        borderColor: '#E3DEF1',
                        color: '#8A6FBF'
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Another Classroom
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={goToDashboard}
                      className="w-full sm:w-auto transition-all duration-200 text-sm sm:text-base"
                      style={{ 
                        background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                      }}
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
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
          <div className="flex items-center gap-4">
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
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                  Create Classroom
                </h1>
                <p className="mt-1 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                  Set up a new classroom for your students
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <motion.div
            className="text-center mb-6 sm:mb-8"
            variants={itemVariants}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#6E55A0' }}>
              Create Your{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{ 
                  background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)',
                  WebkitBackgroundClip: 'text'
                }}
              >
                Classroom
              </span>
            </h2>
            <p className="text-base sm:text-lg" style={{ color: '#8A6FBF' }}>
              Set up a classroom to start monitoring your students' wellness
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 sm:p-8 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="text-center space-y-2">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" style={{ color: '#6E55A0' }} />
                    <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                      Classroom Details
                    </h3>
                    <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                      Tell us about your classroom
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Classroom Name *
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            placeholder="e.g., Psychology 101"
                            value={classroomData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
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
                            placeholder="e.g., Psychology"
                            value={classroomData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
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
                        rows={3}
                        placeholder="Brief description of the classroom..."
                        value={classroomData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        whileFocus={{ 
                          borderColor: '#8A6FBF',
                          boxShadow: '0 0 0 3px rgba(138, 111, 191, 0.1)'
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Grade Level
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            placeholder="e.g., 10th Grade"
                            value={classroomData.gradeLevel}
                            onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
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
                          Max Students
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            type="number"
                            placeholder="e.g., 30"
                            value={classroomData.maxStudents}
                            onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                            className="border-2 transition-all duration-200 text-sm sm:text-base"
                            style={{ 
                              borderColor: '#E3DEF1',
                              color: '#6E55A0'
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>

                    <div 
                      className="p-3 sm:p-4 rounded-lg"
                      style={{ backgroundColor: '#F0F9FF' }}
                    >
                      <h3 className="font-medium mb-2 text-sm sm:text-base" style={{ color: '#1E40AF' }}>
                        How it works:
                      </h3>
                      <ul className="text-xs sm:text-sm space-y-1" style={{ color: '#1D4ED8' }}>
                        <li>• Students will receive a unique classroom code</li>
                        <li>• They'll use this code during signup to join your classroom</li>
                        <li>• You'll be able to monitor their wellness data and progress</li>
                        <li>• All student data remains anonymous and aggregated</li>
                      </ul>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleCreateClassroom}
                      disabled={!isFormValid() || isCreating}
                      className="w-full transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                      style={{ 
                        background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                      }}
                    >
                      {isCreating ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Creating Classroom...</span>
                        </div>
                      ) : (
                        <>
                          Create Classroom
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}