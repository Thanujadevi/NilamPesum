import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { HistoricalAnalysis } from '../../types';
import { HistoricalCharts } from '../../components/charts/HistoricalCharts';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { History, Calendar, CloudRain, AlertTriangle } from 'lucide-react';

export const HistoricalAnalysisPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [hist, setHist] = useState<HistoricalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedFarmland) return;
    const loadHist = async () => {
      try {
        setIsLoading(true);
        const data = await api.getHistoricalAnalysis(selectedFarmland.id);
        setHist(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHist();
  }, [selectedFarmland]);

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
            {t('historicalPage.title')}
          </h1>
          <NasaProvenanceBadge category={1} sourceText="NASA POWER 10-Yr Climatology" />
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
          {t('historicalPage.subtitle', { district: selectedFarmland.district })}
        </p>
      </div>

      {hist && (
        <HistoricalCharts
          yearlyRecords={hist.yearly_records}
          meanAnnualRainfall={hist.mean_annual_rainfall_mm}
        />
      )}

      {/* Climatological Insights */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm font-tamil flex items-center gap-2">
          <History className="w-4 h-4 text-forest-700" />
          <span>{t('historicalPage.insightsTitle')}</span>
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside font-tamil leading-relaxed">
          {hist?.climatological_insights.map((insight, idx) => (
            <li key={idx}>{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

