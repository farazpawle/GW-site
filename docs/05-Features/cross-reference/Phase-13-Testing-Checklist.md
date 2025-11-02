# Phase 13: Product Cross-Reference System - Testing Checklist

**Date Created:** January 15, 2025  
**Status:** Ready for Testing  
**Components:** 3 Admin Managers + 3 Public Display Components

---

## Testing Overview

This checklist covers all CRUD operations, validation, error handling, and UI behavior for the Phase 13 Product Cross-Reference System.

### Components to Test

**Admin Components (3):**
1. CrossReferenceManager
2. OEMNumbersManager
3. VehicleCompatibilityManager

**Public Components (3):**
1. CrossReferencesDisplay
2. OEMNumbersTable
3. VehicleCompatibilityTable

---

## Pre-Test Setup

### 1. Start Development Server
```powershell
npm run dev
```

### 2. Navigate to Product Edit Page
1. Go to `http://localhost:3000/admin/parts`
2. Click "Edit" on any product
3. You should see 4 tabs: Product Info, Cross-References, OEM Numbers, Vehicle Compatibility

### 3. Test Data Preparation
- Have at least 1 product in the database
- Note the product ID for testing
- Clear browser cache if needed

---

## Test Suite 1: CrossReferenceManager

### Test 1.1: Add Cross-Reference
- [ ] Click "Cross-References" tab
- [ ] Click "Add Cross-Reference" button
- [ ] Modal opens with title "Add Cross-Reference"
- [ ] Form fields display: Reference Type, Brand Name, Part Number, Notes (optional)
- [ ] Select "alternative" from Reference Type dropdown
- [ ] Enter "Bosch" in Brand Name
- [ ] Enter "0123456789" in Part Number
- [ ] Enter "Compatible replacement" in Notes
- [ ] Click "Add" button
- [ ] Success message appears: "Cross-reference added successfully"
- [ ] Message auto-hides after 3 seconds
- [ ] New entry appears in table with blue "Alternative" badge
- [ ] Modal closes automatically

### Test 1.2: Validation - Required Fields
- [ ] Click "Add Cross-Reference"
- [ ] Leave all fields empty
- [ ] Click "Add"
- [ ] Validation errors appear in red below each required field
- [ ] "Reference type is required"
- [ ] "Brand name is required"
- [ ] "Part number is required"

### Test 1.3: Edit Cross-Reference
- [ ] Click "Edit" button on an existing entry
- [ ] Modal opens with title "Edit Cross-Reference"
- [ ] Form pre-filled with existing data
- [ ] Change Reference Type to "supersedes"
- [ ] Change Brand Name to "Bosch Premium"
- [ ] Click "Save" button
- [ ] Success message: "Cross-reference updated successfully"
- [ ] Table updates with green "Supersedes" badge
- [ ] Brand name shows "Bosch Premium"

### Test 1.4: Delete Cross-Reference
- [ ] Click "Delete" button (trash icon) on an entry
- [ ] Confirmation modal appears: "Delete Cross-Reference"
- [ ] Message: "Are you sure you want to delete this cross-reference?"
- [ ] Click "Cancel" - modal closes, entry still exists
- [ ] Click "Delete" again, then click "Confirm"
- [ ] Success message: "Cross-reference deleted successfully"
- [ ] Entry removed from table
- [ ] Table updates immediately

### Test 1.5: Reference Type Badge Colors
- [ ] Add entry with "alternative" - badge is **blue**
- [ ] Add entry with "supersedes" - badge is **green**
- [ ] Add entry with "compatible" - badge is **purple**
- [ ] All badges have proper contrast and readability

### Test 1.6: Modal Interactions
- [ ] Open "Add Cross-Reference" modal
- [ ] Press **Escape** key - modal closes
- [ ] Open modal again
- [ ] Click backdrop (outside modal) - modal closes
- [ ] Open modal, start entering data, press Escape - modal closes, data not saved

### Test 1.7: Empty State
- [ ] Delete all cross-references
- [ ] Table shows empty state message
- [ ] "Add Cross-Reference" button still visible and functional

---

## Test Suite 2: OEMNumbersManager

### Test 2.1: Add OEM Number
- [ ] Click "OEM Numbers" tab
- [ ] Click "Add OEM Number" button
- [ ] Modal opens with title "Add OEM Number"
- [ ] Form fields: Manufacturer, OEM Part Number, Notes (optional)
- [ ] Enter "Toyota" in Manufacturer
- [ ] Enter "90919-02260" in OEM Part Number
- [ ] Enter "Original equipment part" in Notes
- [ ] Click "Add"
- [ ] Success message: "OEM number added successfully"
- [ ] Entry appears in table with tag icon (🏷️)
- [ ] OEM number styled as badge with monospace font

### Test 2.2: Alphabetical Sorting
- [ ] Add multiple OEM numbers with different manufacturers:
  - "Bosch" - 0123456
  - "Denso" - 7890123
  - "ACDelco" - 4567890
- [ ] Table automatically sorts alphabetically by manufacturer
- [ ] Order should be: ACDelco → Bosch → Denso → Toyota

### Test 2.3: Unique Constraint Validation
- [ ] Add OEM number: Manufacturer "Toyota", OEM Number "90919-02260"
- [ ] Try to add another with same manufacturer and OEM number
- [ ] Error message appears: "This manufacturer and OEM part number combination already exists..."
- [ ] Entry not added to table
- [ ] Can add same OEM number with different manufacturer (should work)
- [ ] Can add different OEM number with same manufacturer (should work)

### Test 2.4: Edit OEM Number
- [ ] Click "Edit" on an entry
- [ ] Modal opens with pre-filled data
- [ ] Change Manufacturer to "Toyota USA"
- [ ] Change OEM Number to "90919-02260-A"
- [ ] Click "Save"
- [ ] Success message appears
- [ ] Table updates with new values
- [ ] Sorting updates if manufacturer changed

### Test 2.5: Delete OEM Number
- [ ] Click "Delete" (trash icon)
- [ ] Confirmation modal: "Delete OEM Number"
- [ ] Click "Confirm"
- [ ] Success message: "OEM number deleted successfully"
- [ ] Entry removed from table

### Test 2.6: Badge Styling
- [ ] Verify OEM Part Number displayed as badge
- [ ] Badge has dark background, border, padding
- [ ] Font is monospace (code-like)
- [ ] Badge is readable and contrasts well

---

## Test Suite 3: VehicleCompatibilityManager

### Test 3.1: Add Vehicle Compatibility
- [ ] Click "Vehicle Compatibility" tab
- [ ] Click "Add Vehicle Compatibility" button
- [ ] Modal opens (large size due to many fields)
- [ ] Form fields: Make, Model, Year Start, Year End, Engine, Trim, Position, Notes
- [ ] Enter "Toyota" in Make
- [ ] Enter "Camry" in Model
- [ ] Enter 2015 in Year Start
- [ ] Enter 2020 in Year End
- [ ] Enter "2.5L 4-Cylinder" in Engine (optional)
- [ ] Enter "LE" in Trim (optional)
- [ ] Enter "Front Left" in Position (optional)
- [ ] Enter "Compatible with hybrid models" in Notes
- [ ] Click "Add"
- [ ] Success message: "Vehicle compatibility added successfully"
- [ ] Entry appears in table with car icon (🚗)

### Test 3.2: Year Range Validation
- [ ] Click "Add Vehicle Compatibility"
- [ ] Enter Make "Honda", Model "Accord"
- [ ] Enter Year Start: 2020
- [ ] Enter Year End: 2015 (earlier than start)
- [ ] Click "Add"
- [ ] Validation error appears: "End year must be greater than or equal to start year"
- [ ] Change Year End to 2020
- [ ] Click "Add" - should succeed

### Test 3.3: Real-Time Filtering - By Make
- [ ] Add multiple vehicles with different makes:
  - Toyota Camry 2015-2020
  - Honda Accord 2018-2022
  - Ford F-150 2019-2023
  - Toyota Corolla 2016-2021
- [ ] In "Filter by Make" search input, type "Toyota"
- [ ] Table instantly filters to show only Toyota vehicles (2 entries)
- [ ] Count displays "Showing 2 of 4 vehicles"

### Test 3.4: Real-Time Filtering - By Model
- [ ] Clear Make filter
- [ ] In "Filter by Model" search input, type "Camry"
- [ ] Table shows only vehicles with "Camry" in model
- [ ] Count updates correctly

### Test 3.5: Combined Filtering
- [ ] Filter by Make: "Toyota"
- [ ] Filter by Model: "Camry"
- [ ] Only Toyota Camry entries display
- [ ] Count: "Showing 1 of 4 vehicles"

### Test 3.6: Filter Reset
- [ ] Apply filters (Make and Model)
- [ ] Click "Reset Filters" button
- [ ] Both filter inputs clear
- [ ] All vehicles display again
- [ ] Count shows total: "Showing 4 of 4 vehicles"

