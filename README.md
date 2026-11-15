# NILAM PESUM (நிலம் பேசும்)
### NASA-Powered AI Agricultural Intelligence, Satellite Monitoring and Smart Crop Rotation Recommendation Platform
**"Let Your Land Speak. Let Data Guide Your Farming."**

Primary Agroclimatic Focus: **Tamil Nadu, India**

---

## 1. Project Overview & Upgrade Summary
**NILAM PESUM (நிலம் பேசும்)** is a complete, production-ready, full-stack agricultural decision-support and visual simulation platform designed to help farmers in Tamil Nadu understand their farmland using genuine NASA satellite observations, meteorological datasets, and transparent agronomic intelligence grounded in Tamil Nadu Agricultural University (TNAU) and ICAR research.

### Major Platform Capabilities:
1. **User Registration & Secure Authentication**:
   - Roles: Farmer (விவசாயி), Agricultural Extension Officer (வேளாண் அலுவலர்), and Administrator (நாசா நிர்வாகி).
   - PBKDF2-HMAC-SHA256 salted password hashing, JWT cryptographic access tokens, email verification, and password reset flows.
   - Quick 1-click Demo Logins for instant review.
2. **8-Step Farmer Onboarding Wizard**:
   - Guided journey: 1. Personal details, 2. Farm identification, 3. Live GPS location detection, 4. Interactive boundary polygon drawing on Leaflet map, 5. Land area & unit selection (Acres, Cents, Hectares, Kuzhi), 6. Current & previous crops, 7. Irrigation method & soil type, 8. Farming goals.
3. **Sub-Divided Land Plots Management (`/farmer/plots`)**:
   - Allows farmers to divide their registered farmland into multiple plots, assign specific crop rotations, soil variations, and distinct irrigation methods per plot.
4. **Complete Centralized Bilingual Support (Tamil Default)**:
   - Centralized i18next translation covering 100% of headers, labels, tooltips, chart legends, simulation controls, educational narrator, and notifications.
   - Instant language switching without page reload, persisted in localStorage and user database profile.
5. **Interactive Visual Farm Simulation World (விவசாய அனுபவ உலகம்)**:
   - **Simulation 1: Climate Change Simulator** (+1°C to +6°C temperature rise, -50% to +50% seasonal rainfall, 0 to 40 days dry spell, 2.5D animated field with sun glare, heat shimmers, dynamic leaf wilting, and soil desiccation).
   - **Simulation 2: Smart Irrigation Simulator** (3D Soil Cross-Section with crop canopy, topsoil, subsoil, root zones, drippers, sprinklers, wetting bulbs, percolation leakage, water efficiency %, kWh electricity saved, and INR savings).
   - **Simulation 3: Crop Rotation Simulator** (Multi-season sequential crop growth, animated rhizobial nitrogen fixation nodules, soil organic carbon accumulation %, and annual economic return).
   - **Simulation 4: Flood & Drought Extreme Weather Defense** (Monsoon storm clouds, torrential rain, ponding depth, root asphyxiation, testing drainage trenches and raised beds; Drought soil cracking and straw mulching / drip relief).
   - **Simulation 5: Crop Stress & Survival Arena** (Side-by-side comparison of Paddy, Finger Millet, Groundnut, and Cotton under drought, heatwave, waterlogging, or salinity with 30-day survival decay curves).
   - **Simulation 6: Complete Farming Season Journey** (120-day journey from land prep to harvest, interactive farmer management choices for sowing dates, irrigation, and IPM pest control with an end-of-season P&L scorecard).
6. **Simulation Animation Controls & Educational Voice Narrator**:
   - Play, Pause, Resume, Reset, Replay, Speed (0.5x, 1x, 2x), Timeline Step slider, and Before/After comparison view.
   - Real-time bilingual commentary with Web Speech API audio playback (`speechSynthesis`).
7. **Saved Simulation Scenarios & Side-by-Side Comparison Engine**:
   - Save any hypothetical scenario, view all saved scenarios for the farmland, compare 2 or more scenarios side-by-side, and export CSV/printable summaries.
8. **NASA Environmental Intelligence & Category 1-4 Provenance**:
   - Strict NASA data policy: NASA POWER, GPM IMERG, SMAP, MODIS, HLS, MERRA-2.
   - Categorized provenance badges on every data point (Category 1: NASA Source Data, Category 2: Calculated Indicator, Category 3: Agricultural Recommendation, Category 4: Simulated Scenario).

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Forest Green, Leaf Green, Cyan, Earth Brown)
- **Internationalization**: react-i18next (Tamil `ta` default, English `en` toggle)
- **Analytics & Charts**: Recharts
- **Maps**: Leaflet + React-Leaflet with OpenStreetMap base layer & NASA GIBS satellite overlay
- **Visual Simulations**: HTML5 Canvas 2.5D & 3D Cross-Section Animation Engines with 60 FPS performance
- **Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **HTTP Client**: Axios with Bearer JWT interceptors

