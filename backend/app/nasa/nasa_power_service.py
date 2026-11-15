import time
import httpx
import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import EnvironmentalObservation, NasaApiLog, Farmland

logger = logging.getLogger("nilam_pesum.nasa.power")

FILL_VALUE = -999.0

class NasaPowerService:
    """
    NASA Prediction Of Worldwide Energy Resources (POWER) API Integration.
    Official Endpoint: https://power.larc.nasa.gov/api/temporal/daily/point
    Community: AG (Agroclimatology)
    Parameters:
      - T2M: Temperature at 2 Meters (°C)
      - T2M_MAX: Maximum Temperature at 2 Meters (°C)
      - T2M_MIN: Minimum Temperature at 2 Meters (°C)
      - PRECTOTCORR: Precipitation Corrected (mm/day)
      - RH2M: Relative Humidity at 2 Meters (%)
      - ALLSKY_SFC_SW_DWN: All Sky Surface Shortwave Downward Irradiance (MJ/m²/day)
    """

    def __init__(self):
        self.base_url = settings.NASA_POWER_BASE_URL
        self.timeout = 30.0

    async def fetch_daily_point_data(
        self,
        db: Session,
        farmland: Farmland,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        parameters: str = "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN"
    ) -> Dict[str, Any]:
        """
        Fetches authentic NASA POWER daily observations for given farmland coordinates.
        Saves records into environmental_observations and logs the API request.
        """
        # Default to past 30 days if no range specified
        if not end_date:
            end_dt = datetime.utcnow().date() - timedelta(days=2) # NASA POWER typically has 1-2 days latency
            end_date = end_dt.strftime("%Y%m%d")
        if not start_date:
            start_dt = datetime.strptime(end_date, "%Y%m%d").date() - timedelta(days=30)
            start_date = start_dt.strftime("%Y%m%d")

        params = {
            "parameters": parameters,
            "community": "AG",
            "longitude": round(farmland.longitude, 4),
            "latitude": round(farmland.latitude, 4),
            "start": start_date,
            "end": end_date,
            "format": "JSON"
        }

        start_time = time.time()
        logger.info(f"Connecting to NASA POWER for Farmland {farmland.id} ({farmland.latitude}, {farmland.longitude}) from {start_date} to {end_date}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                duration_ms = int((time.time() - start_time) * 1000)

                if response.status_code != 200:
                    error_text = response.text[:500]
                    self._log_api_call(db, farmland.id, str(response.url), params, response.status_code, duration_ms, 0, "error", error_text)
                    logger.error(f"NASA POWER API returned error status {response.status_code}: {error_text}")
                    return {"success": False, "status_code": response.status_code, "error": error_text}

                data = response.json()
                records_parsed = self._process_and_save_data(db, farmland, data)
                self._log_api_call(db, farmland.id, str(response.url), params, response.status_code, duration_ms, records_parsed, "success", None)
                
                farmland.last_synced_at = datetime.utcnow()
                db.commit()

                return {
                    "success": True,
                    "records_count": records_parsed,
                    "date_range": f"{start_date} to {end_date}",
                    "nasa_header": data.get("header", {}),
                    "provenance": {
                        "source": "NASA POWER (Prediction Of Worldwide Energy Resources)",
                        "official_url": "https://power.larc.nasa.gov/",
                        "community": "AG",
                        "time_standard": data.get("header", {}).get("time_standard", "LST"),
                        "spatial_resolution": "0.5° x 0.625°",
                        "retrieval_timestamp": datetime.utcnow().isoformat()
                    }
                }

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            logger.exception(f"Error fetching NASA POWER data: {e}")
            self._log_api_call(db, farmland.id, self.base_url, params, 500, duration_ms, 0, "error", str(e))
            return {"success": False, "error": str(e)}

    def _process_and_save_data(self, db: Session, farmland: Farmland, data: Dict[str, Any]) -> int:
        """Parses NASA POWER JSON parameters and upserts into environmental_observations."""
        properties = data.get("properties", {})
        parameter_data = properties.get("parameter", {})
        
        t2m_dict = parameter_data.get("T2M", {})
        t2m_max_dict = parameter_data.get("T2M_MAX", {})
        t2m_min_dict = parameter_data.get("T2M_MIN", {})
        precip_dict = parameter_data.get("PRECTOTCORR", {})
        rh_dict = parameter_data.get("RH2M", {})
        solar_dict = parameter_data.get("ALLSKY_SFC_SW_DWN", {})

        all_dates = set(t2m_dict.keys()) | set(precip_dict.keys())
        saved_count = 0

        for d_str in all_dates:
            try:
                obs_date = datetime.strptime(d_str, "%Y%m%d").date()
            except ValueError:
                continue

            # Handle fill value (-999.0)
            def clean_val(val):
                if val is None or val == FILL_VALUE:
                    return None
                return float(val)

            t2m = clean_val(t2m_dict.get(d_str))
            t2m_max = clean_val(t2m_max_dict.get(d_str))
            t2m_min = clean_val(t2m_min_dict.get(d_str))
            precip = clean_val(precip_dict.get(d_str))
            rh = clean_val(rh_dict.get(d_str))
            solar = clean_val(solar_dict.get(d_str))

            # Upsert into database
            existing = db.query(EnvironmentalObservation).filter(
                EnvironmentalObservation.farmland_id == farmland.id,
                EnvironmentalObservation.observation_date == obs_date,
                EnvironmentalObservation.source_id == "nasa_power"
            ).first()

            if existing:
                existing.temperature_avg_c = t2m
                existing.temperature_max_c = t2m_max
                existing.temperature_min_c = t2m_min
                existing.precipitation_mm = precip
                existing.relative_humidity_pct = rh
                existing.solar_radiation_mj_m2 = solar
            else:
                new_obs = EnvironmentalObservation(
                    farmland_id=farmland.id,
                    observation_date=obs_date,
                    source_id="nasa_power",
                    temperature_avg_c=t2m,
                    temperature_max_c=t2m_max,
                    temperature_min_c=t2m_min,
                    precipitation_mm=precip,
                    relative_humidity_pct=rh,
                    solar_radiation_mj_m2=solar,
                    provenance_metadata={
                        "product": "NASA POWER Agroclimatology Daily Point",
                        "grid_resolution": "0.5x0.625 deg",
                        "fill_value_applied": FILL_VALUE
                    }
                )
                db.add(new_obs)
            saved_count += 1

        db.commit()
        return saved_count

    def _log_api_call(
        self, db: Session, farmland_id: Optional[str], endpoint: str,
        params: Dict[str, Any], status_code: int, duration_ms: int,
        records_count: int, status: str, error_message: Optional[str]
    ):
        """Logs the API call in nasa_api_logs table for provenance and auditability."""
        log = NasaApiLog(
            source_id="nasa_power",
            farmland_id=farmland_id,
            endpoint_called=endpoint,
            request_params=params,
            status_code=status_code,
            response_time_ms=duration_ms,
            records_retrieved=records_count,
            status=status,
            error_message=error_message
        )
        db.add(log)
        db.commit()

nasa_power_service = NasaPowerService()

