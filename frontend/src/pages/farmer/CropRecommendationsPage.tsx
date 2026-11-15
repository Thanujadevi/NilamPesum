import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { CropRotationPlan } from '../../types';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import {
  Compass, ShieldCheck, Droplets, Sparkles, RefreshCw,
  BarChart3, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';

export const CropRecommendationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [plans, setPlans] = useState<CropRotationPlan[]>([]);
  const [goal, setGoal] = useState<string>('balanced');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fetchPlans = async (selectedGoal?: string) => {
    if (!selectedFarmland) return;
    try {
      setIsGenerating(true);
      const data = await api.generateRecommendations(selectedFarmland.id, 'Next Season', selectedGoal || goal);
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [selectedFarmland]);

  if (!selectedFarmland) return null;

  const goalOptions = [
    { id: 'balanced', label: t('recommendationsPage.goalBalanced') },
    { id: 'save_water', label: t('recommendationsPage.goalSaveWater') },
    { id: 'improve_soil', label: t('recommendationsPage.goalImproveSoil') },
    { id: 'reduce_risk', label: t('recommendationsPage.goalReduceRisk') },
    { id: 'maximize_profit', label: t('recommendationsPage.goalMaximizeProfit') },
  ];

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header & Goal Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
              {t('recommendationsPage.title')}
            </h1>
            <NasaProvenanceBadge category={3} sourceText="TNAU & NASA Engine" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {t('recommendationsPage.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/farmer/compare-crops"
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition"
          >
            <BarChart3 className="w-4 h-4 text-forest-700" />
            <span className="font-tamil">{t('recommendationsPage.comparePlans')}</span>
          </Link>

          <button
            onClick={() => fetchPlans(goal)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="font-tamil">{isGenerating ? t('recommendationsPage.generating') : t('recommendationsPage.generateNew')}</span>
          </button>
        </div>
      </div>

      {/* Goal Filter Chips */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600 mr-2 font-tamil">{t('recommendationsPage.farmerGoalLabel')}</span>
        {goalOptions.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setGoal(g.id);
              fetchPlans(g.id);
            }}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer font-tamil ${
              goal === g.id
                ? 'bg-forest-800 text-white shadow'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan, idx) => {
          const planExplanation = isTamil ? (plan.explanation_ta || plan.explanation_en) : (plan.explanation_en || plan.explanation_ta);
          return (
            <div
              key={plan.id || idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 font-tamil">
                      {plan.plan_name}
                    </h3>
                  </div>
                  <span className="text-xs text-forest-700 font-semibold block sm:inline">
                    {plan.plan_type.replace('_', ' ').toUpperCase()} {t('recommendationsPage.strategy')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-tamil">{t('recommendationsPage.suitability')}</span>
                    <span className="text-xl font-extrabold text-emerald-600">
                      {plan.overall_suitability_score}%
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-tamil ${
                    plan.environmental_risk?.toLowerCase().includes('low')
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isTamil
                      ? (plan.environmental_risk?.toLowerCase().includes('low') ? 'குறைந்த இடர் (Low Risk)' : 'மிதமான இடர் (Moderate Risk)')
                      : `${plan.environmental_risk} Risk`}
                  </span>
                </div>
              </div>

              {/* Rotation Sequence Steps */}
              <div>
                <span className="text-xs font-bold text-slate-600 mb-2 block font-tamil">
                  {t('recommendationsPage.rotationSeq')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plan.rotation_sequence.map((step, sIdx) => {
                    const cropName = isTamil ? (step.crop_name_ta || step.crop_name_en) : (step.crop_name_en || step.crop_name_ta);
                    return (
                      <div key={sIdx} className="bg-cream-50 p-3 rounded-xl border border-cream-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-forest-800 uppercase font-tamil">
                            {t('recommendationsPage.season')} {step.step}: {step.season}
                          </span>
                          {step.nitrogen_fixing && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold font-tamil">
                              {t('recommendationsPage.nitrogenFixing')}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-sm text-slate-900 font-tamil">{cropName}</div>
                        <div className="text-[11px] text-slate-500 font-tamil">{t('recommendationsPage.duration')} {step.duration_days}</div>
                        <div className="text-[11px] text-slate-500 font-tamil">{t('recommendationsPage.waterReq')} {step.water_req_mm}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation & Soil Health */}
              <div className="p-3 bg-forest-50/80 rounded-xl border border-forest-100 space-y-1.5 text-xs text-slate-700 font-tamil leading-relaxed">
                <p><strong>{t('recommendationsPage.explanation')}</strong> {planExplanation}</p>
                <p className="text-forest-900"><strong>{t('recommendationsPage.soilBenefit')}</strong> {plan.soil_health_benefit}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

