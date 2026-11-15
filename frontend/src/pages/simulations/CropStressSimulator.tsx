import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { SimulationControlBar } from '../../components/simulations/SimulationControlBar';
import { EducationalNarrator } from '../../components/simulations/EducationalNarrator';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { ShieldCheck, HeartCrack, Flame, Droplets, Waves, CheckCircle2 } from 'lucide-react';

export const CropStressSimulator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [stressType, setStressType] = useState<'drought' | 'heatwave' | 'waterlogging' | 'salinity'>('drought');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([
    'Paddy (நெல்)',
    'Finger Millet / Ragi (கேழ்வரகு)',
    'Groundnut (நிலக்கடலை)',
    'Cotton (பருத்தி)'
  ]);

  const cropDisplayNames = [
    { en: 'Paddy (நெல்)', ta: 'நெல் (Paddy)', code: 'paddy' },
    { en: 'Finger Millet (கேழ்வரகு)', ta: 'கேழ்வரகு (Ragi)', code: 'finger millet' },
    { en: 'Groundnut (நிலக்கடலை)', ta: 'நிலக்கடலை (Groundnut)', code: 'groundnut' },
    { en: 'Cotton (பருத்தி)', ta: 'பருத்தி (Cotton)', code: 'cotton' }
  ];

  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [simResults, setSimResults] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchSimulation = async () => {
    try {
      const res = await axios.post('/api/simulations/world/run/crop-stress', {
        crops: selectedCrops,
        stress_type: stressType,
        stress_duration_days: 30
      });
      setSimResults(res.data);
    } catch (e) {
      console.error('Stress sim error:', e);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [stressType, selectedCrops]);

  // Stepper
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentDay((prev) => {
          if (prev >= 30) {
            setIsPlaying(false);
            return 30;
          }
          return prev + 1;
        });
      }, 500 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Canvas Side-by-Side Comparison Rendering
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const groundY = height * 0.65;
      const colWidth = width / selectedCrops.length;

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, groundY);

      // Soil
      ctx.fillStyle = '#3f1f0e';
      ctx.fillRect(0, groundY, width, height - groundY);

      // Render Each Crop Side-by-Side
      for (let i = 0; i < selectedCrops.length; i++) {
        const crop = selectedCrops[i];
        const startX = i * colWidth;
        const centerX = startX + colWidth / 2;

        // Separator line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, height);
        ctx.stroke();

        // Calculate survival % on currentDay
        let survivalPct = 100;
        if (simResults && simResults.comparison_data && simResults.comparison_data[i]) {
          const item = simResults.comparison_data[i];
          const decay = (100 - item.base_tolerance_score) / 28;
          survivalPct = Math.max(5, Math.round(100 - currentDay * decay));
        }

        // Header Crop Name
        const matchedCrop = cropDisplayNames.find((c) => c.code === crop.toLowerCase() || crop.toLowerCase().includes(c.code));
        const displayName = isTa ? (matchedCrop?.ta || crop.split(' ')[0]) : (matchedCrop?.en || crop.split(' ')[0]);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(displayName, startX + 10, 25);

        // Survival Badge
        ctx.fillStyle = survivalPct > 70 ? '#34d399' : (survivalPct > 45 ? '#facc15' : '#f87171');
        ctx.font = 'bold 13px monospace';
        ctx.fillText(isTa ? `${survivalPct}% உயிர்வாழும்` : `${survivalPct}% Alive`, startX + 10, 45);

        // Crop Foliage Health
        const wiltFactor = (100 - survivalPct) / 100;
        let stalkColor = '#22c55e';
        if (survivalPct < 50) stalkColor = '#b45309';
        else if (survivalPct < 75) stalkColor = '#ca8a04';

        // Draw Stem with drooping angle based on wilt
        ctx.strokeStyle = stalkColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.quadraticCurveTo(
          centerX + wiltFactor * 25,
          groundY - 35,
          centerX + wiltFactor * 40,
          groundY - 70 + wiltFactor * 15
        );
        ctx.stroke();

        // Foliage Leaves
        ctx.fillStyle = stalkColor;
        ctx.beginPath();
        ctx.ellipse(centerX - 12, groundY - 50 + wiltFactor * 20, 16, 7, -0.4 + wiltFactor * 0.8, 0, Math.PI * 2);
        ctx.ellipse(centerX + 12, groundY - 50 + wiltFactor * 20, 16, 7, 0.4 - wiltFactor * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Root condition
        ctx.strokeStyle = survivalPct > 50 ? '#fef08a' : '#78350f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.lineTo(centerX, groundY + 35);
        ctx.lineTo(centerX - 15, groundY + 55);
        ctx.moveTo(centerX, groundY + 35);
        ctx.lineTo(centerX + 15, groundY + 55);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedCrops, stressType, currentDay, simResults]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
              <HeartCrack className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('simWorld.card5Title')}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{t('simWorld.card5Desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NasaProvenanceBadge category={4} sourceText="TNAU Crop Stress Matrix + NASA MODIS NDVI Baseline" />
        </div>
      </div>

      {/* Main Interactive Arena */}
      <div className="space-y-4">
        {/* Stress Type Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-300 mr-2">
            {isTa ? 'சுற்றுச்சூழல் இடர்பாட்டைத் தேர்வுசெய்க:' : 'Select Environmental Stressor:'}
          </span>
          {[
            {
              id: 'drought',
              label: isTa ? 'கடுமையான வறட்சி (Drought)' : 'Severe Drought Stress (வறட்சி)',
              icon: Droplets
            },
            {
              id: 'heatwave',
              label: isTa ? 'கடும் வெப்ப அலை (Heatwave >40°C)' : 'Extreme Heatwave (>40°C)',
              icon: Flame
            },
            {
              id: 'waterlogging',
              label: isTa ? 'மழைநீர் தேக்கம் (Waterlogging)' : 'Waterlogging / Flooding (மழைநீர் தேக்கம்)',
              icon: Waves
            },
            {
              id: 'salinity',
              label: isTa ? 'மண் உவர்த்தன்மை (Salinity - EC > 4)' : 'Soil Salinity (உவர் மண் - EC > 4)',
              icon: ShieldCheck
            }
          ].map((st) => {
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                onClick={() => setStressType(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  stressType === st.id
                    ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-950/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Visual Arena Canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
          <canvas
            ref={canvasRef}
            width={800}
            height={360}
            className="w-full h-[300px] md:h-[360px] block"
          />

          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-xl text-xs font-mono text-white border border-white/10">
              {isTa ? `இடர்பாட்டு நாள்: 30 இல் ${currentDay}` : `Stress Day: ${currentDay} of 30`}
            </span>
          </div>
        </div>

        {/* Timeline Control Bar */}
        <SimulationControlBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onReset={() => {
            setIsPlaying(false);
            setCurrentDay(1);
          }}
          speed={speed}
          onSpeedChange={setSpeed}
          currentStep={currentDay}
          maxSteps={30}
          onStepChange={setCurrentDay}
          stepLabelPrefix={isTa ? 'இடர்பாட்டு நாள்' : 'Day'}
        />

        {/* Comparative Resilience Cards Grid */}
        {simResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {simResults.comparison_data.map((item: any, idx: number) => {
              const matched = cropDisplayNames.find(c => item.crop_name.toLowerCase().includes(c.code));
              const cropTitle = isTa ? (matched?.ta || item.crop_name) : (matched?.en || item.crop_name);
              const ratingDisplay = isTa
                ? (item.base_tolerance_score >= 75 ? 'உயர் தாங்கும் திறன் (Superior)' : item.base_tolerance_score >= 50 ? 'மிதமானது (Moderate)' : 'பாதிக்கப்படக்கூடியது (Vulnerable)')
                : (item.base_tolerance_score >= 75 ? 'Superior Resilience' : item.base_tolerance_score >= 50 ? 'Moderate' : 'Vulnerable');

              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white font-tamil">{cropTitle}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {ratingDisplay}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>{isTa ? '30-ஆம் நாள் உயிர்வாழ்வு:' : 'Day-30 Survival Rate:'} <strong className="text-white font-mono">{item.day30_survival_pct}%</strong></p>
                    <p>{isTa ? 'மகசூல் இழப்பு அபாயம்:' : 'Expected Yield Loss:'} <strong className="text-rose-400 font-mono">{item.expected_yield_loss_pct}%</strong></p>
                    <p>{isTa ? 'தாங்கும் திறன் குறியீடு:' : 'Tolerance Score (தாங்கும் திறன்):'} <strong className="text-cyan-300 font-mono">{item.base_tolerance_score}/100</strong></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Educational Voice Narrator */}
      {simResults && (
        <EducationalNarrator
          titleEn="Crop Survival Physiology & Threshold Dynamics"
          titleTa="பயிர் உயிர்வாழ்வு உடலியக்கமும் தாங்கும் திறனும்"
          explanationEn={`Under 30 days of ${stressType} stress, crops like Finger Millet and Cotton demonstrate superior morphological adaptations such as deep root taproots and waxy cuticle leaf layers, yielding over 75% survival compared to high-water crops like Paddy.`}
          explanationTa={`${stressType === 'drought' ? 'கடுமையான வறட்சி' : stressType === 'heatwave' ? 'அதிக வெப்பம்' : 'நீர் தேக்க'} சூழலில், கேழ்வரகு மற்றும் பருத்தி பயிர்கள் ஆழமான வேர் மற்றும் மெழுகு போன்ற இலை அமைப்பால் 75% மேல் உயிர்வாழும் திறனை வெளிப்படுத்துகின்றன.`}
          mitigationEn="Choose climate-resilient millet varieties during dry summer seasons to avoid total crop failure."
          mitigationTa="வறட்சி நிறைந்த கோடை பருவங்களில் நெல்லுக்கு பதிலாக கேழ்வரகு போன்ற சிறுதானியங்களை பயிரிடுவது இழப்பை முற்றிலும் தவிர்க்கும்."
        />
      )}
    </div>
  );
};
