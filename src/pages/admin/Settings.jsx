import React from 'react';
import { Card } from '../../components/shared';

export default function AdminSettings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez la configuration de l'application</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="p-6">
          <p className="text-gray-700">Page de paramètres (à compléter).</p>
        </Card>
      </main>
    </div>
  );
}



