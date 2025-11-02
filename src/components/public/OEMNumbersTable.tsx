interface OEMPartNumber {
  id: string;
  manufacturer: string;
  oemPartNumber: string;
  notes?: string | null;
}

interface OEMNumbersTableProps {
  oemPartNumbers: OEMPartNumber[];
}

/**
 * Public display component for OEM part numbers
 * Features:
 * - Simple table layout
 * - Alphabetical sorting by manufacturer
 * - Empty state handling
 * - Responsive (horizontal scroll on mobile)
 */
export default function OEMNumbersTable({ oemPartNumbers }: OEMNumbersTableProps) {
  // Sort by manufacturer alphabetically
  const sortedOEMNumbers = [...oemPartNumbers].sort((a, b) =>
    a.manufacturer.localeCompare(b.manufacturer)
  );

  // Empty state
  if (oemPartNumbers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="text-gray-400 text-4xl mb-4">🏷️</div>
        <p className="text-gray-600">No OEM numbers available for this part.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">OEM Part Numbers</h2>
        <p className="text-gray-600">Original Equipment Manufacturer part numbers</p>
      </div>

      {/* Table Container with horizontal scroll on mobile */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Manufacturer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  OEM Part Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedOEMNumbers.map((oemNumber) => (
                <tr key={oemNumber.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-maroon">🏷️</span>
                      <span className="text-gray-900 font-medium">{oemNumber.manufacturer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-1 rounded border border-gray-200">
                      {oemNumber.oemPartNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {oemNumber.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
          <p className="text-sm text-gray-700 font-medium text-center">
            {oemPartNumbers.length} OEM {oemPartNumbers.length === 1 ? 'number' : 'numbers'} listed
          </p>
        </div>
      </div>
    </div>
  );
}
