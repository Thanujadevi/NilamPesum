import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFarmland } from '../../contexts/FarmlandContext';
import { api } from '../../services/api';
import { FarmingActivity } from '../../types';
import { Calendar, CheckCircle2, Clock, Plus, Check } from 'lucide-react';

export const FarmingCalendarPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();
  const [activities, setActivities] = useState<FarmingActivity[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    activity_type: 'sowing',
    crop_name: 'கேழ்வரகு (Ragi)',
    scheduled_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const loadActivities = async () => {
    if (!selectedFarmland) return;
    try {
      const data = await api.getCalendarActivities(selectedFarmland.id);
      setActivities(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [selectedFarmland]);

  const handleToggle = async (id: string, current: boolean) => {
    await api.toggleCalendarActivity(id, !current);
    loadActivities();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmland) return;
    await api.createCalendarActivity({
      ...newTask,
      farmland_id: selectedFarmland.id
    });
    setIsAdding(false);
    loadActivities();
  };

  if (!selectedFarmland) return null;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
            {t('calendarPage.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
            {t('calendarPage.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-leaf-600 hover:bg-leaf-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition shadow self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="font-tamil">{isAdding ? t('calendarPage.cancel') : t('calendarPage.addTask')}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-slate-200 shadow space-y-3 animate-fadeIn">
          <h4 className="font-bold text-slate-900 text-sm font-tamil">{t('calendarPage.formTitle')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('calendarPage.fieldTitle')}</label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder={t('calendarPage.fieldTitlePh')}
                className="w-full border rounded-xl px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('calendarPage.fieldActivity')}</label>
              <select
                value={newTask.activity_type}
                onChange={(e) => setNewTask({ ...newTask, activity_type: e.target.value })}
                className="w-full border rounded-xl px-3 py-1.5 text-xs bg-white font-tamil"
              >
                <option value="sowing">{t('calendarPage.sowing')}</option>
                <option value="irrigation">{t('calendarPage.irrigation')}</option>
                <option value="fertilization">{t('calendarPage.fertilization')}</option>
                <option value="pest_scouting">{t('calendarPage.pest_scouting')}</option>
                <option value="weeding">{t('calendarPage.weeding')}</option>
                <option value="harvest">{t('calendarPage.harvest')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 font-tamil">{t('calendarPage.fieldDate')}</label>
              <input
                type="date"
                required
                value={newTask.scheduled_date}
                onChange={(e) => setNewTask({ ...newTask, scheduled_date: e.target.value })}
                className="w-full border rounded-xl px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs rounded-xl border font-tamil">{t('calendarPage.cancel')}</button>
            <button type="submit" className="px-4 py-1.5 text-xs rounded-xl bg-forest-800 text-white font-semibold shadow font-tamil">{t('calendarPage.saveTask')}</button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {activities.map((act) => (
          <div key={act.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(act.id, act.completed)}
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition cursor-pointer ${
                  act.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-emerald-500'
                }`}
              >
                {act.completed && <Check className="w-3.5 h-3.5" />}
              </button>

              <div className="space-y-0.5">
                <span className={`text-sm font-bold font-tamil ${act.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {act.title}
                </span>
                <p className="text-xs text-slate-500 font-tamil">{act.description}</p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 flex items-center gap-2">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {act.scheduled_date}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-tamil ${
                act.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {act.completed ? t('calendarPage.statusDone') : t('calendarPage.statusPending')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

