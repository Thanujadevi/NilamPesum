# NILAM PESUM - Deployment Guide

## 1. Local Development
### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -c "from app.database.init_db import init_database; init_database()"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000` (or `http://localhost:5173`)
Backend Docs: `http://127.0.0.1:8000/docs`

---

## 2. Production Deployment (Supabase + Cloud Hosting)

### Database (Supabase PostgreSQL)
1. Create a Supabase project at `https://supabase.com/`.
2. Run `database/schema.sql` in the Supabase SQL Editor.
3. Run `database/seed_reference_data.sql` to populate NASA data sources and TNAU crop catalog.
4. Copy the connection string into `.env`:
   `DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Backend (Docker / Cloud Run / Railway / VPS)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Vercel / Netlify / Cloudflare Pages)
```bash
cd frontend
npm run build
# Deploy dist/ directory
```

