# TaskFlow Backend API (FastAPI)

## 1. Overview
The TaskFlow Backend is an asynchronous Python API built with **FastAPI**. It handles all task and category CRUD operations, validates incoming data, sanitizes inputs against XSS, authenticates requests via Supabase Bearer JWT tokens, and communicates with Supabase Postgres through PostgREST under user-scoped Row Level Security (RLS).

---

## 2. Local Development

### Prerequisites
- Python 3.10+
- `pip`

### Setup Instructions
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ENVIRONMENT=development
   ```
5. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. Access interactive API documentation at:
   - Swagger UI: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/api/v1/health`

---

## 3. Running Backend Tests
Execute pytest:
```bash
pytest
```

---

## 4. Vercel Deployment Guide

1. Deploy using the Vercel CLI or Git integration pointing to the `backend/` directory as the project root.
2. In the Vercel Project Settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `backend`
3. Add the following **Environment Variables** in Vercel:
   - `SUPABASE_URL`: `https://elwihqlydfcutzojsbwu.supabase.co`
   - `SUPABASE_ANON_KEY`: `<Your Supabase Anon / Publishable Key>`
   - `ALLOWED_ORIGINS`: `https://<your-frontend-project>.vercel.app` (Strict production frontend origin)
   - `ENVIRONMENT`: `production`
