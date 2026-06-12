import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { role, loading } = useAuth();
  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  if (role !== "admin") return <Navigate to="/dashboard" />;
  return <Outlet />;
}