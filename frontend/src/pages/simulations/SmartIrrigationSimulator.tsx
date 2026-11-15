import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFarmland } from '../../contexts/FarmlandContext';
import { SimulationControlBar } from '../../components/simulations/SimulationControlBar';
import { EducationalNarrator } from '../../components/simulations/EducationalNarrator';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { Droplets, Zap, IndianRupee, Layers, CheckCircle2, SplitSquareVertical } from 'lucide-react';

export const SmartIrrigationSimulator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();

  // Inputs
  const [method, setMethod] = useState<'drip' | 'sprinkler' | 'flood' | 'scheduled'>('drip');
  const [applicationDepth, setApplicationDepth] = useState<number>(25);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showComparison, setShowComparison] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [scenarioTitle, setScenarioTitle] = useState('Drip Irrigation vs Flood Comparison');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Simulation Results
  const [simResults, setSimResults] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchSimulation = async () => {
    if (!selectedFarmland) return;
    try {
      const res = await axios.post('/api/simulations/world/run/smart-irrigation', {
        farmland_id: selectedFarmland.id,
        method: method,
        soil_type: selectedFarmland.soil_type || 'alluvial',
        application_depth_mm: applicationDepth
      });
      setSimResults(res.data);
    } catch (e) {
      console.error('Irrigation sim run error:', e);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [selectedFarmland, method, applicationDepth]);

  // Canvas Cross-Section Animation
  useEffect(() => {
    let animId: number;
    let droplets: { x: number; y: number; speed: number; radius: number }[] = [];
    let pulseAngle = 0;

    for (let i = 0; i < 25; i++) {
      droplets.push({
        x: 100 + Math.random() * 600,
        y: 110 + Math.random() * 30,
        speed: 1.5 + Math.random() * 2.5,
        radius: 2 + Math.random() * 2
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
      pulseAngle += 0.05 * speed;

      const groundY = height * 0.35;
      const rootZoneY = height * 0.70;

      // 1. Sky & Canopy Layer
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, groundY);

      // Crop Stalks & Green Foliage Canopy
      const plantPositions = [120, 260, 400, 540, 680];
      for (const px of plantPositions) {
        // Stem
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px, groundY);
        ctx.lineTo(px, groundY - 65);
        ctx.stroke();

        // Canopy leaves
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(px - 18, groundY - 60, 24, 12, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px + 18, groundY - 60, 24, 12, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px, groundY - 78, 20, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Irrigation Hardware (Pipes / Drippers / Sprinklers / Flood Sheet)
      if (method === 'drip' || method === 'scheduled') {
        // Drip lateral pipe resting on soil surface
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(40, groundY - 4);
        ctx.lineTo(width - 40, groundY - 4);
        ctx.stroke();

        // Dripper emitters & animated water drops
        for (const px of plantPositions) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, groundY - 4, 5, 0, Math.PI * 2);
          ctx.fill();

          if (isPlaying) {
            const dropY = groundY + ((Math.sin(pulseAngle * 3 + px) + 1) * 8);
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(px, dropY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (method === 'sprinkler') {
        // Sprinkler riser pipe & oscillating spray
        for (const px of [220, 580]) {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(px, groundY);
          ctx.lineTo(px, groundY - 75);
          ctx.stroke();

          // Spray arc
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 2;
          for (let a = -0.8; a <= 0.8; a += 0.25) {
            ctx.beginPath();
            ctx.moveTo(px, groundY - 75);
            ctx.lineTo(px + Math.sin(a + Math.sin(pulseAngle)) * 140, groundY + 10);
            ctx.stroke();
          }
        }
      } else {
        // Flood Irrigation surface standing water sheet
        ctx.fillStyle = 'rgba(6, 182, 212, 0.55)';
        ctx.fillRect(40, groundY - 14, width - 80, 14);
      }

      // 3. Topsoil Layer (0 - 15cm)
      const topsoilGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 50);
      topsoilGrad.addColorStop(0, '#592c14');
      topsoilGrad.addColorStop(1, '#3f1f0e');
      ctx.fillStyle = topsoilGrad;
      ctx.fillRect(0, groundY, width, 50);

      // 4. Subsoil & Root Zone Layer (15cm - 60cm)
      const subsoilGrad = ctx.createLinearGradient(0, groundY + 50, 0, rootZoneY);
      subsoilGrad.addColorStop(0, '#3f1f0e');
      subsoilGrad.addColorStop(1, '#251208');
      ctx.fillStyle = subsoilGrad;
      ctx.fillRect(0, groundY + 50, width, rootZoneY - (groundY + 50));

      // 5. Deep Percolation Bedrock Layer (>60cm)
      ctx.fillStyle = '#170c06';
      ctx.fillRect(0, rootZoneY, width, height - rootZoneY);

      // Layer Boundary Divider Lines & Text Annotations
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(0, groundY + 50);
      ctx.lineTo(width, groundY + 50);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, rootZoneY);
      ctx.lineTo(width, rootZoneY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Layer Labels
      ctx.font = '10px monospace';
      ctx.fillStyle = '#a8a29e';
      ctx.fillText('Topsoil Layer (0-15 cm)', 12, groundY + 30);
      ctx.fillText('Active Root Zone (15-60 cm)', 12, groundY + 85);
      ctx.fillText('Deep Subsoil / Percolation (>60 cm)', 12, rootZoneY + 30);

      // 6. Root Systems & Wetting Bulbs
      for (const px of plantPositions) {
        // Wetting bulb gradient based on irrigation method
        const bulbGrad = ctx.createRadialGradient(
          px, groundY + 35, 10,
          px, groundY + 45, method === 'drip' ? 55 : (method === 'sprinkler' ? 75 : 120)
        );

        if (method === 'drip' || method === 'scheduled') {
          // Precise moisture concentrated at root zone
          bulbGrad.addColorStop(0, 'rgba(6, 182, 212, 0.65)');
          bulbGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.35)');
          bulbGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else if (method === 'sprinkler') {
          bulbGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
          bulbGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        } else {
          // Flood: heavy deep percolation leaking past roots
          bulbGrad.addColorStop(0, 'rgba(6, 182, 212, 0.55)');
          bulbGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.45)');
          bulbGrad.addColorStop(1, 'rgba(239, 68, 68, 0.25)'); // Red tint for waste
        }

        ctx.fillStyle = bulbGrad;
        ctx.beginPath();
        ctx.ellipse(
          px,
          groundY + (method === 'flood' ? 70 : 45),
          method === 'drip' ? 45 : (method === 'sprinkler' ? 70 : 100),
          method === 'drip' ? 55 : (method === 'sprinkler' ? 65 : 95),
          0, 0, Math.PI * 2
        );
        ctx.fill();

        // Branching root fibers
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(px, groundY);
        ctx.lineTo(px, groundY + 45);
        ctx.lineTo(px - 18, groundY + 75);
        ctx.moveTo(px, groundY + 45);
        ctx.lineTo(px + 18, groundY + 75);
        ctx.moveTo(px, groundY + 30);
        ctx.lineTo(px - 28, groundY + 50);
        ctx.moveTo(px, groundY + 30);
        ctx.lineTo(px + 28, groundY + 50);
        ctx.stroke();
      }

      // 7. Deep Percolation Waste Seepage Arrows (Visible heavily in Flood mode)
      if (method === 'flood') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.font = '11px sans-serif';
        ctx.fillText('⚠ 26% Deep Percolation Loss Below Root Zone', width * 0.35, rootZoneY + 45);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [method, speed, isPlaying]);

  const handleSaveScenario = async () => {
    if (!selectedFarmland || !simResults) return;
    try {
      await axios.post('/api/simulations/world/scenarios/save', {
        farmland_id: selectedFarmland.id,
        title: scenarioTitle,
        simulation_type: 'smart_irrigation',
        input_parameters: { method, application_depth_mm: applicationDepth },
        baseline_data: { flood_efficiency: 42.0 },
        calculated_results: simResults,
        educational_notes: `Efficiency: ${simResults.efficiency_pct}%. Saves ${simResults.water_saved_pct}% water and ₹${simResults.estimated_savings_inr}.`
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setSaveModalOpen(false);
      }, 1500);
    } catch (e) {
      console.error('Save scenario error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('simWorld.card2Title')}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{t('simWorld.card2Desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NasaProvenanceBadge category={4} sourceText="SMAP Soil Moisture Dynamics + FAO-56 Irrigation Model" />
        </div>
      </div>

      {/* Main Interactive Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual 3D Soil Cross-Section Canvas (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <canvas
              ref={canvasRef}
              width={800}
              height={380}
              className="w-full h-[320px] md:h-[380px] block"
            />

            {/* Top Method Indicator */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 uppercase font-bold">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                {isTa
                  ? `பாசன முறை: ${method === 'drip' ? 'சொட்டுநீர் (Drip)' : method === 'sprinkler' ? 'தெளிப்பு நீர் (Sprinkler)' : method === 'flood' ? 'வாய்க்கால் (Flood)' : 'திட்டமிட்ட பாசனம்'}`
                  : `Mode: ${method.toUpperCase()} Irrigation`}
              </span>
            </div>

            {/* Efficiency Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3.5 py-1.5 bg-emerald-950/80 backdrop-blur-md rounded-xl text-xs font-mono text-emerald-300 border border-emerald-500/40">
                {isTa ? 'பாசன திறன்:' : 'Efficiency:'} <strong>{simResults?.efficiency_pct}%</strong>
              </span>
            </div>
          </div>

          {/* Controls Bar */}
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
            maxSteps={10}
            onStepChange={setCurrentStep}
            showComparison={showComparison}
            onToggleComparison={() => setShowComparison(!showComparison)}
            onSaveScenario={() => setSaveModalOpen(true)}
            stepLabelPrefix={isTa ? 'சுழற்சி' : 'Cycle'}
          />

          {/* Comparison Card (Drip vs Flood) */}
          {showComparison && simResults && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl">
              <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-500/30 text-xs">
                <h4 className="font-bold text-rose-300 uppercase mb-2">
                  {isTa ? 'பாரம்பரிய வாய்க்கால் பாசனம் (Flood)' : 'Traditional Flood Irrigation'}
                </h4>
                <p>{isTa ? 'பயன்பாட்டு திறன்:' : 'Efficiency:'} <strong className="text-white">42%</strong></p>
                <p>{isTa ? 'மேற்பரப்பு ஆவியாதல்:' : 'Evaporation Loss:'} <strong className="text-rose-400">32%</strong></p>
                <p>{isTa ? 'ஆழமான கசிவு இழப்பு (Percolation):' : 'Deep Percolation Loss:'} <strong className="text-rose-400">26%</strong></p>
                <p>{isTa ? 'மின்சார நுகர்வு:' : 'Power Consumed:'} <strong className="text-white">380 kWh/ha</strong></p>
              </div>
              <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-xs">
                <h4 className="font-bold text-emerald-300 uppercase mb-2">
                  {isTa
                    ? `${method === 'drip' ? 'சொட்டுநீர்' : method === 'sprinkler' ? 'தெளிப்பு நீர்' : 'திட்டமிட்ட'} பாசனம் (${method.toUpperCase()})`
                    : `${method.toUpperCase()} Irrigation`}
                </h4>
                <p>{isTa ? 'பாசன திறன்:' : 'Efficiency:'} <strong className="text-emerald-400">{simResults.efficiency_pct}%</strong></p>
                <p>{isTa ? 'சேமிக்கப்பட்ட நீர்:' : 'Water Saved:'} <strong className="text-emerald-400">{simResults.water_saved_pct}% ({simResults.water_saved_vs_flood_m3} m³)</strong></p>
                <p>{isTa ? 'மின்சார சேமிப்பு:' : 'Power Saved:'} <strong className="text-white">{simResults.electricity_saved_kwh} kWh</strong></p>
                <p>{isTa ? 'மதிப்பிடப்பட்ட சேமிப்பு:' : 'Estimated Savings:'} <strong className="text-emerald-400">₹{simResults.estimated_savings_inr}</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* Irrigation Method Selector & Savings Summary (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              {isTa ? 'பாசன முறையைத் தேர்ந்தெடுக்கவும்' : 'Select Irrigation Method'}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'drip', name: isTa ? 'சொட்டுநீர் பாசனம் (Drip)' : 'Drip Irrigation (சொட்டுநீர்)', eff: '91%' },
                { id: 'sprinkler', name: isTa ? 'தெளிப்பு நீர் (Sprinkler)' : 'Sprinkler (தெளிப்பு)', eff: '72%' },
                { id: 'flood', name: isTa ? 'வாய்க்கால் பாசனம் (Flood)' : 'Canal / Flood (வாய்க்கால்)', eff: '42%' },
                { id: 'scheduled', name: isTa ? 'திட்டமிட்ட முறை (Scheduled)' : 'Smart Scheduled', eff: '86%' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    method === m.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <p className="text-xs font-semibold">{m.name}</p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-0.5">Eff: {m.eff}</p>
                </button>
              ))}
            </div>

            {/* Depth Slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{isTa ? 'ஒவ்வொரு பாசன நீர் அளவு (Water Depth)' : 'Water Depth per Application'}</span>
                <span className="font-mono text-cyan-400 font-bold">{applicationDepth} mm</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={applicationDepth}
                onChange={(e) => setApplicationDepth(parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Conservation Metrics Card */}
          {simResults && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                {isTa ? 'வளங்கள் & நிதி சேமிப்பு' : 'Resource & Financial Savings'}
              </h3>

              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{isTa ? 'மொத்த சேமிப்பு தொகை' : 'Total Money Saved'}</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                    ₹{simResults.estimated_savings_inr}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{isTa ? 'சேமிக்கப்பட்ட நீர் (Water Saved)' : 'Water Saved'}</p>
                  <span className="text-sm font-bold text-cyan-300 font-mono">
                    {simResults.water_saved_pct}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <p className="text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" /> {isTa ? 'சேமிக்கப்பட்ட நீர்' : 'Water Saved'}
                  </p>
                  <p className="text-sm font-bold text-white font-mono mt-1">
                    {simResults.water_saved_vs_flood_m3} m³
                  </p>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <p className="text-slate-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> {isTa ? 'மின்சார சேமிப்பு' : 'Electricity Saved'}
                  </p>
                  <p className="text-sm font-bold text-white font-mono mt-1">
                    {simResults.electricity_saved_kwh} kWh
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational Voice Narrator */}
      {simResults && (
        <EducationalNarrator
          titleEn="Irrigation Efficiency & Root Zone Hydrology Advisory"
          titleTa="பாசன திறன் மற்றும் பயிர் வேர் பகுதி நீரியல் ஆலோசனை"
          explanationEn={`Switching from traditional flood irrigation to ${method} achieves ${simResults.efficiency_pct}% application efficiency, saving ${simResults.water_saved_vs_flood_m3} m³ of groundwater and saving approximately ₹${simResults.estimated_savings_inr} per irrigation season.`}
          explanationTa={`பாரம்பரிய வாய்க்கால் பாசனத்திற்கு பதிலாக ${method === 'drip' ? 'சொட்டுநீர்ப் பாசனத்தை' : method === 'sprinkler' ? 'தெளிப்புநீர்ப் பாசனத்தை' : 'திட்டமிட்ட பாசனத்தை'} அமைப்பதன் மூலம் ${simResults.efficiency_pct}% நீர் பயன்பாட்டு திறனை எட்ட முடிகிறது. இது ${simResults.water_saved_vs_flood_m3} கன மீட்டர் நிலத்தடி நீரை சேமித்து ₹${simResults.estimated_savings_inr} மின்சார செலவை மிச்சப்படுத்துகிறது.`}
          mitigationEn="Apply mulch along the drip lateral lines to eliminate topsoil surface evaporation."
          mitigationTa="சொட்டுநீர் குழாய்கள் உள்ள வரிசையில் நிலப்போர்வை (Mulch) அமைத்தால் மேற்பரப்பு நீர் ஆவியாதலை முழுமையாகத் தடுக்கலாம்."
        />
      )}

      {/* Save Scenario Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">{t('controls.saveScenario')}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Save this irrigation efficiency configuration to review in your farm reports.
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
