# Search Functionality Plan

## Overview
This document outlines the plan for implementing a robust search functionality in the Garrit Wulf site. The goal is to replace the static search icon in the header with a fully functional, user-friendly search experience that allows users to quickly find relevant content across the site.

---

## Table of Contents
1. Objectives
2. Feature Requirements
3. Technical Stack & Dependencies
4. UI/UX Design
5. Component Structure
6. Search Logic & Data Flow
7. Accessibility & Responsiveness
8. Future Enhancements
9. Implementation Phases
10. Testing & Validation

---

## 1. Objectives
- Replace the static search icon in the header with a real, interactive search feature.
- Provide a modal or overlay for search input and results.
- Support client-side search (Phase 1), with a path to server-side or full-text search (Phase 2+).
- Ensure fast, accurate, and user-friendly search experience.

## 2. Feature Requirements
- Search icon in header opens a modal/overlay.
- Modal contains a search input and displays live results as the user types.
- Results highlight matching terms and are grouped by content type (e.g., pages, categories, parts).
- Keyboard navigation (Tab, Arrow keys, Enter, Esc to close).
- Responsive design for mobile and desktop.
- Accessible (ARIA roles, focus management).
- Smooth open/close animations.
- No page reloads; search is instant.

## 3. Technical Stack & Dependencies
- **Framework:** Next.js (App Router, React 18+)
- **Styling:** Tailwind CSS (with custom color palette)
- **State Management:** React useState/useEffect, Context API (if needed)
- **Icons:** Heroicons (for search/close icons)
- **Modal/Overlay:** Custom React component or Headless UI Dialog
- **Search Logic:**
  - **Phase 1:** Client-side search (filtering in-memory data)
  - **Phase 2:** Optional server-side search (API route, Prisma, database)
- **Accessibility:** ARIA attributes, focus trap
- **Testing:** Jest, React Testing Library (optional)

## 4. UI/UX Design
- Search icon in header (right-aligned)
- Modal overlay with semi-transparent background
- Centered search input with clear button
- Results list with highlighted matches
- Close button (X) in top-right
- Smooth fade/slide animations
- Mobile: Full-screen modal, large touch targets

## 5. Component Structure
- `Header.tsx` — Triggers search modal
- `SearchModal.tsx` (new) — Modal overlay, input, results
- `SearchResultItem.tsx` (new) — Renders individual result
- `searchData.ts` (new) — Exports searchable data (Phase 1)
- (Optional) `SearchContext.tsx` — For global search state

## 6. Search Logic & Data Flow
- On icon click, open `SearchModal`.
- User types in input; debounce input for performance.
- Filter/search through `searchData` (array of objects with title, description, type, url).
- Display matching results, highlight query terms.
- On result click, navigate to the selected page.
- Esc or click outside closes modal.

## 7. Accessibility & Responsiveness
- Modal uses ARIA roles (`role="dialog"`, `aria-modal="true"`).
- Focus is trapped within modal when open.
- Keyboard navigation: Tab, Arrow keys, Enter, Esc.
- Responsive layout for all screen sizes.

## 8. Future Enhancements
- Server-side search with API route and Prisma (for large datasets).
- Full-text search (e.g., using PostgreSQL FTS or ElasticSearch).
- Search suggestions/autocomplete.
- Recent searches and search history.
- Analytics on search usage.

## 9. Implementation Phases
### Phase 1: Client-Side Search
- Build modal, input, and results UI.
- Use static data for search (from `searchData.ts`).
- Implement filtering and highlighting.
- Ensure accessibility and responsiveness.

### Phase 2: Server-Side Search (Optional)
- Create API route for search queries.
- Use Prisma to query database.
- Support pagination, advanced filtering.
- Secure API and handle errors.

### Phase 3: Advanced Features
- Add suggestions, history, analytics, etc.

## 10. Testing & Validation
- Manual testing on all major browsers/devices.
- Accessibility audit (keyboard, screen reader).
- (Optional) Automated tests for search logic and UI.

---

## References
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Headless UI Dialog](https://headlessui.com/react/dialog)
- [Heroicons](https://heroicons.com/)

---

**Author:** GitHub Copilot
**Date:** October 4, 2025
