import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { CropRotationPlan } from '../../types';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { Check, X, Shield, Droplets, Leaf } from 'lucide-react';

export const CompareCropPlansPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [plans, setPlans] = useState<CropRotationPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedFarmland) return;
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        const data = await api.getRecommendations(selectedFarmland.id);
        setPlans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlans();
  }, [selectedFarmland]);

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
            {t('comparePage.title')}
          </h1>
          <NasaProvenanceBadge category={3} sourceText="Comparative Analysis" />
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
          {t('comparePage.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 font-tamil">
            <tr>
              <th className="p-4 min-w-[200px]">{t('comparePage.colPlan')}</th>
              <th className="p-4 min-w-[150px]">{t('comparePage.colSuitability')}</th>
              <th className="p-4 min-w-[160px]">{t('comparePage.colWater')}</th>
              <th className="p-4 min-w-[140px]">{t('comparePage.colRisk')}</th>
              <th className="p-4 min-w-[220px]">{t('comparePage.colRotation')}</th>
              <th className="p-4 min-w-[260px]">{t('comparePage.colSoil')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-tamil">
            {plans.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition">
                <td className="p-4 font-bold text-slate-900">
                  {p.plan_name}
                  <span className="block text-[10px] text-forest-700 font-normal uppercase mt-0.5">{p.plan_type}</span>
                </td>
                <td className="p-4">
                  <span className="text-base font-extrabold text-emerald-600">{p.overall_suitability_score}%</span>
                </td>
                <td className="p-4 text-slate-700">{p.water_requirement_desc}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    p.environmental_risk === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.environmental_risk}
                  </span>
                </td>
                <td className="p-4 text-slate-700 font-medium">
                  {p.rotation_sequence.map(s => isTamil ? (s.crop_name_ta || s.crop_name_en) : (s.crop_name_en || s.crop_name_ta)).join(' ➔ ')}
                </td>
                <td className="p-4 text-slate-600 leading-relaxed text-[11px]">
                  {p.soil_health_benefit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

