'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { useAppStore } from '../lib/store';

export function Providers({ children }) {
  const initializeGuest = useAppStore((state) => state.initializeGuest);

  useEffect(() => {
    // Initialize guest user if no session
    initializeGuest();
  }, [initializeGuest]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
