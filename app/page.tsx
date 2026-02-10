"use client";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Library from "@/components/home/Library";
import LeadMagnet from "@/components/home/LeadMagnet";
import { ReactLenis } from '@studio-freight/react-lenis';

export default function Home() {
  return (
    <ReactLenis root>
      {/* UPDATED: Uses semantic background color */}
      <main className="bg-background min-h-screen transition-colors duration-500">
        <Header />
        <Hero />
        <Library />
        <LeadMagnet />
        
        {/* Footer Placeholder */}
        <footer className="py-12 text-center text-muted-foreground text-sm border-t border-border">
          <p>© 2026 The Collins Academy. All rights reserved.</p>
        </footer>
      </main>
    </ReactLenis>
  );
}