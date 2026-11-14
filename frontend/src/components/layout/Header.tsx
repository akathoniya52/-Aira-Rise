'use client';

import React from 'react';
import { useApp, UserRole, Language } from '@/context/AppContext';

export default function Header() {
  const { role, setRole, language, setLanguage, activeRegion, setActiveRegion, setIsMobileMenuOpen } = useApp();

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-14 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 z-30 px-2 sm:px-4 lg:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Hamburger & Brand/Region */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-primary hover:bg-surface-container active:scale-95 transition-all"
          aria-label="Open mobile menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Brand Title (Mobile only) */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-on-primary font-bold text-[11px] shadow-xs">
            AR
          </div>
          <span className="font-bold text-xs sm:text-sm text-primary tracking-tight">AiraRise</span>
        </div>

        {/* Active Region Dropdown (Hidden on mobile < 640px to prevent clutter) */}
        <div className="hidden md:flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-outline-variant/20 shadow-xs">
          <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider leading-none">Region</span>
            <select
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              className="bg-transparent text-[11px] font-semibold text-primary focus:outline-none cursor-pointer"
              aria-label="Select civic region"
            >
              <option value="Mumbai Central - Ward F-North">Mumbai Central - Ward F-North</option>
              <option value="Kingsway & Wadala West">Kingsway & Wadala West</option>
              <option value="Dadar Transit Corridor">Dadar Transit Corridor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Controls: Role & Language Selectors */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Role Switcher */}
        <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-full border border-outline-variant/20 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shrink-0" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="bg-transparent text-[11px] font-semibold text-on-surface focus:outline-none cursor-pointer max-w-[95px] sm:max-w-none"
            aria-label="Select active user role"
          >
            <option value="ward_officer">Ward Officer</option>
            <option value="housing_admin">Housing Admin</option>
            <option value="school_admin">School Admin</option>
            <option value="field_team">Field Team</option>
          </select>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-0.5 bg-surface-container-lowest px-1.5 py-1 rounded-lg border border-outline-variant/20 shadow-xs">
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">translate</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent text-[10px] sm:text-[11px] font-medium text-on-surface focus:outline-none cursor-pointer"
            aria-label="Select interface language"
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>

        {/* Profile Avatar */}
        <div
          className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs cursor-pointer"
          title="Executive Officer Sharma"
          aria-label="User account profile"
        >
          AS
        </div>
      </div>
    </header>
  );
}
