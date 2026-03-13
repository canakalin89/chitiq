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
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#e9e9e7] dark:border-[#2e2e2e]">
        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
          <HistoryIcon className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-sm text-slate-800 dark:text-white">{t('dashboard.recentAttempts')}</h2>
      </div>

      <div className="space-y-2">
        {recentItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full text-left px-3 py-2.5 rounded-lg border border-[#e9e9e7] dark:border-[#2e2e2e] hover:border-indigo-200 dark:hover:border-indigo-800 bg-[#f7f7f5] dark:bg-[#1a1a1a] hover:bg-white dark:hover:bg-[#212121] transition-all flex justify-between items-center group"
          >
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.topic}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(item.date).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getScoreColorClass(item.overallScore)}`}>
              {item.overallScore}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentHistory;