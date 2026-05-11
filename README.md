# 🎯 AI Goal Tracker — vsquaree Founder Dashboard

> A personal life tracker SaaS for founders and hustlers. Define your problems, check in daily, and let AI calculate your real success percentage. When you hit 100% — you get a congratulatory email. Built with the **Antigravity Dark UI**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://your-vercel-url.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-blueviolet?style=for-the-badge)](https://railway.app)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

---

## 📸 Screenshots

| Login | Dashboard | AI Analysis |
|-------|-----------|-------------|
| Magic Link Email Login | Goal Cards + Daily Check-in | AI-powered progress rings |

---

## ✨ Features

- **🔐 Email Magic Link Auth** — No passwords. Sign in via Supabase email OTP.
- **🎯 Dynamic Goal Setup** — Users type 4–5 personal problems (e.g., "Quit Smoking", "Learn React"). Goals are stored and tracked individually.
- **📋 Daily Check-in** — Slider inputs per goal, emoji mood selector (😔→🔥), and a journal note field.
- **📈 History View** — Table of last 14 check-ins with mood emojis and journal notes.
- **🤖 AI Analysis** — Calls Anthropic Claude API to calculate success trajectories. Returns percentages, Hinglish feedback, and displayed in animated SVG rings.
- **📧 100% Email Celebration** — When AI detects a goal is complete, it automatically sends a congratulatory email via Resend.
- **🛡️ Admin Panel** — `/admin` route (coming in V2) for the platform owner to view all users.
- **🌑 Antigravity Dark UI** — Space-themed glassmorphism design with lime accents, animated rings, and staggered transitions.

---

## 🏗️ Architecture

```
founder-tracker/
├── frontend/           # React 19 + Vite 8 (hosted on Vercel)
│   └── src/
│       ├── api/client.js       # Axios + Supabase client
│       ├── pages/Login.jsx     # Magic link login page
│       └── pages/Dashboard.jsx # Main app (Today / History / AI tabs)
│
└── backend/            # Node.js 20 + Express (hosted on Railway)
    └── src/
        ├── routes/auth.js      # Sync Supabase user to DB
        ├── routes/goals.js     # CRUD for user goals
        ├── routes/checkin.js   # Daily check-in upsert + history
        └── routes/engine.js    # AI analysis via Claude + Email via Resend
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Framer Motion, React Router v7 |
| **Styling** | Vanilla CSS (Antigravity Design System) |
| **Backend** | Node.js 20, Express 4, ES Modules |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Email OTP / Magic Link) |
| **AI** | Anthropic Claude API (`claude-3-sonnet`) |
| **Email** | Resend API |
| **Deployment** | Vercel (frontend) + Railway (backend) |

---

## 🗄️ Database Schema

Run this in your **Supabase SQL Editor** to set up all tables:

```sql
-- User profiles (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic user goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT,
  current_progress INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily check-ins
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INT CHECK (mood BETWEEN 1 AND 5),
  journal_note TEXT,
  overall_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Per-goal log entries linked to a check-in
CREATE TABLE goal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID REFERENCES daily_checkins(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  ai_feedback TEXT
);
```

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=4000
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

JWT_SECRET=your-jwt-secret-min-32-chars

ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 Running Locally

**Step 1 — Clone and install dependencies:**
```bash
git clone https://github.com/shivam5210/DailyProgress.git
cd DailyProgress

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

**Step 2 — Setup environment files:**
```bash
# In /backend folder
cp .env.example .env
# Fill in your Supabase URL, Service Key, Anthropic Key, Resend Key

# In /frontend folder
cp .env.example .env
# Fill in your Supabase URL and Anon Key
```

**Step 3 — Start both servers (two separate terminals):**

*Terminal 1 (Backend):*
```bash
cd backend
npm run dev
# Server starts on http://localhost:4000
```

*Terminal 2 (Frontend):*
```bash
cd frontend
npm run dev
# App opens on http://localhost:5173
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variables from `frontend/.env`
4. Click **Deploy**

### Backend → Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set **Root Directory** to `backend`
3. Add all environment variables from `backend/.env`
4. Railway auto-detects Node.js and exposes the port

### Database → Supabase
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Open **SQL Editor** and paste the schema SQL above
3. Go to **Authentication → Providers** and ensure **Email** is enabled
4. Copy your **Project URL** and **API Keys** from **Settings → API**

---

## 📋 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/sync` | Public | Sync Supabase user to DB |
| `GET` | `/api/goals` | JWT | Fetch user's goals |
| `POST` | `/api/goals` | JWT | Create a new goal |
| `POST` | `/api/checkins` | JWT | Save daily check-in (upsert) |
| `GET` | `/api/checkins` | JWT | Fetch last 30 check-ins |
| `POST` | `/api/engine/analyze` | JWT | Run AI analysis, update % |

---

## 🗺️ Roadmap

### MVP ✅
- [x] Email Magic Link authentication
- [x] Dynamic goal setup (user defines their own problems)
- [x] Daily check-in form
- [x] History view (last 14 days)
- [x] AI analysis with Claude API
- [x] Progress rings (animated SVG)
- [x] 100% completion email via Resend
- [x] Antigravity dark glassmorphism UI

### V2 🚧
- [ ] Admin Panel (`/admin`) — view all users & analytics
- [ ] WhatsApp/Telegram daily reminder at 9PM
- [ ] Weekly email summary
- [ ] Public share link ("View my founder journey")
- [ ] Goal editing and deletion
- [ ] Mobile PWA support
- [ ] Charts with Recharts (cigarettes/contacts trend)

---

## 👤 Author

**Shivam** — Founder of [vsquaree.com](https://vsquaree.com)

> Built this to track my own journey: quit smoking, quit weed, build contacts, and grow vsquaree daily. If this helps even one other founder, mission accomplished.

---

## 📄 License

MIT — free to use, fork, and build on.
