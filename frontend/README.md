# TaskFlow Frontend (React + Vite)

## 1. Overview
The TaskFlow Frontend is a modern, responsive, offline-first productivity web application built with **React**, **TypeScript**, and **Vite**. It adheres to WCAG 2.1 Level AA accessibility, features Dark and Light themes with system detection, keyboard-first navigation (`Ctrl+K`, `Alt+D`, `Enter`, `Esc`), and connects seamlessly to the FastAPI backend while supporting offline client-side storage.

---

## 2. Local Development

### Prerequisites
- Node.js 18+
- `npm`

### Setup Instructions
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
   VITE_API_URL=http://localhost:8000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

---

## 3. Running Frontend Tests & Type Checking
- Run tests:
  ```bash
  npm run test
  ```
- Run type checks and build:
  ```bash
  npm run build
  ```

---

## 4. Vercel Deployment Guide

1. In the Vercel Dashboard, create a new project importing your repository.
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Add the following **Environment Variables** in Vercel:
   - `VITE_SUPABASE_URL`: `https://elwihqlydfcutzojsbwu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<Your Supabase Anon / Publishable Key>`
   - `VITE_API_URL`: `https://<your-backend-project>.vercel.app` (Your deployed FastAPI backend URL)
