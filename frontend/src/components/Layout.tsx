'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { AuthService } from '../services/AuthService';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const authService = new AuthService();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
    }
  }, []);

  if (!authService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-[200px] flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
