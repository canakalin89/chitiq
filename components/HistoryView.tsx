import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Evaluation } from '../types';
import { BackIcon } from '../icons/BackIcon';
import { TrashIcon } from '../icons/TrashIcon';

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

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24 z-30">
        <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <BackIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('history.title')}</h1>
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

      {history.length === 0 ? (
        <div className="text-center py-24 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 backdrop-blur-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
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
    <div className="relative h-24 w-full select-none overflow-hidden rounded-2xl group">
      {/* Background (Delete Action) */}
      <div className="absolute inset-y-0 right-0 w-full bg-rose-500 rounded-2xl flex items-center justify-end pr-8">
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
        className="relative h-full w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center shadow-sm cursor-pointer z-10"
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
        <div className="flex-1 px-5 flex items-center gap-4 overflow-hidden">
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl font-bold text-lg border ${getScoreColorClass(item.overallScore)}`}>
              {item.overallScore}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate">
                {item.topic}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
        </div>

        {/* Chevron for desktop indication */}
        <div className="px-5 text-slate-300 hidden sm:block">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
           </svg>
        </div>

        {/* Desktop-only delete button (Hover) */}
        <div className="hidden sm:flex absolute right-2 inset-y-2 pl-4 bg-gradient-to-l from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 opacity-0 group-hover:opacity-100 transition-opacity items-center">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(t('common.confirmDelete'))) onDelete(item.id);
                }}
                className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-900/30 dark:text-slate-400 dark:hover:text-rose-400"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;