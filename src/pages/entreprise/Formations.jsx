import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEntrepriseAuth } from '../../hooks/useEntrepriseAuth';
import { formationsService, inscriptionsService, participantsService } from '../../services/api';
import { dateUtils } from '../../utils/helpers';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../../components/shared';
import { exportToExcel, columnConfigs, formatters } from '../../utils/excelExport';

export default function EntrepriseFormations() {
  const { entreprise } = useEntrepriseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formations, setFormations] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [allFormations, enterpriseInscriptions, enterpriseParticipants] = await Promise.all([
          formationsService.getAll(search),
          inscriptionsService.getAll({ entreprise_id: entreprise.id }),
          participantsService.getAll({ entreprise_id: entreprise.id }),
        ]);
        setFormations(Array.isArray(allFormations) ? allFormations : []);
        setEnrolledIds(new Set((enterpriseInscriptions || []).map(i => i.formation_id)));
        setEnrollments(Array.isArray(enterpriseParticipants) ? enterpriseParticipants : []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (entreprise?.id) load();
  }, [entreprise?.id, search]);

  const filteredEnrollments = useMemo(() => {
    if (!search) return enrollments;
    const q = search.toLowerCase();
    return enrollments.filter(e =>
      (e.formation_intitule || '').toLowerCase().includes(q) ||
      (e.seance_description || '').toLowerCase().includes(q) ||
      (e.groupe_libelle || '').toLowerCase().includes(q) ||
      (e.prenom || '').toLowerCase().includes(q) ||
      (e.nom || '').toLowerCase().includes(q)
    );
  }, [enrollments, search]);

  const handleExport = () => {
    const columns = [
      { key: 'formation_intitule', label: 'Formation' },
      { key: 'seance_description', label: 'Séance' },
      { key: 'groupe_libelle', label: 'Groupe' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'nom', label: 'Nom' },
      { key: 'email', label: 'Email' },
      { key: 'fonction', label: 'Fonction' },
      { key: 'date_debut', label: 'Début', formatter: formatters.datetime },
      { key: 'date_fin', label: 'Fin', formatter: formatters.datetime },
      { key: 'present', label: 'Présent', formatter: formatters.boolean },
    ];
    exportToExcel(filteredEnrollments, columns, `inscriptions_${entreprise.raison_sociale}`);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Formations & Inscriptions</h1>
              <p className="text-gray-600">Séances et groupes où vos employés sont inscrits</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" as={Link} to="/entreprise/dashboard">Retour au tableau de bord</Button>
              <Button onClick={handleExport}>Exporter</Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && <ErrorMessage error={error} onDismiss={() => setError('')} />}

        <Card>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Rechercher (formation, séance, groupe, employé)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </Card>

        <div className="space-y-4">
          {formations
            .filter(f => enrolledIds.has(f.id))
            .map((f) => {
              const items = filteredEnrollments.filter(e => e.formation_id === f.id);
              if (items.length === 0) return null;
              return (
                <Card key={f.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{f.intitule}</div>
                      {f.cible && <div className="text-sm text-gray-600">{f.cible}</div>}
                    </div>
                    <div className="text-sm text-gray-500">{items.length} inscription(s)</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Séance</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groupe</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Présent</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((i, idx) => (
                          <tr key={i.id || idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{i.seance_description || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{i.groupe_libelle || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{i.prenom} {i.nom}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{i.date_debut ? dateUtils.formatDateTime(i.date_debut) : ''}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{i.date_fin ? dateUtils.formatDateTime(i.date_fin) : ''}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{i.present ? 'Oui' : 'Non'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={handleExport}>Exporter cette formation</Button>
                    <Button as={Link} variant="outline" size="sm" to={`/admin/groupes?formation_id=${f.id}`}>Voir groupes (admin)</Button>
                  </div>
                </Card>
              );
            })}
        </div>
      </main>
    </div>
  );
}



