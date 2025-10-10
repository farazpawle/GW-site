'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ImageUploader from './ImageUploader';
import { TagInput } from '@/components/ui/TagInput';
import { Loader2, Plus, X } from 'lucide-react';
import { z } from 'zod';

interface Category {
  id: string;
  name: string;
}

// Create a form-specific schema that makes showcase fields optional for the form UI
// The defaults will be applied on the backend
const productFormSchema = z.object({
  name: z.string().min(3).max(200),
  partNumber: z.string().min(1).max(50).regex(/^[A-Z0-9-]+$/),
  description: z.string().max(5000).optional(),
  shortDesc: z.string().max(200).optional(),
  price: z.number().positive().max(999999.99),
  comparePrice: z.number().positive().max(999999.99).optional().nullable(),
  categoryId: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  inStock: z.boolean(),
  images: z.array(z.string().url()).min(1).max(10),
  specifications: z.record(z.string(), z.any()).optional().nullable(),
  compatibility: z.array(z.string()),
  featured: z.boolean(),
  // Showcase fields (all optional in form)
  published: z.boolean().optional(),
  showcaseOrder: z.number().int().min(1).optional(),
  tags: z.array(z.string()).optional(),
  brand: z.string().max(100).optional().nullable(),
  origin: z.string().max(100).optional().nullable(),
  certifications: z.array(z.string()).optional(),
  warranty: z.string().max(200).optional().nullable(),
  difficulty: z.enum(['Easy', 'Moderate', 'Professional', 'Advanced']).optional().nullable(),
  application: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional().or(z.literal('')).nullable(),
  pdfUrl: z.string().url().optional().or(z.literal('')).nullable(),
});

