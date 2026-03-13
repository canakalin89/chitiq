import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SPEAKING_TOPICS } from '../constants';
import { MicIcon } from '../icons/MicIcon';

interface TopicSelectorProps {
  onSelectTopic: (topic: string) => void;
  onStart: () => void;
  isStudentMode: boolean;
  setIsStudentMode: (val: boolean) => void;
  initialTopic?: string;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic, onStart, isStudentMode, setIsStudentMode, initialTopic = '' }) => {
  const { t, i18n } = useTranslation();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState(initialTopic);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedThemes, setExpandedThemes] = useState<string[]>([]);

  const langKey = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const topicsData = SPEAKING_TOPICS[langKey];

  const themeEmojis: Record<string, string> = {
    'School Life': '🏫', 'Okul Hayatı': '🏫',
    'Family Life': '👨‍👩‍👧', 'Aile Hayatı': '👨‍👩‍👧',
    'Universe & Future': '🚀', 'Evren ve Gelecek': '🚀',
    'City & Country': '🏙️', 'Şehir ve Ülke': '🏙️',
    'Sports & Hobbies': '⚽', 'Spor ve Hobiler': '⚽',
    'Technology': '💻', 'Teknoloji': '💻',
    'Environment': '🌿', 'Çevre': '🌿',
    'Health & Lifestyle': '💪', 'Sağlık ve Yaşam': '💪',
    'Arts & Culture': '🎨', 'Sanat ve Kültür': '🎨',
    'Travel': '✈️', 'Seyahat': '✈️',
    'Food & Drink': '🍕', 'Yemek': '🍕',
    'Work & Career': '💼', 'Kariyer': '💼',
    'Social Issues': '🤝', 'Sosyal Konular': '🤝',
    'Media & Entertainment': '🎬', 'Medya': '🎬',
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const next = prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic];
      onSelectTopic(next.join(' & ') || customTopic);
      return next;
    });
  };

  const handleCustomChange = (val: string) => {
    setCustomTopic(val);
    onSelectTopic(val || selectedTopics.join(' & '));
  };

  const toggleTheme = (theme: string) => {
    setExpandedThemes(prev => prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]);
  };

  const filteredTopics = Object.entries(topicsData).reduce((acc, [theme, topics]) => {
    if (!searchQuery) {
      acc[theme] = topics;
    } else {
      const q = searchQuery.toLowerCase();
      const matched = topics.filter(t => t.toLowerCase().includes(q));
      if (matched.length > 0 || theme.toLowerCase().includes(q)) {
        acc[theme] = searchQuery ? matched : topics;
      }
    }
    return acc;
  }, {} as Record<string, string[]>);

  const finalTopic = selectedTopics.length > 0 ? selectedTopics.join(' & ') : customTopic;

  return (
    <div className="card overflow-hidden">
      {/* Violet banner header */}
      <div className="bg-violet-600 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <MicIcon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-base font-black text-white">
          {t('dashboard.selectTask')}
        </h2>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={langKey === 'tr' ? 'Konu ara...' : 'Search topics...'}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Topic list */}
        <div className="relative">
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {Object.entries(filteredTopics).map(([theme, topics]) => (
              <div key={theme}>
                <button
                  onClick={() => toggleTheme(theme)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors text-left"
                >
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    {themeEmojis[theme] ? `${themeEmojis[theme]} ` : ''}{theme}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expandedThemes.includes(theme) || searchQuery ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(expandedThemes.includes(theme) || !!searchQuery) && (
                  <div className="space-y-0.5 py-1 pl-3">
                    {topics.map((topic, idx) => {
                      const selected = selectedTopics.includes(topic);
                      return (
                        <label key={idx} className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${selected ? 'bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'bg-violet-600 border-violet-600' : 'border-slate-300 dark:border-slate-600'}`}>
                            {selected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input type="checkbox" checked={selected} onChange={() => toggleTopic(topic)} className="hidden" />
                          <span className={`text-xs font-semibold leading-tight ${selected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-slate-400'}`}>{topic}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Bottom fade mask */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-[#1e1b2e] to-transparent rounded-b-xl" />
        </div>

        {/* Selected / custom topic */}
        <div className="border-t-2 border-slate-100 dark:border-slate-800 pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {langKey === 'tr' ? 'Seçilen / Özel Konu' : 'Selected / Custom Topic'}
            </span>
            {selectedTopics.length > 0 && (
              <button onClick={() => { setSelectedTopics([]); onSelectTopic(customTopic); }} className="text-xs font-black text-rose-500 hover:text-rose-600">
                {langKey === 'tr' ? 'Temizle' : 'Clear'}
              </button>
            )}
          </div>
          <textarea
            value={finalTopic}
            onChange={(e) => handleCustomChange(e.target.value)}
            rows={2}
            placeholder={langKey === 'tr' ? 'Veya buraya özel bir konu yazın...' : 'Or type a custom topic here...'}
            className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 outline-none transition-all resize-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Student mode */}
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              checked={isStudentMode}
              onChange={(e) => setIsStudentMode(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isStudentMode ? 'bg-violet-600 border-violet-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
              {isStudentMode && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{t('dashboard.studentEvaluationMode')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">{t('dashboard.studentEvaluationModeDesc')}</p>
          </div>
        </label>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={!finalTopic}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-black transition-all ${
            finalTopic
              ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <MicIcon className="w-4.5 h-4.5" />
          {t('dashboard.startRecording')}
        </button>
      </div>
    </div>
  );
};

export default TopicSelector;
