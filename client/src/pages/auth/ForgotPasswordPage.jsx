import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Command } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { ForgotPasswordForm } from '@/features/auth/ui/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = 'Forgot Password - RelayPoint';
    // dispatch(setPageTitle('Forgot Password'));
  }, [dispatch]);

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
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your email address to receive a recovery link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
            <div className="text-center text-sm mt-4">
              <Link to="/login" className="underline underline-offset-4">
                Return to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

