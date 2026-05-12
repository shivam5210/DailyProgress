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

**Language Composition:** JavaScript (85.9%), CSS (13.5%), HTML (0.6%)

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, make sure you have installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (optional but recommended) - [Download here](https://code.visualstudio.com/)

### Step 1: Clone the Repository

**Terminal (Mac/Linux):**
```bash
git clone https://github.com/shivam5210/DailyProgress.git
cd DailyProgress
```

**PowerShell (Windows):**
```powershell
git clone https://github.com/shivam5210/DailyProgress.git
cd DailyProgress
```

### Step 2: Environment Setup

Copy the example environment files and add your API keys:

**Terminal (Mac/Linux):**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

**PowerShell (Windows):**
```powershell
# Backend
Copy-Item backend\.env.example backend\.env

# Frontend
Copy-Item frontend\.env.example frontend\.env
```

### Step 3: Configure Environment Variables

Edit `backend/.env` and `frontend/.env` with your API keys:

**Required Keys:**
- Supabase URL & API Key
- Anthropic API Key (for Claude)
- Resend API Key (for emails)
- Any other service credentials

### Step 4: Install Backend Dependencies

**Terminal (Mac/Linux):**
```bash
cd backend
npm install
```

**PowerShell (Windows):**
```powershell
cd backend
npm install
```

### Step 5: Start Backend Server

**Terminal (Mac/Linux):**
```bash
npm run dev
```

**PowerShell (Windows):**
```powershell
npm run dev
```

✅ Backend runs on `http://localhost:4000`

Keep this terminal/PowerShell window open!

### Step 6: Install Frontend Dependencies (New Terminal/PowerShell)

Open a **new terminal or PowerShell window** in your project directory:

**Terminal (Mac/Linux):**
```bash
cd frontend
npm install
```

**PowerShell (Windows):**
```powershell
cd frontend
npm install
```

### Step 7: Start Frontend Development Server

**Terminal (Mac/Linux):**
```bash
npm run dev
```

**PowerShell (Windows):**
```powershell
npm run dev
```

✅ Frontend runs on `http://localhost:5173`

---

## 📂 Project Structure

```
DailyProgress/
├── backend/              # Express server (port 4000)
│   ├── .env.example     # Environment template
│   ├── package.json
│   └── db/
│       └── supabase.js  # Database schema
├── frontend/            # React + Vite app (port 5173)
│   ├── .env.example     # Environment template
│   ├── package.json
│   └── src/
└── README.md
```

---

## 🔧 Common Commands Reference

### Backend Commands
```bash
cd backend
npm install         # Install dependencies
npm run dev        # Start development server (port 4000)
npm run build      # Build for production
npm start          # Start production server
```

### Frontend Commands
```bash
cd frontend
npm install         # Install dependencies
npm run dev        # Start dev server with HMR (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## 🎯 Local Development Workflow

### Recommended Setup with VS Code

1. **Open in VS Code:**
   ```bash
   code .
   ```

2. **Open Integrated Terminals:**
   - Press `Ctrl + `` (backtick) to open integrated terminal
   - Click the `+` icon to create multiple terminal tabs
   - Terminal 1: Run backend
   - Terminal 2: Run frontend

3. **Access the App:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000`
   - Browser DevTools: `F12` or `Ctrl + Shift + I`

### Hot Reload Development
- **Frontend:** Changes auto-reload in browser (Vite HMR)
- **Backend:** Changes auto-reload with nodemon (if configured)

---

## 🗄️ Database Setup

To set up Supabase database locally:

1. Get your Supabase connection details from the Supabase dashboard
2. Update `backend/.env` with your Supabase URL and key
3. Run migration: 
   ```bash
   node backend/db/supabase.js
   ```

---

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