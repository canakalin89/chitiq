import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SPEAKING_TOPICS } from '../constants';
import { MicIcon } from '../icons/MicIcon';

interface TopicSelectorProps {
  onSelectTopic: (topic: string) => void;
  onStart: () => void;
  isStudentMode: boolean;
  setIsStudentMode: (val: boolean) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic, onStart, isStudentMode, setIsStudentMode }) => {
  const { t, i18n } = useTranslation();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
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
    <div className="w-full bg-white dark:bg-[#212121] rounded-xl p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
          <MicIcon className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold text-[#1a1a1a] dark:text-[#e9e9e9]">
          {t('dashboard.selectTask')}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={langKey === 'tr' ? 'Konu ara...' : 'Search topics...'}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#f7f7f5] dark:bg-[#2a2a2a] border border-[#e9e9e7] dark:border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all text-[#1a1a1a] dark:text-[#e9e9e9] placeholder:text-slate-400"
          />
        </div>

        {/* Topic list */}
        <div className="relative">
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {Object.entries(filteredTopics).map(([theme, topics]) => (
              <div key={theme}>
                <button
                  onClick={() => toggleTheme(theme)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#f7f7f5] dark:hover:bg-[#2a2a2a] transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {themeEmojis[theme] ? `${themeEmojis[theme]} ` : ''}{theme}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expandedThemes.includes(theme) || searchQuery ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(expandedThemes.includes(theme) || !!searchQuery) && (
                  <div className="space-y-0.5 py-1 pl-2">
                    {topics.map((topic, idx) => {
                      const selected = selectedTopics.includes(topic);
                      return (
                        <label key={idx} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${selected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-[#f7f7f5] dark:hover:bg-[#2a2a2a]'}`}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                            {selected && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input type="checkbox" checked={selected} onChange={() => toggleTopic(topic)} className="hidden" />
                          <span className={`text-xs leading-tight ${selected ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>{topic}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Bottom fade mask */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-[#212121] to-transparent rounded-b-lg" />
        </div>

        {/* Selected / custom topic */}
        <div className="border-t border-[#e9e9e7] dark:border-[#2e2e2e] pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {langKey === 'tr' ? 'Seçilen / Özel Konu' : 'Selected / Custom Topic'}
            </span>
            {selectedTopics.length > 0 && (
              <button onClick={() => { setSelectedTopics([]); onSelectTopic(customTopic); }} className="text-xs text-rose-500 hover:text-rose-600 font-medium">
                {langKey === 'tr' ? 'Temizle' : 'Clear'}
              </button>
            )}
          </div>
          <textarea
            value={finalTopic}
            onChange={(e) => handleCustomChange(e.target.value)}
            rows={2}
            placeholder={langKey === 'tr' ? 'Veya buraya özel bir konu yazın...' : 'Or type a custom topic here...'}
            className="w-full px-3 py-2 text-sm bg-[#f7f7f5] dark:bg-[#2a2a2a] border border-[#e9e9e7] dark:border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all resize-none text-[#1a1a1a] dark:text-[#e9e9e9] placeholder:text-slate-400"
          />
        </div>

        {/* Student mode */}
        <label className="flex items-start gap-3 p-3 rounded-lg bg-[#f7f7f5] dark:bg-[#2a2a2a] border border-[#e9e9e7] dark:border-[#3a3a3a] cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              checked={isStudentMode}
              onChange={(e) => setIsStudentMode(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isStudentMode ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#212121]'}`}>
              {isStudentMode && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1a1a1a] dark:text-[#e9e9e9]">{t('dashboard.studentEvaluationMode')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t('dashboard.studentEvaluationModeDesc')}</p>
          </div>
        </label>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={!finalTopic}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors ${
            finalTopic
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-[#2a2a2a] text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <MicIcon className="w-4 h-4" />
          {t('dashboard.startRecording')}
        </button>
      </div>
    </div>
  );
};

export default TopicSelector;
