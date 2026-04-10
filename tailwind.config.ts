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
        canvas: '#F8F7F4',
        ink: '#1A1C29',
        tray: '#EFECE6',
        gold: '#c9a96e',
      },
    },
  },
  plugins: [],
};
export default config;
