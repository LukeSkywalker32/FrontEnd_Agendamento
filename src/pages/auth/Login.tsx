import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function Login() {
   const { login } = useAuth();
   const navigate = useNavigate();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      try {
         setLoading(true);

         const user = await login(email, password);

         // 🔥 Redireciona baseado no role
         const roleRoutes = {
            admin: "/admin/dashboard",
            company: "/company/dashboard",
            carrier: "/carrier/dashboard",
            driver: "/driver/dashboard",
         };
         navigate(roleRoutes[user.role]);
      } catch (error) {
         // biome-ignore lint/suspicious/noConsole: false positive
         console.error(error);
         alert("Erro ao fazer login");
      } finally {
         setLoading(false);
      }
   }

   return (
      <div>
         <h1>Login</h1>

         <form onSubmit={handleSubmit}>
            <input
               type="email"
               placeholder="Email"
               value={email}
               onChange={e => setEmail(e.target.value)}
            />

            <input
               type="password"
               placeholder="Senha"
               value={password}
               onChange={e => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
               {loading ? "Entrando..." : "Entrar"}
            </button>
         </form>
      </div>
   );
}
