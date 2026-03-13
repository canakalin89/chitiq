import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EvaluationResultData, StudentInfo } from '../types';
import { BackIcon } from '../icons/BackIcon';
import { CRITERIA } from '../constants';

interface EvaluationResultProps {
  data: EvaluationResultData;
  audioBlob: Blob | null;
  onBack: () => void;
  isExam?: boolean;
  studentInfo?: StudentInfo | null;
}

const criteriaColors: Record<string, { bar: string; badge: string; row: string }> = {
  rapport:      { bar: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',        row: 'hover:bg-amber-50/50 dark:hover:bg-amber-900/10' },
  organisation: { bar: 'bg-sky-400',     badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',                row: 'hover:bg-sky-50/50 dark:hover:bg-sky-900/10' },
  delivery:     { bar: 'bg-rose-400',    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',             row: 'hover:bg-rose-50/50 dark:hover:bg-rose-900/10' },
  languageUse:  { bar: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', row: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10' },
  creativity:   { bar: 'bg-purple-400',  badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',     row: 'hover:bg-purple-50/50 dark:hover:bg-purple-900/10' },
};

const EvaluationResult: React.FC<EvaluationResultProps> = ({
  data,
  audioBlob,
  onBack,
  isExam = false,
  studentInfo = null,
}) => {
  const { t, i18n } = useTranslation();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const langKey = i18n.language.startsWith('tr') ? 'tr' : 'en';

  // Score count-up animation
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * data.overallScore));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [data.overallScore]);

  // Audio URL
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  const handleShare = () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      const url = `${window.location.origin}/#result=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch {
      // fallback: do nothing
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="space-y-4 animate-fade-in pb-12 max-w-3xl mx-auto print:p-0 print:space-y-1 print:pb-0 print:m-0 print:max-w-none">

      {/* === PRINT HEADER === */}
      <div className="hidden print:block space-y-1 mb-2 border-b-2 border-slate-900 pb-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="https://azizsancaranadolu.meb.k12.tr/meb_iys_dosyalar/59/11/765062/dosyalar/2025_11/03215750_speaksmartaltlogo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none mb-0.5">
                {studentInfo ? t('exam.reportTitle') : t('evaluation.reportTitle')}
              </h1>
              <p className="text-slate-500 font-bold tracking-widest uppercase text-[6px]">ChitIQ AI Speaking Analytics</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-bold text-slate-400 uppercase leading-none mb-0.5">{t('exam.examDate')}</p>
            <p className="text-[10px] font-bold text-slate-900 leading-none">{new Date().toLocaleDateString(langKey === 'tr' ? 'tr-TR' : 'en-US')}</p>
          </div>
        </div>
        {studentInfo ? (
          <div className="grid grid-cols-5 gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <div><p className="text-[5px] font-bold text-slate-400 uppercase mb-0.5">{t('exam.studentNumber')}</p><p className="text-[8px] font-bold text-slate-900">{studentInfo.studentNumber || '-'}</p></div>
            <div><p className="text-[5px] font-bold text-slate-400 uppercase mb-0.5">{t('exam.firstName')}</p><p className="text-[8px] font-bold text-slate-900 uppercase">{studentInfo.firstName || '-'}</p></div>
            <div><p className="text-[5px] font-bold text-slate-400 uppercase mb-0.5">{t('exam.lastName')}</p><p className="text-[8px] font-bold text-slate-900 uppercase">{studentInfo.lastName || '-'}</p></div>
            <div><p className="text-[5px] font-bold text-slate-400 uppercase mb-0.5">{t('exam.class')}</p><p className="text-[8px] font-bold text-slate-900">{studentInfo.studentClass || '-'}</p></div>
            <div className="text-right border-l border-slate-200 pl-2"><p className="text-[5px] font-bold text-slate-400 uppercase mb-0.5">{t('evaluation.overallScore')}</p><p className="text-base font-black text-indigo-600">%{data.overallScore}</p></div>
          </div>
        ) : (
          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 flex justify-between items-center">
            <div><p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">ASSESSMENT TYPE</p><p className="text-[9px] font-black text-slate-800 uppercase">INDIVIDUAL PRACTICE PERFORMANCE</p></div>
            <div className="text-right"><p className="text-[6px] font-bold text-slate-400 uppercase mb-0.5">{t('evaluation.overallScore')}</p><p className="text-lg font-black text-indigo-600">%{data.overallScore}</p></div>
          </div>
        )}
        <div className="flex gap-2 items-baseline">
          <p className="text-[7px] font-bold text-slate-400 uppercase flex-shrink-0">{t('exam.selectedTopic')}:</p>
          <p className="text-[8px] font-semibold text-slate-700 italic truncate">"{data.topic}"</p>
        </div>
      </div>

      {/* === HIGH SCORE BANNER === */}
      {data.overallScore >= 80 && (
        <div className="py-2.5 px-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-fade-in print:hidden">
          <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm text-center">
            {langKey === 'tr' ? '🎉 Harika bir performans! Tebrikler.' : '🎉 Excellent performance! Well done.'}
          </p>
        </div>
      )}

      {/* === TOP BAR === */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#212121] hover:text-slate-800 dark:hover:text-white transition-all border border-transparent hover:border-[#e9e9e7] dark:hover:border-[#2e2e2e]"
        >
          <BackIcon className="w-4 h-4" />
          {t('common.goBack')}
        </button>
        <h1 className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate min-w-0 flex-1 text-center">{data.topic}</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-[#e9e9e7] dark:border-[#2e2e2e] bg-white dark:bg-[#212121] text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              {copied ? (langKey === 'tr' ? 'Kopyalandı!' : 'Copied!') : (langKey === 'tr' ? 'Paylaş' : 'Share')}
            </button>
            {copied && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none animate-fade-in">
                {langKey === 'tr' ? 'Link kopyalandı' : 'Link copied'}
              </div>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.618 0-1.113-.493-1.12-1.112L5.882 18m11.778 0H5.882" />
            </svg>
            {t('common.print')}
          </button>
        </div>
      </div>

      {/* === SCORE RING + SUMMARY === */}
      <div className="card flex flex-col sm:flex-row items-center gap-6 p-6 print:hidden">
        <div className="flex-shrink-0 relative w-32 h-32">
          <svg viewBox="0 0 192 192" className="w-full h-full">
            <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#e9e9e7] dark:text-[#2e2e2e]" />
            <circle
              cx="96" cy="96" r={radius}
              stroke="currentColor" strokeWidth="8" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${getScoreColor(data.overallScore)} transition-all duration-1000 ease-out origin-center -rotate-90`}
            />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" dy="0.3em"
              className={`text-5xl font-bold ${getScoreColor(data.overallScore)} fill-current`}
              style={{ fontVariantNumeric: 'tabular-nums' }}>
              {displayScore}
            </text>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t('common.summary')}</p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">{data.feedback.summary}</p>
        </div>
      </div>

      {/* === AUDIO PLAYER === */}
      {audioUrl && (
        <div className="card p-4 print:hidden">
          <audio controls src={audioUrl} className="w-full h-10" />
        </div>
      )}

      {/* === CRITERIA ACCORDION === */}
      <div className="card overflow-hidden print:hidden">
        <div className="px-5 py-3 border-b border-[#e9e9e7] dark:border-[#2e2e2e]">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {langKey === 'tr' ? 'Kriter Değerlendirmesi' : 'Criteria Breakdown'}
          </h2>
        </div>
        <div className="divide-y divide-[#e9e9e7] dark:divide-[#2e2e2e]">
          {Object.entries(data.scores).map(([key, score]) => {
            const colors = criteriaColors[key] ?? { bar: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400', row: 'hover:bg-slate-50 dark:hover:bg-slate-800/30' };
            const isOpen = expanded === key;
            return (
              <div key={key}>
                <button
                  className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors ${colors.row} text-left`}
                  onClick={() => setExpanded(isOpen ? null : key)}
                >
                  <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-md ${colors.badge}`}>
                    {score as number}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {/* @ts-ignore */}
                    {CRITERIA[langKey][key]}
                  </span>
                  <div className="w-24 h-1 bg-[#e9e9e7] dark:bg-[#2e2e2e] rounded-full overflow-hidden flex-shrink-0">
                    <div className={`h-full rounded-full ${colors.bar} transition-all duration-700`} style={{ width: `${score}%` }} />
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 bg-[#f7f7f5] dark:bg-[#1a1a1a] animate-fade-in">
                    {/* @ts-ignore */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{data.feedback[key]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* === PRONUNCIATION + TRANSCRIPTION === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
        <div className="card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t('evaluation.pronunciation')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{data.feedback.pronunciation}</p>
        </div>
        <div className="card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t('evaluation.transcription')}</h3>
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap bg-[#f7f7f5] dark:bg-[#1a1a1a] p-3 rounded-lg line-clamp-6">{data.feedback.transcription}</p>
        </div>
      </div>

      {/* === PRINT: Criteria grid === */}
      <div className="hidden print:block">
        <div className="grid grid-cols-3 gap-1 mb-1">
          {Object.entries(data.scores).map(([key, score]) => (
            <div key={key} className="border border-slate-200 p-1.5 rounded-md">
              <div className="flex justify-between items-center mb-0.5">
                {/* @ts-ignore */}
                <h4 className="text-[6.5px] font-bold text-indigo-700 uppercase tracking-tighter">{CRITERIA[langKey][key]}</h4>
                <span className="text-[7px] font-bold text-slate-800">{score as number}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-0.5 mb-0.5 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${score}%` }} />
              </div>
              {/* @ts-ignore */}
              <p className="text-[6px] text-slate-600 leading-tight line-clamp-3">{data.feedback[key]}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="border border-slate-200 p-1.5 rounded-md">
            <h3 className="text-[6.5px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">{t('evaluation.pronunciation')}</h3>
            <p className="text-[6px] text-slate-600 leading-tight">{data.feedback.pronunciation}</p>
          </div>
          <div className="border border-slate-200 p-1.5 rounded-md">
            <h3 className="text-[6.5px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">{t('evaluation.transcription')}</h3>
            <p className="font-mono text-[5px] text-slate-500 leading-tight line-clamp-4">{data.feedback.transcription}</p>
          </div>
        </div>
      </div>

      {/* === SIGNATURE (Exam print only) === */}
      {studentInfo && (
        <div className="hidden print:flex justify-between items-end mt-1 pt-1 border-t border-slate-900">
          <div className="w-1/2">
            <p className="text-[5px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t('exam.teacherNotes')}</p>
            <div className="h-6 border-b border-dashed border-slate-300"></div>
          </div>
          <div className="text-right">
            <p className="text-[5px] font-black text-slate-400 uppercase mb-2 tracking-widest">VERIFICATION / SIGNATURE</p>
            <p className="border-t border-slate-900 pt-0.5 font-black text-slate-900 text-[7px] min-w-[120px] uppercase">COURSE INSTRUCTOR</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationResult;
