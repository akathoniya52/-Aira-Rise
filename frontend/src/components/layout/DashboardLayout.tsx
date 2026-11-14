'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row antialiased overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-lg focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 w-full overflow-x-hidden">
        <Header />
        <main
          id="main-content"
          className="pt-14 min-h-[calc(100vh-3.5rem)] flex-1 p-2.5 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto overflow-x-hidden"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
