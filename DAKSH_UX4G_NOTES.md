# DAKSH UX4G Implementation Notes

This document outlines the UX4G (Government of India UX Guidelines 4.0) design system implementation for DAKSH (Smart Parcel Tracking & Predictive Delivery Platform).

## Overview

UX4G compliance has been applied to the DAKSH Admin Analytics Dashboard and core components while preserving all backend endpoints, analytics code, and dashboard logic. Only UI/UX, CSS, component styling, and accessibility have been updated.

## Design Tokens

**Location**: `src/styles/design-tokens.css`

### Typography
- **Base Font**: Noto Sans with system fallbacks
- **Display Font**: Noto Sans Display
- **Typescale**: Mapped to rems (xs: 0.75rem, sm: 0.875rem, base: 1rem, lg: 1.125rem, xl: 1.25rem, 2xl: 1.5rem, 3xl: 1.875rem, 4xl: 2.25rem)

### Colors
- **Primary**: #E74C3C (India Post Red)
- **Secondary**: #2C3E50 (Dark blue-grey)
- **Semantic Colors**:
  - Success: #138808 (India Green)
  - Warning: #FF9933 (Saffron)
  - Danger: #DC2626 (Error red)
  - Info: #2563EB (Informational blue)
- **Neutrals**: Full scale from #F9FAFB to #111827

### Spacing
- Base unit: 0.25rem (4px)
- Scale: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24

### Shadows & Elevation
- Card shadows: `--ux4g-shadow-card`, `--ux4g-shadow-card-elevated`
- Panel shadows: `--ux4g-shadow-panel`, `--ux4g-shadow-panel-elevated`
- Standard elevations: sm, md, lg, xl

## Components Changed

### Helper Components
**Location**: `components/ux4g/`

1. **AccessibilityBar** (`AccessibilityBar.tsx`)
   - Font size control (small, normal, large, xlarge)
   - High contrast mode toggle
   - Stores preferences in localStorage
   - Fixed position bottom-right widget

2. **KpiCard** (`KpiCard.tsx`)
   - UX4G-compliant KPI display
   - Risk indicator support (red border-left)
   - Accessible labels and ARIA attributes

3. **Panel** (`Panel.tsx`)
   - Container component with optional header
   - Elevated variant support
   - Semantic HTML and ARIA labels

4. **Tooltip** (inline component in `RouteReliabilityExplorer.tsx`)
   - UX4G-compliant tooltip pattern
   - Used for high variance indicators in route reliability table
   - Keyboard accessible (focus-within support)
   - Uses UX4G tooltip CSS classes from `ux4g-dashboard.css`

### Updated Components

1. **CoreNavbar** (`components/core/CoreNavbar.tsx`)
   - UX4G layout: Logo left | Breadcrumb center | Nav right
   - Noto Sans Display for app title
   - Improved keyboard navigation
   - ARIA labels and roles

2. **NationalLogisticsKPIs** (`components/NationalLogisticsKPIs.tsx`)
   - Uses new `KpiCard` component
   - UX4G typography tokens
   - Accessible labels

3. **Charts** (`components/Charts.tsx`)
   - **CongestedHubsChart**: 
     - Red→orange gradient bars using UX4G tokens
     - Screen reader descriptions
     - Accessible legend with patterns
     - ARIA labels on chart elements
   - **ModeComparisonChart**:
     - Doughnut chart with legend
     - Efficiency Gap explanation panel
     - Screen reader support
     - Color-blind safe palette

