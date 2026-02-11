import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // Keep this as "class" to allow System/Toggle switching
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: ["dark"], // Force Tailwind to generate dark variants
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        gold: {
          DEFAULT: "var(--gold)", 
          100: "#F9F1D8",
          400: "#E5C05F",
          500: "#D4AF37", 
          600: "#AA8C2C",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"], 
        sans: ["var(--font-sans)", "sans-serif"], 
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
