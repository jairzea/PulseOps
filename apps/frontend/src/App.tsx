import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ResourceDashboard } from './pages/ResourceDashboard';
import { ResourcesPage } from './pages/ResourcesPage';
import { MetricsPage } from './pages/MetricsPage';
import { RecordsPage } from './pages/RecordsPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ToastContainer';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<ResourceDashboard />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/metrics" element={<MetricsPage />} />
                    <Route path="/records" element={<RecordsPage />} />
                    <Route path="/configuration" element={<ConfigurationPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;
