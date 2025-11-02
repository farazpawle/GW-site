# Phase 4: Admin UI Pages

**Status:** 🔴 Not Started  
**Priority:** Medium  
**Dependencies:** Phase 1 + Phase 2 + Phase 3 Complete  
**Estimated Time:** 3-4 hours

---

## 📋 Overview

This phase builds the admin interface for payment management:
- Payments list page (searchable, filterable table)
- Payment details view (full transaction info)

**Why This Phase is Important:**
- 📊 Enables admins to monitor transactions
- 🔍 Provides payment history and search
- 💳 Shows refund status and customer details
- 🛠️ Allows refund processing from UI

---

## 🎯 Objectives

1. ✅ Build payments list page with filters
2. ✅ Create payment details view
3. ✅ Add refund UI with confirmation
4. ✅ Implement search and pagination
5. ✅ Add status badges and formatting
6. ✅ Ensure responsive design

---

## 📊 Tasks Breakdown

### Task 4.1: Payments List Page

**File:** `src/app/admin/payments/page.tsx`

**Purpose:** Display all payments with filtering and search

**Implementation:**

```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentsTable } from '@/components/admin/payments/PaymentsTable';
import { PaymentsFilters } from '@/components/admin/payments/PaymentsFilters';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
  provider?: string;
}

/**
 * Admin Payments List Page
 * 
 * Features:
 * - Search by order number, customer email, transaction ID
 * - Filter by status, provider, date range
 * - Pagination
 * - Export to CSV
 */
export default async function PaymentsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  // Authentication check
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manage payment transactions and refunds"
      />

      {/* Summary Stats */}
      <Suspense fallback={<SummaryStatsSkeleton />}>
        <SummaryStats />
      </Suspense>

      {/* Filters */}
      <Card>
        <PaymentsFilters
          initialFilters={{
            search: searchParams.search,
            status: searchParams.status,
            provider: searchParams.provider
          }}
        />
      </Card>

      {/* Payments Table */}
      <Suspense fallback={<TableSkeleton />}>
        <PaymentsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/**
 * Summary statistics cards
 */
async function SummaryStats() {
  const [
    totalPayments,
    successfulPayments,
    totalRevenue,
    totalRefunded
  ] = await Promise.all([
    // Total payments count
    prisma.payment.count(),

    // Successful payments count
    prisma.payment.count({
      where: { status: 'SUCCEEDED' }
    }),

    // Total revenue (successful payments)
    prisma.payment.aggregate({
      where: { status: 'SUCCEEDED' },
      _sum: { amount: true }
    }),

    // Total refunded amount
    prisma.payment.aggregate({
      _sum: { refundedAmount: true }
    })
  ]);

  const stats = [
    {
      label: 'Total Payments',
      value: totalPayments.toLocaleString(),
      description: 'All time'
    },
    {
      label: 'Successful',
      value: successfulPayments.toLocaleString(),
      description: `${((successfulPayments / totalPayments) * 100).toFixed(1)}% success rate`
    },
    {
      label: 'Total Revenue',
      value: `$${(totalRevenue._sum.amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      description: 'Successful payments'
    },
    {
      label: 'Total Refunded',
      value: `$${(totalRefunded._sum.refundedAmount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      description: 'All refunds'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stat.label}
          </div>
          <div className="text-2xl font-bold mt-2">{stat.value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stat.description}
          </div>
        </Card>
      ))}
    </div>
  );
}

function SummaryStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-28" />
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <Card>
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </Card>
  );
}
```

**File:** `src/components/admin/payments/PaymentsTable.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Download } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 20;

interface PaymentsTableProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    provider?: string;
  };
}

export async function PaymentsTable({ searchParams }: PaymentsTableProps) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const statusFilter = searchParams.status;
  const providerFilter = searchParams.provider;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { transactionId: { contains: search, mode: 'insensitive' } },
      { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } }
    ];
  }

  if (statusFilter) {
    where.status = statusFilter;
  }

  if (providerFilter) {
    where.provider = providerFilter;
  }

  // Fetch payments
  const [payments, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            totalAmount: true
          }
        },
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            refunds: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE
    }),
    prisma.payment.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  {payment.transactionId.substring(0, 20)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/admin/orders/${payment.orderId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {payment.order.orderNumber}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div>
                    {payment.customer.firstName} {payment.customer.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {payment.customer.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="font-medium">
                    ${payment.amount.toFixed(2)}
                  </div>
                  {payment.refundedAmount > 0 && (
                    <div className="text-xs text-red-600">
                      -${payment.refundedAmount.toFixed(2)} refunded
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PaymentStatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <ProviderBadge provider={payment.provider} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Link href={`/admin/payments/${payment.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/payments"
        />
      )}

      {/* Empty State */}
      {payments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No payments found</p>
        </div>
      )}
    </div>
  );
}

