
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassRoom, Student, Evaluation, ExamSession } from '../types';
import { BackIcon } from '../icons/BackIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ClassManagerProps {
  classes: ClassRoom[];
  history: (Evaluation | ExamSession)[];
  onUpdate: (classes: ClassRoom[]) => void;
  onSelectHistory: (id: string) => void;
  onBack: () => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ classes, history, onUpdate, onSelectHistory, onBack }) => {
  const { t, i18n } = useTranslation();
  const [newClassName, setNewClassName] = useState('');
  const [newStudent, setNewStudent] = useState({ studentNumber: '', firstName: '', lastName: '' });
  const [bulkText, setBulkText] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<Student | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const newClass: ClassRoom = {
      id: generateId(),
      name: newClassName.trim(),
      students: []
    };
    onUpdate([...classes, newClass]);
    setNewClassName('');
    setActiveClassId(newClass.id);
  };

  const handleAddStudent = (classId: string) => {
    if (!newStudent.firstName.trim() || !newStudent.lastName.trim() || !newStudent.studentNumber.trim()) return;
    const student: Student = {
      id: generateId(),
      studentNumber: newStudent.studentNumber.trim(),
      firstName: newStudent.firstName.trim(),
      lastName: newStudent.lastName.trim()
    };
    onUpdate(classes.map(c => c.id === classId ? { ...c, students: [...c.students, student] } : c));
    setNewStudent({ studentNumber: '', firstName: '', lastName: '' });
  };

  const handleBulkAdd = (classId: string) => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    const newStudents: Student[] = lines
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const parts = trimmed.split(/\s+/);
        if (parts.length < 2) return null;
        
        const studentNumber = parts.shift() || '';
        const lastName = parts.pop() || '';
        const firstName = parts.join(' ');
        
        return {
          id: generateId(),
          studentNumber,
          firstName,
          lastName
        };
      })
      .filter((s): s is Student => s !== null);

    if (newStudents.length > 0) {
      onUpdate(classes.map(c => c.id === classId ? { ...c, students: [...c.students, ...newStudents] } : c));
    }
    setBulkText('');
    setIsBulkMode(false);
  };

  const handleDeleteClass = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(t('common.confirmDelete'))) {
      const updated = classes.filter(c => c.id !== id);
      onUpdate(updated);
      if (activeClassId === id) setActiveClassId(null);
    }
  };

  const handleDeleteStudent = (e: React.MouseEvent, classId: string, studentId: string) => {
    e.stopPropagation();
    onUpdate(classes.map(c => c.id === classId ? { ...c, students: c.students.filter(s => s.id !== studentId) } : c));
    if (selectedProfileStudent?.id === studentId) setSelectedProfileStudent(null);
  };

  const activeClass = classes.find(c => c.id === activeClassId);

  const studentAttempts = useMemo(() => {
    if (!selectedProfileStudent) return [];
    return history.filter(item => {
      if ('isExam' in item && item.isExam) {
        return (
          item.studentInfo.studentNumber === selectedProfileStudent.studentNumber ||
          (item.studentInfo.firstName === selectedProfileStudent.firstName && item.studentInfo.lastName === selectedProfileStudent.lastName)
        );
      }
      return false;
    }) as ExamSession[];
  }, [selectedProfileStudent, history]);

  const avgScore = useMemo(() => {
    if (studentAttempts.length === 0) return 0;
    return Math.round(studentAttempts.reduce((acc, curr) => acc + curr.overallScore, 0) / studentAttempts.length);
  }, [studentAttempts]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('classes.title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Class List Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass p-6 rounded-2xl border border-white/20 dark:border-slate-800 shadow-sm">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('classes.addClass')}</h3>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder={t('classes.className')}
                  className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddClass()}
                />
                <button onClick={handleAddClass} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95">+</button>
             </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {classes.length === 0 ? (
              <p className="text-center text-slate-500 italic py-10">{t('classes.noClasses')}</p>
            ) : (
              classes.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => { setActiveClassId(c.id); setSelectedProfileStudent(null); }}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${activeClassId === c.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'}`}
                >
                   <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{c.students.length} {t('classes.studentList')}</p>
                   </div>
                   <button onClick={(e) => handleDeleteClass(e, c.id)} className="flex-shrink-0 p-2 text-slate-300 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 ml-4">
                     <TrashIcon className="w-4 h-4" />
                   </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Student List Column */}
        <div className={`${selectedProfileStudent ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
          {activeClass ? (
             <div className="glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl space-y-8 min-h-[600px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate max-w-md">{activeClass.name} - {t('classes.studentList')}</h2>
                   <button onClick={() => setIsBulkMode(!isBulkMode)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                     {isBulkMode ? t('common.cancel') : t('classes.bulkAdd')}
                   </button>
                </div>

                <div className={`grid grid-cols-1 ${selectedProfileStudent ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-8`}>
                   <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
                      {isBulkMode ? (
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t('classes.bulkAdd')}</h4>
                           <p className="text-xs text-slate-400">{t('classes.bulkHelp')}</p>
                           <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={t('classes.bulkPlaceholder')} className="w-full h-48 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono leading-relaxed resize-none" />
                           <button onClick={() => handleBulkAdd(activeClass.id)} disabled={!bulkText.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">{t('common.save')}</button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t('classes.addStudent')}</h4>
                           <div className="space-y-3">
                              <input type="text" placeholder={t('exam.studentNumber')} value={newStudent.studentNumber} onChange={(e) => setNewStudent(prev => ({...prev, studentNumber: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" />
                              <input type="text" placeholder={t('exam.firstName')} value={newStudent.firstName} onChange={(e) => setNewStudent(prev => ({...prev, firstName: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" />
                              <input type="text" placeholder={t('exam.lastName')} value={newStudent.lastName} onChange={(e) => setNewStudent(prev => ({...prev, lastName: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" />
                              <button onClick={() => handleAddStudent(activeClass.id)} disabled={!newStudent.firstName.trim() || !newStudent.lastName.trim() || !newStudent.studentNumber.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">{t('common.save')}</button>
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                      {activeClass.students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-300 opacity-50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                           <p className="text-xs font-bold uppercase tracking-widest">No students yet</p>
                        </div>
                      ) : (
                        [...activeClass.students]
                          .sort((a,b) => (parseInt(a.studentNumber) || 0) - (parseInt(b.studentNumber) || 0))
                          .map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => setSelectedProfileStudent(s)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${selectedProfileStudent?.id === s.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900'}`}
                          >
                             <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold truncate p-1 transition-colors ${selectedProfileStudent?.id === s.id ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                                  {s.studentNumber}
                                </div>
                                <span className="font-semibold">{s.firstName} {s.lastName}</span>
                             </div>
                             <button onClick={(e) => handleDeleteStudent(e, activeClass.id, s.id)} className={`p-2 transition-colors ${selectedProfileStudent?.id === s.id ? 'text-indigo-200 hover:text-white' : 'text-slate-300 hover:text-rose-500'}`}>
                               <TrashIcon className="w-4 h-4" />
                             </button>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-20 glass rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center min-h-[600px]">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-20"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
               <p className="font-bold uppercase tracking-widest text-sm">{t('exam.selectClass')}</p>
            </div>
          )}
        </div>

        {/* Profile Sidebar */}
        {selectedProfileStudent && (
          <div className="lg:col-span-4 animate-fade-in">
             <div className="glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl space-y-8 sticky top-24 min-h-[600px] flex flex-col">
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto shadow-lg shadow-indigo-500/20">
                      {selectedProfileStudent.studentNumber}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {selectedProfileStudent.firstName} {selectedProfileStudent.lastName}
                      </h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{activeClass?.name} Student</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-center">
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter mb-1">{t('classes.avgScore')}</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">%{avgScore}</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{t('classes.totalExams')}</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">{studentAttempts.length}</p>
                   </div>
                </div>

                <div className="flex-1 space-y-4">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">{t('classes.examHistory')}</h4>
                   {studentAttempts.length === 0 ? (
                      <p className="text-sm text-slate-400 italic py-8 text-center">{t('classes.noAttempts')}</p>
                   ) : (
                      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                         {studentAttempts.map(exam => (
                            <button 
                              key={exam.id} 
                              onClick={() => onSelectHistory(exam.id)}
                              className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-500 transition-all text-left group"
                            >
                               <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600">{exam.topic}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">{new Date(exam.date).toLocaleDateString(i18n.language.startsWith('tr') ? 'tr-TR' : 'en-US')}</p>
                               </div>
                               <span className={`ml-4 px-2 py-1 rounded-lg text-xs font-black ${exam.overallScore >= 85 ? 'bg-emerald-50 text-emerald-600' : exam.overallScore >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                  %{exam.overallScore}
                               </span>
                            </button>
                         ))}
                      </div>
                   )}
                </div>

                <button 
                  onClick={() => setSelectedProfileStudent(null)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                   {t('common.cancel')}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManager;
