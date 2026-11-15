import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Sparkles, Layers, Compass, Mic } from 'lucide-react';

interface BottomNavProps {
  onOpenVoice: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenVoice }) => {
  const { i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const navItems = [
    { to: '/dashboard', label: isTamil ? 'முகப்பு' : 'Home', icon: LayoutDashboard },
    { to: '/farmer/plots', label: isTamil ? 'நிலம்' : 'Plots', icon: Layers },
    { to: '/simulation-world', label: isTamil ? 'அனுபவம்' : 'Sim 3D', icon: Sparkles },
    { to: '/farmer/recommendations', label: isTamil ? 'பரிந்துரை' : 'Crops', icon: Compass },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-forest-950/95 backdrop-blur-md border-t border-forest-800 text-cream-200 flex items-center justify-around h-16 px-2 shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] transition font-tamil ${
                isActive ? 'text-leaf-300 font-bold bg-forest-900/60' : 'text-cream-300 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      {/* Voice Registration Quick Button */}
      <NavLink
        to="/farmer-registration"
        aria-label="Farmer Voice Registration"
        className="flex flex-col items-center justify-center py-1 px-2 text-[10px] text-amber-300 font-bold font-tamil"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center -mt-5 shadow-xl border-2 border-forest-950 animate-bounce">
          <Mic className="w-5 h-5" />
        </div>
        <span>{isTamil ? 'குரல் பதிவு' : 'Voice Reg'}</span>
      </NavLink>
    </div>
  );
};
