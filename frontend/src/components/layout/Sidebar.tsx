'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isMobileMenuOpen, setIsMobileMenuOpen } = useApp();

  const roleDisplayNames = {
    ward_officer: 'Ward Officer',
    housing_admin: 'Housing Society Admin',
    school_admin: 'School Administrator',
    field_team: 'Ward Field Team'
  };

  const navItems = [
    { label: 'Overview', href: '/', icon: 'grid_view' },
    { label: 'Air Quality Intelligence', href: '/air-quality', icon: 'air' },
    { label: 'Data Upload', href: '/data-upload', icon: 'upload_file' },
    { label: 'AI Insights', href: '/ai-insights', icon: 'psychology', tag: 'AUTO' },
    { label: 'Pollution Hotspots', href: '/pollution-hotspots', icon: 'fmd_bad' },
    { label: 'Action Center', href: '/action-center', icon: 'campaign' },
    { label: 'Reports & Advisories', href: '/reports', icon: 'assignment' },
    { label: 'Historical Comparisons', href: '/historical', icon: 'compare_arrows' },
    { label: 'Settings', href: '/settings', icon: 'tune' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-surface-container-lowest shadow-xl lg:shadow-none border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[20px]">energy_savings_leaf</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-primary tracking-tight leading-tight">
                  AiraRise
                </span>
                <span className="text-[10px] font-semibold text-secondary tracking-wider uppercase font-mono">
                  Intelligence OS
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <p className="px-5 text-[11px] text-on-surface-variant leading-snug">
            Breathe Better. Build a Better Tomorrow.
          </p>

          {/* Divider */}
          <div className="px-5 py-2">
            <div className="h-px w-full bg-surface-container" />
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3 py-1">
            <div className="px-3 pb-1.5">
              <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wider font-mono">
                Civic Navigation
              </span>
            </div>
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.tag && (
                      <span className={`ml-auto text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-secondary text-white' : 'bg-surface-container text-primary'
                      }`}>
                        {item.tag}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile card at bottom */}
          <div className="p-3 bg-surface-container-low/60 mt-auto border-t border-outline-variant/20">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                AS
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface truncate">Officer Sharma</span>
                  <span className="text-[9px] font-mono font-bold text-secondary bg-surface-container px-1 py-0.2 rounded">BMC</span>
                </div>
                <span className="text-[10px] text-on-surface-variant truncate">Ward F-North (Matunga)</span>
                <span className="text-[10px] text-secondary font-semibold truncate">{roleDisplayNames[role]}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px]">
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">tune</span>
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (typeof document !== 'undefined') {
                    document.cookie = 'airarise_session=; path=/; max-age=0; SameSite=Lax';
                  }
                  setIsMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="flex items-center gap-1 text-error font-medium hover:underline"
              >
                <span className="material-symbols-outlined text-[15px]">logout</span>
                Switch Role
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
