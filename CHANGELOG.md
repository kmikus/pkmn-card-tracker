# Changelog

## [v0.9.0] - Database restructuring and localStorage optimization
### Added
- Complete database restructuring with new `cards` and `user_collection` tables
- 19,500+ Pokemon cards populated from Pokemon TCG API
- Optimized localStorage for guest users (67% data size reduction)
- Fixed logout functionality with proper state management
- Enhanced tag system that works with any card (owned or not)

### Changed
- Migrated from single `collection` table to normalized database structure
- Updated all backend services to use new database schema
- Improved guest user experience with minimal localStorage data
- Enhanced authentication flow with proper logout handling
- Updated frontend to work with new data structure

### Technical
- Added Prisma migrations for database restructuring
- Implemented TCG API population script with retry logic
- Updated CollectionService and TagService for new schema
- Fixed TypeScript build issues for production deployment
- Added comprehensive deployment checklist and rollback procedures

---

## [v0.8.0] - Pre-migration stable version
### Added
- Stable checkpoint before database restructuring
- Backup and rollback procedures for production deployment
- Database migration scripts and utilities

### Technical
- Tagged stable version for rollback purposes
- Prepared for major database schema changes

---

## [v0.7.0] - Set browsing functionality and UI improvements
### Added
- Complete set browsing functionality with dedicated SetsPage component
- SetCardsPage component for viewing cards from specific sets
- useSetsCache hook for fetching and caching Pokémon card sets data
- CardSet interface and related TypeScript types
- /sets route with proper navigation and state management
- Set search functionality by name, series, and PTCGO code
- Set logos, symbols, release dates, and card counts display
- Home button on SetsPage for consistent navigation

### Changed
- Improved HomePage navigation layout for better mobile/desktop responsiveness
  - Buttons side by side on mobile (50% width each)
  - All elements on same line on desktop with proper centering
  - Search bar on separate line on mobile, inline on desktop
- Centered all page headings consistently across the app
- Added subtle gradient text glow effects in dark mode for all headings
- Enhanced visual consistency and user experience throughout the app

### Technical
- Added proper routing for set browsing functionality
- Implemented image caching for set logos and symbols
- Maintained consistent styling patterns across all new components

---

## [v0.6.0] - Backend TypeScript migration and frontend type safety
### Added
- Complete TypeScript migration for backend codebase
- TypeScript configuration for backend with proper type definitions
- Enhanced type safety across all backend endpoints
- Proper TypeScript types for database operations and API responses

### Changed
- Migrated all backend JavaScript files to TypeScript (.js → .ts)
- Updated package.json scripts for TypeScript compilation
- Enhanced error handling with proper TypeScript types
- Improved development experience with better type checking

### Technical
- Added @types/node, @types/express, @types/cors, @types/pg for backend
- Configured tsconfig.json for backend TypeScript compilation
- Updated build process to compile TypeScript before deployment

---

## [v0.5.0] - Pokémon species API integration and simplified data handling
### Added
- Integration with /pokemon-species API endpoint for accurate Pokémon data
- Simplified image and card fetching logic
- Improved data consistency across the application

### Changed
- Removed complex form/hyphen logic for Pokémon names
- Updated Pokémon list to use species data as source of truth
- Simplified image URL generation and card search functionality
- Enhanced data accuracy and reduced edge cases

### Technical
- Streamlined API calls for better performance
- Improved data handling and consistency
- Reduced complexity in Pokémon name processing

---

## [v0.4.0] - Persistent data storage with PostgreSQL migration
### Added
- PostgreSQL database integration for authenticated users
- Hybrid storage system: localStorage for guests, PostgreSQL for authenticated users
- Async storage functions with proper error handling and loading states
- Comprehensive deployment guide for PostgreSQL setup
- Database connection test script
- Loading indicators and error messages for better UX
- Automatic error clearing after 5 seconds

### Changed
- Migrated from SQLite to PostgreSQL for production-ready persistent storage
- Updated all storage operations to be async with proper error handling
- Enhanced UI with loading states during card operations
- Improved error handling throughout the application
- Updated backend to use PostgreSQL connection pooling

### Technical
- Replaced sqlite3 with pg (PostgreSQL client)
- Added proper TypeScript types for better type safety
- Implemented connection pooling for better database performance
- Added SSL configuration for production deployments

---

## [v0.3.0] - Major UI/UX improvements and responsive design overhaul
### Added
- Pokéball logo in AuthBar with gradient styling and home navigation
- Responsive navigation design for HomePage (stacked on mobile)
- Sticky floating headers for PokemonCardsPage and CollectionPage
- Plus/minus icon toggle for add/remove collection functionality
- localStorage persistence for guest notification dismissal
- Smooth transitions and hover effects throughout the app
- Colored shadow effects for better visual integration

### Changed
- Updated card grids to show 2 cards per row on small screens
- Improved button alignment and consistent styling across all pages
- Standardized gradient text styling and responsive typography
- Enhanced responsive design for all screen sizes
- Unified header layouts across CollectionPage and PokemonCardsPage

---

## [v0.2.0] - Tailwind CSS redesign with search functionality and improved UI
### Added
- Complete redesign using Tailwind CSS for modern, responsive UI
- Split App.jsx into separate components for better structure
- Real-time search filter for Pokémon tiles
- Consistent tile sizing and spacing
- Custom favicon (Pokémon card back) and updated page title
- Fast loading of all 1008 Pokémon

### Changed
- Refactored from JavaScript to TypeScript for type safety
- Improved layout and spacing for all pages
- Removed unnecessary features for performance

---

## [v0.1.0] - Stable JWT authentication with basic UI
### Added
- Initial project setup with React and Express backend
- JWT authentication and secure cookie/session handling
- Basic UI for Pokémon card tracking
- Backend and frontend environment variable support
- Deployed to Render with proper proxy/cookie configuration
