import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";

const ALL_PX = Object.fromEntries(
  [...Array(10000)].map((_, i) => [`${i}px`, `${i / 16}rem`]),
);

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderColor: ({ theme }) => ({ DEFAULT: theme("colors.retro-gray") }),
      borderWidth: {
        DEFAULT: "1.5px",
      },
      colors: {
        ["retro-gray"]: "#6A6A6D",
        ["retro-gray-transparent"]: "#6A6A6D99",
        ["retro-black"]: "#030303",
        ["retro-green"]: "#E2FF46",
        ["retro-pale-green"]: "#E2FF4666",
        ["retro-blue"]: "#CCDAFF",
        ["retro-pale-blue"]: "#CCDAFF50",
        ["retro-mid-blue"]: "#9EB3E9",
        ["retro-dark-blue"]: "#9AADE1",
        ["retro-red"]: "#FF4D4D",
        ["retro-white"]: "#FFFFFF",
        ["retro-bordeaux"]: "#5D3048",
      },
      flexBasis: ALL_PX,
      fontFamily: {
        degular: [
          "var(--font-degular)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        suisse: [
          "var(--font-suisse)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      fontSize: ALL_PX,
      gap: ALL_PX,
      gridTemplateColumns: {
        "thumbnails-sm": `repeat(auto-fill, minmax(${300 / 16}rem, 1fr))`,
        "thumbnails-lg": `repeat(auto-fill, minmax(${340 / 16}rem, 1fr))`,
      },
      height: ALL_PX,
      lineHeight: ALL_PX,
      margin: ALL_PX,
      maxWidth: ALL_PX,
      minHeight: ALL_PX,
      minWidth: ALL_PX,
      padding: ALL_PX,
      screens: {
        sm: "640px",
        md: "768px",
        "wide-article": "900px",
        lg: "1024px",
        "3col": "1249px",
      },
      spacing: ALL_PX,
      width: ALL_PX,
    },
  },
  plugins: [forms, require("tailwindcss-animate")],
};
export default config;
