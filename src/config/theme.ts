export const themeConfig = {
    colors: {
        background: "#FFFFFF",
        foreground: "#1F1F23", // Text Primary
        primary: "#6E026F",     // Brand Anchor
        primaryForeground: "#ffffff",
        secondary: "#F1EEF5",   // Subtle Surface
        secondaryForeground: "#1F1F23",
        accent: "#FA891A",
        border: "#E5E7EB",
        input: "#F1EEF5",       // Using Subtle Surface for inputs
        surface: "#F8F7FA",     // Cards, sections
        textSecondary: "#4B5563",
        textMuted: "#6B7280",
        divider: "#EDE9F0",
        ring: "#6E026F",
        success: "#22c55e",
        error: "#ef4444",
    },
    fonts: {
        sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
    spacing: {
        container: "1280px",
        section: "4rem",
    },
    borderRadius: {
        sm: "0.25rem", // 4px
        md: "0.5rem",  // 8px
        lg: "0.75rem", // 12px
        full: "9999px",
    },
};

export type ThemeConfig = typeof themeConfig;
