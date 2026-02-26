# Rivals Watch – Roblox Rivals Account Reputation System

## What this build does
- Public Roblox username lookup (no Roblox OAuth app needed).
- Stores cheater reports in MongoDB with evidence uploads.
- Uses anti-spam fingerprinting + IP rate limit to reduce duplicate abuse.
- Admin moderation panel protected by `ADMIN_PANEL_KEY`.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env
   ```
3. Fill `.env`:
   - `MONGO_URI`
   - `SESSION_SECRET`
   - `ADMIN_PANEL_KEY`
4. Ensure MongoDB is running.

## Run Instructions

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Open:
- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin?adminKey=YOUR_ADMIN_PANEL_KEY`

## Notes
- Reports are stored in MongoDB `reports` collection.
- Duplicate report prevention is enforced by `targetRobloxId + reporterFingerprint + reason` unique index.
- Evidence files are saved locally under `src/uploads`.
