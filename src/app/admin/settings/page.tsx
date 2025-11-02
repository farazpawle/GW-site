/**
 * Settings Management UI
 * 
 * Main settings page with tab navigation for 4 categories:
 * - General: Site name, tagline, logo, footer logo, timezone, currency
 * - Contact: Email, phone, address, business hours, social media
 * - SEO: Title, description, keywords, OG image, analytics
 * - Email: SMTP configuration
 * 
 * Features:
 * - Tab-based UI for organized settings management
 * - Real-time data fetching from Settings API
 * - Bulk save functionality with toast notifications
 * - Media Library integration for footer logo selection
 * - Loading and error states
 * - Admin access required
 */

'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import GeneralSettings from '@/components/admin/settings/GeneralSettings';
import ContactSettings from '@/components/admin/settings/ContactSettings';
import SEOSettings from '@/components/admin/settings/SEOSettings';
import EmailSettings from '@/components/admin/settings/EmailSettings';
import ProductCardSettings from '@/components/admin/settings/ProductCardSettings';

type SettingsCategory = 'GENERAL' | 'CONTACT' | 'SEO' | 'EMAIL' | 'PRODUCT_CARD';

interface Tab {
  id: SettingsCategory;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'GENERAL', label: 'General', icon: '⚙️' },
  { id: 'CONTACT', label: 'Contact & Social', icon: '📧' },
  { id: 'SEO', label: 'SEO & Analytics', icon: '🔍' },
  { id: 'EMAIL', label: 'Email Config', icon: '📬' },
  { id: 'PRODUCT_CARD', label: 'Product Display', icon: '🎴' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsCategory>('GENERAL');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/settings');
      
      if (!response.ok) {
        // Check if it's an authorization error
        if (response.status === 403) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Access denied. SUPER_ADMIN role required.');
        }
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();

      if (data.success) {
        setFormData(data.data);
      } else {
        throw new Error(data.error || 'Failed to load settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      console.log('💾 Saving settings. FormData:', formData);
      console.log('💾 Product card settings being saved:', 
        Object.fromEntries(
          Object.entries(formData).filter(([key]) => key.startsWith('product_card_'))
        )
      );

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's an authorization error
        if (response.status === 403) {
          throw new Error(data.message || 'Access denied. SUPER_ADMIN role required.');
        }
        throw new Error(data.error || 'Failed to save settings');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccessMessage(
        activeTab === 'PRODUCT_CARD' 
          ? `Successfully updated ${data.updated} settings! Changes will appear within 5 seconds. Hard refresh (Ctrl+Shift+R) any product pages to see updates immediately.`
          : `Successfully updated ${data.updated} settings!`
      );
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);

      // Reload settings to ensure consistency
      await fetchSettings();
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Get settings for active tab
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getTabSettings = (category: SettingsCategory): Record<string, string> => {
    return Object.fromEntries(
      Object.entries(formData).filter(([key]) => {
        // Filter by category based on key prefix
        const categoryPrefixes: Record<SettingsCategory, string[]> = {
          GENERAL: ['site_', 'logo_', 'timezone', 'currency'],
          CONTACT: ['contact_', 'social_', 'business_', 'egh_logo'],
          SEO: ['seo_', 'google_'],
          EMAIL: ['email_'],
          PRODUCT_CARD: ['product_card_'],
        };

        return categoryPrefixes[category]?.some((prefix) => key.startsWith(prefix)) || false;
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <AdminHeader 
          pageTitle="Settings" 
          description="Manage site configuration and preferences"
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-maroon mx-auto mb-4" />
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header with Save Button */}
      <div className="border-b border-[#2a2a2a] bg-[#0a0a0a] sticky top-0 z-10">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage site configuration and preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-maroon hover:bg-brand-red disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-medium">Success</p>
              <p className="text-green-300/80 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 px-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#6e0000] to-[#8e0000] text-white shadow-lg shadow-[#6e0000]/30'
                      : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a] border border-[#2a2a2a]'
                  }
                `}
              >
                <span className="text-2xl">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className={`text-xs ${activeTab === tab.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {tab.id === 'GENERAL' && 'Site basics & branding'}
                    {tab.id === 'CONTACT' && 'Contact info & links'}
                    {tab.id === 'SEO' && 'Search & metadata'}
                    {tab.id === 'EMAIL' && 'SMTP & email setup'}
                    {tab.id === 'PRODUCT_CARD' && 'Product card settings'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
          {activeTab === 'GENERAL' && (
            <GeneralSettings formData={formData} onChange={handleChange} />
          )}
          {activeTab === 'CONTACT' && (
            <ContactSettings formData={formData} onChange={handleChange} />
          )}
          {activeTab === 'SEO' && (
            <SEOSettings formData={formData} onChange={handleChange} />
          )}
          {activeTab === 'EMAIL' && (
            <EmailSettings formData={formData} onChange={handleChange} />
          )}
          {activeTab === 'PRODUCT_CARD' && (
            <ProductCardSettings formData={formData} onChange={handleChange} />
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> Changes are saved to the database and will take effect immediately.
            Sensitive fields (passwords, API keys) are automatically encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
