import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { ScenarioSimulation } from '../../types';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { Sliders, Play, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

export const ScenarioSimulationPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [rainfallChange, setRainfallChange] = useState<number>(-20);
  const [tempChange, setTempChange] = useState<number>(1.5);
  const [irrigation, setIrrigation] = useState<string>('restricted');
  const [simulation, setSimulation] = useState<ScenarioSimulation | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunSimulation = async () => {
    if (!selectedFarmland) return;
    try {
      setIsRunning(true);
      const res = await api.runSimulation({
        farmland_id: selectedFarmland.id,
        simulation_name: isTamil
          ? `மழைப்பொழிவு ${rainfallChange}% & வெப்பநிலை +${tempChange}°C மாதிரி சோதனை`
          : `Rainfall ${rainfallChange}% & Temp +${tempChange}°C Scenario`,
        rainfall_change_pct: rainfallChange,
        temp_change_c: tempChange,
        irrigation_constraint: irrigation,
      });
      setSimulation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
            {isTamil ? 'காலநிலை மாதிரி சோதனை (What-If Agroclimatic Simulator)' : 'What-If Agroclimatic Scenario Simulator'}
          </h1>
          <NasaProvenanceBadge category={4} sourceText="Hypothetical Stress Test" />
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
          {isTamil
            ? 'வறட்சி, மழைப்பற்றாக்குறை அல்லது வெப்ப அலை சூழலில் பயிர்களின் தாங்குதிறனை முன்கூட்டியே சோதிக்கவும்.'
            : 'Pre-test crop vulnerability and resilience under drought, heat waves, and water-deficit scenarios.'}
        </p>
      </div>

      {/* Control Sliders Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-800 text-sm font-tamil flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-600" />
          <span>{isTamil ? 'சுற்றுச்சூழல் மாறுதல் காரணிகள் (Scenario Parameters):' : 'Scenario Control Parameters:'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rainfall Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold font-tamil">
              <span className="text-slate-600">{isTamil ? 'மழைப்பொழிவு மாறுதல்:' : 'Rainfall Adjustment:'}</span>
              <span className={`font-bold ${rainfallChange < 0 ? 'text-rose-600' : 'text-blue-600'}`}>
                {rainfallChange > 0 ? `+${rainfallChange}` : rainfallChange}%
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="5"
              value={rainfallChange}
              onChange={(e) => setRainfallChange(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-tamil">
              <span>{isTamil ? '-40% (கடும் வறட்சி)' : '-40% (Severe Drought)'}</span>
              <span>{isTamil ? 'இயல்பு (0%)' : 'Normal (0%)'}</span>
              <span>{isTamil ? '+40% (அதிக மழை)' : '+40% (Deluge)'}</span>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold font-tamil">
              <span className="text-slate-600">{isTamil ? 'வெப்பநிலை உயர்வு:' : 'Temperature Rise:'}</span>
              <span className="font-bold text-amber-600">+{tempChange}°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="4.0"
              step="0.5"
              value={tempChange}
              onChange={(e) => setTempChange(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-tamil">
              <span>{isTamil ? '0°C (தற்போதைய நிலை)' : '0°C (Current Baseline)'}</span>
              <span>+2°C</span>
              <span>{isTamil ? '+4°C (கடும் வெப்ப அலை)' : '+4°C (Severe Heatwave)'}</span>
            </div>
          </div>

          {/* Irrigation Constraint */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 block font-tamil">
              {isTamil ? 'பாசன நீர் இருப்பு நிலை:' : 'Irrigation Water Availability:'}
            </label>
            <select
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer font-tamil"
            >
              <option value="normal">{isTamil ? 'இயல்பான பாசன இருப்பு (Normal)' : 'Normal Unrestricted Irrigation'}</option>
              <option value="restricted">{isTamil ? 'கட்டுப்படுத்தப்பட்ட பாசனம் (Restricted - 1 முறை/வாரம்)' : 'Restricted Deficit Irrigation (Once/Week)'}</option>
              <option value="critical">{isTamil ? 'கடும் பற்றாக்குறை (Critical - வானம் பார்த்த பூமி)' : 'Critical / Rainfed Only'}</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow transition cursor-pointer font-tamil"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isRunning ? (isTamil ? 'சோதனை கணக்கிடப்படுகிறது...' : 'Simulating Scenario...') : (isTamil ? 'மாதிரி சோதனை இயக்கு (Run Simulation)' : 'Run Scenario Simulation')}</span>
        </button>
      </div>

      {/* Simulation Results */}
      {simulation && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block font-tamil">
              {isTamil ? 'சோதனை முடிவு அறிக்கை (Simulation Evaluation)' : 'Simulation Evaluation Results'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-tamil mt-0.5">
              {isTamil ? 'பயிர்களின் தாங்குதிறன் மதிப்பீடு (Crop Resilience Impact)' : 'Crop Resilience & Suitability Impact'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulation.simulated_impact.crops_evaluation.map((crop, idx) => {
              const cropName = isTamil ? (crop.crop_name_ta || crop.crop_name_en) : (crop.crop_name_en || crop.crop_name_ta);
              return (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 font-tamil">{cropName}</span>
                    <span className={`text-xs font-bold ${crop.score_delta < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {crop.score_delta > 0 ? `+${crop.score_delta}` : crop.score_delta}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-tamil">
                    <span>{isTamil ? 'முந்தைய மதிப்பு:' : 'Baseline:'} {crop.baseline_suitability_score}%</span>
                    <span>{isTamil ? 'சோதனை மதிப்பு:' : 'Simulated:'} <strong className="text-slate-800">{crop.simulated_suitability_score}%</strong></span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 text-[11px] font-semibold text-purple-900 font-tamil">
                    {isTamil ? 'முடிவு:' : 'Verdict:'} {crop.resilience_verdict}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Adaptation Recommendations */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
            <h4 className="font-bold text-purple-950 text-xs uppercase tracking-wider font-tamil">
              {isTamil ? 'பரிந்துரைக்கப்பட்ட காலநிலை தணிப்பு நடவடிக்கைகள் (Adaptations):' : 'Recommended Adaptation Strategies:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {simulation.recommended_adaptations.map((a, i) => (
                <div key={i} className="bg-white/80 p-3 rounded-lg border border-purple-100 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block font-tamil">{a.measure}</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed font-tamil">{a.benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            {simulation.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};

