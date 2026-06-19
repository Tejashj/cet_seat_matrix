'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/firebase/services/authService';
import AdminAuth from './AdminAuth';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/lib/store/useAppStore';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { darkMode } = useAppStore();

  useEffect(() => {
    // Sync dark mode class
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Listen to Firebase auth changes
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={36} />
          <span className="text-sm font-medium text-zinc-550">Authenticating Admin Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center py-20 px-4 md:px-6">
        <div className="container max-w-6xl mx-auto w-full">
          {user ? (
            children
          ) : (
            <AdminAuth />
          )}
        </div>
      </main>
    </div>
  );
}
