import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Sprout } from "lucide-react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sprout className="animate-pulse text-primary" size={40} />
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
