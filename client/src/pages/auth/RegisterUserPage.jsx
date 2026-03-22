import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { RegisterUserForm } from '@/features/auth/ui/RegisterUserForm';
import { selectIsAuthenticated } from '@/redux/auth';

export default function RegisterUserPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    document.title = 'Complete Profile - RelayPoint';
  }, []);

  if (isAuthenticated) {
     return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Complete profile</CardTitle>
          <CardDescription>
            Set up your name and password to finalize registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterUserForm />
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

