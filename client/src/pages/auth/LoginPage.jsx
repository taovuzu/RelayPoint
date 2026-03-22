import { useEffect } from 'react';
import { GalleryVerticalEnd } from "lucide-react";
import { Link } from 'react-router-dom';

import { LoginForm } from "@/features/auth/ui/LoginForm";

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Login - RelayPoint';
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4 shrink-0" />
          </div>
          RelayPoint Inc.
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
