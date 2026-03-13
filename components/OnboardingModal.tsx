
import React, { useState } from 'react';

const STEPS = [
  {
    emoji: '🎯',
    bg: 'bg-indigo-500',
    shadowColor: 'shadow-indigo-500/30',
    title: 'Konunu Seç',
    titleEn: 'Pick a Topic',
    desc: 'Müfredat konularından birini seç ya da kendi konunu yaz. Her oturum yeni bir şans!',
    descEn: 'Choose from curriculum topics or write your own. Every session is a fresh start!',
  },
  {
    emoji: '🎤',
    bg: 'bg-rose-500',
    shadowColor: 'shadow-rose-500/30',
    title: 'Konuş',
    titleEn: 'Speak Up',
    desc: 'Miks sesin kaydet. Maksimum 3 dakika — ne kadar az duraksarsan o kadar iyi!',
    descEn: 'Record your voice. Up to 3 minutes — the fewer pauses, the better!',
  },
  {
    emoji: '✨',
    bg: 'bg-emerald-500',
    shadowColor: 'shadow-emerald-500/30',
    title: 'AI Değerlendirmeni Al',
    titleEn: 'Get Your AI Score',
    desc: '5 kriterde anlık geri bildirim: Uyum, Organizasyon, Sunum, Dil ve Yaratıcılık.',
    descEn: 'Instant feedback on 5 criteria: Rapport, Organisation, Delivery, Language & Creativity.',
  },
];

interface OnboardingModalProps {
  onDone: () => void;
  lang?: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onDone, lang = 'tr' }) => {
  const [step, setStep] = useState(0);
  const isTr = lang.startsWith('tr');

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('chitiq_onboarded', 'true');
      onDone();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('chitiq_onboarded', 'true');
    onDone();
  };

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-indigo-600'
                  : i < step
                  ? 'w-2 bg-indigo-300 dark:bg-indigo-700'
                  : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Emoji icon */}
        <div className={`w-20 h-20 ${s.bg} shadow-xl ${s.shadowColor} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 animate-fade-in`}>
          {s.emoji}
        </div>

        {/* Step counter */}
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-2">
          {isTr ? `Adım ${step + 1} / ${STEPS.length}` : `Step ${step + 1} / ${STEPS.length}`}
        </p>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-3">
          {isTr ? s.title : s.titleEn}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-8 font-medium">
          {isTr ? s.desc : s.descEn}
        </p>

        {/* CTA button */}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          {step < STEPS.length - 1
            ? (isTr ? 'Devam →' : 'Continue →')
            : (isTr ? 'Hadi Başlayalım! 🚀' : "Let's Go! 🚀")}
        </button>

        {/* Skip — only on first step */}
        {step === 0 && (
          <button
            onClick={handleSkip}
            className="w-full mt-3 py-2 text-slate-400 text-sm font-medium hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {isTr ? 'Atla' : 'Skip'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
