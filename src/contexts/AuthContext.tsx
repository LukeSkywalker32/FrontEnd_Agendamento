import { createContext, type ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

interface User {
   id: string;
   name: string;
   email: string;
   role: "admin" | "company" | "carrier" | "driver";
}

interface AuthContextData {
   user: User | null;
   token: string | null;
   isAuthenticated: boolean;
   login: (email: string, password: string) => Promise<User>;
   logout: () => void;
}
interface AuthProviderProps {
   children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
   const [user, setUser] = useState<User | null>(null);
   const [token, setToken] = useState<string | null>(null);

   const isAuthenticated = !!user;

   //Recuperar sessão ao iniciar
   useEffect(() => {
      const storedUser = localStorage.getItem("@SATA:user");
      const storedToken = localStorage.getItem("@SATA:token");

      if (storedUser && storedToken) {
         setUser(JSON.parse(storedUser));
         setToken(storedToken);
         api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      }
   }, []);

   //login
   async function login(email: string, password: string): Promise<User> {
      const response = await api.post("auth/login", {
         email,
         password,
      });
      const { user, tokens } = response.data;
      const token = tokens.access;
      setUser(user);
      setToken(token);

      localStorage.setItem("@SATA:user", JSON.stringify(user));
      localStorage.setItem("@SATA:token", token);

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      return user;
   }

   //logout
   function logout() {
      setUser(null);
      setToken(null);
      localStorage.removeItem("@SATA:user");
      localStorage.removeItem("@SATA:token");
      //delete api.defaults.headers.common.Authorization;
   }

   return (
      <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
         {children}
      </AuthContext.Provider>
   );
}
