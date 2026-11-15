import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { FarmExpense, HarvestRecord } from '../../types';
import { IndianRupee, Plus, TrendingUp, TrendingDown, ArrowUpRight, DollarSign } from 'lucide-react';

export const FarmExpensesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [expenses, setExpenses] = useState<FarmExpense[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [economics, setEconomics] = useState<any>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingHarvest, setIsAddingHarvest] = useState(false);

  const [expForm, setExpForm] = useState({
    season: 'Samba 2024',
    year: 2024,
    category: 'fertilizer',
    amount_inr: 4500,
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [harvForm, setHarvForm] = useState({
    season: 'Samba 2024',
    year: 2024,
    crop_name: 'Paddy',
    quantity_quintals: 42.0,
    selling_price_per_quintal: 2450.0,
    harvest_date: new Date().toISOString().split('T')[0],
    buyer_type: 'Direct Procurement Center (DPC)'
  });

  const loadAll = async () => {
    if (!selectedFarmland) return;
    try {
      const [e, h, econ] = await Promise.all([
        api.getExpenses(selectedFarmland.id),
        api.getHarvests(selectedFarmland.id),
        api.getEconomics(selectedFarmland.id)
      ]);
      setExpenses(e);
      setHarvests(h);
      setEconomics(econ);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAll();
  }, [selectedFarmland]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmland) return;
    await api.createExpense({
      ...expForm,
      farmland_id: selectedFarmland.id,
      amount_inr: Number(expForm.amount_inr)
    });
    setIsAddingExpense(false);
    loadAll();
  };

  const handleAddHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmland) return;
    await api.createHarvest({
      ...harvForm,
      farmland_id: selectedFarmland.id,
      quantity_quintals: Number(harvForm.quantity_quintals),
      selling_price_per_quintal: Number(harvForm.selling_price_per_quintal)
    });
    setIsAddingHarvest(false);
    loadAll();
  };

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
            {t('expensesPage.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {t('expensesPage.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingExpense(!isAddingExpense)}
            className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow cursor-pointer font-tamil"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingExpense ? t('expensesPage.cancel') : t('expensesPage.addExpense')}</span>
          </button>
          <button
            onClick={() => setIsAddingHarvest(!isAddingHarvest)}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow cursor-pointer font-tamil"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingHarvest ? t('expensesPage.cancel') : t('expensesPage.addHarvest')}</span>
          </button>
        </div>
      </div>

      {/* Economics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 font-tamil">{t('expensesPage.totalExpense')}</span>
          <div className="text-2xl font-extrabold text-rose-600">
            ₹{economics?.total_expenses_inr?.toLocaleString('en-IN') ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 font-tamil">{t('expensesPage.totalRevenue')}</span>
          <div className="text-2xl font-extrabold text-blue-600">
            ₹{economics?.total_revenue_inr?.toLocaleString('en-IN') ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 font-tamil">{t('expensesPage.netProfit')}</span>
          <div className={`text-2xl font-extrabold ${(economics?.net_profit_inr ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ₹{economics?.net_profit_inr?.toLocaleString('en-IN') ?? 0}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold font-tamil">
            {t('expensesPage.roi')}: {economics?.profit_margin_pct ?? 0}%
          </span>
        </div>
      </div>

      {/* Add Expense Form */}
      {isAddingExpense && (
        <form onSubmit={handleAddExpense} className="bg-white p-5 rounded-2xl border border-rose-200 shadow space-y-3 animate-fadeIn">
          <h4 className="font-bold text-slate-900 text-sm font-tamil text-rose-800">{t('expensesPage.addExpense')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Category:</label>
              <select
                value={expForm.category}
                onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                className="w-full border rounded-xl px-3 py-1.5 text-xs bg-white"
              >
                <option value="seeds">Seeds</option>
                <option value="fertilizer">Fertilizer & Pesticide</option>
                <option value="labor">Labor</option>
                <option value="machinery">Tractor / Machinery</option>
                <option value="irrigation">Irrigation</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Amount (₹):</label>
              <input
                type="number"
                required
                value={expForm.amount_inr}
                onChange={(e) => setExpForm({ ...expForm, amount_inr: parseFloat(e.target.value) })}
                className="w-full border rounded-xl px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Description:</label>
              <input
                type="text"
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                placeholder="e.g. Urea and Potash fertilization"
                className="w-full border rounded-xl px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAddingExpense(false)} className="px-3 py-1.5 text-xs rounded-xl border font-tamil">{t('expensesPage.cancel')}</button>
            <button type="submit" className="px-4 py-1.5 text-xs rounded-xl bg-rose-700 text-white font-semibold shadow font-tamil">{t('expensesPage.saveExpense')}</button>
          </div>
        </form>
      )}

      {/* Add Harvest Form */}
      {isAddingHarvest && (
        <form onSubmit={handleAddHarvest} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow space-y-3 animate-fadeIn">
          <h4 className="font-bold text-slate-900 text-sm font-tamil text-emerald-800">{t('expensesPage.addHarvest')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Crop:</label>
              <input
                type="text"
                required
                value={harvForm.crop_name}
                onChange={(e) => setHarvForm({ ...harvForm, crop_name: e.target.value })}
                className="w-full border rounded-xl px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Quantity (Quintals):</label>
              <input
                type="number"
                step="0.5"
                required
                value={harvForm.quantity_quintals}
                onChange={(e) => setHarvForm({ ...harvForm, quantity_quintals: parseFloat(e.target.value) })}
                className="w-full border rounded-xl px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Price (₹/Quintal):</label>
              <input
                type="number"
                step="1"
                required
                value={harvForm.selling_price_per_quintal}
                onChange={(e) => setHarvForm({ ...harvForm, selling_price_per_quintal: parseFloat(e.target.value) })}
                className="w-full border rounded-xl px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAddingHarvest(false)} className="px-3 py-1.5 text-xs rounded-xl border font-tamil">{t('expensesPage.cancel')}</button>
            <button type="submit" className="px-4 py-1.5 text-xs rounded-xl bg-emerald-700 text-white font-semibold shadow font-tamil">{t('expensesPage.saveHarvest')}</button>
          </div>
        </form>
      )}

      {/* Expenses & Harvests Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm font-tamil">{t('expensesPage.recentExpenses')}</h3>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {expenses.map((exp, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 capitalize">{exp.category}</span>
                  <p className="text-slate-500 text-[11px]">{exp.description || exp.season}</p>
                </div>
                <span className="font-bold text-rose-600">₹{exp.amount_inr}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm font-tamil">{t('expensesPage.recentHarvests')}</h3>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {harvests.map((h, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{h.crop_name}</span>
                  <p className="text-slate-500 text-[11px]">{h.quantity_quintals} quintals @ ₹{h.selling_price_per_quintal}</p>
                </div>
                <span className="font-bold text-emerald-600">₹{h.total_revenue_inr}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

