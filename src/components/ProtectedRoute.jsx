// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { magic } from '../../magic';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    magic.user.isLoggedIn().then(setIsAuthenticated);
  }, []);

  if (isAuthenticated === null) return <p>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}
