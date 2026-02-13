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

## Database migrations

After the main schema, run people-based migrations and profile fields:

```bash
cd backend
node run-schema.js
# If you have migrations 002/003 (people-centric), run them via psql or run-migration.
node run-migration.js migrations/004-profile-fields.sql
```

## API (TrustNest people-based)

- **GET /api/users/search?city=lisbon&user_type=landlord|tenant** → `{ users: [...] }`
- **GET /api/users/:id** → `{ user: {...}, reviews: [...] }`
- **POST /api/reviews** (auth) body: `{ reviewed_user_id, rating, title, description }` → `{ review: {...} }`
- **GET /api/me** (auth) → current user (id, name, email, user_type, city, bio, years_active, rentals_count, response_time_hours, etc.)

## Search & review flow (people)

1. Start backend and frontend (see Quick start).
2. Open http://localhost:5173 → sign in with Google.
3. **Search**: enter a city (e.g. Lisbon), optionally filter Landlords/Tenants. Results show people with rating, review count, “View profile”.
4. Click a person → **Profile**: name, verified badge, rating, bio, stats (rentals, years active, response time), reviews.
5. **Leave a review**: open modal, stars + title + description → Submit. Review is pending until the reviewed person approves.
6. As the **reviewed person**: “Pending reviews” with Approve/Reject on your profile.

## Design (premium UI)

- **Colors:** Primary blue (`#1e40af`), accent amber (`#f59e0b`), success green, danger red, neutral grays. See `frontend/tailwind.config.js`.
- **Icons:** `lucide-react` (Search, MapPin, Home, User, Star, CheckCircle, Clock, Plus, X, LogOut, Menu).
- **To view:** Run frontend (`npm run dev` in `frontend`), open http://localhost:5173, sign in, and use Search → property card → detail page and review form.
