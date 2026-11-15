import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import { NasaProvenanceBadge } from '../ui/NasaProvenanceBadge';

interface SoilMoistureChartsProps {
  timeseries: any[];
  surfacePct?: number;
  rootzonePct?: number;
  moistureStatus: string;
  drynessIndex: number;
}

export const SoilMoistureCharts: React.FC<SoilMoistureChartsProps> = ({
  timeseries,
  surfacePct = 22.0,
  rootzonePct = 25.0,
  moistureStatus,
  drynessIndex
}) => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const formatMoistureStatus = (raw: string) => {
    if (!raw) return isTamil ? 'கணக்கிடப்படுகிறது...' : 'Calculating...';
    const lower = raw.toLowerCase();
    if (lower.includes('severe') || lower.includes('deficit')) {
      return isTamil ? 'கடுமையான தகைவு / வறட்சி (Severe Stress)' : 'Severe Moisture Deficit (வறட்சி)';
    }
    if (lower.includes('moderate')) {
      return isTamil ? 'மிதமான தகைவு - பாசனம் தேவை (Moderate Stress)' : 'Moderate Stress - Irrigation Needed (மிதமான தகைவு)';
    }
    if (lower.includes('adequate') || lower.includes('optimal')) {
      return isTamil ? 'போதுமான ஈரப்பதம் - சீரான வளர்ச்சி (Adequate)' : 'Adequate - Optimal Growth (போதுமானது)';
    }
    if (lower.includes('high') || lower.includes('saturation')) {
      return isTamil ? 'அதிக ஈரப்பதம் / நிறைவு நிலை (High Moisture)' : 'High Moisture / Saturation (அதிக ஈரப்பதம்)';
    }
    return raw;
  };

  return (
    <div className="space-y-6">
      {/* Gauge & Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium font-tamil">{t('soilMoisturePage.surfaceMoisture')}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-600">{surfacePct}%</span>
            <span className="text-xs text-slate-400">{t('soilMoisturePage.volumetric')}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-tamil">{t('soilMoisturePage.surfaceNote')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium font-tamil">{t('soilMoisturePage.rootzoneMoisture')}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">{rootzonePct}%</span>
            <span className="text-xs text-slate-400">{t('soilMoisturePage.assimilated')}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-tamil">{t('soilMoisturePage.rootzoneNote')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium font-tamil">{t('soilMoisturePage.moistureStatus')}</span>
          <div className="mt-1 text-sm font-bold text-slate-800 truncate" title={moistureStatus}>
            {formatMoistureStatus(moistureStatus)}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${drynessIndex > 60 ? 'bg-rose-500' : drynessIndex > 35 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, drynessIndex)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Surface vs Root-Zone Moisture Timeseries */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base font-tamil">
              {t('soilMoisturePage.chartTitle')}
            </h4>
            <p className="text-xs text-slate-500 font-tamil">
              {t('soilMoisturePage.chartDesc')}
            </p>
          </div>
          <NasaProvenanceBadge category={1} sourceText="NASA SMAP SPL3SMP_E / SPL4SMGP" resolution="9km / 36km" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis unit="%" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine y={14} stroke="#ef4444" strokeDasharray="3 3" label={{ value: t('soilMoisturePage.wiltingStress'), fill: '#ef4444', fontSize: 10 }} />
              <Area type="monotone" dataKey="rootzone_moisture_pct" name={t('soilMoisturePage.rootzoneLegend')} stroke="#059669" fill="#d1fae5" fillOpacity={0.4} strokeWidth={2} />
              <Area type="monotone" dataKey="surface_moisture_pct" name={t('soilMoisturePage.surfaceLegend')} stroke="#2563eb" fill="#dbeafe" fillOpacity={0.6} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[11px] text-slate-500 bg-cream-50 p-2.5 rounded-lg border border-cream-200 font-tamil">
          <strong>{t('soilMoisturePage.sciNoteTitle')}</strong> {t('soilMoisturePage.sciNoteDesc')}
        </div>
      </div>
    </div>
  );
};

