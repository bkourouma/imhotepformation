import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import * as api from '../../services/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ArrowLeft, Edit, Mail, Phone, BookOpen, User, Calendar, Clock, Users, MapPin } from 'lucide-react';
import { dateUtils } from '../../utils/helpers';

const EnseignantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const [enseignant, setEnseignant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEnseignant();
  }, [id]);

  const loadEnseignant = async () => {
    try {
      setLoading(true);
      const response = await api.enseignantsService.getWithGroups(id);
      setEnseignant(response);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de l\'enseignant');
      console.error('Erreur loadEnseignant:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return dateUtils.format(date, 'dd/MM/yyyy');
  };

  const getStatusBadge = (enseignant) => {
    return enseignant?.actif ? (
      <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">Actif</span>
    ) : (
      <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm font-medium">Inactif</span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/enseignants')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        <ErrorMessage
          error={error}
          onDismiss={() => setError(null)}
          title="Erreur"
        />
      </div>
    );
  }

  if (!enseignant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Enseignant non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/enseignants')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {enseignant.prenom} {enseignant.nom}
            </h1>
            <p className="text-gray-600">Détails de l'enseignant</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            as={Link}
            to={`/admin/enseignants/${enseignant.id}/edit`}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {enseignant.prenom} {enseignant.nom}
                    </h2>
                    <div className="mt-1">
                      {getStatusBadge(enseignant)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${enseignant.email}`} className="hover:text-orange-600">
                        {enseignant.email}
                      </a>
                    </div>
                    {enseignant.telephone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${enseignant.telephone}`} className="hover:text-orange-600">
                          {enseignant.telephone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Spécialités</h3>
                  <div className="flex flex-wrap gap-2">
                    {enseignant.specialites && enseignant.specialites.length > 0 ? (
                      enseignant.specialites.map((specialite, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                        >
                          <BookOpen className="h-3 w-3" />
                          {specialite}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">Aucune spécialité</span>
                    )}
                  </div>
                </div>
              </div>

              {enseignant.bio && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Biographie</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {enseignant.bio}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Groupes assignés */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Groupes assignés ({enseignant.groupes?.length || 0})
              </h3>
              {enseignant.groupes && enseignant.groupes.length > 0 ? (
                <div className="space-y-4">
                  {enseignant.groupes.map((groupe) => (
                    <div key={groupe.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{groupe.libelle}</h4>
                          <p className="text-sm text-gray-600">{groupe.formation_intitule}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {groupe.participants_count || 0} participants
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(groupe.date_debut)}
                        </span>
                        {groupe.date_fin && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(groupe.date_fin)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          as={Link}
                          to={`/groupes/${groupe.id}`}
                          variant="outline"
                          size="sm"
                        >
                          Voir le groupe
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun groupe assigné</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Statistiques */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Groupes assignés</span>
                  <span className="font-semibold text-gray-900">
                    {enseignant.groupes?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total participants</span>
                  <span className="font-semibold text-gray-900">
                    {enseignant.groupes?.reduce((total, groupe) => total + (groupe.participants_count || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Spécialités</span>
                  <span className="font-semibold text-gray-900">
                    {enseignant.specialites?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnseignantDetail;
