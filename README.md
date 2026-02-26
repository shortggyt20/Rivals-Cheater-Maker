# Rivals Watch – Roblox Rivals Account Reputation System

## Project Structure

```text
rivals-watch/
├── .env.example
├── package.json
├── README.md
└── src
    ├── config
    │   └── db.js
    ├── logs/
    ├── middleware
    │   ├── auth.js
    │   ├── rateLimiter.js
    │   ├── upload.js
    │   └── validators.js
    ├── models
    │   ├── ActivityLog.js
    │   ├── Appeal.js
    │   ├── Report.js
    │   └── User.js
    ├── public
    │   ├── css/
    │   └── js
    │       └── app.js
    ├── routes
    │   ├── admin.js
    │   ├── api.js
    │   ├── auth.js
    │   ├── reports.js
    │   └── web.js
    ├── server.js
    ├── services
    │   ├── logService.js
    │   ├── robloxService.js
    │   └── scoreService.js
    ├── uploads/
    └── views
        ├── admin
        │   └── dashboard.ejs
        ├── auth
        │   └── login.ejs
        ├── index.ejs
        ├── partials
        │   ├── footer.ejs
        │   └── header.ejs
        └── profile.ejs
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env
   ```
3. Fill `.env` values for MongoDB, JWT/session secrets, and Roblox OAuth app credentials.
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
- `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin` (requires admin role user in DB)

## Production Deployment Guide

### 1) Server hardening
- Set `NODE_ENV=production`.
- Use strong unique `SESSION_SECRET` and `JWT_SECRET`.
- Put app behind reverse proxy (Nginx/Caddy) with TLS.
- Restrict `/uploads` with antivirus scanning in production.
- Rotate logs and enable centralized monitoring.

### 2) Process management
- Use PM2 or systemd:
  ```bash
  npm install -g pm2
  pm2 start src/server.js --name rivals-watch
  pm2 save
  pm2 startup
  ```

### 3) Database
- Use managed MongoDB with auth and IP allowlisting.
- Enable backups and point-in-time restore.
- Create indexes automatically on first boot.

### 4) Storage
- For scale, replace local `/uploads` with S3-compatible object storage + signed URLs.

### 5) Reverse proxy example (Nginx)
```nginx
server {
  listen 443 ssl;
  server_name rivalswatch.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Security Checklist
- Helmet headers, HPP, NoSQL injection sanitation.
- CSRF protection on all forms.
- Input validation and length limits.
- Upload MIME + size validation.
- IP rate limits for global and report endpoints.
- Auth + admin role checks.
- Shadow-ban and abuse handling.
