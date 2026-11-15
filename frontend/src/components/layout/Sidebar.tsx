import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Map, CloudRain, Droplets, Leaf, Activity,
  Compass, BarChart3, History, Layers, IndianRupee, Calendar,
  FileText, Satellite, ShieldAlert, Sparkles, User, LogOut,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen,
  Pin, CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean; // Mobile drawer state
  onClose: () => void;
  isCollapsed: boolean; // Desktop collapsed state
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) => {
  const { i18n } = useTranslation();
  const { role, user, openLogoutModal } = useAuth();
  const isTamil = i18n.language === 'ta';

  const navGroups = [
    {
      group: isTamil ? 'முதன்மை வாயில்' : 'Main Portal',
      items: [
        { to: '/dashboard', label: isTamil ? 'பண்ணை முகப்பு' : 'Farmer Dashboard', icon: LayoutDashboard },
        { to: '/simulation-world', label: isTamil ? 'விவசாய அனுபவ உலகம் (3D)' : '3D Farm Simulation', icon: Sparkles },
      ]
    },
    {
      group: isTamil ? 'என் நிலம் & மேலாண்மை' : 'My Farm & Operations',
      items: [
        { to: '/farmer/farmlands', label: isTamil ? 'என் நிலங்கள்' : 'My Farmlands', icon: Map },
        { to: '/farmer/plots', label: isTamil ? 'நில உட்பிரிவுகள்' : 'Farm Plots', icon: Layers },
        { to: '/farmer/calendar', label: isTamil ? 'பண்ணை நாட்காட்டி' : 'Farming Calendar', icon: Calendar },
        { to: '/farmer/expenses', label: isTamil ? 'செலவு & லாபக் கணக்கு' : 'Expenses & Profit', icon: IndianRupee },
      ]
    },
    {
      group: isTamil ? 'நாசா சுற்றுச்சூழல் ஆய்வு' : 'NASA Intelligence',
      items: [
        { to: '/farmer/weather', label: isTamil ? 'வானிலை & மழை ஆய்வு' : 'Weather & Rainfall', icon: CloudRain },
        { to: '/farmer/soil-moisture', label: isTamil ? 'மண் ஈரப்பதம் (SMAP)' : 'Soil Moisture (SMAP)', icon: Droplets },
        { to: '/farmer/vegetation', label: isTamil ? 'பயிர் பசுமை (MODIS)' : 'Vegetation Health', icon: Leaf },
        { to: '/farmer/farm-health', label: isTamil ? 'நில ஆரோக்கியக் குறியீடு' : 'Farm Health Score', icon: Activity },
      ]
    },
    {
      group: isTamil ? 'பரிந்துரைகள் & அறிக்கைகள்' : 'Advisories & Reports',
      items: [
        { to: '/farmer/recommendations', label: isTamil ? 'பயிர் சுழற்சி பரிந்துரை' : 'Crop Recommendations', icon: Compass },
        { to: '/farmer/compare-crops', label: isTamil ? 'திட்டங்களை ஒப்பிடுக' : 'Compare Crop Plans', icon: BarChart3 },
        { to: '/farmer/historical', label: isTamil ? '10 ஆண்டு காலநிலை தரவு' : '10-Year Climate Trends', icon: History },
        { to: '/farmer/reports', label: isTamil ? 'பண்ணை அறிக்கை (PDF)' : 'Download Reports (PDF)', icon: FileText },
      ]
    },
    {
      group: isTamil ? 'அரசு & நாசா சான்றுகள்' : 'Provenance & Portal',
      items: [
        { to: '/nasa-data-sources', label: isTamil ? 'நாசா தரவு ஆதாரங்கள்' : 'NASA Data Sources', icon: Satellite },
        { to: '/methodology', label: isTamil ? 'பரிந்துரை முறையியல்' : 'Methodology', icon: Activity },
        ...(role === 'officer' || role === 'admin' ? [
          { to: '/officer', label: isTamil ? 'வேளாண் அலுவலர்' : 'Officer Portal', icon: ShieldAlert },
        ] : []),
        ...(role === 'admin' ? [
          { to: '/admin', label: isTamil ? 'நிர்வாக தளம்' : 'Admin Portal', icon: User },
        ] : []),
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-16 z-30 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 bg-forest-950 text-cream-100 flex flex-col transition-all duration-300 ease-in-out border-r border-forest-800 ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} pb-16 md:pb-0`}
      >
        {/* Desktop Collapse / Expand Header Toggle */}
        <div className="hidden md:flex items-center justify-between px-3 py-2.5 border-b border-forest-900 bg-forest-950/60">
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-cream-300 uppercase tracking-wider font-tamil truncate">
              {isTamil ? 'வழிசெலுத்தல்' : 'Navigation'}
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg bg-forest-900/80 hover:bg-forest-800 text-cream-200 hover:text-white transition cursor-pointer ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? (isTamil ? 'பக்கப்பட்டையை விரி (Expand)' : 'Expand sidebar') : (isTamil ? 'பக்கப்பட்டையை சுருக்கு (Collapse)' : 'Collapse sidebar')}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-leaf-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-cream-300" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin scrollbar-thumb-forest-800">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed ? (
                <h3 className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-leaf-400/90 font-tamil mb-1">
                  {group.group}
                </h3>
              ) : (
                <div className="my-2 border-t border-forest-900 mx-2" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      title={item.label}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition group relative ${
                          isActive
                            ? 'bg-forest-800 text-leaf-300 font-bold shadow-inner border-l-2 border-leaf-400'
                            : 'text-cream-200 hover:bg-forest-900 hover:text-white'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`
                      }
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isCollapsed ? 'group-hover:scale-110' : ''
                      } text-leaf-400 group-hover:text-leaf-300`} />

                      {!isCollapsed && (
                        <span className="truncate font-tamil text-[12.5px] leading-tight">
                          {item.label}
                        </span>
                      )}

                      {/* Tooltip on Collapsed Mode Hover */}
                      {isCollapsed && (
                        <span className="absolute left-full ml-2 px-2.5 py-1 bg-forest-900 text-white text-[11px] font-medium rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-forest-700">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-2.5 border-t border-forest-900 bg-forest-950/90 space-y-2">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-forest-900/60 border border-forest-800">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-leaf-600/30 text-leaf-300 flex items-center justify-center font-bold text-xs shrink-0">
                  🌱
                </div>
                <div className="truncate text-xs">
                  <p className="font-bold text-white truncate font-tamil">
                    {user?.full_name?.split(' ')[0] || (isTamil ? 'விவசாயி' : 'Farmer')}
                  </p>
                  <p className="text-[10px] text-cream-300 truncate">
                    {user?.district || (isTamil ? 'தமிழ்நாடு' : 'Tamil Nadu')}
                  </p>
                </div>
              </div>

              <button
                onClick={openLogoutModal}
                className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition cursor-pointer"
                title={isTamil ? 'வெளியேறு (Logout)' : 'Sign Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-8 h-8 rounded-full bg-leaf-600/30 text-leaf-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                title={`${user?.full_name || 'Farmer'} (${user?.district || 'Tamil Nadu'})`}
              >
                🌱
              </div>
              <button
                onClick={openLogoutModal}
                className="p-2 rounded-xl text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition cursor-pointer"
                title={isTamil ? 'வெளியேறு (Logout)' : 'Sign Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
