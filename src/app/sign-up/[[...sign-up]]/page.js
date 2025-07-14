'use client';

import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join CalmConnect {userType === 'organization' ? 'as Organization' : userType === 'user' ? 'as Student' : ''}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {userType === 'organization' 
              ? 'Create your organization account and manage student wellness'
              : userType === 'user'
              ? 'Create your student account and access wellness tools'
              : 'Start your journey to better mental wellness'
            }
          </p>
        </div>
        
        <SignUp 
          appearance={{
            baseTheme: theme === 'dark' ? dark : undefined,
            elements: {
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
              card: 'shadow-xl border-0',
              headerTitle: 'text-xl font-semibold',
              headerSubtitle: 'text-gray-600 dark:text-gray-300',
            }
          }}
          redirectUrl={`/user-setup?type=${userType || 'user'}`}
          afterSignUpUrl={`/user-setup?type=${userType || 'user'}`}
          signInUrl={`/sign-in${userType ? `?type=${userType}` : ''}`}
        />
      </div>
    </div>
  );
}
