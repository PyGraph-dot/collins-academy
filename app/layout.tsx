import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; 
import CartDrawer from "@/components/shop/CartDrawer";
// Removed ThemeProvider import

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "The Collins Academy",
  description: "Master the art of English articulation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // FORCE LIGHT MODE HERE
    <html lang="en" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {/* ThemeProvider removed. Direct rendering ensures no flickering. */}
          <Header />
          <CartDrawer />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
      </body>
    </html>
  );
}
