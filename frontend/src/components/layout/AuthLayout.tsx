import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
            <span className="text-xl font-bold text-white tracking-tighter">OR</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Opportunity Radar</h1>
          <p className="mt-2 text-sm text-gray-400">Every opportunity, in one feed.</p>
        </div>
        
        <div className="rounded-xl border border-gray-800 bg-surface shadow-xl p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