### Backend
- **Framework**: Python 3.11+ / FastAPI
- **Security & Authentication**: PBKDF2-HMAC-SHA256 salted password hashing, JWT cryptographic signed tokens, role-based dependencies
- **Data Validation**: Pydantic v2
- **Database ORM**: SQLAlchemy 2.0 (Dual-mode: SQLite `nilam_pesum.db` for instant local development, PostgreSQL / Supabase ready)
- **HTTP Client**: HTTPX for live NASA Earth Science API retrieval
- **Scientific Stack**: NumPy, Pandas, GeoPandas, Rasterio, Shapely, xarray, SciPy

---

## 3. Directory Structure
```
c:\NASA\
  backend\
    app\
      api\                 # REST routers (auth, plots, simulation_world, farmlands, nasa, analytics, recommendations, voice, reports)
      authentication\      # PBKDF2 hashing, JWT creation/decoding, role dependencies
      core\                # Settings & config
      database\            # SQLAlchemy session & init_db reference seeding
      models\              # 16 SQLAlchemy ORM models (Profile, Farmland, FarmPlot, SavedSimulation, etc.)
      nasa\                # NASA integration services (POWER, GPM, SMAP, MODIS, HLS, MERRA-2, Earthdata auth)
      recommendations\     # TNAU agronomic matrix, 5-dimension suitability scoring engine
      analytics\           # Weather, soil moisture, vegetation, farm health, historical, simulation
      main.py              # FastAPI application entrypoint
    tests\
      test_direct.py       # 14-point baseline unit & integration test suite
      test_upgrade.py      # 6-point upgrade suite (Auth, Onboarding, Plots, Simulations, Save/Compare)
  frontend\
    src\
      components\
        layout\            # Header, Sidebar, BottomNav
        maps\              # FarmlandMap (Leaflet GPS & polygon drawing)
        simulations\       # SimulationControlBar, EducationalNarrator
        ui\                # NasaProvenanceBadge
      contexts\            # AuthContext, FarmlandContext
      i18n\                # locales/ta/translation.json, locales/en/translation.json
      pages\
        auth\              # LoginPage, RegisterPage, ForgotPasswordPage, OnboardingPage
        farmer\            # FarmerDashboard, Weather, Soil Moisture, Vegetation, Recommendations, etc.
        simulations\       # SimulationWorldHub, ClimateChangeSimulator, SmartIrrigationSimulator,
                           # CropRotationSimulator, FloodDroughtSimulator, CropStressSimulator,
                           # FarmingSeasonSimulator, SavedSimulationsPage
        FarmPlotsPage.tsx  # Sub-divided land plot manager
        officer\           # OfficerDashboard
        admin\             # AdminDashboard
      App.tsx              # Router definition
  scripts\
    run_dev.bat            # 1-click startup batch script
```

---

## 4. Verification & Testing

### Backend Test Suites:
Run the complete automated verification suite:
```bash
python -c "import sys; sys.path.insert(0, 'backend'); from tests.test_direct import test_all; test_all(); from tests.test_upgrade import test_full_upgrade_suite; test_full_upgrade_suite()"
```
**Results**:
- 14/14 Baseline NASA and TNAU agronomic tests PASSED.
- 6/6 Upgrade tests (PBKDF2 Password Hashing, JWT Tokens, Onboarding Wizard, Farm Plots CRUD, 6 Simulation World Engines, Saved Scenarios & Comparisons) PASSED.

### Frontend Production Build:
```bash
npm --prefix frontend run build
```
**Results**:
- Built in ~20 seconds with **0 TypeScript and 0 Vite compilation errors**.
- Generated production assets in `frontend/dist/`.

---

## 5. Quick Start Instructions

1. **Launch Both Development Servers**:
   Double click or run from terminal:
   ```cmd
   scripts\run_dev.bat
   ```
2. **Access the Web Application**:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend Interactive API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
3. **Pre-Seeded Demonstration Logins**:
   - **Farmer**: `farmer@nilampesum.tn.gov.in` / `farmer123`
   - **Agri Officer**: `officer@nilampesum.tn.gov.in` / `officer123`
   - **Administrator**: `admin@nilampesum.tn.gov.in` / `admin123`
