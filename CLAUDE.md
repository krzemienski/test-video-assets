# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for browsing and filtering video test assets. It's designed to work with v0.app and is deployed on Vercel. The app processes CSV data containing video URLs and metadata to create a searchable asset browser.

## Development Commands

```bash
# Install dependencies (uses npm)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Run linting
npm run lint
```

## Architecture Overview

### Key Application Flow

1. **Data Loading**: The app fetches video asset data from `/api/process-assets` which processes a CSV file from Vercel blob storage
2. **State Management**: Uses React hooks for client-side state management
3. **Filtering System**: Multi-faceted filtering system using custom hooks (`useAssets`, `useAssetFilters`, `useAssetSearch`)
4. **UI Components**: Built with shadcn/ui components and Radix UI primitives

### Core Components Structure

- **`app/page.tsx`**: Main application entry point, coordinates all UI state and data flow
- **`app/api/process-assets/route.ts`**: API endpoint that fetches and processes CSV data into structured JSON
- **Components**:
  - `AssetBrowser`: Main grid/table view for displaying assets
  - `HeaderBar`: Search, view mode toggle, and filter controls
  - `FilterPanel`: Sidebar with faceted filtering options
  - `AssetDetailDrawer`: Detailed view of individual assets
  - `AppSidebar`: Navigation sidebar

### Data Processing Pipeline

The API endpoint (`/api/process-assets/route.ts`) performs:
1. CSV fetching from Vercel blob storage
2. Parsing and normalization of URLs
3. Extraction of metadata (protocols, codecs, resolutions, HDR, containers)
4. Generation of facet counts for filtering
5. Creation of stable IDs using SHA-256 hashing

### Type System

All types are centralized in `lib/types.ts`:
- `Asset`: Core data structure for video assets
- `FilterState`: Current filter selections
- `FacetCounts`: Aggregated counts for filter options
- `Protocol`, `Codec`, `Hdr`, `Container`: Enumerated types for categorization

## Environment Configuration

The app uses Supabase environment variables (configured in `vercel.json`):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Note: These are configured via Vercel's environment variable system.

## Deployment

- Automatically deployed to Vercel on push to main branch
- Build command: `npm run build`
- Output directory: `.next`
- API functions have 30-second timeout limit
- CORS headers configured for API routes

## UI Component Library

Uses shadcn/ui with the "new-york" style:
- Components are in `components/ui/`
- Configuration in `components.json`
- Tailwind CSS v4 with CSS variables
- Lucide React for icons

## Key Implementation Details

### CSV Processing
- URL validation and normalization (adds https:// if missing)
- Robust parsing with error handling for malformed rows
- Progress logging for large datasets

### Filtering System
- Multi-select faceted filtering
- Real-time search across URLs and notes
- Filter counts update dynamically based on current selection

### Performance Considerations
- Client-side filtering for responsive UI
- Batch processing in API with progress indicators
- 30-second timeout for API routes (Vercel limit)

## Common Tasks

### Adding New Asset Metadata Fields
1. Update types in `lib/types.ts`
2. Modify extraction logic in `app/api/process-assets/route.ts`
3. Update filter state in `hooks/use-asset-filters.ts`
4. Add UI controls in `components/filter-panel.tsx`

### Modifying CSV Source
Update the `csvUrl` constant in `app/api/process-assets/route.ts`

### Customizing Filter Behavior
Modify `hooks/use-asset-filters.ts` to change how filters are applied

### Adding New View Modes
1. Add new mode to `viewMode` state in `app/page.tsx`
2. Create new component for the view mode
3. Update `AssetBrowser` component to handle new mode