# Phase 7: Analytics Dashboard

**Status:** 📋 Planned  
**Priority:** LOW (Business Intelligence)  
**Started:** Not yet  
**Estimated Time:** 2-3 hours  
**Completion:** 0%

---

## 🎯 Goal

Build a comprehensive analytics dashboard to track business performance, visualize sales data, monitor inventory, and gain insights into customer behavior and product performance.

**What Success Looks Like:**
- ✅ Visual charts and graphs for key metrics
- ✅ Revenue tracking (daily, weekly, monthly, yearly)
- ✅ Sales trends over time
- ✅ Top-selling products report
- ✅ Low stock alerts
- ✅ Customer growth metrics
- ✅ Category performance analysis
- ✅ Real-time or near-real-time data

---

## 📋 Tasks

### Task 1: Install Chart Library
**Time:** 10 minutes

**Actions:**
- Install recharts (popular React charting library)
- Set up chart components wrapper
- Configure chart theme to match admin panel

**Commands:**
```bash
npm install recharts
```

**Files to Create:**
- `src/components/admin/charts/ChartWrapper.tsx` - Styled chart container

---

### Task 2: Create Revenue Analytics
**Time:** 45 minutes

**Features:**
- Revenue chart (line chart) showing:
  - Daily revenue (last 30 days)
  - Weekly revenue (last 12 weeks)
  - Monthly revenue (last 12 months)
- Total revenue display
- Revenue comparison (vs. previous period)
- Average order value
- Toggle between time periods

**Files to Create:**
- `src/app/admin/analytics/page.tsx` - Analytics dashboard
- `src/components/admin/charts/RevenueChart.tsx` - Revenue line chart
- `src/lib/analytics/revenue.ts` - Revenue calculation utilities

**Database Queries:**
```typescript
// Monthly revenue for last 12 months
const monthlyRevenue = await prisma.$queryRaw`
  SELECT 
    DATE_TRUNC('month', "createdAt") as month,
    SUM("totalAmount") as revenue,
    COUNT(*) as orders
  FROM orders
  WHERE "status" NOT IN ('CANCELLED')
    AND "createdAt" >= NOW() - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', "createdAt")
  ORDER BY month ASC
`
```

---

### Task 3: Create Sales Trends Chart
**Time:** 30 minutes

**Features:**
- Multi-line chart showing:
  - Orders count trend
  - Revenue trend
  - Average order value trend
- Comparison view (current vs. previous period)
- Bar chart option for month-over-month comparison

**Files to Create:**
- `src/components/admin/charts/SalesTrendChart.tsx` - Sales trend chart
- `src/lib/analytics/sales-trends.ts` - Trend calculation utilities

---

### Task 4: Create Top Products Report
**Time:** 30 minutes

**Features:**
- Bar chart showing top 10 selling products by:
  - Quantity sold
  - Revenue generated
- Product images in chart
- Quick link to product edit page
- Filter by date range

**Files to Create:**
- `src/components/admin/charts/TopProductsChart.tsx` - Top products bar chart
- `src/lib/analytics/top-products.ts` - Top products queries

**Database Query:**
```typescript
const topProducts = await prisma.orderItem.groupBy({
  by: ['partId'],
  _sum: {
    quantity: true,
    price: true
  },
  orderBy: {
    _sum: {
      quantity: 'desc'
    }
  },
  take: 10
})

// Enrich with product details
const productsWithDetails = await Promise.all(
  topProducts.map(async (item) => {
    const product = await prisma.part.findUnique({
      where: { id: item.partId },
      select: { name: true, images: true, price: true }
    })
    return {
      ...product,
      quantitySold: item._sum.quantity,
      totalRevenue: item._sum.price
    }
  })
)
```

---

### Task 5: Create Inventory Alerts
**Time:** 25 minutes

**Features:**
- Low stock alerts (stock < 10)
- Out of stock list
- Products with no image
- Products with no category
- Alert badges with counts

**Files to Create:**
- `src/components/admin/InventoryAlerts.tsx` - Alert cards
- `src/lib/analytics/inventory-alerts.ts` - Alert queries

**Alert Types:**
```typescript
const alerts = await Promise.all([
  // Low stock (< 10)
  prisma.part.count({
    where: {
      inStock: true,
      stockQuantity: { lt: 10, gt: 0 }
    }
  }),
  
  // Out of stock
  prisma.part.count({
    where: { stockQuantity: 0 }
  }),
  
  // No images
  prisma.part.count({
    where: { images: { isEmpty: true } }
  }),
  
  // No category
  prisma.part.count({
    where: { categoryId: null }
  })
])
```

---

### Task 6: Create Category Performance Chart
**Time:** 25 minutes

