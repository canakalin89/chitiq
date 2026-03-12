import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
      <div className="relative flex items-center justify-center bg-white dark:bg-slate-900 rounded-full w-12 h-12 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
        <img
          src="https://azizsancaranadolu.meb.k12.tr/meb_iys_dosyalar/59/11/765062/dosyalar/2025_11/03215750_speaksmartaltlogo.png"
          alt="ChitIQ Logo"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      ChitIQ
    </span>
  </div>
);