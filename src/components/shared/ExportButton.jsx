import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import Button from './Button';
import { exportToExcel } from '../../utils/excelExport';

/**
 * Reusable Export Button component for Excel export functionality
 */
const ExportButton = ({
  data = [],
  columns = [],
  filename = 'export',
  sheetName = 'Data',
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className = '',
  children,
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      const error = 'Aucune donnée à exporter';
      if (onExportError) onExportError(error);
      return;
    }

    if (!columns || columns.length === 0) {
      const error = 'Configuration des colonnes manquante';
      if (onExportError) onExportError(error);
      return;
    }

    try {
      setIsExporting(true);
      if (onExportStart) onExportStart();

      const result = await exportToExcel(data, columns, filename, sheetName);

      if (result.success) {
        if (onExportComplete) {
          onExportComplete(result.filename);
        }
      } else {
        if (onExportError) {
          onExportError(result.error);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      if (onExportError) {
        onExportError(error.message);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={disabled || isExporting || !data || data.length === 0}
      className={`flex items-center gap-2 ${className}`}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Export...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4" />
          {children || 'Exporter Excel'}
        </>
      )}
    </Button>
  );
};

export default ExportButton;
