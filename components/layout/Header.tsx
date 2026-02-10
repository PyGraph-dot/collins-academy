"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { ModeToggle } from "@/components/ui/ModeToggle"; // <--- Import the toggle

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { items, toggleCart } = useCart();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll Handler
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

  // Lock Body Scroll on Mobile Menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin") || pathname === "/login") return null;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Academy", href: "/academy" },
    { name: "My Library", href: "/library" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 h-20 flex items-center transition-all duration-300 ${
           isScrolled 
             // UPDATED: Use dynamic bg-background/90 and border-border
             ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm" 
             : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 grid grid-cols-[auto_1fr_auto] items-center">
          
          {/* 1. LOGO */}
          <div className="justify-self-start z-20">
            <Link 
              href="/" 
              className="font-serif text-lg md:text-xl tracking-tight text-foreground hover:text-gold transition-colors font-bold block py-2"
              aria-label="Collins Academy Home"
            >
              COLLINS<span className="text-gold">.</span>
            </Link>
          </div>

          {/* 2. DESKTOP NAV */}
          <nav className="hidden md:flex justify-self-center items-center gap-6 md:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="relative text-sm font-medium uppercase tracking-widest transition-all duration-300 group py-2"
                >
                  <span className={`relative z-10 ${isActive ? "text-gold" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {link.name}
                  </span>
                  {isActive && (
                     <motion.span 
                        layoutId="nav-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_8px_var(--gold)]"
                     />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT ACTIONS (Cart + Toggle + Menu) */}
          <div className="justify-self-end flex items-center gap-3 z-20">
            
            {/* Theme Toggle (Hidden on super small screens if needed, usually fine) */}
            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            {/* Cart Button */}
            <button 
                className="relative group text-foreground hover:text-gold transition-colors p-2 flex items-center justify-center"
                onClick={toggleCart}
                aria-label="View Cart"
            >
              <ShoppingBag size={22} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-charcoal-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {items.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Trigger */}
            <button 
              ref={menuButtonRef}
              className="md:hidden text-foreground hover:text-gold transition-colors p-2 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            // UPDATED: Dynamic background (Paper in light mode, Void in dark mode)
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            {/* Mobile Toggle (Since we hid it in header on small screens) */}
            <div className="absolute top-24">
              <ModeToggle />
            </div>

            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-3xl font-serif transition-colors ${
                    pathname === link.href 
                      ? "text-gold" 
                      : "text-foreground hover:text-gold"
                  }`}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            
            <div className="mt-12 w-12 h-[1px] bg-gold/50" />
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">The Collins Academy</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
