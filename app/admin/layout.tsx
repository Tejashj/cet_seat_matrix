'use client';

import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';

interface AppAdminLayoutProps {
  children: React.ReactNode;
}

export default function AppAdminLayout({ children }: AppAdminLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
