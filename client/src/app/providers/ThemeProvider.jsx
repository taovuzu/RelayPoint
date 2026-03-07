import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '@/redux/app';

export function ThemeProvider({ children }) {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
    };

    applyTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  return children;
}

