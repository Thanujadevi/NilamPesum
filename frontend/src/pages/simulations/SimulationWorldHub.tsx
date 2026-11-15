import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Thermometer, Droplets, RefreshCw, ShieldAlert,
  HeartCrack, Calendar, ArrowRight, Bookmark, Sparkles, Orbit, Play
} from 'lucide-react';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';

export const SimulationWorldHub: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isTamil = i18n.language === 'ta';

  const simulationCards = [
    {
      id: 'climate-change',
      title: t('simWorld.card1Title'),
      desc: t('simWorld.card1Desc'),
      icon: Thermometer,
      accentBg: 'bg-amber-100 text-amber-800 border-amber-200',
      badge: isTamil ? '2.5D அனிமேஷன் நிலம்' : '2.5D Animated Field',
      route: '/simulation-world/climate-change',
      provenance: isTamil ? 'நாசா பவர் காலநிலை (NASA POWER)' : 'NASA POWER Climatology'
    },
    {
      id: 'smart-irrigation',
      title: t('simWorld.card2Title'),
      desc: t('simWorld.card2Desc'),
      icon: Droplets,
      accentBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      badge: isTamil ? '3D மண் அடுக்கு தோற்றம்' : '3D Soil Cross-Section',
      route: '/simulation-world/smart-irrigation',
      provenance: isTamil ? 'நாசா ஸ்மாப் மண் ஈரப்பதம் (NASA SMAP)' : 'NASA SMAP Soil Moisture'
    },
    {
      id: 'crop-rotation',
      title: t('simWorld.card3Title'),
      desc: t('simWorld.card3Desc'),
      icon: RefreshCw,
      accentBg: 'bg-leaf-100 text-leaf-800 border-leaf-200',
      badge: isTamil ? 'பருவ NPK & கரிம கார்பன்' : 'Multi-Season NPK & Carbon',
      route: '/simulation-world/crop-rotation',
      provenance: isTamil ? 'வேளாண் பல்கலையின் அளவுகோல் (TNAU)' : 'TNAU Agronomic Matrix'
    },
    {
      id: 'flood-drought',
      title: t('simWorld.card4Title'),
      desc: t('simWorld.card4Desc'),
      icon: ShieldAlert,
      accentBg: 'bg-blue-100 text-blue-800 border-blue-200',
      badge: isTamil ? 'தீவிர காலநிலை தற்காப்பு' : 'Extreme Weather Defense',
      route: '/simulation-world/flood-drought',
      provenance: isTamil ? 'நாசா ஜிபிஎம் மழைப்பொழிவு (NASA GPM)' : 'NASA GPM Precipitation'
    },
    {
      id: 'crop-stress',
      title: t('simWorld.card5Title'),
      desc: t('simWorld.card5Desc'),
      icon: HeartCrack,
      accentBg: 'bg-rose-100 text-rose-800 border-rose-200',
      badge: isTamil ? 'பயிர்கள் தாங்கும் திறன் ஒப்பீடு' : 'Side-by-Side Survival Arena',
      route: '/simulation-world/crop-stress',
      provenance: isTamil ? 'பயிர் தாங்கும் வரம்பு வரைபடங்கள்' : 'TNAU Threshold Curves'
    },
    {
      id: 'full-season',
      title: t('simWorld.card6Title'),
      desc: t('simWorld.card6Desc'),
      icon: Calendar,
      accentBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badge: isTamil ? '120-நாள் பயிர் வளர்ச்சி பயணம்' : '120-Day Cropping Journey',
      route: '/simulation-world/full-season',
      provenance: isTamil ? 'பயிர் உடலியக்கம் & வரவு-செலவு' : 'Phenology & P&L Scorecard'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-850 to-forest-800 text-white p-7 sm:p-8 rounded-3xl border border-forest-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-leaf-500/20 border border-leaf-400/30 text-leaf-300 text-xs font-semibold">
            <Orbit className="w-3.5 h-3.5 animate-spin" />
            <span>{t('simWorld.nasaBaselineUsed')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-tamil">
            {t('simWorld.title')}
          </h1>

          <p className="text-xs sm:text-sm text-cream-200 leading-relaxed font-tamil">
            {t('simWorld.subtitle')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/simulation-world/saved"
              className="px-4 py-2 bg-cream-100 hover:bg-white text-forest-900 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow"
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>{t('simWorld.savedScenarios')}</span>
            </Link>
          </div>
        </div>

        {/* Ambient subtle decorative leaf illustration */}
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-leaf-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 6 Visual Simulation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simulationCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.route)}
              className="group cursor-pointer rounded-3xl p-6 bg-white border border-cream-300 hover:border-forest-600 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl border ${card.accentBg} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cream-100 text-slate-600 border border-cream-200">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-forest-900 group-hover:text-leaf-700 transition-colors font-tamil">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-tamil">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-cream-200 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {card.provenance}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-leaf-700 group-hover:translate-x-1 transition-transform">
                  <span>{t('simWorld.launchSim')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
