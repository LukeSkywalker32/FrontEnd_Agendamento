import React from "react";
import ReactDom from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ThemeContextProvider } from "./contexts/ThemeContext";

ReactDom.createRoot(document.getElementById("root")!).render(
   <React.StrictMode>
      <ThemeContextProvider>
         <AuthProvider>
            <App />
            <ToastContainer
               position="top-right"
               autoClose={4000}
               hideProgressBar={false}
               newestOnTop
               closeOnClick
               pauseOnHover
               draggable
            />
         </AuthProvider>
      </ThemeContextProvider>
   </React.StrictMode>,
);
