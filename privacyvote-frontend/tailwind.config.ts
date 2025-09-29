import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: {
          900: "#0b0f1a",
          800: "#0f1626",
          700: "#151e35"
        },
        neon: {
          500: "#00e6a8",
          400: "#36f1b8"
        }
      },
      boxShadow: {
        glow: "0 0 32px rgba(0, 230, 168, .35)",
      }
    }
  },
  plugins: []
};

export default config;




