
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPEAKING_TOPICS, CRITERIA } from './constants';
import { Evaluation, EvaluationResultData, ExamSession, StudentInfo, ClassRoom, Student } from './types';
import { evaluateSpeech } from './services/geminiService';
import { blobToBase64 } from './utils/audioUtils';

// Components
import TopicSelector from './components/TopicSelector';
import Recorder from './components/Recorder';
import EvaluationResult from './components/EvaluationResult';
import RecentHistory from './components/RecentHistory';
import HistoryView from './components/HistoryView';
import ExamMode from './components/ExamMode';
import ClassManager from './components/ClassManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import FeedbackForm from './components/FeedbackForm';

// Icons
import { Logo } from './icons/Logo';
import { HomeIcon } from './icons/HomeIcon';
import { HistoryIcon } from './icons/HistoryIcon';

type ViewState = 'landing' | 'dashboard' | 'recorder' | 'evaluating' | 'result' | 'history' | 'exam-setup' | 'practice-wheel' | 'exam-result' | 'class-manager' | 'analytics';

const UserPlaceholder = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-full h-full p-2"}
  >
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Application State
  const [view, setView] = useState<ViewState>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Data State
  const [history, setHistory] = useState<(Evaluation | ExamSession)[]>(() => {
    try {
      const saved = localStorage.getItem('history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem('classes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load classes", e);
      return [];
    }
  });
  
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Exam Specific State
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [isStudentMode, setIsStudentMode] = useState(false);

  // Counter State
  const [displayCount, setDisplayCount] = useState(0);
  const targetCount = 2481 + history.length;

  // Loading State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(15);

  // Persistence Effects
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  // URL Hash: shared result detection
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#result=')) {
      try {
        const encoded = hash.slice(8);
        const json = decodeURIComponent(atob(encoded));
        const data: EvaluationResultData = JSON.parse(json);
        setEvaluationData(data);
        setView('result');
        // Clean hash from URL without reload
        window.history.replaceState(null, '', window.location.pathname);
      } catch {
        // Invalid hash, ignore
      }
    }
  }, []);

  // Counter Animation
  useEffect(() => {
    if (view === 'landing') {
      let start = 0;
      const duration = 2000;
      const increment = targetCount / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= targetCount) {
          setDisplayCount(targetCount);
          clearInterval(timer);
        } else {
          setDisplayCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [view, targetCount]);

  // Simulated Progress Logic
  useEffect(() => {
    let progressInterval: any;
    let timeInterval: any;
    if (view === 'evaluating') {
      setLoadingProgress(0);
      setEstimatedTimeLeft(15);
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) return 95;
          const remaining = 100 - prev;
          const increment = Math.max(0.2, remaining / 30); 
          const noise = Math.random() * 0.5;
          return Math.min(95, prev + increment + noise);
        });
      }, 100);
      timeInterval = setInterval(() => {
        setEstimatedTimeLeft((prev) => {
          if (prev <= 1) return 1;
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, [view]);

  const testimonials = useMemo(() => {
    const teachersObj = t('landing.teacherTestimonials', { returnObjects: true }) as any;
    const studentsObj = t('landing.studentTestimonials', { returnObjects: true }) as any;
    if (!teachersObj || !studentsObj) return [];
    
    const allTeachers: any[] = [];
    ['star5', 'star4', 'star3'].forEach(cat => {
      if (teachersObj[cat]) {
        teachersObj[cat].forEach((item: any) => allTeachers.push({ ...item, stars: parseInt(cat.replace('star', '')), type: 'teacher' }));
      }
    });
    
    const allStudents: any[] = [];
    ['star5', 'star4', 'star3'].forEach(cat => {
      if (studentsObj[cat]) {
        studentsObj[cat].forEach((item: any) => allStudents.push({ ...item, stars: parseInt(cat.replace('star', '')), type: 'student' }));
      }
    });

    const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);
    return [...shuffle(allTeachers).slice(0, 3), ...shuffle(allStudents).slice(0, 3)].sort(() => Math.random() - 0.5);
  }, [t, i18n.language]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr');

  const handleStopRecording = async (blob: Blob) => {
    setAudioBlob(blob);
    setView('evaluating');
    setError(null);

    try {
      const base64Audio = await blobToBase64(blob);
      const currentLang = i18n.language.startsWith('tr') ? 'tr' : 'en';
      const topicsObj = SPEAKING_TOPICS[currentLang];
      const allTopics = Object.values(topicsObj).flat();

      const result = await evaluateSpeech(
        base64Audio,
        blob.type,
        currentTopic,
        allTopics as string[],
        currentLang,
        isStudentMode
      );

      const evaluationId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const dateString = new Date().toISOString();

      if (isExamMode && studentInfo) {
        const newExam: ExamSession = {
          ...result,
          id: evaluationId,
          date: dateString,
          studentInfo: studentInfo,
          isExam: true
        };
        setEvaluationData(newExam);
        setHistory(prev => [newExam, ...prev]);
        setLoadingProgress(100);
        setTimeout(() => setView('exam-result'), 500);
      } else {
        const newEvaluation: Evaluation = {
          ...result,
          id: evaluationId,
          date: dateString
        };
        setEvaluationData(result);
        setHistory(prev => [newEvaluation, ...prev]);
        setLoadingProgress(100);
        setTimeout(() => setView('result'), 500);
      }
    } catch (err) {
      setError(t('errors.generic'));
    }
  };

  const handleSelectHistoryItem = (id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      if ('isExam' in item && item.isExam) {
        setStudentInfo(item.studentInfo);
        setIsExamMode(true);
        setEvaluationData(item);
        setAudioBlob(null);
        setView('exam-result');
      } else {
        setEvaluationData(item);
        setAudioBlob(null); 
        setView('result');
        setIsExamMode(false);
      }
    }
  };

  const handleExamComplete = (topic: string, info: StudentInfo | null) => {
    setCurrentTopic(topic);
    if (info) {
      setStudentInfo(info);
      setIsExamMode(true);
      if (info.classId && info.firstName && info.lastName && info.studentNumber) {
        const targetClass = classes.find(c => c.id === info.classId);
        if (targetClass) {
          const exists = targetClass.students.some(s => 
            (s.firstName.toLowerCase() === info.firstName!.toLowerCase() && 
            s.lastName.toLowerCase() === info.lastName!.toLowerCase()) ||
            s.studentNumber === info.studentNumber
          );
          if (!exists) {
            const newStudent: Student = {
              id: crypto.randomUUID(),
              studentNumber: info.studentNumber!,
              firstName: info.firstName!.trim(),
              lastName: info.lastName!.trim()
            };
            setClasses(prev => prev.map(c => 
              c.id === info.classId ? { ...c, students: [...c.students, newStudent] } : c
            ));
          }
        }
      }
    } else {
      setStudentInfo(null);
      setIsExamMode(false);
    }
    setView('recorder');
  };

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return (
          <div className="flex flex-col items-center space-y-16 md:space-y-24 animate-fade-in relative z-10 pb-24">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center space-y-8 pt-8 md:pt-16 relative w-full px-4">
              <div className="z-30 animate-slide-up">
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/90 backdrop-blur-md border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-black shadow-lg shadow-indigo-500/10">
                   <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                   {t('landing.badge')}
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <div className="relative transform hover:scale-110 transition-transform duration-700 animate-float">
                  <Logo className="md:scale-125" />
                  <div className="absolute -inset-4 bg-indigo-400/20 blur-2xl rounded-full -z-10 animate-pulse-slow"></div>
                </div>
                <div className="space-y-4 max-w-4xl">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.9] drop-shadow-xl mb-4">
                    {t('landing.heroTitle')}
                  </h1>
                  <p className="text-lg md:text-2xl font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    {t('landing.heroDesc')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <button 
                  onClick={() => setView('dashboard')} 
                  className="shimmer-effect group relative overflow-hidden inline-flex items-center justify-center px-12 py-6 text-xl font-black text-white transition-all duration-300 bg-indigo-600 rounded-3xl focus:outline-none hover:bg-indigo-700 shadow-2xl shadow-indigo-500/40 active:scale-95"
                >
                  <span className="relative z-10 flex items-center">
                    {t('landing.startBtn')}
                    <svg className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </span>
                </button>
                <div className="flex items-center gap-5 px-10 py-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl">
                   <div className="text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('dashboard.usageCount')}</p>
                     <p className="text-3xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">{displayCount.toLocaleString()}+</p>
                   </div>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="w-full max-w-5xl mx-auto px-4 space-y-10 relative">
              <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{t('landing.howItWorks')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-bold">{t('landing.howDesc')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex flex-col items-center md:items-start gap-4 p-8 rounded-[2.5rem] glass border border-white/40 dark:border-slate-800 shadow-xl transition-all hover:scale-[1.03] hover:shadow-indigo-500/10 hover:bg-white dark:hover:bg-slate-900/80">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30">
                      {step}
                    </div>
                    <div className="text-center md:text-left mt-2">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t(`landing.step${step}Title`)}</h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">{t(`landing.step${step}Desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Criteria Mesh */}
            <div className="w-full bg-indigo-600/5 dark:bg-indigo-600/10 py-16 border-y border-indigo-100/50 dark:border-indigo-900/50 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-mesh opacity-40"></div>
              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{t('landing.criteriaTitle')}</h2>
                  <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">{t('landing.criteriaDesc')}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Object.keys(CRITERIA[i18n.language.startsWith('tr') ? 'tr' : 'en']).map((key) => (
                    <div key={key} className="group p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col gap-6 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-lg">
                           {key === 'rapport' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                           {key === 'organisation' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                           {key === 'delivery' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                           {key === 'languageUse' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>}
                           {key === 'creativity' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                        </div>
                        <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                           {t(`landing.criteriaDetails.${key}.title`)}
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          {t(`landing.criteriaDetails.${key}.desc`)}
                        </p>
                        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/50">
                          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">💡 {i18n.language === 'tr' ? 'ÖĞRENCİ TÜYOSU' : 'STUDENT TIP'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold italic">
                            {t(`landing.criteriaDetails.${key}.tips`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="w-full max-w-6xl mx-auto px-4 space-y-12 pb-10 relative">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center md:text-left">{t('landing.testimonialsTitle')}</h2>
                  <button onClick={() => setShowFeedback(true)} className="group relative px-8 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-sm border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/5">
                    {t('feedback.writeBtn')}
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {testimonials.map((item, idx) => (
                    <div key={idx} className="flex flex-col p-8 rounded-[3rem] glass border border-white/40 dark:border-slate-800 shadow-lg relative transition-all hover:scale-[1.02] hover:shadow-2xl hover:bg-white dark:hover:bg-slate-900">
                       <div className="flex items-center gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                             <svg key={i} className={`w-5 h-5 ${i < item.stars ? 'text-amber-400' : 'text-slate-100 dark:text-slate-800'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                       </div>
                       <p className="flex-1 text-slate-600 dark:text-slate-300 text-base font-bold italic leading-relaxed mb-8">“{item.comment}”</p>
                       <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${item.type === 'teacher' ? 'bg-indigo-600' : 'bg-purple-600'}`}><UserPlaceholder className="w-8 h-8" /></div>
                          <div>
                             <h4 className="font-bold text-slate-900 dark:text-white leading-none mb-1 text-base">{item.name}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.role}</p>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
            {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
          </div>
        );
      case 'dashboard':
        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-slide-up relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-6">
                 <section className="glass rounded-[2rem] p-1 border border-white/40 dark:border-slate-800 shadow-2xl shadow-indigo-500/5"><TopicSelector 
                      onSelectTopic={setCurrentTopic} 
                      onStart={() => { setIsExamMode(false); setView('recorder'); }}
                      isStudentMode={isStudentMode}
                      setIsStudentMode={setIsStudentMode}
                    /></section>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <section className="glass rounded-[2.5rem] p-8 border border-white/40 dark:border-slate-800 shadow-2xl bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 group hover:scale-[1.02] transition-all">
                        <div className="space-y-5">
                           <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" /></svg></div>
                           <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('dashboard.wheelPractice')}</h2>
                           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('dashboard.wheelPracticeDesc')}</p>
                           <button onClick={() => { setIsExamMode(false); setView('practice-wheel'); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all group-hover:-translate-y-1">{t('exam.startWheel')}</button>
                        </div>
                    </section>
                    <section className="glass rounded-[2.5rem] p-8 border border-white/40 dark:border-slate-800 shadow-2xl bg-gradient-to-br from-purple-500/5 to-indigo-500/5 group hover:scale-[1.02] transition-all">
                        <div className="space-y-5">
                           <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.94 49.94 0 00-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 01-.707 0A50.88 50.88 0 002.75 10.25a.75.75 0 01-.31-1.274A50.39 50.39 0 0111.7 2.805z" /><path d="M13.06 15.473a48.45 48.45 0 017.623-2.662c.034 1.209.034 2.45 0 3.658a47.44 47.44 0 01-5.293 3.048.75.75 0 01-.654 0l-2.48-1.481a48.04 48.04 0 01-5.132-3.413 47.44 47.44 0 001.088-6.23l1.266-.735a44.86 44.86 0 009.262 3.25c.01.658.01 1.333 0 2.022a48.837 48.837 0 01-5.68 2.593z" /></svg></div>
                           <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('dashboard.examMode')}</h2>
                           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('dashboard.examModeDesc')}</p>
                           <button onClick={() => { setIsExamMode(true); setView('exam-setup'); }} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/20 transition-all group-hover:-translate-y-1">{t('exam.beginExam')}</button>
                        </div>
                    </section>
                 </div>
                 <section className="flex flex-wrap gap-6">
                    <button onClick={() => setView('class-manager')} className="flex-1 min-w-[160px] px-8 py-6 bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all flex flex-col items-center gap-3 group">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg></div>
                       <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-widest">{t('dashboard.manageClasses')}</span>
                    </button>
                    <button onClick={() => setView('analytics')} className="flex-1 min-w-[160px] px-8 py-6 bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all flex flex-col items-center gap-3 group">
                       <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg></div>
                       <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-widest">{t('dashboard.analytics')}</span>
                    </button>
                 </section>
              </div>
              <div className="md:col-span-4 space-y-4">
                 <RecentHistory history={history} onSelect={handleSelectHistoryItem} />
                 <button onClick={() => setView('history')} className="w-full py-5 px-4 rounded-[1.5rem] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-[10px] shadow-sm"><HistoryIcon className="w-4 h-4" /> {t('common.viewAllHistory')}</button>
              </div>
            </div>
          </div>
        );
      case 'class-manager': return <ClassManager classes={classes} history={history} onUpdate={setClasses} onSelectHistory={handleSelectHistoryItem} onBack={() => setView('dashboard')} />;
      case 'analytics': return <AnalyticsDashboard history={history} classes={classes} onBack={() => setView('dashboard')} />;
      case 'exam-setup': return <div className="max-w-4xl mx-auto py-8 animate-fade-in relative z-10"><ExamMode classes={classes} onComplete={handleExamComplete} onCancel={() => { setIsExamMode(false); setView('dashboard'); }} mode="exam" isStudentMode={isStudentMode} setIsStudentMode={setIsStudentMode}/></div>;
      case 'practice-wheel': return <div className="max-w-4xl mx-auto py-8 animate-fade-in relative z-10"><ExamMode classes={[]} onComplete={handleExamComplete} onCancel={() => setView('dashboard')} mode="practice" isStudentMode={isStudentMode} setIsStudentMode={setIsStudentMode}/></div>;
      case 'recorder': return <div className="max-w-4xl mx-auto py-8 animate-fade-in relative z-10"><Recorder topic={currentTopic} onStop={handleStopRecording} onCancel={() => setView('dashboard')}/></div>;
      case 'evaluating':
        const radius = 70; const circumference = 2 * Math.PI * radius; const strokeDashoffset = circumference - (loadingProgress / 100) * circumference;
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in relative z-10">
            {error ? (
              <div className="text-center space-y-6 max-w-md px-4 glass p-8 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 shadow-2xl">
                <div className="w-20 h-20 mx-auto bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{t('errors.generic')}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{error}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button onClick={() => audioBlob && handleStopRecording(audioBlob)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    {t('common.retry')}
                  </button>
                  <button onClick={() => setView('dashboard')} className="px-8 py-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold transition-all active:scale-95">
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-64 h-64 flex items-center justify-center"><div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-30 rounded-full animate-pulse-slow"></div><svg className="w-full h-full relative z-10" viewBox="0 0 224 224"><circle cx="112" cy="112" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" /><circle cx="112" cy="112" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="text-indigo-600 dark:text-indigo-500 transition-all duration-300 ease-linear origin-center -rotate-90" /><text x="112" y="112" textAnchor="middle" dominantBaseline="middle" dy=".1em" className="text-5xl font-extrabold fill-slate-800 dark:fill-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(loadingProgress)}%</text></svg></div><div className="text-center space-y-4 max-w-sm px-4"><h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter animate-pulse">{progressText(loadingProgress)}</h2><div className="inline-block px-6 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 shadow-sm"><p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{t('dashboard.estimatedTime', { seconds: estimatedTimeLeft })}</p></div></div>
              </>
            )}
          </div>
        );
      case 'result':
      case 'exam-result': return evaluationData ? (<div className="max-w-5xl mx-auto py-4 animate-fade-in relative z-10 print:m-0 print:p-0"><EvaluationResult data={evaluationData} audioBlob={audioBlob} onBack={() => { setView('dashboard'); setIsExamMode(false); setStudentInfo(null); }} isExam={isExamMode} studentInfo={studentInfo}/></div>) : null;
      case 'history': return (<div className="max-w-5xl mx-auto py-4 animate-fade-in relative z-10"><HistoryView history={history} onSelect={handleSelectHistoryItem} onDelete={(id) => setHistory(prev => prev.filter(i => i.id !== id))} onClearAll={() => setHistory([])} onBack={() => setView('dashboard')}/></div>);
      default: return null;
    }
  };

  const progressText = (p: number) => {
    if (p < 25) return t('dashboard.processingSteps.uploading');
    if (p < 60) return t('dashboard.processingSteps.transcribing');
    if (p < 90) return t('dashboard.processingSteps.analyzing');
    return t('dashboard.processingSteps.finalizing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative font-sans print:bg-white">
      {/* Subtle mesh background */}
      <div className="fixed inset-0 pointer-events-none print:hidden z-0">
        <div className="absolute inset-0 bg-mesh opacity-20"></div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm transition-colors duration-300 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 cursor-pointer" onClick={() => { setView('landing'); setIsExamMode(false); }}><Logo /><div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div><span className="text-xs md:text-sm font-black text-slate-500 dark:text-slate-400 tracking-wide uppercase">{t('app.subtitle')}</span></div>
          <div className="flex items-center gap-2 sm:gap-3">
            {view !== 'landing' && <button onClick={() => { setView('dashboard'); setIsExamMode(false); }} className="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-all duration-300" title="Home"><HomeIcon className="w-5 h-5" /></button>}
            <button onClick={() => { setView('history'); setIsExamMode(false); }} className="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-all duration-300" title="History"><HistoryIcon className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button onClick={toggleTheme} className="p-3 text-amber-500 hover:bg-amber-50 dark:text-slate-300 dark:hover:text-amber-400 dark:hover:bg-slate-800/50 rounded-2xl transition-all duration-300" title="Toggle Theme">{theme === 'light' ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>}</button>
            <button onClick={toggleLanguage} className="ml-1 px-5 py-2.5 text-sm font-black tracking-widest text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm">{i18n.language === 'tr' ? 'TR' : 'EN'}</button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 relative z-10 print:p-0 print:max-w-none">
        {renderContent()}
      </main>

      <footer className="w-full py-10 text-center relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Built with <span className="font-semibold text-sky-500">React</span>, <span className="font-semibold text-blue-500">TypeScript</span> & <span className="font-semibold text-cyan-500">Tailwind</span> by <a href="https://instagram.com/can_akalin" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-200 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1 underline underline-offset-4 decoration-indigo-500/30">Can AKALIN</a></p>
        </div>
      </footer>
    </div>
  );
};

export default App;
