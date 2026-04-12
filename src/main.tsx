import React from "react";
import ReactDom from "react-dom/client";
import App from "./App.tsx";
import { ThemeContextProvider } from "./contexts/ThemeContext";

ReactDom.createRoot(document.getElementById("root")!).render(
   <React.StrictMode>
      <ThemeContextProvider>
         <App />
      </ThemeContextProvider>
   </React.StrictMode>,
);
