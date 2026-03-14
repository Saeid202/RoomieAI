import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();

  // Show loading state while checking
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If required role is specified and doesn't match, redirect to login
  // Check both user_metadata and raw_user_meta_data for role
  const userRole = user.user_metadata?.role || user.raw_user_meta_data?.role;
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
