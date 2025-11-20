'use client';

import { useState } from 'react';
import { Edit2, Trash2, GripVertical, ExternalLink, FileText, Lock } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  position: number;
  visible: boolean;
  openNewTab: boolean;
  parentId: string | null;
  pageId: string | null;
  externalUrl: string | null;
  isPermanent: boolean;
  page?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  children: MenuItem[];
}

interface MenuTreeProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onReorder: (items: { id: string; position: number }[]) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function MenuTree({ items, onEdit, onDelete, onReorder, canEdit = true, canDelete = true }: MenuTreeProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (draggedItem !== itemId) {
      setDragOverItem(itemId);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverItem(null);

    if (!draggedItem || draggedItem === targetId) {
      return;
    }

    // Flatten all items to get their positions
    const flattenItems = (items: MenuItem[], parent: string | null = null): MenuItem[] => {
      return items.reduce((acc: MenuItem[], item) => {
        if (item.parentId === parent) {
          acc.push(item);
          acc.push(...flattenItems(items, item.id));
        }
        return acc;
      }, []);
    };

    const allItems = flattenItems(items);
    const draggedIndex = allItems.findIndex(item => item.id === draggedItem);
    const targetIndex = allItems.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...allItems];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    // Update positions
    const updates = newOrder.map((item, index) => ({
      id: item.id,
      position: index,
    }));

    onReorder(updates);
    setDraggedItem(null);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isDragging = draggedItem === item.id;
    const isDragOver = dragOverItem === item.id;

    return (
      <div key={item.id}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item.id)}
          className={`
            group flex items-center gap-4 p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750 transition-all duration-200
            ${isDragging ? 'opacity-40 scale-95' : ''}
            ${isDragOver ? 'border-l-4 border-l-blue-500 bg-blue-900/30' : ''}
            ${!item.visible ? 'opacity-60' : ''}
          `}
          style={{ paddingLeft: `${level * 3 + 1}rem` }}
        >
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing" title="Drag to reorder">
            <GripVertical className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
          </div>

          {/* Level Indicator for nested items */}
          {level > 0 && (
            <div className="flex items-center text-gray-500 text-sm font-mono">
              {'└─ '.repeat(1)}
            </div>
          )}

          {/* Menu Item Label */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-100 truncate">
                {item.label}
              </h4>
              {item.isPermanent && (
                <span 
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-800"
                  title="Protected system menu - Cannot be deleted"
                >
                  🔒 Protected
                </span>
              )}
              {!item.visible && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-700 text-gray-300 rounded">
                  Hidden
                </span>
              )}
              {item.openNewTab && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-900 text-blue-300 rounded">
                  New Tab
                </span>
              )}
            </div>
            
            {/* Link Info */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {item.pageId && item.page ? (
                <>
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-blue-400">Page:</span>
                  <span className="truncate text-gray-300">{item.page.title}</span>
                  <span className="text-gray-500">→ /{item.page.slug}</span>
                </>
              ) : item.externalUrl ? (
                <>
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-purple-400">External:</span>
                  <span className="truncate text-gray-300">{item.externalUrl}</span>
                </>
              ) : (
                <>
                  <span className="text-gray-500 italic">No link configured</span>
                </>
              )}
            </div>
          </div>

          {/* Position Badge */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium">Order:</span>
            <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded font-mono">
              {item.position + 1}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            {canEdit ? (
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-blue-400 hover:bg-blue-900/40 rounded-lg transition-colors"
                title="Edit menu item"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-gray-600 cursor-not-allowed rounded-lg"
                title="No permission to edit"
                disabled
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
            {!item.isPermanent ? (
              canDelete ? (
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-red-400 hover:bg-red-900/40 rounded-lg transition-colors"
                  title="Delete menu item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-gray-600 cursor-not-allowed rounded-lg"
                  title="No permission to delete"
                  disabled
                >
                  <Lock className="w-5 h-5" />
                </button>
              )
            ) : (
              <span
                className="p-2 text-gray-600 cursor-not-allowed"
                title="This is a protected system menu item and cannot be deleted"
              >
                🔒
              </span>
            )}
          </div>
        </div>

        {/* Render Children */}
        {item.children && item.children.length > 0 && (
          <div className="bg-gray-900">
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="divide-y">
      {items.map(item => renderMenuItem(item))}
    </div>
  );
}
