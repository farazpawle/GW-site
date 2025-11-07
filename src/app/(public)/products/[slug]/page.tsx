'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ChevronRight, Home, Shield, Award, Package, Check, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import ProductInquiry from '@/components/public/ProductInquiry';
import CrossReferencesDisplay from '@/components/public/CrossReferencesDisplay';
import OEMNumbersTable from '@/components/public/OEMNumbersTable';
import VehicleCompatibilityTable from '@/components/public/VehicleCompatibilityTable';

interface ProductCardSettings {
  showPartNumber: boolean;
  showSku: boolean;
  showBrand: boolean;
  showOrigin: boolean;
  showCategory: boolean;
  showDescription: boolean;
  showTags: boolean;
  showPrice: boolean;
  showComparePrice: boolean;
  showDiscountBadge: boolean;
  showStockStatus: boolean;
  // Product Detail Page settings
  showCertifications: boolean;
  showWarranty: boolean;
  showApplication: boolean;
  showSpecifications: boolean;
  showCompatibility: boolean;
}

interface CrossReference {
  id: string;
  referenceType: 'alternative' | 'supersedes' | 'compatible';
  brandName: string;
  partNumber: string;
  referencedPartId: string | null;
  notes: string | null;
  referencedPart?: {
    id: string;
    name: string;
    slug: string;
    brand: string | null;
    price?: number | null;
    comparePrice?: number | null;
  } | null;
}

interface OEMPartNumber {
  id: string;
  manufacturer: string;
  oemPartNumber: string;
  notes: string | null;
}

interface VehicleCompatibility {
  id: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engine: string | null;
  trim: string | null;
  position: string | null;
  notes: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  partNumber: string;
  description: string | null;
  image: string;
  images?: string[];
  price?: number;
  comparePrice?: number | null;
  tags: string[];
  brand: string | null;
  origin: string | null;
  certifications: string[];
  warranty: string | null;
  application: string[];
  specifications: Record<string, unknown> | null;
  compatibility: string[];
  views: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  crossReferences?: CrossReference[];
  oemPartNumbers?: OEMPartNumber[];
  vehicleCompatibility?: VehicleCompatibility[];
}

interface ProductResponse {
  success: boolean;
  mode: 'showcase' | 'ecommerce';
  data: Product;
  relatedProducts: Product[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mode, setMode] = useState<'showcase' | 'ecommerce'>('showcase');
  const [settings, setSettings] = useState<ProductCardSettings>({
    showPartNumber: true,
    showSku: true,
    showBrand: true,
    showOrigin: true,
    showCategory: true,
    showDescription: true,
    showTags: true,
    showPrice: true,
    showComparePrice: true,
    showDiscountBadge: true,
    showStockStatus: true,
    // Product Detail Page defaults
    showCertifications: true,
    showWarranty: true,
    showApplication: true,
    showSpecifications: true,
    showCompatibility: true,
  });

  // Fetch product card settings
  useEffect(() => {
    fetch('/api/public/product-card-settings?_=' + Date.now())
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setSettings(result.data);
          
          // Debug: Log settings to check which sections are enabled
          console.log('Product Card Settings:', {
            showCertifications: result.data.showCertifications,
            showWarranty: result.data.showWarranty,
            showApplication: result.data.showApplication,
            showCompatibility: result.data.showCompatibility,
            showSpecifications: result.data.showSpecifications,
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching product card settings:', error);
      });
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/public/showcase/products/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            window.location.href = '/404';
            return;
          }
          throw new Error('Failed to fetch product');
        }

