import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFarmland } from '../../contexts/FarmlandContext';
import { Bookmark, SplitSquareVertical, Trash2, Download, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SavedScenarioItem {
  id: string;
  title: string;
  simulation_type: string;
  created_at: string;
  input_summary: any;
  results_summary: any;
}

export const SavedSimulationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { selectedFarmland } = useFarmland();

  const [scenarios, setScenarios] = useState<SavedScenarioItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchScenarios = async () => {
    if (!selectedFarmland) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/simulations/world/scenarios/${selectedFarmland.id}`);
      if (res.data.status === 'success') {
        setScenarios(res.data.scenarios);
      }
    } catch (e) {
      console.error('Fetch saved scenarios error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [selectedFarmland]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      alert(isTamil ? 'குறைந்தபட்சம் 2 காட்சிகளைத் தேர்ந்தெடுக்கவும்.' : 'Please select at least 2 scenarios to compare side-by-side.');
      return;
    }
    try {
      const res = await axios.post('/api/simulations/world/scenarios/compare', {
        scenario_ids: selectedIds
      });
      setCompareData(res.data.items);
    } catch (e) {
      console.error('Compare error:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isTamil ? 'இந்த காட்சியை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this scenario?')) return;
    try {
      await axios.delete(`/api/simulations/world/scenarios/${id}`);
      fetchScenarios();
      setSelectedIds(selectedIds.filter((x) => x !== id));
      if (compareData) setCompareData(null);
    } catch (e) {
      console.error('Delete scenario error:', e);
    }
  };

  const handleExportCSV = () => {
    if (scenarios.length === 0) return;
    let csv = 'ID,Title,Type,Created Date,Key Results\n';
    for (const s of scenarios) {
      const resultsStr = JSON.stringify(s.results_summary).replace(/"/g, '""');
      csv += `"${s.id}","${s.title}","${s.simulation_type}","${s.created_at}","${resultsStr}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nilam_pesum_simulations_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <Link
            to="/simulation-world"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isTamil ? 'விவசாய உலகிற்குத் திரும்பு' : 'Back to Simulation World'}</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-tamil">
                {isTamil ? 'சேமிக்கப்பட்ட விவசாய உத்திகள் (Saved Scenarios)' : 'Saved Simulation Scenarios'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-tamil">
                {isTamil ? 'சேமிக்கப்பட்ட விவசாய உத்திகளை மீண்டும் திறந்து பக்கவாட்டில் ஒப்பாய்வு செய்யுங்கள்.' : 'Reopen, manage, and execute side-by-side comparative analysis of saved farm models.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isTamil ? 'கோப்பு பதிவிறக்கு (CSV)' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span>{isTamil ? `ஒப்பிடுக (${selectedIds.length})` : `Compare Selected (${selectedIds.length})`}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Panel */}
      {compareData && (
        <div className="bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-tamil">
              <SplitSquareVertical className="w-5 h-5 text-emerald-400" />
              <span>{isTamil ? 'பக்கவாட்டு மாதிரி ஒப்பாய்வு (Comparison Analysis)' : 'Side-by-Side Comparison Analysis'}</span>
            </h2>
            <button
              onClick={() => setCompareData(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              {isTamil ? 'ஒப்பீட்டை மூடு' : 'Close Comparison'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compareData.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full">
                  {isTamil ? `மாதிரி ${idx + 1}` : `Scenario ${idx + 1}`}
                </span>
                <h3 className="text-sm font-bold text-white font-tamil">{item.title}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {isTamil ? 'வகை: ' : 'Type: '} {item.simulation_type}
                </p>

                <div className="p-3 bg-slate-900/70 rounded-lg text-xs space-y-1.5 font-mono">
                  <p className="text-slate-400 font-bold">{isTamil ? 'கணக்கிடப்பட்ட முடிவுகள்:' : 'Calculated Outcomes:'}</p>
                  <pre className="text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(item.results, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isSelected = selectedIds.includes(sc.id);
          return (
            <div
              key={sc.id}
              className={`p-5 rounded-2xl border transition-all shadow-lg flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 uppercase">
                    {sc.simulation_type.replace('_', ' ')}
                  </span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(sc.id)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
                  />
                </div>
                <h3 className="text-sm font-bold text-white mb-2 font-tamil">{sc.title}</h3>
                <p className="text-[11px] text-slate-400">
                  {isTamil ? 'உருவாக்கிய தேதி: ' : 'Created: '}{new Date(sc.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">ID: {sc.id.slice(0, 8)}...</span>
                <button
                  onClick={() => handleDelete(sc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title={isTamil ? 'நீக்கு' : 'Delete Scenario'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {scenarios.length === 0 && !loading && (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm font-tamil">
          {isTamil ? 'இந்த நிலத்திற்கு சேமிக்கப்பட்ட மாதிரிகள் ஏதுமில்லை. விவசாய உருவகப்படுத்தல் பக்கத்தில் மாதிரி ஒன்றை இயக்கி "சேமி" என்பதைக் கிளிக் செய்யவும்.' : 'No saved simulation scenarios found for this farmland. Launch any simulation in Simulation World and click "Save Scenario".'}
        </div>
      )}
    </div>
  );
};

