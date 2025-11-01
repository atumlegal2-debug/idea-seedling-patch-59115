import { useUser } from "@/contexts/UserContext";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  isProfessorRoute?: boolean;
}

const ProtectedRoute = ({ isProfessorRoute }: ProtectedRouteProps) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-bold text-gradient-arcane">
            Carregando Academia...
          </h1>
          <p className="text-muted-foreground">Verificando suas credenciais arcanas.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If isProfessorRoute is defined, we do a role check
  if (isProfessorRoute === true && !user.isProfessor) {
    // Student trying to access professor route
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isProfessorRoute === false && user.isProfessor) {
    // Professor trying to access student route
    return <Navigate to="/professor" replace />;
  }

  // If isProfessorRoute is undefined, it's a shared route, so we just render Outlet
  return <Outlet />;
};

export default ProtectedRoute;