        const data: ProductResponse = await response.json();
        if (data.success) {
          setProduct(data.data);
          setRelatedProducts(data.relatedProducts);
          setMode(data.mode);
          // Set the first image as the selected image
          setSelectedImage(data.data.image || '/images/GW_LOGO-removebg.png');
          
          // Debug: Log product data to check what fields are available
          console.log('Product Data:', {
            certifications: data.data.certifications,
            warranty: data.data.warranty,
            application: data.data.application,
            compatibility: data.data.compatibility,
            crossReferences: data.data.crossReferences,
            oemPartNumbers: data.data.oemPartNumbers,
            vehicleCompatibility: data.data.vehicleCompatibility,
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-coral mx-auto mb-4" />
          <p className="text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-4">Product not found</p>
          <Link href="/products" className="text-brand-coral hover:text-brand-red transition-colors">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.comparePrice && product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  // Default fallback image if no product image
  const defaultImage = '/images/placeholder-product.svg';
  const productImage = product.image || defaultImage;
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : [productImage];

  // Generate JSON-LD structured data
  const generateStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://garritwulf.com';
    const structuredData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || `${product.name} - Quality automotive part`,
      image: product.image,
      brand: product.brand ? {
        '@type': 'Brand',
        name: product.brand,
      } : undefined,
      mpn: product.slug,
      category: product.category?.name,
      countryOfOrigin: product.origin,
    };

    // Add offers section with pricing (showcase with pricing)
    if (product.price) {
      structuredData.offers = {
        '@type': 'Offer',
        url: `${baseUrl}/products/${product.slug}`,
        priceCurrency: 'AED',
        price: product.price.toString(),
        availability: 'https://schema.org/InStock', // Always available for contact
        seller: {
          '@type': 'Organization',
          name: 'Garrit & Wulf',
        },
      };

      // Add aggregateRating if we have reviews (placeholder for future)
      structuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: product.views || '1',
      };
    }

    return structuredData;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStructuredData()) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-brand-coral/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-brand-coral transition-colors flex items-center gap-1.5 group">
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <Link href="/products" className="text-gray-400 hover:text-brand-coral transition-colors font-medium">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <span className="text-gray-400 font-medium">{product.category.name}</span>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="text-brand-coral font-semibold">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section - Product Name & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* LEFT: Product Image */}
          <div className="space-y-8">
            {/* Main Product Image */}
            <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] via-black to-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl border border-brand-coral/20 group hover:border-brand-coral/40 transition-all duration-500">
              <Image
                src={selectedImage || productImage}
                alt={product.name}
                fill
                className="object-contain p-12 group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultImage;
                }}
              />
              {!product.image && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Package className="w-20 h-20 text-brand-coral/50 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-400 font-medium">Image coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative flex-shrink-0 w-24 h-24 bg-gradient-to-br from-[#1a1a1a] to-black rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                      selectedImage === img
                        ? 'border-brand-coral shadow-lg shadow-brand-coral/30 ring-2 ring-brand-coral/20'
                        : 'border-gray-800 hover:border-brand-coral/50'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-3"
                      sizes="96px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-8">
            {/* Product Title & Part Number */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight font-oswald">
                {product.name}
              </h1>
              
              {settings.showPartNumber && product.partNumber && (
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-maroon to-brand-red px-6 py-3 rounded-full text-white shadow-lg shadow-brand-coral/30">
                  <span className="text-sm font-medium">Part No:</span>
                  <span className="font-mono text-lg font-bold tracking-wide">{product.partNumber}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {settings.showDescription && product.description && (
              <p className="text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Tags */}
            {settings.showTags && product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-[#1a1a1a] text-gray-300 text-sm font-medium rounded-full border border-brand-coral/30 hover:bg-[#252525] hover:border-brand-coral transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Pricing */}
            {product.price !== undefined && (
              <div className="bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-emerald-900/40 backdrop-blur-sm rounded-3xl p-8 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-white font-oswald drop-shadow-lg">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.comparePrice && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                      {discount && (
                        <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                          SAVE {discount}%
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Bulk orders & custom quotes available</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Fast shipping worldwide</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Quality guaranteed</span>
                  </div>
                </div>

                <ProductInquiry
                  product={{
                    id: product.id,
                    name: product.name,
                    partNumber: product.partNumber,
                    price: product.price || 0,
                    slug: product.slug,
                  }}
                  mode="inline"
                />
              </div>
            )}

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {settings.showBrand && product.brand && (
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-2xl p-6 border border-brand-coral/20 shadow-lg hover:shadow-xl hover:border-brand-coral/40 transition-all">
                  <Award className="w-6 h-6 text-brand-coral mb-2" />
                  <p className="text-sm text-gray-400 mb-1">Brand</p>
                  <p className="text-lg font-bold text-white">{product.brand}</p>
                </div>
              )}
              
              {settings.showOrigin && product.origin && (
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-2xl p-6 border border-brand-coral/20 shadow-lg hover:shadow-xl hover:border-brand-coral/40 transition-all">
                  <span className="text-2xl mb-2 block">🌍</span>
                  <p className="text-sm text-gray-400 mb-1">Origin</p>
                  <p className="text-lg font-bold text-white">{product.origin}</p>
                </div>
              )}

              {settings.showCategory && product.category && (
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-2xl p-6 border border-brand-coral/20 shadow-lg hover:shadow-xl hover:border-brand-coral/40 transition-all">
                  <Package className="w-6 h-6 text-brand-coral mb-2" />
                  <p className="text-sm text-gray-400 mb-1">Category</p>
                  <p className="text-lg font-bold text-white">{product.category.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-24 bg-gradient-to-r from-brand-maroon via-brand-red to-brand-maroon rounded-3xl p-12 shadow-2xl border border-brand-coral/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="space-y-2">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-4xl md:text-5xl font-bold font-oswald">25,356</div>
              <div className="text-sm opacity-80">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-4xl md:text-5xl font-bold font-oswald">6,050</div>
              <div className="text-sm opacity-80">Parts Sold</div>
            </div>
            <div className="space-y-2">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <div className="text-4xl md:text-5xl font-bold font-oswald">95%</div>
              <div className="text-sm opacity-80">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Full Width Additional Details */}
        <div className="space-y-8">{/* Certifications */}
                {settings.showCertifications && (
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-3xl p-8 shadow-2xl border border-brand-coral/20 hover:border-brand-coral/40 transition-all">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Shield className="w-7 h-7 text-brand-coral" />
                      Certifications & Standards
                    </h3>
                    {product.certifications && product.certifications.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {product.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-5 py-3 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 text-emerald-300 text-sm font-semibold rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-brand-coral/30 mx-auto mb-4" />
                        <p className="text-gray-500">No certifications available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Warranty */}
                {settings.showWarranty && (
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-3xl p-8 shadow-2xl border border-brand-coral/20 hover:border-brand-coral/40 transition-all">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Shield className="w-7 h-7 text-brand-coral" />
                      Warranty Information
                    </h3>
                    {product.warranty ? (
                      <p className="text-gray-300 text-lg leading-relaxed">{product.warranty}</p>
                    ) : (
                      <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-brand-coral/30 mx-auto mb-4" />
                        <p className="text-gray-500">No warranty information available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Application */}
                {settings.showApplication && (
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-3xl p-8 shadow-2xl border border-brand-coral/20 hover:border-brand-coral/40 transition-all">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="text-3xl">🔧</span>
                      Applications
                    </h3>
                    {product.application && product.application.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {product.application.map((app, idx) => (
                          <span
                            key={idx}
                            className="px-5 py-3 bg-gradient-to-br from-purple-900/40 to-pink-900/40 text-purple-300 text-sm font-semibold rounded-xl border border-purple-500/30 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <span className="text-6xl opacity-20 mb-4 block">🔧</span>
                        <p className="text-gray-500">No application information available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Compatibility Strings */}
                {settings.showCompatibility && (
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-3xl p-8 shadow-2xl border border-brand-coral/20 hover:border-brand-coral/40 transition-all">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="text-3xl">🚗</span>
                      Compatible With
                    </h3>
                    {product.compatibility && product.compatibility.length > 0 ? (
                      <div className="space-y-3">
                        {product.compatibility.map((compat, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-brand-coral/20 hover:border-brand-coral/40 hover:bg-black/50 transition-all">
                            <span className="text-brand-coral text-xl font-bold">•</span>
                            <span className="text-gray-300 font-medium">{compat}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <span className="text-6xl opacity-20 mb-4 block">🚗</span>
                        <p className="text-gray-500">No compatibility information available</p>
                      </div>
                    )}
                  </div>
                )}
        </div>

        {/* Cross-Reference Information Section */}
        {(product.crossReferences && product.crossReferences.length > 0) ||
         (product.oemPartNumbers && product.oemPartNumbers.length > 0) ||
         (product.vehicleCompatibility && product.vehicleCompatibility.length > 0) ? (
          <div className="mt-20 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="border-t-4 border-brand-coral pt-12 relative">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-brand-coral to-transparent blur-sm" />
              
              <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#252525] rounded-3xl p-10 mb-10 border-l-4 border-brand-coral shadow-[0_20px_60px_rgba(215,109,119,0.2)] overflow-hidden group hover:shadow-[0_25px_70px_rgba(215,109,119,0.3)] transition-all duration-500">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                  }} />
                </div>
                
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-coral/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-700" />
                
                <h2 className="relative text-5xl font-bold text-white mb-4 flex items-center gap-4 font-oswald tracking-tight">
                  <span className="text-6xl">🔧</span>
                  Technical Information & Compatibility
                </h2>
                <p className="relative text-gray-400 text-xl">
                  Find cross-references, OEM numbers, and compatible vehicle information
                </p>
              </div>
              
              {/* Cross-References */}
              {product.crossReferences && product.crossReferences.length > 0 && (
                <div className="mb-10">
                  <CrossReferencesDisplay crossReferences={product.crossReferences} />
                </div>
              )}

              {/* OEM Part Numbers */}
              {product.oemPartNumbers && product.oemPartNumbers.length > 0 && (
                <div className="mb-10">
                  <OEMNumbersTable oemPartNumbers={product.oemPartNumbers} />
                </div>
              )}

              {/* Vehicle Compatibility */}
              {product.vehicleCompatibility && product.vehicleCompatibility.length > 0 && (
                <div className="mb-10">
                  <VehicleCompatibilityTable vehicleCompatibility={product.vehicleCompatibility} />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#252525] rounded-3xl p-10 mb-10 border-l-4 border-brand-coral shadow-[0_20px_60px_rgba(215,109,119,0.2)] overflow-hidden group hover:shadow-[0_25px_70px_rgba(215,109,119,0.3)] transition-all duration-500">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '30px 30px'
                }} />
              </div>
              
              {/* Glow effect */}
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-coral/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-700" />
              
              <h2 className="relative text-4xl font-bold text-white flex items-center gap-4 font-oswald">
                <span className="text-5xl">🔗</span>
                You May Also Like
              </h2>
              <p className="relative text-gray-400 mt-3 text-lg">Similar products from our catalog</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((related, idx) => (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_60px_rgba(215,109,119,0.3)] transition-all duration-500 overflow-hidden border border-gray-800 hover:border-brand-coral/50 group animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * idx}s` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
                    {related.image ? (
                      <Image
                        src={related.image}
                        alt={related.name}
                        fill
                        className="object-cover group-hover:scale-125 transition-transform duration-700 p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <Image
                        src="/images/GW_LOGO-removebg.png"
                        alt={related.name}
                        fill
                        className="object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Hover overlay with quick view */}
                    <div className="absolute inset-0 bg-brand-maroon/0 group-hover:bg-brand-maroon/90 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white font-bold text-lg transform scale-50 group-hover:scale-100 transition-transform duration-500">
                        View Details →
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-bold text-white mb-3 line-clamp-2 group-hover:text-brand-coral transition-colors font-oswald leading-tight">
                      {related.name}
                    </h3>
                    {related.price !== undefined && (
                      <p className="text-2xl font-bold text-brand-coral group-hover:scale-110 transition-transform duration-300 inline-block">
                        ${related.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
