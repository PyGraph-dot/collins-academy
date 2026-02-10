"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[88px] h-[32px] bg-white/5 rounded-full animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-1 bg-charcoal-900/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1 rounded-full backdrop-blur-sm">
      <button
        onClick={() => setTheme("light")}
        aria-label="Light Mode"
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === 'light' 
            ? 'bg-white text-black shadow-sm' 
            : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <Sun size={14} />
      </button>
      <button
        onClick={() => setTheme("system")}
        aria-label="System Mode"
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === 'system' 
            ? 'bg-white text-black shadow-sm dark:bg-white/20 dark:text-white' 
            : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <Monitor size={14} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        aria-label="Dark Mode"
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-charcoal-800 text-white shadow-sm dark:bg-white/20' 
            : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <Moon size={14} />
      </button>
    </div>
  );
}
