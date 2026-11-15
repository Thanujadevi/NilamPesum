import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { FileText, Download, Printer, ShieldCheck } from 'lucide-react';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';

export const ReportsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedFarmland) return;
    const loadReport = async () => {
      try {
        setIsLoading(true);
        const data = await api.getReportSummary(selectedFarmland.id);
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [selectedFarmland]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!selectedFarmland) return;
    window.open(`/api/reports/${selectedFarmland.id}/csv`, '_blank');
  };

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
            {t('reportsPage.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {t('reportsPage.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition font-tamil cursor-pointer"
          >
            <Download className="w-4 h-4 text-forest-700" />
            <span>{t('reportsPage.downloadCsv')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition font-tamil cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('reportsPage.printReport')}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      {report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 print:shadow-none print:border-none print:p-0">
          {/* Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-forest-800 pb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Nilam Pesum" className="w-12 h-12" />
              <div>
                <h2 className="text-xl font-extrabold text-forest-950 font-tamil">
                  {isTamil ? 'நிலம் பேசும் (NILAM PESUM)' : 'NILAM PESUM'}
                </h2>
                <p className="text-xs text-forest-700 font-semibold">NASA-Powered AI Agricultural Intelligence Platform</p>
                <p className="text-[11px] text-slate-400">Let Your Land Speak. Let Data Guide Your Farming.</p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 font-tamil">
              <span className="font-bold text-slate-800 block">
                {t('reportsPage.reportDate')} {new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN')}
              </span>
              <span>{t('reportsPage.agriZone')}</span>
            </div>
          </div>

          {/* Farmland Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-tamil">
            <div>
              <span className="text-slate-400 block">{isTamil ? 'நிலத்தின் பெயர்:' : 'Farmland Name:'}</span>
              <strong className="text-slate-900 text-sm">{report.farmland.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">{isTamil ? 'மாவட்டம் & கிராமம்:' : 'District & Village:'}</span>
              <strong className="text-slate-900">{report.farmland.district} ({report.farmland.village})</strong>
            </div>
            <div>
              <span className="text-slate-400 block">{isTamil ? 'பரப்பளவு & மண்:' : 'Area & Soil:'}</span>
              <strong className="text-slate-900">{report.farmland.area_acres} {isTamil ? 'ஏக்கர்' : 'Acres'} ({report.farmland.soil_type})</strong>
            </div>
            <div>
              <span className="text-slate-400 block">{isTamil ? 'புவி அமைவிடம்:' : 'Geo-Coordinates:'}</span>
              <strong className="text-slate-900">{report.farmland.latitude.toFixed(4)}°N, {report.farmland.longitude.toFixed(4)}°E</strong>
            </div>
          </div>

          {/* Indicators Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-forest-800 font-tamil">
                1. {t('healthScorePage.title')}
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-forest-900">{report.farm_health?.overall_health_score}/100</span>
                <span className="text-xs font-semibold text-emerald-700">({report.farm_health?.health_status})</span>
              </div>
              <p className="text-xs text-slate-600 font-tamil leading-relaxed">
                {isTamil ? (report.farm_health?.explanation_ta || report.farm_health?.explanation_en) : (report.farm_health?.explanation_en || report.farm_health?.explanation_ta)}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-800 font-tamil">
                2. {isTamil ? 'வானிலை & மழை நிலவரம்' : 'Weather & Rainfall Summary'}
              </h4>
              <div className="text-xs text-slate-700 space-y-1 font-tamil">
                <p>{isTamil ? 'தற்போதைய வெப்பநிலை:' : 'Current Temp:'} <strong>{report.weather_summary?.current_temp}°C</strong></p>
                <p>{isTamil ? 'கடந்த 30 நாள் மழை:' : 'Last 30 Days Rain:'} <strong>{report.weather_summary?.rainfall_last_30d} mm</strong></p>
                <p>{isTamil ? 'மழைப்பொழிவு நிலை:' : 'Rainfall Anomaly:'} <strong>{report.weather_summary?.rainfall_anomaly}</strong></p>
              </div>
            </div>
          </div>

          {/* Recommended Rotation Plans */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm font-tamil text-forest-900">
              3. {t('reportsPage.rotationSummary')}:
            </h4>
            <div className="space-y-2.5">
              {report.recommended_plans?.map((plan: any, i: number) => {
                const planExplanation = isTamil ? (plan.explanation_ta || plan.explanation_en) : (plan.explanation_en || plan.explanation_ta);
                return (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 bg-cream-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 font-tamil">{plan.name}</span>
                      <span className="font-extrabold text-emerald-700 font-tamil">{plan.suitability_score}% {isTamil ? 'பொருத்தம்' : 'Suitability'}</span>
                    </div>
                    <p className="text-slate-700 font-tamil">{planExplanation}</p>
                    <p className="text-[11px] text-forest-800 font-semibold font-tamil">
                      {isTamil ? 'மண் நன்மைகள்:' : 'Soil Benefits:'} {plan.soil_benefit}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provenance and Scientific Limitations */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 leading-relaxed font-tamil">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">
              {isTamil ? 'நாசா தரவு மூலம் & அறிவியல் வரம்புகள்:' : 'NASA Provenance & Scientific Disclaimers:'}
            </h5>
            <p><strong>{isTamil ? 'முதன்மை தரவு மூலம்:' : 'Primary Provider:'}</strong> {report.scientific_provenance_and_limitations?.primary_provider}</p>
            <p><strong>{isTamil ? 'வேளாண் பரிந்துரை விதிகள்:' : 'Agronomic References:'}</strong> {report.scientific_provenance_and_limitations?.agronomic_references}</p>
            <p><strong>{isTamil ? 'தீர்மான வரம்பு:' : 'Spatial Resolution:'}</strong> {report.scientific_provenance_and_limitations?.spatial_resolution_notice}</p>
            <p className="italic text-slate-500">{report.scientific_provenance_and_limitations?.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

