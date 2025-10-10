'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ChevronRight, Home, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string;
  images?: string[];
  price?: number;
  comparePrice?: number | null;
  inStock?: boolean;
  stockQuantity?: number;
  tags: string[];
  brand: string | null;
  origin: string | null;
  certifications: string[];
  views: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
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
  const [mode, setMode] = useState<'showcase' | 'ecommerce'>('showcase');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-maroon" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  const discount = product.comparePrice && product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

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

    // Add offers section ONLY in e-commerce mode
    if (mode === 'ecommerce' && product.price) {
      structuredData.offers = {
        '@type': 'Offer',
        url: `${baseUrl}/products/${product.slug}`,
        priceCurrency: 'AED',
        price: product.price.toString(),
        availability: product.inStock 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
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
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStructuredData()) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-maroon flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/products" className="text-gray-500 hover:text-maroon">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">{product.category.name}</span>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Gallery */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                <Image
                  src={selectedImage || '/images/GW_LOGO-removebg.png'}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img
                          ? 'border-maroon ring-2 ring-maroon/20'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - Image ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 25vw, 10vw"
                      />
                    </button>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500 text-center">{product.views} views</p>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Title and Tags */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-maroon/10 text-maroon text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
              
              {product.description && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              <dl className="grid grid-cols-2 gap-4 text-sm">
                {product.brand && (
                  <>
                    <dt className="font-medium text-gray-500">Brand</dt>
                    <dd className="text-gray-900">{product.brand}</dd>
                  </>
                )}
                {product.origin && (
                  <>
                    <dt className="font-medium text-gray-500">Origin</dt>
                    <dd className="text-gray-900">{product.origin}</dd>
                  </>
                )}
              </dl>

              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Section (E-commerce Mode Only) */}
            {mode === 'ecommerce' && product.price !== undefined && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl font-bold text-maroon">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.comparePrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                      {discount && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                          Save {discount}%
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Stock Status */}
                {product.inStock ? (
                  <p className="text-green-600 font-medium mb-4">In Stock ({product.stockQuantity} available)</p>
                ) : (
                  <p className="text-red-600 font-medium mb-4">Out of Stock</p>
                )}

                {/* Quantity Selector */}
                {product.inStock && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg"
                        min="1"
                        max={product.stockQuantity}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity || 1, quantity + 1))}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    disabled={!product.inStock}
                    className="w-full px-6 py-3 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    disabled={!product.inStock}
                    className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            )}

            {/* Showcase Mode CTA */}
            {mode === 'showcase' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Interested in this product?
                </h3>
                <p className="text-gray-600 mb-4">
                  Contact us for more information, pricing, and availability.
                </p>
                <Link
                  href="/contact"
                  className="block w-full px-6 py-3 bg-maroon text-white text-center rounded-lg hover:bg-maroon/90 font-semibold"
                >
                  Contact Us
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {related.image ? (
                      <Image
                        src={related.image}
                        alt={related.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <Image
                        src="/images/GW_LOGO-removebg.png"
                        alt={related.name}
                        fill
                        className="object-contain p-8"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                      {related.name}
                    </h3>
                    {mode === 'ecommerce' && related.price !== undefined && (
                      <p className="text-lg font-bold text-maroon">
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
