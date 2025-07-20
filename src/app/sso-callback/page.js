'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useClerk } from '@clerk/nextjs';

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoaded) return;

    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        
        if (isSignedIn) {
          // Check if this was a sign-up flow
          const isSignUp = window.location.href.includes('sign-up')
          const userType = searchParams.get('type') || 'user'
          
          if (isSignUp) {
            // Redirect to user setup for new accounts
            router.push(`/user-setup?type=${userType}`);
          } else {
            // Redirect to dashboard for existing accounts
            const redirectUrl = userType === 'organization' ? '/org/onboarding' : '/dashboard'
            router.push(redirectUrl);
          }
        }
      } catch (error) {
        console.error('SSO callback error:', error);
        router.push('/sign-in?error=sso_failed');
      }
    };

    handleCallback();
  }, [isLoaded, isSignedIn, handleRedirectCallback, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5FA' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
        <p style={{ color: '#6E55A0' }}>Completing sign up...</p>
      </div>
    </div>
  );
}