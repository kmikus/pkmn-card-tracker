# Changelog

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
