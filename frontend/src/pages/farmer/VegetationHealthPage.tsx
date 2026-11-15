import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { VegetationAnalytics } from '../../types';
import { VegetationChart } from '../../components/charts/VegetationChart';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { Leaf, Info } from 'lucide-react';

export const VegetationHealthPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [veg, setVeg] = useState<VegetationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedFarmland) return;
    const loadVeg = async () => {
      try {
        setIsLoading(true);
        const data = await api.getVegetationAnalytics(selectedFarmland.id);
        setVeg(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadVeg();
  }, [selectedFarmland]);

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
              {t('vegetationPage.title')}
            </h1>
            <NasaProvenanceBadge category={1} sourceText="NASA MODIS 250m & HLS 30m" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {t('vegetationPage.subtitle')}
          </p>
        </div>
      </div>

      {veg && (
        <VegetationChart
          timeseries={veg.timeseries}
          currentNdvi={veg.current_ndvi}
          currentEvi={veg.current_evi}
          status={veg.vegetation_health_status}
        />
      )}

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h3 className="font-bold text-slate-900 text-sm font-tamil flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>{t('vegetationPage.faqTitle')}</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-tamil">
          {t('vegetationPage.faqBody')}
        </p>
      </div>
    </div>
  );
};

