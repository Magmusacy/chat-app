/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Legacy theme color (for backward compatibility)
        theme: "#23293a",

        // Base colors
        background: "#23293a",
        surface: "#2c3445",
        surfaceLight: "#343c50",

        // Brand/accent colors
        primary: "#3b82f6",
        secondary: "#7c3aed",
        tertiary: "#06b6d4",

        // Border colors
        border: "#374151",
        borderLight: "#4b5563",

        // Text colors
        textBase: "#f3f4f6",
        textMuted: "#9ca3af",
        textDim: "#6b7280",

        // Semantic colors
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
        info: "#60a5fa",

        // Message bubbles
        sentMessage: "#2c3445",
        receivedMessage: "#3b82f6",
      },
    },
  },
  plugins: [],
};
