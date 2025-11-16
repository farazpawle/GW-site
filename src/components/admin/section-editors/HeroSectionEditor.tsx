/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { PageSection, HeroSectionConfig } from "@/types/page-section";
import Modal from "@/components/ui/Modal";
import { Loader2 } from "lucide-react";
import TypographyControls from "@/components/admin/shared/TypographyControls";

interface HeroSectionEditorProps {
  section: PageSection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSection: PageSection) => void;
}

export default function HeroSectionEditor({
  section,
  isOpen,
  onClose,
  onSave,
}: HeroSectionEditorProps) {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<HeroSectionConfig>(
    section.config as HeroSectionConfig,
  );
  const [sectionName, setSectionName] = useState(section.name || "");

  // Reset config when section changes
  useEffect(() => {
    setConfig(section.config as HeroSectionConfig);
    setSectionName(section.name || "");
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const defaultPrimaryCTA = {
        show: true,
        text: "Get a Quote",
        link: "#",
      };

      const defaultSecondaryCTA = {
        show: false,
        text: "Contact Us",
        link: "#",
      };

      const primaryCTA = {
        ...defaultPrimaryCTA,
        ...(config.primaryCTA ?? {}),
        text: config.primaryCTA?.text?.trim() || defaultPrimaryCTA.text,
        link: config.primaryCTA?.link?.trim() || defaultPrimaryCTA.link,
        show: config.primaryCTA?.show ?? defaultPrimaryCTA.show,
      };

      const secondaryCTA = {
        ...defaultSecondaryCTA,
        ...(config.secondaryCTA ?? {}),
        text: config.secondaryCTA?.text?.trim() || defaultSecondaryCTA.text,
        link: config.secondaryCTA?.link?.trim() || defaultSecondaryCTA.link,
        show: config.secondaryCTA?.show ?? defaultSecondaryCTA.show,
      };

      const statsArray = Array.isArray(config.statistics?.stats)
        ? config.statistics.stats
        : [];
      const sanitizedStats = statsArray.map((stat, index) => {
        const parsedValue = Number(stat.value);
        return {
          value: Number.isFinite(parsedValue) ? parsedValue : 0,
          suffix: stat.suffix?.trim() || "+",
          label: stat.label?.trim() || `Metric ${index + 1}`,
        };
      });

      while (sanitizedStats.length < 3) {
        const idx = sanitizedStats.length;
        sanitizedStats.push({
          value: 0,
          suffix: "+",
          label: `Metric ${idx + 1}`,
        });
      }

      const normalizedConfig: HeroSectionConfig = {
        backgroundType: config.backgroundType || "shader",
        badge: {
          ...(config.badge ?? {}),
          text: config.badge?.text?.trim() || "Badge",
        },
        title: {
          line1: config.title?.line1?.trim() || "Leading Manufacturer",
          line2: config.title?.line2?.trim() || "Precision Crafted Solutions",
        },
        description:
          config.description?.trim() ||
          "Discover our full capabilities in precision manufacturing.",
        primaryCTA,
        secondaryCTA,
        statistics: {
          show: config.statistics?.show ?? true,
          stats: sanitizedStats.slice(0, 3),
        },
      };

      const response = await fetch(`/api/admin/page-sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: normalizedConfig,
          name: sectionName.trim() || null,
        }),
      });

      if (!response.ok) {
        let errorData: any = {};
        let errorText = "";

        try {
          errorData = await response.clone().json();
        } catch {
          errorText = await response.text();
        }

        console.error("API Error Response:", {
          status: response.status,
          body: Object.keys(errorData).length ? errorData : errorText,
        });

        const message =
          (errorData && errorData.error) ||
          (typeof errorText === "string" && errorText.trim().length
            ? errorText
            : null) ||
          "Failed to update section";

        throw new Error(message);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Hero Section"
      size="lg"
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
              placeholder="e.g., Welcome Banner, Main Hero"
              maxLength={100}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use default name: &quot;Hero Section&quot;
            </p>
          </div>
        </div>

        {/* Background Type */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Background Style</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Background Animation
            </label>
            <select
              value={config.backgroundType}
              onChange={(e) =>
                setConfig({
                  ...config,
                  backgroundType: e.target
                    .value as HeroSectionConfig["backgroundType"],
                })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            >
              <option value="shader">Plasma Motion Shader (Animated)</option>
              <option value="gradient-mesh">
                Aurora Gradient Mesh (Animated)
              </option>
              <option value="ion-storm">Ion Storm Drift (Animated)</option>
              <option value="ribbon">Cinematic Ribbon Artwork (Static)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {config.backgroundType === "shader"
                ? "GPU-accelerated plasma wave that adds energetic motion with real-time WebGL shaders."
                : config.backgroundType === "gradient-mesh"
                  ? "Animated gradient mesh with soft aurora transitions crafted in pure CSS."
                  : config.backgroundType === "ion-storm"
                    ? "Layered ion beams with orbital halos, animated entirely in CSS with subtle parallax to feel electrified."
                    : "High-resolution cinematic ribbon artwork with subtle overlays for premium presentation."}
            </p>
          </div>
        </div>

        {/* Badge */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Badge</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Badge Text
            </label>
            <input
              type="text"
              value={config.badge.text}
              onChange={(e) =>
                setConfig({
                  ...config,
                  badge: { ...config.badge, text: e.target.value },
                })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              required
            />
          </div>

          <TypographyControls
            label="Badge Typography"
            value={config.badge.textStyle}
            onChange={(textStyle) =>
              setConfig({ ...config, badge: { ...config.badge, textStyle } })
            }
          />
        </div>

        {/* Title */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Main Title</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title Line 1
            </label>
            <input
              type="text"
              value={config.title.line1}
              onChange={(e) =>
                setConfig({
                  ...config,
                  title: { ...config.title, line1: e.target.value },
                })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              required
            />
            <div className="mt-2">
              <TypographyControls
                label="Line 1 Typography"
                value={config.title.line1Style}
                onChange={(line1Style) =>
                  setConfig({
                    ...config,
                    title: { ...config.title, line1Style },
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title Line 2
            </label>
            <input
              type="text"
              value={config.title.line2}
              onChange={(e) =>
                setConfig({
                  ...config,
                  title: { ...config.title, line2: e.target.value },
                })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              required
            />
            <div className="mt-2">
              <TypographyControls
                label="Line 2 Typography"
                value={config.title.line2Style}
                onChange={(line2Style) =>
                  setConfig({
                    ...config,
                    title: { ...config.title, line2Style },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Description</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subtitle/Description
            </label>
            <input
              type="text"
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              required
            />
          </div>

          <TypographyControls
            label="Description Typography"
            value={config.descriptionStyle}
            onChange={(descriptionStyle) =>
              setConfig({ ...config, descriptionStyle })
            }
          />
        </div>

        {/* Primary CTA */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Primary Button</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.primaryCTA.show}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    primaryCTA: {
                      ...config.primaryCTA,
                      show: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-2 focus:ring-brand-maroon"
              />
              <span className="text-sm text-gray-300">Show Button</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={config.primaryCTA.text}
              onChange={(e) =>
                setConfig({
                  ...config,
                  primaryCTA: { ...config.primaryCTA, text: e.target.value },
                })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent disabled:opacity-50"
              disabled={!config.primaryCTA.show}
              required={config.primaryCTA.show}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Button Link
            </label>
            <input
              type="text"
              value={config.primaryCTA.link}
              onChange={(e) =>
                setConfig({
                  ...config,
                  primaryCTA: { ...config.primaryCTA, link: e.target.value },
                })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent disabled:opacity-50"
              placeholder="/products"
              disabled={!config.primaryCTA.show}
              required={config.primaryCTA.show}
            />
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Secondary Button
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.secondaryCTA.show}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    secondaryCTA: {
                      ...config.secondaryCTA,
                      show: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-2 focus:ring-brand-maroon"
              />
              <span className="text-sm text-gray-300">Show Button</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={config.secondaryCTA.text}
              onChange={(e) =>
                setConfig({
                  ...config,
                  secondaryCTA: {
                    ...config.secondaryCTA,
                    text: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent disabled:opacity-50"
              disabled={!config.secondaryCTA.show}
              required={config.secondaryCTA.show}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Button Link
            </label>
            <input
              type="text"
              value={config.secondaryCTA.link}
              onChange={(e) =>
                setConfig({
                  ...config,
                  secondaryCTA: {
                    ...config.secondaryCTA,
                    link: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent disabled:opacity-50"
              placeholder="/about"
              disabled={!config.secondaryCTA.show}
              required={config.secondaryCTA.show}
            />
          </div>
        </div>

        {/* Statistics Boxes */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Statistics Boxes (3 Boxes)
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.statistics.show}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    statistics: {
                      ...config.statistics,
                      show: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-2 focus:ring-brand-maroon"
              />
              <span className="text-sm text-gray-300">Show Statistics</span>
            </label>
          </div>

          {config.statistics.stats.map((stat, index) => (
            <div
              key={index}
              className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] space-y-3"
            >
              <h4 className="text-sm font-medium text-gray-400">
                Box {index + 1}
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...config.statistics.stats];
                      newStats[index] = {
                        ...stat,
                        value: parseInt(e.target.value) || 0,
                      };
                      setConfig({
                        ...config,
                        statistics: { ...config.statistics, stats: newStats },
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:ring-2 focus:ring-brand-maroon focus:border-transparent disabled:opacity-50"
                    disabled={!config.statistics.show}
                    required={config.statistics.show}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={stat.suffix}
                    onChange={(e) => {
                      const newStats = [...config.statistics.stats];
                      newStats[index] = { ...stat, suffix: e.target.value };
                      setConfig({
                        ...config,
                        statistics: { ...config.statistics, stats: newStats },
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:ring-2 focus:ring-brand-maroon focus:border-transparent disabled:opacity-50"
                    placeholder="+, %, etc"
                    disabled={!config.statistics.show}
                    required={config.statistics.show}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...config.statistics.stats];
                      newStats[index] = { ...stat, label: e.target.value };
                      setConfig({
                        ...config,
                        statistics: { ...config.statistics, stats: newStats },
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:ring-2 focus:ring-brand-maroon focus:border-transparent disabled:opacity-50"
                    placeholder="LINE ITEMS"
                    disabled={!config.statistics.show}
                    required={config.statistics.show}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <TypographyControls
                  label="Value Typography"
                  value={stat.valueStyle}
                  onChange={(valueStyle) => {
                    const newStats = [...config.statistics.stats];
                    newStats[index] = { ...stat, valueStyle };
                    setConfig({
                      ...config,
                      statistics: { ...config.statistics, stats: newStats },
                    });
                  }}
                />
                <TypographyControls
                  label="Label Typography"
                  value={stat.labelStyle}
                  onChange={(labelStyle) => {
                    const newStats = [...config.statistics.stats];
                    newStats[index] = { ...stat, labelStyle };
                    setConfig({
                      ...config,
                      statistics: { ...config.statistics, stats: newStats },
                    });
                  }}
                />
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
            className="px-6 py-2 bg-brand-maroon hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </Modal>
  );
}
