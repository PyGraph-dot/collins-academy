"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1 rounded-full backdrop-blur-sm">
      <button
        onClick={() => setTheme("light")}
        aria-label="Light Mode"
        className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
      >
        <Sun size={14} />
      </button>
      <button
        onClick={() => setTheme("system")}
        aria-label="System Mode"
        className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-white text-black shadow-sm dark:bg-white/10 dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
      >
        <Monitor size={14} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        aria-label="Dark Mode"
        className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
      >
        <Moon size={14} />
      </button>
    </div>
  );
}
