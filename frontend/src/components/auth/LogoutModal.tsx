import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false
}) => {
  const { i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 z-10 space-y-5 animate-scaleUp text-slate-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-700 flex items-center justify-center shrink-0">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-tamil">
              {isTamil ? 'கணக்கிலிருந்து வெளியேறவா?' : 'Confirm Sign Out?'}
            </h3>
            <p className="text-xs text-slate-500">
              {isTamil ? 'விவசாயி அமர்வு முடிவு' : 'Farmer Session Termination'}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 text-xs text-slate-600 font-tamil leading-relaxed">
          {isTamil
            ? 'நிச்சயமாக உங்கள் பண்ணை கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா? வெளியேறிய பின் பாதுகாக்கப்பட்ட பண்ணை பக்கங்களை அணுக மீண்டும் உள்நுழைய வேண்டும்.'
            : 'Are you sure you want to sign out of your farmer account? You will need to sign in again to access protected farm intelligence.'}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
          >
            {isTamil ? 'ரத்து (Cancel)' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isTamil ? 'வெளியேறு (Logout)' : 'Yes, Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

