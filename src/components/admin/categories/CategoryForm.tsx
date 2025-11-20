"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  categorySchema,
  generateCategorySlug,
  type CategoryFormData,
} from "@/lib/validations/category";
import { Loader2 } from "lucide-react";

/**
 * Helper function to check if a string is a MinIO key (not a full URL)
 */
function isMinIOKey(str: string): boolean {
  return (
    !str.startsWith("http://") &&
    !str.startsWith("https://") &&
    !str.startsWith("data:")
  );
}

/**
 * Helper function to convert key to presigned URL
 */
async function convertKeyToUrl(keyOrUrl: string): Promise<string> {
  if (!isMinIOKey(keyOrUrl)) {
    return keyOrUrl;
  }

  try {
    const response = await fetch(
      `/api/media/url?key=${encodeURIComponent(keyOrUrl)}`,
    );
    const data = await response.json();
    if (data.success && data.url) {
      return data.url;
    }
  } catch (error) {
    console.error("Failed to convert key to URL:", error);
  }

  return keyOrUrl;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CategoryForm({
  initialData,
  onSubmit,
  isLoading = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
    },
  });

  // Watch name field for slug auto-generation
  const nameValue = watch("name");
  const slugValue = watch("slug");

  // State for display URL (converted from key if needed)
  const [displayImageUrl, setDisplayImageUrl] = useState<string>("");
  const imageValue = watch("image");

  // Convert key to presigned URL for display
  useEffect(() => {
    const loadUrl = async () => {
      if (!imageValue) {
        setDisplayImageUrl("");
        return;
      }
      const url = await convertKeyToUrl(imageValue);
      setDisplayImageUrl(url);
    };
    loadUrl();
  }, [imageValue]);

  // Auto-generate slug when name changes (only if editing or slug is empty)
  useEffect(() => {
    if (nameValue && !initialData) {
      const generatedSlug = generateCategorySlug(nameValue);
      setValue("slug", generatedSlug);
    }
  }, [nameValue, setValue, initialData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and WebP images are allowed");
      return;
    }

    if (file.size > maxSize) {
      alert("Image must be less than 5MB");
      return;
    }

    // Upload to server
    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // ✅ Store the key (not URL) in the database
      if (data.success && data.keys && data.keys.length > 0) {
        setValue("image", data.keys[0]);
      } else if (data.success && data.urls && data.urls.length > 0) {
        // Fallback for backward compatibility
        setValue("image", data.urls[0]);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image");
    }
  };

  const removeImage = () => {
    setValue("image", "");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Category Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register("name")}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6e0000] disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g., Brake Systems"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Slug Field (Auto-generated, readonly) */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Slug (URL){" "}
          <span className="text-gray-500 text-xs">(Auto-generated)</span>
        </label>
        <input
          type="text"
          id="slug"
          {...register("slug")}
          disabled={isLoading}
          readOnly
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-gray-400 cursor-not-allowed"
          placeholder="auto-generated-slug"
        />
        {errors.slug && (
          <p className="mt-2 text-sm text-red-400">{errors.slug.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          This will be used in the URL: /categories/{slugValue || "slug"}
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Description <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <textarea
          id="description"
          {...register("description")}
          disabled={isLoading}
          rows={4}
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6e0000] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          placeholder="Brief description of this category..."
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-400">
            {errors.description.message}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-500">Maximum 500 characters</p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category Image{" "}
          <span className="text-gray-500 text-xs">(Optional)</span>
        </label>

        {displayImageUrl ? (
          <div className="relative w-full h-48 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg overflow-hidden">
            <Image
              src={displayImageUrl}
              alt="Category"
              fill
              className="object-cover"
              unoptimized={displayImageUrl.includes("X-Amz-")} // Skip optimization for presigned URLs
            />
            <button
              type="button"
              onClick={removeImage}
              disabled={isLoading}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 z-10"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={isLoading}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-48 bg-[#0a0a0a] border-2 border-dashed border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP (MAX. 5MB)
                </p>
              </div>
            </label>
          </div>
        )}
        {errors.image && (
          <p className="mt-2 text-sm text-red-400">{errors.image.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t border-[#2a2a2a]">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading
            ? "Saving..."
            : initialData
              ? "Update Category"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}
