
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SPEAKING_TOPICS } from '../constants';
import { StudentInfo, ClassRoom } from '../types';
import { BackIcon } from '../icons/BackIcon';

interface ExamModeProps {
  classes: ClassRoom[];
  onComplete: (topic: string, info: StudentInfo | null) => void;
  onCancel: () => void;
  mode?: 'exam' | 'practice';
  isStudentMode: boolean;
  setIsStudentMode: (val: boolean) => void;
}

const ExamMode: React.FC<ExamModeProps> = ({ classes, onComplete, onCancel, mode = 'exam', isStudentMode, setIsStudentMode }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<'setup' | 'wheel'>('setup');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    firstName: '',
    lastName: '',
    studentClass: '',
    studentNumber: '',
    classId: ''
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedThemes, setExpandedThemes] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [confetti, setConfetti] = useState<any[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickAngleRef = useRef(0);

  const langKey = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const topicsData = SPEAKING_TOPICS[langKey];

  const handleToggleQuestion = (question: string) => {
    setSelectedQuestions(prev => prev.includes(question) ? prev.filter(q => q !== question) : [...prev, question]);
  };

  const toggleTheme = (theme: string) => {
    setExpandedThemes(prev => prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]);
  };

  const filteredTopics = Object.entries(topicsData).reduce((acc, [theme, topics]) => {
    const matched = topics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    if (matched.length > 0 || theme.toLowerCase().includes(searchQuery.toLowerCase())) {
      acc[theme] = topics;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const handleAddCustom = () => {
    if (!customQuestion.trim()) return;
    const q = customQuestion.trim();
    if (!selectedQuestions.includes(q)) {
      setSelectedQuestions(prev => [...prev, q]);
    }
    setCustomQuestion('');
  };

  const handleMergeSelected = () => {
    if (selectedQuestions.length < 2) return;
    const merged = selectedQuestions.join(' & ');
    setSelectedQuestions([merged]);
  };

  const handleStartWheel = () => {
    if (selectedQuestions.length < 2) {
      alert(t('exam.minQuestions'));
      return;
    }
    setStep('wheel');
  };

  const playTick = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio tick failed", e);
    }
  };

  const triggerConfetti = () => {
    const pieces = [];
    const colors = ['#f43f5e', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5
      });
    }
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 5000);
  };

  const spinWheel = () => {
    if (isSpinning) return;
    setWinner(null);
    setIsSpinning(true);
    
    // Physics parameters
    const minRotations = 10;
    const maxRotations = 15;
    const extraRotations = (minRotations + Math.random() * (maxRotations - minRotations)) * 360; 
    
    // Calculate winning angle for rebound effect
    const sliceAngle = 360 / selectedQuestions.length;
    const currentRotation = rotation % 360;
    const targetRotation = rotation + extraRotations;
    
    setRotation(targetRotation);
    
    const startTime = performance.now();
    const duration = 5000;
    
    const animateTicks = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < duration) {
        // Cubic ease-out for smooth slowdown
        const t = elapsed / duration;
        const progress = 1 - Math.pow(1 - t, 4);
        const currentTotalRotation = rotation + (targetRotation - rotation) * progress;
        
        if (Math.abs(Math.floor(currentTotalRotation / sliceAngle) - Math.floor(lastTickAngleRef.current / sliceAngle)) >= 1) {
          playTick();
          lastTickAngleRef.current = currentTotalRotation;
        }
        requestAnimationFrame(animateTicks);
      }
    };
    requestAnimationFrame(animateTicks);

    setTimeout(() => {
      setIsSpinning(false);
      const actualDegrees = targetRotation % 360;
      const normalizedTopDegree = (360 - actualDegrees) % 360;
      const winningIndex = Math.floor(normalizedTopDegree / sliceAngle);
      setWinner(selectedQuestions[winningIndex]);
      triggerConfetti();
    }, duration);
  };

  const colors = [
    'linear-gradient(135deg, #6366f1, #4f46e5)', // Indigo
    'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Violet
    'linear-gradient(135deg, #a855f7, #9333ea)', // Purple
    'linear-gradient(135deg, #d946ef, #c026d3)', // Fuchsia
    'linear-gradient(135deg, #ec4899, #db2777)', // Pink
    'linear-gradient(135deg, #f43f5e, #e11d48)', // Rose
  ];

  const handleClassSelect = (classId: string) => {
    const selectedClass = classes.find(c => c.id === classId);
    if (selectedClass) {
      setStudentInfo(prev => ({ ...prev, studentClass: selectedClass.name, classId: selectedClass.id, firstName: '', lastName: '', studentNumber: '' }));
    } else {
      setStudentInfo(prev => ({ ...prev, studentClass: '', classId: '', firstName: '', lastName: '', studentNumber: '' }));
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const activeClass = classes.find(c => c.id === studentInfo.classId);
    const student = activeClass?.students.find(s => s.id === studentId);
    if (student) {
      setStudentInfo(prev => ({ ...prev, firstName: student.firstName, lastName: student.lastName, studentNumber: student.studentNumber }));
    }
  };

  const isSetupValid = () => {
    if (mode === 'practice') return selectedQuestions.length >= 2;
    return selectedQuestions.length >= 2 && studentInfo.firstName && studentInfo.lastName && studentInfo.studentNumber;
  };

  const renderSetup = () => (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><BackIcon className="w-6 h-6" /></button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {mode === 'exam' ? t('exam.title') : t('exam.practiceTitle')}
        </h1>
      </div>
      <div className={`grid grid-cols-1 ${mode === 'exam' ? 'md:grid-cols-2' : ''} gap-8`}>
        {mode === 'exam' && (
          <div className="glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 space-y-6 shadow-xl shadow-indigo-500/5">
            <h3 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
               <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xs">01</div>
               {t('exam.studentInfo')}
            </h3>
            <div className="space-y-5">
              {classes.length > 0 && (
                <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.selectClass')}</label>
                    <select value={studentInfo.classId} onChange={(e) => handleClassSelect(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold transition-all">
                      <option value="">{t('exam.selectClass')}...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {studentInfo.classId && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.selectStudent')}</label>
                      <select onChange={(e) => handleStudentSelect(e.target.value)} value={classes.find(c => c.id === studentInfo.classId)?.students.find(s => s.studentNumber === studentInfo.studentNumber)?.id || ''} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold transition-all">
                        <option value="">{t('exam.selectStudent')}...</option>
                        {[...(classes.find(c => c.id === studentInfo.classId)?.students || [])]
                          .sort((a,b) => (parseInt(a.studentNumber) || 0) - (parseInt(b.studentNumber) || 0))
                          .map(s => <option key={s.id} value={s.id}>{s.studentNumber} - {s.firstName} {s.lastName}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.studentNumber')}</label>
                <input type="text" value={studentInfo.studentNumber} onChange={e => setStudentInfo(prev => ({...prev, studentNumber: e.target.value}))} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="101" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.firstName')}</label>
                <input type="text" value={studentInfo.firstName} onChange={e => setStudentInfo(prev => ({...prev, firstName: e.target.value}))} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="Ahmet" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.lastName')}</label>
                <input type="text" value={studentInfo.lastName} onChange={e => setStudentInfo(prev => ({...prev, lastName: e.target.value}))} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="Yılmaz" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t('exam.class')}</label>
                <input type="text" value={studentInfo.studentClass} onChange={e => setStudentInfo(prev => ({...prev, studentClass: e.target.value}))} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" placeholder="11-A" />
              </div>
              
              {/* Student Evaluation Mode Checkbox */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={isStudentMode}
                      onChange={(e) => setIsStudentMode(e.target.checked)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 dark:border-slate-600 transition-all checked:border-indigo-600 checked:bg-indigo-600"
                    />
                    <svg
                      className="pointer-events-none absolute h-3.5 w-3.5 stroke-white opacity-0 transition-opacity peer-checked:opacity-100 left-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="4"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                      {t('dashboard.studentEvaluationMode')}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                      {t('dashboard.studentEvaluationModeDesc')}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
        <div className={`glass p-8 rounded-3xl border border-white/20 dark:border-slate-800 space-y-6 flex flex-col shadow-xl shadow-purple-500/5 ${mode === 'practice' ? 'w-full' : ''}`}>
          <h3 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center text-white text-xs">
              {mode === 'exam' ? '02' : '01'}
            </div>
            {t('exam.selectQuestions')}
          </h3>
          
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Konu ara..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder={t('exam.addCustom')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
              <button 
                onClick={handleAddCustom}
                disabled={!customQuestion.trim()}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                +
              </button>
            </div>
            
            {selectedQuestions.length >= 2 && (
              <button 
                onClick={handleMergeSelected}
                className="w-full py-2 px-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                {t('exam.mergeSelected')}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar space-y-2">
             {Object.entries(filteredTopics).map(([theme, topics]) => (
               <div key={theme} className="space-y-1">
                 <button 
                   onClick={() => toggleTheme(theme)}
                   className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                 >
                   <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{theme}</span>
                   <svg className={`w-3 h-3 text-slate-400 transition-transform ${expandedThemes.includes(theme) || searchQuery ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </button>
                 
                 {(expandedThemes.includes(theme) || searchQuery) && (
                   <div className="grid grid-cols-1 gap-1 pl-1">
                     {topics.map((q, idx) => (
                       <label key={idx} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedQuestions.includes(q) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                         <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${selectedQuestions.includes(q) ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                           {selectedQuestions.includes(q) && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                         </div>
                         <input type="checkbox" checked={selectedQuestions.includes(q)} onChange={() => handleToggleQuestion(q)} className="hidden" />
                         <span className="text-xs font-bold leading-tight">{q}</span>
                       </label>
                     ))}
                   </div>
                 )}
               </div>
             ))}
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
            <span className="text-sm font-bold text-slate-400">{t('exam.selectedQuestionsCount', { count: selectedQuestions.length })}</span>
            <button 
              onClick={handleStartWheel} 
              disabled={!isSetupValid()} 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              {t('exam.startWheel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWheel = () => {
    const numSlices = selectedQuestions.length; 
    const sliceAngle = 360 / numSlices;
    const lightDots = Array.from({ length: 24 }); // Peripheral lights

    return (
      <div className="flex flex-col items-center justify-center space-y-12 animate-slide-up py-4 relative">
        {/* Confetti Animation Layer */}
        {confetti.map((c) => (
          <div 
            key={c.id} 
            className="confetti-piece animate-confetti" 
            style={{ 
              left: `${c.left}%`, 
              backgroundColor: c.color, 
              width: `${c.size}px`, 
              height: `${c.size}px`, 
              animationDelay: `${c.delay}s` 
            }}
          />
        ))}

        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-2">
            {mode === 'exam' ? 'Sınav Oturumu' : 'Pratik Oturumu'}
          </div>
          {mode === 'exam' ? (
            <>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{studentInfo.firstName} {studentInfo.lastName}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">{studentInfo.studentNumber} • {studentInfo.studentClass}</p>
            </>
          ) : (
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Şans Çarkı</h2>
          )}
        </div>

        <div className="relative group p-10">
          {/* Enhanced Outer Glow and Lights */}
          <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-700 ${isSpinning ? 'bg-indigo-500/30 scale-110' : 'bg-indigo-500/10'}`}></div>
          
          {/* The Pointer */}
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 drop-shadow-2xl transition-transform ${isSpinning ? 'scale-110' : 'scale-100'}`}>
            <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 70L60 0H0L30 70Z" fill="#F43F5E" />
              <path d="M30 60L50 5H10L30 60Z" fill="white" fillOpacity="0.2" />
            </svg>
          </div>

          <div 
            onClick={spinWheel}
            className={`relative w-[320px] h-[320px] sm:w-[540px] sm:h-[540px] rounded-full p-4 bg-white/10 dark:bg-slate-800/20 backdrop-blur-md border-[10px] border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ${!isSpinning ? 'cursor-pointer hover:scale-[1.03] active:scale-95' : 'scale-100 cursor-default'}`}
          >
            {/* Chasing Peripheral Lights */}
            <div className="absolute inset-0 pointer-events-none">
              {lightDots.map((_, i) => (
                <div 
                  key={i} 
                  className={`absolute w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white] transition-opacity duration-300 ${isSpinning ? 'animate-pulse' : ''}`}
                  style={{ 
                    top: '50%', left: '50%', 
                    transform: `translate(-50%, -50%) rotate(${(i * 360) / 24}deg) translate(0, -250px)`,
                    opacity: isSpinning ? (i % 2 === 0 ? 1 : 0.4) : 0.8,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible" style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0, 0.1, 1)' : 'transform 0.5s ease-out' }}>
              <defs>
                {selectedQuestions.map((_, i) => (
                  <radialGradient key={`grad-${i}`} id={`grad-${i}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor={colors[i % colors.length].match(/#\w+/g)![0]} />
                    <stop offset="100%" stopColor={colors[i % colors.length].match(/#\w+/g)![1]} />
                  </radialGradient>
                ))}
                <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {selectedQuestions.map((q, i) => { 
                const startAngle = i * sliceAngle; 
                const endAngle = (i + 1) * sliceAngle; 
                const largeArcFlag = sliceAngle > 180 ? 1 : 0; 
                const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180); 
                const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180); 
                const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180); 
                const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180); 
                
                const isSelected = winner === q;

                return (
                  <g key={`slice-${i}`} className={`transition-all duration-500 ${isSelected ? 'scale-[1.05]' : 'opacity-90'}`}>
                    <path 
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`} 
                      fill={`url(#grad-${i})`} 
                      stroke="rgba(255,255,255,0.2)" 
                      strokeWidth="0.5"
                      filter={isSelected ? "url(#innerGlow)" : ""}
                    />
                    <text 
                      x="82" y="50" 
                      fill="white" 
                      fontSize="2.8" 
                      fontWeight="800" 
                      textAnchor="end" 
                      alignmentBaseline="middle" 
                      transform={`rotate(${startAngle + sliceAngle / 2 - 90}, 50, 50)`} 
                      className="pointer-events-none select-none uppercase tracking-tighter"
                      style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.6)' }}
                    >
                      {q.length > 22 ? q.substring(0, 19) + '...' : q}
                    </text>
                  </g>
                ); 
              })}
              
              {/* Center Hub */}
              <circle cx="50" cy="50" r="10" fill="white" className="dark:fill-slate-900 shadow-2xl" />
              <circle cx="50" cy="50" r="6" fill="currentColor" className={`${isSpinning ? 'text-indigo-500 animate-ping' : 'text-indigo-600'}`} />
            </svg>
          </div>
        </div>
        
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          {winner && !isSpinning ? (
            <div className="space-y-8 text-center animate-fade-in w-full">
              <div className="relative glass p-10 rounded-[3rem] border-4 border-indigo-500 shadow-2xl shadow-indigo-500/40 bg-white/90 dark:bg-slate-900/90 transform scale-110 transition-transform overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                
                <div className="flex justify-center mb-6">
                  <div className="px-6 py-1.5 rounded-full bg-indigo-600 text-white text-sm font-black uppercase tracking-[0.2em] animate-sparkle">
                    SEÇİLEN SORU
                  </div>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-tight drop-shadow-sm italic">"{winner}"</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button onClick={spinWheel} className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black border-2 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-lg">TEKRAR ÇEVİR</button>
                <button 
                  onClick={() => onComplete(winner, mode === 'exam' ? studentInfo : null)} 
                  className="px-16 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-emerald-500/50 transition-all transform hover:scale-110 active:scale-95 flex items-center gap-4 shimmer-effect relative overflow-hidden"
                >
                  <span className="relative z-10">{t('exam.beginExam')}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 relative z-10"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={spinWheel} 
              disabled={isSpinning} 
              className={`relative group overflow-hidden px-20 py-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-[2.5rem] font-black text-3xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${isSpinning ? 'shadow-none opacity-80 cursor-not-allowed grayscale' : 'shadow-indigo-500/40'}`}
            >
              <span className="relative z-10">{isSpinning ? t('exam.spinning') : t('exam.spinWheel')}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-white/30 animate-shimmer"></div>
            </button>
          )}
        </div>
      </div>
    );
  };

  return <div className="w-full pb-20">{step === 'setup' ? renderSetup() : renderWheel()}</div>;
};

export default ExamMode;
