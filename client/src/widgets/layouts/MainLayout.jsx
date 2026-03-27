import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppSidebar } from '@/widgets/app-sidebar/ui/AppSidebar';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import { selectSidebarCollapsed } from '@/redux/app';
import { cn } from '@/shared/lib/cn';

export function MainLayout() {
  const isCollapsed = useSelector(selectSidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <AppSidebar />
      <div 
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 min-w-0",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <AppHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

