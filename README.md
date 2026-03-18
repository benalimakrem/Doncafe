# ☕ Don Café — Full-Stack Digital Menu

A complete café management system: public menu, admin panel, QR code generator.
Built with pure Node.js — zero npm dependencies required.

## 🚀 Quick Start

Requires Node.js v22+ (uses built-in node:sqlite)

    node server.js

Open:
  - Customer Menu : http://localhost:3000/
  - Admin Panel   : http://localhost:3000/admin
  - QR Code (SVG) : http://localhost:3000/api/qr

Default credentials: admin / doncafe2025

## 📁 Structure

    doncafe/
    ├── server.js              ← Full backend (pure Node.js)
    ├── doncafe.db             ← SQLite DB (auto-created on first run)
    ├── README.md
    └── frontend/public/
        ├── index.html         ← Customer menu
        └── admin.html         ← Admin dashboard

## 🔌 API

Public:
  GET  /api/menu              → categories + items + settings
  GET  /api/qr                → QR code SVG (encodes live URL)

Auth:
  POST /api/auth/login        → { username, password } → JWT

Admin (JWT required via Authorization: Bearer <token>):
  GET/POST   /api/admin/categories
  PUT/DELETE /api/admin/categories/:id
  GET/POST   /api/admin/items
  PUT/DELETE /api/admin/items/:id
  GET/PUT    /api/admin/settings
  POST       /api/admin/change-password

## ✨ Feature Highlights

  - Zero npm dependencies (Node.js built-ins only)
  - SQLite database via node:sqlite (Node 22+)
  - JWT auth via native crypto (HMAC-SHA256)
  - QR code generated server-side (ISO 18004, pure JS)
  - Unavailable items hidden from public menu instantly
  - Café branding editable from admin panel
  - QR downloadable as SVG for printing

## 🛠 Production Deployment

  npm install -g pm2
  pm2 start server.js --name doncafe
  pm2 save

Use nginx as a reverse proxy on port 80/443.
The QR auto-encodes the Host header, so it works with any domain or IP.
