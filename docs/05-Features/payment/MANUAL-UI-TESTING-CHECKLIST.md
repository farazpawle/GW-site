# Manual UI Testing Checklist - Payment Gateway

**Date:** October 12, 2025  
**Tester:** Agent  
**Environment:** Development (localhost:3000)  
**Test Data:** 6 payments, 3 refunds, 4 webhook logs

---

## Pre-Test Setup ✅

- [x] Test data seeded successfully
- [x] Dev server running on port 3000
- [x] Database connected (PostgreSQL)
- [x] Stripe test keys configured in .env.local
- [ ] User logged in as ADMIN (required for testing)

---

## 1. Payments List Page (/admin/payments)

### 1.1 Page Load & Layout
- [ ] Page loads without errors
- [ ] No console errors in browser
- [ ] Page title shows "Payments"
- [ ] Summary cards visible at top
- [ ] Filters section visible
- [ ] Table displays correctly
- [ ] Pagination controls visible (if applicable)

### 1.2 Summary Cards
Expected data:
- **Total Payments:** 6
- **Pending:** 1 payment ($159.99)
- **Succeeded:** 3 payments ($414.98 + $99.99 = $514.97)
- **Failed:** 1 payment ($624.99)
- **Refunded:** 1 payment ($211.99)
- **Partially Refunded:** 1 payment ($469.99)

Test:
- [ ] Total Payments card shows "6"
- [ ] Pending card shows correct count and amount
- [ ] Succeeded card shows correct count and amount
- [ ] Failed card shows correct count
- [ ] Refunded cards show correct counts

### 1.3 Search Functionality
Test searches:
- [ ] Search by transaction ID: "pi_test_1_success" → Returns 1 result
- [ ] Search by order number: "ORD-TEST-001" → Returns 1-2 results
- [ ] Search by customer email: "john.doe@example.com" → Returns 2-3 results
- [ ] Search with no matches: "nonexistent" → Shows "No payments found"
- [ ] Clear search returns all payments

### 1.4 Status Filter
- [ ] "All" shows 6 payments
- [ ] "Pending" shows 1 payment (pi_test_2_pending)
- [ ] "Succeeded" shows 2 payments (pi_test_1_success, pp_test_6_success)
- [ ] "Failed" shows 1 payment (pi_test_3_failed)
- [ ] "Refunded" shows 1 payment (pi_test_4_refunded)
- [ ] "Partially Refunded" shows 1 payment (pi_test_5_partial_refund)

### 1.5 Provider Filter
- [ ] "All" shows 6 payments
- [ ] "Stripe" shows 5 payments
- [ ] "PayPal" shows 1 payment (pp_test_6_success)
- [ ] "Square" shows 0 payments

### 1.6 Combined Filters
- [ ] Status: "Succeeded" + Provider: "Stripe" → Shows 1 payment
- [ ] Status: "Pending" + Search: "jane" → Shows 1 payment
- [ ] All filters cleared → Returns to all 6 payments

### 1.7 Table Display
For each payment row, verify:
- [ ] Transaction ID displayed correctly
- [ ] Order number displayed correctly (with "ORD-" prefix)
- [ ] Customer name displayed (e.g., "John Doe")
- [ ] Customer email displayed
- [ ] Amount formatted correctly (e.g., "$314.99")
- [ ] Status badge shows correct color:
  - Pending: Yellow/Orange
  - Succeeded: Green
  - Failed: Red
  - Refunded: Gray
  - Partially Refunded: Blue
- [ ] Provider displayed correctly (STRIPE, PAYPAL)
- [ ] Date formatted correctly
- [ ] Row click navigates to detail page

### 1.8 CSV Export
- [ ] Export button visible
- [ ] Click export downloads CSV file
- [ ] CSV filename format: "payments-export-YYYY-MM-DD.csv"
- [ ] CSV contains all visible payments
- [ ] CSV headers correct: ID, Transaction ID, Order, Customer, Amount, Status, Provider, Date
- [ ] CSV data matches table data

### 1.9 Pagination (if > 20 payments)
- [ ] Page numbers displayed
- [ ] Current page highlighted
- [ ] "Previous" button disabled on first page
- [ ] "Next" button disabled on last page
- [ ] Clicking page number changes results
- [ ] Items per page: 20

---

## 2. Payment Details Page (/admin/payments/[id])

### 2.1 Navigate to Details
- [ ] Click on first payment (pi_test_1_success) from list
- [ ] URL changes to: /admin/payments/[payment-id]
- [ ] Page loads successfully
- [ ] No console errors

### 2.2 Payment Information Card
Verify for payment "pi_test_1_success":
- [ ] Transaction ID: "pi_test_1_success"
- [ ] Status badge: "SUCCEEDED" (green)
- [ ] Amount: "$314.99"
- [ ] Currency: "USD"
- [ ] Provider: "STRIPE"
- [ ] Customer: "John Doe (john.doe@example.com)"
- [ ] Order Number: "ORD-TEST-001" (clickable link)
- [ ] Payment Method: "visa ••••4242" (from metadata)
- [ ] Created Date: Displayed correctly
- [ ] Paid Date: "October 10, 2025, 2:30 PM" (or similar format)

### 2.3 Order Details Card
For payment with order:
- [ ] Order section visible
- [ ] Order Number: "ORD-TEST-001"
- [ ] Order Status: "PAID" badge
- [ ] Order Total: "$299.99"
- [ ] Shipping Cost: "$15.00"
- [ ] Order Items table:
  - [ ] Item 1: Part name, Quantity: 2, Price: $99.99
  - [ ] Item 2: Part name, Quantity: 1, Price: $100.00
- [ ] Shipping Address displayed
- [ ] Billing Address displayed (if different)

### 2.4 Refund History Card
Test for payment "pi_test_1_success" (has 1 pending refund):
- [ ] Refund History section visible
- [ ] Shows 1 refund
- [ ] Refund ID: "re_test_pending_refund"
- [ ] Amount: "$50.00"
- [ ] Status: "PENDING" (yellow badge)
- [ ] Reason: "DUPLICATE"
- [ ] Processed By: "admin-user-id"
- [ ] Date: Displayed correctly

Test for payment "pi_test_4_refunded" (fully refunded):
- [ ] Shows 1 refund
- [ ] Amount: "$211.99"
- [ ] Status: "SUCCEEDED" (green badge)
- [ ] Reason: "CUSTOMER_REQUEST"

Test for payment "pi_test_5_partial_refund" (partially refunded):
- [ ] Shows 1 refund
- [ ] Amount: "$149.99"
- [ ] Status: "SUCCEEDED"
- [ ] Remaining amount calculated correctly

### 2.5 Failed Payment Details
Navigate to payment "pi_test_3_failed":
- [ ] Status badge: "FAILED" (red)
- [ ] Error Message section visible
- [ ] Error: "Your card was declined. Please try another payment method."
- [ ] Failed Date displayed
- [ ] Refund button NOT visible (cannot refund failed payment)

### 2.6 Pending Payment Details
Navigate to payment "pi_test_2_pending":
- [ ] Status badge: "PENDING" (yellow/orange)
- [ ] Paid Date: "Not yet paid" or similar
- [ ] Refund button NOT visible (cannot refund pending payment)

---

## 3. Refund Dialog

### 3.1 Open Refund Dialog
Navigate to successful payment "pi_test_1_success":
- [ ] "Process Refund" button visible
- [ ] Button enabled (not disabled)
- [ ] Click button opens refund dialog
- [ ] Dialog overlay visible
- [ ] Dialog centered on screen

### 3.2 Refund Dialog Layout
- [ ] Dialog title: "Process Refund"
- [ ] Payment information displayed:
  - Transaction ID
  - Original amount
  - Already refunded amount (if any)
  - Remaining refundable amount
- [ ] Refund type radio buttons:
  - [ ] "Full Refund" option
  - [ ] "Partial Refund" option
- [ ] Reason dropdown
- [ ] Notes textarea
- [ ] "Cancel" button
- [ ] "Process Refund" button

### 3.3 Full Refund Selection
- [ ] Select "Full Refund" radio button
- [ ] Amount field auto-fills with full refundable amount
- [ ] Amount field disabled (read-only)
- [ ] Refund button enabled

### 3.4 Partial Refund Selection
- [ ] Select "Partial Refund" radio button
- [ ] Amount field becomes editable
- [ ] Enter amount: 50.00
- [ ] Amount validation:
  - [ ] Cannot be 0
  - [ ] Cannot be negative
  - [ ] Cannot exceed refundable amount
  - [ ] Shows error message for invalid amounts

### 3.5 Refund Reason Selection
- [ ] Dropdown has 4 options:
  - DUPLICATE
  - FRAUDULENT
  - CUSTOMER_REQUEST
  - OTHER
