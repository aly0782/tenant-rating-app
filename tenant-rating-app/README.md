# Tenant Rating App

Bidirectional tenant–landlord rating app. Starting with **Portugal** market, with expansion to **India** (Phase 2).

## Quick start

### Backend (port 5001)
```bash
cd backend && npm run dev
```

### Frontend (port 5173)
```bash
cd frontend && npm run dev
```

## Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL

## Google OAuth

Backend expects `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `DATABASE_URL`.

### Test auth flow

1. **Health:** `curl http://localhost:5001/api/health`
2. **Login (needs real Google idToken from frontend):**  
   `curl -X POST http://localhost:5001/api/auth/google -H "Content-Type: application/json" -d '{"idToken":"YOUR_GOOGLE_ID_TOKEN"}'`
3. **Me (protected):** `curl -H "Authorization: Bearer YOUR_JWT" http://localhost:5001/api/me`
4. **No/invalid token:** `curl http://localhost:5001/api/me` → 401
