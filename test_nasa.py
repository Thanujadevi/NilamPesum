import httpx

url = "https://power.larc.nasa.gov/api/temporal/daily/point"
params = {
    "parameters": "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN",
    "community": "AG",
    "longitude": 79.1378,
    "latitude": 10.7870,
    "start": "20240101",
    "end": "20240107",
    "format": "JSON"
}
print("Connecting to official NASA POWER endpoint...")
res = httpx.get(url, params=params, timeout=30.0)
print("Status code:", res.status_code)
if res.status_code == 200:
    data = res.json()
    params_returned = data.get("properties", {}).get("parameter", {})
    print("Parameters returned:", list(params_returned.keys()))
    t2m_sample = params_returned.get("T2M", {})
    print("T2M sample data (first 3 days):", {k: t2m_sample[k] for k in list(t2m_sample.keys())[:3]})
    print("NASA Header metadata:", data.get("header", {}))

