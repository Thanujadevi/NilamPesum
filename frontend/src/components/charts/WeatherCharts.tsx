import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { DailyObservation } from '../../types';
import { NasaProvenanceBadge } from '../ui/NasaProvenanceBadge';

interface WeatherChartsProps {
  dailyRecords: DailyObservation[];
  monthlyRainfall: { month: string; rainfall_mm: number }[];
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ dailyRecords, monthlyRainfall }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Daily Temperature Trends */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base font-tamil">
              {t('weatherPage.dailyTrendTitle')}
            </h4>
            <p className="text-xs text-slate-500 font-tamil">
              {t('weatherPage.dailyTrendDesc')}
            </p>
          </div>
          <NasaProvenanceBadge category={1} sourceText="NASA POWER T2M" resolution="0.5° (~50km)" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRecords}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis unit="°C" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="temp_max" name={t('weatherPage.maxTemp')} stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="temp_avg" name={t('weatherPage.avgTempLegend')} stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="temp_min" name={t('weatherPage.minTemp')} stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Rainfall Summary */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base font-tamil">
              {t('weatherPage.monthlyRainTitle')}
            </h4>
            <p className="text-xs text-slate-500 font-tamil">
              {t('weatherPage.monthlyRainDesc')}
            </p>
          </div>
          <NasaProvenanceBadge category={1} sourceText="NASA POWER PRECTOTCORR" resolution="0.5° (~50km)" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRainfall}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis unit="mm" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="rainfall_mm" name={t('weatherPage.rainfallLegend')} fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

