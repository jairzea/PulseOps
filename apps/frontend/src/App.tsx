import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ResourceDashboard } from './pages/ResourceDashboard';
import { ResourcesPage } from './pages/ResourcesPage';
import { MetricsPage } from './pages/MetricsPage';
import { RecordsPage } from './pages/RecordsPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { LoginPage2 } from './pages/LoginPage2';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ToastContainer';

function App() {
    // Para desarrollo, comentar esta línea para ir directo al dashboard
    // Para producción, descomentar para requerir login
    const isAuthenticated = false; // Cambiar a true para saltarse el login

    return (
        <BrowserRouter>
            {!isAuthenticated ? (
                <Routes>
                    <Route path="/login" element={<LoginPage2 />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            ) : (
                <>
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
                </>
            )}
        </BrowserRouter>
    );
}

export default App;
