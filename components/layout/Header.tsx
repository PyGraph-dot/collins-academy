"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { items, toggleCart } = useCart();

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isOpen) setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="text-xl font-serif text-white tracking-wider font-bold z-[102] relative">
            COLLINS<span className="text-[#d4af37]">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Shop', 'About', 'Academy'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Icons Area */}
          <div className="flex items-center gap-6 z-[102] relative">
            
            {/* CART BUTTON */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={toggleCart} 
              className="relative text-white hover:text-[#d4af37] transition-colors"
            >
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#d4af37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </motion.button>

            {/* MOBILE HAMBURGER BUTTON (Animated) */}
            <motion.button 
              initial={false}
              animate={isOpen ? "open" : "closed"}
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-white hover:text-[#d4af37] transition-colors w-8 h-8 flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
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
            </motion.button>

          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0a0a0a] z-[100] flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            {['Shop', 'About', 'Academy'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-3xl font-serif text-white hover:text-[#d4af37] transition-colors"
              >
                {item}
              </Link>
            ))}
            
            <div className="mt-8 pt-8 border-t border-white/10 w-24 flex justify-center">
               <span className="text-gray-500 text-xs tracking-widest uppercase">The Collins Academy</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}