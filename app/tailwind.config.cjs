/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue, js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Mulish", "sans-serif"],
    },
    extend: {
      colors: {
        accent: {
          100: "#0e112d",
          200: "#151a43",
          300: "#1c225a",
          400: "#232b71",
          500: "#293487",
          600: "#303c9e",
          700: "#3745b4",
          800: "#3e4dcb",
          900: "#4556e1",
        },
        dark: {
          900: "#0e0e0e",
          800: "#1a1a1a",
          700: "#242424",
          600: "#252525",
          500: "#262626",
          400: "#333333",
          300: "#393939",
          200: "#404040",
          100: "#4c4c4c",
        },
        primary: {
          100: "#999999",
          200: "#a6a6a6",
          300: "#b3b3b3",
          400: "#bfbfbf",
          500: "#cccccc",
          600: "#d9d9d9",
          700: "#e6e6e6",
          800: "#f2f2f2",
          900: "#ffffff",
        },
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
  variants: { scrollbar: ["rounded"] },
  darkMode: "class",
};
