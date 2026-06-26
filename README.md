# Imara — PTSD Indicator & Mitigation System

An AI-powered mental health screening and referral platform for trainees. Imara combines the validated PCL-5 psychometric instrument with a machine-learning classifier to support early detection and referral for trainees experiencing PTSD symptoms.

> *Imara* is Kiswahili for *strong / resilient* — reflecting the system's goal of supporting trainee wellbeing.

---

## Architecture

Imara is a two-part application:

- **Backend** — Django + Django REST Framework, serving a JSON API (port `8000`)
- **Frontend** — React (Vite) single-page app that consumes the API (port `3000`)

```
React (Vite, :3000)  ──/api proxy──▶  Django REST API (:8000)  ──▶  SQLite
```

The frontend proxies all `/api` requests to the backend during development (configured in `frontend/vite.config.js`).

---

## Tech Stack

**Backend:** Django 6, Django REST Framework, Token authentication, SQLite (dev), scikit-learn / pandas / numpy (ML), Pillow

**Frontend:** React 18, Vite, React Router, Axios, Framer Motion, Chart.js

---

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- pip + venv (recommended)

---

## Getting Started

You need **both** servers running at the same time. Open two terminals.

### 1. Backend (Django API)

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Start the API server (http://127.0.0.1:8000)
python manage.py runserver
```

### 2. Frontend (React app)

In a second terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Test Accounts

The development database ships with two seeded accounts:

| Role       | Username   | Password         |
|------------|------------|------------------|
| Trainee    | `wanjiku`  | `Student123`     |
| Counsellor | `otieno`   | `Counsellor123`  |

The `wanjiku` account includes seeded screening history so the dashboard shows a populated trend chart.

To create an admin account for the Django admin panel:

```bash
cd backend
python manage.py createsuperuser
```

---

## Key Routes

### Frontend (http://localhost:3000)
- `/` — Landing page
- `/trainee/login` — Trainee login
- `/trainee/register` — Trainee registration
- `/trainee/dashboard` — Trainee wellness dashboard (auth required)
- `/screening` — PCL-5 screening (auth required)
- `/counsellor/login` — Counsellor login
- `/counsellor/dashboard` — Counsellor case management (auth required)

### Backend API (http://127.0.0.1:8000)
- `POST /api/auth/login/` — Obtain auth token
- `POST /api/auth/register/student/` — Register a trainee
- `GET  /api/student/dashboard/` — Trainee dashboard data
- `POST /api/screening/submit/` — Submit a screening
- `GET  /api/dashboard/summary/` — Counsellor analytics
- `/admin/` — Django admin

> **Note:** Screening requires authentication. Trainees must log in so results are linked to their account, enabling counsellor follow-up and longitudinal tracking.

---

## Features

**For Trainees**
- Secure registration and login
- PCL-5 PTSD screening with instant severity classification
- Personal dashboard with screening history and trends
- Wellness check-ins and appointment overview
- Personalised feedback and coping resources

**For Counsellors**
- Case-management dashboard with institutional analytics
- Automatic referrals for moderate/severe/critical cases
- Priority alerts for high-risk cases

**System**
- ML severity classification (Random Forest, trained via the SEMMA methodology)
- Optional NLP analysis of free-text narratives
- Bilingual feedback (English / Kiswahili)
- Privacy-conscious design aligned with the Kenya Data Protection Act (2019)

---

## Screening & Scoring

- **Instrument:** PCL-5 (20 items, each scored 0–4, total 0–80)
- **DSM-5 clusters:** Intrusion, Avoidance, Cognition/Mood, Arousal/Reactivity
- **Severity levels:** Minimal, Mild, Moderate, Severe, Critical
- Moderate and above automatically generate a referral to the Guidance & Counselling office.

---

## Running Tests

```bash
cd backend
python manage.py test
```

---

## Project Structure

```
minap-system/
├── backend/            # Django REST API
│   ├── users/          # Authentication, profiles, dashboards
│   ├── screening/      # PCL-5 screening + scoring
│   ├── ml_engine/      # ML severity classifier (SEMMA)
│   ├── nlp_engine/     # Free-text narrative analysis
│   ├── referrals/      # Referral case management
│   ├── dashboard/      # Counsellor analytics + Django page views
│   └── minap/          # Project settings & URLs
├── frontend/           # React (Vite) single-page app
│   └── src/
│       ├── pages/      # Route components
│       ├── components/ # Shared UI (Navbar, Footer, ProtectedRoute)
│       └── utils/      # API client
└── trained_models/     # Serialised ML model artifacts
```

Further documentation: `QUICK_START.md`, `SYSTEM_WORKFLOWS.md`, `TESTING_CHECKLIST.md`.

---

## Production Notes

For deployment, set the following via environment variables:

- `DJANGO_SECRET_KEY` — a strong, unique secret
- `DJANGO_DEBUG=False`
- `ALLOWED_HOSTS` — your production domains
- A production database (PostgreSQL recommended) and `python manage.py collectstatic`

---

## Project Information

- **Institution:** Murang'a County, Kenya
- **Project type:** Final-year degree project
- **Developer:** Stella Mwaura (SCT221-D1-0071/2023)
- **Supervisor:** Dr. Dennis Njagi
