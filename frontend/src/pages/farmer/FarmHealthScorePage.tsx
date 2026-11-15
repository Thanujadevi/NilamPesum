import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { FarmHealthScore } from '../../types';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { Activity, ShieldCheck, CloudRain, Sun, Droplets, Leaf } from 'lucide-react';

export const FarmHealthScorePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [health, setHealth] = useState<FarmHealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedFarmland) return;
    const loadHealth = async () => {
      try {
        setIsLoading(true);
        const data = await api.getFarmHealthScore(selectedFarmland.id);
        setHealth(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHealth();
  }, [selectedFarmland]);

  if (!selectedFarmland) return null;

  const indicators = [
    { name: t('healthScorePage.rainfallIndicator'), score: health?.indicator_scores.rainfall ?? 0, weight: '30%', icon: CloudRain, color: 'text-blue-600' },
    { name: t('healthScorePage.tempIndicator'), score: health?.indicator_scores.temperature ?? 0, weight: '20%', icon: Sun, color: 'text-amber-600' },
    { name: t('healthScorePage.moistureIndicator'), score: health?.indicator_scores.soil_moisture ?? 0, weight: '30%', icon: Droplets, color: 'text-cyan-600' },
    { name: t('healthScorePage.vegIndicator'), score: health?.indicator_scores.vegetation ?? 0, weight: '20%', icon: Leaf, color: 'text-emerald-600' },
  ];

  const explanation = isTamil ? (health?.explanation_ta || health?.explanation_en) : (health?.explanation_en || health?.explanation_ta);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
              {t('healthScorePage.title')}
            </h1>
            <NasaProvenanceBadge category={2} sourceText="Application Indicator" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {t('healthScorePage.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-forest-50 border-4 border-forest-600 shadow-inner">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-forest-900">{health?.overall_health_score ?? '--'}</span>
              <span className="block text-[11px] text-slate-400 font-semibold">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider font-tamil">{t('healthScorePage.overallStatus')}</span>
            <h2 className="text-xl font-extrabold text-slate-900 font-tamil">
              {health?.health_status
                ? (isTamil
                    ? (health.health_status.toLowerCase().includes('excellent') ? 'மிகச் சிறப்பானது (Excellent)' :
                       health.health_status.toLowerCase().includes('good') ? 'நல்ல நிலை (Good)' :
                       health.health_status.toLowerCase().includes('moderate') ? 'மிதமானது (Moderate)' :
                       'தகைவு நிலை (Stress)')
                    : (health.health_status.toLowerCase().includes('excellent') ? 'Excellent (மிகச் சிறப்பு)' :
                       health.health_status.toLowerCase().includes('good') ? 'Good (நல்ல நிலை)' :
                       health.health_status.toLowerCase().includes('moderate') ? 'Moderate (மிதமானது)' :
                       'Under Stress (தகைவு நிலை)'))
                : t('healthScorePage.calculating')}
            </h2>
            <p className="text-xs text-slate-600 max-w-md font-tamil leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 font-tamil">
          <p>
            {t('healthScorePage.historicalBenchmark')}{' '}
            <strong>
              {isTamil && health?.historical_benchmark_comparison?.includes('within')
                ? 'இப்பகுதியின் 5 ஆண்டு சராசரியை விட +4% சீரானது.'
                : health?.historical_benchmark_comparison}
            </strong>
          </p>
          <p>{t('healthScorePage.dataSufficiency')} <strong>{health?.data_sufficiency_pct}%</strong></p>
        </div>
      </div>

      {/* 4 Contributing Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {indicators.map((ind, idx) => {
          const Icon = ind.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${ind.color}`} />
                  <span className="font-bold text-slate-800 text-sm font-tamil">{ind.name}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-tamil">
                  {t('healthScorePage.share')} {ind.weight}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="w-full bg-slate-100 h-3 rounded-full mr-4 overflow-hidden">
                  <div
                    className="h-full bg-forest-600 rounded-full"
                    style={{ width: `${Math.min(100, ind.score)}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-slate-900">{ind.score}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 font-tamil">
        <strong>{t('healthScorePage.transparencyTitle')}</strong> {t('healthScorePage.transparencyBody')}
      </div>
    </div>
  );
};

