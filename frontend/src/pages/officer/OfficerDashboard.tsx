import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ShieldAlert, MapPin, CloudRain, Droplets, Leaf, AlertTriangle, Users } from 'lucide-react';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';

export const OfficerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setIsLoading(true);
        const res = await api.getRegionalOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOverview();
  }, []);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
              வேளாண் அலுவலர் வட்டாரக் கண்காணிப்புப் பலகை
            </h1>
            <NasaProvenanceBadge category={1} sourceText="Aggregated Regional" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Agricultural Officer Village & District Environmental Monitoring Dashboard (Tamil Nadu)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
          <Users className="w-4 h-4 text-forest-700" />
          <span>பதிவு செய்த நிலங்கள்: <strong>{data?.registered_farmland_count ?? 1}</strong></span>
        </div>
      </div>

      {/* Alert Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 font-tamil">
              வறட்சி விழிப்புணர்வு மாவட்டங்கள் (Drought Watch):
            </h4>
            <p className="text-xs text-amber-800 mt-1 font-tamil">
              {data?.aggregated_alert_summary?.drought_watch_districts?.join(', ')} - மழைப்பற்றாக்குறை மற்றும் குறைந்த மண் ஈரப்பதம் நிலவுகிறது.
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
          <CloudRain className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 font-tamil">
              சீரான மழைப்பொழிவு மண்டலங்கள் (Normal Precipitation):
            </h4>
            <p className="text-xs text-emerald-800 mt-1 font-tamil">
              {data?.aggregated_alert_summary?.normal_precipitation_districts?.join(', ')} - சாகுபடிக்கு உகந்த சீரான சூழல்.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Monitoring Table & Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base font-tamil">
          தமிழ்நாடு வேளாண் மண்டலங்களின் தற்போதைய நாசா குறிகாட்டிகள்
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.monitoring_regions?.map((reg: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 font-tamil">{reg.district}</h4>
                  <span className="text-[11px] text-slate-400">{reg.zone}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  reg.environmental_stress_level === 'Low'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  அபாயம்: {reg.environmental_stress_level}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p>மண்: <strong>{reg.dominant_soil}</strong></p>
                <p>வெப்பநிலை: <strong>{reg.mean_temp_c}°C</strong></p>
                <p>30 நாள் மழை: <strong>{reg.recent_rainfall_30d_mm} mm</strong></p>
                <p>மண் ஈரப்பதம்: <strong>{reg.soil_moisture_status}</strong></p>
                <p>பயிர் பசுமை (NDVI): <strong>{reg.vegetation_ndvi}</strong></p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-tamil">
                <strong>அலுவலர் வழிகாட்டல்:</strong> {reg.advisory}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

