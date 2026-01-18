import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ResourceDashboard } from './pages/ResourceDashboard';
import { ResourcesPage } from './pages/ResourcesPage';
import { MetricsPage } from './pages/MetricsPage';
import { RecordsPage } from './pages/RecordsPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { UsersAdminPage } from './pages/UsersAdminPage';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ToastContainer';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public route */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ResourceDashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/resources"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ResourcesPage />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/metrics"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <MetricsPage />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/records"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <RecordsPage />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/configuration"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ConfigurationPage />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ProfilePage />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute requireAdmin>
                                <Layout>
                                    <UsersAdminPage />
                                </Layout>
                            </PrivateRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
