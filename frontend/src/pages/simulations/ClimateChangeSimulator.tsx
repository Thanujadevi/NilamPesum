import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFarmland } from '../../contexts/FarmlandContext';
import { useAuth } from '../../contexts/AuthContext';
import { SimulationControlBar } from '../../components/simulations/SimulationControlBar';
import { EducationalNarrator } from '../../components/simulations/EducationalNarrator';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import {
  Sun, CloudRain, Flame, Thermometer, Droplets, TrendingDown,
  ShieldAlert, Sparkles, CheckCircle2, ChevronDown, ChevronUp,
  MapPin, Sprout, Layers, ArrowUpRight, Plus, Minus, Info, HelpCircle
} from 'lucide-react';

export const ClimateChangeSimulator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { selectedFarmland } = useFarmland();
  const { user } = useAuth();
  const isTa = i18n.language === 'ta';

  // Slider Inputs
  const [tempDelta, setTempDelta] = useState<number>(2.0); // -2.0 to +6.0 °C
  const [rainDelta, setRainDelta] = useState<number>(-20.0); // -50% to +50%
  const [drySpell, setDrySpell] = useState<number>(18); // 0 to 40 days

  // Playback Controls
  const [speed, setSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [scenarioTitle, setScenarioTitle] = useState<string>('Climate Stress +2°C & -20% Rain');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  // Simulation Results
  const [simResults, setSimResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Personalized farmer variables
  const farmerName = user?.full_name || (isTa ? 'செல்வம் ராமசாமி' : 'Selvam Ramasamy');
  const farmName = selectedFarmland?.name || (isTa ? 'முதன்மை பண்ணை' : 'Primary Farmland');
  const village = selectedFarmland?.village || user?.village || (isTa ? 'திருவையாறு' : 'Thiruvaiyaru');
  const taluk = selectedFarmland?.taluk || user?.taluk || (isTa ? 'திருவையாறு வட்டம்' : 'Thiruvaiyaru Taluk');
  const district = selectedFarmland?.district || user?.district || (isTa ? 'தஞ்சாவூர்' : 'Thanjavur');
  const standingCrop = selectedFarmland?.current_crop || (isTa ? 'Paddy (நெல்)' : 'Paddy (Rice)');
  const soilType = selectedFarmland?.soil_type || 'alluvial';
  const irrigationSource = selectedFarmland?.irrigation_type || 'borewell';

  // Base climate references (NASA POWER baseline for Cauvery delta / TN)
  const baselineTemp = 29.8;
  const baselineRain = 480;

  // Real-time calculated temperatures and rainfalls
  const projectedTemp = parseFloat((baselineTemp + tempDelta).toFixed(1));
  const projectedRain = Math.max(0, Math.round(baselineRain * (1 + rainDelta / 100)));

  // Fetch Simulation from Backend
  const fetchSimulation = async () => {
    if (!selectedFarmland) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/simulations/world/run/climate-change', {
        farmland_id: selectedFarmland.id,
        temp_delta_c: tempDelta,
        rain_delta_pct: rainDelta,
        dry_spell_days: drySpell
      });
      setSimResults(res.data);
    } catch (e) {
      console.error('Climate sim run error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [selectedFarmland, tempDelta, rainDelta, drySpell]);

  // Canvas 2.5D Animated Environment
  useEffect(() => {
    let animId: number;
    const rainDrops: { x: number; y: number; speed: number; length: number }[] = [];

    // Pre-seed rain drops
    for (let i = 0; i < 45; i++) {
      rainDrops.push({
        x: Math.random() * 850,
        y: Math.random() * 400,
        speed: 4 + Math.random() * 5,
        length: 8 + Math.random() * 12
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

      // 1. Sky Gradient based on heat and rain
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.58);
      if (tempDelta > 2.5) {
        // Scorching yellow-orange haze
        skyGrad.addColorStop(0, '#78350f');
        skyGrad.addColorStop(0.4, '#9a3412');
        skyGrad.addColorStop(1, '#d97706');
      } else if (rainDelta > 15) {
        // Overcast rainy sky
        skyGrad.addColorStop(0, '#1e293b');
        skyGrad.addColorStop(0.6, '#334155');
        skyGrad.addColorStop(1, '#475569');
      } else {
        // Natural sunny agricultural sky
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.5, '#0ea5e9');
        skyGrad.addColorStop(1, '#7dd3fc');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.58);

      // 2. Animated Sun with dynamic radial glare
      const heatFactor = Math.max(0, (tempDelta + 2) / 8);
      const sunX = width * 0.82;
      const sunY = height * 0.2;
      const sunRadius = 26 + heatFactor * 14;

      const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, sunRadius * 2.8);
      sunGlow.addColorStop(0, '#fef08a');
      sunGlow.addColorStop(0.35, 'rgba(250, 204, 21, 0.65)');
      sunGlow.addColorStop(0.8, 'rgba(234, 88, 12, 0.2)');
      sunGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Farmland Soil (Color transitions from moist loam to parched cracked brown)
      const drynessProgress = Math.min(1, (currentDay / 30) * (drySpell / 18) + (tempDelta / 6) * 0.35);
      const soilGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
      if (drynessProgress > 0.6) {
        soilGrad.addColorStop(0, '#78350f'); // parched drought brown
        soilGrad.addColorStop(1, '#451a03');
      } else {
        soilGrad.addColorStop(0, '#382215'); // rich moist alluvial loam
        soilGrad.addColorStop(1, '#1c130d');
      }
      ctx.fillStyle = soilGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.55);
      ctx.bezierCurveTo(width * 0.3, height * 0.52, width * 0.7, height * 0.58, width, height * 0.55);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Drought Cracks in Soil when dryness is significant
      if (drynessProgress > 0.45) {
        ctx.strokeStyle = '#291307';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 7; i++) {
          const cx = width * 0.12 + i * 105;
          const cy = height * 0.72 + (i % 2) * 22;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + 26, cy + 18);
          ctx.lineTo(cx + 42, cy + 10);
          ctx.stroke();
        }
      }

      // 4. Crop Stalks (Reflects crop health and wilting droop)
      const plantCount = 24;
      const spacing = width / (plantCount + 1);

      let leafColor = '#22c55e'; // healthy green
      let droopAngle = 0;
      if (drynessProgress > 0.65) {
        leafColor = '#b45309'; // dried brown
        droopAngle = 0.55;
      } else if (drynessProgress > 0.35) {
        leafColor = '#ca8a04'; // yellowing stress
        droopAngle = 0.28;
      }

      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';

      for (let i = 1; i <= plantCount; i++) {
        const px = i * spacing + Math.sin(i) * 5;
        const py = height * 0.62 + Math.cos(i) * 8;
        const plantHeight = 56 - (drynessProgress * 16);

        ctx.strokeStyle = leafColor;

        // Central stalk
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + droopAngle * 22, py - plantHeight * 0.6, px + droopAngle * 38, py - plantHeight);
        ctx.stroke();

        // Left leaf
        ctx.beginPath();
        ctx.moveTo(px, py - 14);
        ctx.quadraticCurveTo(px - 18, py - 28 + droopAngle * 16, px - 26, py - 18 + droopAngle * 26);
        ctx.stroke();

        // Right leaf
        ctx.beginPath();
        ctx.moveTo(px, py - 22);
        ctx.quadraticCurveTo(px + 18, py - 36 + droopAngle * 16, px + 28, py - 24 + droopAngle * 26);
        ctx.stroke();
      }

      // 5. Rain Particle Effects if rainDelta is positive
      if (rainDelta > 0) {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
        ctx.lineWidth = 1.8;
        for (const drop of rainDrops) {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          if (drop.y > height * 0.65) {
            drop.y = 0;
            drop.x = Math.random() * width;
          }
        }
      }

      // Heat Shimmer Overlay if temperature high
      if (tempDelta > 2.0) {
        ctx.fillStyle = 'rgba(254, 243, 199, 0.08)';
        ctx.fillRect(0, height * 0.45, width, height * 0.16);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [tempDelta, rainDelta, drySpell, currentDay]);

  // Timeline Step Timer
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
      }, 450 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Save Scenario Handler
  const handleSaveScenario = async () => {
    if (!selectedFarmland || !simResults) return;
    try {
      await axios.post('/api/simulations/world/scenarios/save', {
        farmland_id: selectedFarmland.id,
        title: scenarioTitle,
        simulation_type: 'climate_change',
        input_parameters: { temp_delta_c: tempDelta, rain_delta_pct: rainDelta, dry_spell_days: drySpell },
        baseline_data: simResults.baseline,
        calculated_results: simResults.simulated,
        educational_notes: `Projected yield penalty: ${simResults.simulated.yield_impact_pct}%. Recommended early sowing shift.`
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

  // Structured 4-Point Agronomic Explanation Generator
  const getFourPointExplanation = () => {
    const cropName = standingCrop.includes('Paddy') || standingCrop.includes('நெல்') ? (isTa ? 'நெல்' : 'Paddy')
      : standingCrop.includes('Banana') || standingCrop.includes('வாழை') ? (isTa ? 'வாழை' : 'Banana')
      : standingCrop.includes('Cotton') || standingCrop.includes('பருத்தி') ? (isTa ? 'பருத்தி' : 'Cotton')
      : (isTa ? 'பயிர்' : 'Crop');

    // 1. What Changed
    const whatChanged = isTa
      ? `வெப்பநிலை அடிப்படை அளவை விட ${tempDelta >= 0 ? `+${tempDelta}°C அதிகரித்துள்ளது` : `${tempDelta}°C குறைந்துள்ளது`}, பருவமழை ${rainDelta >= 0 ? `+${rainDelta}% அதிகரித்துள்ளது` : `${Math.abs(rainDelta)}% குறைந்துள்ளது`}, மற்றும் ${drySpell} நாட்கள் தொடர் வறட்சி ஏற்பட்டுள்ளது.`
      : `Temperature shifted by ${tempDelta >= 0 ? `+${tempDelta}°C` : `${tempDelta}°C`}, seasonal rainfall by ${rainDelta >= 0 ? `+${rainDelta}%` : `${rainDelta}%`}, with ${drySpell} consecutive dry days.`;

    // 2. Why it matters
    const whyMatters = isTa
      ? `வெப்பநிலை உயரும் போது பயிரின் ஆவியாதல் தேவை (Evapotranspiration - ET₀) அதிகரித்து (+${simResults?.simulated?.evapotranspiration_change_pct || 0}%), மண்ணிலும் இலைகளிலும் உள்ள நீர் வேகமாக வற்றி வேர்ப்பகுதி ஈரப்பதம் குறைகிறது.`
      : `Higher ambient heat steeply accelerates crop evapotranspiration (நீர் ஆவியாதல்: +${simResults?.simulated?.evapotranspiration_change_pct || 0}%), rapidly pulling moisture from the root zone and depleting plant turgor pressure.`;

    // 3. Crop consequence
    let cropConsequence = '';
    if (cropName === 'நெல்' || cropName === 'Paddy') {
      cropConsequence = isTa
        ? `நெல் (Paddy) பயிரில் பூக்கும் தருணத்தில் வெப்பநிலை 33°C ஐ தாண்டினால் மகரந்தக் கூடுகள் கருகி பதர்கள் (Floret Sterility) அதிகரிக்கும். தொடர் வறட்சியால் மணி பிடிக்கும் திறன் குறைந்து ${Math.abs(simResults?.simulated?.yield_impact_pct || 15)}% வரை மகசூல் இழப்பு ஏற்பட வாய்ப்புள்ளது.`
        : `For Paddy (நெல்), temperatures above 33°C during booting induce floret sterility (பதர் ஏற்படுதல்). Combined with dry spells, harvest yield drops by approx ${Math.abs(simResults?.simulated?.yield_impact_pct || 15)}%.`;
    } else if (cropName === 'வாழை' || cropName === 'Banana') {
      cropConsequence = isTa
        ? `வாழை (Banana) பயிரில் இலைகள் சுருங்கி விளிம்பு கருகல் (Leaf Scorch) ஏற்படும். தார் வெளிவரும் பருவத்தில் நீர் பற்றாக்குறை ஏற்பட்டால் காய்களின் எடை மற்றும் தரம் கணிசமாக குறையும்.`
        : `In Banana (வாழை), high heat causes leaf scorch (விளிம்பு கருகல்) and bunch choking, reducing finger weight and market grading.`;
    } else {
      cropConsequence = isTa
        ? `பயிரின் இலைகள் மஞ்சள் நிறமாகி பூக்கள் உதிர்ந்து காய் பிடிக்கும் திறன் குறையும். கணக்கிடப்பட்ட மகசூல் இழப்பு: ${Math.abs(simResults?.simulated?.yield_impact_pct || 15)}%.`
        : `Canopy heat stress causes accelerated blossom drop and poor grain setting, projecting a harvest deficit of ${Math.abs(simResults?.simulated?.yield_impact_pct || 15)}%.`;
    }

    // 4. Action for farmer
    const farmerAction = isTa
      ? `விதைப்பு தேதியை 10-14 நாட்கள் முன்கூட்டியே மாற்றி பூக்கும் பருவத்தில் உச்ச வெப்பத்தைத் தவிர்க்கவும். நிலப்போர்வை (Mulching) அமைத்து மண்ணில் நீர் ஆவியாவதைத் தடுக்கவும். பொட்டாசியம் குளோரைடு (KCl) அல்லது பஞ்சகவ்யா தெளித்து வறட்சி தாங்கும் திறனை உயர்த்தவும்.`
      : `Shift sowing window 10-14 days earlier to escape peak heat during flowering. Apply straw mulching (நிலப்போர்வை) to retain topsoil moisture and consider foliar potassium spray (KCl) to boost drought resilience.`;

    return { whatChanged, whyMatters, cropConsequence, farmerAction };
  };

  const fourPoints = getFourPointExplanation();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Simulation Overview & Farmer Profile Banner */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#092215] via-[#0d2e1d] to-[#0a2014] text-white rounded-3xl p-6 shadow-xl border border-teal-700/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5 font-tamil">
                <Thermometer className="w-3.5 h-3.5 text-teal-300" />
                {t('simClimate.title')}
              </span>
              <span className="text-xs text-teal-200/80">
                {t('simClimate.baseline')}: <strong>{baselineTemp}°C</strong> • <strong>{baselineRain} mm</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-tamil text-white">
              {t('simClimate.title')}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 font-tamil max-w-2xl leading-relaxed">
              {t('simClimate.subtitle')}
            </p>
          </div>

          {/* Farmer & Field Context Card */}
          <div className="bg-teal-950/60 border border-teal-600/40 rounded-2xl p-4 min-w-[280px] shadow-inner space-y-1.5 text-xs font-tamil">
            <div className="flex items-center gap-1.5 text-teal-300 font-bold border-b border-teal-800/40 pb-1.5">
              <Sprout className="w-4 h-4 text-teal-400" />
              <span>{isTa ? 'பண்ணை சூழல் & விவசாயி விவரங்கள்' : 'Farmer Profile & Field Context'}</span>
            </div>
            <p className="text-teal-200">{isTa ? 'விவசாயி:' : 'Farmer:'} <strong className="text-white">{farmerName}</strong></p>
            <p className="text-teal-200">{isTa ? 'பண்ணை:' : 'Farmland:'} <strong className="text-white">{farmName}</strong></p>
            <p className="text-teal-200">{isTa ? 'அமைவிடம்:' : 'Location:'} <strong className="text-white">{village}, {taluk}, {district}</strong></p>
            <p className="text-teal-200">{isTa ? 'பயிர்:' : 'Crop:'} <strong className="text-teal-300">{standingCrop}</strong></p>
          </div>
        </div>

        {/* Key Measurements Comparison Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-teal-800/40 text-xs font-tamil">
          <div className="p-3 bg-black/30 rounded-xl border border-teal-500/20">
            <span className="text-teal-300 block">{isTa ? 'அடிப்படை வெப்பநிலை' : 'Reference Temp'}</span>
            <strong className="text-base font-bold text-white font-mono">{baselineTemp}°C</strong>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-teal-500/20">
            <span className="text-teal-300 block">{isTa ? 'மாற்றப்பட்ட வெப்பநிலை' : 'Adjusted Temp'}</span>
            <strong className={`text-base font-bold font-mono ${tempDelta > 0 ? 'text-amber-400' : 'text-teal-300'}`}>
              {projectedTemp}°C ({tempDelta >= 0 ? `+${tempDelta}` : tempDelta}°C)
            </strong>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-teal-500/20">
            <span className="text-teal-300 block">{isTa ? 'மாற்றப்பட்ட பருவமழை' : 'Adjusted Rainfall'}</span>
            <strong className={`text-base font-bold font-mono ${rainDelta < 0 ? 'text-rose-400' : 'text-cyan-300'}`}>
              {projectedRain} mm ({rainDelta >= 0 ? `+${rainDelta}` : rainDelta}%)
            </strong>
          </div>
          <div className="p-3 bg-black/30 rounded-xl border border-teal-500/20">
            <span className="text-teal-300 block">{isTa ? 'தொடர் வறட்சி நாட்கள் (Dry Spell)' : 'Consecutive Dry Spell Days'}</span>
            <strong className="text-base font-bold text-rose-400 font-mono">{drySpell} {isTa ? 'நாட்கள்' : 'Days'}</strong>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Interactive Arena: Visualization & Controls */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visual Canvas & Playback (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-teal-600/40 shadow-2xl bg-[#030d07]">
            <canvas
              ref={canvasRef}
              width={820}
              height={380}
              className="w-full h-[320px] md:h-[380px] block"
            />

            {/* Top Environmental Overlays */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-mono text-white border border-teal-500/30 flex items-center gap-1.5 shadow">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                {projectedTemp}°C ({tempDelta >= 0 ? `+${tempDelta}` : tempDelta}°C)
              </span>
              <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-mono text-white border border-teal-500/30 flex items-center gap-1.5 shadow">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                {projectedRain} mm ({rainDelta >= 0 ? `+${rainDelta}` : rainDelta}%)
              </span>
              <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-mono text-white border border-teal-500/30 flex items-center gap-1.5 shadow">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                {drySpell} {isTa ? 'நாட்கள் வறட்சி' : 'Days Dry Spell'}
              </span>
            </div>

            {/* Bottom Simulation Day Status Indicator */}
            <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/80 backdrop-blur-md rounded-2xl text-xs border border-teal-500/30 shadow flex items-center gap-2 font-tamil">
              <span className="text-teal-300 font-bold">{isTa ? `நாள் ${currentDay} / 30:` : `Day ${currentDay} of 30:`}</span>
              <span className={`font-semibold ${currentDay <= 10 ? 'text-emerald-400' : currentDay <= 20 ? 'text-amber-400' : 'text-rose-400'}`}>
                {currentDay <= 10
                  ? (isTa ? 'வளர்ச்சிப் பருவம் (Vegetative)' : 'Healthy Vegetative')
                  : currentDay <= 20
                  ? (isTa ? 'ஆவியாதல் சுமை (Water Stress)' : 'Transpiration Stress')
                  : (isTa ? 'இலை கருகல் & வறட்சி (Wilted Foliage)' : 'Severe Foliage Wilt')}
              </span>
            </div>
          </div>

          {/* Simulation Playback Bar */}
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
            showComparison={showComparison}
            onToggleComparison={() => setShowComparison(!showComparison)}
            onSaveScenario={() => setSaveModalOpen(true)}
            stepLabelPrefix={isTa ? 'நாள்' : 'Day'}
          />

          {/* Side-by-side Baseline vs Simulated Card */}
          {showComparison && simResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#0b271a] border border-teal-500/40 rounded-3xl text-xs font-tamil">
              <div className="p-4 bg-black/40 rounded-2xl border border-teal-700/40 space-y-2">
                <h4 className="font-bold text-teal-300 uppercase flex items-center gap-1.5">
                  <NasaProvenanceBadge category={1} />
                  <span>{t('simClimate.baseline')}</span>
                </h4>
                <p className="text-slate-300">சராசரி வெப்பநிலை: <strong className="text-white">{simResults.baseline.mean_temp_c}°C</strong></p>
                <p className="text-slate-300">பருவமழை: <strong className="text-white">{simResults.baseline.seasonal_rainfall_mm} mm</strong></p>
                <p className="text-slate-300">ஆவியாதல் விகிதம் (ET₀): <strong className="text-white">{simResults.baseline.reference_et0_mm_day} mm/நாள்</strong></p>
                <p className="text-slate-300">வரலாற்று அபாயம்: <strong className="text-emerald-400">குறைவான காலநிலை அபாயம்</strong></p>
              </div>

              <div className="p-4 bg-teal-950/80 rounded-2xl border border-teal-500/40 space-y-2">
                <h4 className="font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t('simClimate.scenario')}</span>
                </h4>
                <p className="text-slate-300">மாற்றியமைக்கப்பட்ட வெப்பநிலை: <strong className="text-amber-400">{simResults.simulated.projected_temp_c}°C</strong></p>
                <p className="text-slate-300">மாற்றியமைக்கப்பட்ட மழை: <strong className="text-cyan-400">{simResults.simulated.projected_rainfall_mm} mm</strong></p>
                <p className="text-slate-300">எஞ்சிய மண் ஈரப்பதம்: <strong className="text-rose-400">{simResults.simulated.soil_moisture_remaining_pct}%</strong></p>
                <p className="text-slate-300">எதிர்பார்க்கப்படும் மகசூல் இழப்பு: <strong className="text-rose-400">{simResults.simulated.yield_impact_pct}%</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clean, Spacious Adjustment Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b271a] border border-teal-600/40 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-teal-800/40 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-tamil">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <span>{isTa ? 'காலநிலை அமைப்புகள் (Climate Controls)' : 'Climate Controls'}</span>
              </h3>
              <span className="text-[11px] text-teal-300/80 font-tamil">
                {isTa ? 'நேரலை மாற்றம்' : 'Live Adjustment'}
              </span>
            </div>

            {/* Slider 1: Temperature Adjustment */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-black/30 border border-teal-700/30">
              <div className="flex items-center justify-between text-xs font-tamil">
                <span className="font-bold text-teal-200 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  {isTa ? 'வெப்பநிலை சரிசெய்தல் (°C)' : 'Temperature Adjustment (°C)'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {isTa
                    ? (tempDelta > 0 ? `+${tempDelta}°C (அதிகரிப்பு)` : tempDelta < 0 ? `${tempDelta}°C (குறைவு)` : '0°C (இயல்புநிலை)')
                    : (tempDelta > 0 ? `+${tempDelta}°C (Increase)` : tempDelta < 0 ? `${tempDelta}°C (Decrease)` : '0°C (Baseline)')}
                </span>
              </div>

              {/* Slider with Min/Max and Real-time value */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="-2.0"
                  max="6.0"
                  step="0.5"
                  value={tempDelta}
                  onChange={(e) => setTempDelta(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>-2.0°C</span>
                  <span className="text-amber-300 font-bold">
                    {isTa ? `புதிய அளவு: ${projectedTemp}°C` : `Projected Temp: ${projectedTemp}°C`}
                  </span>
                  <span>+6.0°C</span>
                </div>
              </div>

              {/* Stepper Buttons & Direct Input */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setTempDelta((prev) => Math.max(-2.0, parseFloat((prev - 0.5).toFixed(1))))}
                  className="p-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/40 transition cursor-pointer"
                  title={isTa ? '0.5°C குறைக்கவும்' : 'Decrease 0.5°C'}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-tamil">
                  <span>{isTa ? 'நேரடி உள்ளீடு:' : 'Direct Input:'}</span>
                  <input
                    type="number"
                    min="-2.0"
                    max="6.0"
                    step="0.5"
                    value={tempDelta}
                    onChange={(e) => setTempDelta(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-black/60 border border-teal-500/40 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                  />
                  <span>°C</span>
                </div>

                <button
                  type="button"
                  onClick={() => setTempDelta((prev) => Math.min(6.0, parseFloat((prev + 0.5).toFixed(1))))}
                  className="p-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/40 transition cursor-pointer"
                  title={isTa ? '0.5°C அதிகரிக்கவும்' : 'Increase 0.5°C'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider 2: Seasonal Rainfall Adjustment */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-black/30 border border-teal-700/30">
              <div className="flex items-center justify-between text-xs font-tamil">
                <span className="font-bold text-teal-200 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  {isTa ? 'பருவமழை அளவு மாற்றம் (% & மி.மீ)' : 'Seasonal Rainfall Adjustment (% & mm)'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${rainDelta < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
                  {isTa
                    ? (rainDelta > 0 ? `+${rainDelta}% (அதிகரிப்பு)` : rainDelta < 0 ? `${rainDelta}% (குறைவு)` : '0% (இயல்புநிலை)')
                    : (rainDelta > 0 ? `+${rainDelta}% (Increase)` : rainDelta < 0 ? `${rainDelta}% (Decrease)` : '0% (Baseline)')}
                </span>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={rainDelta}
                  onChange={(e) => setRainDelta(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>-50% (240 {isTa ? 'மி.மீ' : 'mm'})</span>
                  <span className="text-cyan-300 font-bold">{projectedRain} {isTa ? 'மி.மீ' : 'mm'}</span>
                  <span>+50% (720 {isTa ? 'மி.மீ' : 'mm'})</span>
                </div>
              </div>

              {/* Stepper Buttons & Direct Input */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setRainDelta((prev) => Math.max(-50, prev - 5))}
                  className="p-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/40 transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-tamil">
                  <span>{isTa ? 'நேரடி உள்ளீடு:' : 'Direct Input:'}</span>
                  <input
                    type="number"
                    min="-50"
                    max="50"
                    step="5"
                    value={rainDelta}
                    onChange={(e) => setRainDelta(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-black/60 border border-teal-500/40 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                  />
                  <span>%</span>
                </div>

                <button
                  type="button"
                  onClick={() => setRainDelta((prev) => Math.min(50, prev + 5))}
                  className="p-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/40 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider 3: Consecutive Dry Spell Days */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-black/30 border border-teal-700/30">
              <div className="flex items-center justify-between text-xs font-tamil">
                <span className="font-bold text-teal-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  {isTa ? 'தொடர் வறட்சி நாட்கள் (Dry Spell)' : 'Consecutive Dry Spell Days'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                  {drySpell} {isTa ? 'நாட்கள்' : 'Days'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-tamil">
                {isTa
                  ? 'மழை இல்லாத தொடர் நாட்கள் (மண் ஈரப்பதம் குறைந்து பயிர் வறட்சிக்கு உள்ளாகும்)'
                  : 'Consecutive days without rainfall (accelerates soil moisture evaporation and moisture stress)'}
              </p>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={drySpell}
                  onChange={(e) => setDrySpell(parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>0 {isTa ? 'நாள்' : 'Days'}</span>
                  <span className="text-rose-400 font-bold">{drySpell} {isTa ? 'நாட்கள்' : 'Days'}</span>
                  <span>40 {isTa ? 'நாட்கள்' : 'Days'}</span>
                </div>
              </div>

              {/* Stepper Buttons & Direct Input */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => setDrySpell((prev) => Math.max(0, prev - 1))}
                  className="p-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/40 transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-tamil">
                  <span>{isTa ? 'நேரடி உள்ளீடு:' : 'Direct Input:'}</span>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="1"
                    value={drySpell}
                    onChange={(e) => setDrySpell(parseInt(e.target.value) || 0)}
                    className="w-16 bg-black/60 border border-teal-500/40 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                  />
                  <span>{isTa ? 'நாட்கள்' : 'Days'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setDrySpell((prev) => Math.min(40, prev + 1))}
                  className="p-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/40 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scientific Impact Summary Card */}
            {simResults && (
              <div className="p-4 rounded-2xl bg-black/40 border border-teal-700/40 space-y-3 font-tamil">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {isTa ? 'எதிர்பார்க்கப்படும் மகசூல் இழப்பு (Yield Impact):' : 'Projected Yield Impact:'}
                  </span>
                  <strong className="text-xl font-mono text-rose-400 font-bold">
                    {simResults.simulated.yield_impact_pct}%
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-teal-950/60 rounded-xl border border-teal-800/40">
                    <span className="text-slate-400 block text-[11px]">
                      {isTa ? 'மீதமுள்ள மண் ஈரப்பதம் (Soil Moisture)' : 'Remaining Soil Moisture (மண் ஈரப்பதம்)'}
                    </span>
                    <strong className="text-sm font-bold text-cyan-300 font-mono">
                      {simResults.simulated.soil_moisture_remaining_pct}%
                    </strong>
                  </div>
                  <div className="p-2.5 bg-teal-950/60 rounded-xl border border-teal-800/40">
                    <span className="text-slate-400 block text-[11px]">
                      {isTa ? 'நீர் ஆவியாதல் தேவை (Evapotranspiration - ET₀)' : 'Evapotranspiration (நீர் ஆவியாதல் - ET₀)'}
                    </span>
                    <strong className="text-sm font-bold text-amber-300 font-mono">
                      +{simResults.simulated.evapotranspiration_change_pct}%
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-teal-800/40">
                  <span className="text-slate-400">{isTa ? 'ஆபத்து நிலை:' : 'Risk Level:'}</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {isTa
                      ? (simResults.simulated.risk_level === 'Severe Risk' ? 'கடும் வறட்சி ஆபத்து (Severe Risk)' : simResults.simulated.risk_level === 'Moderate Risk' ? 'மிதமான ஆபத்து (Moderate Risk)' : 'குறைந்த ஆபத்து (Low Risk)')
                      : simResults.simulated.risk_level}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Four-Point Agronomic Scientific Breakdown */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0b271a] border border-teal-600/40 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-teal-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-tamil">
                {isTa ? 'நான்கு அம்ச வேளாண் அறிவியல் விளக்கம்' : 'Four-Point Agronomic Scientific Breakdown'}
              </h2>
              <p className="text-xs text-teal-200/70 font-tamil">
                {isTa
                  ? `உங்கள் நிலப்பரப்பிற்கும் (${standingCrop}) பயிருக்கும் ஏற்ப தமிழ்நாடு வேளாண் பல்கலைக்கழக (TNAU) வழிகாட்டுதல்`
                  : `Tamil Nadu Agricultural University (TNAU) agronomic guidelines tailored for your farmland and ${standingCrop}`}
              </p>
            </div>
          </div>

          <NasaProvenanceBadge category={3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-tamil">
          {/* Card 1: What Changed */}
          <div className="p-4 bg-black/40 rounded-2xl border border-teal-700/40 space-y-1.5">
            <span className="font-bold text-teal-300 text-sm flex items-center gap-1.5">
              <span>📌</span> {isTa ? '1. என்ன மாறியுள்ளது?' : '1. What Changed?'}
            </span>
            <p className="text-slate-200 leading-relaxed">
              {fourPoints.whatChanged}
            </p>
          </div>

          {/* Card 2: Why it matters */}
          <div className="p-4 bg-black/40 rounded-2xl border border-teal-700/40 space-y-1.5">
            <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <span>🌡️</span> {isTa ? '2. இது ஏன் முக்கியமானது?' : '2. Why Does It Matter?'}
            </span>
            <p className="text-slate-200 leading-relaxed">
              {fourPoints.whyMatters}
            </p>
          </div>

          {/* Card 3: Crop Consequence */}
          <div className="p-4 bg-black/40 rounded-2xl border border-teal-700/40 space-y-1.5">
            <span className="font-bold text-rose-300 text-sm flex items-center gap-1.5">
              <span>🌾</span> {isTa ? '3. உங்கள் பயிருக்கு என்ன பாதிப்பு ஏற்படும்?' : '3. What Could Happen to Your Crop?'}
            </span>
            <p className="text-slate-200 leading-relaxed">
              {fourPoints.cropConsequence}
            </p>
          </div>

          {/* Card 4: Farmer Action */}
          <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 space-y-1.5">
            <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
              <span>✅</span> {isTa ? '4. விவசாயி செய்ய வேண்டிய தீர்வுகள்' : '4. Recommended Farmer Action'}
            </span>
            <p className="text-emerald-100 leading-relaxed">
              {fourPoints.farmerAction}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Educational Voice Narrator */}
      {/* ------------------------------------------------------------- */}
      {simResults && (
        <EducationalNarrator
          titleEn="Climate Stress & Practical Adaptation Guidance"
          titleTa="காலநிலை அழுத்தமும் வேளாண்மை தழுவல் வழிகாட்டுதலும்"
          explanationEn={`Under a hypothetical +${tempDelta}°C temperature rise and ${drySpell} days dry spell, crop evapotranspiration increases by ${simResults.simulated.evapotranspiration_change_pct}%, leading to ${Math.abs(simResults.simulated.yield_impact_pct)}% projected yield reduction without adaptive measures.`}
          explanationTa={`வெப்பநிலை +${tempDelta}°C உயர்வு மற்றும் ${drySpell} நாட்கள் தொடர் வறட்சியின் போது, பயிர் நீர் ஆவியாதல் ${simResults.simulated.evapotranspiration_change_pct}% அதிகரிக்கிறது. உரிய தற்காப்பு நடவடிக்கை எடுக்காவிட்டால் மகசூல் ${Math.abs(simResults.simulated.yield_impact_pct)}% குறைய வாய்ப்புள்ளது.`}
          mitigationEn={simResults.recommended_adaptations[0]?.practice_en}
          mitigationTa={simResults.recommended_adaptations[0]?.practice_ta}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. Expandable NASA Data Sources & Methodology Section */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#081f13] border border-teal-800/40 rounded-3xl overflow-hidden shadow-lg transition-all font-tamil">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-teal-900/30 transition text-xs font-semibold text-teal-200"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-bold text-white">{t('simClimate.dataMethodology')}</span>
          </div>
          <div className="flex items-center gap-2 text-teal-300">
            <span>{showMethodology ? (isTa ? 'சுருக்குக' : 'Collapse') : (isTa ? 'விரிவாக்குக' : 'Expand')}</span>
            {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMethodology && (
          <div className="p-6 pt-2 border-t border-teal-800/40 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-teal-700/30 space-y-1">
                <strong className="text-teal-300 font-bold block text-sm">{t('simClimate.observedTitle')}</strong>
                <p className="text-slate-300 leading-relaxed">{t('simClimate.observedDesc')}</p>
                <a
                  href="https://power.larc.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-400 hover:underline inline-flex items-center gap-1 pt-1 font-mono text-[11px]"
                >
                  <span>NASA POWER Official Portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-teal-700/30 space-y-1">
                <strong className="text-amber-300 font-bold block text-sm">{t('simClimate.derivedTitle')}</strong>
                <p className="text-slate-300 leading-relaxed">{t('simClimate.derivedDesc')}</p>
                <span className="text-slate-400 font-mono text-[11px]">FAO-56 Irrigation & Drainage Paper 56 Standards</span>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-teal-700/30 space-y-1">
                <strong className="text-cyan-300 font-bold block text-sm">{t('simClimate.hypotheticalTitle')}</strong>
                <p className="text-slate-300 leading-relaxed">{t('simClimate.hypotheticalDesc')}</p>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-teal-700/30 space-y-1">
                <strong className="text-emerald-300 font-bold block text-sm">{t('simClimate.modelTitle')}</strong>
                <p className="text-slate-300 leading-relaxed">{t('simClimate.modelDesc')}</p>
                <span className="text-slate-400 font-mono text-[11px]">TNAU Agronomy & Agro Climate Research Centre (ACRC)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. Save Scenario Modal */}
      {/* ------------------------------------------------------------- */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0a2316] border border-teal-500/40 rounded-3xl p-6 shadow-2xl space-y-4 font-tamil">
            <h3 className="text-base font-bold text-white">{t('controls.saveScenario')}</h3>
            <p className="text-xs text-slate-300">
              {isTa
                ? 'இந்த உருவகப்படுத்தல் காட்சியை உங்கள் கணக்கில் சேமித்து, பின்னர் பிற காட்சிகளுடன் ஒப்பிட்டுப் பாருங்கள்.'
                : 'Save this climate scenario to compare against other irrigation and crop configurations.'}
            </p>
            <input
              type="text"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              className="w-full bg-black/50 border border-teal-600/50 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-400"
            />
            {savedSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isTa ? 'காட்சி வெற்றிகரமாக சேமிக்கப்பட்டது!' : 'Scenario saved successfully!'}</span>
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
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
                className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
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
