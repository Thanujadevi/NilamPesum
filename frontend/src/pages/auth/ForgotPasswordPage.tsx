import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Sprout, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data.dev_token) {
        setDevToken(res.data.dev_token);
      }
    } catch (err: any) {
      setError('Error initiating reset. Please verify email / மீட்டமைப்பில் பிழை.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-emerald-500/30 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 mb-2 shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            {t('auth.resetPasswordTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{t('auth.resetPasswordSubtitle')}</p>
        </div>

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-200">
              Password reset link has been dispatched to <span className="font-semibold text-emerald-400">{email}</span>.
            </p>
            {devToken && (
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-left">
                <p className="text-[11px] text-slate-400 font-mono">Development Reset Token:</p>
                <code className="text-xs text-emerald-300 break-all">{devToken}</code>
              </div>
            )}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:underline pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@nilampesum.tn.gov.in"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : t('auth.sendResetLink')}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('auth.backToLogin')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

