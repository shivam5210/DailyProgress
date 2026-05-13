# 🎯 DailyProgress - AI Goal Tracker

A personal life tracker for founders. Define your problems, check in daily, and let AI calculate your real success percentage. Hit 100% → get a celebration email.

## ✨ Features

- 🔐 Email magic link login (no passwords)
- 🎯 Dynamic goal setup — type your own problems
- 📝 Daily check-in with mood tracker & journal
- 🤖 AI-powered progress analysis (Claude API)
- ✨ Animated SVG progress rings
- 🎉 Auto congratulation email at 100% completion
- 🌙 Antigravity dark glassmorphism UI

## 🧰 Tech Stack

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

When ready to deploy:

- **Frontend** → [Vercel](https://vercel.com) (root: `frontend`)
- **Backend** → [Railway](https://railway.app) (root: `backend`)
- **Database** → [Supabase](https://supabase.com)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000 (backend)
# Terminal/Mac/Linux:
lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# PowerShell/Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Same for port 5173 (frontend)
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
- Ensure `.env` files are in correct directories
- Restart dev servers after changing `.env`
- Check for typos in variable names

### CORS Issues
- Verify backend is running on port 4000
- Check frontend `.env` has correct API URL
- Ensure backend has CORS configured

---

## 📝 License

MIT

---

## 🤝 Contributing

Found a bug or have a feature request? Open an [issue](https://github.com/shivam5210/DailyProgress/issues) or submit a pull request!

---

**Happy coding! 🚀**
