/**
 * General Settings Tab Component
 * 
 * Manages site-wide general settings:
 * - site_name: Website/brand name
 * - site_tagline: Short tagline/slogan
 * - logo_url: Path to logo image
 * - timezone: Site timezone for dates
 * - currency: Default currency code
 */

import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import MediaPickerModal from '@/components/admin/media/MediaPickerModal';

interface GeneralSettingsProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

// Common timezones organized by region
const TIMEZONES = [
  { value: 'Asia/Dubai', label: 'Dubai (Asia/Dubai) - GMT+4' },
  { value: 'Asia/Riyadh', label: 'Riyadh (Asia/Riyadh) - GMT+3' },
  { value: 'Asia/Kuwait', label: 'Kuwait (Asia/Kuwait) - GMT+3' },
  { value: 'Asia/Qatar', label: 'Qatar (Asia/Qatar) - GMT+3' },
  { value: 'Europe/London', label: 'London (Europe/London) - GMT' },
  { value: 'Europe/Paris', label: 'Paris (Europe/Paris) - GMT+1' },
  { value: 'America/New_York', label: 'New York (America/New_York) - EST' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (America/Los_Angeles) - PST' },
  { value: 'America/Chicago', label: 'Chicago (America/Chicago) - CST' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Asia/Tokyo) - JST' },
  { value: 'Asia/Shanghai', label: 'Shanghai (Asia/Shanghai) - CST' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia/Sydney) - AEDT' },
];

// Common currencies
const CURRENCIES = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export default function GeneralSettings({ formData, onChange }: GeneralSettingsProps) {
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [logoMediaPickerOpen, setLogoMediaPickerOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [pages, setPages] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [loadingPages, setLoadingPages] = useState(true);

  // Fetch available pages for Privacy Policy and Terms selection
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/admin/pages?limit=100');
        if (response.ok) {
          const data = await response.json();
          setPages(data.pages || []);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setLoadingPages(false);
      }
    };
    fetchPages();
  }, []);

  // Reset preview error when logo URL changes
  useEffect(() => {
    setLogoPreviewError(false);
  }, [formData.logo_url]);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="pb-4 border-b border-[#2a2a2a]">
        <h3 className="text-2xl font-bold text-white mb-2">General Settings</h3>
        <p className="text-gray-400">
          Configure basic information about your website, branding, and legal pages
        </p>
      </div>

      {/* Branding Section */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#6e0000]/20 flex items-center justify-center">
            <span className="text-2xl">🏢</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Site Branding</h4>
            <p className="text-sm text-gray-500">Your brand identity and logo</p>
          </div>
        </div>

        {/* Site Name */}
        <div>
          <label htmlFor="site_name" className="block text-sm font-medium text-gray-300 mb-2">
            Site Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="site_name"
            value={formData.site_name || ''}
            onChange={(e) => onChange('site_name', e.target.value)}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors"
            placeholder="e.g., Garrit Wulf Auto Parts"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Your website or business name
          </p>
        </div>

        {/* Site Tagline */}
        <div>
          <label htmlFor="site_tagline" className="block text-sm font-medium text-gray-300 mb-2">
            Site Tagline
          </label>
          <input
            type="text"
            id="site_tagline"
            value={formData.site_tagline || ''}
            onChange={(e) => onChange('site_tagline', e.target.value)}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors"
            placeholder="e.g., Premium Automotive Parts & Accessories"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Short tagline or slogan
          </p>
        </div>

        {/* Logo URL */}
        <div>
          <label htmlFor="logo_url" className="block text-sm font-medium text-gray-300 mb-2">
            Logo URL
          </label>
          <div className="space-y-3">
            {/* Current Logo Preview */}
            {formData.logo_url && !logoPreviewError && (
              <div className="relative inline-block">
                <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                  <div className="flex items-center justify-center p-4 bg-white rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      className="max-h-20 max-w-full object-contain"
                      onError={() => setLogoPreviewError(true)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('logo_url', '')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                  title="Remove logo"
                >
                  ×
                </button>
              </div>
            )}

            {/* Media Library Picker Button */}
            <button
              type="button"
              onClick={() => setLogoMediaPickerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#6e0000] hover:bg-[#8e0000] text-white rounded-lg transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              {formData.logo_url ? 'Change Logo' : 'Select from Media Library'}
            </button>

            {/* Manual URL Input (Optional) */}
            <input
              type="text"
              id="logo_url"
              value={formData.logo_url || ''}
              onChange={(e) => onChange('logo_url', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors"
              placeholder="/images/logo.png or select from media library"
            />
            <p className="text-xs text-gray-500">
              Select from Media Library or enter a URL manually. This logo appears in the site header.
            </p>

          {/* Preview Error */}
          {formData.logo_url && logoPreviewError && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">Unable to load image</p>
                <p className="text-xs text-red-300/80 mt-1">
                  Please check the URL is correct and the image is accessible
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Regional Settings Section */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#6e0000]/20 flex items-center justify-center">
            <span className="text-2xl">🌍</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Regional Settings</h4>
            <p className="text-sm text-gray-500">Timezone and currency preferences</p>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-2">
            Timezone
          </label>
          <select
            id="timezone"
            value={formData.timezone || 'Asia/Dubai'}
            onChange={(e) => onChange('timezone', e.target.value)}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors appearance-none cursor-pointer"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">
            Default timezone for displaying dates and times
          </p>
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-2">
            Currency
          </label>
          <select
            id="currency"
            value={formData.currency || 'AED'}
            onChange={(e) => onChange('currency', e.target.value)}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors appearance-none cursor-pointer"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name} ({curr.symbol})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">
            Default currency for pricing display
          </p>
        </div>
      </div>

      {/* Footer Branding Section */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#6e0000]/20 flex items-center justify-center">
            <span className="text-2xl">🖼️</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Footer Branding</h4>
            <p className="text-sm text-gray-500">Logo displayed in website footer</p>
          </div>
        </div>

        {/* Footer Logo */}
      <div>
        <label htmlFor="egh_logo" className="block text-sm font-medium text-gray-300 mb-3">
          Footer Logo (EGH Member Badge)
        </label>
        <div className="space-y-4">
          {/* Current Image Preview */}
          {formData.egh_logo && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Current Image:</p>
              <div className="relative inline-block">
                <img
                  src={formData.egh_logo}
                  alt="Footer Logo Preview"
                  className="h-20 object-contain bg-gray-900 p-3 rounded-lg border border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => onChange('egh_logo', '')}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all hover:scale-110"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Media Library Picker Button */}
          <button
            type="button"
            onClick={() => setMediaPickerOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-maroon hover:bg-brand-maroon/90 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ImageIcon className="w-5 h-5" />
            {formData.egh_logo ? 'Change Image from Gallery' : 'Select Image from Gallery'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a2a]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0a] px-2 text-gray-500">Or enter URL manually</span>
            </div>
          </div>

          {/* Manual URL Input (Optional) */}
          <input
            type="url"
            id="egh_logo"
            value={formData.egh_logo || ''}
            onChange={(e) => onChange('egh_logo', e.target.value)}
            placeholder="https://example.com/image.png"
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors text-sm"
          />
          <p className="text-xs text-gray-400 flex items-start gap-2">
            <span className="text-blue-400">💡</span>
            <span>This logo will be displayed in the website footer. Recommended size: 200x50px</span>
          </p>
        </div>
      </div>
      </div>

      {/* Legal Pages Section */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#6e0000]/20 flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Legal Pages</h4>
            <p className="text-sm text-gray-500">Configure Privacy Policy and Terms links</p>
          </div>
        </div>

        {/* Privacy Policy Page Selection */}
        <div>
          <label htmlFor="privacy_policy_page_id" className="block text-sm font-medium text-gray-300 mb-2">
            Privacy Policy Page
          </label>
          <select
            id="privacy_policy_page_id"
            name="privacy_policy_page_id"
            value={formData.privacy_policy_page_id || ''}
            onChange={(e) => onChange('privacy_policy_page_id', e.target.value)}
            disabled={loadingPages}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Select a page (optional)</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title} ({page.slug})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">
            Select which page to link for Privacy Policy in the footer
          </p>
        </div>

        {/* Terms & Conditions Page Selection */}
        <div>
          <label htmlFor="terms_page_id" className="block text-sm font-medium text-gray-300 mb-2">
            Terms & Conditions Page
          </label>
          <select
            id="terms_page_id"
            name="terms_page_id"
            value={formData.terms_page_id || ''}
            onChange={(e) => onChange('terms_page_id', e.target.value)}
            disabled={loadingPages}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Select a page (optional)</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title} ({page.slug})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">
            Select which page to link for Terms & Conditions in the footer
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-xl flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-blue-400 text-sm font-medium">Quick Tip</p>
          <p className="text-blue-300/80 text-sm mt-1">
            Changes to site name and logo will be reflected across the entire website including header, footer, and meta tags.
          </p>
        </div>
      </div>

      {/* Media Picker Modal for Site Logo */}
      <MediaPickerModal
        isOpen={logoMediaPickerOpen}
        onClose={() => setLogoMediaPickerOpen(false)}
        onSelect={(url) => onChange('logo_url', url)}
        currentImage={formData.logo_url}
        title="Select Site Logo"
      />

      {/* Media Picker Modal for Footer Logo */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => onChange('egh_logo', url)}
        currentImage={formData.egh_logo}
        title="Select Footer Logo"
      />
    </div>
  );
}
