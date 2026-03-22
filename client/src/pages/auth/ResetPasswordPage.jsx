import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Command } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { ResetPasswordForm } from '@/features/auth/ui/ResetPasswordForm';

export default function ResetPasswordPage() {
  useEffect(() => {
    document.title = 'Reset Password - RelayPoint';
  }, []);

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
            <CardTitle className="text-xl">Create new password</CardTitle>
            <CardDescription>
              Your new password must be different from passwords previously used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
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

