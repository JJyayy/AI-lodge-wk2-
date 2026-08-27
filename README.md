# 📝 TaskFlow – Smart To-Do & Productivity Application

> An intuitive, offline-resilient, production-ready task management web application engineered for speed, visual clarity, and seamless organization.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Documentation](https://img.shields.io/badge/docs-PRD%20%26%20Design-blue.svg)]()
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-purple.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

---

## 🌟 Overview & Architecture

**TaskFlow** is structured with complete separation of concerns between frontend, backend, and database:

- **`frontend/` (React + Vite + TypeScript)**
  - Fast, accessible UI adhering to WCAG 2.1 Level AA.
  - Dark & Light mode toggle with OS preference detection.
  - Offline-first fallback persistence in `localStorage` with JSON export/import.
  - Communicates with the backend exclusively via HTTPS REST API using `VITE_API_URL`.
  - Uses Supabase directly *only* for email/password authentication to acquire user access tokens.

- **`backend/` (Python + FastAPI)**
  - API-only backend compatible with Vercel Python serverless runtime.
  - Validates Supabase Bearer JWT tokens and derives user IDs securely (never trusts client-supplied user IDs).
  - Sanitizes all inputs against Cross-Site Scripting (XSS).
  - Executes database operations in Supabase PostgREST within authenticated user RLS context.
  - Strict CORS origin enforcement (never `*` in production).

- **`supabase/` (PostgreSQL Database & RLS)**
  - Native Email/Password authentication.
  - Strict owner-only Row Level Security (RLS) policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
  - Zero exposure or requirement of admin `service_role` secret keys.

---

## 📁 Repository Structure

```
.
├── backend/                  # FastAPI Python backend
│   ├── api/index.py          # Vercel serverless entrypoint
│   ├── app/                  # Main application, config, auth, models, db, routes, services
│   ├── tests/                # Pytest test suite
│   ├── requirements.txt      # Python dependencies
│   ├── vercel.json           # Backend Vercel deployment config
│   ├── .env.example          # Safe template for backend environment variables
│   └── README.md
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components (Navbar, Stats, Inputs, Tasks, Modals, Toasts)
│   │   ├── context/          # AuthContext & TaskContext
│   │   ├── services/         # api.ts, supabase.ts, storage.ts
│   │   ├── styles/           # Design system tokens and styles
│   │   └── types/            # TypeScript interfaces
│   ├── tests/                # Vitest test suite
│   ├── package.json          # Node dependencies & scripts
│   ├── vite.config.ts        # Vite configuration
│   ├── vercel.json           # Frontend SPA rewrite rules
│   ├── .env.example          # Safe template for frontend environment variables
│   └── README.md
│
├── supabase/                 # Database migrations & security documentation
│   ├── migrations/           # SQL migration files
│   └── README.md             # DB schema & RLS policy documentation
│
├── PRD.md                    # Product Requirements Document
├── design.md                 # System & Technical Design Document
└── README.md                 # Project README
```

---

## 🚀 Local Development Setup

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Activate virtual environment:
# On Windows: .\venv\Scripts\Activate.ps1
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/v1/health`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000 and Supabase credentials in frontend/.env
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests & Type Checking
```bash
cd frontend
npm run test
npm run build
```

---

## 🚢 Deploying to Vercel (Independent Projects)

Deploy the **Frontend** and **Backend** as two separate Vercel projects:

### 1. Backend Deployment (Vercel Project 1)
- **Root Directory**: `backend`
- **Framework Preset**: `Other`
- **Environment Variables**:
  - `SUPABASE_URL`: `https://elwihqlydfcutzojsbwu.supabase.co`
  - `SUPABASE_ANON_KEY`: `<Your Supabase Publishable / Anon Key>`
  - `ALLOWED_ORIGINS`: `https://<your-frontend-project>.vercel.app`
  - `ENVIRONMENT`: `production`

### 2. Frontend Deployment (Vercel Project 2)
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: `https://elwihqlydfcutzojsbwu.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `<Your Supabase Publishable / Anon Key>`
  - `VITE_API_URL`: `https://<your-backend-project>.vercel.app` (URL from Project 1)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Focus Search Bar |
| `Enter` | Save / Submit Task |
| `Esc` | Clear Input / Close Modal |
| `Alt + D` | Toggle Dark / Light Theme |
