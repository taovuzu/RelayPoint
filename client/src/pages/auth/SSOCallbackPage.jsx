import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from '@/redux/auth/authThunks';
import { Loader2 } from 'lucide-react';

export default function SSOCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const success = searchParams.get('success');

    if (success === 'true') {
      dispatch(getCurrentUser())
        .unwrap()
        .then(() => navigate('/dashboard', { replace: true }))
        .catch(() => navigate('/login?error=sso_failed', { replace: true }));
    } else {
      navigate('/login?error=sso_denied', { replace: true });
    }
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}
