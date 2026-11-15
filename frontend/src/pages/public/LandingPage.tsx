import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Satellite, Droplets, CloudRain, Compass, Mic, History,
  ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Activity, Leaf, Layers,
  Sparkles, Sun, Flame, Wind, Play, Globe, UserCheck, Shield
} from 'lucide-react';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const keyFeatures = [
    {
      title: 'தமிழ் குரல் வழி விவசாயி பதிவு',
      titleEn: 'Tamil Voice-Guided Registration',
      desc: 'நீண்ட படிவங்கள் இல்லாமல், உங்கள் தாய்மொழியான தமிழில் பேசியே நிலம், பயிர், பாசனம் மற்றும் மண் விவரங்களை எளிமையாக பதிவு செய்யுங்கள்.',
      descEn: 'Register farmland, crops, soil, and irrigation naturally through an interactive Tamil voice assistant without tedious typing.',
      icon: Mic,
      color: 'bg-amber-500/10 text-amber-700 border-amber-200',
      badge: 'Voice AI'
    },
    {
      title: 'விவசாய அனுபவ உலகம் (Visual Farm Simulation)',
      titleEn: 'Visual Farm Simulation World',
      desc: 'நேரடி களத்தில் பணத்தை செலவழிக்கும் முன், 2.5D/3D சூழலில் காலநிலை மாற்றம், சொட்டுநீர்ப் பாசனம், மற்றும் பயிர் சுழற்சியை உருவகப்படுத்தி சோதியுங்கள்.',
      descEn: 'Simulate climate shifts, drip vs flood irrigation, and crop rotations in rich 2.5D/3D before investing capital in the field.',
      icon: Sparkles,
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      badge: '3D Simulation'
    },
    {
      title: 'நாசா நேரடி செயற்கைக்கோள் தரவுகள்',
      titleEn: 'NASA Satellite Observations',
      desc: 'NASA POWER, GPM, SMAP மற்றும் MODIS மூலம் உங்கள் நிலத்திற்கான உண்மையான மழைப்பொழிவு, வெப்பநிலை, மண் ஈரப்பதம் மற்றும் பயிர் பசுமை.',
      descEn: 'Direct NASA observations for rainfall, thermal profiles, topsoil/root-zone moisture, and 250m calibrated vegetation indices.',
      icon: Satellite,
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
      badge: 'NASA Earthdata'
    },
    {
      title: 'TNAU பயிர் சுழற்சி வழிகாட்டல்',
      titleEn: 'Explainable Crop Rotation Engine',
      desc: 'தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழக (TNAU) விதிகள் மற்றும் நீர் வரத்து அடிப்படையில் மண்ணை வளப்படுத்தும் 3 முதல் 5 பயிர் சுழற்சி திட்டங்கள்.',
      descEn: 'Multi-season rotation plans grounded in Tamil Nadu Agricultural University agronomic matrix and moisture thresholds.',
      icon: Compass,
      color: 'bg-leaf-500/10 text-leaf-700 border-leaf-200',
      badge: 'TNAU & ICAR'
    },
    {
      title: '10 ஆண்டு காலநிலை வரலாற்று ஆய்வு',
      titleEn: '10-Year Decadal Climate Trends',
      desc: 'உங்கள் பண்ணையின் புவி ஆயத்தொலைவுகளில் கடந்த 10 ஆண்டுகளில் பதிவான மழை மாற்றங்கள், வெப்ப அலைகள் மற்றும் வடகிழக்கு பருவமழை போக்கு.',
      descEn: 'Ten years of historical meteorological baseline observations tracking monsoon shifts and extreme heat trends.',
      icon: History,
      color: 'bg-purple-500/10 text-purple-700 border-purple-200',
      badge: '2015-2025'
    },
    {
      title: 'வெளிப்படையான நில ஆரோக்கிய மதிப்பீடு',
      titleEn: 'Transparent Land Health Score',
      desc: 'மழை (30%), வெப்பநிலை (20%), மண் ஈரப்பதம் (30%) மற்றும் பசுமை (20%) ஆகியவற்றின் கூட்டு அறிவியல் குறியீடாக 0-100 அளவிலான மதிப்பீடு.',
      descEn: 'A transparent composite score (0-100) combining rainfall, temperature, SMAP moisture, and MODIS vegetation health.',
      icon: Activity,
      color: 'bg-teal-500/10 text-teal-700 border-teal-200',
      badge: '0-100 Score'
    }
  ];

  const nasaSources = [
    {
      name: 'NASA POWER',
      desc: isTamil ? 'தினசரி வெப்பநிலை, சூரிய கதிர்வீச்சு மற்றும் மழைப்பொழிவு' : 'Daily surface temperature, solar irradiance & precipitation',
      res: '0.5° (~50km)'
    },
    {
      name: 'NASA GPM IMERG',
      desc: isTamil ? 'செயற்கைக்கோள் மழைப்பொழிவு மற்றும் வறட்சி கண்காணிப்பு' : 'Constellation satellite precipitation & drought monitoring',
      res: '0.1° (~10km)'
    },
    {
      name: 'NASA SMAP',
      desc: isTamil ? 'மேல்மண் மற்றும் ரூட்-மண்டல மண் ஈரப்பதம்' : 'Surface (0-5cm) & root-zone (0-100cm) soil moisture',
      res: '9km / 36km'
    },
    {
      name: 'NASA MODIS',
      desc: isTamil ? '250m பயிர் பசுமைக் குறியீடுகள் (NDVI & EVI)' : '250m calibrated NDVI & EVI vegetation trajectories',
      res: '250 meters'
    },
    {
      name: 'NASA HLS',
      desc: isTamil ? '30m உயர் துல்லிய நிலப்பரப்பு மற்றும் பயிர் எல்லை ஆய்வு' : '30-meter field-scale harmonized surface reflectance',
      res: '30 meters'
    },
    {
      name: 'NASA MERRA-2',
      desc: isTamil ? 'நீண்டகால வளிமண்டல மறுபகுப்பாய்வு மற்றும் ஆவியாதல் தேவை' : 'Atmospheric reanalysis and long-term evaporative demand',
      res: '0.5° x 0.625°'
    }
  ];

  return (
    <div className="min-h-screen bg-cream-50 text-slate-800 flex flex-col font-sans selection:bg-leaf-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="bg-forest-900 border-b border-forest-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="Nilam Pesum" className="w-10 h-10 drop-shadow" />
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight font-tamil text-white">நிலம் பேசும்</span>
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-leaf-600/90 text-white tracking-wider uppercase">
                NILAM PESUM
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-cream-200">
            <Link to="/farmer-registration" className="text-leaf-300 hover:text-white transition flex items-center gap-1 font-bold">
              <Mic className="w-3.5 h-3.5" />
              <span>{isTamil ? 'விவசாயி பதிவு (Voice)' : 'Voice Registration'}</span>
            </Link>
            <Link to="/simulation-world" className="hover:text-white transition flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTamil ? 'அனுபவ உலகம் (3D)' : '3D Farm Simulation'}</span>
            </Link>
            <Link to="/nasa-data-sources" className="hover:text-white transition">
              {isTamil ? 'நாசா தரவு ஆதாரங்கள்' : 'NASA Data Sources'}
            </Link>
            <Link to="/methodology" className="hover:text-white transition">
              {isTamil ? 'பரிந்துரை முறையியல்' : 'Methodology'}
            </Link>
            <Link to="/officer" className="hover:text-white transition">
              {isTamil ? 'வேளாண் அலுவலர்' : 'Officer Portal'}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => i18n.changeLanguage(isTamil ? 'en' : 'ta')}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-leaf-500/40 bg-leaf-900/60 text-leaf-300 hover:bg-leaf-800 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              title={isTamil ? "Switch to English" : "தமிழுக்கு மாறவும்"}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isTamil ? 'English' : 'தமிழ்'}</span>
            </button>

            <Link
              to="/login"
              className="text-xs font-semibold text-cream-100 hover:text-white px-3 py-1.5 rounded-lg border border-forest-700 bg-forest-800/80 transition"
            >
              {isTamil ? 'உள்நுழைக' : 'Sign In'}
            </Link>

            <Link
              to="/farmer-registration"
              className="bg-leaf-600 hover:bg-leaf-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">{isTamil ? 'விவசாயி பதிவு' : 'Farmer Registration'}</span>
              <span className="sm:hidden">{isTamil ? 'பதிவு' : 'Register'}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-950 via-forest-900 to-forest-850 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7bc863_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-leaf-500/20 border border-leaf-400/40 text-leaf-300 text-xs font-semibold shadow-inner">
            <Satellite className="w-4 h-4" />
            <span>{isTamil ? 'நாசா புவி அறிவியல் & தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம்' : 'NASA Earth Science & TNAU Agricultural Standards'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-tamil text-white">
            {isTamil ? (
              <>
                உங்கள் நிலம் பேசட்டும். <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-400 via-emerald-300 to-amber-300">
                  நாசா தரவுகள் வழிகாட்டட்டும்.
                </span>
              </>
            ) : (
              <>
                Let Your Land Speak. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-400 via-emerald-300 to-amber-300">
                  Let NASA Data Guide Your Farming.
                </span>
              </>
            )}
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-cream-100 leading-relaxed font-tamil">
            {isTamil ? (
              'தமிழ்நாட்டு விவசாயிகளுக்காக உருவாக்கப்பட்ட செயற்கை நுண்ணறிவு மற்றும் நாசா செயற்கைக்கோள் நில ஆய்வகம். உங்கள் தாய்மொழியான தமிழில் பேசியே நிலத்தைப் பதிவு செய்து, காலநிலை மாற்றம் மற்றும் பாசன முடிவுகளை முன்கூட்டியே சோதித்துப் பாருங்கள்.'
            ) : (
              'NASA satellite intelligence and AI agricultural advisory engineered specifically for Tamil Nadu farmers. Register your farmland simply by speaking in your native language, and simulate climate resilience, irrigation, and crop rotation before investing in the field.'
            )}
          </p>

          {/* Dual Action CTAs: Distinct Farmer Registration & Login */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/farmer-registration"
              className="w-full sm:w-auto px-8 py-4 bg-leaf-600 hover:bg-leaf-500 text-white text-base font-bold rounded-2xl shadow-xl shadow-leaf-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="font-tamil">{isTamil ? 'விவசாயி பதிவு (குரல் வழி)' : 'Voice Farmer Registration'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-4 bg-forest-800 hover:bg-forest-700 text-cream-100 border border-forest-600 text-base font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>{isTamil ? 'ஏற்கனவே பதிந்தவரா? உள்நுழைக' : 'Already Registered? Sign In'}</span>
            </Link>

            <Link
              to="/simulation-world"
              className="w-full sm:w-auto px-6 py-4 bg-cream-100/10 hover:bg-cream-100/20 text-cream-200 border border-cream-200/20 text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isTamil ? 'விவசாய மாதிரி உலகம் (3D)' : 'Farm Simulation (3D)'}</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-forest-800/80 text-left font-tamil">
            <div className="p-3 bg-forest-900/60 rounded-xl border border-forest-800">
              <span className="text-[11px] text-cream-300 block">{isTamil ? 'முழுமையான தரவு ஆதாரம்' : 'Data Integrity'}</span>
              <strong className="text-sm font-bold text-white">100% NASA Earth Science</strong>
            </div>
            <div className="p-3 bg-forest-900/60 rounded-xl border border-forest-800">
              <span className="text-[11px] text-cream-300 block">{isTamil ? 'பயிர் பரிந்துரை விதிகள்' : 'Agronomic Standards'}</span>
              <strong className="text-sm font-bold text-white">TNAU & ICAR</strong>
            </div>
            <div className="p-3 bg-forest-900/60 rounded-xl border border-forest-800">
              <span className="text-[11px] text-cream-300 block">{isTamil ? 'மொழி அனுபவம்' : 'Language Interface'}</span>
              <strong className="text-sm font-bold text-white">{isTamil ? 'தமிழ் குரல் வழி பதிவு' : 'Tamil Voice AI'}</strong>
            </div>
            <div className="p-3 bg-forest-900/60 rounded-xl border border-forest-800">
              <span className="text-[11px] text-cream-300 block">{isTamil ? 'மாதிரி உருவகப்படுத்துதல்' : 'Simulation Engine'}</span>
              <strong className="text-sm font-bold text-white">{isTamil ? '6 மாதிரி சோதனைகள்' : '6 Interactive Scenarios'}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Farmer Voice Registration Banner Highlight */}
      <section className="max-w-6xl w-full mx-auto -mt-8 relative z-20 px-4">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-300 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <Mic className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest-900 font-tamil">
                  {isTamil ? 'விவசாயிகளுக்கு பிரத்யேகமான குரல் வழி பதிவு' : 'Dedicated Voice Registration for Farmers'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-leaf-100 text-leaf-800 text-[10px] font-bold">
                  Voice AI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-tamil">
                {isTamil
                  ? 'உதவியாளர் நிலா உங்களிடம் தமிழில் கேள்விகள் கேட்பார். நீங்கள் பேசும் பதில்களை தானாக புரிந்து கொண்டு உங்கள் நிலம், பயிர் மற்றும் பாசன விவரங்களை துல்லியமாக பதிவு செய்வார்.'
                  : 'Assistant Nila will converse naturally in Tamil or English to accurately record your land area, crops, irrigation type, and soil texture without typing.'}
              </p>
            </div>
          </div>

          <Link
            to="/farmer-registration"
            className="shrink-0 px-6 py-3 bg-forest-800 hover:bg-forest-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 font-tamil"
          >
            <span>{isTamil ? 'பதிவைத் தொடங்குக' : 'Start Voice Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Visual Simulation World Feature Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isTamil ? 'விவசாய அனுபவ உலகம் (Interactive 2.5D / 3D Simulation)' : 'Visual Farm Simulation World'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-900 font-tamil">
            {isTamil ? 'விவசாய முடிவுகளை முன்கூட்டியே உருவகப்படுத்தி பாருங்கள்' : 'Simulate Farming Decisions Before You Invest'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-tamil">
            {isTamil
              ? 'காலநிலை மாற்றம், சொட்டுநீர்ப் பாசனம், வெள்ளம் மற்றும் பயிர் சுழற்சி சூழல்களை உங்கள் நிலத்தின் ஆயத்தொலைவுகளுடன் ஒத்திசைத்து சோதியுங்கள்.'
              : 'Test climate volatility, smart irrigation, flood defense, and multi-season crop rotation against your farm\'s authentic coordinates.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-sm space-y-3 hover:border-emerald-500/50 transition">
            <div className="p-3 w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-900 font-tamil">
              {isTamil ? 'காலநிலை & வெப்ப அழுத்தம்' : 'Climate & Heat Stress'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-tamil">
              {isTamil
                ? 'வெப்பநிலை +2°C உயர்ந்தால் பயிரின் இலைகள் வாடுவதையும், நீர் தேவை அதிகரிப்பதையும் நேரடி 2.5D அனிமேஷனில் பாருங்கள்.'
                : 'Watch crops visually respond as temperatures rise +2°C and drought limits soil moisture in an interactive 2.5D field.'}
            </p>
            <Link to="/simulation-world/climate-change" className="text-xs font-bold text-leaf-700 flex items-center gap-1 hover:underline pt-2 font-tamil">
              <span>{isTamil ? 'சோதனை செய்து பார்' : 'Explore Simulator'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-sm space-y-3 hover:border-cyan-500/50 transition">
            <div className="p-3 w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-900 font-tamil">
              {isTamil ? '3D மண் வெட்டுத்தோற்ற பாசனம்' : '3D Soil Cross-Section & Irrigation'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-tamil">
              {isTamil
                ? 'பயிரின் வேர் பகுதி, மேல்மண், அடிமண் மற்றும் நீர் கசிவை 3D மண் வெட்டுத்தோற்றத்தில் சொட்டுநீர் மற்றும் வாய்க்கால் பாசனத்துடன் ஒப்பிடுங்கள்.'
                : 'Compare drip vs flood irrigation across topsoil and root-zone layers in an interactive 3D geologic cross-section.'}
            </p>
            <Link to="/simulation-world/smart-irrigation" className="text-xs font-bold text-leaf-700 flex items-center gap-1 hover:underline pt-2 font-tamil">
              <span>{isTamil ? 'சோதனை செய்து பார்' : 'Explore Simulator'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-sm space-y-3 hover:border-leaf-500/50 transition">
            <div className="p-3 w-12 h-12 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-forest-900 font-tamil">
              {isTamil ? 'பல் பருவ பயிர் சுழற்சி மாதிரி' : 'Multi-Season Rotation Simulator'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-tamil">
              {isTamil
                ? 'பயறுவகை பயிர்கள் மண்ணில் நைட்ரஜனை நிலைநிறுத்துவதையும், மண் கரிம சத்து பெருகுவதையும், ஆண்டு வருமானத்தையும் நேரலையில் கணக்கிடுங்கள்.'
                : 'Simulate nitrogen fixation from pulses, organic carbon buildup, and net farmer profitability across multiple seasons.'}
            </p>
            <Link to="/simulation-world/crop-rotation" className="text-xs font-bold text-leaf-700 flex items-center gap-1 hover:underline pt-2 font-tamil">
              <span>{isTamil ? 'சோதனை செய்து பார்' : 'Explore Simulator'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 Key Capabilities Grid */}
      <section className="py-16 bg-cream-100/60 border-y border-cream-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 font-tamil">
              {isTamil ? 'நாசா புவி அறிவியல் சார்ந்த துல்லிய வேளாண் தொழில்நுட்பங்கள்' : 'NASA Earth Observation Precision Agriculture Technologies'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-tamil">
              {isTamil
                ? 'விவசாயிகளுக்கு வெளிப்படையான, நம்பகமான முடிவெடுக்கும் ஆதரவை வழங்கும் 6 முக்கிய தூண்கள்.'
                : 'Six core pillars delivering transparent, verifiable decision support for Tamil Nadu farmers.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-cream-300 shadow-sm space-y-3 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border ${f.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cream-100 text-slate-600 border border-cream-300">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-forest-900 font-tamil">
                    {isTamil ? f.title : f.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-tamil">
                    {isTamil ? f.desc : f.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NASA Data Sources Transparency Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-leaf-700 uppercase tracking-wider block mb-1">
              Data Provenance & Scientific Rigor
            </span>
            <h2 className="text-2xl font-bold text-forest-900 font-tamil">
              {isTamil ? 'அங்கீகரிக்கப்பட்ட நாசா தரவு ஆதாரங்கள்' : 'Authentic NASA Earth Science Data Products'}
            </h2>
          </div>
          <Link
            to="/nasa-data-sources"
            className="text-xs font-semibold text-leaf-700 hover:text-leaf-800 flex items-center gap-1 font-tamil"
          >
            <span>{isTamil ? 'முழு விவரங்களையும் பார்க்க' : 'View Full Specifications'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nasaSources.map((s) => (
            <div key={s.name} className="p-4 rounded-xl bg-white border border-cream-300 shadow-sm space-y-1.5 font-tamil">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-bold text-forest-900">{s.name}</strong>
                <span className="text-[11px] font-mono text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-md border border-leaf-200">
                  {s.res}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comprehensive Agricultural Footer */}
      <footer className="bg-forest-950 text-cream-200 border-t border-forest-900 py-12 px-4 sm:px-6 lg:px-8 font-tamil">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Nilam Pesum" className="w-8 h-8" />
              <span className="font-bold text-base text-white">{isTamil ? 'நிலம் பேசும்' : 'NILAM PESUM'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isTamil
                ? 'நாசா புவி அறிவியல் மற்றும் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழக பரிந்துரைகள் மூலம் விவசாயிகளுக்கான முடிவு வழிகாட்டி தளம்.'
                : 'A scientific agricultural intelligence decision-support platform powered by NASA Earth observations and TNAU agronomic rules.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {isTamil ? 'விவசாயி சேவைகள்' : 'Farmer Portals'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/farmer-registration" className="hover:text-white">{isTamil ? 'குரல் வழி விவசாயி பதிவு' : 'Voice Registration'}</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">{isTamil ? 'பண்ணை முகப்பு பலகை' : 'Farmer Dashboard'}</Link></li>
              <li><Link to="/farmer/plots" className="hover:text-white">{isTamil ? 'நில உட்பிரிவு மேலாண்மை' : 'Plot Sub-Divisions'}</Link></li>
              <li><Link to="/farmer/recommendations" className="hover:text-white">{isTamil ? 'பயிர் சுழற்சி பரிந்துரைகள்' : 'Crop Recommendations'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {isTamil ? 'அனுபவ உலகம்' : 'Simulations'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/simulation-world/climate-change" className="hover:text-white">{isTamil ? 'காலநிலை உருவகப்படுத்துதல்' : 'Climate Volatility'}</Link></li>
              <li><Link to="/simulation-world/smart-irrigation" className="hover:text-white">{isTamil ? '3D மண் வெட்டுத்தோற்ற பாசனம்' : '3D Soil Moisture'}</Link></li>
              <li><Link to="/simulation-world/crop-rotation" className="hover:text-white">{isTamil ? 'பயிர் சுழற்சி மாதிரி' : 'Crop Rotation Simulation'}</Link></li>
              <li><Link to="/simulation-world/flood-drought" className="hover:text-white">{isTamil ? 'வெள்ளம் & வறட்சி தற்காப்பு' : 'Flood & Drought Defense'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {isTamil ? 'நாசா & அரசுத் தொடர்புகள்' : 'Scientific Links'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="https://power.larc.nasa.gov/" target="_blank" rel="noreferrer" className="hover:text-white">NASA POWER API</a></li>
              <li><a href="https://gpm.nasa.gov/data/imerg" target="_blank" rel="noreferrer" className="hover:text-white">NASA GPM IMERG</a></li>
              <li><a href="https://nsidc.org/data/smap" target="_blank" rel="noreferrer" className="hover:text-white">NASA SMAP Soil Moisture</a></li>
              <li><a href="https://tnau.ac.in/" target="_blank" rel="noreferrer" className="hover:text-white">TNAU Agronomic Matrix</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-forest-900 text-center text-xs text-slate-500">
          <p>© 2026 NILAM PESUM (நிலம் பேசும்) • Tamil Nadu Agricultural Intelligence Platform • Grounded in NASA Earth Science</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
