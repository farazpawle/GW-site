import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import StatCard from '@/components/admin/StatCard';
import { Users, Package, FolderOpen, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  // Get current user info
  const user = await getCurrentUser();

  // Fetch statistics from database
  const [usersCount, partsCount, categoriesCount, recentPartsRaw] = await Promise.all([
    prisma.user.count(),
    prisma.part.count(),
    prisma.category.count(),
    prisma.part.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
  ]);

  // Convert Decimal objects to plain numbers for rendering
  const recentParts = recentPartsRaw.map((part) => ({
    ...part,
    price: Number(part.price),
    comparePrice: part.comparePrice ? Number(part.comparePrice) : null,
  }));

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section with gradient background */}
      <div className="relative bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-8 lg:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-maroon/5 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-400 text-base lg:text-lg">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Users"
          value={usersCount}
          icon={Users}
          description="Registered users"
        />
        <StatCard
          title="Total Products"
          value={partsCount}
          icon={Package}
          description="Active products"
        />
        <StatCard
          title="Categories"
          value={categoriesCount}
          icon={FolderOpen}
          description="Product categories"
        />
        <StatCard
          title="Stock Value"
          value="Coming Soon"
          icon={TrendingUp}
          description="Total inventory value"
        />
      </div>

      {/* Recent Products Section */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">Recent Products</h2>
            <p className="text-sm text-gray-400">Latest additions to your inventory</p>
          </div>
          <Link
            href="/admin/parts"
            className="group flex items-center gap-2 px-4 py-2 bg-brand-maroon/10 hover:bg-brand-maroon text-brand-maroon hover:text-white rounded-lg text-sm font-medium transition-all duration-300 border border-brand-maroon/20 hover:border-brand-maroon"
          >
            View All 
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>

        {recentParts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentParts.map((part) => (
              <div
                key={part.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#0a0a0a] rounded-xl border border-[#2a2a2a] hover:border-brand-maroon/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-maroon/10 cursor-pointer"
              >
                <div className="flex-1 mb-3 sm:mb-0">
                  <h3 className="font-semibold text-white group-hover:text-brand-maroon transition-colors">{part.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#2a2a2a] text-gray-300 border border-[#3a3a3a]">
                      {part.category.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      Part #{part.partNumber}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right sm:ml-6">
                  <p className="text-xl font-bold text-brand-maroon group-hover:scale-110 transition-transform duration-300">
                    ${part.price.toString()}
                  </p>
                  <div className="mt-1">
                    {part.inStock ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        ● In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        ● Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0a0a0a] rounded-xl border border-dashed border-[#2a2a2a]">
            <Package className="mx-auto h-12 w-12 text-gray-600 mb-3" />
            <p className="text-gray-400 mb-1">No products yet</p>
            <p className="text-sm text-gray-500 mb-4">Start by adding your first product!</p>
            <Link
              href="/admin/parts/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-maroon hover:bg-brand-red text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Add Product
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <Link
          href="/admin/parts/new"
          className="group bg-[#1a1a1a] hover:bg-brand-maroon text-white font-medium px-6 py-5 rounded-lg border border-[#2a2a2a] hover:border-brand-maroon transition-all duration-300 text-center shadow-sm hover:shadow-lg hover:shadow-brand-maroon/20"
        >
          <span className="text-brand-maroon group-hover:text-white transition-colors text-lg">+</span> Add New Product
        </Link>
        <Link
          href="/admin/categories/new"
          className="group bg-[#1a1a1a] hover:bg-brand-maroon text-white font-medium px-6 py-5 rounded-lg border border-[#2a2a2a] hover:border-brand-maroon transition-all duration-300 text-center shadow-sm hover:shadow-lg hover:shadow-brand-maroon/20"
        >
          <span className="text-brand-maroon group-hover:text-white transition-colors text-lg">+</span> Add New Category
        </Link>
        <Link
          href="/admin/settings"
          className="group bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white font-medium px-6 py-5 rounded-lg border border-[#2a2a2a] hover:border-gray-600 transition-all duration-300 text-center shadow-sm hover:shadow-lg"
        >
          <span className="group-hover:rotate-90 inline-block transition-transform duration-300">⚙️</span> Settings
        </Link>
      </div>
    </div>
  );
}
