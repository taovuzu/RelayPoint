import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '@/redux/auth';
import { useLogout } from '@/features/auth/api/auth.mutations';
import { setTheme, selectTheme } from '@/redux/app';
import { LogOut, Sun, Moon, Monitor, Settings as SettingsIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/shared/ui/dropdown-menu";

export function UserMenu({ isCollapsed }) {
  const user = useSelector(selectCurrentUser);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();

  const initials = user?.fullName 
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const CurrentThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-start truncate text-sm">
              <span className="font-medium truncate w-full">{user?.fullName || 'User'}</span>
              <span className="text-xs text-muted-foreground truncate w-full">{user?.email || ''}</span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent side="right" align="end" className="w-56 shadow-lg border rounded-md">
        <DropdownMenuLabel className="font-semibold text-sm">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <SettingsIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <CurrentThemeIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="shadow-lg border rounded-md min-w-32">
              <DropdownMenuItem onClick={() => dispatch(setTheme('light'))} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4 text-muted-foreground" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch(setTheme('dark'))} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4 text-muted-foreground" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch(setTheme('system'))} className="cursor-pointer">
                <Monitor className="mr-2 h-4 w-4 text-muted-foreground" /> System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => logout()} 
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

