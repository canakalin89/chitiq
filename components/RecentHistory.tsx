import React from 'react';
import { useTranslation } from 'react-i18next';
import { Evaluation } from '../types';
import { HistoryIcon } from '../icons/HistoryIcon';

interface RecentHistoryProps {
  history: Evaluation[];
  onSelect: (id: string) => void;
}

const RecentHistory: React.FC<RecentHistoryProps> = ({ history, onSelect }) => {
  const { t, i18n } = useTranslation();
  const recentItems = history.slice(0, 3);

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (score >= 60) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
  };

  if (history.length === 0) {
    return null;
  }

  const lang = i18n.language.startsWith('tr') ? 'tr-TR' : 'en-US';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
            <HistoryIcon className="w-5 h-5" />
        </div>
        <h2 className="font-bold text-lg">{t('dashboard.recentAttempts')}</h2>
      </div>
      
      <div className="space-y-3">
        {recentItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full text-left p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-800 transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
          >
            <div className="min-w-0 flex-1 pr-4">
              <p className="font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.topic}</p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                {new Date(item.date).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm font-bold ${getScoreColorClass(item.overallScore)}`}>
              {item.overallScore}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentHistory;