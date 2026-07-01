import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ResourceDashboard } from './pages/ResourceDashboard';
import { OverviewPage } from './pages/OverviewPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { MetricsPage } from './pages/MetricsPage';
import { RecordsPage } from './pages/RecordsPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { UsersAdminPage } from './pages/UsersAdminPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ToastContainer';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
    return (
        <ThemeProvider>
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
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ResourceDashboard />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/overview"
                            element={
                                <PrivateRoute requireAdmin>
                                    <Layout>
                                        <OverviewPage />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/resources"
                            element={
                                <PrivateRoute requireAdmin>
                                    <Layout>
                                        <ResourcesPage />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/metrics"
                            element={
                                <PrivateRoute requireAdmin>
                                    <Layout>
                                        <MetricsPage />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/records"
                            element={
                                <PrivateRoute requireAdmin>
                                    <Layout>
                                        <RecordsPage />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/configuration"
                            element={
                                <PrivateRoute requireAdmin>
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
                        <Route
                            path="/integrations"
                            element={
                                <PrivateRoute requireAdmin>
                                    <Layout>
                                        <IntegrationsPage />
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
        </ThemeProvider>
    );
}

export default App;
