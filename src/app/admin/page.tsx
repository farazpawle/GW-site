import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import EnhancedStatCard from '@/components/admin/stats/EnhancedStatCard';
import SearchAnalytics from '@/components/admin/analytics/SearchAnalytics';
import EngagementChartWrapper from '@/components/admin/charts/EngagementChartWrapper';
import TopViewedWidget from '@/components/admin/products/TopViewedWidget';
import NeedsAttentionWidget from '@/components/admin/products/NeedsAttentionWidget';
import MessageDashboard from '@/components/admin/dashboard/MessageDashboard';
import { Package } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  // Get current user info
  const user = await getCurrentUser();

  // Fetch statistics from database
  const [usersCount, adminsCount, partsCount, categoriesCount, recentPartsRaw] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
    prisma.part.count(),
    prisma.category.count(),
    prisma.part.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
  ]);

  // Generate sample trend data (in production, calculate from historical data)
  const generateMockTrendData = () => ({
    users: { value: 12, direction: 'up' as const, period: 'vs last week' },
    products: { value: 8, direction: 'up' as const, period: 'vs last week' },
    categories: { value: 3, direction: 'down' as const, period: 'vs last month' },
    pageViews: { value: 22, direction: 'up' as const, period: 'vs last week' },
  });

  // Generate sample chart data (in production, fetch from analytics)
  const generateMockChartData = () => ({
    users: [20, 25, 22, 30, 28, 35, usersCount],
    products: [partsCount - 10, partsCount - 8, partsCount - 5, partsCount - 3, partsCount],
    categories: Array.from({ length: 7 }, (_, i) => categoriesCount - (7 - i)),
    pageViews: [850, 920, 1050, 1180, 1250, 1420, 1580],
  });

  const trends = generateMockTrendData();
  const charts = generateMockChartData();

  // Convert Decimal objects to plain numbers for rendering
  const recentParts = recentPartsRaw.map((part) => ({
    ...part,
    price: Number(part.price),
    comparePrice: part.comparePrice ? Number(part.comparePrice) : null,
  }));

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section with gradient background */}
      <div className="relative bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-8 lg:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-maroon/5 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-400 text-base lg:text-lg">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <EnhancedStatCard
          title="Total Users"
          value={usersCount}
          iconName="users"
          trend={trends.users}
          chart={{
            type: 'line',
            data: charts.users,
            color: '#3b82f6',
          }}
          status="success"
        />
        <EnhancedStatCard
          title="Total Products"
          value={partsCount}
          iconName="package"
          trend={trends.products}
          chart={{
            type: 'bar',
            data: charts.products,
            color: '#6e0000',
          }}
          status="success"
        />
        <EnhancedStatCard
          title="Categories"
          value={categoriesCount}
          iconName="folder"
          trend={trends.categories}
          chart={{
            type: 'line',
            data: charts.categories,
            color: '#f59e0b',
          }}
          status="warning"
        />
      </div>

      {/* Engagement Chart */}
      <EngagementChartWrapper />

      {/* Product Performance Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopViewedWidget />
        <NeedsAttentionWidget />
      </div>

      {/* Message Dashboard - Full Width */}
      <MessageDashboard />

      {/* Recent Products and Search Analytics Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-maroon/50 scrollbar-track-[#1a1a1a]">
            {recentParts.map((part) => (
              <div
                key={part.id}
                className="flex gap-2 p-2 bg-[#0a0a0a] rounded border border-[#2a2a2a] hover:border-brand-maroon/50 transition-colors"
              >
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-white truncate">{part.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className="truncate">{part.category.name}</span>
                      <span>•</span>
                      <span className="truncate">{part.partNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-brand-maroon">
                      ${part.price.toString()}
                    </span>
                    {part.published ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Draft
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

        {/* Search Analytics */}
        <SearchAnalytics />
      </div>
    </div>
  );
}
