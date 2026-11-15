import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sprout, CheckCircle2, MapPin, Navigation, Compass,
  Layers, Droplets, Target, ArrowRight, ArrowLeft, Shield
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet standard icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map click handler to place polygon vertices
const BoundaryMapPicker: React.FC<{
  position: [number, number];
  polygonCoords: [number, number][];
  onAddPoint: (lat: number, lng: number) => void;
}> = ({ position, polygonCoords, onAddPoint }) => {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <>
      <Marker position={position} />
      {polygonCoords.length > 2 && (
        <Polygon
          positions={polygonCoords}
          pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.35, weight: 2 }}
        />
      )}
    </>
  );
};

export const OnboardingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    full_name: user?.full_name || 'செல்வம் ராமசாமி (Selvam Ramasamy)',
    phone: user?.phone || '+91 94431 23456',
    preferred_language: user?.preferred_language || i18n.language || 'ta',
    // Step 2: Farm Info
    farm_name: 'செம்மொழி நன்செய் நிலம் (Semmozhi Farm)',
    survey_number: '142/3A',
    state: 'Tamil Nadu',
    district: user?.district || 'Thanjavur',
    taluk: 'Thiruvaiyaru',
    village: user?.village || 'Thiruvaiyaru',
    // Step 3 & 4: Location & Boundary
    latitude: 10.8845,
    longitude: 79.1065,
    polygon_points: [
      [10.8840, 79.1055],
      [10.8842, 79.1075],
      [10.8858, 79.1072],
      [10.8855, 79.1052]
    ] as [number, number][],
    // Step 5: Area
    area_value: 3.5,
    area_unit: 'acres',
    // Step 6: Crops
    current_crop: 'Paddy (நெல்)',
    previous_crop: 'Black Gram (உளுந்து)',
    // Step 7: Irrigation & Soil
    irrigation_type: 'canal',
    soil_type: 'alluvial',
    water_availability: 'medium',
    // Step 8: Farming Goals
    farming_goal: 'balanced'
  });

  const handleGpsDetect = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('Acquiring GPS fix from device sensors...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            polygon_points: [
              [lat - 0.001, lng - 0.001],
              [lat - 0.001, lng + 0.001],
              [lat + 0.001, lng + 0.001],
              [lat + 0.001, lng - 0.001]
            ]
          }));
          setGpsStatus(t('onboarding.gpsSuccess'));
        },
        (err) => {
          // If browser blocked GPS, default to Thanjavur Cauvery Delta
          setGpsStatus('GPS permission blocked. Loaded Thanjavur Cauvery Delta coordinates.');
        }
      );
    }
  };

  const handleAddMapPoint = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      polygon_points: [...prev.polygon_points, [lat, lng]]
    }));
  };

  const handleClearPoints = () => {
    setFormData((prev) => ({ ...prev, polygon_points: [] }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const geojson = {
        type: 'Polygon',
        coordinates: [
          formData.polygon_points.map(([lat, lng]) => [lng, lat])
        ]
      };

      await axios.post('/api/auth/onboarding', {
        full_name: formData.full_name,
        phone: formData.phone,
        preferred_language: formData.preferred_language,
        farm_name: formData.farm_name,
        survey_number: formData.survey_number,
        state: formData.state,
        district: formData.district,
        taluk: formData.taluk,
        village: formData.village,
        latitude: formData.latitude,
        longitude: formData.longitude,
        boundary_geojson: geojson,
        area_acres: Number(formData.area_value),
        area_unit: formData.area_unit,
        current_crop: formData.current_crop,
        previous_crop: formData.previous_crop,
        irrigation_type: formData.irrigation_type,
        soil_type: formData.soil_type,
        water_availability: formData.water_availability,
        farming_goal: formData.farming_goal
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding submit error:', err);
      // Fallback navigation if already partially created
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const districts = [
    'Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Mayiladuthurai', 'Tiruchirappalli',
    'Madurai', 'Dindigul', 'Theni', 'Coimbatore', 'Erode', 'Salem', 'Tirunelveli'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Wizard Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">{t('onboarding.title')}</h1>
              <p className="text-xs text-slate-400">
                {t('onboarding.step')} {step} {t('onboarding.of')}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            {Math.round((step / 8) * 100)}% Complete
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full my-6 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        {/* Dynamic Step Content */}
        <div className="min-h-[340px]">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <span>1.</span> {t('onboarding.step1Title')}
              </h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('auth.fullName')} *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('auth.mobileNumber')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('auth.preferredLanguage')}</label>
                <select
                  value={formData.preferred_language}
                  onChange={(e) => {
                    setFormData({ ...formData, preferred_language: e.target.value });
                    i18n.changeLanguage(e.target.value);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ta">தமிழ் (Tamil - முன்னிருப்பு)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Farm Identification */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <span>2.</span> {t('onboarding.step2Title')}
              </h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('onboarding.farmName')} *</label>
                <input
                  type="text"
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('onboarding.surveyNo')}</label>
                  <input
                    type="text"
                    value={formData.survey_number}
                    onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                    placeholder="142/3A"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('auth.district')} *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('auth.taluk')}</label>
                  <input
                    type="text"
                    value={formData.taluk}
                    onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('auth.village')} *</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <span>3.</span> {t('onboarding.step3Title')}
              </h2>
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-300">GPS Coordinates</p>
                  <p className="text-xs text-slate-400">Lat: {formData.latitude}, Lng: {formData.longitude}</p>
                </div>
                <button
                  type="button"
                  onClick={handleGpsDetect}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {t('onboarding.detectGps')}
                </button>
              </div>
              {gpsStatus && (
                <p className="text-xs text-emerald-400 bg-emerald-900/30 p-2 rounded-lg border border-emerald-500/20">
                  {gpsStatus}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Farmland Boundary Polygon Drawing */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                  <span>4.</span> {t('onboarding.step4Title')}
                </h2>
                <button
                  type="button"
                  onClick={handleClearPoints}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear Points / மீட்டமை
                </button>
              </div>
              <p className="text-xs text-slate-400">{t('onboarding.drawBoundaryHint')}</p>
              <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-700 relative">
                <MapContainer
                  center={[formData.latitude, formData.longitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <BoundaryMapPicker
                    position={[formData.latitude, formData.longitude]}
                    polygonCoords={formData.polygon_points}
                    onAddPoint={handleAddMapPoint}
                  />
                </MapContainer>
              </div>
              <p className="text-[11px] text-slate-400">
                Current Vertices: {formData.polygon_points.length} points plotted
              </p>
            </div>
          )}

          {/* STEP 5: Land Area & Units */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <span>5.</span> {t('onboarding.step5Title')}
              </h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('onboarding.areaValue')} *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.area_value}
                  onChange={(e) => setFormData({ ...formData, area_value: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Land Measurement Unit</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'acres', label: t('onboarding.unitAcres') },
                    { id: 'cents', label: t('onboarding.unitCents') },
                    { id: 'hectares', label: t('onboarding.unitHectares') },
                    { id: 'kuzhi', label: t('onboarding.unitKuzhi') }
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, area_unit: u.id })}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                        formData.area_unit === u.id
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300">
                Standard Metric Equivalent: ~{(formData.area_value * (formData.area_unit === 'hectares' ? 2.47 : 1)).toFixed(2)} Acres (~{(formData.area_value * 0.404).toFixed(2)} Hectares)
              </div>
            </div>
          )}

          {/* STEP 6: Crops */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <span>6.</span> {t('onboarding.step6Title')}
              </h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('onboarding.currentCrop')} *</label>
                <select
                  value={formData.current_crop}
                  onChange={(e) => setFormData({ ...formData, current_crop: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Paddy (நெல்)">Paddy / நெல் (சம்பா / குறுவை)</option>
                  <option value="Maize (மக்காச்சோளம்)">Maize / மக்காச்சோளம்</option>
                  <option value="Cotton (பருத்தி)">Cotton / பருத்தி</option>
                  <option value="Groundnut (நிலக்கடலை)">Groundnut / நிலக்கடலை</option>
                  <option value="Black Gram (உளுந்து)">Black Gram / உளுந்து</option>
                  <option value="Finger Millet / Ragi (கேழ்வரகு)">Finger Millet / கேழ்வரகு</option>
                  <option value="Sugarcane (கரும்பு)">Sugarcane / கரும்பு</option>
                  <option value="Sesame (எள்)">Sesame / எள்</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('onboarding.previousCrop')}</label>
                <select
                  value={formData.previous_crop}
                  onChange={(e) => setFormData({ ...formData, previous_crop: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Paddy (நெல்)">Paddy / நெல்</option>
                  <option value="Black Gram (உளுந்து)">Black Gram / உளுந்து</option>
                  <option value="Green Gram (பாசிப்பயறு)">Green Gram / பாசிப்பயறு</option>
                  <option value="Groundnut (நிலக்கடலை)">Groundnut / நிலக்கடலை</option>
                  <option value="Fallow (தரிசு)">Fallow / தரிசு நிலம்</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 7: Irrigation & Soil */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <span>7.</span> {t('onboarding.step7Title')}
              </h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('onboarding.irrigationMethod')} *</label>
                <select
                  value={formData.irrigation_type}
                  onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="canal">Canal Irrigation / ஆற்று வாய்க்கால் பாசனம்</option>
                  <option value="borewell">Borewell / ஆழ்துளை கிணறு</option>
                  <option value="open_well">Open Well / திறந்தவெளி கிணறு</option>
                  <option value="drip">Drip Irrigation / சொட்டுநீர்ப் பாசனம்</option>
                  <option value="sprinkler">Sprinkler / தெளிப்புநீர்ப் பாசனம்</option>
                  <option value="rainfed">Rainfed / மானாவாரி (மழைமட்டும்)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('onboarding.soilCategory')} *</label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="alluvial">Alluvial / வண்டல் மண்</option>
                    <option value="red_loam">Red Loam / செம்மண்</option>
                    <option value="black_cotton">Black Cotton / கரிசல் மண்</option>
                    <option value="clay_loam">Clay Loam / களிமண்</option>
                    <option value="sandy_loam">Sandy Loam / மணல் பாங்கான மண்</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Water Availability</label>
                  <select
                    value={formData.water_availability}
                    onChange={(e) => setFormData({ ...formData, water_availability: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="high">High (Adequate water throughout season)</option>
                    <option value="medium">Medium (Moderate supply)</option>
                    <option value="scarce">Scarce (Severe water constraint)</option>
                    <option value="seasonal">Seasonal (Monsoon dependent)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Farming Goals */}
          {step === 8 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <span>8.</span> {t('onboarding.step8Title')}
              </h2>
              <p className="text-xs text-slate-400">
                Select your primary farming objective to calibrate NASA decision models.
              </p>
              <div className="space-y-2.5">
                {[
                  { id: 'balanced', title: t('onboarding.goalBalanced'), desc: 'Equal weightage to profit, soil enrichment and water conservation' },
                  { id: 'save_water', title: t('onboarding.goalSaveWater'), desc: 'Prioritize low-water crops (millets, pulses) and drip schedules' },
                  { id: 'improve_soil', title: t('onboarding.goalImproveSoil'), desc: 'Maximize soil organic carbon and bio-nitrogen fixation' },
                  { id: 'reduce_risk', title: t('onboarding.goalReduceRisk'), desc: 'Drought-hardy varieties to avoid climate loss' },
                  { id: 'maximize_profit', title: t('onboarding.goalMaxProfit'), desc: 'Highest gross market revenue crops based on seasonal pricing' }
                ].map((g) => (
                  <label
                    key={g.id}
                    onClick={() => setFormData({ ...formData, farming_goal: g.id })}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.farming_goal === g.id
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formData.farming_goal === g.id ? 'border-emerald-400 bg-emerald-500' : 'border-slate-500'
                        }`}
                      >
                        {formData.farming_goal === g.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{g.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{g.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('onboarding.prev')}
            </button>
          ) : <div />}

          {step < 8 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all ml-auto"
            >
              {t('onboarding.next')}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition-all ml-auto disabled:opacity-50"
            >
              {submitting ? 'Setting up Farm...' : t('onboarding.completeButton')}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

