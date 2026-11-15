import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { NasaIntegrationStatus } from '../../types';
import { Satellite, CheckCircle2, AlertCircle, RefreshCw, Database, Clock, Shield } from 'lucide-react';
import { NasaProvenanceBadge } from '../../components/ui/NasaProvenanceBadge';

export const AdminDashboard: React.FC = () => {
  const [statusData, setStatusData] = useState<{ timestamp: string; earthdata_auth: any; integrations: NasaIntegrationStatus[] } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [s, l] = await Promise.all([
        api.getNasaStatus(),
        api.getNasaLogs()
      ]);
      setStatusData(s);
      setLogs(l);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
              நாசா ஒருங்கிணைப்பு நிலை & நிர்வாக பலகை
            </h1>
            <NasaProvenanceBadge category={1} sourceText="NASA Health Dashboard" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            NASA Earthdata API Integration Health, Retrieval Logs & Data Provenance Monitoring
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>நிலையை புதுப்பி</span>
        </button>
      </div>

      {/* Earthdata Auth Status Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-forest-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              நாசா Earthdata உள்நுழைவு அங்கீகார நிலை (NASA URS Authentication):
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            statusData?.earthdata_auth?.configured
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {statusData?.earthdata_auth?.status}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-tamil">
          {statusData?.earthdata_auth?.message}
        </p>
      </div>

      {/* NASA Products Health Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-4 min-w-[220px]">நாசா தயாரிப்பு (Product)</th>
              <th className="p-4 min-w-[140px]">இணைப்பு நிலை</th>
              <th className="p-4 min-w-[130px]">தீர்மானம் (Resolution)</th>
              <th className="p-4 min-w-[140px]">காலவரிசை (Temporal)</th>
              <th className="p-4 min-w-[140px]">பதிவான தரவுகள்</th>
              <th className="p-4 min-w-[160px]">கடைசி மீட்டெடுப்பு</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {statusData?.integrations.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition">
                <td className="p-4">
                  <a href={item.official_url} target="_blank" rel="noreferrer" className="font-bold text-forest-800 hover:underline block text-sm">
                    {item.product_name}
                  </a>
                  <span className="text-[11px] text-slate-400 font-mono">{item.source_id}</span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Connected'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status === 'Connected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{item.status}</span>
                  </span>
                </td>
                <td className="p-4 text-slate-600 font-medium">{item.spatial_resolution}</td>
                <td className="p-4 text-slate-600">{item.temporal_resolution}</td>
                <td className="p-4 font-bold text-slate-800">{item.records_stored} records</td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">
                  {item.last_retrieval ? new Date(item.last_retrieval).toLocaleString() : 'இன்னும் இல்லை'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API Logs Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-forest-700" />
            <h3 className="font-bold text-slate-900 text-sm font-tamil">நாசா API மீட்டெடுப்பு பதிவுகள் (Audit Logs)</h3>
          </div>
          <span className="text-xs text-slate-400">கடைசி 20 பதிவுகள்</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
          {logs.map((log, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="space-y-0.5 max-w-md truncate">
                <span className="font-bold text-slate-800">{log.source_id.toUpperCase()}</span>
                <p className="text-slate-500 text-[11px] truncate font-mono">{log.endpoint_called}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  log.status_code === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  HTTP {log.status_code || 200} ({log.response_time_ms}ms)
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

