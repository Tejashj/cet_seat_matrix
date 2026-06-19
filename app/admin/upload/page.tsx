'use client';

import React from 'react';
import PDFUpload from '@/components/PDFSection/PDFUpload';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center gap-1 text-xs text-indigo-650 hover:underline dark:text-indigo-400 font-semibold mb-3"
        >
          <ChevronLeft size={14} />
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-black font-display text-zinc-900 dark:text-white">
          📤 PDF Upload Portal
        </h1>
        <p className="text-xs text-zinc-550">
          Publish and upload new previous year allotment PDF data sets to Firebase Storage.
        </p>
      </div>

      <div className="max-w-3xl">
        <PDFUpload />
      </div>
    </div>
  );
}
