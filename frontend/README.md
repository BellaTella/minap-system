# MiNaP Frontend — React + Vite

Modern React frontend for the MiNaP PTSD Indicator System.

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development

The dev server runs on `http://localhost:3000` and proxies API requests to the Django backend at `http://127.0.0.1:8000`.

Make sure the Django backend is running before starting the frontend.

## Project Structure

```
src/
├── components/       # Reusable components (Navbar, Footer, etc.)
├── pages/           # Page components (Home, Screening, Dashboard)
├── utils/           # Utilities (API client, helpers)
├── App.jsx          # Main app with routing
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Pages

- `/` — Home page with hero and info
- `/screening` — Anonymous PTSD screening form
- `/counsellor/login` — Counsellor authentication
- `/counsellor/dashboard` — Counsellor case management (protected)

## API Integration

All API calls go through `src/utils/api.js` which handles:
- Auth token injection
- 401 redirect to login
- Base URL configuration

## TODO

Complete the following pages (stubs created):
- `src/pages/Screening.jsx` — Multi-step PCL-5 form
- `src/pages/CounsellorLogin.jsx` — Login form
- `src/pages/CounsellorDashboard.jsx` — Dashboard with stats, cases, referrals

Refer to the Django templates in `backend/templates/` for the full implementation logic.
