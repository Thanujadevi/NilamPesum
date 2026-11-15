# NILAM PESUM (நிலம் பேசும்) - System Architecture

## 1. System Overview
**NILAM PESUM (நிலம் பேசும்)** ("Let Your Land Speak. Let Data Guide Your Farming.") is an AI-powered agricultural intelligence, satellite monitoring, and smart crop rotation recommendation platform specifically engineered for farmers in Tamil Nadu, India.

The platform bridges authentic spaceborne Earth observation data from NASA with regional agronomic knowledge from the Tamil Nadu Agricultural University (TNAU) and Indian Council of Agricultural Research (ICAR).

```
+-----------------------------------------------------------------------------------+
|                              FARMER / OFFICER / ADMIN                             |
|               (Mobile Browser, Tablet, Desktop, Spoken Tamil / English)            |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        REACT 18 + TYPESCRIPT FRONTEND (Vite)                      |
|  - Tailwind CSS (Forest Green, Leaf Green, Warm Cream, Earth Brown)               |
|  - Bilingual i18next (Tamil Default, English)                                     |
|  - Recharts (Daily Weather, 10-Yr Climatology, Soil Moisture & Vegetation)        |
|  - Leaflet + React-Leaflet (OSM Base Map + NASA GIBS Satellite Overlay)           |
|  - Web Speech API (Spoken Tamil Voice Recognition & SpeechSynthesis)              |
+-----------------------------------------------------------------------------------+
                                         |  REST API Calls (/api)
                                         v
+-----------------------------------------------------------------------------------+
|                           FASTAPI PYTHON 3.11+ BACKEND                            |
|  - Pydantic v2 Request/Response Validation                                        |
|  - Strict 4-Category Data Provenance Layer                                        |
|  - NASA Data Ingestion Services (POWER, GPM, SMAP, MODIS, HLS, MERRA-2)           |
|  - Multi-Factor Crop Suitability Scoring Engine (TNAU Agronomic Matrix)          |
|  - Climate Scenario Simulator (What-If Stress Testing)                            |
|  - Tamil Spoken Query NLP Reasoning Engine                                        |
+-----------------------------------------------------------------------------------+
                     |                                         |
                     v                                         v
+---------------------------------------+   +---------------------------------------+
|        DATABASE LAYER (Dual-Mode)     |   |      OFFICIAL NASA EARTH SCIENCE      |
|  - Supabase PostgreSQL (Production)   |   |  - NASA POWER API (Agroclimatology)   |
|  - SQLite 3 (Zero-Dependency Local)   |   |  - NASA GPM IMERG (Precipitation)     |
|  - SQLAlchemy 2.0 ORM                 |   |  - NASA SMAP (Soil Moisture L3/L4)    |
|  - PostGIS & GeoJSON Spatial Storage  |   |  - NASA MODIS (NDVI/EVI 250m)         |
|  - Full RLS Security Policies         |   |  - NASA HLS (30m Harmonized Landsat)  |
+---------------------------------------+   |  - NASA MERRA-2 (Reanalysis Baseline) |
                                            +---------------------------------------+
```

## 2. Key Subsystems

### 2.1 NASA Data Ingestion Layer
- **NASA POWER Service**: Connects to the live daily agroclimatology API (`https://power.larc.nasa.gov/api/temporal/daily/point`). Automatically handles fill values (-999.0) and ingests daily maximum, minimum, and mean temperatures, precipitation, relative humidity, and solar radiation.
- **NASA GPM IMERG Service**: Quantifies precipitation volume, drought periods, and heavy rain spells.
- **NASA SMAP Service**: Retrieves satellite L-band radiometer measurements of surface volumetric moisture (0-5cm) and assimilated root-zone moisture (0-100cm).
- **NASA MODIS Service**: Provides 16-day composite 250-meter NDVI and EVI vegetation vigor.
- **NASA HLS Service**: Provides 30-meter high-resolution canopy reflectance and Fmask cloud filtering.
- **NASA MERRA-2 Service**: Provides atmospheric reanalysis for long-term evaporative demand (ETo) baseline.

### 2.2 Recommendation Subsystem
- **Multi-Factor Weighted Suitability Engine**: Integrates climate fit, water requirement vs historical precipitation and farm irrigation type, soil type matching, crop rotation history (e.g. following cereal with legume), and farmer goals.
- Generates 3 to 5 distinct multi-season rotation plans per farm with plain-language explanations in Tamil and English.

### 2.3 Spoken Voice Assistant
- Driven by the browser's Web Speech API for Tamil (`ta-IN`) and English (`en-IN`) speech recognition and synthesis.
- Backend conversational engine inspects the active farm's NASA observations and generates contextual agricultural guidance.

