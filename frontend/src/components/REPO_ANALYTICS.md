# Repository Analytics Dashboard

A comprehensive, professional dashboard for the **DailyProgress** repository with interactive visualizations and real-time statistics.

## 📊 Components Overview

### 1. **RepositoryDashboard.jsx**
Main dashboard component featuring:
- **Real-time Statistics Cards** - Stars, forks, issues, and PRs
- **Tab Navigation System** - Overview, Languages, Tech Stack, Issues & PRs
- **Professional UI** - Glassmorphism design with gradient accents
- **Responsive Grid Layout** - Mobile to desktop support

#### Features:
- Interactive stat cards with hover effects
- Tabbed interface for organized information
- Quick action buttons (GitHub, Live Demo)
- Real-time data integration ready
- Smooth transitions and animations

### 2. **LanguageStats.jsx**
Advanced language composition component with:
- **Language Distribution Cards** - Visual progress bars for each language
- **Interactive Charts**:
  - Pie chart (distribution percentage)
  - Bar chart (lines of code)
- **Detailed Breakdown Table** - Language statistics
- **Summary Statistics** - Total lines, primary language, languages used

#### Visualizations:
- Recharts pie chart with custom styling
- Recharts bar chart with gradient fills
- Progress bars with color-coded languages
- Hover tooltips with detailed information

## 🚀 Usage

### Import Components
```jsx
import RepositoryDashboard from './components/RepositoryDashboard';
import LanguageStats from './components/LanguageStats';
```

### Use in App
```jsx
function App() {
  return (
    <div>
      <RepositoryDashboard />
    </div>
  );
}
```

## 📦 Dependencies

Make sure you have these installed in your `frontend/package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.5",
    "recharts": "^3.8.1",
    "lucide-react": "^1.14.0",
    "framer-motion": "^12.38.0"
  }
}
```

If not installed, run:
```bash
npm install recharts lucide-react framer-motion
```

## 🎨 Design Features

### Colors & Gradients
- **Primary**: Purple (#a855f7) and Pink (#ec4899)
- **Language Colors**:
  - JavaScript: #F7DF1E (Yellow)
  - CSS: #1572B6 (Blue)
  - HTML: #E34C26 (Red)

### Styling Elements
- Glassmorphism backgrounds
- Gradient overlays on hover
- Backdrop blur effects
- Smooth transitions (300ms)
- Border animations

### Responsive Breakpoints
- Mobile: Full-width single column
- Tablet (md): 2-column grids
- Desktop (lg): 3-4 column grids

## 📈 Data Structure

### Repository Stats
```javascript
{
  name: 'DailyProgress',
  owner: 'shivam5210',
  stars: 0,
  forks: 0,
  issues: 1,
  pullRequests: 1,
  language: 'JavaScript',
  size: 2240 // KB
}
```

### Language Data
```javascript
[
  { name: 'JavaScript', percent: 85.9, lines: 8590, color: '#F7DF1E' },
  { name: 'CSS', percent: 13.5, lines: 1350, color: '#1572B6' },
  { name: 'HTML', percent: 0.6, lines: 60, color: '#E34C26' }
]
```

### Tech Stack
```javascript
{
  category: 'Frontend',
  technologies: ['React 19', 'Vite', 'Framer Motion', 'Recharts', 'Lucide Icons']
}
```

## 🔄 Integration with GitHub API

### Fetch Repository Data
```javascript
const fetchRepoData = async () => {
  const response = await fetch('https://api.github.com/repos/shivam5210/DailyProgress');
  const data = await response.json();
  return {
    stars: data.stargazers_count,
    forks: data.forks_count,
    issues: data.open_issues_count,
    // ... more fields
  };
};
```

### Fetch Language Composition
```javascript
const fetchLanguages = async () => {
  const response = await fetch('https://api.github.com/repos/shivam5210/DailyProgress/languages');
  const data = await response.json();
  return Object.entries(data).map(([name, bytes]) => ({
    name,
    bytes,
    percent: (bytes / totalBytes) * 100
  }));
};
```

## 🎯 Customization

### Change Repository
Edit `repoStats` object in `RepositoryDashboard.jsx`:
```javascript
const repoStats = {
  name: 'YourRepoName',
  owner: 'YourUsername',
  // ... other properties
};
```

### Modify Tech Stack
Edit `techStack` array in `RepositoryDashboard.jsx`:
```javascript
const techStack = [
  { category: 'Your Category', technologies: ['Tech1', 'Tech2'] },
];
```

### Custom Colors
Update `COLORS` array in `LanguageStats.jsx` or `languageData` color property:
```javascript
const COLORS = ['#YourColor1', '#YourColor2', '#YourColor3'];
```

## 📱 Responsive Behavior

| Breakpoint | Layout | Columns |
|-----------|--------|---------|
| Mobile | Stacked | 1 |
| Tablet (768px) | Grid | 2 |
| Desktop (1024px) | Grid | 3-4 |

## ✨ Animation & Hover Effects

- **Stat Cards**: Border color change to purple on hover
- **Tech Tags**: Background color enhancement on hover
- **Language Cards**: Gradient overlay animation
- **Charts**: Smooth tooltip transitions
- **Buttons**: Color and shadow transitions

## 🐛 Troubleshooting

### Charts Not Displaying
Ensure `ResponsiveContainer` is wrapped correctly and Recharts is installed:
```bash
npm install recharts
```

### Styling Not Applied
Make sure Tailwind CSS is configured in your project:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Icons Not Showing
Install lucide-react:
```bash
npm install lucide-react
```

## 📄 License

MIT - Feel free to use and modify for your projects

---

**Dashboard Dashboard v1.0** | Last Updated: 2026-05-12
