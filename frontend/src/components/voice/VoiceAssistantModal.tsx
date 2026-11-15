import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { Mic, MicOff, Volume2, X, Send, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isTamil ? 'ta-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech error:', e);
      setIsListening(false);
    }
  };

  const handleSendQuery = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const res = await api.sendVoiceQuery(query, selectedFarmland?.id, isTamil ? 'ta' : 'en');
      setResponse(res);

      // Speak response using SpeechSynthesis if available
      if ('speechSynthesis' in window && res.response_text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.response_text);
        utterance.lang = res.language === 'ta' ? 'ta-IN' : 'en-IN';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Voice assistant error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = isTamil ? [
    'என் நிலத்திற்கு ஏற்ற பயிர் எது?',
    'இந்த வருடம் மழை நிலவரம் எப்படி உள்ளது?',
    'எனது நிலத்தில் நீர் பற்றாக்குறை உள்ளதா?',
    'மண் வளத்தை அதிகரிக்க என்ன செய்யலாம்?'
  ] : [
    'What is the best crop for my land?',
    'What is the rainfall status this year?',
    'Is there moisture stress in my land?',
    'How can I improve soil organic carbon?'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-forest-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400">
              <Mic className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base font-tamil">{t('voiceModal.title')}</h3>
              <p className="text-xs text-cream-200 font-tamil">
                {selectedFarmland ? `${selectedFarmland.name} (${selectedFarmland.district})` : t('voiceModal.aiTag')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-cream-300 hover:text-white p-1 rounded-lg hover:bg-forest-700/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Quick Questions Chips */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1 font-tamil">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {t('voiceModal.quickQuestions')}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(q);
                    handleSendQuery(q);
                  }}
                  className="text-xs text-left px-3 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-forest-900 border border-cream-300 transition cursor-pointer font-tamil"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Response Box */}
          {response && (
            <div className="p-4 rounded-xl bg-forest-50 border border-forest-200 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest-800 uppercase tracking-wider font-tamil">
                  {t('voiceModal.advisoryLabel')}
                </span>
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window && response.response_text) {
                      const u = new SpeechSynthesisUtterance(response.response_text);
                      u.lang = response.language === 'ta' ? 'ta-IN' : 'en-IN';
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className="text-forest-700 hover:text-forest-900 p-1 rounded cursor-pointer"
                  title={t('voiceModal.listenAgain')}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed font-tamil">
                {response.response_text}
              </p>
              {response.recommended_action && (
                <div className="pt-2 border-t border-forest-200/60 text-xs text-forest-700 font-semibold font-tamil">
                  📌 {t('voiceModal.recAction')} {response.recommended_action}
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-forest-700 font-medium font-tamil">
              <div className="w-5 h-5 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
              <span>{t('voiceModal.analyzing')}</span>
            </div>
          )}

          {!speechSupported && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 font-tamil">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{t('voiceModal.speechNotSupported')}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-cream-50 border-t border-cream-200 flex items-center gap-2">
          <button
            onClick={isListening ? () => setIsListening(false) : handleStartListening}
            className={`p-3 rounded-full text-white transition shadow-md cursor-pointer ${
              isListening
                ? 'bg-rose-600 animate-pulse'
                : 'bg-forest-700 hover:bg-forest-600'
            }`}
            title={isListening ? t('voiceModal.stopSpeak') : t('voiceModal.startSpeak')}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder={t('voiceModal.inputPlaceholder')}
            className="flex-1 bg-white border border-cream-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600 font-tamil"
          />

          <button
            onClick={() => handleSendQuery()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-leaf-600 hover:bg-leaf-500 disabled:opacity-40 text-white transition shadow cursor-pointer"
            title={t('voiceModal.send')}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

