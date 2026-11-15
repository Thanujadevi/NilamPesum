import React from 'react';
import { useTranslation } from 'react-i18next';
import { Satellite, ExternalLink, ShieldCheck, Database, Globe } from 'lucide-react';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';

export const NasaSourcesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const sources = [
    {
      id: 'NASA POWER',
      center: 'NASA Langley Research Center (LaRC)',
      url: 'https://power.larc.nasa.gov/',
      parameters: 'T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, ALLSKY_SFC_SW_DWN',
      resolution: '0.5° x 0.625° (~50km)',
      coverage: '1981 - Present (~43 Years)',
      desc: isTamil
        ? 'அக்ரோக்ளைமடாலஜி மற்றும் சூரிய கதிர்வீச்சு மாதிரியாக்கத்திற்கான நாசாவின் முதன்மை வானிலை சேவை. தினசரி வெப்பநிலை மற்றும் மழைப்பொழிவை வழங்குகிறது.'
        : 'Primary NASA agroclimatology & solar radiation service. Provides solar irradiance, daily temperatures, and precipitation for agricultural modeling.'
    },
    {
      id: 'NASA GPM IMERG',
      center: 'NASA Goddard Space Flight Center (GSFC)',
      url: 'https://gpm.nasa.gov/data/imerg',
      parameters: 'Precipitation Cal (mm/hr & mm/day), Heavy Rainfall Frequency',
      resolution: '0.1° x 0.1° (~10km)',
      coverage: '2000 - Present',
      desc: isTamil
        ? 'செயற்கைக்கோள் விண்மீன் தொகுதிகள் மூலம் பெறப்படும் துல்லியமான மழைப்பொழிவு பதிவுகள். வறட்சி மற்றும் அதிக மழைப்பொழிவு வெள்ள அபாயத்தைக் கண்காணிக்கிறது.'
        : 'Constellation satellite precipitation measurements combining microwave and infrared observations for rainfall and flood risk analysis.'
    },
    {
      id: 'NASA SMAP',
      center: 'NASA Jet Propulsion Laboratory (JPL) / NSIDC',
      url: 'https://nsidc.org/data/smap',
      parameters: 'Surface Soil Moisture (0-5cm), Root-Zone Soil Moisture (0-100cm L4)',
      resolution: '9 km / 36 km',
      coverage: '2015 - Present',
      desc: isTamil
        ? 'L-band ரேடியோமீட்டர் மூலம் விண்வெளியில் இருந்து அளவிடப்படும் மண் ஈரப்பதம். பருமனளவு ஈரப்பதக் குறியீடு (Volumetric cm³/cm³).'
        : 'Spaceborne L-band radiometer measuring topsoil surface (0-5cm) and assimilated root-zone (0-100cm) volumetric moisture.'
    },
    {
      id: 'NASA MODIS',
      center: 'NASA Land Processes DAAC (LP DAAC) / GSFC',
      url: 'https://modis.gsfc.nasa.gov/data/',
      parameters: 'NDVI (Normalized Difference Vegetation Index), EVI (Enhanced Vegetation Index)',
      resolution: '250 meters',
      coverage: '2000 - Present',
      desc: isTamil
        ? 'டெர்ரா மற்றும் அக்வா செயற்கைக்கோள்கள் மூலம் 16 நாட்களுக்கு ஒருமுறை கணக்கிடப்படும் பயிர் பசுமை மற்றும் தழையமைப்பு குறியீடுகள்.'
        : 'Terra and Aqua 250m 16-day composites providing calibrated NDVI and EVI vegetation health trajectories.'
    },
    {
      id: 'NASA HLS',
      center: 'NASA GSFC / LP DAAC (Earthdata Cloud)',
      url: 'https://hls.gsfc.nasa.gov/',
      parameters: 'Harmonized Surface Reflectance (Landsat 8/9 + Sentinel-2A/2B)',
      resolution: '30 meters (Field Scale)',
      coverage: '2013 - Present',
      desc: isTamil
        ? 'நாசா மற்றும் ஐரோப்பிய விண்வெளி முகமையின் (ESA) ஆப்டிகல் செயற்கைக்கோள்களை ஒருங்கிணைத்து வழங்கப்படும் 30 மீட்டர் உயர் தெளிவுத்திறன் நிலப்பகுதி அளவீடு.'
        : 'Seamless 30-meter virtual constellation surface reflectance from Landsat 8/9 and Sentinel-2 for farm field-scale analysis.'
    },
    {
      id: 'NASA MERRA-2',
      center: 'NASA Global Modeling and Assimilation Office (GMAO)',
      url: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/',
      parameters: 'Atmospheric Evaporative Demand (ETo), Climatological Normals',
      resolution: '0.5° x 0.625°',
      coverage: '1980 - Present',
      desc: isTamil
        ? 'விண்வெளி அவதானிப்புகளை வளிமண்டல மாதிரிகளுடன் இணைக்கும் நவீன மறுபகுப்பாய்வு தயாரிப்பு (Atmospheric Reanalysis).'
        : 'Atmospheric reanalysis coupling modern numerical models with space-based observations of moisture, aerosol, and temperature.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <NasaProvenanceBadge category={1} />
          <span className="text-xs text-forest-700 font-bold uppercase tracking-wider">
            {isTamil ? 'அதிகாரப்பூர்வ நாசா புவி அறிவியல் கொள்கை' : 'Official NASA Earth Science Data Policy'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-forest-950 font-tamil">
          {isTamil ? 'நாசா தரவு ஆதாரங்கள் & அறிவியல் வெளிப்படைத்தன்மை' : 'NASA Data Sources & Scientific Provenance'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-tamil">
          {isTamil
            ? 'நிலம் பேசும் தளம் நாசா புவி அறிவியல் தரவு அமைப்புகளை மட்டுமே தனது சுற்றுச்சூழல் ஆய்வுகளுக்கு முதன்மையாகப் பயன்படுத்துகிறது. மூன்றாம் தரப்பு போலி வானிலை API-கள் அல்லது கற்பனை மாதிரிகள் இங்கு அனுமதிக்கப்படுவதில்லை.'
            : 'NILAM PESUM exclusively uses authentic NASA Earth Observation data products and validated TNAU agronomic standards. Synthetic mockups or unverified third-party APIs are strictly forbidden.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-extrabold text-base text-slate-900">{s.id}</h3>
                <a href={s.url} target="_blank" rel="noreferrer" className="text-forest-700 hover:text-forest-900 flex items-center gap-1 text-xs font-semibold">
                  <span>{isTamil ? 'அதிகாரப்பூர்வ தளம்' : 'Official Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-400">{s.center}</p>
              <p className="text-xs text-slate-700 font-tamil leading-relaxed">{s.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl font-tamil">
              <p>{isTamil ? 'அளவுருக்கள்:' : 'Parameters:'} <strong className="font-mono text-[11px] text-slate-800">{s.parameters}</strong></p>
              <p>{isTamil ? 'தீர்மானம் (Resolution):' : 'Resolution:'} <strong>{s.resolution}</strong></p>
              <p>{isTamil ? 'வரலாற்றுப் பதிவு:' : 'Temporal Coverage:'} <strong>{s.coverage}</strong></p>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Categories Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base font-tamil">
          {isTamil ? 'எங்கள் தளத்தின் 4 தரவு வகைப்பாடுகள் (Strict 4 Data Categories):' : 'Strict 4-Tier Data Classification System:'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <strong className="text-emerald-900 block font-bold font-tamil">
              {isTamil ? 'வகை 1 – நாசா நேரடி மூலத் தரவு:' : 'Category 1 – NASA Direct Observations:'}
            </strong>
            <p className="text-emerald-800 font-tamil">
              {isTamil
                ? 'நாசா செயற்கைக்கோள்கள் மற்றும் மாதிரியாக்க அமைப்புகளிலிருந்து நேரடியாகப் பெறப்பட்ட மாற்றப்படாத அளவீடுகள்.'
                : 'Raw, unmanipulated observations directly sourced from NASA satellites (POWER, GPM, SMAP, MODIS, HLS).'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
            <strong className="text-blue-900 block font-bold font-tamil">
              {isTamil ? 'வகை 2 – கணக்கிடப்பட்ட குறிகாட்டிகள்:' : 'Category 2 – Calculated Indicators:'}
            </strong>
            <p className="text-blue-800 font-tamil">
              {isTamil
                ? 'மழைப்பொழிவு பற்றாக்குறை விகிதம், NDVI வளர்ச்சிப் போக்கு மற்றும் நில ஆரோக்கிய மதிப்பீடு.'
                : 'Scientific indicators such as rainfall deficit index, NDVI trajectory, and transparent land health score.'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <strong className="text-amber-900 block font-bold font-tamil">
              {isTamil ? 'வகை 3 – வேளாண் பயிர் பரிந்துரைகள்:' : 'Category 3 – Agronomic Advisories:'}
            </strong>
            <p className="text-amber-800 font-tamil">
              {isTamil
                ? 'தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழக (TNAU) விதிகள் சார்ந்த பயிர் சுழற்சி உத்திகள்.'
                : 'Explainable crop rotation recommendation plans adhering to Tamil Nadu Agricultural University rules.'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
            <strong className="text-purple-900 block font-bold font-tamil">
              {isTamil ? 'வகை 4 – மாதிரி காலநிலை சோதனைகள்:' : 'Category 4 – Simulated Scenarios:'}
            </strong>
            <p className="text-purple-800 font-tamil">
              {isTamil
                ? 'மழை குறைவு அல்லது வெப்ப உயர்வு ஏற்படும் போது பயிர் எவ்வாறு தாங்கும் என்ற மாதிரி பகுப்பாய்வு.'
                : 'Interactive visual models simulating drought, flood, drip irrigation, and climate stress on crops.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
