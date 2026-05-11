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

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/shivam5210/DailyProgress.git

# Backend
cd backend && npm install && cp .env.example .env
npm run dev   # runs on :4000

# Frontend (new terminal)
cd frontend && npm install && cp .env.example .env
npm run dev   # runs on :5173
```

Fill in your keys in both `.env` files (Supabase URL, API keys).

## 🌐 Deployment

- **Frontend** → [Vercel](https://vercel.com) (root: `frontend`)
- **Backend** → [Railway](https://railway.app) (root: `backend`)
- **Database** → [Supabase](https://supabase.com) (run schema from `/backend/db/supabase.js`)

## 📄 License

MIT
