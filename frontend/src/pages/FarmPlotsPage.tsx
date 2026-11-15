import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFarmland } from '../contexts/FarmlandContext';
import { Layers, Plus, Trash2, Edit3, Sprout, Droplets, MapPin, CheckCircle2 } from 'lucide-react';
import { NasaProvenanceBadge } from '../components/ui/NasaProvenanceBadge';

interface PlotItem {
  id: string;
  plot_name: string;
  area_acres: number;
  current_crop: string;
  sowing_date?: string;
  soil_type?: string;
  irrigation_method?: string;
  status: string;
}

export const FarmPlotsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();

  const [plots, setPlots] = useState<PlotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPlot, setNewPlot] = useState({
    plot_name: '',
    area_acres: 1.0,
    current_crop: 'Black Gram (உளுந்து)',
    soil_type: 'alluvial',
    irrigation_method: 'drip'
  });

  const fetchPlots = async () => {
    if (!selectedFarmland) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/farmlands/${selectedFarmland.id}/plots`);
      if (res.data.status === 'success') {
        setPlots(res.data.plots);
      }
    } catch (e) {
      console.error('Fetch plots error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, [selectedFarmland]);

  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmland) return;
    try {
      await axios.post(`/api/farmlands/${selectedFarmland.id}/plots`, newPlot);
      setShowAddModal(false);
      setNewPlot({
        plot_name: '',
        area_acres: 1.0,
        current_crop: 'Black Gram (உளுந்து)',
        soil_type: 'alluvial',
        irrigation_method: 'drip'
      });
      fetchPlots();
    } catch (e) {
      console.error('Create plot error:', e);
    }
  };

  const handleDeletePlot = async (plotId: string) => {
    const confirmMsg = isTamil ? 'இந்த பகுதியை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this plot?';
    if (!confirm(confirmMsg)) return;
    try {
      await axios.delete(`/api/plots/${plotId}`);
      fetchPlots();
    } catch (e) {
      console.error('Delete plot error:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-tamil">{t('plots.title')}</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-tamil">{t('plots.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NasaProvenanceBadge category={2} sourceText="Field Boundary & Sub-Division Geometry" />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer font-tamil"
          >
            <Plus className="w-4 h-4" />
            {t('plots.addPlot')}
          </button>
        </div>
      </div>

      {/* Selected Farmland Summary Banner */}
      {selectedFarmland && (
        <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-slate-300 font-tamil">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{isTamil ? 'நிலம்:' : 'Farmland:'} <strong className="text-white">{selectedFarmland.name}</strong> ({selectedFarmland.district}, {selectedFarmland.village})</span>
          </div>
          <div>
            {isTamil ? 'மொத்த பண்ணை பரப்பு:' : 'Total Farmland Area:'} <strong className="text-emerald-400">{selectedFarmland.area_acres} {isTamil ? 'ஏக்கர்' : 'Acres'}</strong>
          </div>
        </div>
      )}

      {/* Plot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plots.map((plot) => (
          <div
            key={plot.id}
            className="p-5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono font-medium">
                  {plot.area_acres} {isTamil ? 'ஏக்கர்' : 'Acres'}
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium capitalize">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {plot.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-tamil">{plot.plot_name}</h3>
              <div className="space-y-1.5 text-xs text-slate-400 font-tamil">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  <span>{isTamil ? 'பயிர்:' : 'Crop:'} <strong className="text-slate-200">{plot.current_crop}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>{isTamil ? 'பாசனம்:' : 'Irrigation:'} <strong className="text-slate-200 capitalize">{plot.irrigation_method}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{isTamil ? 'மண்:' : 'Soil:'} <strong className="text-slate-200 capitalize">{plot.soil_type}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">ID: {plot.id.slice(0, 8)}...</span>
              <button
                onClick={() => handleDeletePlot(plot.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title={isTamil ? 'பகுதியை நீக்கு' : 'Delete Plot'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {plots.length === 0 && !loading && (
        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm font-tamil">
          {t('plots.noPlots')}
        </div>
      )}

      {/* Add Plot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-tamil">
              <Plus className="w-5 h-5 text-emerald-400" />
              {t('plots.addPlot')}
            </h2>
            <form onSubmit={handleCreatePlot} className="space-y-3.5 font-tamil">
              <div>
                <label className="block text-xs text-slate-300 mb-1">{t('plots.plotName')} *</label>
                <input
                  type="text"
                  required
                  placeholder={isTamil ? 'எ.கா: தெற்கு பகுதி - உளுந்து' : 'e.g. South Plot - Pulses'}
                  value={newPlot.plot_name}
                  onChange={(e) => setNewPlot({ ...newPlot, plot_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">{t('plots.area')} *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={newPlot.area_acres}
                  onChange={(e) => setNewPlot({ ...newPlot, area_acres: parseFloat(e.target.value) || 0.1 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">{t('plots.crop')}</label>
                <select
                  value={newPlot.current_crop}
                  onChange={(e) => setNewPlot({ ...newPlot, current_crop: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Black Gram (உளுந்து)">{isTamil ? 'உளுந்து (Black Gram)' : 'Black Gram'}</option>
                  <option value="Green Gram (பாசிப்பயறு)">{isTamil ? 'பாசிப்பயறு (Green Gram)' : 'Green Gram'}</option>
                  <option value="Groundnut (நிலக்கடலை)">{isTamil ? 'நிலக்கடலை (Groundnut)' : 'Groundnut'}</option>
                  <option value="Sesame (எள்)">{isTamil ? 'எள் (Sesame)' : 'Sesame'}</option>
                  <option value="Finger Millet (கேழ்வரகு)">{isTamil ? 'கேழ்வரகு (Ragi)' : 'Finger Millet (Ragi)'}</option>
                  <option value="Cotton (பருத்தி)">{isTamil ? 'பருத்தி (Cotton)' : 'Cotton'}</option>
                  <option value="Paddy (நெல்)">{isTamil ? 'நெல் (Paddy)' : 'Paddy'}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t('plots.irrigation')}</label>
                  <select
                    value={newPlot.irrigation_method}
                    onChange={(e) => setNewPlot({ ...newPlot, irrigation_method: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="drip">{isTamil ? 'சொட்டுநீர் (Drip)' : 'Drip'}</option>
                    <option value="sprinkler">{isTamil ? 'தெளிப்புநீர் (Sprinkler)' : 'Sprinkler'}</option>
                    <option value="canal">{isTamil ? 'வாய்க்கால் (Canal)' : 'Canal'}</option>
                    <option value="rainfed">{isTamil ? 'மானாவாரி (Rainfed)' : 'Rainfed'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t('plots.soil')}</label>
                  <select
                    value={newPlot.soil_type}
                    onChange={(e) => setNewPlot({ ...newPlot, soil_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="alluvial">{isTamil ? 'வண்டல் (Alluvial)' : 'Alluvial'}</option>
                    <option value="red_loam">{isTamil ? 'செம்மண் (Red Loam)' : 'Red Loam'}</option>
                    <option value="black_cotton">{isTamil ? 'கரிசல் (Black Cotton)' : 'Black Cotton'}</option>
                    <option value="clay_loam">{isTamil ? 'களிமண் (Clay Loam)' : 'Clay Loam'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg cursor-pointer"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
