import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Evaluation } from '../types';
import { BackIcon } from '../icons/BackIcon';
import { TrashIcon } from '../icons/TrashIcon';
import ProgressChart from './ProgressChart';

interface HistoryViewProps {
  history: Evaluation[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ 
  history, 
  onSelect, 
  onDelete, 
  onClearAll, 
  onBack 
}) => {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  const { bestScore, avgScore, recentCount, recentAvg } = useMemo(() => {
    if (history.length === 0) return { bestScore: null, avgScore: null, recentCount: 0, recentAvg: null };
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = history.filter(e => new Date(e.date).getTime() > sevenDaysAgo);
    const older  = history.filter(e => new Date(e.date).getTime() <= sevenDaysAgo);
    return {
      bestScore:   Math.max(...history.map(e => e.overallScore)),
      avgScore:    Math.round(history.reduce((s, e) => s + e.overallScore, 0) / history.length),
      recentCount: recent.length,
      recentAvg:   recent.length > 0 && older.length > 0
        ? (recent.reduce((s, e) => s + e.overallScore, 0) / recent.length) - (older.reduce((s, e) => s + e.overallScore, 0) / older.length)
        : null,
    };
  }, [history]);

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="flex items-center justify-between bg-white dark:bg-[#212121] px-4 py-3 rounded-xl border border-[#e9e9e7] dark:border-[#2e2e2e] sticky top-[3.75rem] z-30">
        <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-[#f7f7f5] dark:hover:bg-[#2e2e2e] transition-colors"
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-800 dark:text-white">{t('history.title')}</h1>
        </div>
        {history.length > 0 && (
          <div className="relative">
            {showConfirm ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">Emin misiniz?</span>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    onClearAll();
                  }}
                  className="px-3 py-1.5 bg-rose-500 text-white font-bold rounded-lg text-xs hover:bg-rose-600 transition-colors"
                >
                  Evet, Sil
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  İptal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
                className="px-4 py-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors text-sm cursor-pointer"
              >
                {t('common.clearAll')}
              </button>
            )}
          </div>
        )}
      </div>

      {history.length >= 2 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">En Yüksek</p>
              <p className={`text-2xl font-bold ${bestScore !== null && bestScore >= 80 ? 'text-emerald-600' : bestScore !== null && bestScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                {bestScore ?? '—'}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Ortalama</p>
              <p className={`text-2xl font-bold ${avgScore !== null && avgScore >= 80 ? 'text-emerald-600' : avgScore !== null && avgScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                {avgScore ?? '—'}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Toplam</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{history.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Son 7 Gün</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{recentCount}</p>
                {recentAvg !== null && (
                  <span className={`text-xs font-semibold ${recentAvg > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {recentAvg > 0 ? `↑` : `↓`}{Math.abs(Math.round(recentAvg))} pt
                  </span>
                )}
              </div>
            </div>
          </div>
          <ProgressChart history={history} />
        </>
      )}

      {history.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-[#e9e9e7] dark:border-[#2e2e2e] bg-white dark:bg-[#212121]">
          <div className="w-14 h-14 bg-[#f7f7f5] dark:bg-[#2e2e2e] rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">{t('history.empty')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-center text-xs text-slate-400 sm:hidden pb-2 italic">
            Swipe left to delete items
          </p>
          {history.map((item) => (
            <SwipeableHistoryItem 
              key={item.id} 
              item={item} 
              onSelect={onSelect} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SwipeableHistoryItemProps {
  item: Evaluation;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const SwipeableHistoryItem: React.FC<SwipeableHistoryItemProps> = ({ item, onSelect, onDelete }) => {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef<number | null>(null);
  const currentOffset = useRef(0);
  
  // Constants for swipe threshold and max drag
  const DELETE_BTN_WIDTH = 100; 
  const THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    
    const touchCurrent = e.touches[0].clientX;
    const diff = touchCurrent - startX.current;
    
    // Only allow dragging to the left (negative values), up to a limit
    let newOffset = Math.min(0, Math.max(-DELETE_BTN_WIDTH * 1.5, diff));
    
    // Allow closing if already open (starting from negative offset would require more complex state, 
    // simplifying to: always start drag from closed state for now, or just handle toggle)
    // To keep it simple: We just track movement from the touch start point.
    // If we want to support "drag to close", we need to know the initial state.
    // Assuming mostly drag-to-open for this simple implementation.
    
    setOffset(newOffset);
    currentOffset.current = newOffset;
  };

  const handleTouchEnd = () => {
    startX.current = null;
    setIsSwiping(false);
    
    if (currentOffset.current < -THRESHOLD) {
      setOffset(-DELETE_BTN_WIDTH); // Snap open
    } else {
      setOffset(0); // Snap close
    }
    currentOffset.current = 0;
  };

  // Reset swipe on mouse interaction to avoid getting stuck
  const resetSwipe = () => setOffset(0);

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
    if (score >= 60) return 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
    return 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="relative h-20 w-full select-none overflow-hidden rounded-xl group">
      {/* Background (Delete Action) */}
      <div className="absolute inset-y-0 right-0 w-full bg-rose-500 rounded-xl flex items-center justify-end pr-8">
        <button 
          onClick={() => onDelete(item.id)}
          className="flex items-center gap-2 text-white font-bold"
          aria-label={t('common.delete')}
        >
          <TrashIcon className="w-6 h-6" />
          <span>{t('common.delete')}</span>
        </button>
      </div>

      {/* Foreground (Content) */}
      <div 
        className="relative h-full w-full bg-white dark:bg-[#212121] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-xl flex items-center cursor-pointer z-10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
        style={{ 
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
          touchAction: 'pan-y' // Allows vertical scroll, captures horizontal for swipe
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
            if (offset === 0) onSelect(item.id);
            else resetSwipe(); // Close on click if open
        }}
      >
        <div className="flex-1 px-4 flex items-center gap-3 overflow-hidden">
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm border ${getScoreColorClass(item.overallScore)}`}>
              {item.overallScore}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {item.topic}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {new Date(item.date).toLocaleDateString()} · {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
        </div>

        {/* Chevron for desktop indication */}
        <div className="px-5 text-slate-300 hidden sm:block">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
           </svg>
        </div>

        {/* Desktop delete button (hover) */}
        <div className="hidden sm:flex absolute right-2 inset-y-2 pl-6 bg-gradient-to-l from-white via-white to-transparent dark:from-[#212121] dark:via-[#212121] opacity-0 group-hover:opacity-100 transition-opacity items-center">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(t('common.confirmDelete'))) onDelete(item.id);
                }}
                className="p-1.5 bg-[#f7f7f5] hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-[#e9e9e7] dark:border-[#2e2e2e] dark:bg-[#2e2e2e] dark:hover:bg-rose-900/30 dark:text-slate-500 dark:hover:text-rose-400"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;