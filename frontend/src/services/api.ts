import {
  Farmland, WeatherAnalytics, SoilMoistureAnalytics, VegetationAnalytics,
  FarmHealthScore, CropRotationPlan, HistoricalAnalysis, ScenarioSimulation,
  SoilHealthRecord, FarmingActivity, FarmExpense, HarvestRecord,
  NotificationItem, NasaIntegrationStatus, NasaDataSource
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem('nilam_pesum_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Farmlands
  async getFarmlands(userId?: string): Promise<Farmland[]> {
    const url = userId ? `${API_BASE}/farmlands?user_id=${encodeURIComponent(userId)}` : `${API_BASE}/farmlands`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch farmlands');
    return res.json();
  },

  async createFarmland(data: Partial<Farmland>): Promise<Farmland> {
    const res = await fetch(`${API_BASE}/farmlands`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create farmland');
    return res.json();
  },

  async getFarmlandById(id: string): Promise<Farmland> {
    const res = await fetch(`${API_BASE}/farmlands/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch farmland');
    return res.json();
  },

  async deleteFarmland(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/farmlands/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to delete farmland');
  },

  // NASA Synchronizations
  async syncNasaPower(farmlandId: string, startDate?: string, endDate?: string): Promise<any> {
    let url = `${API_BASE}/nasa/power/sync/${farmlandId}`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to synchronize NASA POWER');
    return res.json();
  },

  async getNasaStatus(): Promise<{ timestamp: string; earthdata_auth: any; integrations: NasaIntegrationStatus[] }> {
    const res = await fetch(`${API_BASE}/nasa/status`);
    if (!res.ok) throw new Error('Failed to fetch NASA status');
    return res.json();
  },

  async getNasaSources(): Promise<NasaDataSource[]> {
    const res = await fetch(`${API_BASE}/nasa/sources`);
    if (!res.ok) throw new Error('Failed to fetch NASA data sources');
    return res.json();
  },

  async getNasaLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/nasa/logs`);
    if (!res.ok) throw new Error('Failed to fetch NASA logs');
    return res.json();
  },

  // Analytics
  async getWeatherAnalytics(farmlandId: string): Promise<WeatherAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/weather/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch weather analytics');
    return res.json();
  },

  async getSoilMoistureAnalytics(farmlandId: string): Promise<SoilMoistureAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/soil-moisture/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch soil moisture analytics');
    return res.json();
  },

  async getVegetationAnalytics(farmlandId: string): Promise<VegetationAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/vegetation/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch vegetation analytics');
    return res.json();
  },

  async getFarmHealthScore(farmlandId: string): Promise<FarmHealthScore> {
    const res = await fetch(`${API_BASE}/analytics/land-health/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch farm health score');
    return res.json();
  },

  async getHistoricalAnalysis(farmlandId: string): Promise<HistoricalAnalysis> {
    const res = await fetch(`${API_BASE}/analytics/historical/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch historical analysis');
    return res.json();
  },

  // Recommendations
  async getRecommendations(farmlandId: string): Promise<CropRotationPlan[]> {
    const res = await fetch(`${API_BASE}/recommendations/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async generateRecommendations(farmlandId: string, season?: string, goal?: string): Promise<CropRotationPlan[]> {
    const res = await fetch(`${API_BASE}/recommendations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmland_id: farmlandId, target_season: season, prioritize_goal: goal }),
    });
    if (!res.ok) throw new Error('Failed to generate recommendations');
    return res.json();
  },

  async getCropCatalog(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/recommendations/knowledge/crops`);
    if (!res.ok) throw new Error('Failed to fetch crop catalog');
    return res.json();
  },

  // Simulations
  async runSimulation(payload: {
    farmland_id: string;
    simulation_name: string;
    rainfall_change_pct: number;
    temp_change_c: number;
    irrigation_constraint: string;
  }): Promise<ScenarioSimulation> {
    const res = await fetch(`${API_BASE}/simulations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    return res.json();
  },

  async getSimulations(farmlandId: string): Promise<ScenarioSimulation[]> {
    const res = await fetch(`${API_BASE}/simulations/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch simulations');
    return res.json();
  },

  // Farm Operations: Calendar
  async getCalendarActivities(farmlandId: string): Promise<FarmingActivity[]> {
    const res = await fetch(`${API_BASE}/calendar/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch calendar');
    return res.json();
  },

  async createCalendarActivity(payload: Partial<FarmingActivity>): Promise<FarmingActivity> {
    const res = await fetch(`${API_BASE}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create activity');
    return res.json();
  },

  async toggleCalendarActivity(id: string, completed: boolean): Promise<FarmingActivity> {
    const res = await fetch(`${API_BASE}/calendar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error('Failed to update activity');
    return res.json();
  },

  // Soil Health
  async getSoilHealthRecords(farmlandId: string): Promise<SoilHealthRecord[]> {
    const res = await fetch(`${API_BASE}/soil-health/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch soil health');
    return res.json();
  },

  async createSoilHealthRecord(payload: Partial<SoilHealthRecord>): Promise<SoilHealthRecord> {
    const res = await fetch(`${API_BASE}/soil-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save soil health record');
    return res.json();
  },

  // Economics
  async getExpenses(farmlandId: string): Promise<FarmExpense[]> {
    const res = await fetch(`${API_BASE}/expenses/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async createExpense(payload: Partial<FarmExpense>): Promise<FarmExpense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save expense');
    return res.json();
  },

  async getHarvests(farmlandId: string): Promise<HarvestRecord[]> {
    const res = await fetch(`${API_BASE}/harvests/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch harvests');
    return res.json();
  },

  async createHarvest(payload: Partial<HarvestRecord>): Promise<HarvestRecord> {
    const res = await fetch(`${API_BASE}/harvests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save harvest');
    return res.json();
  },

  async getEconomics(farmlandId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/economics/${farmlandId}`);
    if (!res.ok) throw new Error('Failed to fetch economics summary');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  // Voice Assistant
  async sendVoiceQuery(queryText: string, farmlandId?: string, lang: string = 'ta'): Promise<any> {
    const res = await fetch(`${API_BASE}/voice/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query_text: queryText, farmland_id: farmlandId, language: lang }),
    });
    if (!res.ok) throw new Error('Failed to process voice query');
    return res.json();
  },

  // Reports
  async getReportSummary(farmlandId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/${farmlandId}/summary`);
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  // Officer
  async getRegionalOverview(): Promise<any> {
    const res = await fetch(`${API_BASE}/officer/regional-overview`);
    if (!res.ok) throw new Error('Failed to fetch officer overview');
    return res.json();
  },
};

