/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, ExternalLink, Eye, EyeOff, Lock } from 'lucide-react';
import type { Category, Prisma } from '@prisma/client';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Badge } from '@/components/ui/badge';

// Serialized product type for client components (Decimal converted to number)
interface ProductWithCategory {
  id: string;
  name: string;
  partNumber: string;
  sku: string;
  description: string | null;
  shortDesc: string | null;
  price: number; // Serialized from Decimal
  comparePrice: number | null; // Serialized from Decimal
  compareAtPrice: number | null; // Serialized from Decimal
  categoryId: string;
  images: string[];
  specifications: Prisma.JsonValue | null;
  compatibility: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  // Showcase fields (Phase 4.5)
  published: boolean;
  publishedAt: Date | null;
  showcaseOrder: number;
  views: number;
  tags: string[];
  brand: string | null;
  origin: string | null;
  certifications: string[];
  warranty: string | null;
  application: string[];
  pdfUrl: string | null;
  hasVariants: boolean;
  category: Category | null;
  // Inventory fields (Phase 6)
  stockQuantity?: number;
  inStock?: boolean;
}

interface ProductTableProps {
  products: ProductWithCategory[];
  currentSort: string;
}

export default function ProductTable({ products, currentSort }: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  // permissionsLoading is set but currently not displayed in UI
  const [, setPermissionsLoading] = useState(true);

  // Fetch user permissions on mount
  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch('/api/auth/me?t=' + Date.now(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const data = await response.json();
        
        if (data.success && data.data.permissions) {
          setUserPermissions(data.data.permissions);
        }
      } catch (error) {
        console.error('[ProductTable] Error fetching permissions:', error);
      } finally {
        setPermissionsLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  // Check if user has permission
  const hasPermission = (permission: string) => {
    if (userPermissions.includes(permission)) return true;
    // Check wildcard permissions (e.g., "products.*" allows "products.edit")
    const resource = permission.split('.')[0];
    return userPermissions.includes(`${resource}.*`);
  };

  const canEdit = hasPermission('products.edit');
  const canDelete = hasPermission('products.delete');

  const getSortLink = (field: string) => {
    const currentField = currentSort.split('-')[0];
    const currentOrder = currentSort.split('-')[1];
    const newOrder = currentField === field && currentOrder === 'asc' ? 'desc' : 'asc';
    return `?sort=${field}-${newOrder}`;
  };

  const getSortIndicator = (field: string) => {
    const currentField = currentSort.split('-')[0];
    const currentOrder = currentSort.split('-')[1];
    if (currentField !== field) return null;
    return currentOrder === 'asc' ? '↑' : '↓';
  };

  // Toggle single product selection
  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toggle all products
  const toggleAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  // Handle single delete
  const handleDeleteClick = (product: { id: string; name: string }) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/admin/parts/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh the page to show updated list
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} product(s)? This cannot be undone.`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/parts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          operation: 'delete',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete products');
      }

      setSelectedIds(new Set());
      window.location.reload();
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete products. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk stock update (currently unused but kept for future feature)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleBulkStock = async (inStock: boolean) => {
    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/parts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          operation: 'updateStock',
          data: { inStock },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update stock status');
      }

      setSelectedIds(new Set());
      window.location.reload();
    } catch (error) {
      console.error('Bulk stock update error:', error);
      alert('Failed to update stock status. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk featured update
  const handleBulkFeatured = async (featured: boolean) => {
    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/parts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          operation: 'updateFeatured',
          data: { featured },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update featured status');
      }

      setSelectedIds(new Set());
      window.location.reload();
    } catch (error) {
      console.error('Bulk featured update error:', error);
      alert('Failed to update featured status. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk publish update
  const handleBulkPublish = async (published: boolean) => {
    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/parts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          operation: 'updatePublished',
          data: { published },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update published status');
      }

      setSelectedIds(new Set());
      window.location.reload();
    } catch (error) {
      console.error('Bulk publish update error:', error);
      alert('Failed to update published status. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <>
      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div className="text-white">
            <span className="font-semibold">{selectedIds.size}</span> product{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEdit ? (
              <>
                <button
                  onClick={() => handleBulkFeatured(true)}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors disabled:opacity-50"
                >
                  Set Featured
                </button>
                <button
                  onClick={() => handleBulkFeatured(false)}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                >
                  Remove Featured
                </button>
                <div className="w-px h-8 bg-[#2a2a2a]"></div>
                <button
                  onClick={() => handleBulkPublish(true)}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-blue-900/30 text-blue-400 border border-blue-800 rounded-lg hover:bg-blue-900/50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Publish
                </button>
                <button
                  onClick={() => handleBulkPublish(false)}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-gray-900/30 text-gray-400 border border-gray-800 rounded-lg hover:bg-gray-900/50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  Unpublish
                </button>
                <div className="w-px h-8 bg-[#2a2a2a]"></div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/30 text-gray-500 border border-gray-800 rounded-lg">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Bulk edit disabled (missing products.edit permission)</span>
              </div>
            )}
            
            {canDelete ? (
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-800 rounded-lg hover:bg-red-900/50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/30 text-gray-500 border border-gray-800 rounded-lg">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Delete disabled (missing products.delete permission)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#0a0a0a]">
                <th className="px-2 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === products.length && products.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0a0a0a] checked:bg-brand-maroon focus:ring-brand-maroon"
                  />
                </th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-16">Image</th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-[15%]">
                  <Link href={getSortLink('name')} className="hover:text-white flex items-center gap-1">
                    Name {getSortIndicator('name')}
                  </Link>
                </th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-[9%]">
                  <Link href={getSortLink('partNumber')} className="hover:text-white flex items-center gap-1">
                    Part # {getSortIndicator('partNumber')}
                  </Link>
                </th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-[8%]">
                  <Link href={getSortLink('sku')} className="hover:text-white flex items-center gap-1">
                    SKU {getSortIndicator('sku')}
                  </Link>
                </th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-[8%]">Category</th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-[8%]">Brand</th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-[7%]">Origin</th>
                <th className="px-2 py-3 text-center text-sm font-medium text-gray-300 w-[5%]">
                  <Link href={getSortLink('showcaseOrder')} className="hover:text-white flex items-center justify-center gap-1">
                    Order {getSortIndicator('showcaseOrder')}
                  </Link>
                </th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-[7%]">
                  <Link href={getSortLink('price')} className="hover:text-white flex items-center gap-1">
                    Price {getSortIndicator('price')}
                  </Link>
                </th>
                <th className="px-2 py-3 text-left text-sm font-medium text-gray-300 w-[10%]">
                  <Link href={getSortLink('stockQuantity')} className="hover:text-white flex items-center gap-1">
                    Stock Status {getSortIndicator('stockQuantity')}
                  </Link>
                </th>
                <th className="px-2 py-3 text-right text-sm font-medium text-gray-300 w-[8%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[#2a2a2a] hover:bg-[#0a0a0a] transition-colors">
                  <td className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0a0a0a] checked:bg-brand-maroon focus:ring-brand-maroon"
                    />
                  </td>
                  <td className="px-2 py-3">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-gray-300 relative p-1">
                        <Image
                          src="/images/default-logo.png"
                          alt="GW Logo"
                          fill
                          className="object-contain opacity-90 p-0.5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/GW_LOGO-removebg.png';
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div>
                      <p className="text-white font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {product.featured && (
                          <span className="inline-block px-1.5 py-0.5 bg-[#6e0000] text-white text-xs rounded">
                            Featured
                          </span>
                        )}
                        {product.published && (
                          <span className="inline-block px-1.5 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-800 text-xs rounded">
                            Published
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-gray-300 font-mono text-xs truncate">{product.partNumber}</td>
                  <td className="px-2 py-3 text-gray-400 font-mono text-xs truncate">{'sku' in product ? (product.sku as string) : '-'}</td>
                  <td className="px-2 py-3 text-gray-300 text-xs truncate">{product.category?.name || '-'}</td>
                  {/* Brand Column */}
                  <td className="px-2 py-3 text-gray-300 text-xs truncate" title={product.brand || ''}>
                    {product.brand || '-'}
                  </td>
                  {/* Origin Column */}
                  <td className="px-2 py-3 text-gray-300 text-xs truncate" title={product.origin || ''}>
                    {product.origin || '-'}
                  </td>
                  {/* Showcase Order Column */}
                  <td className="px-2 py-3 text-center">
                    <span className="inline-block px-1.5 py-0.5 bg-[#0a0a0a] border border-[#2a2a2a] text-gray-300 text-xs rounded font-mono">
                      {product.showcaseOrder || 999}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div>
                      <p className="text-white font-medium text-sm whitespace-nowrap">${product.price.toFixed(2)}</p>
                      {product.comparePrice && (
                        <p className="text-gray-500 text-xs line-through whitespace-nowrap">
                          ${product.comparePrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    {(() => {
                      const inStock = (product as any).inStock ?? true;
                      const stockQty = (product as any).stockQuantity ?? 0;
                      
                      if (!inStock) {
                        return <Badge variant="danger">Out of Stock</Badge>;
                      } else if (stockQty < 10) {
                        return <Badge variant="warning">Low Stock ({stockQty})</Badge>;
                      } else {
                        return <Badge variant="success">In Stock</Badge>;
                      }
                    })()}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="p-1 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
                        title="View on site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      
                      {canEdit ? (
                        <Link
                          href={`/admin/parts/${product.id}/edit`}
                          className="p-1 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to edit products.\n\nMissing permission: products.edit')}
                          className="p-1 text-gray-600 cursor-not-allowed opacity-50"
                          title="No permission to edit"
                          disabled
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      )}
                      
                      {canDelete ? (
                        <button
                          onClick={() => handleDeleteClick({ id: product.id, name: product.name })}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to delete products.\n\nMissing permission: products.delete')}
                          className="p-1 text-gray-600 cursor-not-allowed opacity-50"
                          title="No permission to delete"
                          disabled
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          productName={productToDelete.name}
        />
      )}
    </>
  );
}
