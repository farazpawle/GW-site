'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, ShoppingCart, Eye, AlertCircle, ExternalLink } from 'lucide-react';

interface Settings {
  ecommerce_enabled: boolean;
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
  contact_info: {
    email: string;
    phone: string;
    whatsapp: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEcommerceState, setPendingEcommerceState] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setErrorMessage('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle e-commerce toggle with confirmation
  const handleEcommerceToggle = (newValue: boolean) => {
    if (newValue !== settings?.ecommerce_enabled) {
      setPendingEcommerceState(newValue);
      setShowConfirmDialog(true);
    }
  };

  const confirmEcommerceToggle = () => {
    if (settings) {
      setSettings({
        ...settings,
        ecommerce_enabled: pendingEcommerceState,
      });
    }
    setShowConfirmDialog(false);
  };

  // Save settings
  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-maroon" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Site Settings</h1>
        <p className="text-gray-400 text-sm lg:text-base">
          Manage your site configuration and display modes
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        {/* E-commerce Mode Section */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 lg:p-6 2xl:col-span-2">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                {settings.ecommerce_enabled ? (
                  <>
                    <ShoppingCart className="w-6 h-6 text-brand-maroon" />
                    E-commerce Mode
                  </>
                ) : (
                  <>
                    <Eye className="w-6 h-6 text-blue-400" />
                    Showcase Mode
                  </>
                )}
              </h2>
              <p className="text-gray-400">
                {settings.ecommerce_enabled
                  ? 'Your site is currently in E-commerce Mode with full pricing and shopping features.'
                  : 'Your site is currently in Showcase Mode displaying products without pricing.'}
              </p>
            </div>

            {/* Enhanced Toggle Switch */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-sm font-medium transition-colors hidden sm:block ${!settings.ecommerce_enabled ? 'text-blue-400' : 'text-gray-500'}`}>
                Showcase
              </span>
              <button
                onClick={() => handleEcommerceToggle(!settings.ecommerce_enabled)}
                className={`
                  relative w-24 h-12 rounded-full transition-all duration-300 ease-in-out
                  focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]
                  ${settings.ecommerce_enabled 
                    ? 'bg-gradient-to-r from-brand-maroon to-red-800 focus:ring-brand-maroon/30 shadow-lg shadow-brand-maroon/20' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 focus:ring-blue-600/30 shadow-lg shadow-blue-600/20'}
                  hover:scale-105 active:scale-95 hover:shadow-xl
                  ${settings.ecommerce_enabled ? 'hover:shadow-brand-maroon/30' : 'hover:shadow-blue-600/30'}
                `}
                aria-label={`Switch to ${settings.ecommerce_enabled ? 'Showcase' : 'E-commerce'} Mode`}
              >
                {/* Toggle Circle */}
                <div
                  className={`
                    absolute top-1.5 w-9 h-9 bg-white rounded-full transition-all duration-300 ease-in-out
                    shadow-lg flex items-center justify-center
                    ${settings.ecommerce_enabled ? 'right-1.5 rotate-0' : 'left-1.5 -rotate-12'}
                  `}
                >
                  {/* Icon inside toggle */}
                  {settings.ecommerce_enabled ? (
                    <ShoppingCart className="w-5 h-5 text-brand-maroon transition-transform duration-300" />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-600 transition-transform duration-300" />
                  )}
                </div>
                
                {/* Animated background effect */}
                <div className={`
                  absolute inset-0 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300
                  bg-white
                `} />
              </button>
              <span className={`text-sm font-medium transition-colors hidden sm:block ${settings.ecommerce_enabled ? 'text-brand-maroon' : 'text-gray-500'}`}>
                E-commerce
              </span>
            </div>
          </div>

          {/* Mode Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Showcase Mode */}
            <div
              className={`p-4 rounded-lg border ${
                !settings.ecommerce_enabled
                  ? 'bg-blue-900/20 border-blue-800'
                  : 'bg-[#0a0a0a] border-[#2a2a2a]'
              }`}
            >
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Showcase Mode
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Display products without pricing</li>
                <li>• Focus on specifications and features</li>
                <li>• Ideal for catalog or portfolio sites</li>
                <li>• No shopping cart or checkout</li>
              </ul>
            </div>

            {/* E-commerce Mode */}
            <div
              className={`p-4 rounded-lg border ${
                settings.ecommerce_enabled
                  ? 'bg-maroon/10 border-brand-maroon'
                  : 'bg-[#0a0a0a] border-[#2a2a2a]'
              }`}
            >
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                E-commerce Mode
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Display products with full pricing</li>
                <li>• Enable shopping cart and checkout</li>
                <li>• Complete e-commerce functionality</li>
                <li>• Stock and inventory management</li>
              </ul>
            </div>
          </div>

          {/* Preview Links */}
          <div className="flex items-center gap-4">
            <a
              href="/products"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-gray-300 hover:text-white hover:border-brand-maroon transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Public Catalog
            </a>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 lg:p-6">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-3 lg:mb-4">Currency Settings</h2>
          <p className="text-sm text-gray-400 mb-4 lg:mb-6">
            Configure currency display for pricing (applies in E-commerce Mode)
          </p>

          <div className="grid grid-cols-1 gap-6">
            {/* Currency Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={settings.currency.code}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    currency: {
                      ...settings.currency,
                      code: e.target.value,
                      symbol: e.target.value === 'AED' ? 'د.إ' : e.target.value === 'USD' ? '$' : '€',
                    },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors"
              >
                <option value="AED">AED - UAE Dirham (د.إ)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
            </div>

            {/* Symbol Position */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Symbol Position
              </label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="symbolPosition"
                    value="before"
                    checked={settings.currency.position === 'before'}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        currency: {
                          ...settings.currency,
                          position: 'before',
                        },
                      })
                    }
                    className="w-4 h-4 text-brand-maroon focus:ring-brand-maroon"
                  />
                  <span className="text-gray-300">
                    Before ({settings.currency.symbol}100)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="symbolPosition"
                    value="after"
                    checked={settings.currency.position === 'after'}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        currency: {
                          ...settings.currency,
                          position: 'after',
                        },
                      })
                    }
                    className="w-4 h-4 text-brand-maroon focus:ring-brand-maroon"
                  />
                  <span className="text-gray-300">
                    After (100{settings.currency.symbol})
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 lg:p-6">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-3 lg:mb-4">Contact Information</h2>
          <p className="text-sm text-gray-400 mb-4 lg:mb-6">
            Displayed in footer and contact pages
          </p>

          <div className="grid grid-cols-1 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.contact_info.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact_info: {
                      ...settings.contact_info,
                      email: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors"
                placeholder="contact@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={settings.contact_info.phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact_info: {
                      ...settings.contact_info,
                      phone: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors"
                placeholder="+971 XX XXX XXXX"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={settings.contact_info.whatsapp}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact_info: {
                      ...settings.contact_info,
                      whatsapp: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-maroon transition-colors"
                placeholder="+971 XX XXX XXXX"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end 2xl:col-span-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-brand-maroon hover:bg-brand-red rounded-xl text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Confirm Mode Change
                </h3>
                <p className="text-gray-400">
                  Are you sure you want to switch to{' '}
                  <span className="font-semibold text-white">
                    {pendingEcommerceState ? 'E-commerce Mode' : 'Showcase Mode'}
                  </span>
                  ? This will change how products are displayed to visitors.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEcommerceToggle}
                className="px-4 py-2 bg-brand-maroon hover:bg-brand-red rounded-lg text-white transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
