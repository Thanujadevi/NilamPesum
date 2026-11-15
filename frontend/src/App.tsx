import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { NasaSourcesPage } from './pages/public/NasaSourcesPage';
import { MethodologyPage } from './pages/public/MethodologyPage';

// Auth Pages (Exclusively for Farmers)
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';
import { FarmerVoiceRegistration } from './pages/auth/FarmerVoiceRegistration';

// Farmer Dashboard & Analytics Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { WeatherAnalysisPage } from './pages/farmer/WeatherAnalysisPage';
import { SoilMoisturePage } from './pages/farmer/SoilMoisturePage';
import { VegetationHealthPage } from './pages/farmer/VegetationHealthPage';
import { FarmHealthScorePage } from './pages/farmer/FarmHealthScorePage';
import { CropRecommendationsPage } from './pages/farmer/CropRecommendationsPage';
import { CompareCropPlansPage } from './pages/farmer/CompareCropPlansPage';
import { HistoricalAnalysisPage } from './pages/farmer/HistoricalAnalysisPage';
import { ScenarioSimulationPage } from './pages/farmer/ScenarioSimulationPage';
import { MyFarmlandsPage } from './pages/farmer/MyFarmlandsPage';
import { FarmPlotsPage } from './pages/FarmPlotsPage';
import { SoilHealthPage } from './pages/farmer/SoilHealthPage';
import { FarmExpensesPage } from './pages/farmer/FarmExpensesPage';
import { FarmingCalendarPage } from './pages/farmer/FarmingCalendarPage';
import { ReportsPage } from './pages/farmer/ReportsPage';
import { NotificationsPage } from './pages/farmer/NotificationsPage';
import { FieldZoneAnalysisPage } from './pages/farmer/FieldZoneAnalysisPage';

// Interactive Visual Simulation World Pages
import { SimulationWorldHub } from './pages/simulations/SimulationWorldHub';
import { ClimateChangeSimulator } from './pages/simulations/ClimateChangeSimulator';
import { SmartIrrigationSimulator } from './pages/simulations/SmartIrrigationSimulator';
import { CropRotationSimulator } from './pages/simulations/CropRotationSimulator';
import { FloodDroughtSimulator } from './pages/simulations/FloodDroughtSimulator';
import { CropStressSimulator } from './pages/simulations/CropStressSimulator';
import { FarmingSeasonSimulator } from './pages/simulations/FarmingSeasonSimulator';
import { SavedSimulationsPage } from './pages/simulations/SavedSimulationsPage';

// Portals
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* ------------------------------------------------------------- */}
      {/* PUBLIC ROUTES (Accessible without authentication) */}
      {/* ------------------------------------------------------------- */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/how-it-works" element={<LandingPage />} />
      <Route path="/nasa-data-sources" element={<NasaSourcesPage />} />
      <Route path="/methodology" element={<MethodologyPage />} />

      {/* Public Voice-First Farmer Registration & Login */}
      <Route path="/farmer-registration" element={<FarmerVoiceRegistration />} />
      <Route path="/register" element={<FarmerVoiceRegistration />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* ------------------------------------------------------------- */}
      {/* PROTECTED ROUTES (Require valid farmer authentication) */}
      {/* ------------------------------------------------------------- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/farmlands" element={<MyFarmlandsPage />} />
          <Route path="/farmer/plots" element={<FarmPlotsPage />} />
          <Route path="/farmer/weather" element={<WeatherAnalysisPage />} />
          <Route path="/farmer/rainfall" element={<WeatherAnalysisPage />} />
          <Route path="/farmer/soil-moisture" element={<SoilMoisturePage />} />
          <Route path="/farmer/vegetation" element={<VegetationHealthPage />} />
          <Route path="/farmer/farm-health" element={<FarmHealthScorePage />} />
          <Route path="/farmer/recommendations" element={<CropRecommendationsPage />} />
          <Route path="/farmer/compare-crops" element={<CompareCropPlansPage />} />
          <Route path="/farmer/historical" element={<HistoricalAnalysisPage />} />
          <Route path="/farmer/simulations" element={<ScenarioSimulationPage />} />
          <Route path="/farmer/zones" element={<FieldZoneAnalysisPage />} />
          <Route path="/farmer/soil-health" element={<SoilHealthPage />} />
          <Route path="/farmer/expenses" element={<FarmExpensesPage />} />
          <Route path="/farmer/calendar" element={<FarmingCalendarPage />} />
          <Route path="/farmer/reports" element={<ReportsPage />} />
          <Route path="/farmer/notifications" element={<NotificationsPage />} />

          {/* Visual Interactive Farm Simulation World */}
          <Route path="/simulation-world" element={<SimulationWorldHub />} />
          <Route path="/simulation-world/climate-change" element={<ClimateChangeSimulator />} />
          <Route path="/simulation-world/smart-irrigation" element={<SmartIrrigationSimulator />} />
          <Route path="/simulation-world/crop-rotation" element={<CropRotationSimulator />} />
          <Route path="/simulation-world/flood-drought" element={<FloodDroughtSimulator />} />
          <Route path="/simulation-world/crop-stress" element={<CropStressSimulator />} />
          <Route path="/simulation-world/full-season" element={<FarmingSeasonSimulator />} />
          <Route path="/simulation-world/saved" element={<SavedSimulationsPage />} />

          {/* Officer & Admin Portals */}
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Fallback to Public Welcome Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
