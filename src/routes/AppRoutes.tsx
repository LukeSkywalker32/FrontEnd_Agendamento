import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../components/layout";
import { useAuth } from "../hooks";
import { Dashboard } from "../pages/admin/Dashboard";
import { Login } from "../pages/auth/Login";
import { MeusAgendamentos } from "../pages/carrier/MeusAgendamentos";
import { NovoAgendamento } from "../pages/carrier/NovoAgendamento";
import { Checkin } from "../pages/checkin/Checkin";
import { Agendamentos } from "../pages/company/Agendamentos";
import { GerenciarSlots } from "../pages/company/GerenciarSlots";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminSchedulings } from "../pages/admin/Schedulings";
import { RegisterUser } from "../pages/admin/RegisterUser";
import { Users } from "../pages/admin/Users";

function RootRedirect() {
   const { isAuthenticated, user } = useAuth();

   if (!isAuthenticated) return <Navigate to="/login" replace />;

   const roleRoutes = {
      admin: "/admin/dashboard",
      company: "/company/agendamentos",
      carrier: "/carrier/meus-agendamentos",
      driver: "/checkin",
   };
   return <Navigate to={roleRoutes[user!.role]} replace />;
}

export function AppRoutes() {
   return (
      <BrowserRouter>
         <Routes>
            {/* Pública*/}
            <Route path="/login" element={<Login />} />
            {/* Rota direciona baseado no role */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protegidas com Layout */}
            <Route element={<ProtectedRoute />}>
               <Route element={<Layout />}>
                  {/* Admin */}
                  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                     <Route path="/admin/dashboard" element={<Dashboard />} />
                     <Route path="/admin/usuarios" element={<Users />} />
                     <Route path="/admin/registrar" element={<RegisterUser />} />
                     <Route path="/admin/agendamentos" element={<AdminSchedulings />} />
                  </Route>

                  {/* Company */}
                  <Route element={<ProtectedRoute allowedRoles={["company"]} />}>
                     <Route path="/company/slots" element={<GerenciarSlots />} />
                     <Route path="/company/agendamentos" element={<Agendamentos />} />
                  </Route>

                  {/* Carrier */}
                  <Route element={<ProtectedRoute allowedRoles={["carrier"]} />}>
                     <Route path="/carrier/novo" element={<NovoAgendamento />} />
                     <Route path="/carrier/meus" element={<MeusAgendamentos />} />
                  </Route>

                  {/* Driver */}
                  <Route element={<ProtectedRoute allowedRoles={["driver"]} />}>
                     <Route path="/driver/checkin" element={<Checkin />} />
                  </Route>
               </Route>
            </Route>

            {/* Fallback */}
            <Route path="/unauthorized" element={<p>Acesso não autorizado.</p>} />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
      </BrowserRouter>
   );
}
