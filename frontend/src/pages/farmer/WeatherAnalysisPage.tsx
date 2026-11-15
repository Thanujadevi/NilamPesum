import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { WeatherAnalytics } from '../../types';
import { WeatherCharts } from '../../components/charts/WeatherCharts';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { CloudRain, Sun, Wind, Droplets, RefreshCw } from 'lucide-react';

export const WeatherAnalysisPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland, syncCurrentWithNasa, isSyncingNasa } = useFarmland();
  const [weather, setWeather] = useState<WeatherAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedFarmland) return;
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        const data = await api.getWeatherAnalytics(selectedFarmland.id);
        setWeather(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeather();
  }, [selectedFarmland]);

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
              {t('weatherPage.title')}
            </h1>
            <NasaProvenanceBadge category={1} sourceText="NASA POWER Daily" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {selectedFarmland.name} ({selectedFarmland.district}) - {t('weatherPage.coordinates', { lat: selectedFarmland.latitude.toFixed(4), lon: selectedFarmland.longitude.toFixed(4) })}
          </p>
        </div>

        <button
          onClick={syncCurrentWithNasa}
          disabled={isSyncingNasa}
          className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncingNasa ? 'animate-spin' : ''}`} />
          <span>{isSyncingNasa ? t('weatherPage.syncing') : t('weatherPage.syncBtn')}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{t('weatherPage.avgTemp')}</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {weather?.current_temp_avg ?? '--'}°C
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{t('weatherPage.tempNote')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CloudRain className="w-4 h-4 text-blue-500" />
            <span>{t('weatherPage.rain30d')}</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">
            {weather?.total_rainfall_last_30_days ?? 0} mm
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{t('weatherPage.rainNote')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Droplets className="w-4 h-4 text-cyan-500" />
            <span>{t('weatherPage.humidity')}</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {weather?.current_humidity ? `${weather.current_humidity}%` : '--'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{t('weatherPage.humidityNote')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Wind className="w-4 h-4 text-purple-500" />
            <span>{t('weatherPage.solar')}</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {weather?.current_solar_radiation ? `${weather.current_solar_radiation}` : '--'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{t('weatherPage.solarNote')}</p>
        </div>
      </div>

      {/* Recharts */}
      {weather && (
        <WeatherCharts
          dailyRecords={weather.daily_records}
          monthlyRainfall={weather.monthly_rainfall_records}
        />
      )}
    </div>
  );
};

