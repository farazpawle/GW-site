'use client';

import React from 'react';

interface ContactSettingsProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function ContactSettings({ formData, onChange }: ContactSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Contact Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
        <div className="space-y-4">
          {/* Contact Email */}
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-300 mb-2">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="contact_email"
              value={formData.contact_email || ''}
              onChange={(e) => onChange('contact_email', e.target.value)}
              placeholder="info@example.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Primary email for customer inquiries and support
            </p>
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-300 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              id="contact_phone"
              value={formData.contact_phone || ''}
              onChange={(e) => onChange('contact_phone', e.target.value)}
              placeholder="+971 50 123 4567"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Include country code (e.g., +971 for UAE)
            </p>
          </div>

          {/* Contact Address */}
          <div>
            <label htmlFor="contact_address" className="block text-sm font-medium text-gray-300 mb-2">
              Business Address
            </label>
            <textarea
              id="contact_address"
              value={formData.contact_address || ''}
              onChange={(e) => onChange('contact_address', e.target.value)}
              placeholder="123 Business Street, City, Country"
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              Full business address displayed in contact page and footer
            </p>
          </div>

          {/* Business Hours */}
          <div>
            <label htmlFor="business_hours" className="block text-sm font-medium text-gray-300 mb-2">
              Business Hours
            </label>
            <textarea
              id="business_hours"
              value={formData.business_hours || ''}
              onChange={(e) => onChange('business_hours', e.target.value)}
              placeholder="Mon-Fri: 9:00 AM - 6:00 PM&#10;Sat: 10:00 AM - 4:00 PM&#10;Sun: Closed"
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              Operating hours (one day per line for best formatting)
            </p>
          </div>
        </div>
      </div>

      {/* Social Media Links Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 pt-4 border-t border-gray-700">
          Social Media Links
        </h3>
        <div className="space-y-4">
          {/* Facebook */}
          <div>
            <label htmlFor="social_facebook" className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </label>
            <input
              type="url"
              id="social_facebook"
              value={formData.social_facebook || ''}
              onChange={(e) => onChange('social_facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
          </div>

          {/* Twitter/X */}
          <div>
            <label htmlFor="social_twitter" className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <svg className="w-5 h-5 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter / X
            </label>
            <input
              type="url"
              id="social_twitter"
              value={formData.social_twitter || ''}
              onChange={(e) => onChange('social_twitter', e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="social_instagram" className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
              Instagram
            </label>
            <input
              type="url"
              id="social_instagram"
              value={formData.social_instagram || ''}
              onChange={(e) => onChange('social_instagram', e.target.value)}
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="social_linkedin" className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </label>
            <input
              type="url"
              id="social_linkedin"
              value={formData.social_linkedin || ''}
              onChange={(e) => onChange('social_linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>Tip:</strong> Social media links will be displayed in your site footer and contact page. 
            Leave fields empty to hide specific social media icons.
          </p>
        </div>
      </div>
    </div>
  );
}
