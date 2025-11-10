"use client";

import { useState, useEffect } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

interface FaviconSettingsProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

/**
 * Convert MinIO URL or key to proxy URL for display
 * Extracts the key from presigned URL and uses it with proxy
 */
function getProxyUrl(urlOrKey: string): string {
  if (!urlOrKey) return "";

  // If already a proxy URL, return as is
  if (urlOrKey.includes("/api/admin/media/proxy")) return urlOrKey;

  // If it's a full MinIO URL, extract the key (path between bucket and query params)
  if (urlOrKey.includes("garritwulf-media/")) {
    try {
      // Extract key from URL like: http://localhost:9000/garritwulf-media/icons/file.ico?X-Amz-...
      const match = urlOrKey.match(/garritwulf-media\/([^?]+)/);
      if (match && match[1]) {
        const key = match[1];
        // Use key-based proxy endpoint
        return `/api/admin/media/proxy?key=${encodeURIComponent(key)}`;
      }
    } catch (e) {
      console.error("Failed to extract key from URL:", e);
    }
  }

  // If it's just a key (like "icons/file.ico"), use it directly
  if (!urlOrKey.startsWith("http")) {
    return `/api/admin/media/proxy?key=${encodeURIComponent(urlOrKey)}`;
  }

  // Fallback: use full URL encoding
  return `/api/admin/media/proxy?url=${encodeURIComponent(urlOrKey)}`;
}

/**
 * Favicon Management Component
 * Allows admins to upload and manage favicons
 * Supports: ICO, PNG (16x16, 32x32, 192x192), Apple Touch Icon
 */
export default function FaviconSettings({
  formData,
  onChange,
}: FaviconSettingsProps) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const faviconFields = [
    {
      key: "favicon_ico",
      label: "Favicon (.ico)",
      size: "16x16 or 32x32",
      accept: ".ico",
    },
    {
      key: "favicon_16",
      label: "PNG Icon 16x16",
      size: "16x16",
      accept: "image/png",
    },
    {
      key: "favicon_32",
      label: "PNG Icon 32x32",
      size: "32x32",
      accept: "image/png",
    },
  ];

  useEffect(() => {
    // Load previews from formData with proxy URLs
    const newPreviews: Record<string, string> = {};
    faviconFields.forEach((field) => {
      if (formData[field.key]) {
        // Use proxy URL for display to avoid expired presigned URLs
        const proxyUrl = getProxyUrl(formData[field.key]);
        console.log(`[Favicon Preview] ${field.key}:`, {
          original: formData[field.key],
          proxy: proxyUrl,
        });
        newPreviews[field.key] = proxyUrl;
      }
    });
    setPreviews(newPreviews);
    // faviconFields is constant and formData is the dependency we track
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleFileUpload = async (key: string, file: File) => {
    // Validate file type
    const validTypes = [
      "image/png",
      "image/x-icon",
      "image/vnd.microsoft.icon",
    ];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        [key]: "Invalid file type. Use PNG or ICO format.",
      });
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      setErrors({ ...errors, [key]: "File too large. Maximum size is 500KB." });
      return;
    }

    try {
      // Create FormData for upload
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "icons/"); // Use 'folder' instead of 'category'

      // Upload to media library
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result.error || result.message || "Upload failed";
        throw new Error(errorMsg);
      }

      // Get the first uploaded file (we only upload one at a time)
      const uploadedFile = result.files?.[0];
      if (!uploadedFile) {
        throw new Error("No file URL returned from upload");
      }

      // Store the key (not the presigned URL) so it never expires
      // The key format is: "icons/filename.ico"
      const fileKey = uploadedFile.key || uploadedFile.url;
      onChange(key, fileKey);

      // Update preview with proxy URL for immediate display
      setPreviews({ ...previews, [key]: getProxyUrl(fileKey) });

      // Clear errors
      setErrors({ ...errors, [key]: "" });
    } catch (error) {
      console.error("Favicon upload error:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.";
      setErrors({ ...errors, [key]: errorMsg });
    }
  };

  const handleRemove = (key: string) => {
    onChange(key, "");
    setPreviews({ ...previews, [key]: "" });
    setErrors({ ...errors, [key]: "" });
  };

  return (
    <div className="space-y-6">
      {/* Favicon Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Favicon & App Icons
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Upload favicons and app icons for different platforms and sizes. These
          icons appear in browser tabs, bookmarks, and on mobile home screens.
        </p>

        <div className="space-y-4">
          {faviconFields.map((field) => (
            <div
              key={field.key}
              className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <p className="text-xs text-gray-500">
                    Recommended size: {field.size}
                  </p>
                </div>

                {previews[field.key] && (
                  <button
                    onClick={() => handleRemove(field.key)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Remove"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Preview */}
              {previews[field.key] ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 border border-gray-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previews[field.key]}
                        alt={field.label}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          console.error(
                            "Failed to load favicon preview:",
                            field.key,
                            previews[field.key],
                          );
                          // Show a placeholder on error
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (
                            parent &&
                            !parent.querySelector(".error-placeholder")
                          ) {
                            const errorDiv = document.createElement("div");
                            errorDiv.className =
                              "error-placeholder text-xs text-red-500 text-center";
                            errorDiv.textContent = "✗";
                            parent.appendChild(errorDiv);
                          }
                        }}
                        onLoad={() => {
                          console.log(
                            "Successfully loaded favicon:",
                            field.key,
                          );
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Uploaded</span>
                    </div>
                  </div>
                  <div
                    className="text-xs text-gray-500 truncate max-w-md"
                    title={previews[field.key]}
                  >
                    URL: {previews[field.key].substring(0, 60)}...
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm mb-3">
                  No icon uploaded
                </div>
              )}

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept={field.accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(field.key, file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{previews[field.key] ? "Replace" : "Upload"} Icon</span>
                </button>
              </div>

              {/* Error */}
              {errors[field.key] && (
                <div className="mt-2 flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errors[field.key]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
        <p className="text-sm text-blue-300 mb-2">
          💡 <strong>Favicon Guidelines:</strong>
        </p>
        <ul className="text-xs text-blue-300/90 space-y-1 ml-5 list-disc">
          <li>Use simple, recognizable designs that work at small sizes</li>
          <li>ICO format supports multiple sizes in one file</li>
          <li>PNG format provides better quality for modern browsers</li>
          <li>All icons should have transparent or solid backgrounds</li>
        </ul>
      </div>
    </div>
  );
}
