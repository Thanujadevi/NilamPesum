import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFarmland } from '../../contexts/FarmlandContext';
import { SimulationControlBar } from '../../components/simulations/SimulationControlBar';
import { EducationalNarrator } from '../../components/simulations/EducationalNarrator';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { CloudRain, Sun, ShieldAlert, CheckCircle2, Waves, HeartPulse } from 'lucide-react';

export const FloodDroughtSimulator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();

  // Mode: Flood or Drought
  const [eventType, setEventType] = useState<'flood' | 'drought'>('flood');
  const [severity, setSeverity] = useState<'moderate' | 'high' | 'catastrophic'>('high');
  const [interventions, setInterventions] = useState<string[]>(['drainage_trenches']);

  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [scenarioTitle, setScenarioTitle] = useState('Monsoon Flood Defense & Drainage Simulation');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Simulation Results
  const [simResults, setSimResults] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchSimulation = async () => {
    if (!selectedFarmland) return;
    try {
      const res = await axios.post('/api/simulations/world/run/extreme-weather', {
        farmland_id: selectedFarmland.id,
        event_type: eventType,
        severity: severity,
        interventions: interventions
      });
      setSimResults(res.data);
    } catch (e) {
      console.error('Extreme weather sim error:', e);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [selectedFarmland, eventType, severity, interventions]);

  // Toggle interventions
  const toggleIntervention = (item: string) => {
    if (interventions.includes(item)) {
      setInterventions(interventions.filter((i) => i !== item));
    } else {
      setInterventions([...interventions, item]);
    }
  };

  // Canvas Animation
  useEffect(() => {
    let animId: number;
    let rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
    let floodWave = 0;

    for (let i = 0; i < 60; i++) {
      rainDrops.push({
        x: Math.random() * 800,
        y: Math.random() * 380,
        speed: 6 + Math.random() * 8,
        len: 12 + Math.random() * 15
      });
    }

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      floodWave += 0.05 * speed;

      const groundY = height * 0.55;

      if (eventType === 'flood') {
        // --- FLOOD MODE ---
        // 1. Dark stormy overcast sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.5, '#0f172a');
        skyGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, groundY);

        // Dark storm clouds
        ctx.fillStyle = '#1e293b';
        for (const cx of [150, 400, 650]) {
          ctx.beginPath();
          ctx.arc(cx, 40, 55, 0, Math.PI * 2);
          ctx.arc(cx + 40, 40, 65, 0, Math.PI * 2);
          ctx.arc(cx - 40, 40, 45, 0, Math.PI * 2);
          ctx.fill();
        }

        // Heavy torrential rain
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
        ctx.lineWidth = 1.8;
        for (const drop of rainDrops) {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 3, drop.y + drop.len);
          ctx.stroke();

          drop.y += drop.speed;
          if (drop.y > groundY + 30) {
            drop.y = 0;
            drop.x = Math.random() * width;
          }
        }

        // Soil layer
        ctx.fillStyle = '#221206';
        ctx.fillRect(0, groundY, width, height - groundY);

        // Raised Beds intervention (elevates crop mound)
        const hasRaisedBeds = interventions.includes('raised_beds');
        const moundHeight = hasRaisedBeds ? 24 : 0;

        // Crops standing in water
        const plantPositions = [140, 270, 400, 530, 660];
        for (const px of plantPositions) {
          if (hasRaisedBeds) {
            // Draw raised mound
            ctx.fillStyle = '#3f1f0e';
            ctx.beginPath();
            ctx.ellipse(px, groundY, 40, 16, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Stalk
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(px, groundY - moundHeight);
          ctx.lineTo(px, groundY - moundHeight - 60);
          ctx.stroke();

          // Leaves
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.ellipse(px - 14, groundY - moundHeight - 50, 18, 8, -0.4, 0, Math.PI * 2);
          ctx.ellipse(px + 14, groundY - moundHeight - 50, 18, 8, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Water Ponding Level (mitigated if drainage trenches active)
        const pondingDepth = simResults ? simResults.ponding_depth_cm : 25;
        const waterHeight = Math.min(80, pondingDepth * 2.2);

        // Water sheet
        const waterGrad = ctx.createLinearGradient(0, groundY - waterHeight, 0, groundY);
        waterGrad.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
        waterGrad.addColorStop(1, 'rgba(14, 116, 144, 0.85)');
        ctx.fillStyle = waterGrad;

        ctx.beginPath();
        ctx.moveTo(0, groundY - waterHeight + Math.sin(floodWave) * 3);
        for (let x = 0; x <= width; x += 40) {
          ctx.lineTo(x, groundY - waterHeight + Math.sin(floodWave + x * 0.05) * 4);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Drainage trench intervention indicator
        if (interventions.includes('drainage_trenches')) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(width - 80, groundY - 10);
          ctx.lineTo(width - 20, groundY + 45);
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('Active Drainage Trench (-15cm)', width - 210, groundY + 40);
        }
      } else {
        // --- DROUGHT MODE ---
        // Scorching yellow haze sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
        skyGrad.addColorStop(0, '#9a3412');
        skyGrad.addColorStop(0.6, '#c2410c');
        skyGrad.addColorStop(1, '#eab308');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, groundY);

        // Blazing Sun Glare
        const sunX = width * 0.8;
        const sunY = height * 0.22;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 80);
        sunGlow.addColorStop(0, '#fef08a');
        sunGlow.addColorStop(0.5, 'rgba(251, 146, 60, 0.6)');
        sunGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
        ctx.fill();

        // Parched dried ground
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, groundY, width, height - groundY);

        // Soil Cracks (fewer if mulching active)
        const hasMulch = interventions.includes('mulching');
        const crackDepth = simResults ? simResults.soil_crack_depth_cm : 12;

        if (!hasMulch) {
          ctx.strokeStyle = '#291307';
          ctx.lineWidth = 2.5;
          for (let i = 0; i < 8; i++) {
            const cx = 80 + i * 85;
            ctx.beginPath();
            ctx.moveTo(cx, groundY);
            ctx.lineTo(cx + 20, groundY + 30);
            ctx.lineTo(cx + 35, groundY + 15);
            ctx.stroke();
          }
        } else {
          // Straw mulch protective layer
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(0, groundY - 6, width, 8);
          ctx.fillStyle = '#fef08a';
          ctx.font = '10px sans-serif';
          ctx.fillText('Protective Straw Mulch (Reduced Soil Evaporation)', 20, groundY - 12);
        }

        // Wilted droopy crops (unless drip relief active)
        const hasDripRelief = interventions.includes('drip_relief');
        const plantPositions = [140, 270, 400, 530, 660];

        for (const px of plantPositions) {
          const droop = hasDripRelief ? 5 : 24;
          const stalkColor = hasDripRelief ? '#84cc16' : '#b45309';

          ctx.strokeStyle = stalkColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px, groundY);
          ctx.quadraticCurveTo(px + droop, groundY - 30, px + droop * 1.5, groundY - 50);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [eventType, severity, interventions, speed, simResults]);

  const handleSaveScenario = async () => {
    if (!selectedFarmland || !simResults) return;
    try {
      await axios.post('/api/simulations/world/scenarios/save', {
        farmland_id: selectedFarmland.id,
        title: scenarioTitle,
        simulation_type: 'flood_drought',
        input_parameters: { event_type: eventType, severity, interventions },
        baseline_data: { event: eventType },
        calculated_results: simResults,
        educational_notes: `Crop survival: ${simResults.crop_survival_pct}%. Recovery timeline: ${simResults.recovery_days} days.`
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setSaveModalOpen(false);
      }, 1500);
    } catch (e) {
      console.error('Save extreme weather scenario error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('simWorld.card4Title')}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{t('simWorld.card4Desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NasaProvenanceBadge category={4} sourceText="NASA GPM Precipitation + SMAP Hydrology" />
        </div>
      </div>

      {/* Main Interactive Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas & Timeline Controls (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <canvas
              ref={canvasRef}
              width={800}
              height={380}
              className="w-full h-[320px] md:h-[380px] block"
            />

            {/* Event Mode Banner */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3.5 py-1.5 bg-black/70 backdrop-blur-md rounded-xl text-xs font-mono text-white border border-white/10 uppercase flex items-center gap-2">
                {eventType === 'flood' ? <CloudRain className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                {isTa
                  ? `${eventType === 'flood' ? 'வெள்ள பாதிப்பு மாதிரி (Flood)' : 'வறட்சி மாதிரி (Drought)'} (${severity === 'high' ? 'தீவிரம்' : severity === 'moderate' ? 'மிதமானது' : 'பேரழிவு'})`
                  : `${eventType} Scenario (${severity})`}
              </span>
            </div>

            {/* Survival Probability Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3.5 py-1.5 bg-emerald-950/80 backdrop-blur-md rounded-xl text-xs font-mono text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                {isTa ? 'பயிர் பிழைப்புத் திறன்:' : 'Survival Probability:'} <strong>{simResults?.crop_survival_pct}%</strong>
              </span>
            </div>
          </div>

          <SimulationControlBar
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => {
              setIsPlaying(true);
              setCurrentStep(1);
            }}
            speed={speed}
            onSpeedChange={setSpeed}
            currentStep={currentStep}
            maxSteps={15}
            onStepChange={setCurrentStep}
            onSaveScenario={() => setSaveModalOpen(true)}
            stepLabelPrefix={isTa ? 'மணி' : 'Hour'}
          />

          {/* Test Protective Interventions Checklist */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {eventType === 'flood'
                ? (isTa ? '🛡️ வெள்ளத் தற்காப்பு நடவடிக்கைகள் (Flood Defense)' : '🛡️ Flood Defense Interventions')
                : (isTa ? '🛡️ வறட்சித் தற்காப்பு நடவடிக்கைகள் (Drought Defense)' : '🛡️ Drought Defense Interventions')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eventType === 'flood' ? (
                <>
                  <button
                    onClick={() => toggleIntervention('drainage_trenches')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                      interventions.includes('drainage_trenches')
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <strong className="block">
                        {isTa ? 'சுற்றளவு வடிகால் வாய்க்கால்கள் (Drainage Trenches)' : 'Perimeter Drainage Trenches'}
                      </strong>
                      <span className="text-[11px] text-cyan-400">
                        {isTa ? '+30% பயிர் பிழைப்பு, -15cm நீர் வெளியேற்றம்' : '+30% Crop Survival, -15cm Ponding'}
                      </span>
                    </div>
                    {interventions.includes('drainage_trenches') && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => toggleIntervention('raised_beds')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                      interventions.includes('raised_beds')
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <strong className="block">
                        {isTa ? 'மேட்டுப்பாத்தி & பார் அமைப்பு (Raised Beds)' : 'Broad Bed & Furrow (Raised Beds)'}
                      </strong>
                      <span className="text-[11px] text-cyan-400">
                        {isTa ? '+20% பயிர் பிழைப்பு, வேர்மண்டலப் பாதுகாப்பு' : '+20% Crop Survival, Elevates Root Zone'}
                      </span>
                    </div>
                    {interventions.includes('raised_beds') && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleIntervention('mulching')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                      interventions.includes('mulching')
                        ? 'bg-amber-950/60 border-amber-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <strong className="block">
                        {isTa ? 'வைக்கோல் நிலப்போர்வை (Straw Mulching)' : 'Organic Straw Mulching (நிலப்போர்வை)'}
                      </strong>
                      <span className="text-[11px] text-amber-400">
                        {isTa ? '+25% பயிர் பிழைப்பு, மண் வெடிப்பு தடுப்பு' : '+25% Crop Survival, Prevents Cracking'}
                      </span>
                    </div>
                    {interventions.includes('mulching') && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => toggleIntervention('drip_relief')}
                    className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                      interventions.includes('drip_relief')
                        ? 'bg-amber-950/60 border-amber-500 text-white'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <strong className="block">
                        {isTa ? 'அவசரகால சொட்டுநீர் (Sub-Surface Drip)' : 'Emergency Sub-Surface Drip'}
                      </strong>
                      <span className="text-[11px] text-amber-400">
                        {isTa ? '+35% பயிர் பிழைப்பு, விரைவு நீர் மீட்பு' : '+35% Crop Survival, Restores Turgor'}
                      </span>
                    </div>
                    {interventions.includes('drip_relief') && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mode Selector & Impact Metrics (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Waves className="w-4 h-4 text-rose-400" />
              {isTa ? 'வானிலை நிகழ்வு கட்டமைப்பு' : 'Event Configuration'}
            </h3>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setEventType('flood');
                  setInterventions(['drainage_trenches']);
                  setScenarioTitle('Monsoon Flood Defense Simulation');
                }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  eventType === 'flood'
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <CloudRain className="w-4 h-4" /> {isTa ? 'கடும் வெள்ளம் (Flood)' : 'Extreme Flood'}
              </button>
              <button
                onClick={() => {
                  setEventType('drought');
                  setInterventions(['mulching']);
                  setScenarioTitle('Severe Summer Drought Defense Simulation');
                }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  eventType === 'drought'
                    ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Sun className="w-4 h-4" /> {isTa ? 'கடும் வறட்சி (Drought)' : 'Severe Drought'}
              </button>
            </div>

            {/* Severity Selector */}
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">
                {isTa ? 'தீவிர நிலை (Intensity Level)' : 'Intensity Level'}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['moderate', 'high', 'catastrophic'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded-xl capitalize font-mono text-[11px] transition-all border ${
                      severity === lvl
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {isTa ? (lvl === 'moderate' ? 'மிதமானது' : lvl === 'high' ? 'அதிகம்' : 'பேரழிவு') : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Physiological Damage & Recovery Card */}
          {simResults && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                {isTa ? 'பயிர் உடல்நல நிலை (Physiological Status)' : 'Physiological Status'}
              </h3>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{isTa ? 'பிழைப்புத் திறன்' : 'Survival Probability'}</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                    {simResults.crop_survival_pct}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{isTa ? 'மீட்புக் காலம்' : 'Recovery Timeline'}</p>
                  <span className="text-sm font-bold text-slate-200 font-mono">
                    ~{simResults.recovery_days} {isTa ? 'நாட்கள்' : 'Days'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs">
                <p className="text-slate-400">{isTa ? 'அழுத்தக் குறியீடு (Stress Indicator):' : 'Stress Indicator:'}</p>
                <p className="text-slate-200 font-semibold mt-1">
                  {eventType === 'flood'
                    ? (isTa ? `தேங்கிய நீர்: ${simResults.ponding_depth_cm} செ.மீ | ${simResults.root_zone_aeration_status}` : `Ponding: ${simResults.ponding_depth_cm} cm | ${simResults.root_zone_aeration_status}`)
                    : (isTa ? `மண் வெடிப்பு ஆழம்: ${simResults.soil_crack_depth_cm} செ.மீ | இலை ஈரப்பதம்: ${simResults.leaf_relative_water_content_pct}%` : `Crack Depth: ${simResults.soil_crack_depth_cm} cm | Leaf Water: ${simResults.leaf_relative_water_content_pct}%`)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational Voice Narrator */}
      {simResults && (
        <EducationalNarrator
          titleEn={eventType === 'flood' ? 'Monsoon Inundation & Submergence Protection' : 'Terminal Drought & Soil Desiccation Protection'}
          titleTa={eventType === 'flood' ? 'பருவமழை வெள்ளம் மற்றும் பயிர் நீரில் மூழ்குதல் தடுப்பு' : 'கடுமையான வறட்சி மற்றும் மண் வெடிப்பு பாதுகாப்பு'}
          explanationEn={
            eventType === 'flood'
              ? `Under heavy deluge conditions, water ponding exceeding 15 cm leads to root asphyxiation within 36 hours. Implementing drainage trenches mitigates ponding to ${simResults.ponding_depth_cm} cm, preserving ${simResults.crop_survival_pct}% crop survival.`
              : `Extended high-temperature dry spells cause extensive soil fissure cracking down to ${simResults.soil_crack_depth_cm} cm. Straw mulching acts as an insulative vapor barrier, raising leaf water retention and plant survival to ${simResults.crop_survival_pct}%.`
          }
          explanationTa={
            eventType === 'flood'
              ? `தீவிர மழை வெள்ளத்தில் 15 செ.மீ மேலான நீர் தேக்கம் 36 மணி நேரத்திற்குள் வேர் அழுகல் மற்றும் சுவாசமின்மையை ஏற்படுத்துகிறது. வடிகால் வாய்க்கால்களை அமைப்பதால் நீர் தேக்கம் ${simResults.ponding_depth_cm} செ.மீ ஆகக் குறைக்கப்பட்டு ${simResults.crop_survival_pct}% பயிர்கள் காப்பாற்றப்படுகின்றன.`
              : `நீண்ட வறட்சியால் மண் ${simResults.soil_crack_depth_cm} செ.மீ வரை வெடித்து வேர்கள் உடைகின்றன. வைக்கோல் நிலப்போர்வை அமைப்பதால் நீர் ஆவியாதல் தடுக்கப்பட்டு பயிர் உயிர்வாழ்வு ${simResults.crop_survival_pct}% வரை உயர்கிறது.`
          }
          mitigationEn={eventType === 'flood' ? 'Construct 30cm deep boundary drainage channels connected to farm pond.' : 'Apply 5 cm thick paddy straw mulch around plant root zones.'}
          mitigationTa={eventType === 'flood' ? 'பண்ணைக் குட்டையை நோக்கி 30 செ.மீ ஆழமுள்ள வடிகால் வாய்க்கால்களை வெட்டவும்.' : 'பயிர் தூர்களுக்கு அருகே 5 செ.மீ தடிமனுக்கு வைக்கோல் போர்வை இடவும்.'}
        />
      )}

      {/* Save Scenario Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">{t('controls.saveScenario')}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Save this extreme weather defense scenario to compare emergency preparedness.
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
