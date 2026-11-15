import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-forest-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-leaf-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-tamil text-cream-200">ஏற்றப்படுகிறது... / Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