**Features:**
- Pie chart or donut chart showing:
  - Revenue by category
  - Products count by category
- Category comparison table
- Percentage breakdown

**Files to Create:**
- `src/components/admin/charts/CategoryPerformanceChart.tsx` - Pie/donut chart
- `src/lib/analytics/category-performance.ts` - Category analytics

---

### Task 7: Create Customer Growth Chart
**Time:** 20 minutes

**Features:**
- Line chart showing:
  - New customers over time
  - Total customers count
  - Customer acquisition rate
- Growth percentage

**Files to Create:**
- `src/components/admin/charts/CustomerGrowthChart.tsx` - Customer growth line chart
- `src/lib/analytics/customer-growth.ts` - Customer analytics

---

### Task 8: Create Summary Stats Cards
**Time:** 20 minutes

**Features:**
- Key metrics cards at top of analytics page:
  - Today's Revenue
  - This Week's Revenue
  - This Month's Revenue
  - Total Orders This Month
  - Average Order Value
  - Conversion Rate (if applicable)
- Comparison with previous period (↑ 12% vs last month)
- Color coding (green for positive, red for negative)

**Files to Create:**
- `src/components/admin/analytics/MetricCard.tsx` - Reusable metric card

---

### Task 9: Add Date Range Filter
**Time:** 15 minutes

**Features:**
- Global date range picker for analytics
- Presets: Today, This Week, This Month, Last Month, Last 3 Months, Last Year, Custom
- Apply filter to all charts
- State management (React Context or URL params)

**Files to Create:**
- `src/components/admin/DateRangePicker.tsx` - Date range picker
- `src/contexts/AnalyticsFilterContext.tsx` - Filter state management

---

### Task 10: Polish & Test
**Time:** 20 minutes

**Features:**
- Loading states for all charts
- Empty states (no data)
- Responsive charts on mobile
- Export charts as images (optional)
- Test all date filters
- Verify calculations are accurate
- Performance optimization

---

## 📁 Files Structure

```
src/
├── app/
│   └── admin/
│       └── analytics/
│           └── page.tsx              (NEW) Analytics dashboard
│
├── components/admin/
│   ├── analytics/
│   │   ├── MetricCard.tsx            (NEW) Summary metric card
│   │   └── InventoryAlerts.tsx       (NEW) Alert cards
│   │
│   ├── charts/
│   │   ├── ChartWrapper.tsx          (NEW) Chart container
│   │   ├── RevenueChart.tsx          (NEW) Revenue line chart
│   │   ├── SalesTrendChart.tsx       (NEW) Sales trends
│   │   ├── TopProductsChart.tsx      (NEW) Top products bar chart
│   │   ├── CategoryPerformanceChart.tsx (NEW) Category pie chart
│   │   └── CustomerGrowthChart.tsx   (NEW) Customer growth
│   │
│   └── DateRangePicker.tsx           (NEW) Date filter
│
├── contexts/
│   └── AnalyticsFilterContext.tsx    (NEW) Filter state
│
└── lib/
    └── analytics/
        ├── revenue.ts                (NEW) Revenue calculations
        ├── sales-trends.ts           (NEW) Trend calculations
        ├── top-products.ts           (NEW) Product analytics
        ├── inventory-alerts.ts       (NEW) Alert queries
        ├── category-performance.ts   (NEW) Category analytics
        └── customer-growth.ts        (NEW) Customer analytics
```

---

## 🎨 Design Specifications