/**
 * Payment status badge component
 */
function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    SUCCEEDED: 'success',
    PENDING: 'warning',
    FAILED: 'error',
    REFUNDED: 'default',
    PARTIALLY_REFUNDED: 'warning'
  };

  return (
    <Badge variant={variants[status] || 'default'}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

/**
 * Payment provider badge component
 */
function ProviderBadge({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    STRIPE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    PAYPAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    SQUARE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[provider]}`}>
      {provider}
    </span>
  );
}
```

**File:** `src/components/admin/payments/PaymentsFilters.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface PaymentsFiltersProps {
  initialFilters?: {
    search?: string;
    status?: string;
    provider?: string;
  };
}

export function PaymentsFilters({ initialFilters = {} }: PaymentsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialFilters.search || '');
  const [status, setStatus] = useState(initialFilters.status || '');
  const [provider, setProvider] = useState(initialFilters.provider || '');

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (search) params.set('search', search);
    else params.delete('search');

    if (status) params.set('status', status);
    else params.delete('status');

    if (provider) params.set('provider', provider);
    else params.delete('provider');

    params.delete('page'); // Reset to page 1

    router.push(`/admin/payments?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setProvider('');
    router.push('/admin/payments');
  };

  const hasActiveFilters = search || status || provider;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Order #, Email, Transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
          </Select>
        </div>

        {/* Provider Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Provider</label>
          <Select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="">All Providers</option>
            <option value="STRIPE">Stripe</option>
            <option value="PAYPAL">PayPal</option>
            <option value="SQUARE">Square</option>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

### Task 4.2: Payment Details Page

**File:** `src/app/admin/payments/[id]/page.tsx`

**Purpose:** Show detailed payment information and refund UI

**Implementation:**

```typescript
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Receipt, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RefundDialog } from '@/components/admin/payments/RefundDialog';

interface PaymentDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function PaymentDetailsPage({
  params
}: PaymentDetailsPageProps) {
  // Authentication check
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/admin/login');
  }

  // Fetch payment
  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: {
          items: {
            include: {
              part: true
            }
          }
        }
      },
      customer: true,
      refunds: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!payment) {
    notFound();
  }

  const canRefund =
    payment.status === 'SUCCEEDED' || payment.status === 'PARTIALLY_REFUNDED';
  const maxRefundable = payment.amount - (payment.refundedAmount || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/payments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <p className="text-sm text-gray-500">
              Transaction ID: {payment.transactionId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canRefund && <RefundDialog payment={payment} maxRefundable={maxRefundable} />}
          <Button variant="outline" size="sm">
            <Receipt className="h-4 w-4 mr-2" />
            View Receipt
          </Button>
        </div>
      </div>

      {/* Payment Status Alert */}
      {payment.status === 'FAILED' && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <div className="font-medium text-red-900 dark:text-red-200">
                Payment Failed
              </div>
              <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                {payment.errorMessage || 'No error details available'}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <PaymentStatusBadge status={payment.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Provider</dt>
                  <dd className="mt-1 font-medium">{payment.provider}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Amount</dt>
                  <dd className="mt-1 text-lg font-bold">
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Refunded Amount</dt>
                  <dd className="mt-1 font-medium text-red-600">
                    ${(payment.refundedAmount || 0).toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Created</dt>
                  <dd className="mt-1">
                    {format(new Date(payment.createdAt), 'PPpp')}
                  </dd>
                </div>
                {payment.paidAt && (
                  <div>
                    <dt className="text-sm text-gray-500">Paid At</dt>
                    <dd className="mt-1">
                      {format(new Date(payment.paidAt), 'PPpp')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </Card>

          {/* Order Details */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Order Details</h2>
                <Link href={`/admin/orders/${payment.order.id}`}>
                  <Button variant="outline" size="sm">
                    View Order
                  </Button>
                </Link>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-500">Order Number</div>
                <div className="font-medium">{payment.order.orderNumber}</div>
              </div>
              <div className="border-t pt-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500">
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payment.order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2">
                          <div className="font-medium">{item.part.partNumber}</div>
                          <div className="text-sm text-gray-500">
                            {item.part.description}
                          </div>
                        </td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr>
                      <td colSpan={3} className="pt-2 text-right font-semibold">
                        Total:
                      </td>
                      <td className="pt-2 text-right font-bold text-lg">
                        ${payment.order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </Card>

          {/* Refund History */}
          {payment.refunds.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Refund History</h2>
                <div className="space-y-3">
                  {payment.refunds.map((refund) => (
                    <div
                      key={refund.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div>
                        <div className="font-medium">
                          ${refund.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(refund.createdAt), 'PPp')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Reason: {refund.reason}
                        </div>
                        {refund.notes && (
                          <div className="text-xs text-gray-500">
                            Notes: {refund.notes}
                          </div>
                        )}
                      </div>
                      <Badge variant={refund.status === 'SUCCEEDED' ? 'success' : 'warning'}>
                        {refund.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Customer</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">
                    {payment.customer.firstName} {payment.customer.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{payment.customer.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{payment.customer.phone || 'N/A'}</div>
                </div>
                <Link href={`/admin/customers/${payment.customer.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Customer Profile
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Technical Details */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Technical Details</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Payment ID</dt>
                  <dd className="font-mono text-xs mt-1">{payment.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Transaction ID</dt>
                  <dd className="font-mono text-xs mt-1">{payment.transactionId}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Idempotency Key</dt>
                  <dd className="font-mono text-xs mt-1">{payment.idempotencyKey}</dd>
                </div>
              </dl>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    SUCCEEDED: 'success',
    PENDING: 'warning',
    FAILED: 'error',
    REFUNDED: 'default',
    PARTIALLY_REFUNDED: 'warning'
  };

  return (
    <Badge variant={variants[status] || 'default'}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
```

**File:** `src/components/admin/payments/RefundDialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'react-hot-toast';

interface RefundDialogProps {
  payment: {
    id: string;
    amount: number;
    refundedAmount: number;
  };
  maxRefundable: number;
}

export function RefundDialog({ payment, maxRefundable }: RefundDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullRefund, setIsFullRefund] = useState(true);
  const [amount, setAmount] = useState(maxRefundable.toString());
  const [reason, setReason] = useState('CUSTOMER_REQUEST');
  const [notes, setNotes] = useState('');

  const handleRefund = async () => {
    try {
      setIsLoading(true);

      const refundAmount = isFullRefund ? undefined : parseFloat(amount);

      if (!isFullRefund && (!refundAmount || refundAmount <= 0 || refundAmount > maxRefundable)) {
        toast.error('Invalid refund amount');
        return;
      }

      const response = await fetch(`/api/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: refundAmount,
          reason,
          notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Refund failed');
      }

      toast.success('Refund processed successfully');
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process refund');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Process Refund
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Process Refund</h2>

          {/* Warning */}
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                This action cannot be undone. The refund will be processed immediately.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Refund Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Refund Type</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isFullRefund}
                    onChange={() => {
                      setIsFullRefund(true);
                      setAmount(maxRefundable.toString());
                    }}
                    className="mr-2"
                  />
                  Full Refund (${maxRefundable.toFixed(2)})
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isFullRefund}
                    onChange={() => setIsFullRefund(false)}
                    className="mr-2"
                  />
                  Partial Refund
                </label>
              </div>
            </div>

            {/* Amount (if partial) */}
            {!isFullRefund && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Refund Amount (Max: ${maxRefundable.toFixed(2)})
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxRefundable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="CUSTOMER_REQUEST">Customer Request</option>
                <option value="DUPLICATE">Duplicate Charge</option>
                <option value="FRAUDULENT">Fraudulent</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (Optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Process Refund'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
```

---

## ✅ Phase Completion Checklist

### Payments List Page
- [ ] Summary statistics displayed
- [ ] Table shows all payments
- [ ] Search works (order, email, transaction ID)
- [ ] Filters work (status, provider)
- [ ] Pagination works
- [ ] Links to payment details
- [ ] Responsive design

### Payment Details Page
- [ ] Shows full payment info
- [ ] Displays order details
- [ ] Shows refund history
- [ ] Customer information visible
- [ ] Technical details shown
- [ ] Refund dialog works
- [ ] Links to related pages

### Refund Dialog
- [ ] Full/partial refund options
- [ ] Amount validation
- [ ] Reason selection
- [ ] Notes field
- [ ] Confirmation warning
- [ ] API integration works
- [ ] Shows success/error messages

---

## 🧪 Testing Checklist

- [ ] View payments list as admin
- [ ] Search for specific payments
- [ ] Filter by status and provider
- [ ] Navigate through pages
- [ ] View payment details
- [ ] Process full refund
- [ ] Process partial refund
- [ ] Verify refund appears in history
- [ ] Check mobile responsiveness

---

**Next Phase:** [Phase 5: Documentation & Compliance](./Phase-5-Documentation.md)

**Status Update:** Ready to begin after Phase 3 completion
