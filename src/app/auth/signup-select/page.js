'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GraduationCap, Building, ArrowLeft, Users, User } from 'lucide-react';

export default function SignUpSelectPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null);

  const handleSelection = (type) => {
    setSelectedType(type);
    // Navigate to Clerk sign-up with the user type
    router.push(`/sign-up?type=${type}`);
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

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#F7F5FA' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header 
        className="border-b"
        style={{ backgroundColor: 'white', borderColor: '#E3DEF1' }}
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/">
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
                  Back to Home
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
                  Sign Up
                </h1>
                <p className="mt-1 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                  Choose your account type
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <motion.div
            className="text-center mb-6 sm:mb-8"
            variants={itemVariants}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#6E55A0' }}>
              Join{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{ 
                  background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)',
                  WebkitBackgroundClip: 'text'
                }}
              >
                PandoAI
              </span>
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: '#8A6FBF' }}>
              Choose how you'd like to get started with our mental wellness platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {/* Student/User Option */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleSelection('user')}
            >
              <Card 
                className="p-6 sm:p-8 text-center hover:shadow-xl transition-all duration-300 border-2 group"
                style={{ 
                  borderColor: '#E3DEF1'
                }}
              >
                <CardContent className="p-0 space-y-4 sm:space-y-6">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                    }}
                  >
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold transition-colors" style={{ color: '#6E55A0' }}>
                      Student / Individual
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#8A6FBF' }}>
                      Create your personal account to access wellness tools, AI companion, and join your school's classroom.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                    <div className="flex items-center justify-center gap-2">
                      <span>🎓</span>
                      <span>Personal wellness tracking</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span>💬</span>
                      <span>AI companion chat</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span>📚</span>
                      <span>Join classroom with code</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span>🆓</span>
                      <span>Free forever</span>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      className="w-full group-hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                      style={{ 
                        background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                      }}
                    >
                      Sign Up as Student
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Organization Option */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => handleSelection('organization')}
            >
              <Card 
                className="p-6 sm:p-8 text-center hover:shadow-xl transition-all duration-300 border-2 group"
                style={{ 
                  borderColor: '#E3DEF1'
                }}
              >
                <CardContent className="p-0 space-y-4 sm:space-y-6">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, #6E55A0 0%, #8A6FBF 100%)'
                    }}
                  >
                    <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold transition-colors" style={{ color: '#6E55A0' }}>
                      Organization / School
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#8A6FBF' }}>
                      Set up your institution's account to create classrooms, manage students, and access wellness analytics.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                    <div className="flex items-center justify-center gap-2">
                      <span>🏫</span>
                      <span>Create & manage classrooms</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span>📊</span>
                      <span>Student wellness analytics</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span>👥</span>
                      <span>Invite & monitor students</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span>🎯</span>
                      <span>Institutional insights</span>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      className="w-full group-hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                      style={{ 
                        background: 'linear-gradient(135deg, #6E55A0 0%, #8A6FBF 100%)'
                      }}
                    >
                      Sign Up as Organization
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-6 sm:mt-8"
          >
            <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
              Already have an account?{' '}
              <Link 
                href="/auth/signin-select" 
                className="font-medium hover:underline transition-all duration-200"
                style={{ color: '#6E55A0' }}
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}