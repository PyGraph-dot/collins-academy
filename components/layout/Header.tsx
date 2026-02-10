"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Home, BookOpen, User } from "lucide-react";
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

  // Navigation Links
  const navLinks = [
    { name: "Home", href: "/", icon: <Home size={14} /> },
    { name: "My Library", href: "/library", icon: <BookOpen size={14} /> },
    { name: "Shop", href: "/shop", icon: <ShoppingBag size={14} /> },
  ];

  return (
    <>
      {/* FLOATING HEADER CONTAINER */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div 
          className={`pointer-events-auto transition-all duration-500 ease-in-out
            ${isScrolled ? "py-3 px-5 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/50 rounded-full" : "py-4 px-6 bg-transparent border-transparent"}
            flex items-center gap-4 md:gap-8
          `}
        >
          
          {/* 1. LOGO (Mobile Only Icon / Desktop Text) */}
          <Link href="/" className="font-serif text-lg tracking-tight text-white hover:text-[#d4af37] transition-colors relative z-10">
            <span className="hidden md:inline font-bold">COLLINS.</span>
            <span className="md:hidden font-bold">C.</span>
          </Link>

          {/* 2. DESKTOP NAVIGATION (The Glass Pill) */}
          <nav className="hidden md:flex items-center bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="relative px-5 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-all duration-300"
                >
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#d4af37] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 ${isActive ? "text-black font-bold" : "text-gray-400 hover:text-white"}`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* 3. CART & MENU ACTIONS */}
          <div className="flex items-center gap-3 relative z-10">
            {/* Cart Trigger */}
            <button 
                className="relative group p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={toggleCart} 
            >
              <ShoppingBag size={20} className="text-white group-hover:text-[#d4af37] transition-colors" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#d4af37] rounded-full shadow-[0_0_10px_#d4af37]"></span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-white hover:text-[#d4af37] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU DROPDOWN (Full Screen Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 md:hidden"
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
                  className={`text-3xl font-serif flex items-center gap-3 ${pathname === link.href ? "text-[#d4af37]" : "text-white"}`}
                >
                  {link.icon} {link.name}
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