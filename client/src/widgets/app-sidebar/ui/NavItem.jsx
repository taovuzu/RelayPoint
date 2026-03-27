import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

export function NavItem({ to, label, icon: Icon, isCollapsed }) {
  const navLinkClass = ({ isActive }) => cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive 
      ? "bg-primary/10 text-primary" 
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
    isCollapsed && "justify-center px-0"
  );

  const inner = (
    <NavLink to={to} className={navLinkClass}>
      <Icon size={isCollapsed ? 20 : 18} />
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {inner}
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4 border shadow-md">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return inner;
}

