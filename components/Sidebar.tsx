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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isTr = language.startsWith('tr');

  const navItems: { view: ViewState; icon: React.ReactNode; label: string; activeColor: string; activeBg: string; dotColor: string }[] = [
    {
      view: 'dashboard',
      label: isTr ? 'Ana Sayfa' : 'Dashboard',
      activeColor: 'text-violet-700 dark:text-violet-300',
      activeBg: 'bg-violet-100 dark:bg-violet-900/30',
      dotColor: 'bg-violet-500',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      view: 'history',
      label: isTr ? 'Geçmiş' : 'History',
      activeColor: 'text-sky-700 dark:text-sky-300',
      activeBg: 'bg-sky-100 dark:bg-sky-900/30',
      dotColor: 'bg-sky-500',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      view: 'exam-setup',
      label: isTr ? 'Sınav Modu' : 'Exam Mode',
      activeColor: 'text-purple-700 dark:text-purple-300',
      activeBg: 'bg-purple-100 dark:bg-purple-900/30',
      dotColor: 'bg-purple-500',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      view: 'class-manager',
      label: isTr ? 'Sınıf Yönetimi' : 'Classes',
      activeColor: 'text-rose-700 dark:text-rose-300',
      activeBg: 'bg-rose-100 dark:bg-rose-900/30',
      dotColor: 'bg-rose-500',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      view: 'analytics',
      label: isTr ? 'Analitik' : 'Analytics',
      activeColor: 'text-emerald-700 dark:text-emerald-300',
      activeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      dotColor: 'bg-emerald-500',
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white dark:bg-[#1e1b2e] shadow-2xl shadow-violet-200/40 dark:shadow-black/50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Navigation sidebar"
      >
        {/* Violet header band */}
        <div className="flex items-center justify-between px-5 h-16 bg-violet-600 flex-shrink-0">
          <span className="text-lg font-black text-white tracking-tight">ChitIQ</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.view);
            return (
              <button
                key={item.view}
                onClick={() => { setView(item.view); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                  active
                    ? `${item.activeBg} ${item.activeColor}`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className={active ? item.activeColor : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span className={`ml-auto w-2 h-2 rounded-full ${item.dotColor}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="flex-shrink-0 px-4 py-4 border-t-2 border-violet-100 dark:border-violet-900/20 space-y-3">
          {/* Theme toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {language.startsWith('tr') ? 'Tema' : 'Theme'}
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-xs font-black text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
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
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {language.startsWith('tr') ? 'Dil' : 'Language'}
            </span>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-xs font-black text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors tracking-wide"
            >
              {language.startsWith('tr') ? 'TR → EN' : 'EN → TR'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 pb-5 pt-2">
          <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">
            ChitIQ v2 · <span className="font-black">chitiq.vercel.app</span>
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
