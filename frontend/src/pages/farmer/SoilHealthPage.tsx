import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { SoilHealthRecord } from '../../types';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';
import { FlaskConical, Plus, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const SoilHealthPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [records, setRecords] = useState<SoilHealthRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    test_date: new Date().toISOString().split('T')[0],
    soil_ph: 7.0,
    organic_carbon_pct: 0.65,
    available_nitrogen_kg_ha: 220.0,
    available_phosphorus_kg_ha: 16.0,
    available_potassium_kg_ha: 240.0,
    notes: ''
  });

  const loadRecords = async () => {
    if (!selectedFarmland) return;
    try {
      const data = await api.getSoilHealthRecords(selectedFarmland.id);
      setRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [selectedFarmland]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmland) return;
    try {
      await api.createSoilHealthRecord({
        farmland_id: selectedFarmland.id,
        test_date: formData.test_date,
        soil_type: selectedFarmland.soil_type,
        soil_ph: Number(formData.soil_ph),
        organic_carbon_pct: Number(formData.organic_carbon_pct),
        available_nitrogen_kg_ha: Number(formData.available_nitrogen_kg_ha),
        available_phosphorus_kg_ha: Number(formData.available_phosphorus_kg_ha),
        available_potassium_kg_ha: Number(formData.available_potassium_kg_ha),
        notes: formData.notes
      });
      setIsAdding(false);
      loadRecords();
    } catch (err) {
      console.error(err);
    }
  };

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
              {isTamil ? 'மண் வளம் & தழைச்சத்து கண்காணிப்பு (Soil Health & Nitrogen Tracker)' : 'Soil Health & Nitrogen Tracker'}
            </h1>
            <NasaProvenanceBadge category={2} sourceText="Nutrient Balance Estimate" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {isTamil
              ? 'மண் பரிசோதனை அட்டை (Soil Health Card) அளவீடுகள் மற்றும் பயிர் தழைச்சத்து இருப்பு மதிப்பீடு.'
              : 'Soil Health Card laboratory records and crop nutrient balance estimation.'}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow self-start sm:self-auto cursor-pointer font-tamil"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? (isTamil ? 'ரத்து செய்' : 'Cancel') : (isTamil ? 'மண் பரிசோதனை முடிவு சேர்க்க' : 'Add Soil Test Record')}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 animate-fadeIn">
          <h3 className="font-bold text-slate-900 text-base font-tamil border-b pb-2">
            {isTamil ? 'மண் பரிசோதனை அட்டை தரவுப் பதிவு (Enter Soil Test Details)' : 'Enter Soil Health Card Test Details'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">
                {isTamil ? 'பரிசோதனை தேதி (Test Date):' : 'Test Date:'}
              </label>
              <input
                type="date"
                required
                value={formData.test_date}
                onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">
                {isTamil ? 'மண் pH கார-அமில நிலை:' : 'Soil pH Level:'}
              </label>
              <input
                type="number"
                step="0.1"
                min="4.0"
                max="9.5"
                required
                value={formData.soil_ph}
                onChange={(e) => setFormData({ ...formData, soil_ph: parseFloat(e.target.value) })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">
                {isTamil ? 'கரிமக் கார்பன் (Organic Carbon %):' : 'Organic Carbon (%):'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="3.0"
                required
                value={formData.organic_carbon_pct}
                onChange={(e) => setFormData({ ...formData, organic_carbon_pct: parseFloat(e.target.value) })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">
                {isTamil ? 'தழைச்சத்து (Available Nitrogen kg/ha):' : 'Available Nitrogen (kg/ha):'}
              </label>
              <input
                type="number"
                step="1"
                required
                value={formData.available_nitrogen_kg_ha}
                onChange={(e) => setFormData({ ...formData, available_nitrogen_kg_ha: parseFloat(e.target.value) })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">
                {isTamil ? 'மணிச்சத்து (Available Phosphorus kg/ha):' : 'Available Phosphorus (kg/ha):'}
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.available_phosphorus_kg_ha}
                onChange={(e) => setFormData({ ...formData, available_phosphorus_kg_ha: parseFloat(e.target.value) })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">
                {isTamil ? 'சாம்பல் சத்து (Available Potassium kg/ha):' : 'Available Potassium (kg/ha):'}
              </label>
              <input
                type="number"
                step="1"
                required
                value={formData.available_potassium_kg_ha}
                onChange={(e) => setFormData({ ...formData, available_potassium_kg_ha: parseFloat(e.target.value) })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">
              {isTamil ? 'குறிப்புகள் / ஆய்வக விவரம் (Notes):' : 'Notes / Laboratory:'}
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={isTamil ? 'எ.கா. மாவட்ட மண் பரிசோதனை நிலையம், தஞ்சாவூர்' : 'e.g. District Soil Testing Lab, Thanjavur'}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-tamil"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border text-slate-700 font-tamil cursor-pointer"
            >
              {isTamil ? 'ரத்து செய்' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-forest-800 text-white shadow font-tamil cursor-pointer"
            >
              {isTamil ? 'பதிவு செய் (Save Record)' : 'Save Record'}
            </button>
          </div>
        </form>
      )}

      {/* Records Cards */}
      <div className="space-y-4">
        {records.map((r, idx) => (
          <div key={r.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-xs text-slate-400 block font-tamil">{isTamil ? 'பரிசோதனை தேதி:' : 'Test Date:'} {r.test_date}</span>
                <span className="font-bold text-slate-800 text-sm font-tamil">{r.notes || (isTamil ? 'மண் பரிசோதனை முடிவு' : 'Soil Test Result')}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-tamil">{isTamil ? 'கணக்கிடப்பட்ட தழைச்சத்து இருப்பு:' : 'Estimated Nitrogen Balance:'}</span>
                <span className="text-lg font-extrabold text-emerald-600">+{r.indicative_n_balance_kg_ha} kg/ha</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-tamil">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">{isTamil ? 'pH கார-அமில நிலை:' : 'Soil pH:'}</span>
                <strong className="text-slate-900 text-sm">{r.soil_ph} ({r.soil_ph && r.soil_ph >= 6.5 && r.soil_ph <= 7.5 ? (isTamil ? 'நடுநிலை' : 'Neutral') : (isTamil ? 'சரிசெய்ய தேவை' : 'Needs Adjustment')})</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">{isTamil ? 'கரிமக் கார்பன்:' : 'Organic Carbon:'}</span>
                <strong className="text-slate-900 text-sm">{r.organic_carbon_pct}%</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">{isTamil ? 'தழைச்சத்து (N):' : 'Available N:'}</span>
                <strong className="text-slate-900 text-sm">{r.available_nitrogen_kg_ha} kg/ha</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">{isTamil ? 'மணி (P) / சாம்பல் (K):' : 'Phosphorus / Potash:'}</span>
                <strong className="text-slate-900 text-sm">{r.available_phosphorus_kg_ha} / {r.available_potassium_kg_ha} kg/ha</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 font-tamil">
        <strong>{isTamil ? 'அறிவியல் தெளிவுரை:' : 'Scientific Clarification:'}</strong> {isTamil
          ? 'நாசா செயற்கைக்கோள்கள் நிலத்தின் ஈரப்பதத்தை (SMAP) மட்டுமே பதிவு செய்கின்றன. மண்ணின் இரசாயன ஊட்டச்சத்துக்கள் (pH, Nitrogen, Phosphorus) விவசாயி பதிவு செய்யும் ஆய்வகப் பரிசோதனை முடிவுகள் அடிப்படையிலானவை.'
          : 'NASA satellites measure soil physical moisture (SMAP). Chemical nutrient properties (pH, NPK) are based on the farmer\'s soil testing laboratory card records.'}
      </div>
    </div>
  );
};

