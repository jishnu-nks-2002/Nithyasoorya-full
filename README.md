# Gallery Hero Admin Panel

A full-stack admin panel for managing your Gallery Hero section — built with **Node.js + Express + MongoDB** (backend) and **React + Vite** (frontend).

---

## Project structure

```
gallery-hero-admin-react/
├── backend/               # Express API
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── galleryHeroController.js
│   ├── middleware/
│   │   ├── auth.js        # JWT protect middleware
│   │   └── upload.js      # Multer + Cloudinary stream upload
│   ├── models/
│   │   ├── Admin.js
│   │   └── GalleryHero.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── galleryHero.js
│   ├── scripts/
│   │   └── seed.js        # Creates first admin + default config
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/              # React + Vite admin panel
    ├── src/
    │   ├── api/
    │   │   ├── axios.js       # Axios instance with JWT interceptor
    │   │   ├── auth.js
    │   │   └── galleryHero.js
    │   ├── components/
    │   │   ├── Layout.jsx     # Sidebar + main shell
    │   │   ├── SlideModal.jsx # Add/Edit slide modal
    │   │   └── ui/            # Reusable UI primitives
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Slides.jsx     # CRUD + drag-to-reorder
    │   │   └── Settings.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Quick start

### 1. Clone & configure

```bash
# Backend
cd backend
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, and Cloudinary credentials in .env

# Frontend
cd ../frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000 (or leave blank to use Vite proxy)
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Seed the database

This creates your first admin account and the default GalleryHero config:

```bash
cd backend
npm run seed
```

The seed credentials come from your `.env`:
```
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=changeme123
```

### 4. Run

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev        # uses nodemon for hot reload
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Admin panel at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) and sign in with your seed credentials.

---

## API reference

All protected routes require `Authorization: Bearer <token>` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | — | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | Get current admin |
| `PUT` | `/api/auth/update-profile` | ✅ | Update name/email |
| `PUT` | `/api/auth/update-password` | ✅ | Change password |
| `GET` | `/api/gallery-hero` | — | Public hero config (active slides only) |
| `GET` | `/api/gallery-hero/admin` | ✅ | Full config (all slides) |
| `PUT` | `/api/gallery-hero/settings` | ✅ | Update text settings |
| `POST` | `/api/gallery-hero/slides` | ✅ | Add slide (multipart/form-data) |
| `PUT` | `/api/gallery-hero/slides/reorder` | ✅ | Reorder slides |
| `PUT` | `/api/gallery-hero/slides/:id` | ✅ | Update slide |
| `PUT` | `/api/gallery-hero/slides/:id/poster` | ✅ | Update video poster |
| `DELETE` | `/api/gallery-hero/slides/:id` | ✅ | Delete slide |

---

## Frontend features

- **Login page** — JWT auth, token stored in localStorage
- **Dashboard** — stats (total / active / images / videos) + config overview
- **Manage Slides** — card grid with drag-to-reorder, add / edit / delete / hide/show
- **Settings** — hero text settings, profile update, password change, API reference
- **Protected routes** — auto-redirect to `/login` on 401

---

## Deployment

### Backend
Deploy to any Node.js host (Railway, Render, Fly.io, etc). Set all `.env` variables in your host's environment settings.

### Frontend
```bash
cd frontend
npm run build
# Outputs to frontend/dist/ — deploy to Vercel, Netlify, or serve statically
```

Set `VITE_API_URL` to your deployed backend URL before building.

---

## Tech stack

| Layer | Tech |
|-------|------|
| Backend runtime | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File uploads | Multer (memory) + Cloudinary |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP client | Axios |
| Notifications | react-hot-toast |
| Styles | CSS Modules |
