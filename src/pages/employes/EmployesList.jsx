import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCompanySession } from '../../hooks/useCompanySession';
import { employesService } from '../../services/api';
import Layout from '../../components/shared/Layout';
import Card from '../../components/shared/Card';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import ExportButton from '../../components/shared/ExportButton';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { columnConfigs } from '../../utils/excelExport';

const EmployesList = () => {
  const { selectedCompany } = useCompanySession();
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, employe: null });
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    loadEmployes();
  }, [searchTerm, selectedCompany]);

  const loadEmployes = async () => {
    try {
      setLoading(true);
      const filters = {
        entreprise_id: selectedCompany?.id,
        search: searchTerm
      };
      
      console.log('Loading employes with filters:', filters);
      console.log('Selected company:', selectedCompany);
      
      const response = await employesService.getAll(filters);
      console.log('API response:', response);
      
      // Log the first employee to see the data structure
      if (response && response.length > 0) {
        console.log('First employee data:', response[0]);
      }
      
      // Ensure response is an array
      const employesData = Array.isArray(response) ? response : [];
      console.log('Processed employes data:', employesData);
      setEmployes(employesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des employés');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employe) => {
    try {
      await employesService.delete(employe.id);
      setDeleteModal({ show: false, employe: null });
      loadEmployes();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'employé');
      console.error('Erreur:', err);
    }
  };

  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (employe) => employe ? `${employe.prenom || ''} ${employe.nom || ''}`.trim() : ''
    },
    {
      key: 'email',
      label: 'Email',
      render: (employe) => employe?.email || ''
    },
    {
      key: 'fonction',
      label: 'Fonction',
      render: (employe) => employe?.fonction || ''
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (employe) => employe?.telephone || ''
    },
    {
      key: 'password',
      label: (
        <div className="flex items-center gap-2">
          <span>Mot de passe</span>
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="p-1 hover:bg-gray-100 rounded"
            title={showPasswords ? "Masquer les mots de passe" : "Afficher les mots de passe"}
          >
            {showPasswords ? (
              <EyeOff className="h-3 w-3 text-gray-500" />
            ) : (
              <Eye className="h-3 w-3 text-gray-500" />
            )}
          </button>
        </div>
      ),
      render: (employe) => {
        if (!employe?.password) return '';
        return (
          <div className="flex items-center gap-2">
            <span className={`font-mono text-sm ${showPasswords ? 'text-gray-900' : 'text-gray-400'}`}>
              {showPasswords ? employe.password : '••••••'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (employe) => employe ? (
        <div className="flex gap-2">
          <Link to={`/employes/${employe.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link to={`/employes/${employe.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDeleteModal({ show: true, employe })}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ) : null
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show message if no company is selected
  if (!selectedCompany) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            Veuillez sélectionner une entreprise pour voir les employés
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <p className="text-gray-600">
            Gérez les employés de votre entreprise
          </p>
        </div>
                 <div className="flex items-center gap-3">
           <ExportButton
            data={employes}
            columns={columnConfigs.employes}
            filename="employes"
            sheetName="Employés"
            onExportComplete={(filename) => {
              console.log(`Export réussi: ${filename}`);
            }}
            onExportError={(error) => {
              console.error('Erreur d\'export:', error);
            }}
          />
          <Button as={Link} to="/employes/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvel employé
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)}
          title="Erreur"
        />
      )}

      {/* Employee Cards */}
      <Card>
        {employes.length > 0 ? (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Employés ({employes.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employes.map((employe, index) => (
                <div key={employe?.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {employe?.prenom} {employe?.nom}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{employe?.fonction}</p>
                    </div>
                    <div className="flex gap-1">
                      <Link to={`/employes/${employe?.id}`}>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/employes/${employe?.id}/edit`}>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 text-red-600 hover:text-red-700"
                        onClick={() => setDeleteModal({ show: true, employe })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📧</span>
                      <span className="text-gray-700">{employe?.email}</span>
                    </div>
                    {employe?.telephone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📞</span>
                        <span className="text-gray-700">{employe?.telephone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Aucun employé trouvé' : 'Aucun employé pour le moment'}
            </p>
            {!searchTerm && (
              <Button as={Link} to="/employes/new">
                Ajouter le premier employé
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'employé "{deleteModal.employe?.prenom} {deleteModal.employe?.nom}" ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ show: false, employe: null })}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteModal.employe)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployesList; 