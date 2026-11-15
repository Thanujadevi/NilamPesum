import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFarmland } from '../../contexts/FarmlandContext';
import { SimulationControlBar } from '../../components/simulations/SimulationControlBar';
import { EducationalNarrator } from '../../components/simulations/EducationalNarrator';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { Calendar, Sprout, ShieldCheck, IndianRupee, CheckCircle2, Award, ArrowRight } from 'lucide-react';

export const FarmingSeasonSimulator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();

  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Farmer Decisions at each stage
  const [decisions, setDecisions] = useState({
    sowingTiming: 'optimal', // early, optimal, delayed
    irrigationType: 'drip', // drip, flood
    pestManagement: 'ipm_biocontrol', // ipm_biocontrol, chemical
    harvestTiming: 'peak_maturity' // premature, peak_maturity, delayed
  });

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [scenarioTitle, setScenarioTitle] = useState('Samba Season 120-Day Full Journey');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate season economics based on farmer choices
  const calculateSeasonScore = () => {
    let yieldQuintals = 24.5;
    let expenseInr = 28000;
    let pricePerQuintal = 2450;

    // Sowing decision impact
    if (decisions.sowingTiming === 'optimal') {
      yieldQuintals += 2.0;
    } else if (decisions.sowingTiming === 'delayed') {
      yieldQuintals -= 4.5;
    }

    // Irrigation decision impact
    if (decisions.irrigationType === 'drip') {
      expenseInr -= 4000; // Electricity & water savings
      yieldQuintals += 1.5;
    } else {
      expenseInr += 2500;
    }

    // Pest management impact
    if (decisions.pestManagement === 'ipm_biocontrol') {
      expenseInr -= 1500;
    } else {
      expenseInr += 3000;
    }

    const revenueInr = Math.round(yieldQuintals * pricePerQuintal);
    const netProfitInr = revenueInr - expenseInr;

    return {
      yieldQuintals: Math.round(yieldQuintals * 10) / 10,
      revenueInr,
      expenseInr,
      netProfitInr,
      efficiencyGrade: netProfitInr > 30000 ? 'A+ (High Profitability)' : (netProfitInr > 15000 ? 'B (Moderate Profit)' : 'C (At Risk)'),
      efficiencyGradeEn: netProfitInr > 30000 ? 'A+ (High Profitability)' : (netProfitInr > 15000 ? 'B (Moderate Profit)' : 'C (At Risk)'),
      efficiencyGradeTa: netProfitInr > 30000 ? 'A+ (உயர் லாபத்திறன்)' : (netProfitInr > 15000 ? 'B (மிதமான லாபம்)' : 'C (இடர் வாய்ப்பு)')
    };
  };

  const score = calculateSeasonScore();

  // Canvas Animation for Season Growth
  useEffect(() => {
    let animId: number;
    let wave = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      wave += 0.05 * speed;

      const groundY = height * 0.65;

      // 1. Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      if (currentMonth === 3) {
        // Monsoon clouds
        skyGrad.addColorStop(0, '#1e293b');
        skyGrad.addColorStop(1, '#334155');
      } else {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(1, '#38bdf8');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, groundY);

      // 2. Soil
      ctx.fillStyle = '#3f1f0e';
      ctx.fillRect(0, groundY, width, height - groundY);

      // 3. Crop Growth Visualized by Month
      const plants = 20;
      const spacing = width / (plants + 1);

      for (let i = 1; i <= plants; i++) {
        const px = i * spacing;

        if (currentMonth === 1) {
          // Tiny green seedlings
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px, groundY);
          ctx.lineTo(px, groundY - 18);
          ctx.stroke();

          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(px - 5, groundY - 18, 4, 0, Math.PI * 2);
          ctx.arc(px + 5, groundY - 18, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (currentMonth === 2) {
          // Lush tall vegetative tillers
          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(px, groundY);
          ctx.quadraticCurveTo(px + Math.sin(wave + i) * 6, groundY - 30, px + Math.sin(wave + i) * 10, groundY - 55);
          ctx.stroke();

          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.ellipse(px - 10, groundY - 45, 15, 6, -0.3, 0, Math.PI * 2);
          ctx.ellipse(px + 10, groundY - 45, 15, 6, 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (currentMonth === 3) {
          // Flowering & panicle initiation
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(px, groundY);
          ctx.lineTo(px, groundY - 75);
          ctx.stroke();

          // Green-yellow panicle grain head
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.ellipse(px + 8, groundY - 80, 18, 7, 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Month 4: Golden ripe mature grain ready for harvest
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(px, groundY);
          ctx.quadraticCurveTo(px + 15, groundY - 45, px + 25, groundY - 70);
          ctx.stroke();

          // Golden heavy grain panicles bending with weight
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.ellipse(px + 28, groundY - 68, 22, 9, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentMonth, speed, decisions]);

  // Stepper
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentMonth((prev) => {
          if (prev >= 4) {
            setIsPlaying(false);
            return 4;
          }
          return prev + 1;
        });
      }, 2000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const handleSaveScenario = async () => {
    if (!selectedFarmland) return;
    try {
      await axios.post('/api/simulations/world/scenarios/save', {
        farmland_id: selectedFarmland.id,
        title: scenarioTitle,
        simulation_type: 'full_season',
        input_parameters: decisions,
        baseline_data: { standard_yield: 24.5 },
        calculated_results: score,
        educational_notes: `Net season profit: ₹${score.netProfitInr}. Grade: ${score.efficiencyGrade}.`
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setSaveModalOpen(false);
      }, 1500);
    } catch (e) {
      console.error('Save full season error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('simWorld.card6Title')}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{t('simWorld.card6Desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NasaProvenanceBadge category={4} sourceText="120-Day Crop Phenology & Season Journey" />
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
              height={360}
              className="w-full h-[300px] md:h-[360px] block"
            />

            {/* Stage Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1.5 bg-black/70 backdrop-blur-md rounded-xl text-xs font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 uppercase font-bold">
                {isTa ? (
                  currentMonth === 1 ? 'மாதம் 1/4: நிலம் தயாரிப்பு & விதைப்பு' :
                  currentMonth === 2 ? 'மாதம் 2/4: தூர் கட்டுதல் & களை மேலாண்மை' :
                  currentMonth === 3 ? 'மாதம் 3/4: கதிர் உருவாக்கம் & நீர் பாசனம்' :
                  'மாதம் 4/4: பொன் அறுவடை & தானிய முதிர்வு'
                ) : (
                  currentMonth === 1 ? 'Month 1 of 4: Land Prep & Sowing' :
                  currentMonth === 2 ? 'Month 2 of 4: Vegetative Tillering' :
                  currentMonth === 3 ? 'Month 3 of 4: Panicle Initiation' :
                  'Month 4 of 4: Golden Harvest & Ripening'
                )}
              </span>
            </div>
          </div>

          <SimulationControlBar
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => {
              setIsPlaying(false);
              setCurrentMonth(1);
            }}
            speed={speed}
            onSpeedChange={setSpeed}
            currentStep={currentMonth}
            maxSteps={4}
            onStepChange={setCurrentMonth}
            onSaveScenario={() => setSaveModalOpen(true)}
            stepLabelPrefix={isTa ? 'மாதம்' : 'Month'}
          />

          {/* Interactive Decision Control Center */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              {isTa ? 'இப்பருவத்திற்கான விவசாய மேலாண்மை தேர்வுகள்' : 'Farmer Management Choices for This Season'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sowing Choice */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isTa ? 'மாதம் 1: விதைப்பு காலம்' : 'Month 1: Sowing Window'}
                </label>
                <select
                  value={decisions.sowingTiming}
                  onChange={(e) => setDecisions({ ...decisions, sowingTiming: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="early">
                    {isTa ? 'முன்கூட்டியே விதைப்பு (வெப்ப அலை தவிர்வு)' : 'Early Sowing (Escapes Heatwave)'}
                  </option>
                  <option value="optimal">
                    {isTa ? 'உகந்த விதைப்பு பருவம் (பரிந்துரைக்கப்பட்டது)' : 'Optimal Sowing Window (Recommended)'}
                  </option>
                  <option value="delayed">
                    {isTa ? 'தாமதமான விதைப்பு (-15% மகசூல் இழப்பு)' : 'Delayed Sowing (-15% Yield Risk)'}
                  </option>
                </select>
              </div>

              {/* Irrigation Choice */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isTa ? 'மாதம் 2: பாசன தொழில்நுட்பம்' : 'Month 2: Irrigation Technology'}
                </label>
                <select
                  value={decisions.irrigationType}
                  onChange={(e) => setDecisions({ ...decisions, irrigationType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="drip">
                    {isTa ? 'சொட்டுநீர்ப் பாசனம் (Drip - 40% நீர் சேமிப்பு)' : 'Smart Drip Irrigation (+40% Water Efficiency)'}
                  </option>
                  <option value="flood">
                    {isTa ? 'பாரம்பரிய வாய்க்கால் பாசனம் (Flood)' : 'Traditional Flood Irrigation'}
                  </option>
                </select>
              </div>

              {/* Pest Management Choice */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isTa ? 'மாதம் 3: பூச்சி மேலாண்மை உத்தி' : 'Month 3: Pest Management Strategy'}
                </label>
                <select
                  value={decisions.pestManagement}
                  onChange={(e) => setDecisions({ ...decisions, pestManagement: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ipm_biocontrol">
                    {isTa ? 'ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM - இனக்கவர்ச்சி / வேம்பு)' : 'Integrated Pest Management (IPM - Pheromones / Neem)'}
                  </option>
                  <option value="chemical">
                    {isTa ? 'ரசாயன பூச்சிக்கொல்லிகள் (Chemical)' : 'Chemical Insecticides'}
                  </option>
                </select>
              </div>

              {/* Harvest Choice */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isTa ? 'மாதம் 4: அறுவடை காலம்' : 'Month 4: Harvest Timing'}
                </label>
                <select
                  value={decisions.harvestTiming}
                  onChange={(e) => setDecisions({ ...decisions, harvestTiming: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="peak_maturity">
                    {isTa ? 'உகந்த உடலியக்க முதிர்ச்சி (80% பொன்மணிகள்)' : 'Peak Physiological Maturity (80% Golden Grain)'}
                  </option>
                  <option value="delayed">
                    {isTa ? 'தாமதமான அறுவடை (கதிர் உதிர்தல் இழப்பு)' : 'Delayed Harvest (Shattering Loss)'}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Season Scorecard (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              {isTa ? 'பருவ வரவு-செலவு கணக்கீடு (P&L)' : 'Season P&L Scorecard'}
            </h3>

            <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{isTa ? 'நிகர லாபம் (Estimated Profit)' : 'Net Estimated Profit'}</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                  ₹{score.netProfitInr.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">{isTa ? 'மகசூல் (Yield)' : 'Yield'}</p>
                <span className="text-sm font-bold text-white font-mono">
                  {score.yieldQuintals} {isTa ? 'குவிண்டால்/ஏக்கர்' : 'Qtl/ac'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-slate-400">{isTa ? 'மொத்த பயிர் வருவாய்:' : 'Gross Crop Revenue:'}</span>
                <strong className="text-white font-mono">₹{score.revenueInr.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-slate-400">{isTa ? 'சாகுபடி & இடுபொருள் செலவு:' : 'Input & Operational Expenses:'}</span>
                <strong className="text-rose-400 font-mono">₹{score.expenseInr.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-emerald-900/30 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-300">{isTa ? 'மேலாண்மை தரம்:' : 'Management Grade:'}</span>
                <strong className="text-emerald-300 font-semibold">{isTa ? score.efficiencyGradeTa : score.efficiencyGradeEn}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Voice Narrator */}
      <EducationalNarrator
        titleEn="Season Journey Agro-Economic Insights"
        titleTa="விவசாயப் பருவப் பயணமும் பொருளாதார நன்மைகளும்"
        explanationEn={`Aligning optimal sowing dates with micro-drip irrigation and integrated pest management yields an estimated ${score.yieldQuintals} quintals/acre, generating a net profit of ₹${score.netProfitInr.toLocaleString()} while protecting groundwater reserves.`}
        explanationTa={`சரியான விதைப்பு காலம், சொட்டுநீர்ப் பாசனம் மற்றும் ஒருங்கிணைந்த பூச்சி மேலாண்மை ஆகியவற்றை கடைப்பிடிப்பதன் மூலம் ஏக்கருக்கு ${score.yieldQuintals} குவிண்டால் மகசூலும், ₹${score.netProfitInr.toLocaleString()} நிகர லாபமும் பெற முடிகிறது.`}
        mitigationEn="Log all actual field expenses in Nilam Pesum Farm Expenses tracker to fine-tune future season predictions."
        mitigationTa="உண்மையான செலவுகளை நிலம் பேசும் வரவு-செலவு பதிவேட்டில் குறித்து வைத்தால் அடுத்த பருவ திட்டமிடல் மேலும் துல்லியமாகும்."
      />

      {/* Save Scenario Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">{t('controls.saveScenario')}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Save this complete farming season strategy to compare with your previous seasons.
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
