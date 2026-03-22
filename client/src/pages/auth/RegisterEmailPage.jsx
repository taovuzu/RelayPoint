import { useEffect } from 'react';
import { GalleryVerticalEnd } from "lucide-react";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { RegisterEmailForm } from '@/features/auth/ui/RegisterEmailForm';
import { OTPInput } from '@/features/auth/ui/OTPInput';
import { RegisterUserForm } from '@/features/auth/ui/RegisterUserForm';

import { selectRegistrationStep } from '@/redux/auth';

export default function RegisterEmailPage() {
  const step = useSelector(selectRegistrationStep);

  useEffect(() => {
    document.title = 'Register - RelayPoint';
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'otp':
        return <OTPInput />;
      case 'account':
        return <RegisterUserForm />;
      case 'email':
      default:
        return <RegisterEmailForm />;
    }
  };

  const titles = {
    email: { title: "Create an account", desc: "Enter your email to get started" },
    otp: { title: "Verify your email", desc: "Check your inbox for the code" },
    account: { title: "Complete your profile", desc: "Set your name and password" }
  };
  const currentText = titles[step] || titles.email;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4 shrink-0" />
          </div>
          RelayPoint Inc.
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold tracking-tight">{currentText.title}</CardTitle>
            <CardDescription>{currentText.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
            {step === 'email' && (
              <div className="text-center text-sm pt-4">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Log in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="px-6 text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our <Link to="#" className="hover:text-foreground underline underline-offset-4">Terms of Service</Link>{" "}
          and <Link to="#" className="hover:text-foreground underline underline-offset-4">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
