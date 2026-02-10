"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { items, toggleCart } = useCart();

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }, [pathname]);

  // HIDE HEADER ON ADMIN & LOGIN PAGES
  if (pathname?.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  // The Links you wanted back
  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Academy", href: "/academy" },
  ];

  return (
    <>
      {/* FLOATING HEADER */}
      {/* We use 'fixed' to keep it at the top, but add padding/margin to make it float */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${
           isScrolled ? "pt-4 px-4" : "pt-6 px-6"
        }`}
      >
        <div 
          className={`w-full max-w-7xl transition-all duration-500 ease-in-out flex items-center justify-between
            ${isScrolled 
              ? "bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 shadow-2xl rounded-full py-3 px-6" 
              : "bg-transparent border-transparent py-2 px-0"
            }
          `}
        >
          
          {/* 1. LOGO (Left Position) */}
          <Link href="/" className="font-serif text-xl tracking-tight text-white hover:text-[#d4af37] transition-colors relative z-10 font-bold">
            COLLINS<span className="text-[#d4af37]">.</span>
          </Link>

          {/* 2. DESKTOP NAVIGATION (Center - Restored Shop/About/Academy) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="relative px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-all duration-300 group"
                >
                  <span className={`relative z-10 ${isActive ? "text-[#d4af37]" : "text-gray-400 group-hover:text-white"}`}>
                    {link.name}
                  </span>
                  {/* Subtle Hover Glow */}
                  <span className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                </Link>
              );
            })}
          </nav>

          {/* 3. CART & MENU (Right Position) */}
          <div className="flex items-center gap-4 relative z-10">
            
            {/* Cart Trigger */}
            <button 
                className="relative group p-2 hover:bg-white/10 rounded-full transition-colors"
                onClick={toggleCart} 
            >
              <ShoppingBag size={20} className="text-white group-hover:text-[#d4af37] transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d4af37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-white hover:text-[#d4af37] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-4xl font-serif ${pathname === link.href ? "text-[#d4af37]" : "text-white"}`}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 w-12 h-[1px] bg-white/20"
            />
            
            <p className="text-gray-500 text-xs tracking-[0.2em] uppercase">The Collins Academy</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}