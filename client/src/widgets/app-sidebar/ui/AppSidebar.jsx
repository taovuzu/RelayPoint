import { useSelector, useDispatch } from 'react-redux';
import { selectSidebarCollapsed, toggleSidebar } from '@/redux/app';
import { LayoutDashboard, Workflow, Link2, Settings, ChevronLeft, Menu } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { NavItem } from './NavItem';
import { UserMenu } from './UserMenu';
import { Button } from '@/shared/ui/button';

export function AppSidebar() {
  const isCollapsed = useSelector(selectSidebarCollapsed);
  const dispatch = useDispatch();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workflows', label: 'Workflows', icon: Workflow },
    { to: '/connections', label: 'Connections', icon: Link2 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b shrink-0 transition-all">
        {!isCollapsed && (
          <span className="font-bold text-xl tracking-tight text-primary">RelayPoint</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => dispatch(toggleSidebar())} 
          className={cn("h-8 w-8 ml-auto text-muted-foreground", isCollapsed && "mx-auto")}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto w-full">
        {navLinks.map((link) => (
          <NavItem 
            key={link.to} 
            to={link.to} 
            label={link.label} 
            icon={link.icon} 
            isCollapsed={isCollapsed} 
          />
        ))}
      </nav>

      <div className="p-2 border-t shrink-0">
        <UserMenu isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}

