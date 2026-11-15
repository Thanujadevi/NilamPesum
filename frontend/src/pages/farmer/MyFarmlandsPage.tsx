import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { FarmlandMap } from '../../components/maps/FarmlandMap';
import { MapPin, Plus, Trash2, CheckCircle2, Crosshair, ArrowRight } from 'lucide-react';

export const MyFarmlandsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { farmlands, selectedFarmland, setSelectedFarmland, refreshFarmlands } = useFarmland();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    district: 'Thanjavur',
    taluk: '',
    village: '',
    survey_number: '',
    latitude: 10.7870,
    longitude: 79.1378,
    area_acres: 2.5,
    area_hectares: 1.01,
    irrigation_type: 'canal' as any,
    soil_type: 'alluvial' as any,
    water_availability: 'medium' as any,
    farming_goal: 'save_water' as any,
    current_crop: 'Paddy',
    boundary_geojson: null as any
  });
  const [isSaving, setIsSaving] = useState(false);

  const districts = [
    'Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Madurai', 'Tiruchirappalli',
    'Salem', 'Coimbatore', 'Erode', 'Tirunelveli', 'Dindigul', 'Cuddalore',
    'Villupuram', 'Pudukkottai', 'Ramanathapuram', 'Theni', 'Karur'
  ];

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }));
        },
        (err) => {
          console.warn('Geolocation denied, using default Thanjavur coords');
        }
      );
    }
  };

  const handlePolygonDrawn = (coords: [number, number][], acres: number, ha: number) => {
    // Convert to GeoJSON [lon, lat] format
    const geojsonRing = coords.map(c => [c[1], c[0]]);
    if (geojsonRing.length > 0) {
      geojsonRing.push(geojsonRing[0]); // close loop
    }
    setFormData((prev) => ({
      ...prev,
      area_acres: acres,
      area_hectares: ha,
      boundary_geojson: {
        type: 'Polygon',
        coordinates: [geojsonRing]
      }
    }));
  };

  const handleSaveFarmland = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.createFarmland(formData);
      await refreshFarmlands();
      setIsAdding(false);
    } catch (err) {
      console.error('Error saving farmland:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = isTamil ? 'இந்த நிலத்தை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this farmland?';
    if (window.confirm(confirmMsg)) {
      await api.deleteFarmland(id);
      await refreshFarmlands();
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
            {t('myFarmlandsPage.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {t('myFarmlandsPage.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow self-start sm:self-auto cursor-pointer font-tamil"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? t('myFarmlandsPage.cancel') : t('myFarmlandsPage.addNew')}</span>
        </button>
      </div>

      {/* Add Farmland Form */}
      {isAdding && (
        <form onSubmit={handleSaveFarmland} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6 animate-fadeIn">
          <h3 className="font-bold text-slate-900 text-base font-tamil border-b pb-2">
            {isTamil ? 'புதிய நிலப் பதிவு (Register New Farmland)' : 'Register New Farmland'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('myFarmlandsPage.farmName')}:</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isTamil ? 'எ.கா. காவிரி பாசன நன்செய் நிலம்' : 'e.g. Cauvery Riverbank Farm'}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('myFarmlandsPage.district')}:</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white cursor-pointer"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('myFarmlandsPage.village')}:</label>
              <input
                type="text"
                required
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder={isTamil ? 'எ.கா. திருவையாறு' : 'e.g. Thiruvaiyaru'}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('myFarmlandsPage.surveyNo')}:</label>
              <input
                type="text"
                value={formData.survey_number}
                onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                placeholder="142/3A"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('myFarmlandsPage.soilType')}:</label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value as any })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-tamil"
              >
                <option value="alluvial">{isTamil ? 'வண்டல் மண் (Alluvial)' : 'Alluvial Soil'}</option>
                <option value="red_loam">{isTamil ? 'செம்மண் (Red Loam)' : 'Red Loam Soil'}</option>
                <option value="black_cotton">{isTamil ? 'கரிசல் மண் (Black Cotton)' : 'Black Cotton Soil'}</option>
                <option value="clay_loam">{isTamil ? 'களிமண் (Clay Loam)' : 'Clay Loam Soil'}</option>
                <option value="sandy_loam">{isTamil ? 'மணல் கலந்த வண்டல் (Sandy Loam)' : 'Sandy Loam'}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('myFarmlandsPage.irrigation')}:</label>
              <select
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value as any })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-tamil"
              >
                <option value="canal">{isTamil ? 'கால்வாய் பாசனம் (Canal)' : 'Canal Irrigation'}</option>
                <option value="borewell">{isTamil ? 'ஆழ்துளை கிணறு (Borewell)' : 'Borewell'}</option>
                <option value="open_well">{isTamil ? 'திறந்தவெளி கிணறு (Open Well)' : 'Open Well'}</option>
                <option value="rainfed">{isTamil ? 'வானம் பார்த்த பூமி (Rainfed)' : 'Rainfed'}</option>
                <option value="drip">{isTamil ? 'சொட்டு நீர் பாசனம் (Drip)' : 'Drip'}</option>
              </select>
            </div>
          </div>

          {/* Interactive Map for boundary marking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 block font-tamil">
                {t('myFarmlandsPage.drawBoundaryHint')}
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="flex items-center gap-1 text-xs text-forest-700 hover:text-forest-900 font-semibold font-tamil cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{t('myFarmlandsPage.detectGps')}</span>
              </button>
            </div>

            <FarmlandMap
              centerLat={formData.latitude}
              centerLon={formData.longitude}
              interactive={true}
              onPolygonChange={handlePolygonDrawn}
              className="h-72 w-full rounded-xl overflow-hidden shadow-inner border"
            />

            <div className="text-xs text-slate-600 font-medium font-tamil">
              {isTamil ? 'கணக்கிடப்பட்ட பரப்பளவு:' : 'Calculated Land Area:'} <strong>{formData.area_acres} {isTamil ? 'ஏக்கர்' : 'Acres'}</strong> ({formData.area_hectares} {isTamil ? 'ஹெக்டேர்' : 'Hectares'})
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 font-tamil cursor-pointer"
            >
              {t('myFarmlandsPage.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-700 text-white shadow font-tamil cursor-pointer"
            >
              {isSaving ? t('myFarmlandsPage.saving') : t('myFarmlandsPage.save')}
            </button>
          </div>
        </form>
      )}

      {/* Saved Farmlands Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farmlands.map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedFarmland(f)}
            className={`bg-white rounded-2xl p-5 border shadow-sm transition cursor-pointer flex flex-col justify-between space-y-4 ${
              selectedFarmland?.id === f.id
                ? 'border-forest-600 ring-2 ring-forest-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest-800 uppercase tracking-wider px-2 py-0.5 rounded bg-forest-50 border border-forest-100">
                  {f.district}
                </span>
                {selectedFarmland?.id === f.id && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 font-tamil">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isTamil ? 'செயலில் உள்ளது' : 'Active'}
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-slate-900 font-tamil">
                {f.name}
              </h3>

              <div className="text-xs text-slate-500 space-y-1 font-tamil">
                <p>{isTamil ? 'கிராமம்:' : 'Village:'} <strong>{f.village}</strong></p>
                <p>{isTamil ? 'பரப்பளவு:' : 'Area:'} <strong>{f.area_acres} {isTamil ? 'ஏக்கர்' : 'Acres'}</strong> ({f.area_hectares} {isTamil ? 'ஹெக்டேர்' : 'Ha'})</p>
                <p>{isTamil ? 'மண் வகை:' : 'Soil:'} <strong>{f.soil_type}</strong></p>
                <p>{isTamil ? 'பாசனம்:' : 'Irrigation:'} <strong>{f.irrigation_type}</strong></p>
                <p className="text-[11px] text-slate-400">Lat: {f.latitude.toFixed(4)}, Lon: {f.longitude.toFixed(4)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-forest-700 font-semibold font-tamil">
                {isTamil ? 'தேர்ந்தெடுக்க கிளிக் செய்க' : 'Click to Select as Active'}
              </span>

              {farmlands.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(f.id);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                  title={isTamil ? 'நிலத்தை நீக்குக' : 'Delete farmland'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

