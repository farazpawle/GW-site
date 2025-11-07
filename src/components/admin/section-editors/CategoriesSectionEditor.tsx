/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { PageSection, CategoriesSectionConfig } from '@/types/page-section';
import Modal from '@/components/ui/Modal';
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import MediaPickerModal from '@/components/admin/media/MediaPickerModal';
import type { MediaFile } from '@/types/media';
import TypographyControls from '@/components/admin/shared/TypographyControls';

interface CategoriesSectionEditorProps {
  section: PageSection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSection: PageSection) => void;
}

export default function CategoriesSectionEditor({ section, isOpen, onClose, onSave }: CategoriesSectionEditorProps) {
  const [saving, setSaving] = useState(false);
  const [sectionName, setSectionName] = useState(section.name || '');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  
  // Migrate old config
  const migrateConfig = (oldConfig: any): CategoriesSectionConfig => {
    return {
      title: oldConfig.title || '',
      description: oldConfig.description || '',
      show: oldConfig.show !== undefined ? oldConfig.show : true,
      accentColor: oldConfig.accentColor || '#6e0000',
      backgroundPattern: oldConfig.backgroundPattern !== undefined ? oldConfig.backgroundPattern : true,
      gridColumns: oldConfig.gridColumns || 3,
      cardStyle: oldConfig.cardStyle || 'boxed',
      iconPosition: oldConfig.iconPosition || 'top',
      categories: (oldConfig.categories || []).map((cat: any, index: number) => ({
        icon: cat.icon || 'Car',
        title: cat.title,
        description: cat.description,
        isActive: cat.isActive !== undefined ? cat.isActive : true,
        order: cat.order !== undefined ? cat.order : index,
        backgroundImage: cat.backgroundImage,
        cta: cat.cta || { show: false, text: 'View Products', link: '#' }
      }))
    };
  };
  
  const [config, setConfig] = useState<CategoriesSectionConfig>(migrateConfig(section.config));

  useEffect(() => {
    setConfig(migrateConfig(section.config));
    setSectionName(section.name || '');
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean config to ensure all fields are present
      const cleanedConfig: CategoriesSectionConfig = {
        title: config.title,
        description: config.description,
        show: config.show !== undefined ? config.show : true,
        accentColor: config.accentColor || '#6e0000',
        backgroundPattern: config.backgroundPattern !== undefined ? config.backgroundPattern : true,
        gridColumns: config.gridColumns || 3,
        cardStyle: config.cardStyle || 'boxed',
        iconPosition: config.iconPosition || 'top',
        categories: config.categories.map((cat, index) => ({
          icon: cat.icon,
          title: cat.title,
          description: cat.description,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          order: cat.order !== undefined ? cat.order : index,
          backgroundImage: cat.backgroundImage,
          cta: cat.cta || { show: false, text: 'View Products', link: '#' }
        }))
      };

      const response = await fetch(`/api/admin/page-sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config: cleanedConfig,
          name: sectionName.trim() || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to update section');
      }

      const data = await response.json();
      if (data.success) {
        onSave(data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating section:', error);
      alert(`Failed to update section: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    const newOrder = config.categories.length;
    setConfig({
      ...config,
      categories: [...config.categories, { 
        icon: 'Car', 
        title: 'New Category', 
        description: 'Description',
        isActive: true,
        order: newOrder,
        backgroundImage: '',
        cta: { show: false, text: 'View Products', link: '#' }
      }]
    });
  };

  const removeCategory = (index: number) => {
    setConfig({
      ...config,
      categories: config.categories.filter((_, i) => i !== index)
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCategories = [...config.categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);

    // Update order values
    const reorderedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      order: idx
    }));

    setConfig({ ...config, categories: reorderedCategories });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Media picker handlers
  const openMediaPicker = (categoryIndex: number) => {
    setSelectedCategoryIndex(categoryIndex);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (file: MediaFile) => {
    if (selectedCategoryIndex !== null) {
      const newCategories = [...config.categories];
      newCategories[selectedCategoryIndex].backgroundImage = file.url;
      setConfig({ ...config, categories: newCategories });
    }
    setMediaPickerOpen(false);
    setSelectedCategoryIndex(null);
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const updated = [...config.categories];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, categories: updated });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Categories Section" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Name */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Section Name</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Name (Optional)
            </label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="e.g., Product Categories, Browse by Type"
              maxLength={100}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use default name: &quot;Categories&quot;</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Section Header</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
              required
            />
            <div className="mt-2">
              <TypographyControls
                label="Title Typography"
                value={config.titleStyle}
                onChange={(titleStyle) => setConfig({ ...config, titleStyle })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
            <input
              type="text"
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
            />
            <div className="mt-2">
              <TypographyControls
                label="Description Typography"
                value={config.descriptionStyle}
                onChange={(descriptionStyle) => setConfig({ ...config, descriptionStyle })}
              />
            </div>
          </div>
        </div>

        {/* Section Display Settings */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Section Display Settings</h3>
          
          {/* Show Section Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show-section"
              checked={config.show !== undefined ? config.show : true}
              onChange={(e) => setConfig({ ...config, show: e.target.checked })}
              className="w-4 h-4 rounded bg-[#1a1a1a] border-[#2a2a2a] text-brand-maroon focus:ring-brand-maroon"
            />
            <label htmlFor="show-section" className="text-sm font-medium text-gray-300">
              Show Section
            </label>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Accent Color <span className="text-gray-500">(Used for icons, dividers, and CTAs)</span>
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={config.accentColor || '#6e0000'}
                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                className="w-16 h-10 rounded border border-[#2a2a2a] bg-[#1a1a1a] cursor-pointer"
              />
              <input
                type="text"
                value={config.accentColor || '#6e0000'}
                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
              />
            </div>
          </div>

          {/* Background Pattern Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="background-pattern"
              checked={config.backgroundPattern !== undefined ? config.backgroundPattern : true}
              onChange={(e) => setConfig({ ...config, backgroundPattern: e.target.checked })}
              className="w-4 h-4 rounded bg-[#1a1a1a] border-[#2a2a2a] text-brand-maroon focus:ring-brand-maroon"
            />
            <label htmlFor="background-pattern" className="text-sm font-medium text-gray-300">
              Show Background Pattern
            </label>
          </div>

          {/* Grid Columns */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Grid Columns (Desktop)</label>
            <select
              value={config.gridColumns || 3}
              onChange={(e) => setConfig({ ...config, gridColumns: parseInt(e.target.value) as 2 | 3 | 4 })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>

          {/* Card Style */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Card Style</label>
            <select
              value={config.cardStyle || 'boxed'}
              onChange={(e) => setConfig({ ...config, cardStyle: e.target.value as 'boxed' | 'minimal' | 'image-heavy' })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
            >
              <option value="boxed">Boxed - Standard card with background</option>
              <option value="minimal">Minimal - Transparent with colored border</option>
              <option value="image-heavy">Image Heavy - Background image with gradient</option>
            </select>
          </div>

          {/* Icon Position */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Icon Position</label>
            <select
              value={config.iconPosition || 'top'}
              onChange={(e) => setConfig({ ...config, iconPosition: e.target.value as 'top' | 'left' | 'right' | 'bottom' })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
            >
              <option value="top">Top</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Categories</h3>
            <button
              type="button"
              onClick={addCategory}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>

          {config.categories.map((category, index) => (
            <div 
              key={index} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] space-y-3 transition-all ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${category.isActive === false ? 'opacity-60' : ''}`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="cursor-move text-gray-500 hover:text-gray-300" title="Drag to reorder">
                    ⋮⋮
                  </span>
                  <span className="text-sm font-medium text-gray-400">Category {index + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    category.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {category.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...config.categories];
                      updated[index] = { ...updated[index], isActive: updated[index].isActive === false ? true : false };
                      setConfig({ ...config, categories: updated });
                    }}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      category.isActive !== false 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {category.isActive !== false ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                <select
                  value={category.icon}
                  onChange={(e) => updateCategory(index, 'icon', e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
                >
                  <optgroup label="🚗 Vehicles">
                    <option value="Car">Car</option>
                    <option value="Truck">Truck</option>
                  </optgroup>
                  <optgroup label="🔧 Tools & Parts">
                    <option value="Wrench">Wrench</option>
                    <option value="Settings">Settings</option>
                    <option value="Cog">Cog</option>
                    <option value="Package">Package</option>
                    <option value="Box">Box</option>
                  </optgroup>
                  <optgroup label="⚡ Performance">
                    <option value="Gauge">Gauge</option>
                    <option value="Zap">Zap</option>
                    <option value="Battery">Battery</option>
                    <option value="Cpu">Cpu</option>
                  </optgroup>
                  <optgroup label="💧 Fluids & Energy">
                    <option value="Fuel">Fuel</option>
                    <option value="Droplet">Droplet</option>
                    <option value="Flame">Flame</option>
                    <option value="Wind">Wind</option>
                  </optgroup>
                  <optgroup label="🛡️ Security">
                    <option value="Shield">Shield</option>
                    <option value="Lock">Lock</option>
                    <option value="Key">Key</option>
                  </optgroup>
                  <optgroup label="📡 Electronics">
                    <option value="Radio">Radio</option>
                    <option value="Wifi">Wifi</option>
                    <option value="Bluetooth">Bluetooth</option>
                    <option value="CircleDot">CircleDot</option>
                    <option value="Disc">Disc</option>
                  </optgroup>
                  <optgroup label="🎵 Audio & Media">
                    <option value="Headphones">Headphones</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Mic">Mic</option>
                    <option value="Camera">Camera</option>
                    <option value="Monitor">Monitor</option>
                  </optgroup>
                  <optgroup label="💾 Storage & Data">
                    <option value="HardDrive">HardDrive</option>
                    <option value="Database">Database</option>
                    <option value="Server">Server</option>
                    <option value="Archive">Archive</option>
                    <option value="Container">Container</option>
                  </optgroup>
                </select>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={category.title}
                    onChange={(e) => updateCategory(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                  <div className="mt-2">
                    <TypographyControls
                      label="Title Typography"
                      value={category.titleStyle}
                      onChange={(titleStyle) => updateCategory(index, 'titleStyle', titleStyle)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={category.description}
                    onChange={(e) => updateCategory(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
                    required
                  />
                  <div className="mt-2">
                    <TypographyControls
                      label="Description Typography"
                      value={category.descriptionStyle}
                      onChange={(descriptionStyle) => updateCategory(index, 'descriptionStyle', descriptionStyle)}
                    />
                  </div>
                </div>
              </div>

              {/* Background Image (for image-heavy style) */}
              {config.cardStyle === 'image-heavy' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Background Image (Optional)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openMediaPicker(index)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <ImageIcon size={16} />
                      Choose Image
                    </button>
                    <input
                      type="text"
                      value={category.backgroundImage || ''}
                      onChange={(e) => {
                        const updated = [...config.categories];
                        updated[index] = { ...updated[index], backgroundImage: e.target.value };
                        setConfig({ ...config, categories: updated });
                      }}
                      placeholder="Or enter image URL"
                      className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
                    />
                  </div>
                  {category.backgroundImage && (
                    <div className="mt-2">
                      <img src={category.backgroundImage} alt="Preview" className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                </div>
              )}

              {/* CTA Button */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`cta-show-${index}`}
                    checked={category.cta?.show !== undefined ? category.cta.show : false}
                    onChange={(e) => {
                      const updated = [...config.categories];
                      updated[index] = { 
                        ...updated[index], 
                        cta: { 
                          show: e.target.checked,
                          text: category.cta?.text || 'View Products',
                          link: category.cta?.link || '#'
                        }
                      };
                      setConfig({ ...config, categories: updated });
                    }}
                    className="w-4 h-4 rounded bg-[#1a1a1a] border-[#2a2a2a] text-brand-maroon focus:ring-brand-maroon"
                  />
                  <label htmlFor={`cta-show-${index}`} className="text-sm font-medium text-gray-300">
                    Show CTA Button
                  </label>
                </div>
                
                {category.cta?.show && (
                  <div className="grid grid-cols-2 gap-3 pl-7">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={category.cta?.text || 'View Products'}
                        onChange={(e) => {
                          const updated = [...config.categories];
                          updated[index] = { 
                            ...updated[index], 
                            cta: { 
                              show: true,
                              text: e.target.value,
                              link: category.cta?.link || '#'
                            }
                          };
                          setConfig({ ...config, categories: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:ring-2 focus:ring-brand-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Link</label>
                      <input
                        type="text"
                        value={category.cta?.link || '#'}
                        onChange={(e) => {
                          const updated = [...config.categories];
                          updated[index] = { 
                            ...updated[index], 
                            cta: { 
                              show: true,
                              text: category.cta?.text || 'View Products',
                              link: e.target.value
                            }
                          };
                          setConfig({ ...config, categories: updated });
                        }}
                        className="w-full px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm focus:ring-2 focus:ring-brand-maroon"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-brand-maroon hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false);
          setSelectedCategoryIndex(null);
        }}
        onSelect={handleMediaSelect}
      />
    </Modal>
  );
}
