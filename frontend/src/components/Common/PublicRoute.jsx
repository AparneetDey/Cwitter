import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-[#1d9bf0] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
