import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './index.css';
import FullScreenLeaf from './components/FullScreenLeaf';

function App() {
  return (
    <Router>
      <FullScreenLeaf />
      <Routes>
        <Route path="/" element={<Dashboard session={null} />} />
        <Route path="/dashboard" element={<Dashboard session={null} />} />
        <Route path="*" element={<Dashboard session={null} />} />
      </Routes>
    </Router>
  );
}

export default App;