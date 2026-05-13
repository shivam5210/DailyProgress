# 🎯 AI Goal Tracker

A personal life tracker for founders. Define your problems, check in daily, and let AI calculate your real success percentage. Hit 100% → get a celebration email.

## ✨ Features

- Email magic link login (no passwords)
- Dynamic goal setup — type your own problems
- Daily check-in with mood tracker & journal
- AI-powered progress analysis (Claude API)
- Animated SVG progress rings
- Auto congratulation email at 100% completion
- Antigravity dark glassmorphism UI

## 🧰 Stack

`React 19` · `Vite` · `Express` · `Supabase` · `Anthropic Claude` · `Resend` · `Framer Motion`

## 🚀 Quick Start (Windows Local Hosting)

1. **Clone the repository**
   ```powershell
   git clone https://github.com/shivam5210/DailyProgress.git
   cd DailyProgress
   ```

2. **Install all dependencies**
   We have a root script that installs dependencies for both frontend and backend automatically:
   ```powershell
   npm run install:all
   ```

3. **Environment Setup**
   You need to copy the `.env.example` to `.env` in both `frontend` and `backend` folders and fill in your keys.
   ```powershell
   cd backend
   copy .env.example .env
   cd ../frontend
   copy .env.example .env
   cd ..
   ```
   *Make sure you add your Supabase URL, Anon Key, Service Key, JWT Secret, Anthropic, and Resend API keys.*

4. **Run both Frontend and Backend together**
   Our `package.json` has a script to run both servers concurrently on Windows:
   ```powershell
   npm run dev
   ```
   - **Frontend** runs on: `http://localhost:5173`
   - **Backend** runs on: `http://localhost:4000`

## 🔌 API Documentation (Backend <-> Frontend)

The frontend uses Axios (`frontend/src/api/client.js`) to automatically attach the Supabase Auth Token to every request sent to `http://localhost:4000/api`.

Here are the APIs connecting them:

### 1. Goals API (`/api/goals`)
- **`GET /api/goals`**: Fetches all active goals for the logged-in user. Used on dashboard load.
- **`POST /api/goals`**: Creates a new goal. Used during the initial onboarding screen.
- **`PUT /api/goals/:id`**: Updates an existing goal (e.g. progress percentage).
- **`DELETE /api/goals/:id`**: Deletes a goal.

### 2. Check-ins API (`/api/checkins`)
- **`GET /api/checkins`**: Fetches the user's history of daily check-ins. Displayed on the 'History' tab.
- **`POST /api/checkins`**: Submits the daily check-in (mood, journal, goal progress). Displayed on the 'Today' tab.

### 3. AI Engine API (`/api/engine`)
- **`POST /api/engine/analyze`**: Triggers the Anthropic Claude AI to analyze the user's 7-day trajectory. Updates goal progress in the database and returns personalized feedback. Used when clicking the "⚡ AI Analysis" button.

### 4. Auth Sync (`/api/auth`)
- **`POST /api/auth/sync`**: Syncs the Supabase user profile into the backend PostgreSQL table.

## 🌐 Deployment

- **Frontend** → [Vercel](https://vercel.com) (root: `frontend`)
- **Backend** → [Railway](https://railway.app) (root: `backend`)
- **Database** → [Supabase](https://supabase.com) (run schema from `/backend/db/supabase.js`)

## 📄 License

MIT
