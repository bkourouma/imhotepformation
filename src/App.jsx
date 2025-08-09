import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CompanySessionProvider } from './hooks/useCompanySession.jsx';
import { AdminAuthProvider } from './hooks/useAdminAuth.jsx';
import { EmployeAuthProvider } from './hooks/useEmployeAuth.jsx';
import { EntrepriseAuthProvider } from './hooks/useEntrepriseAuth.jsx';
import Layout from './components/shared/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminOnlyRoute from './components/shared/AdminOnlyRoute';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import ProtectedEmployeRoute from './components/shared/ProtectedEmployeRoute';
import ProtectedEntrepriseRoute from './components/shared/ProtectedEntrepriseRoute';
import AdminLayout from './components/admin/AdminLayout';
import CompanySelection from './pages/CompanySelection';
import Dashboard from './pages/Dashboard';
import EntreprisesList from './pages/entreprises/EntreprisesList';
import EntrepriseForm from './pages/entreprises/EntrepriseForm';
import EntrepriseDetail from './pages/entreprises/EntrepriseDetail';
import FormationsList from './pages/formations/FormationsList';
import FormationForm from './pages/formations/FormationForm';
import FormationDetail from './pages/formations/FormationDetail';
import InscriptionsList from './pages/inscriptions/InscriptionsList';
import InscriptionForm from './pages/inscriptions/InscriptionForm';
import InscriptionDetail from './pages/inscriptions/InscriptionDetail';
import EmployesList from './pages/employes/EmployesList';
import EmployeForm from './pages/employes/EmployeForm';
import ParticipantForm from './pages/participants/ParticipantForm';
import SeancesList from './pages/seances/SeancesList';
import GroupesList from './pages/groupes/GroupesList';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import AdminUsers from './pages/admin/AdminUsers';
import SeanceForm from './pages/seances/SeanceForm';
import SeanceDetail from './pages/seances/SeanceDetail';
import GroupeForm from './pages/groupes/GroupeForm';
import GroupeDetail from './pages/groupes/GroupeDetail';
import PresenceList from './pages/presence/PresenceList';
import EnseignantsList from './pages/enseignants/EnseignantsList';
import EnseignantForm from './pages/enseignants/EnseignantForm';
import EnseignantDetail from './pages/enseignants/EnseignantDetail';
import EmployeLogin from './pages/employe/EmployeLogin';
import EmployeDashboard from './pages/employe/EmployeDashboard';
import SeanceMedia from './pages/employe/SeanceMedia';
import Evaluations from './pages/employe/Evaluations';
import TakeEvaluation from './pages/employe/TakeEvaluation';
import EvaluationHistory from './pages/employe/EvaluationHistory';
import EvaluationReview from './pages/employe/EvaluationReview';
import EntrepriseEvaluationsOverview from './pages/entreprise/EvaluationsOverview';
import EntrepriseEmployes from './pages/entreprise/Employes';
import EntrepriseFormations from './pages/entreprise/Formations';
import AdminEvaluationsOverview from './pages/admin/EvaluationsOverview';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';
import EntrepriseLogin from './pages/EntrepriseLogin';
import EntrepriseDashboard from './pages/entreprise/EntrepriseDashboard';
import Landing from './pages/Landing';

