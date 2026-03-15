import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c0c0d",
        surface: "#141416",
        "surface-elevated": "#1c1c1f",
        border: "#27272a",
        "border-subtle": "#1f1f22",
        primary: "#d4a574",
        "primary-hover": "#e5b985",
        secondary: "#00d4aa",
        accent: "#d4a574",
        "accent-hover": "#e5b985",
        muted: "#71717a",
        "muted-foreground": "#a1a1aa",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
