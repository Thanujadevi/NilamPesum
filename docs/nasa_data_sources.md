# NILAM PESUM - Official NASA Data Sources Catalog

## Strict Data Source Policy
**NASA is the primary and exclusive provider of environmental and satellite datasets.** No commercial weather APIs, unverified third-party models, or re-labeled datasets are permitted.

---

### 1. NASA Prediction Of Worldwide Energy Resources (POWER)
- **Organization**: NASA Langley Research Center (LaRC)
- **Official URL**: https://power.larc.nasa.gov/docs/services/api/
- **Product Name**: NASA POWER Agroclimatology Daily Point API
- **Endpoint**: `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Variables**:
  - `T2M`: Temperature at 2 Meters (°C)
  - `T2M_MAX`: Maximum Temperature at 2 Meters (°C)
  - `T2M_MIN`: Minimum Temperature at 2 Meters (°C)
  - `PRECTOTCORR`: Precipitation Corrected (mm/day)
  - `RH2M`: Relative Humidity at 2 Meters (%)
  - `ALLSKY_SFC_SW_DWN`: All Sky Surface Shortwave Downward Irradiance (MJ/m²/day)
- **Spatial Resolution**: 0.5° x 0.625° (~50 km)
- **Temporal Resolution**: Daily
- **Historical Coverage**: 1981 to Present (~43 years)
- **Authentication**: None required (Public Open API)
- **Fill Value**: -999.0

---

### 2. NASA Global Precipitation Measurement (GPM) - IMERG
- **Organization**: NASA Goddard Space Flight Center (GSFC) / JAXA
- **Official URL**: https://gpm.nasa.gov/data/imerg
- **Product Identifier**: GPM_3IMERGDF (Final Run v07)
- **Variables**: Calibrated precipitation rate (mm/hr), Daily accumulated precipitation (mm)
- **Spatial Resolution**: 0.1° x 0.1° (~10 km)
- **Temporal Resolution**: Daily / Monthly
- **Historical Coverage**: June 2000 to Present (Combined TRMM + GPM)
- **Authentication**: NASA Earthdata Login (URS)

---

### 3. NASA Soil Moisture Active Passive (SMAP)
- **Organization**: NASA Jet Propulsion Laboratory (JPL) / GSFC / NSIDC DAAC
- **Official URL**: https://nsidc.org/data/smap
- **Products**:
  - `SPL3SMP_E`: Enhanced Surface Soil Moisture (0-5 cm, 9 km)
  - `SPL4SMGP`: Geophysical Root-Zone Soil Moisture (0-100 cm, 9 km assimilated)
- **Measurement Units**: Volumetric Soil Moisture (cm³/cm³ or m³/m³)
- **Spatial Resolution**: 9 km / 36 km
- **Temporal Revisit**: 2 to 3 days
- **Scientific Distinction**: SMAP provides satellite-derived volumetric water content in soil via L-band radiometry. It is not a direct laboratory measurement of chemical soil pH or nutrient nitrogen.

---

### 4. NASA MODIS (Moderate Resolution Imaging Spectroradiometer)
- **Organization**: NASA GSFC / Land Processes DAAC (LP DAAC)
- **Official URL**: https://modis.gsfc.nasa.gov/data/
- **Products**: MOD13Q1 (Terra) / MYD13Q1 (Aqua)
- **Variables**: NDVI (Normalized Difference Vegetation Index), EVI (Enhanced Vegetation Index)
- **Spatial Resolution**: 250 meters
- **Temporal Resolution**: 16-Day Composite
- **Quality Assurance**: Pixel reliability flags, Cloud masking
- **Scientific Distinction**: NDVI and EVI indicate photosynthetic vigor and canopy greenness; they do not directly measure final harvest yield.

---

### 5. NASA Harmonized Landsat and Sentinel-2 (HLS)
- **Organization**: NASA GSFC / USGS / ESA / LP DAAC (Earthdata Cloud)
- **Official URL**: https://hls.gsfc.nasa.gov/data-access-and-tools/
- **Products**: HLSL30 (Landsat 8/9, 30m) & HLSS30 (Sentinel-2A/2B, 30m)
- **Variables**: Multi-spectral surface reflectance, 30m high-resolution NDVI
- **Spatial Resolution**: 30 meters (Field Scale)
- **Temporal Revisit**: 2 to 3 days combined
- **Quality Mask**: Fmask (Cloud, shadow, snow, water)

---

### 6. NASA MERRA-2 Atmospheric Reanalysis
- **Organization**: NASA GSFC Global Modeling and Assimilation Office (GMAO)
- **Official URL**: https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/
- **Variables**: Reference crop evapotranspiration demand (ETo), solar insolation, long-term climatology
- **Spatial Resolution**: 0.5° x 0.625°
- **Scientific Distinction**: MERRA-2 is a physical atmospheric reanalysis combining global spaceborne observations with general circulation modeling, not a direct ground station measurement.

