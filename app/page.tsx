"use client";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Library from "@/components/home/Library";
import LeadMagnet from "@/components/home/LeadMagnet";
import { ReactLenis } from '@studio-freight/react-lenis';

export default function Home() {
  return (
    <ReactLenis root>
      <main className="bg-[#0a0a0a] min-h-screen">
        <Header />
        <Hero />
        <Library />
        <LeadMagnet />
        
        {/* Footer Placeholder */}
        <footer className="py-12 text-center text-gray-600 text-sm border-t border-white/5">
          <p>© 2026 The Collins Academy. All rights reserved.</p>
        </footer>
      </main>
    </ReactLenis>
  );
}