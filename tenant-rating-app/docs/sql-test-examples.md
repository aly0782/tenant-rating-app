# SQL examples for testing property & review routes

Run these in order if you need seed data. Replace `YOUR_USER_ID` and `YOUR_LANDLORD_ID` with real IDs from your `users` table.

---

## 1. GET /api/properties/search?city=lisbon

**No SQL needed** – ensure you have at least one property in Lisbon:

```sql
-- List existing properties (see landlord_id for POST test)
SELECT id, address, city, landlord_id FROM properties;

-- Optional: insert a property (use an existing user id as landlord_id)
INSERT INTO properties (address, city, postal_code, property_type, landlord_id)
VALUES ('Rua Example 1', 'Lisbon', '1200-100', 'apartment', YOUR_USER_ID);
```

**Test:** `curl "http://localhost:5001/api/properties/search?city=lisbon"`

---

## 2. GET /api/properties/:id

**Ensure property and reviews exist:**

```sql
-- Pick a property id from your DB
SELECT * FROM properties WHERE id = 1;

-- Optional: add a review so the response includes reviews
INSERT INTO reviews (reviewer_id, property_id, rating, title, description, is_verified)
VALUES (YOUR_USER_ID, 1, 5, 'Great place', 'Very clean and quiet.', false);
```

**Test:** `curl http://localhost:5001/api/properties/1`

---

## 3. POST /api/properties (protected)

**No seed needed.** Call with JWT:

```bash
curl -X POST http://localhost:5001/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"address":"Rua Nova 10","city":"Lisbon","postal_code":"1100-200","property_type":"apartment"}'
```

**Verify:** `SELECT * FROM properties ORDER BY id DESC LIMIT 1;`

---

## 4. POST /api/reviews (protected)

**No seed needed.** Call with JWT (tenant user):

```bash
curl -X POST http://localhost:5001/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TENANT_JWT" \
  -d '{"property_id":1,"rating":5,"title":"Excellent","description":"Would rent again."}'
```

**Verify:** `SELECT * FROM reviews ORDER BY id DESC LIMIT 1;`

---

## 5. PUT /api/reviews/:id/approve (protected – landlord only)

**Ensure review exists and you use the landlord’s JWT.**

```sql
-- See pending reviews (is_verified = false)
SELECT id, property_id, reviewer_id, rating FROM reviews WHERE is_verified = false;
```

**Test:** `curl -X PUT http://localhost:5001/api/reviews/1/approve -H "Authorization: Bearer LANDLORD_JWT"`

**Verify:** `SELECT id, is_verified FROM reviews WHERE id = 1;`

---

## 6. PUT /api/reviews/:id/reject (protected – landlord only)

**Test:** `curl -X PUT http://localhost:5001/api/reviews/1/reject -H "Content-Type: application/json" -H "Authorization: Bearer LANDLORD_JWT" -d '{"reason":"Dates do not match"}'`

**Verify:** `SELECT id, is_verified, rejection_reason FROM reviews WHERE id = 1;`  
(Requires migration for `rejection_reason`: run `backend/migrations/001-reviews-rental-rejection.sql`.)

---

## 7. GET /api/users/me/pending-reviews (protected)

**No SQL needed.** Call with landlord JWT; returns reviews where `is_verified = false` for that landlord’s properties.

**Test:** `curl -H "Authorization: Bearer LANDLORD_JWT" http://localhost:5001/api/users/me/pending-reviews`

---

## Optional: run migration for rejection_reason (and rental dates)

From `/backend`:

```bash
# Load .env then run (adjust if your DB URL is elsewhere)
psql "$DATABASE_URL" -f migrations/001-reviews-rental-rejection.sql
```

Or with Node: add a small script that reads the migration file and runs it with `pool.query`.
