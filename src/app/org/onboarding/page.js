'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Building, Users, GraduationCap, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              CalmConnect
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your organization profile to get started
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card className="p-8">
          <CardContent className="p-0">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <Building className="w-12 h-12 text-purple-600 mx-auto" />
                  <h2 className="text-2xl font-bold text-gray-900">Organization Details</h2>
                  <p className="text-gray-600">Tell us about your organization</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <Input
                      placeholder="Enter your organization name"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Type *
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {organizationTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <button
                            key={type.value}
                            onClick={() => handleInputChange('organizationType', type.value)}
                            className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                              formData.organizationType === type.value
                                ? 'border-purple-300 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <IconComponent className="w-5 h-5 mr-3" />
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <MapPin className="w-12 h-12 text-purple-600 mx-auto" />
                  <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                  <p className="text-gray-600">How can we reach you?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <Input
                      placeholder="Enter your organization's address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      placeholder="Enter phone number (optional)"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter contact email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Number of Students
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.studentCount}
                      onChange={(e) => handleInputChange('studentCount', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <Users className="w-12 h-12 text-purple-600 mx-auto" />
                  <h2 className="text-2xl font-bold text-gray-900">Almost Done!</h2>
                  <p className="text-gray-600">Any additional information?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Tell us more about your organization and how you plan to use CalmConnect..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900 mb-2">What's Next?</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Create your first classroom</li>
                      <li>• Generate invitation codes for students</li>
                      <li>• Set up wellness monitoring</li>
                      <li>• Access student analytics dashboard</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="disabled:opacity-50"
              >
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Complete Setup'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
