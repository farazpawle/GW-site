'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Download, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

type ImportMode = 'create' | 'update' | 'upsert';
type DataType = 'products' | 'cross-reference' | 'oem-numbers' | 'vehicle-compatibility';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ValidationWarning {
  row: number;
  field: string;
  message: string;
}

interface ValidationResult {
  totalRows: number;
  valid: number;
  invalid: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface PreviewRow {
  rowNumber: number;
  data: Record<string, string>;
}

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: ValidationError[];
}

type Step = 1 | 2 | 3 | 4;

export default function ImportWizard({ isOpen, onClose, onImportComplete }: ImportWizardProps) {
  const [dataType, setDataType] = useState<DataType>('products');
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [importMode, setImportMode] = useState<ImportMode>('upsert');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset wizard when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setDataType('products');
        setStep(1);
        setFile(null);
        setValidation(null);
        setPreview([]);
        setImportMode('upsert');
        setImportResult(null);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isValidating && !isImporting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isValidating, isImporting, onClose]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a valid CSV file');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  // Step 1 → Step 2: Validate
  const handleValidate = async () => {
    if (!file) return;

    setIsValidating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Determine API endpoint based on data type
      let apiEndpoint = '/api/admin/products/import/validate';
      if (dataType !== 'products') {
        apiEndpoint = `/api/admin/products/import/${dataType}/validate`;
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      setValidation(data.validation);
      setPreview(data.preview);
      setStep(2);
    } catch (err) {
      console.error('Validation error:', err);
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  // Step 3: Execute Import
  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (dataType === 'products') {
        formData.append('mode', importMode);
      }

      // Determine API endpoint based on data type
      let apiEndpoint = '/api/admin/products/import/execute';
      if (dataType !== 'products') {
        apiEndpoint = `/api/admin/products/import/${dataType}/execute`;
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data.results);
      setStep(4);
      
      // Call onImportComplete for parent to refresh
      if (data.results.created > 0 || data.results.updated > 0) {
        onImportComplete();
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  // Download error report
  const downloadErrorReport = (errors: ValidationError[]) => {
    const csv = [
      'Row,Field,Error',
      ...errors.map(e => `${e.row},"${e.field}","${e.message}"`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import-errors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isValidating && !isImporting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6e0000]/10 rounded-lg">
              <Upload className="w-6 h-6 text-[#6e0000]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Import {dataType === 'products' ? 'Products' : dataType === 'cross-reference' ? 'Cross References' : dataType === 'oem-numbers' ? 'OEM Numbers' : 'Vehicle Compatibility'}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Step {step} of 4: {
                  step === 1 ? 'Upload File' : 
                  step === 2 ? 'Validate Data' : 
                  step === 3 ? 'Configure Import' : 
                  'Review Results'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isValidating || isImporting}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-[#0a0a0a] border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${i > 0 ? 'flex-1' : ''}`}>
                  {i > 0 && (
                    <div className={`flex-1 h-0.5 ${step > s - 1 ? 'bg-[#6e0000]' : 'bg-[#2a2a2a]'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                    step >= s ? 'bg-[#6e0000] text-white' : 'bg-[#2a2a2a] text-gray-500'
                  }`}>
                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* STEP 1: File Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Data Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Select data type to import
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDataType('products')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      dataType === 'products'
                        ? 'bg-[#6e0000] border-[#6e0000] text-white'
                        : 'bg-[#0a0a0a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]'
                    }`}
                  >
                    Product Info
                  </button>
                  <button
                    onClick={() => setDataType('cross-reference')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      dataType === 'cross-reference'
                        ? 'bg-[#6e0000] border-[#6e0000] text-white'
                        : 'bg-[#0a0a0a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]'
                    }`}
                  >
                    Cross Reference
                  </button>
                  <button
                    onClick={() => setDataType('oem-numbers')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      dataType === 'oem-numbers'
                        ? 'bg-[#6e0000] border-[#6e0000] text-white'
                        : 'bg-[#0a0a0a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]'
                    }`}
                  >
                    OEM Numbers
                  </button>
                  <button
                    onClick={() => setDataType('vehicle-compatibility')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      dataType === 'vehicle-compatibility'
                        ? 'bg-[#6e0000] border-[#6e0000] text-white'
                        : 'bg-[#0a0a0a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]'
                    }`}
                  >
                    Vehicle Compatibility
                  </button>
                </div>
              </div>

              {/* Download Template Link */}
              <div className="bg-blue-900/20 border border-blue-800 text-blue-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                <span>💡 First time importing? Download the CSV template to see the required format.</span>
                <a
                  href={
                    dataType === 'products' 
                      ? '/api/admin/products/template'
                      : `/api/admin/products/template/${dataType}`
                  }
                  download
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Template
                </a>
              </div>

              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragging
                    ? 'border-[#6e0000] bg-[#6e0000]/5'
                    : 'border-[#2a2a2a] bg-[#0a0a0a] hover:border-[#6e0000]/50'
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                
                {file ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                      <FileText className="w-5 h-5 text-[#6e0000]" />
                      <span className="text-white font-medium">{file.name}</span>
                      <span className="text-gray-400 text-sm">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Click or drag to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium mb-2">
                      Drag & drop your CSV file here
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* CSV Format Info */}
              <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">CSV Requirements:</h3>
                {dataType === 'products' && (
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Must include headers: name, sku, partNumber, price, category</li>
                    <li>SKU must be unique across all products</li>
                    <li>Category must match an existing category name</li>
                    <li>Price must be a positive number</li>
                  </ul>
                )}
                {dataType === 'cross-reference' && (
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Must include headers: productSKU, referenceType, brandName, partNumber</li>
                    <li>Product SKU must match an existing product</li>
                    <li>All fields are required except notes</li>
                  </ul>
                )}
                {dataType === 'oem-numbers' && (
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Must include headers: productSKU, manufacturer, oemPartNumber</li>
                    <li>Product SKU must match an existing product</li>
                    <li>All fields are required except notes</li>
                  </ul>
                )}
                {dataType === 'vehicle-compatibility' && (
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Must include headers: productSKU, make, model, yearStart, yearEnd</li>
                    <li>Product SKU must match an existing product</li>
                    <li>Years must be between 1900 and 2100</li>
                    <li>yearEnd must be greater than or equal to yearStart</li>
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Validation Results */}
          {step === 2 && validation && (
            <div className="space-y-6">
              {/* Validation Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Rows</div>
                  <div className="text-2xl font-bold text-white">{validation.totalRows}</div>
                </div>
                <div className="bg-[#0a0a0a] border border-green-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Valid</div>
                  <div className="text-2xl font-bold text-green-400">{validation.valid}</div>
                </div>
                <div className="bg-[#0a0a0a] border border-red-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Invalid</div>
                  <div className="text-2xl font-bold text-red-400">{validation.invalid}</div>
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <h3 className="text-white font-medium mb-3">Preview (First 10 Rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
                        <th className="px-3 py-2 text-left text-gray-400 font-medium">Row</th>
                        <th className="px-3 py-2 text-left text-gray-400 font-medium">Name</th>
                        <th className="px-3 py-2 text-left text-gray-400 font-medium">SKU</th>
                        <th className="px-3 py-2 text-left text-gray-400 font-medium">Price</th>
                        <th className="px-3 py-2 text-left text-gray-400 font-medium">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row) => (
                        <tr key={row.rowNumber} className="border-b border-[#2a2a2a]">
                          <td className="px-3 py-2 text-gray-500">{row.rowNumber}</td>
                          <td className="px-3 py-2 text-white">{row.data.name}</td>
                          <td className="px-3 py-2 text-gray-400">{row.data.sku}</td>
                          <td className="px-3 py-2 text-gray-400">${row.data.price}</td>
                          <td className="px-3 py-2 text-gray-400">{row.data.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Errors */}
              {validation.errors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-red-400 font-medium">Errors ({validation.errors.length})</h3>
                    <button
                      onClick={() => downloadErrorReport(validation.errors)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-xs hover:bg-red-900/30 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download Report
                    </button>
                  </div>
                  <div className="bg-red-900/10 border border-red-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {validation.errors.slice(0, 10).map((err, i) => (
                        <div key={i} className="text-sm text-red-400">
                          Row {err.row}, {err.field}: {err.message}
                        </div>
                      ))}
                      {validation.errors.length > 10 && (
                        <div className="text-sm text-red-400 italic">
                          ... and {validation.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div>
                  <h3 className="text-yellow-400 font-medium mb-3">Warnings ({validation.warnings.length})</h3>
                  <div className="bg-yellow-900/10 border border-yellow-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {validation.warnings.slice(0, 10).map((warn, i) => (
                        <div key={i} className="text-sm text-yellow-400">
                          Row {warn.row}, {warn.field}: {warn.message}
                        </div>
                      ))}
                      {validation.warnings.length > 10 && (
                        <div className="text-sm text-yellow-400 italic">
                          ... and {validation.warnings.length - 10} more warnings
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Import Mode Selection */}
          {step === 3 && validation && (
            <div className="space-y-6">
              <div className="bg-blue-900/20 border border-blue-800 text-blue-400 px-4 py-3 rounded-lg text-sm">
                <strong>Ready to import {validation.valid} valid {dataType === 'products' ? 'products' : 'records'}.</strong>
                {validation.invalid > 0 && ` ${validation.invalid} invalid rows will be skipped.`}
              </div>

              {dataType !== 'products' && (
                <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-400 px-4 py-3 rounded-lg text-sm">
                  ⚠️ Import will <strong>replace all existing {dataType.replace('-', ' ')}</strong> data for each product. Existing data will be deleted first, then new data will be imported.
                </div>
              )}

              {dataType === 'products' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Import Mode
                  </label>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors">
                    <input
                      type="radio"
                      name="importMode"
                      value="upsert"
                      checked={importMode === 'upsert'}
                      onChange={(e) => setImportMode(e.target.value as ImportMode)}
                      className="mt-1 w-4 h-4 text-[#6e0000] focus:ring-[#6e0000]"
                    />
                    <div>
                      <div className="text-white font-medium">Upsert (Recommended)</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Create new products or update existing ones by SKU. Safe for any scenario.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors">
                    <input
                      type="radio"
                      name="importMode"
                      value="create"
                      checked={importMode === 'create'}
                      onChange={(e) => setImportMode(e.target.value as ImportMode)}
                      className="mt-1 w-4 h-4 text-[#6e0000] focus:ring-[#6e0000]"
                    />
                    <div>
                      <div className="text-white font-medium">Create Only</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Only create new products. Will fail if any SKU already exists.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors">
                    <input
                      type="radio"
                      name="importMode"
                      value="update"
                      checked={importMode === 'update'}
                      onChange={(e) => setImportMode(e.target.value as ImportMode)}
                      className="mt-1 w-4 h-4 text-[#6e0000] focus:ring-[#6e0000]"
                    />
                    <div>
                      <div className="text-white font-medium">Update Only</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Only update existing products by SKU. Will fail if SKU not found.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              )}
            </div>
          )}

          {/* STEP 4: Results */}
          {step === 4 && importResult && (
            <div className="space-y-6">
              {/* Success Message */}
              {importResult.failed === 0 ? (
                <div className="bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>Import completed successfully!</strong>
                    <div className="text-sm mt-1">All products were processed without errors.</div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-400 px-4 py-3 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>Import completed with some errors.</strong>
                    <div className="text-sm mt-1">Some products could not be processed.</div>
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Total</div>
                  <div className="text-2xl font-bold text-white">{importResult.total}</div>
                </div>
                <div className="bg-[#0a0a0a] border border-green-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Created</div>
                  <div className="text-2xl font-bold text-green-400">{importResult.created}</div>
                </div>
                <div className="bg-[#0a0a0a] border border-blue-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Updated</div>
                  <div className="text-2xl font-bold text-blue-400">{importResult.updated}</div>
                </div>
                <div className="bg-[#0a0a0a] border border-red-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Failed</div>
                  <div className="text-2xl font-bold text-red-400">{importResult.failed}</div>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-red-400 font-medium">Errors ({importResult.errors.length})</h3>
                    <button
                      onClick={() => downloadErrorReport(importResult.errors)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-xs hover:bg-red-900/30 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download Report
                    </button>
                  </div>
                  <div className="bg-red-900/10 border border-red-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {importResult.errors.slice(0, 10).map((err, i) => (
                        <div key={i} className="text-sm text-red-400">
                          Row {err.row}, {err.field}: {err.message}
                        </div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <div className="text-sm text-red-400 italic">
                          ... and {importResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a] bg-[#0a0a0a]">
          <div>
            {step > 1 && step < 4 && !isValidating && !isImporting && (
              <button
                onClick={() => setStep((step - 1) as Step)}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 4 ? (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors"
              >
                Done
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  disabled={isValidating || isImporting}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                {step === 1 && (
                  <button
                    onClick={handleValidate}
                    disabled={!file || isValidating}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {step === 2 && validation && validation.valid > 0 && (
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {step === 3 && (
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import Products
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
