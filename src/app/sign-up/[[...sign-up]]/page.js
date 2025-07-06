'use client';

import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export default function SignUpPage() {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join CalmConnect
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Start your journey to better mental wellness
          </p>
        </div>
        
        <SignUp 
          appearance={{
            baseTheme: theme === 'dark' ? dark : undefined,
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              card: 'shadow-xl border-0',
              headerTitle: 'text-xl font-semibold',
              headerSubtitle: 'text-gray-600 dark:text-gray-300',
            }
          }}
          redirectUrl="/questionnaire"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
