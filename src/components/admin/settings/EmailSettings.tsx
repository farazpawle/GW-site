'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface EmailSettingsProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function EmailSettings({ formData, onChange }: EmailSettingsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* SMTP Configuration Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">SMTP Configuration</h3>
        <div className="space-y-4">
          {/* SMTP Host */}
          <div>
            <label htmlFor="email_smtp_host" className="block text-sm font-medium text-gray-300 mb-2">
              SMTP Host <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="email_smtp_host"
              value={formData.email_smtp_host || ''}
              onChange={(e) => onChange('email_smtp_host', e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              SMTP server hostname (e.g., smtp.gmail.com, smtp-mail.outlook.com)
            </p>
          </div>

          {/* SMTP Port */}
          <div>
            <label htmlFor="email_smtp_port" className="block text-sm font-medium text-gray-300 mb-2">
              SMTP Port <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="email_smtp_port"
              value={formData.email_smtp_port || ''}
              onChange={(e) => onChange('email_smtp_port', e.target.value)}
              placeholder="587"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Common ports: 587 (TLS), 465 (SSL), 25 (non-encrypted)
            </p>
          </div>

          {/* SMTP User */}
          <div>
            <label htmlFor="email_smtp_user" className="block text-sm font-medium text-gray-300 mb-2">
              SMTP Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="email_smtp_user"
              value={formData.email_smtp_user || ''}
              onChange={(e) => onChange('email_smtp_user', e.target.value)}
              placeholder="your-email@gmail.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Your email address or SMTP username
            </p>
          </div>

          {/* SMTP Password */}
          <div>
            <label htmlFor="email_smtp_password" className="block text-sm font-medium text-gray-300 mb-2">
              SMTP Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="email_smtp_password"
                value={formData.email_smtp_password || ''}
                onChange={(e) => onChange('email_smtp_password', e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-300">
              🔒 <strong>Encrypted:</strong> This password is automatically encrypted before storage
            </div>
          </div>
        </div>
      </div>

      {/* Sender Information Section */}
      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Sender Information</h3>
        <div className="space-y-4">
          {/* From Address */}
          <div>
            <label htmlFor="email_from_address" className="block text-sm font-medium text-gray-300 mb-2">
              From Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email_from_address"
              value={formData.email_from_address || ''}
              onChange={(e) => onChange('email_from_address', e.target.value)}
              placeholder="noreply@example.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Email address shown as sender in outgoing emails
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
        <p className="text-sm text-blue-300 mb-2">
          📧 <strong>Email Configuration Tips:</strong>
        </p>
        <ul className="text-xs text-blue-300/90 space-y-1 ml-5 list-disc">
          <li>Gmail users: Enable &quot;Less secure app access&quot; or use App Password</li>
          <li>Outlook/Office 365: Use smtp-mail.outlook.com on port 587</li>
          <li>Test your configuration after saving changes</li>
          <li>Sensitive fields are encrypted automatically in the database</li>
        </ul>
      </div>
    </div>
  );
}
