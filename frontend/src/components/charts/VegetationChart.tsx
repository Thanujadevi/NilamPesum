import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import { NasaProvenanceBadge } from '../ui/NasaProvenanceBadge';

interface VegetationChartProps {
  timeseries: any[];
  currentNdvi?: number;
  currentEvi?: number;
  status: string;
}

export const VegetationChart: React.FC<VegetationChartProps> = ({
  timeseries,
  currentNdvi = 0.58,
  currentEvi = 0.45,
  status
}) => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const formatStatus = (raw: string) => {
    if (!raw) return isTamil ? 'கணக்கிடப்படுகிறது...' : 'Calculating...';
    const lower = raw.toLowerCase();
    if (lower.includes('vigorous')) {
      return isTamil ? 'செழிப்பான வளர்ச்சி (Vigorous)' : 'Vigorous Growth (செழிப்பு)';
    }
    if (lower.includes('healthy')) {
      return isTamil ? 'ஆரோக்கியமானது (Healthy)' : 'Healthy Canopy (ஆரோக்கியம்)';
    }
    if (lower.includes('moderate')) {
      return isTamil ? 'மிதமானது (Moderate)' : 'Moderate (மிதமானது)';
    }
    if (lower.includes('stress') || lower.includes('sparse')) {
      return isTamil ? 'பயிர் தகைவு / அழுத்தம் (Stress)' : 'Moisture Stress (பயிர் தகைவு)';
    }
    if (lower.includes('fallow')) {
      return isTamil ? 'தரிசு நிலை (Fallow)' : 'Fallow Land (தரிசு நிலம்)';
    }
    return raw;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium font-tamil">{t('vegetationPage.ndviCard')}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">{currentNdvi}</span>
            <span className="text-xs text-slate-400">{t('vegetationPage.ndviRange')}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-tamil">{t('vegetationPage.ndviNote')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium font-tamil">{t('vegetationPage.eviCard')}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-600">{currentEvi}</span>
            <span className="text-xs text-slate-400">{t('vegetationPage.eviRange')}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-tamil">{t('vegetationPage.eviNote')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium font-tamil">{t('vegetationPage.statusCard')}</span>
          <div className="mt-1 text-sm font-bold text-slate-800 truncate" title={status}>
            {formatStatus(status)}
          </div>
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold font-tamil">
            {t('vegetationPage.healthyStatus')}
          </span>
        </div>
      </div>

      {/* Trajectory Chart */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base font-tamil">
              {t('vegetationPage.chartTitle')}
            </h4>
            <p className="text-xs text-slate-500 font-tamil">
              {t('vegetationPage.chartDesc')}
            </p>
          </div>
          <NasaProvenanceBadge category={1} sourceText="NASA MODIS & HLS" resolution="30m - 250m" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 1.0]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine y={0.4} stroke="#10b981" strokeDasharray="3 3" label={{ value: t('vegetationPage.healthyThreshold'), fill: '#10b981', fontSize: 10 }} />
              <Line type="monotone" dataKey="ndvi" name={t('vegetationPage.ndviLegend')} stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="evi" name={t('vegetationPage.eviLegend')} stroke="#0d9488" strokeWidth={2} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[11px] text-slate-500 bg-cream-50 p-2.5 rounded-lg border border-cream-200 font-tamil">
          <strong>{t('vegetationPage.sciNoteTitle')}</strong> {t('vegetationPage.sciNoteDesc')}
        </div>
      </div>
    </div>
  );
};

