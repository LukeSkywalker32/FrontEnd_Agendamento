export const lightTheme = {
   colors: {
      primary: "#1E40AF",
      primaryHover: "#1D3A9E",
      primaryLight: "#DBEAFE",

      secondary: "#0EA5E9",

      background: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceHover: "#F1F5F9",
      border: "#E2E8F0",

      text: {
         primary: "#0F172A",
         secondary: "#475569",
         muted: "#94A3B8",
         inverse: "#FFFFFF",
      },

      status: {
         success: "#16A34A",
         successBg: "#DCFCE7",
         warning: "#D97706",
         warningBg: "#FEF3C7",
         error: "#DC2626",
         errorBg: "#FEE2E2",
         info: "#0284C7",
         infoBg: "#E0F2FE",
      },

      sidebar: "#1E3A6E",
      sidebarText: "#CBD5E1",
      sidebarActive: "#1E40AF",
   },

   typography: {
      fontFamily: "'Inter', sans-serif",
      sizes: {
         xs: "0.75rem",
         sm: "0.875rem",
         md: "1rem",
         lg: "1.125rem",
         xl: "1.25rem",
         "2xl": "1.5rem",
         "3xl": "1.875rem",
      },
      weights: {
         regular: 400,
         medium: 500,
         semibold: 600,
         bold: 700,
      },
   },

   spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
      "2xl": "48px",
      "3xl": "64px",
   },

   borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      full: "9999px",
   },

   shadows: {
      sm: "0 1px 3px rgba(0,0,0,0.08)",
      md: "0 4px 12px rgba(0,0,0,0.10)",
      lg: "0 8px 24px rgba(0,0,0,0.12)",
   },
};

export const darkTheme: typeof lightTheme = {
   ...lightTheme,
   colors: {
      ...lightTheme.colors,
      primary: "#3B83F6",
      primaryHover: "#2563EB",
      primaryLight: "1E3A5F",

      secondary: "#38BDF8",

      background: "#0F172A",
      surface: "#1E293B",
      surfaceHover: "#293548",
      border: "#334155",

      text: {
         primary: "#F1F5F9",
         secondary: "#94A3B8",
         muted: "#475569",
         inverse: "#0F172A",
      },

      status: {
         success: "#22C55E",
         successBg: "#14532D",
         warning: "#F59E0B",
         warningBg: "#78350F",
         error: "#EF4444",
         errorBg: "#7F1D1D",
         info: "#38BDF8",
         infoBg: "#0C4A6E",
      },

      sidebar: "#0F172A",
      sidebarText: "#94A3B8",
      sidebarActive: "#3B82F6",
   },
};

export type Theme = typeof lightTheme;
