import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { HistoricalYearData } from '../../types';
import { NasaProvenanceBadge } from '../ui/NasaProvenanceBadge';

interface HistoricalChartsProps {
  yearlyRecords: HistoricalYearData[];
  meanAnnualRainfall: number;
}

export const HistoricalCharts: React.FC<HistoricalChartsProps> = ({
  yearlyRecords,
  meanAnnualRainfall
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* 10-Year Annual Rainfall Bar Chart */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base font-tamil">
              {t('historicalPage.rainChartTitle')}
            </h4>
            <p className="text-xs text-slate-500 font-tamil">
              {t('historicalPage.rainChartDesc')}
            </p>
          </div>
          <NasaProvenanceBadge category={1} sourceText="NASA POWER 10-Yr Climatology" resolution="0.5° (~50km)" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyRecords}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis unit="mm" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="ne_monsoon_rainfall_mm" name={t('historicalPage.neMonsoon')} fill="#2563eb" stackId="a" />
              <Bar dataKey="sw_monsoon_rainfall_mm" name={t('historicalPage.swMonsoon')} fill="#0d9488" stackId="a" />
              <Bar dataKey="summer_rainfall_mm" name={t('historicalPage.summerRain')} fill="#f59e0b" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between font-tamil">
          <span>{t('historicalPage.longTermMean')} <strong>{meanAnnualRainfall} mm</strong></span>
          <span className="text-[11px] text-blue-700 font-semibold">{t('historicalPage.primaryRainfall')}</span>
        </div>
      </div>

      {/* 10-Year Mean Temperature Trend */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base font-tamil">
              {t('historicalPage.tempChartTitle')}
            </h4>
            <p className="text-xs text-slate-500 font-tamil">
              {t('historicalPage.tempChartDesc')}
            </p>
          </div>
          <NasaProvenanceBadge category={1} sourceText="NASA POWER T2M Decadal" resolution="0.5° (~50km)" />
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyRecords}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis unit="°C" domain={[27.0, 30.0]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="mean_temperature_c" name={t('historicalPage.meanTempLegend')} stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

