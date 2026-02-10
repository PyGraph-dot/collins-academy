"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);

  // 1. PERFORMANCE: Throttled Scroll Handler
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. UX: Mobile Scroll Lock + Focus Management
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      // Move focus to first nav link when menu opens
      setTimeout(() => firstNavLinkRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
      // Return focus to menu button when menu closes
      menuButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // ESC Key Handler: Close menu on ESC press (WCAG 2.1 requirement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  const navLinks = useMemo(() => [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Academy", href: "/academy" },
    { name: "My Library", href: "/library" },
  ], []);

  return (
    <>
      {/* HEADER WRAPPER */}
      <header
        className={`fixed top-0 left-0 w-full z-50 h-20 flex items-center ${
           isScrolled 
             ? "bg-[#0a0a0a]/90 backdrop-blur-sm md:backdrop-blur-md border-b border-white/10" 
             : "bg-transparent border-b border-transparent"
        } transition-all duration-300`}
      >
        {/* INNER CONTAINER - Uses GRID to prevent centering overlaps */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 grid grid-cols-[auto_1fr_auto] items-center">
          
          {/* 1. LOGO (Far Left - justify-self-start) */}
          <div className="justify-self-start z-20">
            <Link 
              href="/" 
              className="font-serif text-lg md:text-xl tracking-tight text-white hover:text-[#d4af37] transition-colors font-bold block py-2"
              aria-label="Collins Academy Home"
            >
              COLLINS<span className="text-[#d4af37]">.</span>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION (Center - justify-self-center) */}
          <nav className="hidden md:flex justify-self-center items-center gap-6 md:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="relative text-sm font-medium uppercase tracking-widest transition-all duration-300 group py-2"
                >
                  <span className={`relative z-10 ${isActive ? "text-[#d4af37]" : "text-gray-400 group-hover:text-white"}`}>
                    {link.name}
                  </span>
                  {/* Visual Feedback: Active Dot */}
                  {isActive && (
                     <motion.span 
                        layoutId="nav-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                     />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. CART & MENU (Far Right - justify-self-end) */}
          <div className="justify-self-end flex items-center gap-4 z-20">
            
            {/* Cart Trigger - Accessible Touch Target */}
            <button 
                className="relative group text-white hover:text-[#d4af37] transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={toggleCart}
                aria-label={`View Cart, ${items.length} items`}
            >
              <ShoppingBag size={22} />
              {items.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#d4af37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {items.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Button - Accessible Touch Target */}
            <button 
              ref={menuButtonRef}
              className="md:hidden text-white hover:text-[#d4af37] transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/5 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-sm md:backdrop-blur-md flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <Link 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  ref={i === 0 ? firstNavLinkRef : null}
                  className={`text-2xl font-serif transition-all duration-300 relative ${
                    pathname === link.href 
                      ? "text-[#d4af37]" 
                      : "text-white hover:text-[#d4af37]"
                  }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.span 
                      layoutId="mobile-nav-dot"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: navLinks.length * 0.1 + 0.1 }}
              className="mt-12 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            />
            
            <p className="text-gray-500 text-xs tracking-[0.2em] uppercase">The Collins Academy</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}