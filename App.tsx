
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
import OnboardingModal from './components/OnboardingModal';
import Sidebar from './components/Sidebar';

// Icons
import { Logo } from './icons/Logo';

type ViewState = 'landing' | 'dashboard' | 'recorder' | 'evaluating' | 'result' | 'history' | 'exam-setup' | 'practice-wheel' | 'exam-result' | 'class-manager' | 'analytics';

const UserPlaceholder = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-full h-full p-2"}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Application State
  const [view, setView] = useState<ViewState>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('chitiq_onboarded'));

  // Data State
  const [history, setHistory] = useState<(Evaluation | ExamSession)[]>(() => {
    try {
      const saved = localStorage.getItem('history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem('classes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
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

  // Persistence
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('classes', JSON.stringify(classes)); }, [classes]);

  // URL Hash: shared result
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#result=')) {
      try {
        const encoded = hash.slice(8);
        const json = decodeURIComponent(atob(encoded));
        const data: EvaluationResultData = JSON.parse(json);
        setEvaluationData(data);
        setView('result');
        window.history.replaceState(null, '', window.location.pathname);
      } catch { }
    }
  }, []);

  // Counter animation (landing page)
  useEffect(() => {
    if (view === 'landing') {
      let start = 0;
      const duration = 1800;
      const increment = targetCount / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= targetCount) { setDisplayCount(targetCount); clearInterval(timer); }
        else setDisplayCount(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }
  }, [view, targetCount]);

  // Loading progress
  useEffect(() => {
    let progressInterval: any;
    let timeInterval: any;
    if (view === 'evaluating') {
      setLoadingProgress(0);
      setEstimatedTimeLeft(15);
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) return 95;
          const remaining = 100 - prev;
          return Math.min(95, prev + Math.max(0.2, remaining / 30) + Math.random() * 0.5);
        });
      }, 100);
      timeInterval = setInterval(() => {
        setEstimatedTimeLeft(prev => (prev <= 1 ? 1 : prev - 1));
      }, 1000);
    }
    return () => { clearInterval(progressInterval); clearInterval(timeInterval); };
  }, [view]);

  const testimonials = useMemo(() => {
    const teachersObj = t('landing.teacherTestimonials', { returnObjects: true }) as any;
    const studentsObj = t('landing.studentTestimonials', { returnObjects: true }) as any;
    if (!teachersObj || !studentsObj) return [];
    const allTeachers: any[] = [];
    ['star5', 'star4', 'star3'].forEach(cat => {
      if (teachersObj[cat]) teachersObj[cat].forEach((item: any) =>
        allTeachers.push({ ...item, stars: parseInt(cat.replace('star', '')), type: 'teacher' }));
    });
    const allStudents: any[] = [];
    ['star5', 'star4', 'star3'].forEach(cat => {
      if (studentsObj[cat]) studentsObj[cat].forEach((item: any) =>
        allStudents.push({ ...item, stars: parseInt(cat.replace('star', '')), type: 'student' }));
    });
    const shuffle = (a: any[]) => a.sort(() => Math.random() - 0.5);
    return [...shuffle(allTeachers).slice(0, 2), ...shuffle(allStudents).slice(0, 2)].sort(() => Math.random() - 0.5);
  }, [t, i18n.language]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr');
  const langKey = i18n.language.startsWith('tr') ? 'tr' : 'en';

  const handleStopRecording = async (blob: Blob) => {
    setAudioBlob(blob);
    setView('evaluating');
    setError(null);
    try {
      const base64Audio = await blobToBase64(blob);
      const currentLang = i18n.language.startsWith('tr') ? 'tr' : 'en';
      const allTopics = Object.values(SPEAKING_TOPICS[currentLang]).flat();
      const result = await evaluateSpeech(base64Audio, blob.type, currentTopic, allTopics as string[], currentLang, isStudentMode);
      const evaluationId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const dateString = new Date().toISOString();
      if (isExamMode && studentInfo) {
        const newExam: ExamSession = { ...result, id: evaluationId, date: dateString, studentInfo, isExam: true };
        setEvaluationData(newExam);
        setHistory(prev => [newExam, ...prev]);
        setLoadingProgress(100);
        setTimeout(() => setView('exam-result'), 500);
      } else {
        const newEvaluation: Evaluation = { ...result, id: evaluationId, date: dateString };
        setEvaluationData(result);
        setHistory(prev => [newEvaluation, ...prev]);
        setLoadingProgress(100);
        setTimeout(() => setView('result'), 500);
      }
    } catch { setError(t('errors.generic')); }
  };

  const handleSelectHistoryItem = (id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      if ('isExam' in item && item.isExam) {
        setStudentInfo(item.studentInfo); setIsExamMode(true);
        setEvaluationData(item); setAudioBlob(null); setView('exam-result');
      } else {
        setEvaluationData(item); setAudioBlob(null);
        setView('result'); setIsExamMode(false);
      }
    }
  };

  const handleExamComplete = (topic: string, info: StudentInfo | null) => {
    setCurrentTopic(topic);
    if (info) {
      setStudentInfo(info); setIsExamMode(true);
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
              id: crypto.randomUUID(), studentNumber: info.studentNumber!,
              firstName: info.firstName!.trim(), lastName: info.lastName!.trim()
            };
            setClasses(prev => prev.map(c => c.id === info.classId ? { ...c, students: [...c.students, newStudent] } : c));
          }
        }
      }
    } else { setStudentInfo(null); setIsExamMode(false); }
    setView('recorder');
  };

  const progressText = (p: number) => {
    if (p < 25) return t('dashboard.processingSteps.uploading');
    if (p < 60) return t('dashboard.processingSteps.transcribing');
    if (p < 90) return t('dashboard.processingSteps.analyzing');
    return t('dashboard.processingSteps.finalizing');
  };

  // Criteria pastel colors for landing
  const criteriaColors: Record<string, string> = {
    rapport:      'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    organisation: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
    delivery:     'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
    languageUse:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    creativity:   'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  };

  const renderContent = () => {
    switch (view) {
      // ─── LANDING ───────────────────────────────────────────────────────────
      case 'landing':
        return (
          <div className="animate-fade-in">
            {/* Hero */}
            <section className="max-w-2xl mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                {t('landing.badge')}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#1a1a1a] dark:text-[#e9e9e9] tracking-tight leading-tight mb-4">
                {t('landing.heroTitle')}
              </h1>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                {t('landing.heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setView('dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
                >
                  {t('landing.startBtn')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#212121] border border-[#e9e9e7] dark:border-[#2e2e2e] rounded-lg">
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">{t('dashboard.usageCount')}</span>
                  <span className="text-sm font-bold text-[#1a1a1a] dark:text-[#e9e9e9] tabular-nums">{displayCount.toLocaleString()}+</span>
                </div>
              </div>
            </section>

            {/* How it works */}
            <section className="max-w-2xl mx-auto px-4 pb-12">
              <div className="card p-6 md:p-8">
                <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5">{t('landing.howItWorks')}</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
                        {step}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1a] dark:text-[#e9e9e9]">{t(`landing.step${step}Title`)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t(`landing.step${step}Desc`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Criteria */}
            <section className="max-w-2xl mx-auto px-4 pb-12">
              <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">{t('landing.criteriaTitle')}</h2>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CRITERIA[langKey]).map((key) => (
                  <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    criteriaColors[key] ?? 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  } border-transparent`}>
                    {t(`landing.criteriaDetails.${key}.title`)}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 px-1">{t('landing.criteriaDesc')}</p>
            </section>

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <section className="max-w-2xl mx-auto px-4 pb-16">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('landing.testimonialsTitle')}</h2>
                  <button onClick={() => setShowFeedback(true)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    {t('feedback.writeBtn')}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testimonials.map((item, idx) => (
                    <div key={idx} className="card p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i < item.stars ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic mb-3">"{item.comment}"</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${item.type === 'teacher' ? 'bg-indigo-500' : 'bg-purple-500'}`}>
                          <UserPlaceholder className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#1a1a1a] dark:text-[#e9e9e9]">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
          </div>
        );

      // ─── DASHBOARD ─────────────────────────────────────────────────────────
      case 'dashboard':
        return (
          <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Welcome */}
            <div className="flex items-center justify-between py-4 mb-2">
              <div>
                <h1 className="text-xl font-semibold text-[#1a1a1a] dark:text-[#e9e9e9]">
                  {langKey === 'tr' ? 'Merhaba 👋' : 'Welcome back 👋'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {langKey === 'tr' ? 'Bugün ne pratik yapıyoruz?' : 'What would you like to practice today?'}
                </p>
              </div>
              {history.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{history.length}</span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500 uppercase tracking-wide">
                    {langKey === 'tr' ? 'pratik' : 'sessions'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-4">
                {/* Topic Selector */}
                <div className="card p-1">
                  <TopicSelector
                    onSelectTopic={setCurrentTopic}
                    onStart={() => { setIsExamMode(false); setView('recorder'); }}
                    isStudentMode={isStudentMode}
                    setIsStudentMode={setIsStudentMode}
                  />
                </div>

                {/* Mode cards */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setIsExamMode(false); setView('practice-wheel'); }}
                    className="card p-5 text-left hover:border-indigo-200 dark:hover:border-indigo-800/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-[#1a1a1a] dark:text-[#e9e9e9]">{t('dashboard.wheelPractice')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t('dashboard.wheelPracticeDesc')}</p>
                  </button>
                  <button
                    onClick={() => { setIsExamMode(true); setView('exam-setup'); }}
                    className="card p-5 text-left hover:border-purple-200 dark:hover:border-purple-800/60 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.94 49.94 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.88 50.88 0 002.75 10.25a.75.75 0 01-.31-1.274A50.39 50.39 0 0111.7 2.805z" />
                        <path d="M13.06 15.473a48.45 48.45 0 017.623-2.662c.034 1.209.034 2.45 0 3.658a47.44 47.44 0 01-5.293 3.048.75.75 0 01-.654 0l-2.48-1.481a48.04 48.04 0 01-5.132-3.413 47.44 47.44 0 001.088-6.23l1.266-.735a44.86 44.86 0 009.262 3.25c.01.658.01 1.333 0 2.022a48.837 48.837 0 01-5.68 2.593z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-[#1a1a1a] dark:text-[#e9e9e9]">{t('dashboard.examMode')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t('dashboard.examModeDesc')}</p>
                  </button>
                </div>

                {/* Utility buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setView('class-manager')}
                    className="flex items-center gap-3 px-4 py-3 card hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{t('dashboard.manageClasses')}</span>
                  </button>
                  <button
                    onClick={() => setView('analytics')}
                    className="flex items-center gap-3 px-4 py-3 card hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{t('dashboard.analytics')}</span>
                  </button>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="md:col-span-4 space-y-3">
                <RecentHistory history={history} onSelect={handleSelectHistoryItem} />
                <button
                  onClick={() => setView('history')}
                  className="w-full py-2.5 px-4 card text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('common.viewAllHistory')}
                </button>
              </div>
            </div>
          </div>
        );

      // ─── OTHER VIEWS ────────────────────────────────────────────────────────
      case 'class-manager':
        return <ClassManager classes={classes} history={history} onUpdate={setClasses} onSelectHistory={handleSelectHistoryItem} onBack={() => setView('dashboard')} />;

      case 'analytics':
        return <AnalyticsDashboard history={history} classes={classes} onBack={() => setView('dashboard')} />;

      case 'exam-setup':
        return (
          <div className="max-w-4xl mx-auto py-6 animate-fade-in">
            <ExamMode classes={classes} onComplete={handleExamComplete} onCancel={() => { setIsExamMode(false); setView('dashboard'); }} mode="exam" isStudentMode={isStudentMode} setIsStudentMode={setIsStudentMode} />
          </div>
        );

      case 'practice-wheel':
        return (
          <div className="max-w-4xl mx-auto py-6 animate-fade-in">
            <ExamMode classes={[]} onComplete={handleExamComplete} onCancel={() => setView('dashboard')} mode="practice" isStudentMode={isStudentMode} setIsStudentMode={setIsStudentMode} />
          </div>
        );

      case 'recorder':
        return (
          <div className="max-w-3xl mx-auto py-6 animate-fade-in">
            <Recorder topic={currentTopic} onStop={handleStopRecording} onCancel={() => setView('dashboard')} />
          </div>
        );

      case 'evaluating': {
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (loadingProgress / 100) * circumference;
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
            {error ? (
              <div className="card p-8 max-w-md w-full mx-4 text-center">
                <div className="w-14 h-14 mx-auto bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[#1a1a1a] dark:text-[#e9e9e9] mb-2">{t('errors.generic')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => audioBlob && handleStopRecording(audioBlob)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">{t('common.retry')}</button>
                  <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#2e2e2e] dark:hover:bg-[#3a3a3a] text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">{t('common.cancel')}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 224 224">
                    <circle cx="112" cy="112" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-[#2e2e2e]" />
                    <circle cx="112" cy="112" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="text-indigo-500 transition-all duration-300 ease-linear origin-center -rotate-90" />
                    <text x="112" y="112" textAnchor="middle" dominantBaseline="middle" dy=".1em" className="text-3xl font-semibold fill-[#1a1a1a] dark:fill-[#e9e9e9]" style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(loadingProgress)}%</text>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-[#1a1a1a] dark:text-[#e9e9e9]">{progressText(loadingProgress)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.estimatedTime', { seconds: estimatedTimeLeft })}</p>
                </div>
              </>
            )}
          </div>
        );
      }

      case 'result':
      case 'exam-result':
        return evaluationData ? (
          <div className="max-w-3xl mx-auto py-4 animate-fade-in print:m-0 print:p-0">
            <EvaluationResult data={evaluationData} audioBlob={audioBlob} onBack={() => { setView('dashboard'); setIsExamMode(false); setStudentInfo(null); }} isExam={isExamMode} studentInfo={studentInfo} />
          </div>
        ) : null;

      case 'history':
        return (
          <div className="max-w-3xl mx-auto py-4 animate-fade-in">
            <HistoryView history={history} onSelect={handleSelectHistoryItem} onDelete={(id) => setHistory(prev => prev.filter(i => i.id !== id))} onClearAll={() => setHistory([])} onBack={() => setView('dashboard')} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f5] dark:bg-[#191919] transition-colors duration-300 font-sans print:bg-white">
      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} lang={i18n.language} />}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        view={view}
        setView={setView}
        theme={theme}
        toggleTheme={toggleTheme}
        language={i18n.language}
        toggleLanguage={toggleLanguage}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#191919]/90 border-b border-[#e9e9e7] dark:border-[#2e2e2e] backdrop-blur-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-[#1a1a1a] dark:hover:text-[#e9e9e9] hover:bg-[#f7f7f5] dark:hover:bg-[#2a2a2a] transition-colors"
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setView('landing')}
              className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] dark:text-[#e9e9e9] hover:opacity-75 transition-opacity"
            >
              <Logo />
            </button>
          </div>

          {/* Breadcrumb for non-landing views */}
          {view !== 'landing' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('dashboard')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {langKey === 'tr' ? 'Ana Sayfa' : 'Home'}
              </button>
              {view !== 'dashboard' && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">
                    {view.replace('-', ' ')}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 print:p-0 print:max-w-none">
        {renderContent()}
      </main>

      <footer className="border-t border-[#e9e9e7] dark:border-[#2e2e2e] bg-white dark:bg-[#212121] mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Built with React, TypeScript & Tailwind by{' '}
            <a href="https://instagram.com/can_akalin" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Can AKALIN
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
