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

  // Hide Header on Admin/Login
  if (pathname?.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  // UPDATED LINKS: Full List including Home & My Library
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Academy", href: "/academy" },
    { name: "My Library", href: "/library" },
  ];

  return (
    <>
      {/* HEADER WRAPPER */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
           isScrolled ? "bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
        }`}
      >
        {/* INNER CONTAINER - Perfectly aligned with page content */}
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* 1. LOGO (Far Left) */}
          <Link href="/" className="font-serif text-xl tracking-tight text-white hover:text-[#d4af37] transition-colors relative z-10 font-bold">
            COLLINS<span className="text-[#d4af37]">.</span>
          </Link>

          {/* 2. DESKTOP NAVIGATION (Centered) */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="relative text-sm font-medium uppercase tracking-widest transition-all duration-300 group"
                >
                  <span className={`relative z-10 ${isActive ? "text-[#d4af37]" : "text-gray-400 group-hover:text-white"}`}>
                    {link.name}
                  </span>
                  {/* Underline Dot for Active State */}
                  {isActive && (
                     <motion.span 
                        layoutId="nav-dot"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#d4af37] rounded-full"
                     />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. CART & MENU (Far Right) */}
          <div className="flex items-center gap-6 relative z-10">
            
            {/* Cart Trigger */}
            <button 
                className="relative group text-white hover:text-[#d4af37] transition-colors"
                onClick={toggleCart} 
            >
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#d4af37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white hover:text-[#d4af37] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU FULL SCREEN OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-center justify-center space-y-8 md:hidden"
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
                  className={`text-3xl font-serif ${pathname === link.href ? "text-[#d4af37]" : "text-white"}`}
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