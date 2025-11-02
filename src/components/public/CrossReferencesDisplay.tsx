import Link from 'next/link';

type ReferenceType = 'alternative' | 'supersedes' | 'compatible';

interface CrossReference {
  id: string;
  referenceType: ReferenceType;
  brandName: string;
  partNumber: string;
  notes?: string | null;
  referencedPartId?: string | null;
  referencedPart?: {
    id: string;
    name: string;
    slug: string;
    brand?: string | null;
  } | null;
}

interface CrossReferencesDisplayProps {
  crossReferences: CrossReference[];
}

/**
 * Public display component for product cross-references
 * Features:
 * - Grouped by reference type (Alternative, Supersedes, Compatible)
 * - Card-based layout
 * - Links to referenced parts
 * - Empty state handling
 * - Responsive grid
 */
export default function CrossReferencesDisplay({ crossReferences }: CrossReferencesDisplayProps) {
  // Group cross-references by type
  const groupedReferences = crossReferences.reduce((acc, ref) => {
    if (!acc[ref.referenceType]) {
      acc[ref.referenceType] = [];
    }
    acc[ref.referenceType].push(ref);
    return acc;
  }, {} as Record<ReferenceType, CrossReference[]>);

  // Reference type configuration (Light Theme)
  const referenceTypeConfig: Record<ReferenceType, { label: string; icon: string; color: string; description: string }> = {
    alternative: {
      label: 'Alternative Parts',
      icon: '🔄',
      color: 'border-blue-200 bg-blue-50',
      description: 'Compatible alternatives from other manufacturers',
    },
    supersedes: {
      label: 'Superseding Parts',
      icon: '⬆️',
      color: 'border-green-200 bg-green-50',
      description: 'Newer versions that replace this part',
    },
    compatible: {
      label: 'Compatible Parts',
      icon: '✓',
      color: 'border-purple-200 bg-purple-50',
      description: 'Interchangeable with this part',
    },
  };

  // Empty state
  if (crossReferences.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="text-gray-400 text-4xl mb-4">🔗</div>
        <p className="text-gray-600">No cross-references available for this part.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cross-References</h2>
        <p className="text-gray-600">Find alternative and compatible parts</p>
      </div>

      {/* Grouped Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(Object.keys(referenceTypeConfig) as ReferenceType[]).map((type) => {
          const references = groupedReferences[type];
          if (!references || references.length === 0) return null;

          const config = referenceTypeConfig[type];

          return (
            <div
              key={type}
              className={`border rounded-xl overflow-hidden flex flex-col ${config.color}`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{config.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900">{config.label}</h3>
                </div>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>

              {/* References List - Grows to fill space */}
              <div className="p-4 space-y-3 flex-grow">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-maroon transition-colors"
                  >
                    {/* Brand Name */}
                    <div className="font-bold text-gray-900 mb-1">{ref.brandName}</div>
                    
                    {/* Part Number - Prominent Display */}
                    <div className="text-brand-maroon font-mono text-base font-semibold mb-2">
                      {ref.partNumber}
                    </div>

                    {/* Notes */}
                    {ref.notes && (
                      <p className="text-sm text-gray-600 mb-2">{ref.notes}</p>
                    )}

                    {/* Link to Referenced Part */}
                    {ref.referencedPart && (
                      <Link
                        href={`/products/${ref.referencedPart.slug}`}
                        className="inline-flex items-center gap-1 text-sm text-brand-maroon hover:text-brand-red transition-colors"
                      >
                        View {ref.referencedPart.name}
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer with count - Stuck at bottom with mt-auto */}
              <div className="px-4 py-3 bg-gray-100 border-t border-gray-200 mt-auto">
                <p className="text-sm text-gray-700 font-medium text-center">
                  {references.length} {references.length === 1 ? 'reference' : 'references'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
