import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ResourceDashboard } from './pages/ResourceDashboard';
import { ResourcesPage } from './pages/ResourcesPage';
import { MetricsPage } from './pages/MetricsPage';
import { RecordsPage } from './pages/RecordsPage';
import { Layout } from './components/Layout';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<ResourceDashboard />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/metrics" element={<MetricsPage />} />
                    <Route path="/records" element={<RecordsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
