/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F5A623",
          light: "#FBBF24",
          dark: "#D4891A",
        },
        brandBlue: {
          DEFAULT: "#1677FF",
          light: "#5AA6FF",
          dark: "#1256C8",
          soft: "rgba(22, 119, 255, 0.08)",
        },
        coral: {
          DEFAULT: "#EF4444",
          light: "#FCA5A5",
          dark: "#DC2626",
        },
        lime: {
          DEFAULT: "#22C55E",
          light: "#86EFAC",
          dark: "#15803D",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "#FDE68A",
          dark: "#B45309",
        },
        bg: {
          DEFAULT: "#FFFFFF",
          secondary: "#FFFFFF",
          tertiary: "#FFF9E6",
          overlay: "rgba(0, 0, 0, 0.4)",
        },
        card: "#FFFFFF",
        border: {
          DEFAULT: "transparent",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#333333",
          muted: "#666666",
        },
      },
    },
  },
  plugins: [],
}
