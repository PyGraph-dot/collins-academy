"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  // We cast the library component to 'any' to bypass the React 19 type mismatch
  const Lenis = ReactLenis as any;

  return (
    <Lenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </Lenis>
  );
}