import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface EducationalNarratorProps {
  titleEn: string;
  titleTa: string;
  explanationEn: string;
  explanationTa: string;
  mitigationEn?: string;
  mitigationTa?: string;
}

export const EducationalNarrator: React.FC<EducationalNarratorProps> = ({
  titleEn,
  titleTa,
  explanationEn,
  explanationTa,
  mitigationEn,
  mitigationTa
}) => {
  const { i18n, t } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isTamil = i18n.language === 'ta';
  const displayTitle = isTamil ? titleTa : titleEn;
  const displayExplanation = isTamil ? explanationTa : explanationEn;
  const displayMitigation = isTamil ? mitigationTa : mitigationEn;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${displayTitle}. ${displayExplanation} ${displayMitigation ? (isTamil ? 'பரிந்துரை: ' : 'Recommendation: ') + displayMitigation : ''}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isTamil ? 'ta-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/60 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl mt-0.5 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">{displayTitle}</h3>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                NASA & TNAU Grounded
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{displayExplanation}</p>
            {displayMitigation && (
              <div className="mt-2.5 p-2.5 bg-slate-800/80 rounded-xl border border-emerald-500/20 text-xs text-emerald-300">
                <strong>💡 {isTamil ? 'விவசாய நடவடிக்கை:' : 'Actionable Recommendation:'}</strong> {displayMitigation}
              </div>
            )}
          </div>
        </div>

        {/* Audio Speaker Button */}
        <button
          onClick={handleSpeak}
          className={`flex-shrink-0 p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
            isSpeaking
              ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-900/50 animate-bounce'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-emerald-500'
          }`}
          title={isSpeaking ? t('narrator.stop') : t('narrator.listen')}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline">{t('narrator.stop')}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{t('narrator.listen')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

