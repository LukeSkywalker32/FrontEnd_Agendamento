import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "../styles/GlobalStyles";
import { darkTheme, lightTheme } from "../styles/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextData {
   mode: ThemeMode;
   toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
   const [mode, setMode] = useState<ThemeMode>(() => {
      const stored = localStorage.getItem("@sata:theme");
      return (stored as ThemeMode) ?? "light";
   });

   useEffect(() => {
      localStorage.setItem("@sata:theme", mode);
   }, [mode]);

   const toggleTheme = () => {
      setMode(prev => (prev === "light" ? "dark" : "light"));
   };

   const theme = mode === "light" ? lightTheme : darkTheme;

   return (
      <ThemeContext.Provider value={{ mode, toggleTheme }}>
         <ThemeProvider theme={theme}>
            <GlobalStyle />
            {children}
         </ThemeProvider>
      </ThemeContext.Provider>
   );
}

export const useTheme = (): ThemeContextData => {
   const context = useContext(ThemeContext);
   if (context === undefined) {
      throw new Error("useTheme deve ser utilizado dentro de um ThemeContextProvider");
   }
   return context;
};
