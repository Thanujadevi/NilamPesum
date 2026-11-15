import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  RefreshCw, Mic, Globe, MapPin, User, LogOut,
  ChevronDown, Layers, Menu, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenVoice: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenVoice, onToggleMobileSidebar }) => {
  const { t, i18n } = useTranslation();
  const { farmlands, selectedFarmland, setSelectedFarmland, syncCurrentWithNasa, isSyncingNasa } = useFarmland();
  const { user, updateLanguage, openLogoutModal, isAuthenticated } = useAuth();
  const isTamil = i18n.language === 'ta';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ta' ? 'en' : 'ta';
    updateLanguage(nextLang);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-forest-900 text-white shadow-md border-b border-forest-800 w-full">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Button + Brand & Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-200 hover:text-white transition md:hidden cursor-pointer"
              title={isTamil ? 'பட்டியல்' : 'Menu'}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="Nilam Pesum Logo" className="w-9 h-9 drop-shadow shrink-0 group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-tamil whitespace-nowrap">
                  {isTamil ? 'நிலம் பேசும்' : 'NILAM PESUM (நிலம் பேசும்)'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-leaf-600/80 text-white uppercase tracking-wider hidden sm:inline whitespace-nowrap">
                  NASA Powered
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-cream-200 hidden md:block truncate">
                {t('brand.tagline')}
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Farmland Selector & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Farmland Selector Dropdown */}
          {farmlands.length > 0 && (
            <div className="relative">
              <select
                aria-label="Select active farmland"
                value={selectedFarmland?.id || ''}
                onChange={(e) => {
                  const found = farmlands.find((f) => f.id === e.target.value);
                  if (found) setSelectedFarmland(found);
                }}
                className="bg-forest-800 border border-forest-700 text-cream-100 text-xs sm:text-sm rounded-xl pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-leaf-400 cursor-pointer max-w-[130px] sm:max-w-[210px] truncate"
              >
                {farmlands.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district}, {f.area_acres} ac)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sync NASA Data Button */}
          <button
            onClick={syncCurrentWithNasa}
            disabled={isSyncingNasa || !selectedFarmland}
            title={isTamil ? 'நாசா நேரடி செயற்கைக்கோள் தரவு ஒத்திசைவு' : 'Sync Real-time NASA Earth Data'}
            className="flex items-center gap-1.5 bg-leaf-600 hover:bg-leaf-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNasa ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSyncingNasa ? t('common.syncing') : t('common.syncNasa')}</span>
          </button>

          {/* Tamil Voice Assistant Button */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm transition cursor-pointer"
            title={isTamil ? 'குரல் உதவி' : 'Voice Assist'}
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden lg:inline">{isTamil ? 'குரல் உதவி' : 'Voice Assist'}</span>
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-forest-800 hover:bg-forest-700 text-cream-100 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-forest-700 transition cursor-pointer"
            title={isTamil ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
          >
            <Globe className="w-3.5 h-3.5 text-leaf-400" />
            <span>{isTamil ? 'English' : 'தமிழ்'}</span>
          </button>

          {/* Farmer Profile Menu with Logout */}
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 bg-forest-800/90 hover:bg-forest-750 border border-forest-700 text-cream-100 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                title="Farmer Profile & Settings"
              >
                <div className="w-5 h-5 rounded-full bg-leaf-500/30 text-leaf-300 flex items-center justify-center font-bold text-[10px]">
                  🌱
                </div>
                <span className="max-w-[90px] sm:max-w-[120px] truncate font-tamil">
                  {user.full_name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-cream-300" />
              </button>

              {/* Profile Dropdown Card */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-forest-950 border border-forest-800 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn text-slate-200">
                  <div className="pb-3 border-b border-forest-900 space-y-1">
                    <p className="text-xs font-bold text-white font-tamil truncate">
                      {user.full_name}
                    </p>
                    <p className="text-[11px] text-cream-300 truncate">
                      {user.phone || user.email}
                    </p>
                    <p className="text-[10px] text-leaf-400 font-tamil">
                      📍 {user.village ? `${user.village}, ` : ''}{user.district || 'Tamil Nadu'}
                    </p>
                  </div>

                  <div className="py-2 space-y-1">
                    <Link
                      to="/farmer/farmlands"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-cream-200 hover:bg-forest-900 rounded-lg transition font-tamil"
                    >
                      <Layers className="w-3.5 h-3.5 text-leaf-400" />
                      <span>{isTamil ? 'என் நிலங்கள்' : 'My Farmlands'}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        toggleLanguage();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-cream-200 hover:bg-forest-900 rounded-lg transition font-tamil text-left"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isTamil ? 'மொழி: தமிழ் ➔ English' : 'Language: English ➔ தமிழ்'}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-forest-900">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        openLogoutModal();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-950/60 rounded-lg transition font-tamil cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isTamil ? 'கணக்கிலிருந்து வெளியேறு (Sign Out)' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
