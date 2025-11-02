'use client';

import React, { useState, useEffect } from 'react';

interface SEOSettingsProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function SEOSettings({ formData, onChange }: SEOSettingsProps) {
  const [ogImagePreviewError, setOgImagePreviewError] = useState(false);

  // Reset image preview error when URL changes
  useEffect(() => {
    setOgImagePreviewError(false);
  }, [formData.seo_og_image]);

  // Character counts
  const titleLength = (formData.seo_title || '').length;
  const descriptionLength = (formData.seo_description || '').length;
  const MAX_TITLE_LENGTH = 60;
  const MAX_DESCRIPTION_LENGTH = 160;

  return (
    <div className="space-y-6">
      {/* Meta Tags Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Meta Tags</h3>
        <div className="space-y-4">
          {/* SEO Title */}
          <div>
            <label htmlFor="seo_title" className="block text-sm font-medium text-gray-300 mb-2">
              SEO Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="seo_title"
              value={formData.seo_title || ''}
              onChange={(e) => onChange('seo_title', e.target.value)}
              placeholder="Your Site Name - Tagline"
              maxLength={MAX_TITLE_LENGTH}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Appears in search results and browser tabs
              </p>
              <span className={`text-xs font-mono ${
                titleLength > MAX_TITLE_LENGTH 
                  ? 'text-red-400' 
                  : titleLength > MAX_TITLE_LENGTH * 0.9 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
              }`}>
                {titleLength}/{MAX_TITLE_LENGTH}
              </span>
            </div>
          </div>

          {/* SEO Description */}
          <div>
            <label htmlFor="seo_description" className="block text-sm font-medium text-gray-300 mb-2">
              Meta Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="seo_description"
              value={formData.seo_description || ''}
              onChange={(e) => onChange('seo_description', e.target.value)}
              placeholder="Brief description of your website that appears in search results..."
              rows={3}
              maxLength={MAX_DESCRIPTION_LENGTH}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent resize-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Shown in search results below your page title
              </p>
              <span className={`text-xs font-mono ${
                descriptionLength > MAX_DESCRIPTION_LENGTH 
                  ? 'text-red-400' 
                  : descriptionLength > MAX_DESCRIPTION_LENGTH * 0.9 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
              }`}>
                {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>

          {/* SEO Keywords */}
          <div>
            <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-300 mb-2">
              Meta Keywords
            </label>
            <input
              type="text"
              id="seo_keywords"
              value={formData.seo_keywords || ''}
              onChange={(e) => onChange('seo_keywords', e.target.value)}
              placeholder="ecommerce, online store, products, shopping"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Comma-separated keywords (minimal SEO impact, mostly for indexing)
            </p>
          </div>
        </div>
      </div>

      {/* Open Graph Section */}
      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Social Media (Open Graph)</h3>
        <div className="space-y-4">
          {/* OG Image */}
          <div>
            <label htmlFor="seo_og_image" className="block text-sm font-medium text-gray-300 mb-2">
              Open Graph Image
            </label>
            <input
              type="url"
              id="seo_og_image"
              value={formData.seo_og_image || ''}
              onChange={(e) => onChange('seo_og_image', e.target.value)}
              placeholder="https://example.com/og-image.jpg"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Image shown when your site is shared on social media (recommended: 1200x630px)
            </p>

            {/* OG Image Preview */}
            {formData.seo_og_image && !ogImagePreviewError && (
              <div className="mt-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.seo_og_image}
                  alt="OG Image Preview"
                  onError={() => setOgImagePreviewError(true)}
                  className="w-full max-w-md h-auto rounded border border-gray-600"
                />
              </div>
            )}

            {ogImagePreviewError && formData.seo_og_image && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                <p className="text-sm text-red-300">
                  ⚠️ Unable to load image preview. Please check the URL.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Analytics & Tracking</h3>
        <div className="space-y-4">
          {/* Google Analytics ID */}
          <div>
            <label htmlFor="google_analytics_id" className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.84 2.998v17.999a3.003 3.003 0 01-3.003 3.003H4.162a3.003 3.003 0 01-3.003-3.003V2.998a3.003 3.003 0 013.003-3.003h15.675a3.003 3.003 0 013.003 3.003zm-3.003-1.377H4.162c-.76 0-1.377.618-1.377 1.377v17.999c0 .76.617 1.377 1.377 1.377h15.675c.76 0 1.377-.617 1.377-1.377V2.998c0-.76-.617-1.377-1.377-1.377z"/>
                <path d="M6.5 19.75a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5zm5.25-7a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5zm5.5-7a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5z"/>
              </svg>
              Google Analytics ID
            </label>
            <input
              type="text"
              id="google_analytics_id"
              value={formData.google_analytics_id || ''}
              onChange={(e) => onChange('google_analytics_id', e.target.value)}
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              Google Analytics 4 format: <span className="font-mono">G-XXXXXXXXXX</span> | Universal Analytics: <span className="font-mono">UA-XXXXXXXX-X</span>
            </p>
          </div>

          {/* Google Tag Manager ID */}
          <div>
            <label htmlFor="google_tag_manager_id" className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm0 2.19l8.664 5.003v9.614L12 21.81l-8.664-5.003V7.193L12 2.19zm0 3.282L5.782 9.354v5.292L12 18.528l6.218-3.882v-5.292L12 5.472z"/>
              </svg>
              Google Tag Manager ID
            </label>
            <input
              type="text"
              id="google_tag_manager_id"
              value={formData.google_tag_manager_id || ''}
              onChange={(e) => onChange('google_tag_manager_id', e.target.value)}
              placeholder="GTM-XXXXXXX"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              Format: <span className="font-mono">GTM-XXXXXXX</span> (found in your GTM container settings)
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <p className="text-sm text-blue-300 mb-2">
            💡 <strong>SEO Best Practices:</strong>
          </p>
          <ul className="text-xs text-blue-300/90 space-y-1 ml-5 list-disc">
            <li>Keep title under 60 characters for optimal display in search results</li>
            <li>Meta description should be 150-160 characters for best appearance</li>
            <li>OG image should be 1200x630px for proper social media display</li>
            <li>Update SEO settings when your site content or focus changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
