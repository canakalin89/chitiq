
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Evaluation, ExamSession, ClassRoom, Student } from '../types';
import { BackIcon } from '../icons/BackIcon';

interface ClassStat {
  id: string;
  name: string;
  count: number;
  avg: number;
  metrics: {
    rapport: number;
    organisation: number;
    delivery: number;
    languageUse: number;
    creativity: number;
  };
}

interface AnalyticsDashboardProps {
  history: (Evaluation | ExamSession)[];
  classes: ClassRoom[];
  onBack: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ history, classes, onBack }) => {
  const { t, i18n } = useTranslation();
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [reportClassId, setReportClassId] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const examData = useMemo(() => history.filter(h => 'isExam' in h && h.isExam) as ExamSession[], [history]);

  // Handle printing trigger
  useEffect(() => {
    if (reportClassId && isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [reportClassId, isPrinting]);

  // Calculate stats
  const classStats = useMemo(() => {
    const stats: Record<string, ClassStat> = {};
    classes.forEach(c => {
      const classExams = examData.filter(e => e.studentInfo.classId === c.id || e.studentInfo.studentClass === c.name);
      const hasExams = classExams.length > 0;
      
      stats[c.id] = {
        id: c.id,
        name: c.name,
        count: classExams.length,
        avg: hasExams ? Math.round(classExams.reduce((acc, curr) => acc + curr.overallScore, 0) / classExams.length) : 0,
        metrics: {
           rapport: hasExams ? Math.round(classExams.reduce((a, b) => a + b.scores.rapport, 0) / classExams.length) : 0,
           organisation: hasExams ? Math.round(classExams.reduce((a, b) => a + b.scores.organisation, 0) / classExams.length) : 0,
           delivery: hasExams ? Math.round(classExams.reduce((a, b) => a + b.scores.delivery, 0) / classExams.length) : 0,
           languageUse: hasExams ? Math.round(classExams.reduce((a, b) => a + b.scores.languageUse, 0) / classExams.length) : 0,
           creativity: hasExams ? Math.round(classExams.reduce((a, b) => a + b.scores.creativity, 0) / classExams.length) : 0,
        }
      };
    });
    return stats;
  }, [examData, classes]);

  const handleToggleComparison = (id: string) => {
    setSelectedClassIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const startPrintProcess = (classId: string) => {
    setReportClassId(classId);
    setIsPrinting(true);
  };

  const reportClass = useMemo(() => classes.find(c => c.id === reportClassId), [classes, reportClassId]);
  
  const reportRows = useMemo(() => {
    if (!reportClass) return [];
    
    return [...reportClass.students]
      .sort((a, b) => {
        const noA = parseInt(a.studentNumber, 10) || 0;
        const noB = parseInt(b.studentNumber, 10) || 0;
        return noA - noB;
      })
      .map(student => {
        const studentExams = examData.filter(e => 
          e.studentInfo.studentNumber === student.studentNumber || 
          (e.studentInfo.firstName.toLowerCase() === student.firstName.toLowerCase() && 
           e.studentInfo.lastName.toLowerCase() === student.lastName.toLowerCase())
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { student, exam: studentExams[0] || null };
      });
  }, [reportClass, examData]);

  return (
    <div className="max-w-7xl mx-auto pb-20 relative">
      <style>{`
        @media print {
          @page { size: A4; margin: 0.5cm; }
          html, body { 
            height: auto !important; 
            overflow: visible !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important; 
          }
          .print-container { 
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
          }
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-bottom: 0 !important;
          }
          th, td { 
            border: 1px solid #000 !important; 
            padding: 2px 4px !important;
            font-size: 10px !important;
          }
          /* Prevent blank 2nd page by avoiding fixed heights */
          .min-h-screen { min-height: 0 !important; }
        }
      `}</style>

      {/* --- DASHBOARD UI --- */}
      <div className="space-y-10 print:hidden animate-fade-in">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <BackIcon className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('analytics.title')}</h1>
        </div>

        {classes.length === 0 ? (
          <div className="glass p-20 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
             <p className="text-slate-400 font-bold uppercase tracking-widest">{t('classes.noClasses')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(classStats).map((stat: ClassStat) => (
              <div key={stat.id} className="glass p-6 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex flex-col items-center text-center">
                 <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">{stat.name}</span>
                 <h2 className="text-4xl font-black text-slate-800 dark:text-white">{stat.avg}</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase mt-1">{t('analytics.averageScore')}</p>
                 <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${stat.avg}%` }}></div></div>
                 <button 
                   onClick={() => startPrintProcess(stat.id)} 
                   className="mt-6 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all w-full border border-indigo-100 flex items-center justify-center gap-2"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.618 0-1.113-.493-1.12-1.112L5.882 18m11.778 0H5.882M6.72 13.829l1.41-5.64m1.41 5.64H14.25m5.341-3.172l-1.41-5.64m1.41 5.64l.842 3.368a1.125 1.125 0 01-1.12 1.405h-1.076M14.25 13.829v-1.125c0-.621.504-1.125 1.125-1.125h1.275m-4.5 1.125v-1.125c0-.621.504-1.125 1.125-1.125H14.25m-2.625 0H12m-2.625 0H9m-2.625 0H6M4.5 9h15M10.125 1.5h3.75a1.125 1.125 0 011.125 1.125v2.625h-6V2.625a1.125 1.125 0 011.125-1.125z" /></svg>
                   {t('classes.classReport')}
                 </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-sm space-y-6">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('analytics.classComparison')}</h3>
             <p className="text-sm text-slate-500">{t('analytics.selectClasses')}</p>
             <div className="space-y-2">
               {Object.entries(classStats).map(([id, stat]) => (
                  <label key={id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedClassIds.includes(id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                     <span className="font-bold text-slate-700 dark:text-slate-200">{(stat as ClassStat).name}</span>
                     <input type="checkbox" checked={selectedClassIds.includes(id)} onChange={() => handleToggleComparison(id)} className="w-5 h-5 text-indigo-600 rounded" />
                  </label>
               ))}
             </div>
          </div>
          <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl overflow-hidden min-h-[400px]">
             <div className="h-full flex flex-col">
                <div className="flex-1 flex items-end justify-around gap-4 pt-10">
                   {selectedClassIds.length === 0 ? (
                      <div className="flex flex-col items-center text-slate-300 opacity-50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg><p className="font-bold text-xs uppercase tracking-widest">Select classes to see comparison</p></div>
                   ) : (
                      selectedClassIds.map(id => {
                         const stat = classStats[id];
                         return (
                            <div key={id} className="flex flex-col items-center w-full max-w-[80px] group">
                               <div className="relative w-full bg-indigo-500 rounded-t-xl transition-all duration-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20" style={{ height: `${stat.avg * 3}px` }}>
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold">{stat.avg}</div>
                               </div>
                               <span className="mt-4 text-xs font-bold text-slate-500 uppercase rotate-45 md:rotate-0 whitespace-nowrap">{stat.name}</span>
                            </div>
                         );
                      })
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- CLASS ACHIEVEMENT REPORT (PRINT ONLY) --- */}
      <div className="hidden print:block print-container">
        {reportClass && (
          <div className="space-y-4 bg-white text-slate-900 w-full">
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
               <div className="flex items-center gap-3">
                  <img 
                    src="https://azizsancaranadolu.meb.k12.tr/meb_iys_dosyalar/59/11/765062/dosyalar/2025_11/03215750_speaksmartaltlogo.png" 
                    alt="Logo" 
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                     <h2 className="text-lg font-black uppercase text-slate-900 leading-none">{t('analytics.classReportTitle')}</h2>
                     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">ChitIQ Teacher Analytics</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-xl font-black text-indigo-600 leading-none">{reportClass.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Students: {reportClass.students.length}</p>
               </div>
            </div>

            <table className="w-full">
               <thead>
                  <tr className="bg-slate-100 border-y-2 border-slate-900">
                     <th className="p-1 text-center font-black uppercase w-10">NO</th>
                     <th className="p-1 text-left font-black uppercase">NAME SURNAME</th>
                     <th className="p-1 text-center font-bold text-[8px] w-12">RAPPORT</th>
                     <th className="p-1 text-center font-bold text-[8px] w-12">ORG.</th>
                     <th className="p-1 text-center font-bold text-[8px] w-12">DELIVERY</th>
                     <th className="p-1 text-center font-bold text-[8px] w-12">LANGUAGE</th>
                     <th className="p-1 text-center font-bold text-[8px] w-12">CREATIVITY</th>
                     <th className="p-1 text-center font-black uppercase bg-indigo-50 w-16">SCORE</th>
                     <th className="p-1 text-center font-bold text-[8px] w-20">DATE</th>
                  </tr>
               </thead>
               <tbody>
                  {reportRows.map((row) => (
                     <tr key={row.student.id} className="border-b border-slate-200">
                        <td className="p-1 text-center font-bold text-slate-900">{row.student.studentNumber}</td>
                        <td className="p-1 font-bold text-slate-900 uppercase">{row.student.firstName} {row.student.lastName}</td>
                        <td className="p-1 text-center text-slate-600">{row.exam?.scores.rapport ?? '-'}</td>
                        <td className="p-1 text-center text-slate-600">{row.exam?.scores.organisation ?? '-'}</td>
                        <td className="p-1 text-center text-slate-600">{row.exam?.scores.delivery ?? '-'}</td>
                        <td className="p-1 text-center text-slate-600">{row.exam?.scores.languageUse ?? '-'}</td>
                        <td className="p-1 text-center text-slate-600">{row.exam?.scores.creativity ?? '-'}</td>
                        <td className="p-1 text-center font-black text-indigo-700 bg-indigo-50/20">
                          {row.exam ? `%${row.exam.overallScore}` : '-'}
                        </td>
                        <td className="p-1 text-center text-[8px] text-slate-400 uppercase">
                           {row.exam ? new Date(row.exam.date).toLocaleDateString(i18n.language.startsWith('tr') ? 'tr-TR' : 'en-US') : '-'}
                        </td>
                     </tr>
                  ))}
               </tbody>
               <tfoot>
                  <tr className="bg-slate-900 text-white font-black border-t-2 border-slate-900">
                     <td colSpan={2} className="p-2 text-[10px] uppercase tracking-widest pl-4">CLASS AVERAGE PERFORMANCE</td>
                     <td className="p-2 text-center">{classStats[reportClass.id]?.metrics.rapport || '-'}</td>
                     <td className="p-2 text-center">{classStats[reportClass.id]?.metrics.organisation || '-'}</td>
                     <td className="p-2 text-center">{classStats[reportClass.id]?.metrics.delivery || '-'}</td>
                     <td className="p-2 text-center">{classStats[reportClass.id]?.metrics.languageUse || '-'}</td>
                     <td className="p-2 text-center">{classStats[reportClass.id]?.metrics.creativity || '-'}</td>
                     <td className="p-2 text-center text-[12px] bg-indigo-600">
                       {classStats[reportClass.id] && classStats[reportClass.id].count > 0 ? `%${classStats[reportClass.id].avg}` : '-'}
                     </td>
                     <td className="p-2"></td>
                  </tr>
               </tfoot>
            </table>

            <div className="flex justify-between items-end pt-4 border-t border-slate-200">
               <div className="w-1/2">
                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-4">Official Assessment Notes</p>
                  <div className="border-b border-dashed border-slate-300 h-10 w-3/4"></div>
               </div>
               <div className="text-right">
                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-4">Instructor Signature</p>
                  <p className="border-t-2 border-slate-900 pt-1 font-black text-slate-900 text-[10px] min-w-[120px]">&nbsp;</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
