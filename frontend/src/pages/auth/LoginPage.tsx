import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Sprout, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Mic, Globe } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const navigate = useNavigate();
  const location = useLocation();
  const { login, updateLanguage, isLoading } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailOrPhone || !password) {
      setError(
        isTamil
          ? 'மின்னஞ்சல்/அலைபேசி எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'
          : 'Please enter your email/phone and password.'
      );
      return;
    }

    const success = await login(emailOrPhone, password);
    if (success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(
        isTamil
          ? 'தவறான மின்னஞ்சல்/அலைபேசி எண் அல்லது கடவுச்சொல். மீண்டும் முயற்சிக்கவும்.'
          : 'Invalid email/phone or password. Please verify your credentials and try again.'
      );
    }
  };

  const handleDemoFarmerLogin = async () => {
    setError(null);
    setEmailOrPhone('farmer@nilampesum.tn.gov.in');
    setPassword('farmer123');
    const success = await login('farmer@nilampesum.tn.gov.in', 'farmer123');
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06170d] via-[#092415] to-[#041009] flex flex-col items-center justify-center p-4 selection:bg-teal-500 selection:text-white">
      {/* Top Navbar / Language Switcher */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        <Link to="/" className="text-xs font-semibold text-teal-300 hover:text-white transition flex items-center gap-1">
          ← {isTamil ? 'முகப்பு பக்கம்' : 'Home'}
        </Link>

        <button
          onClick={() => updateLanguage(isTamil ? 'en' : 'ta')}
          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-teal-500/40 bg-teal-950/60 text-teal-300 hover:bg-teal-900 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isTamil ? 'English' : 'தமிழ்'}</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-[#0a2317]/90 border border-teal-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl text-white">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-400 mb-3 shadow-inner">
            <Sprout className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-tamil">
            {isTamil ? 'நிலம் பேசும்' : 'NILAM PESUM'}
          </h1>
          <p className="text-xs text-teal-200/80 mt-1 font-tamil">
            {isTamil
              ? 'நாசா செயற்கைக்கோள் தரவு சார்ந்த விவசாய தளம்'
              : 'NASA-Powered Agricultural Intelligence Platform'}
          </p>
        </div>

        <div className="mb-5 text-center">
          <h2 className="text-lg font-bold text-white font-tamil">
            {isTamil ? 'விவசாயி உள்நுழைவு' : 'Farmer Sign In'}
          </h2>
          <p className="text-xs text-teal-300/70 font-tamil">
            {isTamil
              ? 'உங்கள் அலைபேசி எண் அல்லது மின்னஞ்சல் மூலம் உள்நுழைக'
              : 'Enter your registered mobile number or email'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-200 text-xs font-tamil">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-teal-200 mb-1 font-tamil">
              {isTamil ? 'அலைபேசி எண் அல்லது மின்னஞ்சல்' : 'Mobile Number or Email'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-teal-400" />
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={isTamil ? '9443123456 அல்லது farmer@nilampesum...' : 'Mobile or email'}
                className="w-full bg-[#081c12] border border-teal-700/60 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-teal-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-teal-200 font-tamil">
                {isTamil ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <Link to="/forgot-password" className="text-xs text-teal-400 hover:underline font-tamil">
                {isTamil ? 'மறந்துவிட்டதா?' : 'Forgot password?'}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-teal-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#081c12] border border-teal-700/60 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-teal-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-950/60 transition cursor-pointer disabled:opacity-50 font-tamil"
          >
            {isLoading ? (
              <span>{isTamil ? 'சரிபார்க்கப்படுகிறது...' : 'Authenticating...'}</span>
            ) : (
              <>
                <span>{isTamil ? 'உள்நுழைக' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Farmer Demo Login */}
        <div className="mt-5 pt-4 border-t border-teal-800/40">
          <p className="text-[11px] font-bold text-teal-300/80 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-tamil">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            {isTamil ? 'மாதிரி கணக்கு (விரைவு சோதனை)' : 'Quick Demo Access'}
          </p>
          <button
            type="button"
            onClick={handleDemoFarmerLogin}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-teal-950/70 hover:bg-teal-900/80 border border-teal-700/50 hover:border-teal-400 rounded-xl text-xs text-teal-200 transition text-center flex items-center justify-center gap-2 cursor-pointer font-tamil"
          >
            <span>🌱</span>
            <span>{isTamil ? 'விவசாயி மாதிரி கணக்கில் உள்நுழைக' : 'Sign In as Demo Farmer (Thanjavur)'}</span>
          </button>
        </div>

        {/* Voice Registration CTA */}
        <div className="mt-5 pt-4 border-t border-teal-800/40 text-center">
          <p className="text-xs text-teal-300/80 font-tamil mb-2">
            {isTamil ? 'புதிய விவசாயியா? படிவம் தேவையில்லை!' : 'New Farmer? No typing needed!'}
          </p>
          <Link
            to="/farmer-registration"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition font-tamil"
          >
            <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isTamil ? 'தமிழில் பேசியே பதிவு செய்க (Voice Registration)' : 'Register via Voice Assistant'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
