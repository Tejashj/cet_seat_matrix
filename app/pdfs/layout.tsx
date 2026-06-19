'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/lib/store/useAppStore';

interface PDFLayoutProps {
  children: React.ReactNode;
}

export default function PDFLayout({ children }: PDFLayoutProps) {
  const { darkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto pt-24 pb-16 px-4 md:px-6">
        {children}
      </main>
    </div>
  );
}
