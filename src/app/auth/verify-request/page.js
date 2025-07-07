'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

export default function VerifyRequestPage() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    // In a real app, you'd call the resend API here
    setCountdown(60);
    setCanResend(false);
    // You could trigger a new sign-in request here
  };

  const handleContinueAsGuest = () => {
    router.push('/questionnaire');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CalmConnect</span>
          </Link>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <p className="text-muted-foreground">
            We've sent a sign-in link to your email address
          </p>
          {email && (
            <p className="text-sm font-medium text-foreground mt-2">
              {email}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <p className="text-sm text-blue-800 font-medium">
              What to do next:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your email inbox</li>
              <li>• Look for an email from CalmConnect</li>
              <li>• Click the "Sign In" button in the email</li>
              <li>• The link will expire in 24 hours</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Don't see the email? Check your spam folder or:
            </p>
            {canResend ? (
              <Button
                variant="outline"
                onClick={handleResend}
                className="w-full"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Email
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="w-full"
                size="sm"
              >
                Resend in {countdown}s
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/auth/signin')}
              className="w-full"
            >
              Try Different Email
            </Button>
            <Button
              variant="ghost"
              onClick={handleContinueAsGuest}
              className="w-full"
            >
              Continue as Guest Instead
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
