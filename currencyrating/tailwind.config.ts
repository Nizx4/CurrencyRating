import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--cr-bg)",
        surface: "var(--cr-surface)",
        card: "var(--cr-card)",
        text: "var(--cr-text)",
        muted: "var(--cr-muted)",
        accent: "var(--cr-accent)",
        success: "var(--cr-success)",
        danger: "var(--cr-danger)",
        border: "var(--cr-border)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [],
};
export default config;
