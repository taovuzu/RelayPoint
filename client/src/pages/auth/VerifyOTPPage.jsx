import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Command } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { OTPInput } from '@/features/auth/ui/OTPInput';
import { selectRegistrationEmail } from '@/redux/auth';

export default function VerifyOTPPage() {
  const email = useSelector(selectRegistrationEmail);

  useEffect(() => {
    document.title = 'Verify Email - RelayPoint';
  }, []);

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Command className="size-4" />
          </div>
          RelayPoint Inc.
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify your email</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OTPInput />
            <div className="text-center text-sm mt-4">
              Didn't receive the email?{" "}
              <Link to="/register" className="underline underline-offset-4">
                Try another email
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

