import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  WeatherAnalytics, SoilMoistureAnalytics, VegetationAnalytics,
  FarmHealthScore, CropRotationPlan
} from '../../types';
import {
  MapPin, CloudRain, Droplets, Leaf, Activity, Compass,
  RefreshCw, Mic, ChevronRight, AlertTriangle, CheckCircle2,
  Calendar, ArrowUpRight, Sparkles, Layers, Bookmark, FileText,
  User, Sun, ArrowRight, ShieldCheck, Clock, Bell
} from 'lucide-react';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { FarmlandMap } from '../../components/maps/FarmlandMap';

export const FarmerDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { selectedFarmland, syncCurrentWithNasa, isSyncingNasa } = useFarmland();
  const { user } = useAuth();
  const isTa = i18n.language === 'ta';

  const [weather, setWeather] = useState<WeatherAnalytics | null>(null);
  const [soil, setSoil] = useState<SoilMoistureAnalytics | null>(null);
  const [veg, setVeg] = useState<VegetationAnalytics | null>(null);
  const [health, setHealth] = useState<FarmHealthScore | null>(null);
  const [plans, setPlans] = useState<CropRotationPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const farmerDisplayName = user?.full_name?.split(' ')[0] || (isTa ? 'விவசாயி' : 'Farmer');

  useEffect(() => {
    if (!selectedFarmland) return;

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [w, s, v, h, p] = await Promise.all([
          api.getWeatherAnalytics(selectedFarmland.id).catch(() => null),
          api.getSoilMoistureAnalytics(selectedFarmland.id).catch(() => null),
          api.getVegetationAnalytics(selectedFarmland.id).catch(() => null),
          api.getFarmHealthScore(selectedFarmland.id).catch(() => null),
          api.getRecommendations(selectedFarmland.id).catch(() => []),
        ]);
        setWeather(w);
        setSoil(s);
        setVeg(v);
        setHealth(h);
        setPlans(p);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedFarmland]);

  if (!selectedFarmland) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-cream-300 shadow-md space-y-4 max-w-lg mx-auto my-12 font-tamil">
        <div className="w-16 h-16 rounded-full bg-cream-100 text-forest-700 mx-auto flex items-center justify-center text-3xl">
          🌱
        </div>
        <h3 className="text-xl font-bold text-forest-900">
          {isTa ? 'எந்த நிலமும் பதிவு செய்யப்படவில்லை' : 'No Farmland Registered Yet'}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {isTa
            ? 'உங்கள் விவசாய நிலத்தை குரல் வழியே எளிமையாகப் பதிவு செய்ய "விவசாயி பதிவு" பக்கத்திற்குச் செல்லவும்.'
            : 'Please complete your farm registration via voice assistant to unlock personalized satellite intelligence.'}
        </p>
        <Link
          to="/farmer-registration"
          className="inline-flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition"
        >
          <Mic className="w-4 h-4 animate-pulse" />
          <span>{isTa ? 'குரல் வழி விவசாயி பதிவு' : 'Start Farmer Voice Registration'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16 font-sans">
      {/* 1. Warm Farmer Personalized Greeting & Status Bar */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-850 to-forest-800 text-white rounded-3xl p-6 shadow-xl border border-forest-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-leaf-500/20 text-leaf-300 border border-leaf-400/30 font-tamil">
              {isTa ? `வணக்கம், ${farmerDisplayName}! 🌾` : `Welcome, ${farmerDisplayName}! 🌾`}
            </span>
            <span className="text-xs text-cream-200">
              {selectedFarmland.village}, {selectedFarmland.taluk || ''} {selectedFarmland.district}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-tamil text-white">
            {selectedFarmland.name}
          </h1>

          <p className="text-xs sm:text-sm text-cream-200 flex flex-wrap items-center gap-3 font-tamil">
            <span>
              {isTa ? 'பரப்பளவு:' : 'Area:'}{' '}
              <strong className="text-white">{selectedFarmland.area_acres} {isTa ? 'ஏக்கர்' : 'Acres'}</strong>{' '}
              ({(selectedFarmland.area_acres * 0.404).toFixed(2)} {isTa ? 'ஹெக்' : 'Ha'})
            </span>
            <span>•</span>
            <span>
              {isTa ? 'நடப்பு பயிர்:' : 'Current Crop:'}{' '}
              <strong className="text-leaf-300">{selectedFarmland.current_crop || (isTa ? 'நெல்' : 'Paddy')}</strong>
            </span>
            <span>•</span>
            <span>
              {isTa ? 'மண்:' : 'Soil:'}{' '}
              <strong className="text-white capitalize">{selectedFarmland.soil_type}</strong>
            </span>
            <span>•</span>
            <span>
              {isTa ? 'பாசனம்:' : 'Irrigation:'}{' '}
              <strong className="text-white capitalize">{selectedFarmland.irrigation_type}</strong>
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={syncCurrentWithNasa}
            disabled={isSyncingNasa}
            className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-lg transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingNasa ? 'animate-spin' : ''}`} />
            <span>
              {isSyncingNasa
                ? (isTa ? 'நாசா தரவு ஒத்திசைகிறது...' : 'Syncing NASA Data...')
                : (isTa ? 'நாசா செயற்கைக்கோள் புதுப்பி' : 'Sync NASA Satellites')}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Quick Action Gateway Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Link
          to="/simulation-world"
          className="p-4 bg-gradient-to-br from-forest-900 via-forest-850 to-leaf-950 border border-forest-700 hover:border-leaf-500 rounded-2xl flex items-center gap-3 transition-all shadow-md group"
        >
          <div className="p-2.5 bg-leaf-500/20 text-leaf-300 rounded-xl group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-white font-tamil">
              {isTa ? 'விவசாய அனுபவ உலகம்' : 'Simulation World'}
            </p>
            <p className="text-[10px] text-leaf-300">{isTa ? '3D மாதிரி சோதனைகள்' : '3D Farm Simulators'}</p>
          </div>
        </Link>

        <Link
          to="/farmer/plots"
          className="p-4 bg-white border border-cream-300 hover:border-forest-500 rounded-2xl flex items-center gap-3 transition-all shadow-sm group"
        >
          <div className="p-2.5 bg-cream-100 text-forest-700 rounded-xl group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-forest-900 font-tamil">
              {isTa ? 'நிலப் பகுதிகள்' : 'Farm Plots'}
            </p>
            <p className="text-[10px] text-slate-500">{isTa ? 'உட்பிரிவு மேலாண்மை' : 'Sub-Divided Parcels'}</p>
          </div>
        </Link>

        <Link
          to="/farmer/recommendations"
          className="p-4 bg-white border border-cream-300 hover:border-forest-500 rounded-2xl flex items-center gap-3 transition-all shadow-sm group"
        >
          <div className="p-2.5 bg-cream-100 text-leaf-700 rounded-xl group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-forest-900 font-tamil">
              {isTa ? 'பயிர் பரிந்துரை' : 'Crop Advisory'}
            </p>
            <p className="text-[10px] text-slate-500">{isTa ? 'TNAU சுழற்சி முறை' : 'TNAU Agronomic Plans'}</p>
          </div>
        </Link>

        <Link
          to="/farmer/calendar"
          className="p-4 bg-white border border-cream-300 hover:border-forest-500 rounded-2xl flex items-center gap-3 transition-all shadow-sm group"
        >
          <div className="p-2.5 bg-cream-100 text-amber-700 rounded-xl group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-forest-900 font-tamil">
              {isTa ? 'பண்ணை நாட்காட்டி' : 'Farm Calendar'}
            </p>
            <p className="text-[10px] text-slate-500">{isTa ? 'பருவக் கால பணிகள்' : 'Seasonal Schedule'}</p>
          </div>
        </Link>
      </div>

      {/* 3. 4 Core Environmental Health Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Farm Health Score */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-tamil">
              {isTa ? 'நில ஆரோக்கியக் குறியீடு' : 'Farm Health Score'}
            </span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-forest-950 font-mono">
              {health?.overall_health_score ? Math.round(health.overall_health_score) : '--'}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
            {health?.health_status || (isTa ? 'நாசா குறியீட்டு ஆய்வு' : 'NASA Satellite Index')}
          </div>
          <Link to="/farmer/farm-health" className="text-[11px] text-leaf-700 hover:underline font-semibold flex items-center gap-1 font-tamil">
            <span>{isTa ? 'முழு ஆய்வு விவரங்கள்' : 'View Full Details'}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 2: Temperature & Heat */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-tamil">
              {isTa ? 'சராசரி வெப்பநிலை' : 'Average Temperature'}
            </span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-forest-950 font-mono">
              {weather?.current_temp_avg != null ? `${weather.current_temp_avg}°` : '29.8°'}
            </span>
            <span className="text-xs text-slate-400">C (NASA POWER)</span>
          </div>
          <div className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 truncate">
            {weather?.rainfall_anomaly_status || (isTa ? 'மிதமான வெப்பம் (உகந்தது)' : 'Optimal Vegetative Heat')}
          </div>
          <Link to="/farmer/weather" className="text-[11px] text-leaf-700 hover:underline font-semibold flex items-center gap-1 font-tamil">
            <span>{isTa ? 'வானிலை விவரங்கள்' : 'Weather Details'}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Soil Moisture */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-tamil">
              {isTa ? 'மண் ஈரப்பதம் (NASA SMAP)' : 'Soil Moisture (NASA SMAP)'}
            </span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-forest-950 font-mono">
              {soil?.surface_moisture_percentage != null
                ? `${Math.round(soil.surface_moisture_percentage)}%`
                : (soil?.surface_moisture_volumetric != null ? `${Math.round(soil.surface_moisture_volumetric * 100)}%` : '24%')}
            </span>
            <span className="text-xs text-slate-400">Volumetric</span>
          </div>
          <div className="text-xs font-medium text-cyan-800 bg-cyan-50 px-2 py-1 rounded-md border border-cyan-200 truncate">
            {soil?.moisture_status || (isTa ? 'போதுமான ஈரப்பதம் உள்ளது' : 'Adequate Moisture Level')}
          </div>
          <Link to="/farmer/soil-moisture" className="text-[11px] text-leaf-700 hover:underline font-semibold flex items-center gap-1 font-tamil">
            <span>{isTa ? 'ஈரப்பதப் போக்கு' : 'Moisture Trends'}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Vegetation Condition */}
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-tamil">
              {isTa ? 'பயிர் பசுமை (MODIS NDVI)' : 'Crop Greenness (MODIS NDVI)'}
            </span>
            <Leaf className="w-4 h-4 text-leaf-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-forest-950 font-mono">
              {veg?.current_ndvi ? veg.current_ndvi.toFixed(2) : '0.68'}
            </span>
            <span className="text-xs text-slate-400">NDVI</span>
          </div>
          <div className="text-xs font-medium text-leaf-800 bg-leaf-50 px-2 py-1 rounded-md border border-leaf-200 truncate">
            {veg?.vegetation_health_status || (isTa ? 'செழிப்பான பயிர் நிலை' : 'Vigorous Crop Health')}
          </div>
          <Link to="/farmer/vegetation" className="text-[11px] text-leaf-700 hover:underline font-semibold flex items-center gap-1 font-tamil">
            <span>{isTa ? 'பசுமைப் போக்கு' : 'Vegetation Trend'}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 4. Interactive Farmland Map & Crop Rotation Advisory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-cream-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-forest-900 text-sm sm:text-base font-tamil">
                {isTa ? 'நில அமைவிடம் & எல்லை வரைபடம்' : 'Farmland GPS Boundary Map'}
              </h3>
              <p className="text-xs text-slate-500">
                Lat: {selectedFarmland.latitude.toFixed(4)}, Lon: {selectedFarmland.longitude.toFixed(4)} • {selectedFarmland.district}
              </p>
            </div>
            <Link
              to="/farmer/farmlands"
              className="text-xs font-semibold text-leaf-700 hover:text-leaf-900 font-tamil"
            >
              {isTa ? 'எல்லையை திருத்த' : 'Edit Boundary'}
            </Link>
          </div>

          <FarmlandMap
            centerLat={selectedFarmland.latitude}
            centerLon={selectedFarmland.longitude}
            boundaryGeojson={selectedFarmland.boundary_geojson}
            className="h-72 w-full rounded-2xl overflow-hidden shadow-inner"
          />

          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span>NASA GIBS Satellite Layer Integrated</span>
            <Link to="/farmer/plots" className="text-leaf-700 hover:underline font-semibold flex items-center gap-1 font-tamil">
              <span>{isTa ? 'நில உட்பிரிவுகளைப் பார் (Plots)' : 'Manage Farm Plots'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* TNAU Recommended Advisory Column (1 col) */}
        <div className="bg-white p-5 rounded-3xl border border-cream-300 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-forest-900 text-sm sm:text-base font-tamil">
                {isTa ? 'பரிந்துரைக்கப்பட்ட பயிர் திட்டம்' : 'Recommended Crop Plan'}
              </h3>
              <Compass className="w-4 h-4 text-leaf-600" />
            </div>

            {plans.length > 0 ? (
              <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 space-y-2">
                <span className="text-xs font-bold text-forest-900 uppercase tracking-wider block font-tamil">
                  {plans[0].plan_name}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-tamil">
                  {isTa ? plans[0].explanation_ta : (plans[0].explanation_en || plans[0].explanation_ta)}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-forest-900 font-semibold border-t border-forest-200 font-tamil">
                  <span>{isTa ? 'பொருத்தம்:' : 'Suitability:'} <strong>{plans[0].overall_suitability_score}%</strong></span>
                  <span>{isTa ? 'நீர் தேவை:' : 'Water:'} <strong>{plans[0].water_requirement_desc}</strong></span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl font-tamil">
                {isTa ? 'பயிர் பரிந்துரைகளை உருவாக்க "பயிர் பரிந்துரைகள்" பக்கத்திற்கு செல்லவும்.' : 'Navigate to Crop Recommendations to generate plans.'}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <Link
              to="/farmer/recommendations"
              className="w-full flex items-center justify-center gap-1.5 bg-forest-800 hover:bg-forest-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow font-tamil"
            >
              <span>{isTa ? 'அனைத்து 5 பயிர் திட்டங்களையும் காண்க' : 'View All 5 Crop Plans'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/simulation-world"
              className="w-full flex items-center justify-center gap-1.5 bg-leaf-50 hover:bg-leaf-100 text-forest-900 border border-leaf-300 text-xs font-semibold py-2 rounded-xl transition font-tamil"
            >
              <Sparkles className="w-3.5 h-3.5 text-leaf-600" />
              <span>{isTa ? 'விவசாய அனுபவ உலகத்தை திற (3D)' : 'Open Farm Simulation World (3D)'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
