import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Plus, Package } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductTable from '@/components/admin/parts/ProductTable';
import CSVActions from '@/components/admin/products/CSVActions';

interface SearchParams {
  search?: string;
  category?: string;
  stock?: 'all' | 'in-stock' | 'out-of-stock' | 'low-stock';
  page?: string;
  sort?: string;
}

interface ProductListPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const search = params.search || '';
  const categoryId = params.category || '';
  const stockFilter = params.stock || 'all';
  const page = parseInt(params.page || '1', 10);
  const sort = params.sort || 'createdAt-desc';
  const pageSize = 20;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { partNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (stockFilter === 'in-stock') {
    where.inStock = true;
  } else if (stockFilter === 'out-of-stock') {
    where.inStock = false;
  } else if (stockFilter === 'low-stock') {
    where.AND = [
      { inStock: true },
      { stockQuantity: { lt: 10 } },
    ];
  }

  // Build orderBy clause
  const [sortField, sortOrder] = sort.split('-');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderBy: any = {};
  if (sortField === 'name' || sortField === 'partNumber' || sortField === 'price' || sortField === 'stockQuantity') {
    orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  // Fetch products with pagination
  const [productsRaw, totalCount, categories] = await Promise.all([
    prisma.part.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
      },
    }),
    prisma.part.count({ where }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  // Convert Decimal objects to plain numbers for Client Components
  const products = productsRaw.map((product) => ({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminHeader
        pageTitle="Products"
        description="Manage your auto parts inventory"
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 mb-6">
          <form method="GET" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    id="search"
                    name="search"
                    defaultValue={search}
                    placeholder="Search by name or part number..."
                    className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6e0000] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={categoryId}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6e0000] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-2">
                  Stock Status
                </label>
                <select
                  id="stock"
                  name="stock"
                  defaultValue={stockFilter}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6e0000] focus:border-transparent"
                >
                  <option value="all">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="low-stock">Low Stock (&lt;10)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="px-6 py-2 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors"
              >
                Apply Filters
              </button>

              {(search || categoryId || stockFilter !== 'all') && (
                <Link
                  href="/admin/parts"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Clear Filters
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Product Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <p className="text-gray-400">
            Showing {products.length} of {totalCount} product{totalCount !== 1 ? 's' : ''}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <CSVActions
              totalProducts={totalCount}
              currentFilters={{
                search,
                categoryId,
                stockFilter,
              }}
            />

            <Link
              href="/admin/parts/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Product
            </Link>
          </div>
        </div>

        {/* Product Table */}
        {products.length > 0 ? (
          <>
            <ProductTable products={products} currentSort={sort} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/parts?${new URLSearchParams({
                      ...(search && { search }),
                      ...(categoryId && { category: categoryId }),
                      ...(stockFilter !== 'all' && { stock: stockFilter }),
                      page: (page - 1).toString(),
                      ...(sort && { sort }),
                    }).toString()}`}
                    className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                  >
                    Previous
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/admin/parts?${new URLSearchParams({
                          ...(search && { search }),
                          ...(categoryId && { category: categoryId }),
                          ...(stockFilter !== 'all' && { stock: stockFilter }),
                          page: pageNum.toString(),
                          ...(sort && { sort }),
                        }).toString()}`}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          pageNum === page
                            ? 'bg-[#6e0000] text-white'
                            : 'bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {page < totalPages && (
                  <Link
                    href={`/admin/parts?${new URLSearchParams({
                      ...(search && { search }),
                      ...(categoryId && { category: categoryId }),
                      ...(stockFilter !== 'all' && { stock: stockFilter }),
                      page: (page + 1).toString(),
                      ...(sort && { sort }),
                    }).toString()}`}
                    className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">
              {search || categoryId || stockFilter !== 'all'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Get started by adding your first product.'}
            </p>
            <Link
              href="/admin/parts/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
