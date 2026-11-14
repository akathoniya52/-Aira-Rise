'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, UserRole } from '@/context/AppContext';

export default function RegisterPage() {
  const router = useRouter();
  const { setRole } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ward_officer');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    if (typeof document !== 'undefined') {
      document.cookie = 'airarise_session=1; path=/; max-age=86400; SameSite=Lax';
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-space-md">
      <div className="w-full max-w-md bg-surface-container-lowest p-space-xl rounded-2xl shadow-lg border border-outline-variant/30 flex flex-col gap-space-lg">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-bold shadow-md mb-space-xs">
            <span className="material-symbols-outlined text-[28px]">energy_savings_leaf</span>
          </div>
          <h1 className="text-2xl font-bold font-headline-md text-primary tracking-tight">
            Register Division
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Provision access to AiraRise Civic Air Quality Intelligence.
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-space-sm text-xs" aria-label="Division registration form">
          <div>
            <label htmlFor="register-name" className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">Officer / User Name</label>
            <input
              id="register-name"
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Officer Sharma"
              className="w-full mt-1 p-2.5 rounded-lg bg-surface/50 border border-outline-variant/30 text-on-surface font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">Official Email</label>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sharma@bmc.gov.in"
              className="w-full mt-1 p-2.5 rounded-lg bg-surface/50 border border-outline-variant/30 text-on-surface font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="register-role" className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">Civic Operational Role</label>
            <select
              id="register-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full mt-1 p-2.5 rounded-lg bg-surface/50 border border-outline-variant/30 text-on-surface font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ward_officer">Municipal Ward Officer</option>
              <option value="housing_admin">Housing Society Administrator</option>
              <option value="school_admin">School Administrator</option>
              <option value="field_team">Ward-Level Field Team</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              className="w-full mt-1 p-2.5 rounded-lg bg-surface/50 border border-outline-variant/30 text-on-surface font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            Create Environmental Command Account
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
          </button>
        </form>

        <div className="flex justify-between items-center text-[11px] text-on-surface-variant border-t border-outline-variant/10 pt-2">
          <span>Already registered?</span>
          <Link href="/login" className="text-secondary font-bold hover:underline">
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
}
