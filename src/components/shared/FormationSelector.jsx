import { useEffect, useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { formationsService } from '../../services/api';

function FormationSelector({ selectedFormation, onFormationChange, disabled = false }) {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await formationsService.getAll();
        setFormations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  const handleFormationSelect = (formation) => {
    onFormationChange(formation);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner une formation
        </label>
        <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 flex items-center justify-center h-10">
          <LoadingSpinner size="sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner une formation
        </label>
        <ErrorMessage error={error} onDismiss={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Sélectionner une formation
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white border border-gray-300 rounded-md shadow-sm 
            pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 
            focus:ring-orange-500 focus:border-orange-500
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        >
          <span className="flex items-center">
            <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
            <span className="block truncate">
              {selectedFormation ? selectedFormation.intitule : 'Choisir une formation...'}
            </span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {formations.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-center">
                Aucune formation disponible
              </div>
            ) : (
              formations.map((formation) => (
                <button
                  key={formation.id}
                  type="button"
                  onClick={() => handleFormationSelect(formation)}
                  className={`
                    w-full text-left px-3 py-2 hover:bg-orange-50 hover:text-orange-600 
                    transition-colors duration-150
                    ${selectedFormation?.id === formation.id ? 'bg-orange-50 text-orange-600' : 'text-gray-900'}
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{formation.intitule}</span>
                    <span className="text-sm text-gray-500 truncate">
                      {formation.cible || 'Aucune description'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FormationSelector;
