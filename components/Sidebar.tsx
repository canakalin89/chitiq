import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type ViewState = 'landing' | 'dashboard' | 'recorder' | 'evaluating' | 'result' | 'history' |
  'exam-setup' | 'practice-wheel' | 'exam-result' | 'class-manager' | 'analytics';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  view: ViewState;
  setView: (v: ViewState) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  toggleLanguage: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen, onClose, view, setView, theme, toggleTheme, language, toggleLanguage,
}) => {
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isTr = language.startsWith('tr');

  const navItems: { view: ViewState; icon: React.ReactNode; label: string }[] = [
    {
      view: 'dashboard',
      label: isTr ? 'Ana Sayfa' : 'Dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      view: 'history',
      label: isTr ? 'Geçmiş' : 'History',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      view: 'exam-setup',
      label: isTr ? 'Sınav Modu' : 'Exam Mode',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      view: 'class-manager',
      label: isTr ? 'Sınıf Yönetimi' : 'Classes',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      view: 'analytics',
      label: isTr ? 'Analitik' : 'Analytics',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const isActive = (v: ViewState) => {
    if (v === 'dashboard') return ['dashboard', 'landing', 'recorder', 'evaluating', 'result', 'practice-wheel'].includes(view);
    if (v === 'history') return view === 'history';
    if (v === 'exam-setup') return ['exam-setup', 'exam-result'].includes(view);
    if (v === 'class-manager') return view === 'class-manager';
    if (v === 'analytics') return view === 'analytics';
    return false;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white dark:bg-[#212121] border-r border-[#e9e9e7] dark:border-[#2e2e2e] shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Navigation sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#e9e9e7] dark:border-[#2e2e2e] flex-shrink-0">
          <span className="text-base font-semibold text-[#1a1a1a] dark:text-[#e9e9e9] tracking-tight">ChitIQ</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] dark:hover:text-slate-300 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => { setView(item.view); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive(item.view)
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-[#f7f7f5] dark:hover:bg-[#2a2a2a] hover:text-[#1a1a1a] dark:hover:text-[#e9e9e9]'
              }`}
            >
              <span className={isActive(item.view) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Settings */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-[#e9e9e7] dark:border-[#2e2e2e] space-y-3">
          {/* Theme toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language.startsWith('tr') ? 'Tema' : 'Theme'}
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f7f7f5] dark:bg-[#2a2a2a] rounded-lg border border-[#e9e9e7] dark:border-[#2e2e2e] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333] transition-colors"
            >
              {theme === 'dark' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Language toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language.startsWith('tr') ? 'Dil' : 'Language'}
            </span>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#f7f7f5] dark:bg-[#2a2a2a] rounded-lg border border-[#e9e9e7] dark:border-[#2e2e2e] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333] transition-colors tracking-wide"
            >
              {language.startsWith('tr') ? 'TR → EN' : 'EN → TR'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 pb-5 pt-2">
          <p className="text-[11px] text-slate-400 dark:text-slate-600">
            ChitIQ v2 · <span className="font-medium">chitiq.vercel.app</span>
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
