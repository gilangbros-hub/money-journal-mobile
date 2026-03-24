/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
          dark: "#5B21B6",
        },
        coral: {
          DEFAULT: "#FF4D6D",
          light: "#FF8FA3",
          dark: "#C9184A",
        },
        lime: {
          DEFAULT: "#22C55E",
          light: "#4ADE80",
          dark: "#15803D",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
          dark: "#B45309",
        },
        bg: {
          DEFAULT: "#0F172A",
          secondary: "#1E293B",
          tertiary: "#334155",
          overlay: "rgba(15, 23, 42, 0.85)",
        },
        border: {
          DEFAULT: "#334155",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
        },
      },
    },
  },
  plugins: [],
}
