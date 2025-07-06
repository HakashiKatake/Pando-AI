'use client';

import { useUser } from '@clerk/nextjs';
import { useAppStore } from '../lib/store';
import { clearGuestData } from '../lib/utils';
import { useEffect, useRef } from 'react';

export function AuthDataManager() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { setUser, clearAllData } = useAppStore();
  const hasProcessedAuth = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    // If user just signed in and we haven't processed this yet
    if (isSignedIn && user && !hasProcessedAuth.current) {
      console.log('User signed in, clearing guest data and setting user');
      
      // Clear all guest data from localStorage
      clearGuestData();
      
      // Clear store data (this will trigger re-initialization)
      clearAllData();
      
      // Set the authenticated user
      setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
      });

      hasProcessedAuth.current = true;
    }
    
    // If user signed out
    if (!isSignedIn && hasProcessedAuth.current) {
      console.log('User signed out, resetting to guest mode');
      setUser(null);
      hasProcessedAuth.current = false;
    }
  }, [isSignedIn, user, isLoaded, setUser, clearAllData]);

  return null; // This component doesn't render anything
}
