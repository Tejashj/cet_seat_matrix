'use client';

import React, { useState } from 'react';
import { authService } from '@/lib/firebase/services/authService';
import { ShieldAlert, KeyRound, Loader2 } from 'lucide-react';

export default function AdminAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto card p-6 md:p-8 space-y-6 shadow-xl border border-zinc-150 dark:border-zinc-800">
      <div className="text-center space-y-2">
        <div className="inline-flex w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 items-center justify-center rounded-xl">
          <KeyRound size={24} />
        </div>
        <h2 className="text-2xl font-black font-display text-zinc-900 dark:text-white">Admin Authorization</h2>
        <p className="text-xs text-zinc-500 max-w-[280px] mx-auto">
          Please authenticate with administrator credentials to manage KCET PDFs and feedback.
        </p>
      </div>

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/50 text-red-600 dark:text-red-400 rounded-lg text-xs">
          <ShieldAlert size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@kcetplanner.com"
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary flex justify-center items-center gap-2 pt-2.5 pb-2.5 font-bold uppercase text-xs tracking-wider"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            'Authorize Access'
          )}
        </button>
      </form>
    </div>
  );
}
