/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { PageSection, CarouselSectionConfig } from "@/types/page-section";
import Modal from "@/components/ui/Modal";
import { Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import type { MediaFile } from "@/types/media";
import TypographyControls from "@/components/admin/shared/TypographyControls";

interface CarouselSectionEditorProps {
  section: PageSection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSection: PageSection) => void;
}

export default function CarouselSectionEditor({
  section,
  isOpen,
  onClose,
  onSave,
}: CarouselSectionEditorProps) {
  const [saving, setSaving] = useState(false);
  const [sectionName, setSectionName] = useState(section.name || "");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number | null>(
    null,
  );

  // Migrate old config structure to new structure
  const migrateConfig = (oldConfig: any): CarouselSectionConfig => {
    return {
      heading: oldConfig.heading || "",
      description: oldConfig.description || "",
      speed: oldConfig.speed || 0.5,
      itemsPerView: oldConfig.itemsPerView || {
        mobile: 2,
        tablet: 3,
        desktop: 5,
      },
      logos: (oldConfig.logos || []).map((logo: any, index: number) => ({
        id: logo.id,
        description: logo.description,
        altText: logo.altText || logo.description,
        image: logo.image,
        isActive: logo.isActive !== undefined ? logo.isActive : true,
        order: logo.order !== undefined ? logo.order : index,
      })),
    };
  };

  const [config, setConfig] = useState<CarouselSectionConfig>(
    migrateConfig(section.config),
  );

  useEffect(() => {
    setConfig(migrateConfig(section.config));
    setSectionName(section.name || "");
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Ensure all logos have required fields
      const cleanedConfig = {
        ...config,
        speed: config.speed || 0.5,
        itemsPerView: config.itemsPerView || {
          mobile: 2,
          tablet: 3,
          desktop: 5,
        },
        logos: config.logos.map((logo, index) => ({
          id: logo.id,
          description: logo.description,
          altText: logo.altText || logo.description,
          image: logo.image,
          isActive: logo.isActive !== undefined ? logo.isActive : true,
          order: logo.order !== undefined ? logo.order : index,
        })),
      };

      const response = await fetch(`/api/admin/page-sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: cleanedConfig,
          name: sectionName.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || "Failed to update section");
      }

      const data = await response.json();
      if (data.success) {
        onSave(data.data);
        onClose();
      }
    } catch (error) {
      console.error("Error updating section:", error);
      alert(
        `Failed to update section: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const addLogo = () => {
    const newId = `logo-${Date.now()}`;
    const newOrder = config.logos.length;
    setConfig({
      ...config,
      logos: [
        ...config.logos,
        {
          id: newId,
          description: "Partner Brand",
          altText: "Partner Brand Logo",
          image: "",
          isActive: true,
          order: newOrder,
        },
      ],
    });
  };

  const removeLogo = (index: number) => {
    setConfig({
      ...config,
      logos: config.logos.filter((_, i) => i !== index),
    });
  };

  const updateLogo = (
    index: number,
    field: "description" | "altText" | "image" | "isActive",
    value: string | boolean,
  ) => {
    const updated = [...config.logos];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, logos: updated });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const logos = [...config.logos];
    const draggedLogo = logos[draggedIndex];
    logos.splice(draggedIndex, 1);
    logos.splice(index, 0, draggedLogo);

    // Update order values
    logos.forEach((logo, idx) => {
      logo.order = idx;
    });

    setConfig({ ...config, logos });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const openMediaPicker = (index: number) => {
    setSelectedLogoIndex(index);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (file: MediaFile) => {
    if (selectedLogoIndex !== null) {
      // Store MinIO key instead of full URL for better portability
      updateLogo(selectedLogoIndex, "image", file.key);
    }
    setMediaPickerOpen(false);
    setSelectedLogoIndex(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Brand Carousel Section"
      size="xl"
    >
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
              placeholder="e.g., Partner Brands, Our Clients"
              maxLength={100}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use default name: &quot;Brand Carousel&quot;
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Section Header</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Heading
            </label>
            <input
              type="text"
              value={config.heading}
              onChange={(e) =>
                setConfig({ ...config, heading: e.target.value })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
              required
            />
            <div className="mt-2">
              <TypographyControls
                label="Heading Typography"
                value={config.headingStyle}
                onChange={(headingStyle) =>
                  setConfig({ ...config, headingStyle })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={config.description || ""}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon resize-none"
            />
            <div className="mt-2">
              <TypographyControls
                label="Description Typography"
                value={config.descriptionStyle}
                onChange={(descriptionStyle) =>
                  setConfig({ ...config, descriptionStyle })
                }
              />
            </div>
          </div>
        </div>

        {/* Carousel Settings */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">
            Carousel Settings
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scroll Speed: {config.speed || 0.5}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={config.speed || 0.5}
              onChange={(e) =>
                setConfig({ ...config, speed: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow (0.5x)</span>
              <span>Fast (3.0x)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mobile (Items)
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={config.itemsPerView?.mobile || 2}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    itemsPerView: {
                      ...config.itemsPerView,
                      mobile: parseInt(e.target.value) || 2,
                      tablet: config.itemsPerView?.tablet || 3,
                      desktop: config.itemsPerView?.desktop || 5,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tablet (Items)
              </label>
              <input
                type="number"
                min="2"
                max="6"
                value={config.itemsPerView?.tablet || 3}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    itemsPerView: {
                      mobile: config.itemsPerView?.mobile || 2,
                      tablet: parseInt(e.target.value) || 3,
                      desktop: config.itemsPerView?.desktop || 5,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Desktop (Items)
              </label>
              <input
                type="number"
                min="3"
                max="8"
                value={config.itemsPerView?.desktop || 5}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    itemsPerView: {
                      mobile: config.itemsPerView?.mobile || 2,
                      tablet: config.itemsPerView?.tablet || 3,
                      desktop: parseInt(e.target.value) || 5,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
              />
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Partner Logos</h3>
            <button
              type="button"
              onClick={addLogo}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus size={16} />
              Add Logo
            </button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              💡 <strong>Tip:</strong> You can use image URLs from Unsplash or
              upload images to Media Library first, then paste the URL here.
            </p>
          </div>

          {config.logos.map((logo, index) => (
            <div
              key={logo.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-4 bg-[#0a0a0a] rounded-lg border space-y-3 cursor-move transition-all ${
                draggedIndex === index
                  ? "border-brand-maroon bg-[#1a1a1a]"
                  : logo.isActive
                    ? "border-[#2a2a2a]"
                    : "border-gray-700 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg cursor-grab">⋮⋮</span>
                  <span className="text-sm font-medium text-gray-400">
                    Logo {index + 1}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      logo.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {logo.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logo.isActive}
                      onChange={(e) =>
                        updateLogo(index, "isActive", e.target.checked)
                      }
                      className="w-4 h-4 bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-2 focus:ring-brand-maroon"
                    />
                    <span className="text-xs text-gray-400">Show</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLogo(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={logo.description}
                    onChange={(e) =>
                      updateLogo(index, "description", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
                    placeholder="Partner Brand"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Alt Text (SEO)
                  </label>
                  <input
                    type="text"
                    value={logo.altText || ""}
                    onChange={(e) =>
                      updateLogo(index, "altText", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
                    placeholder="Partner Brand Logo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logo Image
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openMediaPicker(index)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
                  >
                    <ImageIcon size={16} />
                    Select from Media Library
                  </button>
                  <input
                    type="text"
                    value={logo.image}
                    onChange={(e) => updateLogo(index, "image", e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
                    placeholder="products/image.jpg or external URL"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use Media Library for MinIO files (recommended) or paste
                  external URLs
                </p>
              </div>

              {/* Image Preview */}
              {logo.image && (
                <div className="mt-2">
                  <img
                    src={logo.image}
                    alt={logo.description}
                    className="h-20 w-auto object-contain bg-white/5 rounded p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-brand-maroon hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false);
          setSelectedLogoIndex(null);
        }}
        onSelect={handleMediaSelect}
        title="Select Partner Logo from Media Library"
        folder="all"
      />
    </Modal>
  );
}
