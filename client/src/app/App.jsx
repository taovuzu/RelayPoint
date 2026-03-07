import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { request } from '@/request/request';
import { setupErrorHandler } from '@/request/errorHandler';
import { getCurrentUser } from '@/redux/auth';
import { AppRouter } from './routes/AppRouter';

export function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    setupErrorHandler(request, dispatch);
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <AppRouter />
    </div>
  );
}

