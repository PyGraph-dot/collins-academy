"use client";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ShoppingBag, Menu } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link"; // Import Link
import { useCart } from "@/store/cart"; // Connect Cart State

export default function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const { toggleCart, items } = useCart(); // Get real cart count

  // Scroll Logic
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Define the Navigation Links here
  const navLinks = [
    { name: "Books", path: "/#library" }, // Scrolls to the Library on Home
    { name: "Academy", path: "/academy" }, // Goes to Academy Page
    { name: "About", path: "/about" },     // We will build this next
  ];

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-6 text-white mix-blend-difference"
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo - Click to go Home */}
        <Link href="/">
          <div className="font-serif text-2xl tracking-tighter font-bold cursor-pointer">
            COLLINS<span className="text-[#d4af37]">.</span>
          </div>
        </Link>

        {/* Desktop Nav - Now with Links! */}
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium tracking-wide">
          {navLinks.map((item) => (
            <MagneticButton key={item.name} className="cursor-pointer">
              <Link href={item.path} className="p-2 hover:text-[#d4af37] transition-colors block">
                {item.name}
              </Link>
            </MagneticButton>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <MagneticButton className="cursor-pointer">
             <button onClick={toggleCart} className="p-2 relative" aria-label="Open Cart">
                <ShoppingBag size={20} />
                {items.length > 0 && (
                  <span className="absolute top-1 right-0 w-2 h-2 bg-[#d4af37] rounded-full border border-black" />
                )}
             </button>
          </MagneticButton>
          
          <button className="md:hidden" aria-label="Menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </motion.header>
  );
}