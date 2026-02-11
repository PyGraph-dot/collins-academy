"use client";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Library from "@/components/home/Library";
import LeadMagnet from "@/components/home/LeadMagnet";
import { ReactLenis } from '@studio-freight/react-lenis';

export default function Home() {
  return (
    <ReactLenis root>
      {/* UPDATED: Dynamic background */}
      <main className="bg-background text-foreground min-h-screen transition-colors duration-500">
        <Header />
        <Hero />
        <Library />
        <LeadMagnet />
        
        {/* You can remove this footer placeholder since you have a real global footer now */}
        {/* <footer className="py-12 text-center text-muted-foreground text-sm border-t border-border">
          <p>© 2026 The Collins Academy. All rights reserved.</p>
        </footer> */}
      </main>
    </ReactLenis>
  );
}