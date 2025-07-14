'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GraduationCap, Building, ArrowLeft, Users, User } from 'lucide-react';
import Link from 'next/link';

export default function SignUpSelectPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null);

  const handleSelection = (type) => {
    setSelectedType(type);
    // Navigate to Clerk sign-up with the user type
    router.push(`/sign-up?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              CalmConnect
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to get started with our mental wellness platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Student/User Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => handleSelection('user')}
          >
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 group">
              <CardContent className="p-0 space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <User className="w-10 h-10 text-white" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    Student / Individual
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create your personal account to access wellness tools, AI companion, and join your school's classroom.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-500">
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

                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white group-hover:shadow-lg transition-all duration-300">
                  Sign Up as Student
                </Button>
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
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-300 group">
              <CardContent className="p-0 space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-10 h-10 text-white" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    Organization / School
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Set up your institution's account to create classrooms, manage students, and access wellness analytics.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-500">
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

                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white group-hover:shadow-lg transition-all duration-300">
                  Sign Up as Organization
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin-select" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