- [ ] Select "CUSTOMER_REQUEST"
- [ ] Selected value displayed

### 3.6 Notes Field
- [ ] Enter notes: "Test refund for UI testing"
- [ ] Text appears in field
- [ ] Multi-line text supported

### 3.7 Submit Refund (DO NOT ACTUALLY SUBMIT IN TEST MODE)
⚠️ **WARNING:** Do not submit without valid Stripe API keys!
- [ ] "Process Refund" button becomes disabled during submission
- [ ] Loading state shown (spinner or text)
- [ ] Success message appears after processing
- [ ] Dialog closes automatically
- [ ] Page refreshes or updates to show new refund
- [ ] Payment status updates if fully refunded

### 3.8 Cancel Refund
- [ ] Click "Cancel" button
- [ ] Dialog closes without processing
- [ ] No changes made to payment

### 3.9 Close Dialog (X button)
- [ ] Click X button in top-right
- [ ] Dialog closes
- [ ] No changes made

---

## 4. Error Handling & Edge Cases

### 4.1 Invalid Payment ID
- [ ] Navigate to /admin/payments/invalid-id-123
- [ ] Shows "Payment not found" or 404 error
- [ ] No console errors
- [ ] User can navigate back

### 4.2 Network Errors
- [ ] Stop dev server briefly
- [ ] Try to load payments page
- [ ] Shows error message (not crash)
- [ ] Restart server
- [ ] Page recovers and loads data

### 4.3 Empty States
- [ ] Test search with no results
- [ ] Shows "No payments found" message
- [ ] Shows empty state illustration or message
- [ ] Allows clearing filters

### 4.4 Authorization
- [ ] Log out
- [ ] Try to access /admin/payments
- [ ] Redirected to login page
- [ ] After login, can access page

---

## 5. Responsive Design

### 5.1 Desktop (1920x1080)
- [ ] Layout looks correct
- [ ] All elements visible
- [ ] No horizontal scrolling
- [ ] Table readable

### 5.2 Laptop (1366x768)
- [ ] Layout adapts correctly
- [ ] All elements still accessible
- [ ] Table may have horizontal scroll (acceptable)

### 5.3 Tablet (768x1024)
- [ ] Layout stacks vertically if needed
- [ ] Summary cards stack in 2 columns
- [ ] Table scrollable horizontally
- [ ] Filters collapsible or stacked

### 5.4 Mobile (375x667)
- [ ] Layout fully stacked
- [ ] Summary cards in 1 column
- [ ] Table scrollable or card view
- [ ] Filters collapsible
- [ ] Dialog responsive
- [ ] All buttons accessible

---

## 6. Performance

### 6.1 Page Load Time
- [ ] Payments list loads in < 2 seconds
- [ ] Payment details loads in < 1 second
- [ ] No visible lag when filtering
- [ ] CSV export generates in < 3 seconds

### 6.2 Browser Console
- [ ] No JavaScript errors
- [ ] No 404 errors for assets
- [ ] No network errors (except expected API calls)
- [ ] No memory leaks (check with DevTools)

---

## 7. Accessibility

### 7.1 Keyboard Navigation
- [ ] Tab key moves through elements in logical order
- [ ] All buttons reachable via keyboard
- [ ] Enter key triggers button actions
- [ ] Escape key closes dialogs
- [ ] Focus visible on all interactive elements

### 7.2 Screen Reader Support
- [ ] All buttons have accessible labels
- [ ] Table headers properly marked
- [ ] Status badges announce status
- [ ] Error messages announced
- [ ] Loading states announced

### 7.3 Color Contrast
- [ ] Status badges have sufficient contrast
- [ ] Text readable on all backgrounds
- [ ] Links distinguishable from text
- [ ] Disabled buttons visually distinct

---

## Test Results Summary

**Date Tested:** [To be filled]  
**Total Tests:** 150+  
**Passed:** [ ]  
**Failed:** [ ]  
**Blocked:** [ ]  
**Not Tested:** [ ]

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Recommended Improvements
1. 
2. 
3. 

---

## Sign-Off

**Tested By:** _________________  
**Date:** _________________  
**Approved By:** _________________  
**Date:** _________________

---

**Next Steps:**
After completing manual UI testing:
1. Fix any critical bugs found
2. Proceed to Phase 4: Unit Tests
3. Proceed to Phase 5: Integration Tests
4. Complete Security Audit (Phase 6)
