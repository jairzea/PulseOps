import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ResourceDashboard } from './pages/ResourceDashboard';
import { ResourcesPage } from './pages/ResourcesPage';
import { MetricsPage } from './pages/MetricsPage';
import { RecordsPage } from './pages/RecordsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Header />
        <Routes>
          <Route path="/" element={<ResourceDashboard />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
