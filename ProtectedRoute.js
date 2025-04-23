import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children, requiredRole }) => {
  // Verificar se o usuário está autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se a rota requer uma função específica
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se está autenticado e tem a função necessária, renderizar o componente filho
  return children;
};

export default ProtectedRoute;
