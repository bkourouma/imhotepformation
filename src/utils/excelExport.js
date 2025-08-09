import * as XLSX from 'xlsx';
import { dateUtils } from './helpers';

/**
 * Utility functions for exporting data to Excel
 */

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions with key, label, and optional formatter
 * @param {string} filename - Name of the file (without extension)
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, columns, filename, sheetName = 'Data') => {
  try {
    // Transform data based on column definitions
    const transformedData = data.map(row => {
      const transformedRow = {};
      columns.forEach(column => {
        const value = row[column.key];
        const label = column.label || column.title || column.key;
        
        // Apply formatter if provided
        if (column.formatter && typeof column.formatter === 'function') {
          transformedRow[label] = column.formatter(value, row);
        } else if (column.render && typeof column.render === 'function') {
          // For complex render functions, try to extract text content
          const rendered = column.render(value, row);
          if (typeof rendered === 'string') {
            transformedRow[label] = rendered;
          } else if (rendered && rendered.props && rendered.props.children) {
            // Try to extract text from React elements
            transformedRow[label] = extractTextFromReactElement(rendered);
          } else {
            transformedRow[label] = value || '';
          }
        } else {
          transformedRow[label] = value || '';
        }
      });
      return transformedRow;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(transformedData);

    // Auto-size columns
    const columnWidths = columns.map(column => {
      const label = column.label || column.title || column.key;
      const maxLength = Math.max(
        label.length,
        ...transformedData.map(row => String(row[label] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Max width of 50 characters
    });
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, fullFilename);

    return { success: true, filename: fullFilename };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Extract text content from React elements (simplified)
 */
const extractTextFromReactElement = (element) => {
  if (typeof element === 'string') return element;
  if (typeof element === 'number') return String(element);
  if (!element) return '';
  
  if (element.props) {
    if (typeof element.props.children === 'string') {
      return element.props.children;
    }
    if (Array.isArray(element.props.children)) {
      return element.props.children
        .map(child => extractTextFromReactElement(child))
        .join(' ');
    }
    if (element.props.children) {
      return extractTextFromReactElement(element.props.children);
    }
  }
  
  return '';
};

/**
 * Common formatters for different data types
 */
export const formatters = {
  date: (value) => {
    if (!value) return '';
    try {
      return dateUtils.format(value);
    } catch {
      return value;
    }
  },
  
  datetime: (value) => {
    if (!value) return '';
    try {
      return dateUtils.formatDateTime(value);
    } catch {
      return value;
    }
  },
  
  currency: (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  },
  
  number: (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('fr-FR').format(value);
  },
  
  boolean: (value) => {
    if (value === null || value === undefined) return '';
    return value ? 'Oui' : 'Non';
  },
  
  truncate: (maxLength = 50) => (value) => {
    if (!value) return '';
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  }
};

/**
 * Predefined column configurations for common entities
 */
export const columnConfigs = {
  formations: [
    { key: 'intitule', label: 'Intitulé' },
    { key: 'cible', label: 'Public cible' },
    { key: 'objectifs_pedagogiques', label: 'Objectifs pédagogiques', formatter: formatters.truncate(100) },
    { key: 'duree_totale', label: 'Durée totale (heures)', formatter: formatters.number },
    { key: 'nombre_seances', label: 'Nombre de séances', formatter: formatters.number },
    { key: 'nombre_participants', label: 'Nombre de participants', formatter: formatters.number },
    { key: 'created_at', label: 'Date de création', formatter: formatters.date }
  ],

  seances: [
    { key: 'description', label: 'Description' },
    { key: 'formation_nom', label: 'Formation' },
    { key: 'date_debut', label: 'Date de début', formatter: formatters.datetime },
    { key: 'date_fin', label: 'Date de fin', formatter: formatters.datetime },
    { key: 'lieu', label: 'Lieu' },
    { key: 'duree', label: 'Durée (heures)', formatter: formatters.number },
    { key: 'capacite_max', label: 'Capacité maximale', formatter: formatters.number },
    { key: 'statut', label: 'Statut' }
  ],

  entreprises: [
    { key: 'raison_sociale', label: 'Raison sociale' },
    { key: 'email', label: 'Email' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'secteur_activite', label: 'Secteur d\'activité' },
    { key: 'created_at', label: 'Date d\'inscription', formatter: formatters.date }
  ],

  employes: [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'fonction', label: 'Fonction' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'password', label: 'Mot de passe' },
    { key: 'entreprise_nom', label: 'Entreprise' },
    { key: 'created_at', label: 'Date de création', formatter: formatters.date }
  ],

  inscriptions: [
    { key: 'formation_intitule', label: 'Formation' },
    { key: 'formation_cible', label: 'Public cible' },
    { key: 'nombre_seances', label: 'Nombre de séances', formatter: formatters.number },
    { key: 'nombre_participants', label: 'Nombre de participants', formatter: formatters.number },
    { key: 'premiere_seance', label: 'Première séance', formatter: formatters.date },
    { key: 'derniere_seance', label: 'Dernière séance', formatter: formatters.date }
  ],

  participants: [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'fonction', label: 'Fonction' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'entreprise_nom', label: 'Entreprise' },
    { key: 'present', label: 'Présent', formatter: formatters.boolean },
    { key: 'date_inscription', label: 'Date d\'inscription', formatter: formatters.date }
  ],

  presence: [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'fonction', label: 'Fonction' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'entreprise_nom', label: 'Entreprise' },
    { key: 'formation_intitule', label: 'Formation' },
    { key: 'seance_description', label: 'Séance' },
    { key: 'groupe_libelle', label: 'Groupe' },
    { key: 'present', label: 'Présent', formatter: formatters.boolean },
    { key: 'date_debut', label: 'Date de début', formatter: formatters.date },
    { key: 'date_fin', label: 'Date de fin', formatter: formatters.date }
  ]
};
