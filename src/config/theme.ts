export const themeConfig = {
    colors: {
        background: "#f1f5f9",  // Base Background (Slate-100)
        foreground: "#0f1729",  // Base Text (Slate-900)
        primary: "#0284c5",     // New Primary Blue
        primaryForeground: "#f0f9ff",
        secondary: "#324052",   // Secondary Slate
        secondaryForeground: "#f8fafc",
        accent: "#f8fafc",      // Accent Background
        border: "#c8d3df",      // Blue-ish Gray Border
        input: "#c8d3df",       // Input Border
        surface: "#f8fafc",     // Card Background
        textSecondary: "#465467", // Secondary Text
        textMuted: "#94a3b8",     // Muted Text
        divider: "#c8d3df",
        ring: "#0284c5",        // Focus Ring
        success: "#0284c5",     // Mapped to primary for now or keep separate if needed, but staying strict to palette
        error: "#db2424",       // Destructive Red
    },
    fonts: {
        sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        serif: "'Crimson Pro', serif",
    },
    spacing: {
        container: "1280px",
        section: "4rem",
    },
    borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.5rem", // Standardized to 0.5rem (8px)
        full: "9999px",
    },
};

export type ThemeConfig = typeof themeConfig;
