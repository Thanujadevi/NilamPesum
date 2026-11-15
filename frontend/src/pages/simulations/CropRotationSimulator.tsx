import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFarmland } from '../../contexts/FarmlandContext';
import { SimulationControlBar } from '../../components/simulations/SimulationControlBar';
import { EducationalNarrator } from '../../components/simulations/EducationalNarrator';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { RefreshCw, Sprout, Droplets, TrendingUp, ShieldCheck, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export const CropRotationSimulator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();

  // Multi-season sequence
  const [cropSequence, setCropSequence] = useState<string[]>([
    'Paddy (நெல்)',
    'Black Gram (உளுந்து)',
    'Sesame (எள்)',
    'Groundnut (நிலக்கடலை)'
  ]);

  const availableCrops = [
    'Paddy (நெல்)',
    'Maize (மக்காச்சோளம்)',
    'Groundnut (நிலக்கடலை)',
    'Cotton (பருத்தி)',
    'Black Gram (உளுந்து)',
    'Finger Millet (கேழ்வரகு)',
    'Sesame (எள்)'
  ];

  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [scenarioTitle, setScenarioTitle] = useState('Paddy-Pulse-Oilseed Rotation Cycle');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Simulation Results
  const [simResults, setSimResults] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchSimulation = async () => {
    if (!selectedFarmland) return;
    try {
      const res = await axios.post('/api/simulations/world/run/crop-rotation', {
        farmland_id: selectedFarmland.id,
        crop_sequence: cropSequence,
        soil_initial_oc: 0.55
      });
      setSimResults(res.data);
    } catch (e) {
      console.error('Rotation sim error:', e);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [selectedFarmland, cropSequence]);

  // Animation Loop for Multi-Season Crop Sequence
  useEffect(() => {
    let animId: number;
    let angle = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      angle += 0.04 * speed;

      const groundY = height * 0.58;
      const numSeasons = cropSequence.length;
      const seasonWidth = width / numSeasons;

      // 1. Sky & Atmosphere
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#0c4a6e');
      skyGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, groundY);

      // 2. Soil Layer (Organic Carbon Richness visual gradient)
      const ocValue = simResults ? simResults.final_organic_carbon_pct : 0.6;
      const soilGrad = ctx.createLinearGradient(0, groundY, 0, height);
      // Darker rich organic soil if legume present
      if (ocValue > 0.8) {
        soilGrad.addColorStop(0, '#2d1808'); // Very rich dark humus
        soilGrad.addColorStop(1, '#1a0e05');
      } else {
        soilGrad.addColorStop(0, '#573016'); // Depleted brown
        soilGrad.addColorStop(1, '#2e190b');
      }
      ctx.fillStyle = soilGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

      // 3. Render Each Season's Plot & Crop Growth
      for (let i = 0; i < numSeasons; i++) {
        const crop = cropSequence[i];
        const isCurrent = i + 1 === activeSeason;
        const startX = i * seasonWidth;
        const centerX = startX + seasonWidth / 2;

        // Season Plot Separator
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, height);
        ctx.stroke();

        // Highlight active season column
        if (isCurrent) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.fillRect(startX, 0, seasonWidth, height);
        }

        // Season Header Label
        ctx.fillStyle = isCurrent ? '#34d399' : '#94a3b8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`Season ${i + 1}`, startX + 12, 25);
        ctx.font = '11px sans-serif';
        ctx.fillText(crop.split(' ')[0], startX + 12, 42);

        // Crop Drawing
        const isLegume = crop.includes('Gram') || crop.includes('Groundnut');
        const plantHeight = isLegume ? 55 : (crop.includes('Maize') ? 85 : 70);

        // Stem & Foliage
        ctx.strokeStyle = isCurrent ? '#22c55e' : '#16a34a';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.lineTo(centerX, groundY - plantHeight);
        ctx.stroke();

        // Canopy leaves
        ctx.fillStyle = isCurrent ? '#10b981' : '#059669';
        ctx.beginPath();
        ctx.arc(centerX - 15, groundY - plantHeight * 0.7, 12, 0, Math.PI * 2);
        ctx.arc(centerX + 15, groundY - plantHeight * 0.7, 12, 0, Math.PI * 2);
        ctx.arc(centerX, groundY - plantHeight, 15, 0, Math.PI * 2);
        ctx.fill();

        // Root System
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.lineTo(centerX, groundY + 45);
        ctx.lineTo(centerX - 20, groundY + 70);
        ctx.moveTo(centerX, groundY + 45);
        ctx.lineTo(centerX + 20, groundY + 70);
        ctx.stroke();

        // Nitrogen Fixing Nodules for Legume crops (+N bubbles)
        if (isLegume) {
          ctx.fillStyle = '#38bdf8';
          for (let n = 0; n < 4; n++) {
            const noduleX = centerX - 12 + (n % 2) * 24;
            const noduleY = groundY + 25 + n * 12;
            ctx.beginPath();
            ctx.arc(noduleX, noduleY, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Floating +N bio-fixation indicator
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('+38 kg N/ha', centerX - 32, groundY + 65);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [cropSequence, activeSeason, speed, simResults]);

  // Stepper for seasons
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveSeason((prev) => {
          if (prev >= cropSequence.length) {
            setIsPlaying(false);
            return 1;
          }
          return prev + 1;
        });
      }, 1500 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, cropSequence.length]);

  const handleAddCrop = (cropName: string) => {
    if (cropSequence.length < 5) {
      setCropSequence([...cropSequence, cropName]);
    }
  };

  const handleRemoveCrop = (index: number) => {
    if (cropSequence.length > 2) {
      setCropSequence(cropSequence.filter((_, i) => i !== index));
    }
  };

  const handleSaveScenario = async () => {
    if (!selectedFarmland || !simResults) return;
    try {
      await axios.post('/api/simulations/world/scenarios/save', {
        farmland_id: selectedFarmland.id,
        title: scenarioTitle,
        simulation_type: 'crop_rotation',
        input_parameters: { crop_sequence: cropSequence },
        baseline_data: { monoculture_depletion_kg_ha: -85 },
        calculated_results: simResults,
        educational_notes: `Sustainability score: ${simResults.sustainability_score}/100. Net N balance: ${simResults.net_nitrogen_balance_kg_ha} kg/ha.`
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setSaveModalOpen(false);
      }, 1500);
    } catch (e) {
      console.error('Save rotation scenario error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('simWorld.card3Title')}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{t('simWorld.card3Desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NasaProvenanceBadge category={3} sourceText="TNAU Crop Rotation Matrix + NASA MODIS Phenology" />
        </div>
      </div>

      {/* Main Interactive Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Multi-Season Canvas (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <canvas
              ref={canvasRef}
              width={800}
              height={380}
              className="w-full h-[320px] md:h-[380px] block"
            />

            {/* Sustainability Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3.5 py-1.5 bg-emerald-950/80 backdrop-blur-md rounded-xl text-xs font-mono text-emerald-300 border border-emerald-500/40">
                {isTa ? 'நிலைத்தன்மை குறியீடு:' : 'Sustainability Score:'} <strong>{simResults?.sustainability_score}/100</strong>
              </span>
            </div>
          </div>

          {/* Control Bar */}
          <SimulationControlBar
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => {
              setIsPlaying(false);
              setActiveSeason(1);
            }}
            speed={speed}
            onSpeedChange={setSpeed}
            currentStep={activeSeason}
            maxSteps={cropSequence.length}
            onStepChange={setActiveSeason}
            onSaveScenario={() => setSaveModalOpen(true)}
            stepLabelPrefix={isTa ? 'பருவம்' : 'Season'}
          />

          {/* Interactive Crop Sequence Editor */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isTa
                ? `தேர்ந்தெடுக்கப்பட்ட பயிர் சுழற்சி முறை (${cropSequence.length} பருவங்கள்)`
                : `Selected Multi-Season Rotation Sequence (${cropSequence.length} Seasons)`}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cropSequence.map((crop, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    idx + 1 === activeSeason
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {isTa ? `பருவம் ${idx + 1}` : `Season ${idx + 1}`}
                    </span>
                    <strong className="text-xs">{crop}</strong>
                  </div>
                  {cropSequence.length > 2 && (
                    <button
                      onClick={() => handleRemoveCrop(idx)}
                      className="p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Add Buttons */}
            {cropSequence.length < 5 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-400">{isTa ? 'பயிர் சேர்க்க:' : 'Add Crop:'}</span>
                {availableCrops.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleAddCrop(c)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/40 rounded-lg text-[11px] text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Soil Balance & Economic Cards (1 col) */}
        <div className="space-y-4">
          {simResults && (
            <>
              {/* Nitrogen & Carbon Balance Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  {isTa ? 'மண் வளம் & ஊட்டச்சத்து இயங்கியல்' : 'Soil Health & Nutrient Dynamics'}
                </h3>

                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      {isTa ? 'மண் கரிம கார்பன் (Organic Carbon)' : 'Soil Organic Carbon (கரிம கார்பன்)'}
                    </p>
                    <p className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                      {simResults.final_organic_carbon_pct}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{isTa ? 'கார்பன் குவிப்பு' : 'Carbon Accumulation'}</p>
                    <span className="text-sm font-bold text-emerald-300 font-mono">
                      +{simResults.carbon_increase_pct}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                    <p className="text-slate-400">
                      {isTa ? 'நிகர தழைச்சத்து சமநிலை (Nitrogen)' : 'Net Nitrogen Balance (தழைச்சத்து)'}
                    </p>
                    <p className="text-sm font-bold text-cyan-300 font-mono mt-1">
                      {simResults.net_nitrogen_balance_kg_ha} kg/ha
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                    <p className="text-slate-400">
                      {isTa ? 'நீர் நுகர்வு தடம் (Water Footprint)' : 'Water Footprint (நீர் நுகர்வு)'}
                    </p>
                    <p className="text-sm font-bold text-white font-mono mt-1">
                      {simResults.total_water_consumption_m3} m³
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated Profitability Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  {isTa ? 'மதிப்பிடப்பட்ட ஆண்டு பொருளாதார வருமானம்' : 'Estimated Annual Economic Return'}
                </h3>

                <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{isTa ? 'மொத்த நிகர லாபம்' : 'Cumulative Net Profit'}</p>
                    <p className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                      ₹{simResults.total_profit_inr_ha.toLocaleString()} / ha
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{isTa ? 'பூச்சி சுழற்சி முறிவு (Pest Break)' : 'Pest Break (பூச்சி முறிவு)'}</p>
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg">
                      {isTa ? 'பூச்சி வாழ்க்கை சுழற்சி தடைபடுகிறது' : 'Active Cycle Interruption'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Educational Voice Narrator */}
      {simResults && (
        <EducationalNarrator
          titleEn="Crop Rotation Science & Soil Enrichment"
          titleTa="பயிர் சுழற்சி அறிவியலும் மண் வள மேம்பாடும்"
          explanationEn={simResults.agronomic_verdict_en}
          explanationTa={simResults.agronomic_verdict_ta}
          mitigationEn="Incorporate crop residue (green manure) back into topsoil after harvest."
          mitigationTa="அறுவடைக்கு பின் பயறுவகை பயிர் தாள்களை நிலத்திலேயே மடக்கி உழுதால் மண் வளம் மேலும் கூடும்."
        />
      )}

      {/* Save Scenario Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">{t('controls.saveScenario')}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Save this rotation plan to track soil health improvement over multiple seasons.
            </p>
            <input
              type="text"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 mb-4"
            />
            {savedSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4" /> Scenario saved successfully!
              </p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveScenario}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
