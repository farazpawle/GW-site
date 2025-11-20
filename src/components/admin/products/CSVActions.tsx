'use client';

import { useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import ExportModal from './ExportModal';
import ImportWizard from './ImportWizard';

interface CSVActionsProps {
  totalProducts: number;
  currentFilters?: {
    search?: string;
    categoryId?: string;
    stockFilter?: string;
  };
}

export default function CSVActions({ totalProducts, currentFilters }: CSVActionsProps) {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);

  const handleImportComplete = () => {
    // Refresh the page to show newly imported products
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExportModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export CSV
        </button>

        <button
          onClick={() => setImportWizardOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        totalProducts={totalProducts}
        currentFilters={currentFilters}
      />

      {/* Import Wizard */}
      <ImportWizard
        isOpen={importWizardOpen}
        onClose={() => setImportWizardOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </>
  );
}