function App() {
  return (
    <AdminAuthProvider>
      <EmployeAuthProvider>
        <EntrepriseAuthProvider>
          <CompanySessionProvider>
          <Router>
            <Routes>
              {/* Page d'accueil publique */}
              <Route path="/" element={<Landing />} />
              {/* Routes d'administration */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout>
                      <Outlet />
                    </AdminLayout>
                  </ProtectedAdminRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
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
                <Route path="employes" element={<EmployesList />} />
                <Route path="employes/new" element={<EmployeForm />} />
                <Route path="employes/:id" element={<EmployeForm />} />
                <Route path="employes/:id/edit" element={<EmployeForm />} />
                <Route path="seances" element={<SeancesList />} />
                <Route path="seances/new" element={<SeanceForm />} />
                <Route path="seances/:id" element={<SeanceDetail />} />
                <Route path="seances/:id/edit" element={<SeanceForm />} />
                <Route path="groupes" element={<GroupesList />} />
                <Route path="groupes/new" element={<GroupeForm />} />
                <Route path="groupes/:id" element={<GroupeDetail />} />
                <Route path="groupes/:id/edit" element={<GroupeForm />} />
                <Route path="enseignants" element={<EnseignantsList />} />
                <Route path="enseignants/new" element={<EnseignantForm />} />
                <Route path="enseignants/:id" element={<EnseignantDetail />} />
                <Route path="enseignants/:id/edit" element={<EnseignantForm />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="evaluations" element={<AdminEvaluationsOverview />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Routes employé */}
              <Route path="/employe/login" element={<EmployeLogin />} />
              <Route
                path="/employe/*"
                element={
                  <ProtectedEmployeRoute>
                    <Routes>
                      <Route path="dashboard" element={<EmployeDashboard />} />
                      <Route path="seances/:seanceId/media" element={<SeanceMedia />} />
                      <Route path="evaluations/:seanceId" element={<Evaluations />} />
                      <Route path="evaluations/:seanceId/take/:evaluationId" element={<TakeEvaluation />} />
                      <Route path="evaluations/:seanceId/history" element={<EvaluationHistory />} />
                      <Route path="evaluations/review/:attemptId" element={<EvaluationReview />} />
                    </Routes>
                  </ProtectedEmployeRoute>
                }
              />

              {/* Routes entreprise */}
              <Route path="/entreprise/login" element={<EntrepriseLogin />} />
              <Route
                path="/entreprise/*"
                element={
                  <ProtectedEntrepriseRoute>
                    <Outlet />
                  </ProtectedEntrepriseRoute>
                }
              >
                <Route path="dashboard" element={<EntrepriseDashboard />} />
                <Route path="evaluations" element={<EntrepriseEvaluationsOverview />} />
                <Route path="employes" element={<EntrepriseEmployes />} />
                <Route path="formations" element={<GroupesList />} />
                <Route path="groupes/:id" element={<GroupeDetail />} />
                {/* Entreprise cannot edit/create groups or manage participants */}
              </Route>

              {/* Page de sélection d'entreprise (non protégée) */}
              <Route path="/company-selection" element={<CompanySelection />} />

              {/* Routes utilisateur protégées */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Dashboard */}
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

                      {/* Entreprises (pour les utilisateurs) */}
                      <Route path="/entreprises" element={<EntreprisesList />} />
                      <Route path="/entreprises/new" element={<EntrepriseForm />} />
                      <Route path="/entreprises/:id" element={<EntrepriseDetail />} />
                      <Route path="/entreprises/:id/edit" element={<EntrepriseForm />} />

                      {/* Employes */}
                      <Route path="/employes" element={<EmployesList />} />
                      <Route path="/employes/new" element={<EmployeForm />} />
                      <Route path="/employes/:id" element={<EmployeForm />} />
                      <Route path="/employes/:id/edit" element={<EmployeForm />} />
                      <Route path="/seances" element={<SeancesList />} />
                      <Route path="/seances/new" element={<SeanceForm />} />
                      <Route path="/seances/:id" element={<SeanceDetail />} />
                      <Route path="/seances/:id/edit" element={<SeanceForm />} />
                      <Route path="/groupes" element={<GroupesList />} />
                      <Route path="/groupes/new" element={<GroupeForm />} />
                      <Route path="/groupes/:id" element={<GroupeDetail />} />
                      <Route path="/groupes/:id/edit" element={<GroupeForm />} />
                      <Route path="/enseignants" element={<EnseignantsList />} />
                      <Route path="/enseignants/:id" element={<EnseignantDetail />} />
                      <Route path="/inscriptions" element={<InscriptionsList />} />
                      <Route path="/inscriptions/new" element={<InscriptionForm />} />
                      <Route path="/inscriptions/:id" element={<InscriptionDetail />} />
                      <Route path="/inscriptions/:id/edit" element={<InscriptionForm />} />

                      {/* Participants */}
                      <Route path="/groupes/:groupeId/participants" element={<ParticipantForm />} />

                      {/* Presence */}
                      <Route path="/presence" element={<PresenceList />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
          </CompanySessionProvider>
        </EntrepriseAuthProvider>
      </EmployeAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;
