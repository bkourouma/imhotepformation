import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEntrepriseAuth } from '../../hooks/useEntrepriseAuth';
import { employesService, inscriptionsService } from '../../services/api';
import { Card, Button, LoadingSpinner, ErrorMessage, Modal } from '../../components/shared';
import FormField, { Input } from '../../components/shared/FormField';

export default function EntrepriseEmployes() {
  const { entreprise } = useEntrepriseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [employes, setEmployes] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('employes');

  // Add employe modal & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    fonction: '',
    telephone: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [employesData, inscriptionsData] = await Promise.all([
        employesService.getAll({ entreprise_id: entreprise.id, search }),
        inscriptionsService.getAll({ entreprise_id: entreprise.id }),
      ]);

      setEmployes(Array.isArray(employesData) ? employesData : []);
      setInscriptions(Array.isArray(inscriptionsData) ? inscriptionsData : []);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entreprise?.id) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entreprise?.id, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employés & Inscriptions</h1>
              <p className="text-gray-600">Gérez les employés de votre entreprise et leurs inscriptions</p>
            </div>
            <Button as={Link} to="/entreprise/dashboard" variant="secondary">
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <ErrorMessage error={error} onDismiss={() => setError('')} />
        )}

        <Card>
          <div className="flex items-center gap-3">
            <Button
              variant={activeTab === 'employes' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('employes')}
            >
              Employés
            </Button>
            <Button
              variant={activeTab === 'inscriptions' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('inscriptions')}
            >
              Inscriptions
            </Button>
            <div className="ml-auto w-full max-w-lg flex items-center gap-3">
              <Button onClick={() => setShowAddModal(true)}>
                Ajouter un employé
              </Button>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {activeTab === 'employes' ? (
          <Card>
            {employes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun employé trouvé</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employes.map((e) => (
                  <div key={e.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="font-semibold text-gray-900">{e.prenom} {e.nom}</div>
                    <div className="text-sm text-gray-600">{e.email}</div>
                    {e.fonction && <div className="text-sm text-gray-600">{e.fonction}</div>}
                    {e.telephone && <div className="text-sm text-gray-600">{e.telephone}</div>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card>
            {inscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune inscription</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inscriptions.map((i, idx) => (
                      <tr key={i.id || idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{i.formation_intitule || i.formation_nom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{i.employe_prenom} {i.employe_nom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.created_at ? new Date(i.created_at).toLocaleDateString('fr-FR') : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Add employe modal */}
        <Modal
          open={showAddModal}
          onClose={() => {
            if (!submitting) {
              setShowAddModal(false);
              setFormErrors({});
            }
          }}
          title="Ajouter un employé"
          size="lg"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  // Basic validation
                  const errors = {};
                  if (!formData.prenom) errors.prenom = 'Prénom requis';
                  if (!formData.nom) errors.nom = 'Nom requis';
                  if (!formData.email) errors.email = 'Email requis';
                  if (!formData.fonction) errors.fonction = 'Fonction requise';
                  if (!formData.telephone) errors.telephone = 'Téléphone requis';
                  setFormErrors(errors);
                  if (Object.keys(errors).length > 0) return;

                  try {
                    setSubmitting(true);
                    setError('');
                    await employesService.create({
                      ...formData,
                      entreprise_id: entreprise.id,
                    });
                    setShowAddModal(false);
                    setFormData({ prenom: '', nom: '', email: '', fonction: '', telephone: '' });
                    setFormErrors({});
                    setActiveTab('employes');
                    await loadData();
                  } catch (err) {
                    setError(err?.message || "Erreur lors de la création de l'employé");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                loading={submitting}
              >
                Enregistrer
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Prénom" required error={formErrors.prenom}>
              <Input
                value={formData.prenom}
                onChange={(e) => setFormData((s) => ({ ...s, prenom: e.target.value }))}
                placeholder="Prénom"
              />
            </FormField>
            <FormField label="Nom" required error={formErrors.nom}>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData((s) => ({ ...s, nom: e.target.value }))}
                placeholder="Nom"
              />
            </FormField>
            <FormField label="Email" required error={formErrors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                placeholder="email@exemple.com"
              />
            </FormField>
            <FormField label="Fonction" required error={formErrors.fonction}>
              <Input
                value={formData.fonction}
                onChange={(e) => setFormData((s) => ({ ...s, fonction: e.target.value }))}
                placeholder="Intitulé du poste"
              />
            </FormField>
            <FormField label="Téléphone" required error={formErrors.telephone}>
              <Input
                value={formData.telephone}
                onChange={(e) => setFormData((s) => ({ ...s, telephone: e.target.value }))}
                placeholder="Ex: 0700000000"
              />
            </FormField>
          </div>
        </Modal>
      </main>
    </div>
  );
}



