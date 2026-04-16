import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../components/layout";
import { useAuth } from "../hooks";

// Admin
import { Dashboard } from "../pages/admin/Dashboard";
import { RegisterUser } from "../pages/admin/RegisterUser";
import { AdminSchedulings } from "../pages/admin/Schedulings";
import { Users } from "../pages/admin/Users";

// Auth
import { Login } from "../pages/auth/Login";

// Carrier
import { MeusAgendamentos } from "../pages/carrier/MeusAgendamentos";
import { NovoAgendamento } from "../pages/carrier/NovoAgendamento";

// Checkin
import { Checkin } from "../pages/checkin/Checkin";

// Company
import { Agendamentos } from "../pages/company/Agendamentos";
import { GerenciarSlots } from "../pages/company/GerenciarSlots";

import { ProtectedRoute } from "./ProtectedRoute";

// Redireciona "/" para a rota correta baseada no role do usuário logado
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roleRoutes = {
    admin: "/admin/dashboard",
    company: "/company/agendamentos",
    carrier: "/carrier/meus",
    driver: "/driver/checkin",
  };

  return <Navigate to={roleRoutes[user!.role]} replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />

        <Route path="/driver/checkin" element={<Checkin />} />

        {/* ── Protegidas com Layout ─────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Admin ── acesso total */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              {/* Lista todos os usuários do sistema */}
              <Route path="/admin/users" element={<Users />} />
              {/* Formulário de cadastro de novo usuário */}
              <Route path="/admin/register" element={<RegisterUser />} />
              {/* Todos os agendamentos com filtro */}
              <Route path="/admin/schedulings" element={<AdminSchedulings />} />
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
          </Route>
        </Route>

        {/* ── Fallbacks ─────────────────────────── */}
        <Route path="/unauthorized" element={<p>Acesso não autorizado.</p>} />
        {/* Qualquer rota não mapeada volta para "/" que redireciona pelo role */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
