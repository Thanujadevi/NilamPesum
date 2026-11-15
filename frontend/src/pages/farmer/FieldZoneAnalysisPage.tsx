import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { Layers, MapPin, Droplets, Leaf } from 'lucide-react';
import { FarmlandMap } from '../../components/maps/FarmlandMap';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';

export const FieldZoneAnalysisPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();

  if (!selectedFarmland) return null;

  const demoZones = [
    {
      name: isTamil ? 'வடக்கு நன்செய் பகுதி' : 'North Wet Sector',
      area: isTamil ? '2.0 ஏக்கர்' : '2.0 Acres',
      elevation: isTamil ? 'பள்ள பகுதி (Low-lying)' : 'Low-lying',
      soil: isTamil ? 'களிமண் வண்டல் (Alluvial Clay)' : 'Heavy Alluvial Clay',
      moisture: '28% (High)',
      ndvi: 0.65,
      recommendation: isTamil
        ? 'சம்பா நெல் சாகுபடிக்கு மிகவும் ஏற்ற பகுதி; தண்ணீர் தேங்கும் தன்மை கொண்டது.'
        : 'Ideal for Samba paddy cultivation with high water retention capacity.'
    },
    {
      name: isTamil ? 'தெற்கு மேட்டு பகுதி' : 'South High Sector',
      area: isTamil ? '1.5 ஏக்கர்' : '1.5 Acres',
      elevation: isTamil ? 'மேட்டு நிலம் (Elevated)' : 'Slightly Elevated',
      soil: isTamil ? 'மணல் கலந்த செம்மண் (Sandy Loam)' : 'Sandy Clay Loam',
      moisture: '21% (Moderate)',
      ndvi: 0.52,
      recommendation: isTamil
        ? 'நீர் எளிதில் வடியும்; கேழ்வரகு அல்லது உளுந்து விதைப்புக்கு உகந்தது.'
        : 'Well-draining zone suitable for millets (Ragi) or Black Gram.'
    }
  ];

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
            {t('fieldZonesPage.title')}
          </h1>
          <NasaProvenanceBadge category={1} sourceText="NASA HLS 30m" />
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
          {t('fieldZonesPage.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm font-tamil">{t('fieldZonesPage.farmMap')}</h3>
          <FarmlandMap
            centerLat={selectedFarmland.latitude}
            centerLon={selectedFarmland.longitude}
            boundaryGeojson={selectedFarmland.boundary_geojson}
            className="h-72 w-full rounded-xl overflow-hidden border"
          />
        </div>

        <div className="space-y-4">
          {demoZones.map((zone, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-forest-700" />
                  <h4 className="font-bold text-sm text-slate-900 font-tamil">{zone.name}</h4>
                </div>
                <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded font-tamil">
                  {zone.area}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 font-tamil">
                <p>{t('fieldZonesPage.elevation')} <strong>{zone.elevation}</strong></p>
                <p>{t('fieldZonesPage.soil')} <strong>{zone.soil}</strong></p>
                <p className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('fieldZonesPage.moisture')} <strong>{zone.moisture}</strong></span>
                </p>
                <p className="flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>NDVI: <strong>{zone.ndvi}</strong></span>
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-cream-50 border border-cream-200 text-xs text-forest-900 font-tamil">
                <strong>{t('fieldZonesPage.recommendation')}</strong> {zone.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

