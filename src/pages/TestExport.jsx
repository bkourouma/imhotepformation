import React from 'react';
import ExportButton from '../components/shared/ExportButton';
import Card from '../components/shared/Card';
import { columnConfigs } from '../utils/excelExport';

// Test data for each entity type
const testData = {
  formations: [
    {
      id: 1,
      intitule: 'Formation React Avancé',
      cible: 'Développeurs JavaScript',
      objectifs_pedagogiques: 'Maîtriser les concepts avancés de React',
      duree_totale: 40,
      nombre_seances: 5,
      nombre_participants: 15,
      created_at: '2025-01-01T10:00:00Z'
    },
    {
      id: 2,
      intitule: 'Gestion de Projet Agile',
      cible: 'Chefs de projet',
      objectifs_pedagogiques: 'Comprendre et appliquer les méthodes agiles',
      duree_totale: 24,
      nombre_seances: 3,
      nombre_participants: 12,
      created_at: '2025-01-02T10:00:00Z'
    }
  ],

  seances: [
    {
      id: 1,
      description: 'Session 1: Hooks avancés',
      formation_nom: 'Formation React Avancé',
      date_debut: '2025-09-15T09:00:00',
      date_fin: '2025-09-15T17:00:00',
      lieu: 'Salle A',
      duree: 8,
      capacite_max: 15,
      statut: 'planifie'
    }
  ],

  entreprises: [
    {
      id: 1,
      raison_sociale: 'Digital Innovations SARL',
      email: 'contact@digital-innovations.fr',
      telephone: '01 23 45 67 89',
      adresse: '123 Rue de la Tech, Paris',
      secteur_activite: 'Informatique',
      created_at: '2025-01-01T10:00:00Z'
    }
  ],

  employes: [
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@digital-innovations.fr',
      fonction: 'Développeur Senior',
      telephone: '01 23 45 67 89',
      entreprise_nom: 'Digital Innovations SARL',
      created_at: '2025-01-01T10:00:00Z'
    }
  ],

  inscriptions: [
    {
      id: 1,
      entreprise_nom: 'Digital Innovations SARL',
      formation_nom: 'Formation React Avancé',
      statut: 'confirmee',
      nombre_participants: 5,
      date_inscription: '2025-01-01T10:00:00Z',
      date_debut_formation: '2025-09-15T09:00:00Z'
    }
  ],

  participants: [
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@digital-innovations.fr',
      fonction: 'Développeur Senior',
      telephone: '01 23 45 67 89',
      entreprise_nom: 'Digital Innovations SARL',
      present: true,
      date_inscription: '2025-01-01T10:00:00Z'
    }
  ]
};

const TestExport = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Excel Export</h1>
        <p className="text-gray-600">
          Page de test pour vérifier le fonctionnement des exports Excel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Formations Export */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Formations</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export des données de formations avec {testData.formations.length} éléments
            </p>
            <ExportButton
              data={testData.formations}
              columns={columnConfigs.formations}
              filename="test_formations"
              sheetName="Formations"
              className="w-full"
              onExportComplete={(filename) => {
                alert(`Export réussi: ${filename}`);
              }}
              onExportError={(error) => {
                alert(`Erreur d'export: ${error}`);
              }}
            />
          </div>
        </Card>

        {/* Seances Export */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Séances</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export des données de séances avec {testData.seances.length} éléments
            </p>
            <ExportButton
              data={testData.seances}
              columns={columnConfigs.seances}
              filename="test_seances"
              sheetName="Séances"
              className="w-full"
              onExportComplete={(filename) => {
                alert(`Export réussi: ${filename}`);
              }}
              onExportError={(error) => {
                alert(`Erreur d'export: ${error}`);
              }}
            />
          </div>
        </Card>

        {/* Entreprises Export */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Entreprises</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export des données d'entreprises avec {testData.entreprises.length} éléments
            </p>
            <ExportButton
              data={testData.entreprises}
              columns={columnConfigs.entreprises}
              filename="test_entreprises"
              sheetName="Entreprises"
              className="w-full"
              onExportComplete={(filename) => {
                alert(`Export réussi: ${filename}`);
              }}
              onExportError={(error) => {
                alert(`Erreur d'export: ${error}`);
              }}
            />
          </div>
        </Card>

        {/* Employes Export */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Employés</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export des données d'employés avec {testData.employes.length} éléments
            </p>
            <ExportButton
              data={testData.employes}
              columns={columnConfigs.employes}
              filename="test_employes"
              sheetName="Employés"
              className="w-full"
              onExportComplete={(filename) => {
                alert(`Export réussi: ${filename}`);
              }}
              onExportError={(error) => {
                alert(`Erreur d'export: ${error}`);
              }}
            />
          </div>
        </Card>

        {/* Inscriptions Export */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Inscriptions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export des données d'inscriptions avec {testData.inscriptions.length} éléments
            </p>
            <ExportButton
              data={testData.inscriptions}
              columns={columnConfigs.inscriptions}
              filename="test_inscriptions"
              sheetName="Inscriptions"
              className="w-full"
              onExportComplete={(filename) => {
                alert(`Export réussi: ${filename}`);
              }}
              onExportError={(error) => {
                alert(`Erreur d'export: ${error}`);
              }}
            />
          </div>
        </Card>

        {/* Participants Export */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Participants</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export des données de participants avec {testData.participants.length} éléments
            </p>
            <ExportButton
              data={testData.participants}
              columns={columnConfigs.participants}
              filename="test_participants"
              sheetName="Participants"
              className="w-full"
              onExportComplete={(filename) => {
                alert(`Export réussi: ${filename}`);
              }}
              onExportError={(error) => {
                alert(`Erreur d'export: ${error}`);
              }}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-3">Instructions de test</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Cliquez sur chaque bouton d'export pour tester la fonctionnalité</p>
            <p>2. Vérifiez que les fichiers Excel se téléchargent correctement</p>
            <p>3. Ouvrez les fichiers pour vérifier le formatage des données</p>
            <p>4. Vérifiez que les colonnes sont correctement dimensionnées</p>
            <p>5. Testez avec des données réelles sur les pages principales</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestExport;
