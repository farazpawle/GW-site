/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { PageSection, BrandStorySectionConfig } from '@/types/page-section';
import Modal from '@/components/ui/Modal';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import TypographyControls from '@/components/admin/shared/TypographyControls';

interface BrandStorySectionEditorProps {
  section: PageSection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSection: PageSection) => void;
}

export default function BrandStorySectionEditor({ section, isOpen, onClose, onSave }: BrandStorySectionEditorProps) {
  const [saving, setSaving] = useState(false);
  const [sectionName, setSectionName] = useState(section.name || '');
  
  // Migrate old config structure to new structure
  const migrateConfig = (oldConfig: any): BrandStorySectionConfig => {
    // Check if config is already in new format
    if (oldConfig.cta && typeof oldConfig.cta === 'object' && 'show' in oldConfig.cta) {
      return oldConfig as BrandStorySectionConfig;
    }
    
    // Migrate from old format
    return {
      title: oldConfig.title || '',
      subtitle: oldConfig.subtitle || '',
      content: oldConfig.content || [],
      cta: {
        show: true,
        text: oldConfig.ctaText || 'Learn More',
        link: oldConfig.ctaLink || '#'
      },
      features: {
        show: true,
        items: Array.isArray(oldConfig.features) ? oldConfig.features : []
      }
    };
  };

  const [config, setConfig] = useState<BrandStorySectionConfig>(migrateConfig(section.config));

  useEffect(() => {
    setConfig(migrateConfig(section.config));
    setSectionName(section.name || '');
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/page-sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config,
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

  const addParagraph = () => {
    setConfig({ ...config, content: [...config.content, 'New paragraph'] });
  };

  const removeParagraph = (index: number) => {
    setConfig({ ...config, content: config.content.filter((_, i) => i !== index) });
  };

  const updateParagraph = (index: number, value: string) => {
    const updated = [...config.content];
    updated[index] = value;
    setConfig({ ...config, content: updated });
  };

  const updateFeature = (index: number, field: string, value: any) => {
    const updated = [...config.features.items];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, features: { ...config.features, items: updated } });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Brand Story Section" size="xl">
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
              placeholder="e.g., Our Story, Company History"
              maxLength={100}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use default name: &quot;Brand Story&quot;</p>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Header</h3>
          
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon"
              required
            />
            <div className="mt-2">
              <TypographyControls
                label="Subtitle Typography"
                value={config.subtitleStyle}
                onChange={(subtitleStyle) => setConfig({ ...config, subtitleStyle })}
              />
            </div>
          </div>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Content Paragraphs</h3>
            <button
              type="button"
              onClick={addParagraph}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus size={16} />
              Add Paragraph
            </button>
          </div>

          <div className="mb-4">
            <TypographyControls
              label="Content Paragraph Typography (All)"
              value={config.contentStyle}
              onChange={(contentStyle) => setConfig({ ...config, contentStyle })}
            />
          </div>

          {config.content.map((paragraph, index) => (
            <div key={index} className="p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Paragraph {index + 1}</span>
                {config.content.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParagraph(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <textarea
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon resize-none"
                required
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Call to Action Button</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.cta.show}
                onChange={(e) => setConfig({ ...config, cta: { ...config.cta, show: e.target.checked } })}
                className="w-4 h-4 bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-2 focus:ring-brand-maroon"
              />
              <span className="text-sm text-gray-300">Show Button</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Button Text</label>
            <input
              type="text"
              value={config.cta.text}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, text: e.target.value } })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon disabled:opacity-50"
              disabled={!config.cta.show}
              required={config.cta.show}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Button Link</label>
            <input
              type="text"
              value={config.cta.link}
              onChange={(e) => setConfig({ ...config, cta: { ...config.cta, link: e.target.value } })}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon disabled:opacity-50"
              placeholder="/about"
              disabled={!config.cta.show}
              required={config.cta.show}
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Feature Cards (3 Cards)</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.features.show}
                onChange={(e) => setConfig({ ...config, features: { ...config.features, show: e.target.checked } })}
                className="w-4 h-4 bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-2 focus:ring-brand-maroon"
              />
              <span className="text-sm text-gray-300">Show Features</span>
            </label>
          </div>

          {config.features.items.map((feature, index) => (
            <div key={index} className="p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] space-y-3">
              <span className="text-sm font-medium text-gray-400">Feature Card {index + 1}</span>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon
                </label>
                <select
                  value={feature.icon}
                  onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon disabled:opacity-50"
                  disabled={!config.features.show}
                  required={config.features.show}
                >
                  <optgroup label="Achievement & Success">
                    <option value="Award">Award / Trophy</option>
                    <option value="Star">Star</option>
                    <option value="Crown">Crown</option>
                    <option value="CheckCircle">Check Circle</option>
                    <option value="BadgeCheck">Badge Check</option>
                  </optgroup>
                  
                  <optgroup label="Protection & Security">
                    <option value="Shield">Shield</option>
                    <option value="ShieldCheck">Shield Check</option>
                    <option value="ShieldAlert">Shield Alert</option>
                    <option value="Lock">Lock</option>
                  </optgroup>
                  
                  <optgroup label="Energy & Speed">
                    <option value="Zap">Zap / Bolt</option>
                    <option value="Lightning">Lightning</option>
                    <option value="Flame">Flame</option>
                    <option value="Rocket">Rocket</option>
                  </optgroup>
                  
                  <optgroup label="Quality & Precision">
                    <option value="Target">Target</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="Gem">Gem / Diamond</option>
                  </optgroup>
                  
                  <optgroup label="Products & Manufacturing">
                    <option value="Box">Box</option>
                    <option value="Package">Package</option>
                    <option value="Layers">Layers</option>
                  </optgroup>
                  
                  <optgroup label="Tools & Technical">
                    <option value="Wrench">Wrench</option>
                    <option value="Settings">Settings</option>
                    <option value="Cog">Cog / Gear</option>
                  </optgroup>
                  
                  <optgroup label="Performance & Analytics">
                    <option value="TrendingUp">Trending Up</option>
                    <option value="BarChart">Bar Chart</option>
                    <option value="Activity">Activity</option>
                    <option value="Gauge">Gauge / Meter</option>
                  </optgroup>
                  
                  <optgroup label="Time & Efficiency">
                    <option value="Clock">Clock</option>
                    <option value="Timer">Timer</option>
                  </optgroup>
                  
                  <optgroup label="People & Service">
                    <option value="Users">Users / Team</option>
                    <option value="UserCheck">User Check</option>
                    <option value="UsersRound">Users Round</option>
                  </optgroup>
                  
                  <optgroup label="Trust & Satisfaction">
                    <option value="Heart">Heart</option>
                    <option value="ThumbsUp">Thumbs Up</option>
                    <option value="Smile">Smile</option>
                  </optgroup>
                  
                  <optgroup label="Global & Location">
                    <option value="Globe">Globe</option>
                    <option value="MapPin">Map Pin</option>
                    <option value="Compass">Compass</option>
                  </optgroup>
                  
                  <optgroup label="Verification & Documentation">
                    <option value="FileCheck">File Check</option>
                    <option value="ClipboardCheck">Clipboard Check</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon disabled:opacity-50"
                  disabled={!config.features.show}
                  required={config.features.show}
                />
                <div className="mt-2">
                  <TypographyControls
                    label="Title Typography"
                    value={feature.titleStyle}
                    onChange={(titleStyle) => updateFeature(index, 'titleStyle', titleStyle)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={feature.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-brand-maroon resize-none disabled:opacity-50"
                  disabled={!config.features.show}
                  required={config.features.show}
                />
                <div className="mt-2">
                  <TypographyControls
                    label="Description Typography"
                    value={feature.descriptionStyle}
                    onChange={(descriptionStyle) => updateFeature(index, 'descriptionStyle', descriptionStyle)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-brand-maroon hover:bg-red-700 text-white rounded-lg flex items-center gap-2" disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
