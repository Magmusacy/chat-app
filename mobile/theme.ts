export const theme = {
  colors: {
    // Base colors
    background: "#23293a", // Deep navy blue (app background)
    surface: "#2c3445", // Slightly lighter than background (cards, modals)
    surfaceLight: "#343c50", // Even lighter (input fields, active elements)

    // Brand/accent colors
    primary: "#3b82f6", // Bright blue (main accent, buttons, links)
    secondary: "#7c3aed", // Purple (secondary accent)
    tertiary: "#06b6d4", // Cyan (additional accent)

    // Border colors
    border: "#374151", // Standard border
    borderLight: "#4b5563", // Lighter border for contrast elements

    // Text colors
    text: "#f3f4f6", // Primary text (white with slight blue tint)
    textMuted: "#9ca3af", // Secondary/muted text
    textDim: "#6b7280", // Dimmed text (placeholders, disabled)

    // Semantic colors
    success: "#10b981", // Green for success states
    error: "#ef4444", // Red for errors
    warning: "#f59e0b", // Amber for warnings
    info: "#60a5fa", // Light blue for info

    // Message bubbles
    sentMessage: "#2c3445", // Dark navy for sent messages (matches surface)
    receivedMessage: "#3b82f6", // Blue for received messages (matches primary)
  },

  // Optional: Add other theme properties
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};
