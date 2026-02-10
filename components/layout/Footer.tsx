"use client"; // <--- ADD THIS

import Link from "next/link";
import { usePathname } from "next/navigation"; // <--- IMPORT THIS
import { Instagram, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // --- NEW: HIDE FOOTER ON ADMIN & LOGIN PAGES ---
  if (pathname?.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-serif text-white mb-6">
              COLLINS<span className="text-[#d4af37]">.</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Helping professionals and students master the art of English articulation. 
              Elevate your speech, command the room, and write with precision.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4">
              {['Shop', 'About', 'Academy', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className="text-gray-500 hover:text-[#d4af37] text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Social */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Connect</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin size={18} /></a>
            </div>
            <a href="mailto:hello@collins.com" className="flex items-center gap-2 text-gray-500 hover:text-[#d4af37] text-sm transition-colors">
              <Mail size={14} /> hello@collins.com
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} The Collins Academy. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-600 hover:text-white text-xs">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-white text-xs">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}