import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import CartDrawer from "@/components/shop/CartDrawer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat"; // Import this
import "./globals.css";

// --- FONT DEFINITIONS (Must be present!) ---
const serif = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap",
});
// -------------------------------------------

export const metadata: Metadata = {
  title: "Collins | The Art of English",
  description: "Master pronunciation, vocabulary, and literature.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="bg-charcoal-900 text-white antialiased selection:bg-gold-500 selection:text-black">
        <CartDrawer />
        <WhatsAppFloat /> {/* Add this here */}
        {children}
      </body>
    </html>
  );
}