'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, UserRole } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setSessionCookie = () => {
    if (typeof document !== 'undefined') {
      // Lightweight demo session cookie. Routes are gated by middleware.ts; this
      // is not a JWT or a substitute for server-side authentication.
      document.cookie = 'airarise_session=1; path=/; max-age=86400; SameSite=Lax';
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSessionCookie();
    router.push('/');
  };

  const handleQuickLogin = (roleToSelect: UserRole, emailToFill: string) => {
    setEmail(emailToFill);
    setPassword('TestPass123!');
    setRole(roleToSelect);
    setSessionCookie();
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-space-md">
      <div className="w-full max-w-md bg-surface-container-lowest p-space-xl rounded-2xl shadow-lg border border-outline-variant/30 flex flex-col gap-space-lg">
        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-bold shadow-md mb-space-xs">
            <span className="material-symbols-outlined text-[28px]">energy_savings_leaf</span>
          </div>
          <h1 className="text-2xl font-bold font-headline-md text-primary tracking-tight">
            AiraRise
          </h1>
          <span className="text-xs font-semibold text-secondary tracking-wider uppercase font-mono">
            Intelligence OS
          </span>
          <p className="text-xs text-on-surface-variant mt-1">
            Breathe Better. Build a Better Tomorrow.
          </p>
        </div>

        {/* Evaluation Test Credentials Helper Box */}
        <div className="p-3 rounded-xl bg-surface-container-low border border-secondary/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
              Evaluator Quick Access
            </span>
            <span className="text-[10px] text-secondary font-bold">1-Click Test</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Click below to instantly test role-based interventions and custom telemetry workflows:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => handleQuickLogin('ward_officer', 'officer@airarise.test')}
              className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-bold border border-outline-variant/20 text-left transition-colors"
            >
              👑 Ward Officer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('housing_admin', 'housing@airarise.test')}
              className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-bold border border-outline-variant/20 text-left transition-colors"
            >
              🏢 Housing Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('school_admin', 'school@airarise.test')}
              className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-bold border border-outline-variant/20 text-left transition-colors"
            >
              🏫 School Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('field_team', 'field@airarise.test')}
              className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-bold border border-outline-variant/20 text-left transition-colors"
            >
              🚜 Field Team
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-space-sm text-xs" aria-label="Sign in form">
          <div>
            <label htmlFor="login-email" className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@airarise.test"
              className="w-full mt-1 p-2.5 rounded-lg bg-surface/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full mt-1 p-2.5 rounded-lg bg-surface/50 border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            aria-label="Sign In to Environmental Command"
          >
            Sign In to Environmental Command
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
          </button>
        </form>

        <div className="flex justify-between items-center text-[11px] text-on-surface-variant border-t border-outline-variant/10 pt-2">
          <span>Protected Civic Intelligence Session</span>
          <Link href="/register" className="text-secondary font-bold hover:underline">
            Register Division →
          </Link>
        </div>
      </div>
    </div>
  );
}
