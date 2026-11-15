import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { SoilMoistureAnalytics } from '../../types';
import { SoilMoistureCharts } from '../../components/charts/SoilMoistureCharts';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { Droplets, RefreshCw, AlertCircle } from 'lucide-react';

export const SoilMoisturePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [soil, setSoil] = useState<SoilMoistureAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedFarmland) return;
    const loadSoil = async () => {
      try {
        setIsLoading(true);
        const data = await api.getSoilMoistureAnalytics(selectedFarmland.id);
        setSoil(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSoil();
  }, [selectedFarmland]);

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
              {t('soilMoisturePage.title')}
            </h1>
            <NasaProvenanceBadge category={1} sourceText="NASA SMAP L3/L4" resolution="9km / 36km" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {t('soilMoisturePage.subtitle')}
          </p>
        </div>
      </div>

      {soil && (
        <SoilMoistureCharts
          timeseries={soil.timeseries}
          surfacePct={soil.surface_moisture_percentage}
          rootzonePct={soil.rootzone_moisture_percentage}
          moistureStatus={soil.moisture_status}
          drynessIndex={soil.dryness_index}
        />
      )}

      {/* Advisory Guidance Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm font-tamil flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-600" />
          <span>{t('soilMoisturePage.tnauTitle')}</span>
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-tamil leading-relaxed">
          <li>{t('soilMoisturePage.point1')}</li>
          <li>{t('soilMoisturePage.point2')}</li>
          <li>{t('soilMoisturePage.point3')}</li>
        </ul>
      </div>
    </div>
  );
};

