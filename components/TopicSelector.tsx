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
      const merged = next.join(' & ');
      onSelectTopic(merged || customTopic);
      return next;
    });
  };

  const handleCustomChange = (val: string) => {
    setCustomTopic(val);
    const merged = selectedTopics.join(' & ');
    onSelectTopic(val || merged);
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

  const finalTopic = selectedTopics.length > 0 ? selectedTopics.join(' & ') : customTopic;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 transition-all duration-300 border border-slate-100 dark:border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {t('dashboard.selectTask')}
          </h2>
        </div>
      </div>

      <div className="space-y-5">
        {/* Search Bar */}
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
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Topics Checklist */}
        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {Object.entries(filteredTopics).map(([theme, topics]) => (
            <div key={theme} className="space-y-1">
              <button 
                onClick={() => toggleTheme(theme)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
              >
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{themeEmojis[theme] ? `${themeEmojis[theme]} ` : ''}{theme}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedThemes.includes(theme) || searchQuery ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {(expandedThemes.includes(theme) || searchQuery) && (
                <div className="grid grid-cols-1 gap-1 pl-1">
                  {topics.map((topic, idx) => (
                    <label 
                      key={idx} 
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedTopics.includes(topic) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${selectedTopics.includes(topic) ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {selectedTopics.includes(topic) && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                      </div>
                      <input type="checkbox" checked={selectedTopics.includes(topic)} onChange={() => toggleTopic(topic)} className="hidden" />
                      <span className="text-xs font-bold leading-tight">{topic}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Custom / Merged Preview */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seçilen / Özel Konu</span>
            {selectedTopics.length > 0 && (
              <button onClick={() => { setSelectedTopics([]); onSelectTopic(customTopic); }} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest">Temizle</button>
            )}
          </div>
          <textarea 
            value={finalTopic}
            onChange={(e) => handleCustomChange(e.target.value)}
            rows={2}
            placeholder="Veya buraya özel bir konu yazın..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 dark:text-slate-200 resize-none"
          />
        </div>

        {/* Student Evaluation Mode Checkbox */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center mt-1">
              <input
                type="checkbox"
                checked={isStudentMode}
                onChange={(e) => setIsStudentMode(e.target.checked)}
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-slate-300 dark:border-slate-600 transition-all checked:border-indigo-600 checked:bg-indigo-600"
              />
              <svg
                className="pointer-events-none absolute h-4 w-4 stroke-white opacity-0 transition-opacity peer-checked:opacity-100 left-1"
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
              <p className="text-[11px] font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {t('dashboard.studentEvaluationMode')}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-1">
                {t('dashboard.studentEvaluationModeDesc')}
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={onStart}
          disabled={!finalTopic}
          className={`
            w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-lg tracking-wide transition-all duration-300
            ${finalTopic 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:scale-[1.02]' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}
          `}
        >
          <MicIcon className={`w-6 h-6 ${finalTopic ? 'animate-pulse' : ''}`} />
          {t('dashboard.startRecording')}
        </button>
      </div>
    </div>
  );
};

export default TopicSelector;