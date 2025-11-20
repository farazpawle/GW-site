'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema } from '@/lib/validations/menu';
import { X, Loader2, Save } from 'lucide-react';
import type { z } from 'zod';

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItem {
  id: string;
  label: string;
  position: number;
  visible: boolean;
  openNewTab: boolean;
  parentId: string | null;
  pageId: string | null;
  externalUrl: string | null;
  page?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  children: MenuItem[];
}

interface MenuItemModalProps {
  item: MenuItem | null;
  allItems: MenuItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function MenuItemModal({ item, allItems, onClose, onSuccess }: MenuItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pages, setPages] = useState<any[]>([]);
  const [linkType, setLinkType] = useState<'page' | 'external'>(item?.pageId ? 'page' : 'external');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item ? {
      label: item.label,
      position: item.position,
      visible: item.visible,
      openNewTab: item.openNewTab,
      parentId: item.parentId || undefined,
      pageId: item.pageId || undefined,
      externalUrl: item.externalUrl || undefined,
    } : {
      label: '',
      position: 0,
      visible: true,
      openNewTab: false,
      pageId: undefined,
      externalUrl: undefined,
    },
  });

  useEffect(() => {
    // Fetch pages for dropdown
    fetch('/api/admin/pages')
      .then(r => r.json())
      .then(data => setPages(data.pages || []))
      .catch(() => alert('Failed to load pages'));
  }, []);

  // Clear pageId or externalUrl based on link type
  useEffect(() => {
    if (linkType === 'page') {
      setValue('externalUrl', undefined);
    } else {
      setValue('pageId', undefined);
    }
  }, [linkType, setValue]);

  const onSubmit = async (data: MenuItemFormValues) => {
    try {
      setIsSubmitting(true);
      const url = item ? `/api/admin/menu-items/${item.id}` : '/api/admin/menu-items';
      const method = item ? 'PUT' : 'POST';

      // Ensure XOR: only one of pageId or externalUrl
      const payload: {
        label: string;
        position: number;
        visible: boolean;
        openNewTab: boolean;
        parentId: string | null;
        pageId?: string | null;
        externalUrl?: string | null;
      } = {
        label: data.label,
        position: data.position,
        visible: data.visible,
        openNewTab: data.openNewTab,
        parentId: data.parentId || null,
      };

      if (linkType === 'page' && data.pageId) {
        payload.pageId = data.pageId;
        payload.externalUrl = null; // Explicitly set to null
      } else if (linkType === 'external' && data.externalUrl) {
        payload.externalUrl = data.externalUrl;
        payload.pageId = null; // Explicitly set to null
      } else {
        // If neither is provided, show error instead of sending invalid data
        alert('Please select a page or enter an external URL');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('=== MENU ITEM SAVE FAILED ===');
        console.error('Status:', response.status);
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        console.error('Payload Sent:', JSON.stringify(payload, null, 2));
        console.error('Link Type:', linkType);
        console.error('PageId value:', payload.pageId);
        console.error('PageId type:', typeof payload.pageId);
        console.error('ExternalUrl value:', payload.externalUrl);
        console.error('ExternalUrl type:', typeof payload.externalUrl);
        
        // Show detailed error message
        const errorMessage = error.details 
          ? `Validation failed: ${error.details.map((d: { message: string }) => d.message).join(', ')}`
          : error.error || 'Failed to save menu item';
        
        throw new Error(errorMessage);
      }

      onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save menu item';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flatten items for parent selector (exclude current item and its descendants)
  interface FlatMenuItem extends MenuItem {
    level: number;
  }
  
  const flattenItems = (items: MenuItem[], parentId: string | null = null, level: number = 0): FlatMenuItem[] => {
    return items.reduce((acc: FlatMenuItem[], menuItem) => {
      if (menuItem.parentId === parentId && menuItem.id !== item?.id) {
        acc.push({ ...menuItem, level });
        acc.push(...flattenItems(items, menuItem.id, level + 1));
      }
      return acc;
    }, []);
  };

  const availableParents = flattenItems(allItems);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">
              {item ? 'Edit Menu Item' : 'Create New Menu Item'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {item ? 'Update menu item details' : 'Add a new item to your navigation menu'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isSubmitting}
            title="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Label */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Menu Label <span className="text-red-400">*</span>
            </label>
            <input
              {...register('label')}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Products, About Us, Contact"
            />
            {errors.label && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.label.message}</p>}
            <p className="text-xs text-gray-500 mt-2">This is the text that will appear in your menu</p>
          </div>

          {/* Parent */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Parent Menu Item (Optional)
            </label>
            <select {...register('parentId')} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">🏠 None (Top Level Menu Item)</option>
              {availableParents.map(parent => (
                <option key={parent.id} value={parent.id}>
                  {'  '.repeat(parent.level)}└─ {parent.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select a parent to create a dropdown sub-menu under an existing item
            </p>
          </div>

          {/* Link Type Toggle */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Link Destination
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLinkType('page')}
                className={`
                  px-4 py-3 rounded-lg border-2 font-medium transition-all
                  ${linkType === 'page' 
                    ? 'border-blue-500 bg-blue-900/40 text-blue-300' 
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }
                `}
              >
                📄 Link to Page
              </button>
              <button
                type="button"
                onClick={() => setLinkType('external')}
                className={`
                  px-4 py-3 rounded-lg border-2 font-medium transition-all
                  ${linkType === 'external' 
                    ? 'border-purple-500 bg-purple-900/40 text-purple-300' 
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }
                `}
              >
                🔗 External URL
              </button>
            </div>
          </div>

          {/* Page Selector */}
          {linkType === 'page' && (
            <div className="bg-blue-900/20 p-4 rounded-lg border-2 border-blue-800">
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                📄 Select a Page from Your Website
              </label>
              <select {...register('pageId')} className="w-full px-4 py-3 bg-gray-900 border border-blue-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">-- Choose a page --</option>
                {pages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.title} → /{page.slug}
                  </option>
                ))}
              </select>
              {errors.pageId && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.pageId.message}</p>}
              <p className="text-xs text-blue-400 mt-2">
                Links to pages you&apos;ve created in the Pages section
              </p>
            </div>
          )}

          {/* External URL */}
          {linkType === 'external' && (
            <div className="bg-purple-900/20 p-4 rounded-lg border-2 border-purple-800">
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                🔗 External Website URL
              </label>
              <input
                {...register('externalUrl')}
                className="w-full px-4 py-3 bg-gray-900 border border-purple-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com or https://shop.example.com/products"
              />
              {errors.externalUrl && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.externalUrl.message}</p>}
              <p className="text-xs text-purple-400 mt-2">
                Link to external websites (must start with https://)
              </p>
            </div>
          )}

          {/* Position */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Display Order
            </label>
            <input
              type="number"
              {...register('position', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-2">
              📊 Items with lower numbers appear first (0 = first position)
            </p>
            {errors.position && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.position.message}</p>}
          </div>

          {/* Checkboxes */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('visible')}
                className="w-5 h-5 mt-0.5 text-blue-600 border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-gray-900"
              />
              <div>
                <span className="text-sm font-semibold text-gray-200 group-hover:text-gray-100">
                  👁️ Visible in Navigation Menu
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Uncheck to hide this menu item from the public navigation
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('openNewTab')}
                className="w-5 h-5 mt-0.5 text-blue-600 border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-gray-900"
              />
              <div>
                <span className="text-sm font-semibold text-gray-200 group-hover:text-gray-100">
                  ↗️ Open Link in New Browser Tab
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended for external links to keep your site open
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {item ? 'Update Menu Item' : 'Create Menu Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
