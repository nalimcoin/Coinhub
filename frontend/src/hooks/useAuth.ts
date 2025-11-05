'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '../services/AuthService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authService = new AuthService();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      if (!authenticated && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    authService,
  };
}
