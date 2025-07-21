'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Building, Users, GraduationCap, ArrowRight, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';

export default function OrganizationOnboardingPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    address: '',
    phone: '',
    contactEmail: user?.primaryEmailAddress?.emailAddress || '',
    studentCount: '',
    description: '',
  });

  // Update contact email when user loads
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setFormData(prev => ({
        ...prev,
        contactEmail: user.primaryEmailAddress.emailAddress
      }));
    }
  }, [user]);

  // Redirect if not loaded or not signed in
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
          <p style={{ color: '#8A6FBF' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/signup-select');
    return null;
  }

  const organizationTypes = [
    { value: 'school', label: 'K-12 School', icon: GraduationCap },
    { value: 'university', label: 'University/College', icon: Building },
    { value: 'clinic', label: 'Mental Health Clinic', icon: Users },
    { value: 'nonprofit', label: 'Non-Profit Organization', icon: Users },
    { value: 'other', label: 'Other', icon: Building },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('User not properly authenticated. Please try signing in again.');
      return;
    }

    setIsSubmitting(true)
    
    try {
      console.log('Submitting organization data:', formData);
      console.log('User ID:', user?.id);
      console.log('User email:', user?.primaryEmailAddress?.emailAddress);
      
      // Get the session token for authentication
      const token = await getToken();
      console.log('Got auth token:', token ? 'Token present' : 'No token');
      
      // Save organization data
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      console.log('Organization created successfully');
      // Update user metadata to mark as organization
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          userType: 'organization',
          organizationId: responseData._id || responseData.id,
          setupComplete: true,
        },
      });
      
      // Redirect to classroom creation
      router.push('/org/create-classroom');
    } catch (error) {
      console.error('Error creating organization:', error);
      alert(`Error creating organization: ${error.message}`);
      setIsSubmitting(false);
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.organizationName && formData.organizationType;
      case 2:
        return formData.address && formData.contactEmail;
      case 3:
        return true; // Description is optional
      default:
        return false;
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
                  Organization Setup
                </h1>
                <p className="mt-1 text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                  Let's get your organization profile ready
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
              Welcome to{' '}
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
            <p className="text-base sm:text-lg" style={{ color: '#8A6FBF' }}>
              Let's set up your organization profile to get started
            </p>
          </motion.div>

          {/* Progress Bar - MOBILE RESPONSIVE */}
          <motion.div className="mb-6 sm:mb-8" variants={itemVariants}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                Step {currentStep} of 3
              </span>
              <span className="text-xs sm:text-sm" style={{ color: '#8A6FBF' }}>
                {Math.round((currentStep / 3) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(currentStep / 3) * 100}%`,
                  background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                }}
              ></div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 sm:p-8 border-2" style={{ borderColor: '#E3DEF1' }}>
              <CardContent className="p-0">
                {/* Step 1: Basic Information - MOBILE RESPONSIVE */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <Building className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" style={{ color: '#6E55A0' }} />
                      <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                        Organization Details
                      </h3>
                      <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                        Tell us about your organization
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Organization Name *
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            placeholder="Enter your organization name"
                            value={formData.organizationName}
                            onChange={(e) => handleInputChange('organizationName', e.target.value)}
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
                          Organization Type *
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {organizationTypes.map((type) => {
                            const IconComponent = type.icon;
                            return (
                              <motion.button
                                key={type.value}
                                onClick={() => handleInputChange('organizationType', type.value)}
                                className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base ${
                                  formData.organizationType === type.value
                                    ? 'text-white'
                                    : ''
                                }`}
                                style={{
                                  borderColor: formData.organizationType === type.value ? '#8A6FBF' : '#E3DEF1',
                                  backgroundColor: formData.organizationType === type.value ? '#8A6FBF' : 'white',
                                  color: formData.organizationType === type.value ? 'white' : '#6E55A0'
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
                                <span>{type.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Contact Information - MOBILE RESPONSIVE */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" style={{ color: '#6E55A0' }} />
                      <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                        Contact Information
                      </h3>
                      <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                        How can we reach you?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Address *
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            placeholder="Enter your organization's address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
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
                          Phone Number
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            placeholder="Enter phone number (optional)"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
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
                          Contact Email *
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            type="email"
                            placeholder="Enter contact email"
                            value={formData.contactEmail}
                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
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
                          Estimated Number of Students
                        </label>
                        <motion.div whileFocus={{ scale: 1.02 }}>
                          <Input
                            type="number"
                            placeholder="e.g., 500"
                            value={formData.studentCount}
                            onChange={(e) => handleInputChange('studentCount', e.target.value)}
                            className="border-2 transition-all duration-200 text-sm sm:text-base"
                            style={{ 
                              borderColor: '#E3DEF1',
                              color: '#6E55A0'
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Additional Information - MOBILE RESPONSIVE */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" style={{ color: '#6E55A0' }} />
                      <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>
                        Almost Done!
                      </h3>
                      <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
                        Any additional information?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#6E55A0' }}>
                          Description (Optional)
                        </label>
                        <motion.textarea
                          className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-200 text-sm sm:text-base"
                          style={{ 
                            borderColor: '#E3DEF1',
                            color: '#6E55A0'
                          }}
                          rows={4}
                          placeholder="Tell us more about your organization and how you plan to use PandoAI..."
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          whileFocus={{ 
                            borderColor: '#8A6FBF',
                            boxShadow: '0 0 0 3px rgba(138, 111, 191, 0.1)'
                          }}
                        />
                      </div>

                      <div 
                        className="p-3 sm:p-4 rounded-lg"
                        style={{ backgroundColor: '#F7F5FA' }}
                      >
                        <h3 className="font-medium mb-2 text-sm sm:text-base" style={{ color: '#6E55A0' }}>
                          What's Next?
                        </h3>
                        <ul className="text-xs sm:text-sm space-y-1" style={{ color: '#8A6FBF' }}>
                          <li>• Create your first classroom</li>
                          <li>• Generate invitation codes for students</li>
                          <li>• Set up wellness monitoring</li>
                          <li>• Access student analytics dashboard</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons - MOBILE RESPONSIVE */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="w-full sm:w-auto border-2 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                      style={{ 
                        borderColor: '#E3DEF1',
                        color: '#8A6FBF'
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </motion.div>

                  {currentStep < 3 ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="w-full sm:w-auto transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                        style={{ 
                          background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                        }}
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                        style={{ 
                          background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
                        }}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Creating...
                          </div>
                        ) : (
                          <>
                            Complete Setup
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}