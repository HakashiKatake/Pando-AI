'use client';

import { useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function UserSetupContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const userType = searchParams.get('type') || 'user';

  useEffect(() => {
    if (isLoaded && user && !isUpdating) {
      handleUserSetup();
    }
  }, [isLoaded, user, userType]);

  const handleUserSetup = async () => {
    setIsUpdating(true);
    
    try {
      // Update user metadata with the user type
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          userType: userType,
          setupComplete: false,
        },
      });

      // Redirect based on user type
      if (userType === 'organization') {
        router.push('/org/onboarding');
      } else {
        router.push('/classroom-code');
      }
    } catch (error) {
      console.error('Error setting up user:', error);
      // Fallback redirect
      router.push('/dashboard');
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">
          {userType === 'organization' ? 'Setting up organization account...' : 'Setting up student account...'}
        </p>
      </div>
    </div>
  );
}

export default function UserSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UserSetupContent />
    </Suspense>
  );
}