4. **RouteReliabilityExplorer** (`components/RouteReliabilityExplorer.tsx`)
   - UX4G form fields (Origin, Destination, Mode, Nature)
   - Keyboard accessible (Enter to search)
   - Professional data table with:
     - **Sortable headers** with keyboard navigation (Enter/Space to sort)
       - Sort indicators (ArrowUp, ArrowDown, ArrowUpDown icons)
       - Cycle through: ascending → descending → no sort
       - All columns sortable: Route, Avg Transit Days, Reliability Std Dev, Mode, Nature
       - ARIA sort attributes for screen readers
       - Focus indicators using UX4G primary color
     - Row highlight on hover/focus
     - **High variance tooltip**: UX4G-compliant tooltip component showing detailed explanation when reliability_std > 1.5
       - Tooltip appears on hover/focus over AlertTriangle icon
       - Accessible via keyboard navigation
     - Red danger text (using UX4G danger token #DC2626) for avg_days > 4.0
   - Full ARIA labels and semantic HTML
     - UX4G table classes applied for consistent styling

5. **DigipinIntelligence** (`components/DigipinIntelligence.tsx`)
   - Uses `Panel` component
   - Accessible 4m × 4m grid visualization (SVG)
   - Semantic HTML with figure/figcaption
   - Descriptive text using UX4G body style

6. **Admin Page** (`app/(core)/admin/page.tsx`)
   - UX4G container (max-width: 1536px)
   - Integrated AccessibilityBar widget
   - Semantic sections with aria-labels
   - Skeleton loading states
   - Error states with Panel component

## Dashboard CSS

**Location**: `src/styles/ux4g-dashboard.css`

Provides dashboard-specific patterns:
- Typography classes (ux4g-body, ux4g-label, ux4g-heading)
- KPI card styles
- Panel styles
- Chart container styles
- Table styles with sortable headers
- Form controls
- Layout utilities (grid, container, sidebar layout)
- Skeleton loading animations
- Tooltip patterns

## Integration

UX4G styles are imported in `app/(core)/layout.tsx`:
```typescript
import "../../src/styles/design-tokens.css";
import "../../src/styles/ux4g-dashboard.css";
```

## Accessibility Features

1. **Keyboard Navigation**
   - All interactive elements are keyboard accessible
   - Focus indicators using UX4G focus ring tokens
   - Tab order optimized

2. **Screen Readers**
   - ARIA labels on all charts and complex components
   - Screen reader descriptions for visualizations
   - Semantic HTML (header, nav, main, section)
   - Hidden descriptions for charts

3. **Color Blind Safety**
   - Patterns + labels, not color alone
   - Legend with text labels
   - High contrast mode support

4. **Accessibility Widget**
   - Font size adjustment (small, normal, large, xlarge)
   - High contrast mode toggle
   - Preferences persisted in localStorage

## Preserved Functionality

**No changes made to:**
- Backend API endpoints (`/api/v1/summary`, `/api/v1/hubs/top`, `/api/v1/mode-comparison`, `/api/v1/routes/search`)
- Analytics data fetching logic
- ML/analytics calculations
- Database schema
- State management
- Data flow and props

## Backend Endpoints (Unchanged)

All analytics endpoints remain exactly as before:
- `fetchSummaryMetrics()` → `/api/v1/summary`
- `fetchTopCongestedHubs(limit)` → `/api/v1/hubs/top?limit={limit}`
- `fetchModeComparison()` → `/api/v1/mode-comparison`
- `searchRoutes(params)` → `/api/v1/routes/search?{params}`

## Recent Enhancements

### RouteReliabilityExplorer Table Sorting (Latest Update)
- **Sortable Headers**: All table columns now support sorting with three-state cycle (asc → desc → none)
- **Keyboard Navigation**: Headers are fully keyboard accessible (Enter/Space to sort)
- **Visual Indicators**: Arrow icons (ArrowUp, ArrowDown, ArrowUpDown) indicate sort state
- **ARIA Support**: `aria-sort` attributes provide screen reader feedback
- **UX4G Styling**: Headers use UX4G table sortable styles with hover and focus states

### Enhanced Tooltips
- **High Variance Tooltips**: Detailed explanations appear on hover/focus over high variance indicators
- **Accessibility**: Tooltips support keyboard navigation and screen readers
- **UX4G Pattern**: Uses UX4G tooltip CSS classes for consistent styling

## Testing Checklist

- [x] All KPI cards display correctly
- [x] Charts render with UX4G styling
- [x] Accessibility widget functions (font size, contrast)
- [x] Keyboard navigation works on all forms and tables
- [x] **Table sorting works with mouse and keyboard**
- [x] **Tooltips appear on hover and focus for high variance indicators**
- [x] Screen reader descriptions present
- [x] High contrast mode applies correctly
- [x] Loading states display
- [x] Error states display
- [x] Admin navbar layout (logo left, breadcrumb center, nav right)
- [x] Sort indicators display correctly in all states

## Notes

- Noto Sans font should be loaded via Google Fonts or included in the project
- UX4G CDN integration can be added per handbook section 3.4 if needed
- All existing functionality preserved; only visual presentation updated
- Backend endpoints remain unchanged as per requirements
