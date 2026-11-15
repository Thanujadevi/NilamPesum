# NILAM PESUM - Security & Privacy Guidelines

## 1. NASA Earthdata Credentials
- Earthdata credentials (`NASA_EARTHDATA_USERNAME`, `NASA_EARTHDATA_PASSWORD`, `NASA_EARTHDATA_TOKEN`) are strictly managed server-side.
- Tokens and passwords are never sent to the browser or exposed in frontend code.
- `.env` is explicitly included in `.gitignore` to prevent credential leaks.

## 2. Row Level Security & Authorization
- Supabase PostgreSQL schema implements Row Level Security (RLS) policies on `profiles`, `farmlands`, `crop_rotation_plans`, `farm_expenses`, and `notifications`.
- Farmers have exclusive read and write access to their own farm records.
- Agricultural Officers only receive geographically aggregated, anonymized village statistics to protect individual farmer financial and farm boundary privacy.

## 3. Input Validation
- All backend REST endpoints validate inputs via Pydantic v2 schemas.
- Geodesic coordinate bounds are validated to prevent invalid coordinates.
- Geodesic polygon area calculations use the spherical Shoelace algorithm to prevent malicious polygon payloads.

