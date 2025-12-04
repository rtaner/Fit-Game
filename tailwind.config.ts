import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (keep for backward compatibility)
        primary: {
          DEFAULT: "#0A66C2",
          dark: "#1A73E8",
        },
        background: "#FBFAF9",
        // New design system colors
        navy: "#002D66", // Primary navy color
        "mavi-blue": "#003399",
        "mavi-navy": "#002D66", // Updated to match primary navy
        "mavi-navy-light": "#0E487A",
        "mavi-light": "#00AAFF",
        "light-blue": "#00A3E0",
        cyan: "#00D4FF",
        // Border colors
        "border-light": "#dbdee1",
      },
      borderColor: {
        DEFAULT: "#dbdee1",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.08)",
        medium: "0 4px 16px rgba(0,0,0,0.12)",
        large: "0 8px 24px rgba(0,0,0,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
