# NILAM PESUM - Data Processing Pipeline

## 1. Data Ingestion Architecture
1. **Coordinate Acquisition**: The farmer selects their farmland either by pin dropping on Leaflet, polygon boundary drawing, or GPS auto-detection.
2. **NASA Request Construction**: Coordinates are rounded to 4 decimal places and validated within Tamil Nadu bounds ($8.0^\circ\text{N} - 13.5^\circ\text{N}, 76.0^\circ\text{E} - 80.5^\circ\text{E}$).
3. **NASA POWER Point API Call**: Dispatched with parameters `T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN` under `community=AG`.
4. **Data Cleansing**: Documented NASA fill values (`-999.0`) are detected and normalized to `None`.
5. **Persistence**: Ingested records are upserted into `environmental_observations` with foreign keys referencing the farmland and NASA product.
6. **Provenance Logging**: The complete HTTP request URL, parameters, duration in milliseconds, and status are committed to `nasa_api_logs`.

## 2. Spatial Aggregation
- Farmland polygons are processed via spherical Shoelace triangulation to compute area in acres and hectares.
- For regional agricultural officer overviews, private farm boundaries are aggregated at the village and taluk level to ensure farmer privacy.

## 3. Provenance Categories
- **Category 1 (NASA Source Data)**: Direct satellite observations.
- **Category 2 (Calculated Indicators)**: Farm Health Score, rainfall anomalies, NDVI trajectories.
- **Category 3 (Agricultural Recommendations)**: Multi-season crop rotation plans.
- **Category 4 (Simulated Scenarios)**: What-if climate stress tests.

