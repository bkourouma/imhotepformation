import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CompanySessionProvider } from './hooks/useCompanySession.jsx';
import { AdminAuthProvider } from './hooks/useAdminAuth.jsx';
import Layout from './components/shared/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminOnlyRoute from './components/shared/AdminOnlyRoute';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import CompanySelection from './pages/CompanySelection';
import Dashboard from './pages/Dashboard';
import FormationsList from './pages/formations/FormationsList';
import FormationDetail from './pages/formations/FormationDetail';
import FormationForm from './pages/formations/FormationForm';
import EntreprisesList from './pages/entreprises/EntreprisesList';
import EntrepriseDetail from './pages/entreprises/EntrepriseDetail';
import EntrepriseForm from './pages/entreprises/EntrepriseForm';
import InscriptionsList from './pages/inscriptions/InscriptionsList';
import InscriptionDetail from './pages/inscriptions/InscriptionDetail';
import InscriptionForm from './pages/inscriptions/InscriptionForm';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <AdminAuthProvider>
      <CompanySessionProvider>
        <Router>
          <Routes>
            {/* Routes d'administration */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="formations" element={<FormationsList />} />
                    <Route path="formations/new" element={<FormationForm />} />
                    <Route path="formations/:id" element={<FormationDetail />} />
                    <Route path="formations/:id/edit" element={<FormationForm />} />
                    <Route path="entreprises" element={<EntreprisesList />} />
                    <Route path="entreprises/new" element={<EntrepriseForm />} />
                    <Route path="entreprises/:id" element={<EntrepriseDetail />} />
                    <Route path="entreprises/:id/edit" element={<EntrepriseForm />} />
                    <Route path="inscriptions" element={<InscriptionsList />} />
                    <Route path="inscriptions/new" element={<InscriptionForm />} />
                    <Route path="inscriptions/:id" element={<InscriptionDetail />} />
                    <Route path="inscriptions/:id/edit" element={<InscriptionForm />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="reports" element={<AdminReports />} />
                  </Routes>
                </AdminLayout>
              </ProtectedAdminRoute>
            } />

            {/* Page de sélection d'entreprise (non protégée) */}
            <Route path="/company-selection" element={<CompanySelection />} />

            {/* Routes utilisateur protégées */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Formations (Admin uniquement) */}
                    <Route path="/formations" element={
                      <AdminOnlyRoute>
                        <FormationsList />
                      </AdminOnlyRoute>
                    } />
                    <Route path="/formations/new" element={
                      <AdminOnlyRoute>
                        <FormationForm />
                      </AdminOnlyRoute>
                    } />
                    <Route path="/formations/:id" element={
                      <AdminOnlyRoute>
                        <FormationDetail />
                      </AdminOnlyRoute>
                    } />
                    <Route path="/formations/:id/edit" element={
                      <AdminOnlyRoute>
                        <FormationForm />
                      </AdminOnlyRoute>
                    } />

                    {/* Inscriptions */}
                    <Route path="/inscriptions" element={<InscriptionsList />} />
                    <Route path="/inscriptions/new" element={<InscriptionForm />} />
                    <Route path="/inscriptions/:id" element={<InscriptionDetail />} />
                    <Route path="/inscriptions/:id/edit" element={<InscriptionForm />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </CompanySessionProvider>
    </AdminAuthProvider>
  );
}

export default App;