### Test 3.7: Edit Vehicle Compatibility
- [ ] Click "Edit" on an entry
- [ ] Modal opens with all fields pre-filled
- [ ] Change Year End from 2020 to 2022
- [ ] Add Engine: "2.5L Hybrid"
- [ ] Click "Save"
- [ ] Success message appears
- [ ] Table updates with new year range and engine

### Test 3.8: Delete Vehicle Compatibility
- [ ] Click "Delete" (trash icon)
- [ ] Confirmation modal: "Delete Vehicle Compatibility"
- [ ] Message: "Are you sure you want to delete this vehicle compatibility entry?"
- [ ] Click "Confirm"
- [ ] Success message: "Vehicle compatibility deleted successfully"
- [ ] Entry removed from table
- [ ] Filter counts update if filters active

### Test 3.9: Empty State with Filters
- [ ] Apply a filter that returns no results (e.g., Make: "Lamborghini")
- [ ] Message displays: "No vehicles match your filter criteria."
- [ ] "Reset Filters" button visible
- [ ] Click button - all data displays again

---

## Test Suite 4: Tab Integration

### Test 4.1: Tab Switching
- [ ] Click "Product Info" tab - ProductForm displays
- [ ] Click "Cross-References" tab - CrossReferenceManager displays
- [ ] Click "OEM Numbers" tab - OEMNumbersManager displays
- [ ] Click "Vehicle Compatibility" tab - VehicleCompatibilityManager displays
- [ ] Active tab has maroon background and border-b-2
- [ ] Inactive tabs have transparent background

### Test 4.2: Tab State Persistence
- [ ] Add data in "Cross-References" tab
- [ ] Switch to "OEM Numbers" tab
- [ ] Switch back to "Cross-References" tab
- [ ] Data still displays (state persists)
- [ ] No re-fetching or flickering

### Test 4.3: Mobile Responsive Tabs
- [ ] Resize browser to mobile width (< 640px)
- [ ] Tabs should scroll horizontally (overflow-x-auto)
- [ ] All 4 tabs remain accessible via horizontal scroll
- [ ] Tab icons and labels visible

### Test 4.4: productId Passing
- [ ] Verify all 3 managers receive correct productId prop
- [ ] API calls should use correct product ID in URL
- [ ] Check Network tab: `/api/admin/parts/[id]/cross-references`
- [ ] Confirm [id] matches current product ID

---

## Test Suite 5: Public Display Components

### Test 5.1: CrossReferencesDisplay
- [ ] Navigate to a product detail page with cross-references
- [ ] Component displays with heading "Cross-References"
- [ ] References grouped by type: Alternative, Supersedes, Compatible
- [ ] Each group has colored card (blue/green/purple)
- [ ] Each reference shows: Brand, Part Number, Notes
- [ ] If `referencedPart` exists, "View Part →" link displays
- [ ] Click link - navigates to referenced product page
- [ ] Footer shows count: "X reference(s) in this category"
- [ ] Empty state: If no references, shows 🔗 icon and message

### Test 5.2: OEMNumbersTable
- [ ] Navigate to product detail page with OEM numbers
- [ ] Component displays with heading "OEM Numbers"
- [ ] Table shows: Manufacturer (with 🏷️ icon), OEM Part Number (badge), Notes
- [ ] OEM numbers sorted alphabetically by manufacturer
- [ ] Badge styling: monospace font, dark background
- [ ] Footer shows count: "X OEM number(s) listed"
- [ ] On mobile: Horizontal scroll works (overflow-x-auto)
- [ ] Empty state: If no OEM numbers, shows tag icon and message

### Test 5.3: VehicleCompatibilityTable
- [ ] Navigate to product detail page with vehicle compatibility
- [ ] Component displays with heading "Vehicle Compatibility"
- [ ] Filter section displays with 2 dropdowns: Make, Model
- [ ] Table shows: Make (with 🚗 icon), Model, Year Range (badge), Engine, Trim, Position
- [ ] Make filter: Dropdown populated with unique makes from data
- [ ] Select Make - Model dropdown enables with models for selected make
- [ ] Table filters instantly (client-side)
- [ ] Results count updates: "Showing X of Y vehicles"
- [ ] Reset button clears filters
- [ ] **Pagination (if 10+ vehicles):**
  - [ ] Pagination controls display at bottom
  - [ ] Shows "Page X of Y"
  - [ ] "Previous" button disabled on first page
  - [ ] "Next" button disabled on last page
  - [ ] Click "Next" - page increments, table updates
  - [ ] Click "Previous" - page decrements, table updates