// Infer form data type from the form-specific schema
type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: string };
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  submitLabel = 'Save Product',
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [specifications, setSpecifications] = useState<Record<string, string>>(
    (initialData?.specifications as Record<string, string>) || {}
  );
  const [compatibility, setCompatibility] = useState<string[]>(
    initialData?.compatibility || []
  );
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newCompatibility, setNewCompatibility] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      partNumber: initialData?.partNumber || '',
      description: initialData?.description || '',
      shortDesc: initialData?.shortDesc || '',
      price: initialData?.price || 0,
      comparePrice: initialData?.comparePrice,
      categoryId: initialData?.categoryId || '',
      stockQuantity: initialData?.stockQuantity || 0,
      inStock: initialData?.inStock !== undefined ? initialData.inStock : true,
      images: initialData?.images || [],
      specifications: initialData?.specifications || {},
      compatibility: initialData?.compatibility || [],
      featured: initialData?.featured !== undefined ? initialData.featured : false,
      // Showcase fields defaults
      published: initialData?.published !== undefined ? initialData.published : false,
      showcaseOrder: initialData?.showcaseOrder || 999,
      tags: initialData?.tags || [],
      brand: initialData?.brand || undefined,
      origin: initialData?.origin || undefined,
      certifications: initialData?.certifications || [],
      warranty: initialData?.warranty || undefined,
      difficulty: initialData?.difficulty || undefined,
      application: initialData?.application || [],
      videoUrl: initialData?.videoUrl || undefined,
      pdfUrl: initialData?.pdfUrl || undefined,
    },
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Add specification
  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      const updated = { ...specifications, [newSpecKey]: newSpecValue };
      setSpecifications(updated);
      setValue('specifications', updated);
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  // Remove specification
  const removeSpecification = (key: string) => {
    const updated = { ...specifications };
    delete updated[key];
    setSpecifications(updated);
    setValue('specifications', updated);
  };

  // Add compatibility
  const addCompatibility = () => {
    if (newCompatibility && !compatibility.includes(newCompatibility)) {
      const updated = [...compatibility, newCompatibility];
      setCompatibility(updated);
      setValue('compatibility', updated);
      setNewCompatibility('');
    }
  };

  // Remove compatibility
  const removeCompatibility = (index: number) => {
    const updated = compatibility.filter((_, i) => i !== index);
    setCompatibility(updated);
    setValue('compatibility', updated);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information Section */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors"
              placeholder="e.g., Front Brake Pad Set"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Part Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Part Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('partNumber')}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors uppercase"
              placeholder="e.g., BP-001"
            />
            {errors.partNumber && (
              <p className="mt-1 text-sm text-red-400">{errors.partNumber.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors"
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-400">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Short Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Short Description
            </label>
            <input
              type="text"
              {...register('shortDesc')}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors"
              placeholder="Brief description for product listings"
              maxLength={200}
            />
            {errors.shortDesc && (
              <p className="mt-1 text-sm text-red-400">{errors.shortDesc.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Description
            </label>
            <textarea
              {...register('description')}
              rows={5}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors resize-none"
              placeholder="Detailed product description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Showcase Metadata Section */}
      <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Showcase Metadata</h2>
        <p className="text-sm text-gray-400 mb-6">
          Additional fields for product showcase and public display
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Published Checkbox */}
          <div className="flex items-center md:col-span-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('published')}
                className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] 
                         checked:bg-brand-maroon focus:ring-brand-maroon"
              />
              <div>
                <span className="text-white font-medium">Published</span>
                <p className="text-xs text-gray-400">Make this product visible on the public showcase</p>
              </div>
            </label>
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  label="Tags"
                  placeholder="Add tags..."
                  suggestions={['Premium', 'Heavy Duty', 'Best Seller', 'New Arrival', 'Top Rated']}
                />
              )}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-400">{errors.tags.message}</p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brand
            </label>
            <input
              type="text"
              {...register('brand')}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors"
              placeholder="e.g., Bosch, Brembo"
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-400">{errors.brand.message}</p>
            )}
          </div>

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Origin Country
            </label>
            <select
              {...register('origin')}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors"
            >
              <option value="">Select origin</option>
              
              {/* European Countries */}
              <optgroup label="European Countries">
                <option value="Germany">Germany</option>
                <option value="Italy">Italy</option>
                <option value="France">France</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Spain">Spain</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Belgium">Belgium</option>
                <option value="Sweden">Sweden</option>
                <option value="Poland">Poland</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Austria">Austria</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Portugal">Portugal</option>
                <option value="Romania">Romania</option>
                <option value="Hungary">Hungary</option>
              </optgroup>
              
              {/* Asian Countries */}
              <optgroup label="Asian Countries">
                <option value="Japan">Japan</option>
                <option value="China">China</option>
                <option value="South Korea">South Korea</option>
                <option value="India">India</option>
                <option value="Thailand">Thailand</option>
                <option value="Taiwan">Taiwan</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Singapore">Singapore</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Vietnam">Vietnam</option>
                <option value="UAE">UAE</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Turkey">Turkey</option>
              </optgroup>
              
              {/* Other Regions */}
              <optgroup label="Other Regions">
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
                <option value="Brazil">Brazil</option>
                <option value="Australia">Australia</option>
                <option value="South Africa">South Africa</option>
              </optgroup>
              
              <option value="Other">Other</option>
            </select>
            {errors.origin && (
              <p className="mt-1 text-sm text-red-400">{errors.origin.message}</p>
            )}
          </div>

          {/* Certifications */}
          <div className="md:col-span-2">
            <Controller
              name="certifications"
              control={control}
              render={({ field }) => (
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  label="Certifications"
                  placeholder="Add certification..."
                  suggestions={['ISO 9001', 'OEM Certified', 'CE Certified', 'SAE Approved']}
                />
              )}
            />
            {errors.certifications && (
              <p className="mt-1 text-sm text-red-400">{errors.certifications.message}</p>
            )}
          </div>

          {/* Showcase Order */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Showcase Order
            </label>
            <input
              type="number"
              {...register('showcaseOrder', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors"
              placeholder="999"
              min="1"
            />
            <p className="mt-1 text-xs text-gray-400">
              Lower numbers appear first in showcase listings. Default is 999.
            </p>
            {errors.showcaseOrder && (
              <p className="mt-1 text-sm text-red-400">{errors.showcaseOrder.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Pricing & Inventory</h2>
            <p className="text-sm text-gray-400 mt-1">
              Note: These fields are always visible in admin but conditionally displayed publicly based on E-commerce Mode setting
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full pl-8 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                         text-white focus:outline-none focus:border-brand-maroon transition-colors"
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
            )}
          </div>

          {/* Compare Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Compare Price
              <span className="text-xs text-gray-500 ml-2">(Optional - for showing discounts)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                {...register('comparePrice', { valueAsNumber: true })}
                className="w-full pl-8 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                         text-white focus:outline-none focus:border-brand-maroon transition-colors"
                placeholder="0.00"
              />
            </div>
            {errors.comparePrice && (
              <p className="mt-1 text-sm text-red-400">{errors.comparePrice.message}</p>
            )}
          </div>
        </div>

        {/* Inventory Fields */}
        <h3 className="text-lg font-semibold text-white mt-8 mb-4">Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('stockQuantity', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors"
              placeholder="0"
              min="0"
            />
            {errors.stockQuantity && (
              <p className="mt-1 text-sm text-red-400">{errors.stockQuantity.message}</p>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-end">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('inStock')}
                className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] 
                         checked:bg-brand-maroon focus:ring-brand-maroon"
              />
              <span className="text-white font-medium">In Stock</span>
            </label>
          </div>

          {/* Featured Product */}
          <div className="flex items-end">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('featured')}
                className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] 
                         checked:bg-brand-maroon focus:ring-brand-maroon"
              />
              <span className="text-white font-medium">Featured Product</span>
            </label>
          </div>
        </div>
      </div>

      {/* Product Images Section */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          Product Images <span className="text-red-500">*</span>
        </h2>
        
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.images && (
          <p className="mt-2 text-sm text-red-400">{errors.images.message}</p>
        )}
      </div>

      {/* Specifications Section */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Specifications</h2>
        
        {/* Add Specification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={newSpecKey}
            onChange={(e) => setNewSpecKey(e.target.value)}
            placeholder="Property name (e.g., Weight)"
            className="px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                     text-white focus:outline-none focus:border-brand-maroon transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              placeholder="Value (e.g., 2.5kg)"
              className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                       text-white focus:outline-none focus:border-brand-maroon transition-colors"
            />
            <button
              type="button"
              onClick={addSpecification}
              className="px-4 py-3 bg-brand-maroon hover:bg-brand-red rounded-lg 
                       text-white transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        {/* Specifications List */}
        {Object.keys(specifications).length > 0 && (
          <div className="space-y-2">
            {Object.entries(specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg"
              >
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <span className="text-gray-300 font-medium">{key}</span>
                  <span className="text-white">{value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compatibility Section */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Compatible Vehicles</h2>
        
        {/* Add Compatibility */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCompatibility}
            onChange={(e) => setNewCompatibility(e.target.value)}
            placeholder="e.g., Toyota Camry 2015-2020"
            className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                     text-white focus:outline-none focus:border-brand-maroon transition-colors"
          />
          <button
            type="button"
            onClick={addCompatibility}
            className="px-4 py-3 bg-brand-maroon hover:bg-brand-red rounded-lg 
                     text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>

        {/* Compatibility List */}
        {compatibility.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {compatibility.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] rounded-lg"
              >
                <span className="text-white">{item}</span>
                <button
                  type="button"
                  onClick={() => removeCompatibility(index)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-4 bg-brand-maroon hover:bg-brand-red rounded-xl 
                   text-white font-semibold transition-colors disabled:opacity-50 
                   disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