### Analytics Dashboard Layout
```
┌────────────────────────────────────────────────────────┐
│  Analytics                        [Date Range: ▼]      │
├────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ $12,450  │ │ $3,250   │ │ $45,200  │ │   156    │ │
│  │ Today    │ │This Week │ │This Month│ │Orders/Mo │ │
│  │ ↑ 12%    │ │ ↑ 8%     │ │ ↓ 3%     │ │ ↑ 15%    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Revenue Trend (Last 12 Months)                  │  │
│  │ [Line Chart showing monthly revenue]            │  │
│  │                                                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ Top 10 Products      │  │ Category Performance │  │
│  │ [Bar Chart]          │  │ [Pie Chart]          │  │
│  │                      │  │                      │  │
│  └──────────────────────┘  └──────────────────────┘  │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ Customer Growth      │  │ Inventory Alerts     │  │
│  │ [Line Chart]         │  │ ⚠️ 5 Low Stock      │  │
│  │                      │  │ 🔴 3 Out of Stock   │  │
│  └──────────────────────┘  │ 📷 2 No Images      │  │
│                             └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Chart Color Scheme (Matching Maroon Theme)
```typescript
const chartColors = {
  primary: '#8B1538',      // brand-maroon
  secondary: '#932020',    // brand-red
  success: '#10b981',      // green
  warning: '#f59e0b',      // yellow
  danger: '#ef4444',       // red
  info: '#3b82f6',         // blue
  gray: '#6b7280'
}
```

---

## 🔧 Technical Requirements

### Chart Library Configuration
```typescript
// Recharts with custom theme
const chartTheme = {
  backgroundColor: '#1a1a1a',
  textColor: '#ffffff',
  gridColor: '#2a2a2a',
  tooltipBg: '#0a0a0a',
  tooltipBorder: '#8B1538'
}
```

### Performance Optimizations
- Cache analytics queries (5-15 min cache)
- Use database indexes on createdAt, status
- Aggregate data at database level
- Lazy load charts (viewport intersection)
- Debounce date filter changes

### Database Indexes Needed
```sql
CREATE INDEX idx_orders_created_status ON orders(createdAt, status);
CREATE INDEX idx_order_items_part ON order_items(partId);
CREATE INDEX idx_parts_stock ON parts(stockQuantity, inStock);
```

---

## ✅ Acceptance Criteria

**Functional Requirements:**
- [ ] All charts render correctly
- [ ] Data is accurate and matches database
- [ ] Date filters work for all charts
- [ ] Revenue calculations correct
- [ ] Top products show accurate rankings
- [ ] Inventory alerts are up-to-date
- [ ] Customer growth trend accurate

**Non-Functional Requirements:**
- [ ] Fast loading (< 3s for all charts)
- [ ] Responsive on mobile/tablet
- [ ] Charts resize properly
- [ ] No console errors
- [ ] Smooth animations
- [ ] Accessible (keyboard navigation)

**User Experience:**
- [ ] Clear visual hierarchy
- [ ] Intuitive date filters
- [ ] Helpful tooltips on charts
- [ ] Loading states for async data
- [ ] Empty states for no data

---

## 🐛 Known Challenges

### Challenge 1: Large Datasets
**Issue:** Charts slow with 1000+ data points  
**Solution:** Aggregate data by day/week/month, limit visible points, use pagination

### Challenge 2: Real-time Updates
**Issue:** Analytics data may be stale  
**Solution:** Implement caching with TTL, add "Last Updated" timestamp, refresh button

### Challenge 3: Complex Queries
**Issue:** Aggregation queries can be slow  
**Solution:** Use database views, materialized views, or pre-computed tables

---

## 💡 Future Enhancements

- [ ] Export analytics reports to PDF
- [ ] Email scheduled reports
- [ ] Custom dashboard widgets (drag-and-drop)
- [ ] Predictive analytics (ML forecasting)
- [ ] Cohort analysis
- [ ] Customer lifetime value (CLV)
- [ ] A/B test results
- [ ] Marketing campaign performance
- [ ] Product recommendation insights
- [ ] Inventory forecasting
- [ ] Seasonal trends analysis
- [ ] Geographic sales map

---

## 📊 Key Metrics to Track

### Revenue Metrics:
- Total Revenue
- Average Order Value (AOV)
- Revenue Per Customer
- Revenue by Category
- Revenue Growth Rate

### Sales Metrics:
- Total Orders
- Conversion Rate
- Cart Abandonment Rate
- Average Items Per Order
- Repeat Purchase Rate

### Product Metrics:
- Best Sellers
- Worst Performers
- Stock Turnover Rate
- Products Viewed Most
- Products Added to Cart Most

### Customer Metrics:
- Total Customers
- New Customers
- Returning Customers
- Customer Acquisition Cost (CAC)
- Customer Retention Rate

---

## 📊 Progress Tracking

| Task | Estimated | Actual | Status |
|------|-----------|--------|--------|
| Install Chart Library | 10 min | - | ⬜ Not started |
| Revenue Analytics | 45 min | - | ⬜ Not started |
| Sales Trends Chart | 30 min | - | ⬜ Not started |
| Top Products Report | 30 min | - | ⬜ Not started |
| Inventory Alerts | 25 min | - | ⬜ Not started |
| Category Performance | 25 min | - | ⬜ Not started |
| Customer Growth | 20 min | - | ⬜ Not started |
| Summary Stats Cards | 20 min | - | ⬜ Not started |
| Date Range Filter | 15 min | - | ⬜ Not started |
| Polish & Test | 20 min | - | ⬜ Not started |
| **TOTAL** | **~2.5 hours** | - | - |

---

## 🔗 Dependencies

**Required Before Starting:**
- Phase 6: Order Management (needs order data for revenue/sales)
- Phase 3: Product Management (needs product data)
- Sufficient data in database (seed data recommended)

**External Libraries:**
```json
{
  "recharts": "^2.10.0"
}
```

---

**Status:** Ready to implement after Phase 6! 📈