- [ ] On mobile: Horizontal scroll works
- [ ] Empty state: No vehicles, shows car icon and message
- [ ] Filtered empty: "No vehicles match" message with reset button

---

## Test Suite 6: API Error Handling

### Test 6.1: Network Error Simulation
- [ ] Open DevTools → Network tab
- [ ] Throttle to "Offline"
- [ ] Try to add a cross-reference
- [ ] Error message displays (API error handling)
- [ ] Modal remains open, data not cleared
- [ ] Restore network, try again - should succeed

### Test 6.2: Server Error (500)
- [ ] Mock server error (if possible via proxy)
- [ ] Try CRUD operation
- [ ] Error message displays
- [ ] User can retry operation

### Test 6.3: Validation Error from API
- [ ] Send invalid data (if backend validates)
- [ ] Error message displays with specific field errors
- [ ] Form remains open for correction

---

## Test Suite 7: Optimistic Updates

### Test 7.1: Add Operation
- [ ] Add new entry in any manager
- [ ] Entry appears in table **immediately** (before API completes)
- [ ] Success message displays
- [ ] If API fails, entry should be removed (rollback)

### Test 7.2: Edit Operation
- [ ] Edit an entry
- [ ] Table updates **immediately** with new values
- [ ] Success message displays
- [ ] If API fails, previous values should restore

### Test 7.3: Delete Operation
- [ ] Delete an entry
- [ ] Entry removes from table **immediately**
- [ ] Success message displays
- [ ] If API fails, entry should reappear

---

## Test Suite 8: Responsive Design

### Test 8.1: Desktop View (1920x1080)
- [ ] All 4 tabs fit in single row
- [ ] Tables display all columns without scroll
- [ ] Modals center properly
- [ ] No layout issues

### Test 8.2: Tablet View (768px width)
- [ ] Tabs may wrap or scroll
- [ ] Tables have horizontal scroll
- [ ] Modals adjust width
- [ ] Touch interactions work

### Test 8.3: Mobile View (375px width)
- [ ] Tabs scroll horizontally
- [ ] Tables have horizontal scroll with all columns accessible
- [ ] Modals take full width with padding
- [ ] Touch targets (buttons) are large enough
- [ ] Filters stack vertically if needed

---

## Test Suite 9: Performance

### Test 9.1: Large Dataset (100+ entries)
- [ ] Add 100+ cross-references (or use seed script)
- [ ] Table renders without lag
- [ ] Filtering remains responsive
- [ ] No browser freezing

### Test 9.2: Rapid Actions
- [ ] Rapidly switch between tabs (10 times fast)
- [ ] No errors, all tabs render correctly
- [ ] Try rapid add/edit/delete operations
- [ ] UI remains stable

---

## Test Suite 10: Accessibility

### Test 10.1: Keyboard Navigation
- [ ] Tab through form fields - focus moves correctly
- [ ] Press Escape in modal - closes modal
- [ ] Use arrow keys in dropdowns - works
- [ ] Enter key submits forms

### Test 10.2: Screen Reader (Optional)
- [ ] Use screen reader to navigate
- [ ] Labels read correctly
- [ ] Buttons have proper labels
- [ ] Success/error messages announced

---

## Test Completion Summary

### Results Template

**Tester:**  
**Date:**  
**Browser:** Chrome / Firefox / Safari  
**OS:** Windows / macOS / Linux

| Test Suite | Pass | Fail | Notes |
|------------|------|------|-------|
| 1. CrossReferenceManager | ☐ | ☐ | |
| 2. OEMNumbersManager | ☐ | ☐ | |
| 3. VehicleCompatibilityManager | ☐ | ☐ | |
| 4. Tab Integration | ☐ | ☐ | |
| 5. Public Display Components | ☐ | ☐ | |
| 6. API Error Handling | ☐ | ☐ | |
| 7. Optimistic Updates | ☐ | ☐ | |
| 8. Responsive Design | ☐ | ☐ | |
| 9. Performance | ☐ | ☐ | |
| 10. Accessibility | ☐ | ☐ | |

### Issues Found

*(List any bugs, issues, or improvements)*

1. 
2. 
3. 

### Overall Status
- [ ] **All Tests Passed** - Ready for production
- [ ] **Minor Issues** - Can be deployed with known issues documented
- [ ] **Major Issues** - Requires fixes before deployment

---

## Next Steps

After testing:
1. Document all issues found in this file
2. Create GitHub issues for bugs (if using issue tracker)
3. Fix critical bugs before Phase 13 completion
4. Update Phase-13-COMPLETE.md with test results
5. Mark Task 9 as complete in CoT workflow
