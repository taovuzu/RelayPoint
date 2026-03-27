import { useSelector } from 'react-redux';
import { selectPageTitle } from '@/redux/app';
import { Bell, Search } from 'lucide-react';

export function AppHeader() {
  const title = useSelector(selectPageTitle);

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-40 transition-all shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>

      <div className="flex items-center gap-4">

        <button className="relative p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full transition-colors flex shrink-0 border border-transparent hover:border-border">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-background"></span>
        </button>
      </div>
    </header>
  );
}

