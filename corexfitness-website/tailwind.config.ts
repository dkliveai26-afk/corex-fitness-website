import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        panel: "#101b2d",
        mint: "#5ef4bd",
        cyan: "#6ae7ff",
        violet: "#9b7cff"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Cascadia Code", "Consolas", "monospace"]
      },
      boxShadow: {
        glow: "0 0 60px rgba(94, 244, 189, 0.18)",
        card: "0 24px 80px rgba(0, 0, 0, 0.24)"
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        scan: "scan 10s linear infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" }
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
