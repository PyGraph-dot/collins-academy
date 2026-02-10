import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; 
import CartDrawer from "@/components/shop/CartDrawer";
import { ThemeProvider } from "@/components/theme-provider"; // Import the provider

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {/* Wrap everything in the ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Default to Dark/Premium
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <CartDrawer />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
