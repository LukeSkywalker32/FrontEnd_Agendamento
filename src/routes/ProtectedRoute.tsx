import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks";

interface ProtectedRouteProps {
   allowedRoles?: Array<"admin" | "company" | "carrier" | "driver">;
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
   const { isAAuthenticated, user } = useAuth();

   if (!isAAuthenticated) {
      return <Navigate to="/login" replace />;
   }

   if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
   }

   return <Outlet />;
}
