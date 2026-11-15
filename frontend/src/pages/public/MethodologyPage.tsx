import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle2, ShieldCheck, Scale, Cpu } from 'lucide-react';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';

export const MethodologyPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <NasaProvenanceBadge category={3} />
          <span className="text-xs text-forest-700 font-bold uppercase tracking-wider font-tamil">
            {isTamil ? 'வேளாண் முறையியல்' : 'Agronomic Methodology'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-forest-950 font-tamil">
          {isTamil ? 'பயிர் சுழற்சி பரிந்துரை முறையியல்' : 'Crop Rotation Recommendation Methodology'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-tamil">
          {isTamil
            ? 'தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழக (TNAU) மற்றும் இந்திய வேளாண் ஆராய்ச்சிக் கழகத்தின் (ICAR) அறிவியல் விதிகளின் அடிப்படையில் பயிர் சுழற்சி திட்டங்கள் கணக்கிடப்படுகின்றன.'
            : 'Crop rotation plans and agro-ecological suitability algorithms are grounded directly in Tamil Nadu Agricultural University (TNAU) and ICAR agronomic rules.'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-lg font-tamil">
          {isTamil ? 'பயிர் சுழற்சி பொருத்தக் குறியீட்டின் 4 பரிமாணங்கள்' : 'The 4 Dimensions of the Crop Suitability Score'}
        </h3>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-tamil">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 text-sm font-bold block font-tamil">
              {isTamil ? '1. காலநிலை பொருத்தம் (Climate Suitability - 25%):' : '1. Climate Suitability (25%):'}
            </strong>
            <p>
              {isTamil
                ? 'நாசா POWER தினசரி வெப்பநிலை பதிவுகள் (T2M) பயிரின் உகந்த வளர்ச்சி வரம்புடன் (Optimal Thermal Range) ஒப்பிடப்படுகிறது.'
                : 'NASA POWER daily temperature records (T2M) are compared against the biological thermal thresholds of the candidate crop.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 text-sm font-bold block font-tamil">
              {isTamil ? '2. நீர் இருப்பு & மழைப் பொருத்தம் (Water Availability - 30%):' : '2. Water Availability & Rainfall Match (30%):'}
            </strong>
            <p>
              {isTamil
                ? 'பயிரின் மொத்த நீர் தேவை (Water Requirement in mm) நிலத்தின் பாசன உள்கட்டமைப்பு (கால்வாய், ஆழ்துளை கிணறு, மானாவாரி) மற்றும் வரலாற்று மழைப்பொழிவு அடிப்படையில் மதிப்பீடு செய்யப்படுகிறது.'
                : 'Total crop evapotranspiration demand (mm) is matched against the farm\'s irrigation type (canal, borewell, rainfed) and SMAP root-zone moisture.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 text-sm font-bold block font-tamil">
              {isTamil ? '3. மண் வகைப் பொருத்தம் (Soil Matching - 25%):' : '3. Soil Type & Texture Matching (25%):'}
            </strong>
            <p>
              {isTamil
                ? 'விவசாயியின் மண் வகை (வண்டல், செம்மண், கரிசல்) மற்றும் pH அமிலத்தன்மை நிலைக்கு ஏற்ப பயிர் வேர் ஊடுருவல் திறன் கணக்கிடப்படுகிறது.'
                : 'Evaluates root penetration, drainage capacity, and organic matter affinity across alluvial, red loam, and black cotton soils.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 text-sm font-bold block font-tamil">
              {isTamil ? '4. பயிர் சுழற்சி இணக்கத்தன்மை (Crop Rotation Compatibility - 20%):' : '4. Crop Rotation Compatibility (20%):'}
            </strong>
            <p>
              {isTamil
                ? 'முந்தைய பயிர் அதிக சத்து உறிஞ்சும் பயிராக இருந்தால் (எ.கா. நெல், மக்காச்சோளம்), அடுத்த பயிராக தழைச்சத்து நிலைநிறுத்தும் பயறு வகைகள் (உளுந்து, பாசிப்பயறு) பரிந்துரைக்கப்பட்டு கூடுதல் மதிப்பெண் வழங்கப்படுகிறது.'
                : 'Heavy nitrogen feeders (paddy, maize) are sequentially followed by nitrogen-fixing legumes (black gram, green gram) for soil fertility restoration.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-tamil leading-relaxed">
          <strong>{isTamil ? 'முக்கிய வரம்பு:' : 'Important Disclaimer:'}</strong>{' '}
          {isTamil
            ? 'பயிர் பொருத்தக் குறியீடு என்பது சாகுபடிக்கான சாதகமான சூழலைக் குறிக்கும் வழிகாட்டியே தவிர, இறுதி மகசூல் அல்லது சந்தை விலைக்கான உத்தரவாதம் அல்ல.'
            : 'The suitability score is an agro-scientific decision-support guide for resource optimization, not a commercial yield or market price guarantee.'}
        </div>
      </div>
    </div>
  );
};
