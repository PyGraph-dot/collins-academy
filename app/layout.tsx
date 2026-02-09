import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; // <--- IMPORT THIS
import CartDrawer from "@/components/shop/CartDrawer";

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
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} font-sans bg-[#0a0a0a] text-white antialiased`}>
        <Header />
        <CartDrawer />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer /> {/* <--- ADD THIS AT THE BOTTOM */}
      </body>
    </html>
  );
}