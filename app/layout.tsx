import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; 
import CartDrawer from "@/components/shop/CartDrawer";
import { ThemeProvider } from "@/components/theme-provider"; // RESTORED

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
    // CRITICAL FIX: suppressHydrationWarning stops the "black screen" glitch on load
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // Default to User's Preference (System)
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <CartDrawer />
          <main className="min-h-screen relative flex flex-col">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
