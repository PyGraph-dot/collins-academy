"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// FIX: We removed the broken import from "next-themes/dist/types"
// Instead, we extract the props directly from the component itself.
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}